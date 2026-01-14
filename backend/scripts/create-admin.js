const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Admin } = require("../models/admin.model");
require("dotenv").config();

const uri = process.env.ATLAS_URI ||
  "mongodb://root:example@localhost:27017/betting-china?authSource=admin";

mongoose.connect(uri);

const connection = mongoose.connection;
connection.once("open", async () => {
  console.log("MongoDB database connection established successfully");

  try {
    const username = process.argv[2] || "Admin02";
    const password = process.argv[3] || "60160849";
    const role = process.argv[4] || "main";

    const existingAdmin = await Admin.findOne({ username });

    if (existingAdmin) {
      // Update password if admin exists
      const hashedPassword = await bcrypt.hash(password, 10);
      existingAdmin.password = hashedPassword;
      existingAdmin.role = role;
      await existingAdmin.save();
      console.log(`Admin ${username} password and role updated successfully.`);
    } else {
      // Create new admin
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = new Admin({
        username,
        password: hashedPassword,
        role,
      });
      await admin.save();
      console.log(`Admin ${username} created successfully.`);
    }
  } catch (error) {
    console.error("Error creating/updating admin:", error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
});

