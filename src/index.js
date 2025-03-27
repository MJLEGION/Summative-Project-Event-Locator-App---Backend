require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const i18next = require("./config/i18n");
const i18nextMiddleware = require("i18next-http-middleware");


const app = express();

// Middleware
app.use(i18nextMiddleware.handle(i18next));
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/auth", authRoutes);

//Routes
app.use("/api/auth", authRoutes)
app.use("/api/events", eventRoutes)

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// Test Route
app.get("/", (req, res) => {
  res.send("Hey there! Welcome to the Event Locator App—your perfect place for finding events effortlessly!");
});

// Start server
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app; 