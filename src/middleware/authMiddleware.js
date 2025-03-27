const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    // Check if authorization header exists
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ error: "No authentication token, authorization denied" });
    }

    // Verify token
    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user data to request
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ error: "Token is not valid" });
  }
};
