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

    book: {
        type: [bookSchema]
    }
})

const Collection = mongoose.model('Collection', collectionSchema)

function validateCollection(collection) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(255).required(),
        //category: Joi.string().required(),
        //genre: Joi.objectid()
    })

    return schema.validate(collection)
}

function validateBook(book) {
    const schema = Joi.object({
        bookId: Joi.objectId().required()
    })

    return schema.validate(book)
}

exports.Collection = Collection
exports.collectionSchema = collectionSchema
exports.validate = validateCollection
exports.validateBook = validateBook