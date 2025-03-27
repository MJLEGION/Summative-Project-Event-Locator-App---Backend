const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: { type: String, required: true },
  date: { type: Date, required: true },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" }, // GeoJSON format
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

EventSchema.index({ location: "2dsphere" }); // Enable geospatial indexing

const Event = mongoose.model("Event", EventSchema);
module.exports = Event;
