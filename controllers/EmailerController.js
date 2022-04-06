
// Include required modules
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const moment = require('moment');
const cheerio = require('cheerio');
const sendgrid = require('@sendgrid/mail');

// Include models
const Bcc = require('../models/Bcc');

// Include utility
const Logger = require('../util/Logger');

// Initialise sendgrid
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);


class EmailerController {
    /**
     * Subscribe email and name in DB
     * @param {String} name 
     * @param {String} email 
     * @returns {Boolean} Subscription successful
     */
    static async subscribeBcc(name, email) {
        let bcc = await Bcc.findOne({ email });

        if (bcc && bcc.subscribed) {
            return false;
        } else if (bcc && !bcc.subscribed) {
            bcc.subscribed = true;
            await bcc.save();
            return true;
        } else {
            bcc = new Bcc({ name, email, subscribed: true });
            await bcc.save();
            return true;
        }
    }


    /**
     * Unsubscribe email in DB
     * @param {String} email 
     * @returns {Boolean} Unsubscription successful
     */
    static async unsubscribeBcc(email) {
        const bcc = await Bcc.findOne({ email });
        if (!bcc) return false;

        bcc.subscribed = false;
        await bcc.save();
        return true;
    }


    static templateEmail(data) {
        const formattedDate = data.date.split(' ').length > 3 ? 
            moment(data.date).format('MMMM Do YYYY, h:mm a') :
            data.date;

        return fs.readFileSync(path.join(__dirname, '../templates/email.html')).toString()
            .replace('&lt;DATE&gt;', data.date)
            // .replace('&lt;SERIES_TITLE&gt;', data.seriesTitle)
            .replace('&lt;AUTHOR&gt;', data.author)
            .replace('&lt;POST_TITLE&gt;', data.title)
            .replace('&lt;TAGS&gt;', data.tags ? data.tags.map(tag => `#${tag}`).join(', ') : '')
            .replace('&lt;POST_URL&gt;', `https://amongoose.com/posts/${data.slug}/`)
            .replace('&lt;POST_URL&gt;', `https://amongoose.com/posts/${data.slug}/`)
            .replace(/"/g, '');
    }

    static async deploySucceeded(req, res) {
        // Fetch title from request body
        const { title } = req.body;
        // Filter other requests
        if (!title) return;
        if (!title.includes('Create Blog Posts')
            && !title.includes('Update Blog Posts')) return;
        
        // Extract slug from title
        const slug = title.split(' ')[3]
            .replace('“', '')
            .replace('”', '');
        
        // Fetch data from post
        const body = await axios(`https://www.amongoose.com.au/posts/${slug}/json`, {params: {rawJson: true}})
            .catch(error => {
                Logger.error(`Axios Error: @slug: ${slug}`, error);
            })

        console.log(body);
        if (!body) return;
        // Parse html & json
        const $ = cheerio.load(body.data);
        const postData = JSON.parse($('#jsonOutput').text());
        postData.slug = slug;
        const html = EmailerController.templateEmail(postData); 

        const bcc = (await Bcc.find({ subscribed: true }))
            .map(item => ({
                name: item.name,
                email: item.email
            }));

        // Send email
        await sendgrid.send({
            personalizations: [{
                to: 'info@amongoose.com',
                bcc
            }],
            from: process.env.EMAIL_FROM,
            subject: `New Post: ${postData.title}`,
            text: `${html}`,
            html
        }).then(() => {
            Logger.success('Post Notification', `Email notification for post: ${postData.title} has been sent.`);
        }).catch(error => {
            Logger.error('Post Notification', error);
        });

        // End request
        res.status(200).end();
    }

    static async subscribe(req, res) {
        const { name, email } = req.body;
        if (!email) res.status(401).end();

        EmailerController.subscribeBcc(name, email);
        Logger.success('Subscription', `${name}:${email} subscribed.`);

        res.status(200).end();
    }

    static async unsubscribe(req, res) {
        const { email } = req.body;
        if (!email) return res.redirect('/unsubscribe');

        if (await EmailerController.unsubscribeBcc(email)) {
            Logger.info('Unsubscription', `${email} unsubscribed`);
        }

        return res.redirect(`/unsubscribe?done=true&email=${email}`);
    }

    static unsubscribePage(req, res) {
        res.render('unsubscribe', { query: req.query });
    }
}

module.exports = EmailerController;