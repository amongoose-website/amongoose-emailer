
const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * @type {Schema}
 */
const settingsSchema = new Schema({
    autoPublish: {
        type: Boolean,
        default: true,
        required: true
    },
    autoNotify: {
        type: Boolean,
        default: true,
        required: true
    }
}, {
    timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;