const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

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

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

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
console.log("Connecting to MongoDB database...", uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")); // Hide password in logs

// MongoDB connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
};

mongoose.connect(uri, mongooseOptions);
const connection = mongoose.connection;

// Handle connection errors
connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
  console.error("Full error:", err);
});

connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Attempting to reconnect...");
});

connection.once("open", async () => {
  console.log("MongoDB database connection established successfully");

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
      console.log("Default admin user created with username: Admin02");
    } else {
      console.log("Default admin user already exists.");
    }
    
    // Trigger initial cache update if fetcher is enabled
    if (process.env.FETCHER) {
      // Run initial cache update immediately after MongoDB is ready
      // Use setImmediate to ensure it runs after the current execution context
      setImmediate(async () => {
        console.log("Running initial cache update after MongoDB connection...");
        try {
          const MatchService = require("./services/match.service");
          const { Cache } = require("./models/cache.model");
          const { updateHKMatches } = require("./getAPIFixtureId");
          
          const data = await MatchService.getMatchData();
          console.log(`Initial fetch: ${data.length} matches`);
          if (data.length > 0) {
            await Cache.findOneAndUpdate(
              { key: "matchData" },
              { data, updatedAt: new Date() },
              { upsert: true, new: true },
            );
            console.log("Initial cache populated with", data.length, "matches");
          } else {
            console.warn("Initial cache update: No matches found");
          }
          await updateHKMatches();
          console.log("Initial cache update completed");
        } catch (err) {
          console.error("Error during initial cache update:", err);
          console.error("Error stack:", err.stack);
        }
      });
    }
  } catch (err) {
    console.error("Error during database initialization:", err);
  }
});

// Apply session middleware before other routes
app.use("/admin", adminRoutes);
app.use("/match", matchRoutes);
app.use("/member", memberRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../frontend/build")));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

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
  console.error("Global Error Handler:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

const MatchService = require("./services/match.service");
const { Cache } = require("./models/cache.model");
const { updateHKMatches } = require("./getAPIFixtureId");

// Update cached match data every 60 seconds
if (process.env.FETCHER) {
  const updateCache = async () => {
    try {
      console.log("Updating cached match data...");
      const data = await MatchService.getMatchData();
      console.log(`Fetched ${data.length} matches`);
      if (data.length > 0) {
        await Cache.findOneAndUpdate(
          { key: "matchData" },
          { data, updatedAt: new Date() },
          { upsert: true, new: true },
        );
        console.log("Cache updated successfully with", data.length, "matches");
      } else {
        console.warn("No match data to cache - data array is empty");
      }
    } catch (err) {
      console.error("Error updating cached match data:", err);
      console.error("Error stack:", err.stack);
    }
  };

  // Update HK matches every 2 minutes
  const updateHKCache = async () => {
    try {
      console.log("Updating HK matches cache...");
      await updateHKMatches();
    } catch (err) {
      console.error("Error updating HK matches cache:", err);
    }
  };

  // updateCache();
  // updateHKCache();
  console.log("Fetcher mode enabled");
  setInterval(updateCache, 160000);
  setInterval(updateHKCache, 120000);
}


app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
