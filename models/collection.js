const mongoose = require('mongoose')
const Joi = require('joi')

const {bookSchema} = require('./book')

const collectionSchema = mongoose.Schema({
    name: {
        type: String,
        minlength: 2,
        maxlength: 50,
        required: true
    },

    book: {
        type: [bookSchema]
    }

})

const Collection = mongoose.model('collection', collectionSchema)

function validateCollection(collection) {
    const schema = Joi.object({
        name: Joi.string().min(4).max(15).required(),
        //category: Joi.string().required(),
        //genre: Joi.objectid()
    })

    return schema.validate(collection)
}

exports.Collection = Collection
exports.collectionSchema = collectionSchema
exports.validate = validateCollection