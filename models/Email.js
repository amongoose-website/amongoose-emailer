
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
    posted: {
        type: Boolean,
        unique: false,
        required: true,
        default: false
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