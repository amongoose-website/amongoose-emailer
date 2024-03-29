
// Include required modules
const path = require('path');
const uuid = require('uuid');
const multer = require('multer');
const { simpleParser } = require('mailparser');

// Include models
const Post = require('../models/Post');
const Email = require('../models/Email');

// Include utility
const Logger = require('../util/Logger');

// Include config
const { 
    inboundEmailWhitelist,
    postsPath,
    multerPath
} = require('../config');
const Settings = require('../models/Settings');

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
const _upload = multer({ storage, limits: { fieldSize: 1024 ** 3 } });


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
        if (!req.body.email) return res.sendStatus(400);
        
        // Parse email
        const parsedEmail = await simpleParser(req.body.email);
        Logger.info('Email recieved', `from ${req.body.from}`);
        
        // Create post for site
        const post = new Post(parsedEmail);
        const { fileName } = post;

        if (await Email.exists({ fileName })) {
            Logger.info('Duplicate email', `Duplicate: ${fileName} recieved.`);
            return;
        }

        const email = new Email({ parsedEmail, fileName });
        // Save to DB
        await email.save();

        const settings = await Settings.findOne();

        // Go live if settings to Automatically Publish is on
        if (settings.autoPublish) {
            res.sendStatus(post.goLive() ? 200 : 500);
        } else {
            res.sendStatus(200);
        }
    }
}

module.exports = InboundController;
