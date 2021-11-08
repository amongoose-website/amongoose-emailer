
// Include required modules
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const sendgrid = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');

const email = (data) => {
    return fs.readFileSync(path.join(__dirname, '../views/email.html')).toString()
        .replace('&lt;DATE&gt;', data.date)
        .replace('&lt;SERIES_TITLE&gt;', data.seriesTitle)
        .replace('&lt;AUTHOR&gt;', data.author)
        .replace('&lt;POST_TITLE&gt;', data.title)
        .replace('&lt;TAGS&gt;', data.tags.map(tag => `#${tag}`).join(', '))
        .replace('&lt;POST_URL&gt;', `https://amongoose.com/posts/${data.slug}/`)
        .replace('&lt;POST_URL&gt;', `https://amongoose.com/posts/${data.slug}/`);
}

// Initialise app
const app = express();
// Initialise sendgrid
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

// Include utility
const Logger = require('./util/Logger');

// Include config
const config = require('../config');

// Middleware
app.use(bodyParser.json());

app.post('/emailer/newBlogPost', async (req, res) => {
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
    const { data } = await axios(`https://amongoose.com/posts/${slug}/json`, {params: {rawJson: true}});
    // Parse html & json
    const $ = cheerio.load(data);
    const json = JSON.parse($('#jsonOutput').text());
    json.slug = slug;
    const html = email(json);

    // Design email
    const msg = {
        personalizations: [{
            to: 'anthony@amongoose.com',
            bcc: [
                {email: 'webynot@gmail.com'},
                {email: 'jooshuagrimmett@gmail.com'},
                {email: 'bybmongoose@gmail.com'}
            ]
        }],
        from: process.env.EMAIL_FROM,
        subject: `New Post: ${json.title}`,
        text: `${html}`,
        html
    }

    sendgrid.send(msg)
    .then(() => {
        Logger.success('Post Notification', `Email notification for post: ${json.title} has been sent.`);
    }).catch(error => {
            Logger.error('Post Notification', error);
    });

    res.status(200).end();
});


app.startServer = function() {
    app.listen(config.port, () => {
        Logger.info('Server listening', `Listening on port ${config.port}`);
    });
}

module.exports = app;
