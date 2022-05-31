
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
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(cors({
    origin: config.corsWhitelist
}));

app.use(express.static(path.join(__dirname, './public')));

app.set('view engine', 'pug');

// Routes
const emailerRoute = require('./routes/emailer');
app.use('/', emailerRoute);
const inboundRoute = require('./routes/inbound');
app.use('/', inboundRoute);
const adminRoute = require('./routes/admin');
app.use('/admin/', adminRoute);

app.get('/', (req, res) => {
    return res.redirect('/admin/login');
});

// Start server
app.startServer = function() {
    app.listen(config.port, () => {
        Logger.info('Server listening', `Listening on port ${config.port}`);
    });
}

module.exports = app;
