const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Admin } = require("../models/admin.model");
const TelemetryService = require("../services/telemetry.service");

/**
 * @function seedAdmins
 * @description Seeds the database with an admin account and mock sub-admin accounts if they don't exist.
 * @returns {Promise<void>}
 * @async
 */
async function seedAdmins() {
  try {
    const admins = [
      {
        username: "admin",
        password: "adminpassword",
        role: "main",
      },
      {
        username: "Admin02",
        password: "60160849",
        role: "main",
      },
      {
        username: "subadmin1",
        password: "subadmin1password",
        role: "sub",
      },
      {
        username: "subadmin2",
        password: "subadmin2password",
        role: "sub",
      },
    ];

    for (const adminData of admins) {
      let admin = await Admin.findOne({ username: adminData.username });

      if (!admin) {
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        admin = new Admin({
          username: adminData.username,
          password: hashedPassword,
          role: adminData.role,
        });
        await admin.save();
        await TelemetryService.log(
          "info",
          `Admin created: ${adminData.username}`,
        );
      } else {
        await TelemetryService.log(
          "info",
          `Admin already exists: ${adminData.username}`,
        );
      }
    }
  } catch (error) {
    await TelemetryService.log("error", "Error seeding admins", {
      error: error.message,
    });
  }
}

module.exports = seedAdmins;
