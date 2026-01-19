const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const compression = require("compression");
const fs = require("fs");

// Global cache for match data
global.cachedMatchData = [];
const adminRoutes = require("./routes/admin.routes");
const matchRoutes = require("./routes/match.routes");
const memberRoutes = require("./routes/member.routes");
const path = require("path");
const TelemetryService = require("./services/telemetry.service");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const { Admin } = require("./models/admin.model");
const Logger = require("./utils/logger");
const { RedisCache } = require("./utils/redis");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Compression middleware - compress all responses
app.use(compression());

app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? ["https://topxhk.ai", "https://www.topxhk.ai"]
    : true,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser()); // Add cookie parsing middleware

const uri = process.env.ATLAS_URI ||
  "mongodb://root:example@localhost:27017/betting-china?authSource=admin";
Logger.info("Connecting to MongoDB database...", uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")); // Hide password in logs

// MongoDB connection options with connection pooling
const mongooseOptions = {
  serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 2, // Maintain at least 2 socket connections
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
};

mongoose.connect(uri, mongooseOptions);
const connection = mongoose.connection;

// Handle connection errors
connection.on("error", (err) => {
  Logger.error("MongoDB connection error:", err.message);
  Logger.error("Full error:", err);
});

connection.on("disconnected", () => {
  Logger.warn("MongoDB disconnected. Attempting to reconnect...");
});

connection.once("open", async () => {
  Logger.info("MongoDB database connection established successfully");

  try {
    // Create TTL index for cache expiration
    await mongoose.connection.db.collection("matches").createIndex(
      { "cachedData.expiresAt": 1 },
      { expireAfterSeconds: 0 },
    );

    // Check if an admin user exists, and create one if not
    const existingAdmin = await Admin.findOne({ username: "Admin02" });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("60160849", 10);
      const newAdmin = new Admin({
        username: "Admin02",
        password: hashedPassword,
        role: "main",
      });
      await newAdmin.save();
      await TelemetryService.log("info", "Default admin user created.");
      Logger.info("Default admin user created with username: Admin02");
    } else {
      Logger.info("Default admin user already exists.");
    }
    
    // Trigger initial cache update if fetcher is enabled
    if (process.env.FETCHER) {
      // Run initial cache update immediately after MongoDB is ready
      // Use setImmediate to ensure it runs after the current execution context
      setImmediate(async () => {
        Logger.info("Running initial cache update after MongoDB connection...");
        try {
          const MatchService = require("./services/match.service");
          const { Cache } = require("./models/cache.model");
          const { updateHKMatches } = require("./getAPIFixtureId");
          
          const data = await MatchService.getMatchData();
          Logger.info(`Initial fetch: ${data.length} matches`);
          if (data.length > 0) {
            // Try Redis first, fallback to MongoDB
            const cacheKey = "matchData";
            const redisSet = await RedisCache.set(cacheKey, data, 300); // 5 minutes TTL
            
            if (!redisSet) {
              // Fallback to MongoDB cache
              await Cache.findOneAndUpdate(
                { key: cacheKey },
                { data, updatedAt: new Date() },
                { upsert: true, new: true },
              );
            }
            Logger.info("Initial cache populated with", data.length, "matches");
          } else {
            Logger.warn("Initial cache update: No matches found");
          }
          await updateHKMatches();
          Logger.info("Initial cache update completed");
        } catch (err) {
          Logger.error("Error during initial cache update:", err);
          Logger.error("Error stack:", err.stack);
        }
      });
    }
  } catch (err) {
    Logger.error("Error during database initialization:", err);
  }
});

// Apply session middleware before other routes
app.use("/admin", adminRoutes);
app.use("/match", matchRoutes);
app.use("/member", memberRoutes);
app.use("/match-record", require("./routes/matchRecord.routes"));
app.use("/social", require("./routes/social.routes"));

// Debug: Log all incoming requests to API routes (only in development)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    if (req.path.startsWith("/admin") || 
        req.path.startsWith("/match") || 
        req.path.startsWith("/member")) {
      Logger.debug(`[API Request] ${req.method} ${req.path}`);
    }
  }
  next();
});

// Serve uploaded files from backend/uploads directory
// This must come BEFORE the catch-all route for React
const uploadsPath = path.join(__dirname, "uploads");
Logger.info(`Uploads directory path: ${uploadsPath}`);
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  Logger.info(`Created uploads directory: ${uploadsPath}`);
}
Logger.info(`Uploads directory exists: ${fs.existsSync(uploadsPath)}`);

// Serve uploads at /uploads (nginx/proxy will forward /api/uploads to /uploads)
app.use("/uploads", express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    // Set proper content type for images and videos
    if (filePath.endsWith('.mp4') || filePath.endsWith('.webm') || filePath.endsWith('.ogg')) {
      res.setHeader('Content-Type', 'video/mp4');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (filePath.endsWith('.mov')) {
      res.setHeader('Content-Type', 'video/quicktime');
    }
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    // Prevent caching to avoid stale 404s
    res.setHeader('Cache-Control', 'public, max-age=3600');
  },
  maxAge: 3600000, // 1 hour
  etag: true,
  lastModified: true
}));

// Serve static files from the React app (only if frontend build exists - not in Docker with nginx)
const frontendBuildPath = path.join(__dirname, "../frontend/build");
const indexPath = path.join(frontendBuildPath, "index.html");

// Only serve static files if frontend build directory exists
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));

  // The "catchall" handler: for any request that doesn't
  // match one above, send back React's index.html file.
  // Only match non-API routes to avoid interfering with API endpoints
      app.get("*", (req, res, next) => {
        // Skip API routes and uploads - they should have been handled above
        // If we reach here and it's an API route, it means the route wasn't found
        if (req.path.startsWith("/admin") || 
            req.path.startsWith("/match") || 
            req.path.startsWith("/member") ||
            req.path.startsWith("/uploads")) {
          // API route or uploads not found - return 404 JSON instead of HTML
          if (req.path.startsWith("/uploads")) {
            return res.status(404).json({ error: "File not found", path: req.path });
          }
          return res.status(404).json({ error: "API endpoint not found", path: req.path });
        }
    
    // Only serve index.html for frontend routes (if file exists)
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath, (err) => {
        if (err) {
          Logger.error("Error sending index.html:", err);
          res.status(404).json({ error: "Not found" });
        }
      });
    } else {
      // Frontend not built or not available - return 404
      res.status(404).json({ 
        error: "Frontend not available", 
        message: "Frontend build directory not found. In Docker, nginx serves the frontend." 
      });
    }
  });
} else {
  // Frontend build doesn't exist (Docker scenario with nginx)
  // Only handle API routes
      app.get("*", (req, res) => {
        if (req.path.startsWith("/admin") || 
            req.path.startsWith("/match") || 
            req.path.startsWith("/member") ||
            req.path.startsWith("/uploads")) {
          // API route or uploads not found
          if (req.path.startsWith("/uploads")) {
            return res.status(404).json({ error: "File not found", path: req.path });
          }
          return res.status(404).json({ error: "API endpoint not found", path: req.path });
        }
    // Non-API route - let nginx handle it (in Docker) or return 404
    res.status(404).json({ 
      error: "Not found", 
      message: "This endpoint is handled by nginx or frontend server" 
    });
  });
}

// Global error handling middleware
app.use(async (err, req, res, next) => {
  await TelemetryService.log("error", "API Error", {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    params: req.params,
  });
  Logger.error("Global Error Handler:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

const MatchService = require("./services/match.service");
const { Cache } = require("./models/cache.model");
const { updateHKMatches } = require("./getAPIFixtureId");

// Update cached match data every 160 seconds
if (process.env.FETCHER) {
  const updateCache = async () => {
    try {
      Logger.info("Updating cached match data...");
      const data = await MatchService.getMatchData();
      Logger.info(`Fetched ${data.length} matches`);
      if (data.length > 0) {
        const cacheKey = "matchData";
        // Try Redis first, fallback to MongoDB
        const redisSet = await RedisCache.set(cacheKey, data, 300); // 5 minutes TTL
        
        if (!redisSet) {
          // Fallback to MongoDB cache
          await Cache.findOneAndUpdate(
            { key: cacheKey },
            { data, updatedAt: new Date() },
            { upsert: true, new: true },
          );
        }
        Logger.info("Cache updated successfully with", data.length, "matches");
      } else {
        Logger.warn("No match data to cache - data array is empty");
      }
    } catch (err) {
      Logger.error("Error updating cached match data:", err);
      Logger.error("Error stack:", err.stack);
    }
  };

  // Update HK matches every 2 minutes
  const updateHKCache = async () => {
    try {
      Logger.info("Updating HK matches cache...");
      await updateHKMatches();
    } catch (err) {
      Logger.error("Error updating HK matches cache:", err);
    }
  };

  Logger.info("Fetcher mode enabled");
  setInterval(updateCache, 160000);
  setInterval(updateHKCache, 120000);
}


app.listen(port, () => {
  Logger.info(`Server is running on port: ${port}`);
});
