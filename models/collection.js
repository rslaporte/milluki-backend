const mongoose = require('mongoose')
const Joi = require('joi')

const {bookSchema} = require('./book')

const collectionSchema = mongoose.Schema({
    name: {
        type: String,
        minlength: 2,
        maxlength: 255,
        required: true
    },

    owner: {
        type: String,
        minlength: 2,
        maxlength: 255,
    },

    isPublic: {
        type: Boolean,
        default: true
    },

    book: {
        type: [bookSchema]
    }
})

const Collection = mongoose.model('Collection', collectionSchema)

function validateCollection(collection) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(255).required(),
        isPublic: Joi.boolean()
    })

    return schema.validate(collection)
}

exports.Collection = Collection
exports.collectionSchema = collectionSchema
exports.validate = validateCollection
