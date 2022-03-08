
// Include required modules
const path = require('path');
const uuid = require('uuid');
const multer = require('multer');

// Include models
const Post = require('../models/Post');

// Include utility
const Logger = require('../util/Logger');

// Include config
const { 
    inboundEmailWhitelist,
    postsPath,
    multerPath
} = require('../config');

// Create storage
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, multerPath);
    },
    filename: (_req, file, cb) => {
        cb(null, uuid.v1() + path.extname(file.originalname));
    }
});
// Create multer controller
const _upload = multer({ storage });


class InboundController {
    /**
     * Expose upload
     */
    static get upload() {
        return _upload;
    }

    /**
     * Find a post via an email ID from DB
     * @param {Object} req 
     * @param {Object} res 
     */
    static async findPostByEmailId(req, res) {
        // 
        const post = await Post.findPostByEmailId(req.params.id);

        if (!post) return res.sendStatus(404);

        post.publish();

        res.sendFile(`${postsPath}/${post.fileName}${post.fileExt}`);
    }

    /**
     * Filter emails by whitelisted emails
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    static filterEmail(req, res, next) {
        // If no email body, send bad request 
        if (!req.body || Object.keys(req.body).length < 1)
            return res.status(400).send('Invalid email data.');
        
        // Ensure from authorised 
        const { from } = req.body;
        if (!from) res.status(400).send('Invalid email data.');
        const filter = address => from.includes(address);
        const whitelist = inboundEmailWhitelist.map(address => filter(address));
        // Catch unauthorised requests
        if (whitelist.indexOf(true) === -1) {
            return res.sendStatus(401);
        }

        // Continue request
        return next();
    }

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static async emailRecieved(req, res) {
        Logger.info('Email recieved', `from ${req.body.from}`);

        // Create post and save Email to DB
        const post = new Post({body: req.body, files: req.files});
        await post.saveEmail();

        try {
            post.publish();
            Logger.success('Published post', `Published ${post._frontmatter.title}`);
            return res.sendStatus(200);
        } catch (error) {
            Logger.error('Error publishing post', error);
            return res.sendStatus(500);
        }
    }
}

module.exports = InboundController;
