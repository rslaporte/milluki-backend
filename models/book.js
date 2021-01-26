const mongoose = require('mongoose')
const Joi = require('joi')

const bookSchema = mongoose.Schema({
    title: {
        type: String,
        minlength: 2,
        maxlength: 50,
        required: true
    },

    author: {
        type: String,
        minlength: 2,
        maxlength: 50,
    },

    publisher: {
        type: String,
        minlength: 2,
        maxlength: 5,
    },

    year: {
        type: Number
    },

    genre: {
        type: String,
        minlength: 2,
        maxlength: 50
    },

    volume: {
        type: Number
    },

    pageNumber: {
        type: Number
    },
})

const Book = mongoose.model('book', bookSchema)

function validateBook(book) {
    const schema = Joi.object({
        title: Joi.string().min(2).max(50).required(),
        author: Joi.string().min(2).max(50),
        publisher: Joi.string().min(2).max(50),
        year: Joi.number(),
        genre: Joi.string().min(2).max(50),
        volume: Joi.number(),
        pageNumber: Joi.number()
    })

    return schema.validate(book)
}

exports.Book = Book
exports.bookSchema = bookSchema
exports.validate = validateBook