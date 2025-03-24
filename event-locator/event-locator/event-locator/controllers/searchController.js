// src/controllers/searchController.js
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { Event, Category, User } = require('../models');

/**
 * Search for events near a location
 * @route GET /api/search/location
 */
exports.searchByLocation = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      radius = 10, // Default radius: 10km
      categories,
      startDate,
      endDate,
      limit = 20,
      offset = 0
    } = req.query;

    // Validate required parameters
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Build date filters
    const filters = {};
    
    if (startDate) {
      filters.event_date = {
        ...filters.event_date,
        [Op.gte]: new Date(startDate)
      };
    }
    
    if (endDate) {
      filters.event_date = {
        ...filters.event_date,
        [Op.lte]: new Date(endDate)
      };
    }

    // Parse categories if provided
    let categoryIds = [];
    if (categories) {
      categoryIds = categories.split(',').map(id => parseInt(id));
    }

    // PostgreSQL/PostGIS query for nearby events
    const events = await Event.findAll({
      where: {
        ...filters,
        // Use ST_DWithin for efficient distance filtering
        [Op.and]: sequelize.literal(`
          ST_DWithin(
            location,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326),
            ${parseFloat(radius) * 1000}
          )
        `)
      },
      include: [
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] },
          where: categoryIds.length > 0 ? { id: categoryIds } : null,
          required: categoryIds.length > 0
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      // Add distance as a calculated field
      attributes: {
        include: [
          [
            sequelize.literal(`
              ST_Distance(
                location,
                ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
              ) / 1000
            `),
            'distance_km'
          ]
        ]
      },
      order: [[sequelize.literal('distance_km'), 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      count: events.length,
      events,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Search events error:', error);
    res.status(500).json({ message: 'Server error searching events' });
  }
};

/**
 * Search for events based on user preferences
 * @route GET /api/search/preferences
 */
exports.searchByUserPreferences = async (req, res) => {
  try {
    // Get authenticated user
    const userId = req.user.id;
    
    // Get user details
    const user = await User.findByPk(userId, {
      include: ['preferredCategories']
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has set their location
    if (!user.location) {
      return res.status(400).json({
        message: 'Location not set. Please update your profile with your location.'
      });
    }
    
    // Extract user preferences
    const coordinates = user.location.coordinates;
    const longitude = coordinates[0];
    const latitude = coordinates[1];
    const radius = user.default_radius || 10; // Default: 10km
    
    // Get user's preferred category IDs
    const categoryIds = user.preferredCategories.map(cat => cat.id);
    
    // Find events matching user preferences
    const events = await Event.findAll({
      where: {
        // Only future events
        event_date: {
          [Op.gte]: new Date()
        },
        // Within user's preferred radius
        [Op.and]: sequelize.literal(`
          ST_DWithin(
            location,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326),
            ${radius * 1000}
          )
        `)
      },
      include: [
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] },
          where: categoryIds.length > 0 ? { id: categoryIds } : null,
          required: categoryIds.length > 0
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      // Add distance as a calculated field
      attributes: {
        include: [
          [
            sequelize.literal(`
              ST_Distance(
                location,
                ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
              ) / 1000
            `),
            'distance_km'
          ]
        ]
      },
      order: [
        ['event_date', 'ASC'],
        [sequelize.literal('distance_km'), 'ASC']
      ],
      limit: 50 // Limit the number of results
    });

    res.json({
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Search user preferences error:', error);
    res.status(500).json({ message: 'Server error searching events by preferences' });
  }
};

// src/routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const auth = require('../middlewares/auth');

// Public routes
router.get('/location', searchController.searchByLocation);

// Protected routes
router.get('/preferences', auth.authenticate, searchController.searchByUserPreferences);

module.exports = router;