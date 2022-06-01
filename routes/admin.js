
// Include required modules
const router = require('express').Router();
const { requiresAuth } = require('express-openid-connect');

// Include controllers
const AdminController = require('../controllers/AdminController');

// Home Page
router.get('/', requiresAuth(), AdminController.renderHomePage);

// Emails Page
router.get('/emails', requiresAuth(), AdminController.renderEmailsPage);

module.exports = router;