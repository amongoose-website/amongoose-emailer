
const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * @type {Schema}
 */
const emailSchema = new Schema({
    parsedEmail: {
        type: Object,
        unique: false,
        required: true
    },
    status: {
        type: String,
        unique: false,
        required: true,
        default: 'uploading'
    },
    sentNotifications: {
        type: Array,
        required: true,
        default: []
    },
    fileName: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

const Email = mongoose.model('Email', emailSchema);

module.exports = Email;