
const mongoose = require('mongoose');
const { Schema } = mongoose;

const bccSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        unique: false,
        required: false
    },
    subscribed: {
        type: Boolean,
        required: true
    },
    groups: {
        type: Array,
        required: true,
        default: ['bcc1', 'bcc2', 'bcc3']
    }
});

const Bcc = mongoose.model('Bcc', bccSchema);

module.exports = Bcc;