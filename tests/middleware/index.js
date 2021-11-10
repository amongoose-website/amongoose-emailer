const mongoose = require('mongoose');
const { Schema } = mongoose;
const mongodbTest = require('express').Router();


const bccSchema = new Schema({
    name: {
        type: String,
        unique: false,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    }
});

const BCC = mongoose.model('BCC', bccSchema);

mongodbTest.get('/test', async (req, res) => {
    const name = req.query['name'];
    const email = req.query['email'];
    if (!name || !email) res.sendStatus(404).end();
    
    const existing = await BCC.findOne({email});
    if (existing) {
        return res.status(409).send({
            success: false,
            msg: 'Record already exists'
        });
    }

    const newBcc = new BCC({name, email});
    newBcc.save()
        .then(() => {
            res.status(200).send({
                success: true
            });
        })
        .catch(error => {
            res.status(400).send({
                success: false,
                error
            });
        })
})

module.exports = {
    
};