
// Include required modules
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const moment = require('moment');
const cheerio = require('cheerio');
const sendgrid = require('@sendgrid/mail');

// Include models
const Bcc = require('../models/Bcc');
const Email = require('../models/Email');

// Include utility
const Logger = require('../util/Logger');

// Initialise sendgrid
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

// Email config
const { sendgridTemplateId } = require('../config');


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
            .replace('&lt;DATE&gt;', data.formattedDate)
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

        const email = await Email.findOne({ fileName: slug});
        if (email.sentNotifications.length > 0) 
            return Logger.info('Duplicate notification', `Notification for ${slug} has already been sent`);
        
        const postData = await EmailerController.fetchPostData(slug);

        const bcc = (await Bcc.find({ 
            subscribed: true, 
            groups: postData.groups 
        }))
            .map(item => ({
                name: item.name,
                email: item.email
            }));

        const emailTitle = postData.title.replace(/(&quot;)/g, '');
        const dynamicTemplateData ={
            author: postData.author,
            title: postData.title,
            date: postData.date,
            postUrl: `https://amongoose.com/posts/${slug}/`,
            subject: `New Post: ${emailTitle}`
        };

        // Send email
        await sendgrid.send({
            personalizations: [{
                to: 'info@amongoose.com',
                bcc
            }],
            from: process.env.EMAIL_FROM,
            dynamicTemplateData,
            templateId: sendgridTemplateId
        }).then(async () => {
            Logger.success('Post Notification', `Email notification for post: ${postData.title} has been sent to bcc list ${postData.groups}.`);
            email.sentNotifications.push({
                sentAt: new Date(),
                bcc,
                data: dynamicTemplateData
            });
            await email.save();
        }).catch(error => {
            Logger.error('Post Notification', error);
        });

        // End request
        res.status(200).end();
    }
    
    static async fetchPostData(slug) {
        // Fetch data from post
        const body = await axios(`https://www.amongoose.com.au/posts/${slug}/json`, {params: {rawJson: true}})
        .catch(error => {
            Logger.error(`Axios Error: @slug: ${slug}`, error);
        })

        if (!body) return;
        // Parse html & json
        const $ = cheerio.load(body.data);
        return JSON.parse($('#jsonOutput').text());
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