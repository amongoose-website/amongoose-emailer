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
}

module.exports = AdminController;