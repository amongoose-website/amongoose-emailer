
// Include required modules
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const sendgrid = require('@sendgrid/mail');

// Include utility
const Logger = require('../util/Logger');

// Initialise sendgrid
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);


class EmailerController {
    static loadBcc() {
        return require('../../db/bcc.json');
    }

    static saveBcc(object) {
        const jsonString = JSON.stringify(object, null, 4);
        fs.writeFileSync(path.join(__dirname, '../../db/bcc.json'), jsonString);
    }

    static subscribeBcc(name, email) {
        const bcc = EmailerController.loadBcc();
        bcc.push({name, email});
        EmailerController.saveBcc(bcc);
        return bcc;
    }

    static unsubscribeBcc(email) {
        let bcc = EmailerController.loadBcc();
        bcc = bcc.filter(item => item.email !== email);
        EmailerController.saveBcc(bcc);
        return bcc;
    }

    static templateEmail(data) {
        return fs.readFileSync(path.join(__dirname, '../templates/email.html')).toString()
        .replace('&lt;DATE&gt;', data.date)
        .replace('&lt;SERIES_TITLE&gt;', data.seriesTitle)
        .replace('&lt;AUTHOR&gt;', data.author)
        .replace('&lt;POST_TITLE&gt;', data.title)
        .replace('&lt;TAGS&gt;', data.tags.map(tag => `#${tag}`).join(', '))
        .replace('&lt;POST_URL&gt;', `https://amongoose.com/posts/${data.slug}/`)
        .replace('&lt;POST_URL&gt;', `https://amongoose.com/posts/${data.slug}/`);
    }

    static sendEmail(email) {
        return sendgrid.send(email)
    }

    static async newBlogPost(req, res) {
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
        const { data } = await axios(`https://amongoose.com/posts/${slug}/json`, {params: {rawJson: true}})
            .catch(error => {
                Logger.error(`Axios Error: @slug: ${slug}`, error);
            })
        // Parse html & json
        const $ = cheerio.load(data);
        const postData = JSON.parse($('#jsonOutput').text());
        postData.slug = slug;
        const html = EmailerController.templateEmail(postData); 

        // Send email
        EmailerController.sendEmail({
            personalizations: [{
                to: 'anthony@amongoose.com',
                bcc: EmailerController.loadBcc()
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
        if (!name || !email) res.status(401).end();

        EmailerController.subscribeBcc(name, email);
        Logger.success('Subscription', `${name}:${email} subscribed.`);

        res.status(200).end();
    }

    static async unsubscribe(req, res) {
        const { email } = req.body;
        if (!email) res.status(401).end();

        EmailerController.unsubscribeBcc(email);
        Logger.info('Unsubscription', `${email} unsubscribed`);

        res.status(200).end();
    }
}

module.exports = EmailerController;