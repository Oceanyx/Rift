const express = require('express');
const bcrypt = require('bcryptjs');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User , Server} = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { Sequelize } = require('sequelize');
const router = express.Router();

// Add signup validation middleware
const validateSignup = [
  check('email')
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email.'),
  check('username')
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.'),
  check('username')
    .not()
    .isEmail()
    .withMessage('Username cannot be an email.'),
  check('password')
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters or more.'),
  check('firstName')
    .exists({ checkFalsy: true })
    .withMessage('First Name is required'),
  check('lastName')
    .exists({ checkFalsy: true })
    .withMessage('Last Name is required'),
  handleValidationErrors
];

// Sign up
router.post(
  '/',
  validateSignup,
  async (req, res, next) => {
    const { email, password, username, firstName, lastName } = req.body;
    
    try {
      // Check for existing user with same email or username manually first
      const existingUser = await User.findOne({
        where: {
          [Sequelize.Op.or]: [
            { email: email },
            { username: username }
          ]
        }
      });
      
      if (existingUser) {
        console.log(existingUser,email,'looking for email');
        const errors = {};
        if (existingUser.username === username) {
          errors.username = "User with that username already exists";
        }
        if (existingUser.email === email) {
          errors.email = "User with that email already exists";
        }
        
        
        
        // Return a 400 status with specific error information
        return res.status(400).json({
          message: "User already exists",
          errors: errors
        });
      }
      
      // Create new user if no duplicate found
      const hashedPassword = bcrypt.hashSync(password);
      const user = await User.create({ 
        email, 
        username, 
        hashedPassword,
        firstName,
        lastName 
      });

      const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      };

    const demoServer = await Server.findOne({ where: { name: 'Demo Server' } });
    if (demoServer) {
      // This uses the Sequelize association helper generated from the belongsToMany relationship
      await user.addServer(demoServer);
    }

      await setTokenCookie(res, safeUser);

      return res.json({
        user: safeUser
      });
      
    } catch (error) {
      // Handle Sequelize validation/unique constraint errors
      if (error.name === 'SequelizeUniqueConstraintError') {
        const errors = {};
        
        error.errors.forEach(err => {
          if (err.path === 'username') {
            errors.username = "User with that username already exists";
          }
          if (err.path === 'email') {
            errors.email = "User with that email already exists";
          }
          
        });
        
        // Return a 400 status with specific error information
        return res.status(400).json({
          message: "User already exists",
          errors: errors
        });
      }
      
      // For all other errors, pass to the global error handler
      next(error);
    }
  }
);

module.exports = router;