const mongoose = require('mongoose')
const Joi = require('joi')

const genreSchema = mongoose.Schema({
    name: {
        type: String,
        minglength: 4,
        maxlength: 15,
        unique: true,
        required: true
    }
})

const Genre = mongoose.model('genre', genreSchema)

function validateGenre(genre) {
    const schema = Joi.object({
        name: Joi.string().min(4).max(15).required(),
    })

    return schema.validate(genre)
}

exports.Genre = Genre
exports.genreSchema = genreSchema
exports.validate = validateGenre