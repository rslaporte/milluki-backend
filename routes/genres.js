const express = require('express')

const router = express.Router()

const { Genre, validate } = require('../models/genre')

const validateObjectId = require('../middleware/validateObjectId')

// eslint-disable-next-line no-unused-vars
router.get('/', async (req, res) => {
    const genres = await Genre.find()
    return res.status(200).send(genres)
})

router.get('/:id', validateObjectId, async (req, res) => {
    const genre = await Genre.findById(req.params.id)
    if (!genre)
        return res.status(404).send('The genre with the given id was not found')

    return res.status(200).send(genre)
})

router.post('/', async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let genre = await Genre.findOne({ name: req.body.name })
    if (genre) return res.status(400).send('Genre already registered.')

    genre = new Genre({
        name: req.body.name,
    })

    await genre.save()
    return res.status(201).send(genre)
})

router.put('/:id', validateObjectId, async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    const genre = await Genre.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        new: true,
    })

    if (!genre)
        return res.status(404).send('The genre with the given id was not found')

    // need to return the updated genre
    return res.status(200).send(genre)
})

router.delete('/:id', validateObjectId, async (req, res) => {
    const genre = await Genre.findByIdAndRemove(req.params.id)

    if (!genre)
        return res.status(404).send('The genre with the given id was not found')

    return res.status(200).send(genre)
})

module.exports = router
