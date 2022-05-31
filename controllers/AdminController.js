

class AdminController {
    /**
     * Render login page
     * @param {Request} _req 
     * @param {Response} res 
     */
    static renderLoginPage(_req, res) {
        res.render('login');
    }
}

module.exports = AdminController;