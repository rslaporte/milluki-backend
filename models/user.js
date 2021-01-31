const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

//const {collectionSchema} = require('./collection')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        minlength: 2,
        maxlength: 255,
        required: true
    },

    email: {
        type: String,
        unique: true,
        minglength: 6,
        maxlength: 255
    },

    password: {
        type: String,
        required: true,
        minglength: 6,
        maxlength: 255
    },

    collections: {
        type: Array
    }
})

userSchema.methods.generateToken = function () {
    return jwt.sign({_id: this._id, email: this.email}, 'provisorio')
}

const User = mongoose.model('User', userSchema)

function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(255).required(),
        email: Joi.string().min(6).max(255).required(),
        password: Joi.string().min(6).max(255).required()
    })

    return schema.validate(user)
}

exports.User = User,
exports.validate = validateUser
