
// Include required modules
const path = require('path');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Include utility
const Logger = require('./util/Logger');

// Initialise app
const app = express();

// Initialise DB
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.xdz53.mongodb.net/mongooseEmailer?retryWrites=true&w=majority`);

// Include config
const config = require('./config');

// Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://amongoose.com');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './public')));

// Developer middleware
if (process.env.NODE_ENV === 'development') {
    const devMiddleware = require('./tests/middleware');
    Object.values(devMiddleware).forEach(router => {
        app.use(router);
    });
}

app.set('view engine', 'pug');

// Routes
const emailerRoute = require('./routes/emailer');
app.use('/', emailerRoute);

// Start server
app.startServer = function() {
    app.listen(config.port, () => {
        Logger.info('Server listening', `Listening on port ${config.port}`);
    });
}

module.exports = app;
