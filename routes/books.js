const _ = require('lodash')

const express = require('express')
const { Book, validate } = require('../models/book')

const router = express.Router()

router.get('/', async (req, res) => {
    const books = await Book.find()
    return res.status(200).send(books)
})

router.get('/:id', async (req, res) => {
    const book = await Book.findById(req.params.id)
    if (!book)
        return res.status(404).send('The book with the given id was not found')

    return res.status(200).send(book)
})

router.post('/', async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send('Error:', error.details[0].message)

    const book = new Book(
        _.pick(req.body, [
            'title',
            'author',
            'publisher',
            'year',
            'genre',
            'volume',
            'pageNumber',
        ]),
    )

    await book.save()
    return res.status(201).send(book)
})

router.put('/:id', async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send('Error:', error.details[0].message)

    // How to remove properties?
    req.body.new = true

    const book = await Book.findByIdAndUpdate(req.params.id, req.body)
    if (!book)
        return res.status(400).send('The book with the given id was not found')

    // How to send the new book?
    return res.status(200).send(book)
})

router.delete('/:id', async (req, res) => {
    const book = await Book.findByIdAndRemove(req.params.id)
    if (!book)
        return res.status(400).send('The book with the given id was not found')

    return res.status(200).send(book)
})

module.exports = router
