// src/config/passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { User } = require('../models');

// Local strategy for email/password login
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      // Find the user
      const user = await User.findOne({ where: { email } });
      
      // If user not found or password is invalid
      if (!user || !(await user.validatePassword(password))) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      
      // User found and password is valid
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// JWT strategy for token authentication
passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  },
  async (jwtPayload, done) => {
    try {
      // Find the user by id from JWT payload
      const user = await User.findByPk(jwtPayload.id);
      
      // If user not found
      if (!user) {
        return done(null, false);
      }
      
      // User found
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
));

module.exports = passport;

// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User } = require('../models');

/**
 * Register a new user
 * @route POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, first_name, last_name, latitude, longitude, preferred_language } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create location point if coordinates provided
    let location = null;
    if (latitude && longitude) {
      location = { type: 'Point', coordinates: [longitude, latitude] };
    }

    // Create new user
    const user = await User.create({
      email,
      password_hash: password, // Will be hashed by model hook
      first_name,
      last_name,
      location,
      preferred_language: preferred_language || 'en'
    });

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    // Return user data and token
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
exports.login = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({ message: info.message });
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        return next(err);
      }

      // Generate token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
      });

      return res.json({
        message: 'Login successful',
        token,
        user: user.toJSON()
      });
    });
  })(req, res, next);
};

/**
 * Get current user profile
 * @route GET /api/auth/profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: ['preferredCategories'],
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

/**
 * Update user profile
 * @route PUT /api/auth/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, latitude, longitude, preferred_language, default_radius } = req.body;

    // Find the user
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create location point if coordinates provided
    let location = user.location;
    if (latitude && longitude) {
      location = { type: 'Point', coordinates: [longitude, latitude] };
    }

    // Update user
    await user.update({
      first_name: first_name || user.first_name,
      last_name: last_name || user.last_name,
      location,
      preferred_language: preferred_language || user.preferred_language,
      default_radius: default_radius || user.default_radius
    });

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

/**
 * Change password
 * @route PUT /api/auth/change-password
 */
exports.changePassword = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { current_password, new_password } = req.body;

    // Find the user
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await user.validatePassword(current_password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    await user.update({ password_hash: new_password });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
};

// src/middlewares/auth.js
const passport = require('passport');

/**
 * Middleware to authenticate users with JWT
 */
exports.authenticate = passport.authenticate('jwt', { session: false });

/**
 * Middleware to check if user is authenticated
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ message: 'Unauthorized' });
};

// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

// Validation middleware
const registerValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
  check('first_name', 'First name is required').notEmpty(),
  check('last_name', 'Last name is required').notEmpty()
];

const profileUpdateValidation = [
  check('first_name', 'First name must be a string').optional().isString(),
  check('last_name', 'Last name must be a string').optional().isString(),
  check('latitude', 'Latitude must be a number between -90 and 90').optional().isFloat({ min: -90, max: 90 }),
  check('longitude', 'Longitude must be a number between -180 and 180').optional().isFloat({ min: -180, max: 180 }),
  check('preferred_language', 'Language must be one of: en, es, fr').optional().isIn(['en', 'es', 'fr']),
  check('default_radius', 'Radius must be a number between 0.1 and 100').optional().isFloat({ min: 0.1, max: 100 })
];

const passwordChangeValidation = [
  check('current_password', 'Current password is required').notEmpty(),
  check('new_password', 'New password must be at least 6 characters long').isLength({ min: 6 })
];

// Public routes
router.post('/register', registerValidation, authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', auth.authenticate, authController.getProfile);
router.put('/profile', auth.authenticate, profileUpdateValidation, authController.updateProfile);
router.put('/change-password', auth.authenticate, passwordChangeValidation, authController.changePassword);

module.exports = router;