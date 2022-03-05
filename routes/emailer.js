
// Include required modules
const router = require('express').Router();

// Include controllers
const EmailerController = require('../controllers/EmailerController');

// Notification when Netlify deploy succeeds
router.post('/deploySucceeded', EmailerController.deploySucceeded);

// Subscribe post route
router.post('/subscribe', EmailerController.subscribe);

// Unsubscribe post route
router.post('/unsubscribe', EmailerController.unsubscribe);

// Unsubscribe get route
router.get('/unsubscribe', EmailerController.unsubscribePage);

module.exports = router;