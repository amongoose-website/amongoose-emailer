<<<<<<< HEAD
const Email = require('../models/Email');


/**
 * Capatilise first letter of a string
 * @param {String} string Input string
 * @returns {String} Capitalised string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
=======
>>>>>>> e7a041ae83df72af05d5bc123785f7a5b70da869


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
     * @param {Request} _req 
     * @param {Response} res 
     */
    static async renderEmailsPage(_req, res) {
        const emails = await Email.find();
        res.render('dash-emails', { emails });
    }
}

module.exports = AdminController;