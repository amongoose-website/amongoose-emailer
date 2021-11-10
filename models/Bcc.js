
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
        required: true
    },
    subscribed: {
        type: Boolean,
        required: true
    }
});

const Bcc = mongoose.model('Bcc', bccSchema);

module.exports = Bcc;