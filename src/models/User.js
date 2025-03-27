const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Add location and preferences to meet project requirements
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
  preferredCategories: [{ type: String }],
  preferredLanguage: { type: String, default: "en" }
}, { timestamps: true });

// Add geospatial index to user location
UserSchema.index({ location: "2dsphere" });

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", UserSchema);
module.exports = User;