
// Include required modules
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

// Include utility
const Logger = require('./util/Logger');

// Initialise app
const app = express();

// Include config
const config = require('./config');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './public')));

app.set('view engine', 'pug');

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
