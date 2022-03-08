
// Include required modules
const router = require('express').Router();

// Include controllers
const InboundController = require('../controllers/InboundController');


// Inbound email recieved route
router.post(
    '/inboundEmail',
    InboundController.upload.any(),
    InboundController.filterEmail,
    InboundController.emailRecieved
);

// Developer post information
// router.get('/post/:id', InboundController.findPostByEmailId);

module.exports = router;