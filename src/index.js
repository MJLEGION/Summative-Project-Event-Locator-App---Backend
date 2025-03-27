require("dotenv").config();
require("./workers/notificationWorker");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const i18next = require("./config/i18n");
const i18nextMiddleware = require("i18next-http-middleware");

const app = express();

// Middleware
app.use(i18nextMiddleware.handle(i18next));
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Hey there! Welcome to the Event Locator App—your perfect place for finding events effortlessly!");
});

// Enhanced MongoDB Connection
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.once('open', () => {
  console.log('✅ MongoDB connection established successfully');
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1); // Exit if connection fails
  });

// Start server
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

// Ensure notification worker is loaded
require("./workers/notificationWorker");

module.exports = app;