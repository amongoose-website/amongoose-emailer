
const mongoose = require('mongoose');
const { Schema } = mongoose;

const emailSchema = new Schema({
    body: {
        type: Object,
        unique: false,
        required: true
    },
    files: {
        type: Array,
        unique: false,
        required: false
    }
}, {
    timestamps: true
});

const Email = mongoose.model('Email', emailSchema);

module.exports = Email;