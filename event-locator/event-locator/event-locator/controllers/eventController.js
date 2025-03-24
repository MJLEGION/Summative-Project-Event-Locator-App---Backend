// src/controllers/eventController.js
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { Event, Category, User, EventCategory } = require('../models');

/**
 * Get all events with optional filtering
 * @route GET /api/events
 */
exports.getEvents = async (req, res) => {
  try {
    const { 
      category,
      startDate,
      endDate,
      createdBy,
      limit = 20,
      offset = 0
    } = req.query;
    
    // Build query filters
    const filters = {};
    
    // Filter by date range
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
    
    // Filter by creator
    if (createdBy) {
      filters.created_by = createdBy;
    }
    
    // Build category filter
    const categoryFilter = {};
    if (category) {
      categoryFilter.id = category;
    }
    
    // Execute query
    const { count, rows } = await Event.findAndCountAll({
      where: filters,
      include: [
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] },
          where: Object.keys(categoryFilter).length > 0 ? categoryFilter : null,
          required: Object.keys(categoryFilter).length > 0
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      order: [['event_date', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });
    
    res.json({
      count,
      events: rows,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error fetching events' });
  }
};

/**
 * Get event by ID
 * @route GET /api/events/:id
 */
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] }
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error fetching event' });
  }
};

/**
 * Create a new event
 * @route POST /api/events
 */
exports.createEvent = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      title,
      description,
      latitude,
      longitude,
      event_date,
      end_date,
      categories
    } = req.body;
    
    // Create the event
    const event = await Event.create({
      title,
      description,
      latitude,
      longitude,
      event_date,
      end_date,
      created_by: req.user.id
    }, { transaction });
    
    // Add categories if provided
    if (categories && categories.length > 0) {
      for (const categoryId of categories) {
        const category = await Category.findByPk(categoryId);
        if (category) {
          await EventCategory.create({
            event_id: event.id,
            category_id: categoryId
          }, { transaction });
        }
      }
    }
    
    await transaction.commit();
    
    // Fetch the created event with its relationships
    const createdEvent = await Event.findByPk(event.id, {
      include: [
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] }
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });
    
    res.status(201).json({
      message: 'Event created successfully',
      event: createdEvent
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error creating event' });
  }
};

/**
 * Update an event
 * @route PUT /api/events/:id
 */
exports.updateEvent = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const {
      title,
      description,
      latitude,
      longitude,
      event_date,
      end_date,
      categories
    } = req.body;
    
    // Find the event
    const event = await Event.findByPk(id);
    
    if (!event) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check ownership
    if (event.created_by !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }
    
    // Update the event
    await event.update({
      title: title || event.title,
      description: description || event.description,
      latitude: latitude || event.latitude,
      longitude: longitude || event.longitude,
      event_date: event_date || event.event_date,
      end_date: end_date
    }, { transaction });
    
    // Update categories if provided
    if (categories && categories.length > 0) {
      // Remove existing categories
      await EventCategory.destroy({
        where: { event_id: id },
        transaction
      });
      
      // Add new categories
      for (const categoryId of categories) {
        const category = await Category.findByPk(categoryId);
        if (category) {
          await EventCategory.create({
            event_id: event.id,
            category_id: categoryId
          }, { transaction });
        }
      }
    }
    
    await transaction.commit();
    
    // Fetch the updated event with its relationships
    const updatedEvent = await Event.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] }
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });
    
    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error updating event' });
  }
};

/**
 * Delete an event
 * @route DELETE /api/events/:id
 */
exports.deleteEvent = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Find the event
    const event = await Event.findByPk(id);
    
    if (!event) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check ownership
    if (event.created_by !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }
    
    // Delete related records first
    await EventCategory.destroy({
      where: { event_id: id },
      transaction
    });
    
    // Delete the event
    await event.destroy({ transaction });
    
    await transaction.commit();
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error deleting event' });
  }
};

// src/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const eventController = require('../controllers/eventController');
const auth = require('../middlewares/auth');

// Validation middleware
const eventValidation = [
  check('title', 'Title is required').notEmpty(),
  check('description', 'Description is required').notEmpty(),
  check('latitude', 'Latitude must be a number between -90 and 90').isFloat({ min: -90, max: 90 }),
  check('longitude', 'Longitude must be a number between -180 and 180').isFloat({ min: -180, max: 180 }),
  check('event_date', 'Valid event date is required').isISO8601().toDate(),
  check('end_date', 'End date must be valid ISO date format').optional().isISO8601().toDate(),
  check('categories', 'Categories must be an array').optional().isArray()
];

// Public routes
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);

// Protected routes
router.post('/', auth.authenticate, eventValidation, eventController.createEvent);
router.put('/:id', auth.authenticate, eventValidation, eventController.updateEvent);
router.delete('/:id', auth.authenticate, eventController.deleteEvent);

module.exports = router;