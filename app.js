
// Include required modules
const path = require('path');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { auth } = require('express-openid-connect');

// Include utility
const Logger = require('./util/Logger');

// Initialise app
const app = express();

// Initialise DB
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.xdz53.mongodb.net/mongooseEmailer?retryWrites=true&w=majority`);

// Include config
const config = require('./config');
// Auth config
const authConfig = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: 'https://emailer.amongoose.com',
    clientID: 'mlG3yPtAxgpKXrWlirYVLloaAPAMUG4a',
    issuerBaseURL: 'https://dev-4zromrqu.au.auth0.com'
 };

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ origin: config.corsWhitelist }));
app.use(auth(authConfig));

app.use(express.static(path.join(__dirname, './public')));

app.set('view engine', 'pug');

// Routes
const emailerRoute = require('./routes/emailer');
app.use('/', emailerRoute);
const inboundRoute = require('./routes/inbound');
app.use('/', inboundRoute);
const adminRoute = require('./routes/admin');
app.use('/admin/', adminRoute);

// 404 Page
app.use((req, res) => {
    res.render('404', {
        pageTitle: 'Page Not Found', 
        reqUrl: req.url, 
        user: req.oidc.user
    })
})

// Start server
app.startServer = function() {
    app.listen(config.port, () => {
        Logger.info('Server listening', `Listening on port ${config.port}`);
    });
}

module.exports = app;
