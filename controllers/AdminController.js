const moment = require('moment');

const Post = require('../models/Post');
const Email = require('../models/Email');

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
        const email = req.email ?? await Email.findOne({ fileName });
        if (!email) return res.render('error', {code: 404});
        
        const post = req.post ?? new Post(email.parsedEmail);

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
}

module.exports = AdminController;