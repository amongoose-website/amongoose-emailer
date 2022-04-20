require('dotenv').config();

// Include required modules
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const sendgrid = require('@sendgrid/mail');

// Include models
const Bcc = require('../models/Bcc');

// Include utility
const Logger = require('../util/Logger');

// Initialise sendgrid
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

// Initialise DB
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.xdz53.mongodb.net/mongooseEmailer?retryWrites=true&w=majority`);

async function sendEmail(data) {
    const bcc = (await Bcc.find({ subscribed: true }))
        .map(item => ({
            name: item.name,
            email: item.email
        }));
    
    await sendgrid.send({
        personalizations: [{
            to: 'info@amongoose.com',
            bcc
        }],
        from: process.env.EMAIL_FROM,
        subject: `New Post: ${data.title}`,
        dynamicTemplateData: {
            author: data.author,
            title: data.title,
            date: data.date,
            postUrl: `https://amongoose.com/posts/${data.slug}/`
        },
        templateId: 'd-66d0940019a34234bd3c5c2ffe427161'
    }).then(() => {
        Logger.success('Post Notification', `Email notification for post: ${data.title} has been sent.`);
    }).catch(error => {
        Logger.error('Post Notification', error);
    });
}

sendEmail({
    date: new Date(),
    author: 'Anthony Mongoose',
    title: 'Test Title',
    tags: ['Test tag', 'another one'],
    slug: 'test-post'
});