const express = require("express");
const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, findEventsNearby, filterEventsByCategory } = require("../controllers/eventController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createEvent);
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.put("/:id", authMiddleware, updateEvent);
router.delete("/:id", authMiddleware, deleteEvent);
router.get("/search", findEventsNearby);
router.get("/filter", filterEventsByCategory);

module.exports = router;
