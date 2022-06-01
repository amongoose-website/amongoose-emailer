
// Include required modules
const router = require('express').Router();
const { requiresAuth } = require('express-openid-connect');

// Include controllers
const AdminController = require('../controllers/AdminController');

// Home page
router.get('/', requiresAuth(), AdminController.renderHomePage);

// Emails page
router.get('/inbox', requiresAuth(), AdminController.renderInboxPage);

// Individual email pages
router.get('/inbox/:fileName', requiresAuth(), AdminController.renderEmailPage);

// Send email live
router.get('/inbox/:fileName/goLive', requiresAuth(), AdminController.postGoLive, AdminController.renderEmailPage);

// Send email live
router.get('/inbox/:fileName/notify', requiresAuth(), AdminController.postNotification, AdminController.renderEmailPage);


module.exports = router;