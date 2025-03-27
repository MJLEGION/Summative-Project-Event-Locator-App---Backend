const Event = require("../models/Event");
const { scheduleNotification } = require("../services/notificationService");

// Create an event and schedule a notification
exports.createEvent = async (req, res) => {
  try {
    const { name, description, category, date, location } = req.body;
    const newEvent = new Event({
      name,
      description,
      category,
      date,
      location,
      creator: req.user.userId
    });

    await newEvent.save();

    // Schedule a notification for this event
    await scheduleNotification(newEvent);

    res.status(201).json({( message: req.t("event_created"), event: newEvent});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("creator", "name email");
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("creator", "name email");
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Find events near a location
exports.findEventsNearby = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({ error: "Longitude and latitude are required" });
    }

    const events = await Event.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: maxDistance ? parseInt(maxDistance) : 5000, // Default 5km
        },
      },
    });

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Filter events by category
exports.filterEventsByCategory = async (req, res) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }

    const events = await Event.find({ category: category });

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
