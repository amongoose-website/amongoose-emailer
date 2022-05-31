
// Include required modules
const router = require('express').Router();

// Include controllers
const AdminController = require('../controllers/AdminController');

// Login page
router.get('/login', AdminController.renderLoginPage);

// Logout
router.get('/logout', (req, res) => res.sendStatus(404));

module.exports = router;