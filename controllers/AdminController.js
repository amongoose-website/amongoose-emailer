const fs = require('fs');
const moment = require('moment');

const Post = require('../models/Post');
const Email = require('../models/Email');
const Settings = require('../models/Settings');
const EmailerController = require('./EmailerController');

/**
 * Capatilise first letter of a string
 * @param {String} string Input string
 * @returns {String} Capitalised string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}


class AdminController {
    /**
     * Render home page
     * @param {Request} req 
     * @param {Response} res 
     */
     static async renderHomePage(req, res) {
        const user = req.oidc.user;
        res.render('dash-home', {
            user,
            pageTitle: `Welcome back, ${capitalizeFirstLetter(user.nickname)}`
        });
    }

    /**
     * Render invdividual email page
     * @param {Request} req 
     * @param {Response} res 
     */
    static async renderEmailPage(req, res) {
        const user = req.oidc.user;
        const { fileName } = req.params;
        
        // Find and filter to correct email
        const email = req.email || await Email.findOne({ fileName });
        if (!email) return res.render('error', {code: 404});
        
        const post = req.post || new Post(email.parsedEmail);

        res.render('dash-email', {
            user,
            email,
            post,
            pageTitle: `Email: ${post._frontmatter.title}`
        });
    }

    /**
     * Render emails page
     * @param {Request} req 
     * @param {Response} res 
     */
    static async renderInboxPage(req, res) {
        const user = req.oidc.user;
        const emails = await Email.find();
        
        
        res.render('dash-inbox', { 
            user,
            emails: emails.map(email => {
                email.post = new Post(email.parsedEmail)
                return email;
            }), 
            pageTitle: 'Inbox',
            moment
        });
    }

    static async postGoLive(req, res, next) {
        const { fileName } = req.params;

        req.email = await Email.findOne({ fileName });
        if (!req.email) return res.render('404');
        
        req.post = new Post(req.email.parsedEmail);
        // Send post live
        req.post.goLive()
            ? next()
            : res.render('error', {code: 500})
    }

    static async postNotification(req, res, next) {
        const { fileName } = req.params;

        try {
            await EmailerController.sendNotification(fileName);
            next();
        } catch(error) {
            return res.render('error', {code: 500, message: error});
        }
    }

    static async renderLogsListPage(req, res) {
        const { user } = req.oidc;
        const logs = fs.readdirSync('logs');
        res.render('dash-logs-list', { logs, user, pageTitle: 'Logs', moment });
    }

    static async renderLogsPage(req, res) {
        const { user } = req.oidc;
        const logs = fs.readFileSync(`logs/${req.params.fileName}`).toString();
        
        res.render('dash-logs', { logs, user, pageTitle: 'Logs' });
    }

    static async renderSettingsPage(req, res) {
        const { user } = req.oidc;
        const settings = await Settings.findOne();

        res.render('dash-settings', { user, settings, pageTitle: 'Settings' });
    }

    static async updateSettings(req, res) {
        const settings = await Settings.findOne();
        
        // Update settings
        settings.autoPublish = req.body.autoPublish === 'on';
        settings.autoNotify = req.body.autoNotify === 'on';
        await settings.save();
        
        res.status(200);
        res.redirect('/admin/settings');
    }
}

module.exports = AdminController;