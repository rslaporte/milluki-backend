const mongoose = require('mongoose')
const Joi = require('joi')

const {collectionSchema} = require('./collection')

const User = mongoose.model('user', mongoose.Schema({
    name: {
        type: String,
        minlength: 2,
        maxlength: 50,
        required: true
    },

    email: {
        type: String,
        unique: true,
        minglength: 6,
        maxlength: 50
    },

    password: {
        type: String,
        required: true,
        minglength: 6,
        maxlength: 20

    },

    collection: {
        type: [collectionSchema]
    }
}))

function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().min(6).max(50),
        password: Joi.string().min(6).max(20)
    })

    return schema.validate(user)
}

exports.User = User,
exports.validate = validateUser