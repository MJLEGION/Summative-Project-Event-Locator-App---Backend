const express = require("express");
const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, findEventsNearby, filterEventsByCategory } = require("../controllers/eventController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Order is important! More specific routes should come before generic ones
router.get("/search", findEventsNearby); // Moved before /:id
router.get("/filter", filterEventsByCategory); // Moved before /:id

router.post("/", authMiddleware, createEvent);
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.put("/:id", authMiddleware, updateEvent);
router.delete("/:id", authMiddleware, deleteEvent);

module.exports = router;