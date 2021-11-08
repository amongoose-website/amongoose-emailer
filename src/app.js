
// Include required modules
const express = require('express');
const bodyParser = require('body-parser');

// Include utility
const Logger = require('./util/Logger');

// Initialise app
const app = express();

// Include config
const config = require('../config');

// Middleware
app.use(bodyParser.json());

// Routes
const emailerRoute = require('./routes/emailer');
app.use('/emailer', emailerRoute);

// Start server
app.startServer = function() {
    app.listen(config.port, () => {
        Logger.info('Server listening', `Listening on port ${config.port}`);
    });
}

module.exports = app;
