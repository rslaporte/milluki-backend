const express = require('express')
const router = express.Router()
const _ = require('lodash')

const {Book, validate} = require('../models/book')
const {Collection} = require('../models/collection')

// router.get('/', async (res, req) => {
//     const books = await Book.find()
//     res.status(200).send(books)
// })

// router.get('/:id', async (req, res) => {
//     const book = await Book.findById(req.body.id)
//     if (!book) return res.status(404).send('The book with the given id was not found')

//     res.status(200).send(book)
// })

router.post('/:collectionId', async (req, res) => {
    const collection = await Collection.findById(req.params.collectionId)
    if (!collection) res.status(404).send('The collection with the given id was not found')

    const {error} = validate(req.body)
    if (error) return res.status(400).send('Error:', error.details[0].message)
    

    //Look for the best way to check if some book already is on some collection

    // collection.book.forEach(book => {
    //     if (book.title == req.body.title && book.volume == req.body.volume) {
    //         return res.status(400).send('This book was already registered in this collection.')
    //     }
    // })

    //let book = await collection.book.find().and([{title: req.body.title}, {volume: req.body.volume}])
    //if(book) return res.status(400).send('This book was already registered in this collection.')

    const book = new Book(_.pick(req.body, 'title', 'author', 'publisher', 'year', 'genre', 'volume', 'pageNumber'))

    collection.book.push({
        _id: book._id,
        title: book.title,
        volume: book.volume
    })

    //Create a task for this
    await book.save()
    await collection.save()

    res.status(201).send(book)
})

module.exports = router