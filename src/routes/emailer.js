
// Include required modules
const router = require('express').Router();

// Include controllers
const EmailerController = require('../controllers/EmailerController');

router.post('/newBlogPost', EmailerController.newBlogPost);

module.exports = router;