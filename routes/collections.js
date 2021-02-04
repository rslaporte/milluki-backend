const express = require('express')

const router = express.Router()

const auth = require('../middleware/auth')
const validateObjectId = require('../middleware/validateObjectId')
const { Book, validateBookId } = require('../models/book')
const { Collection, validate } = require('../models/collection')
const { User } = require('../models/user')

router.get('/', auth, async (req, res) => {
    const user = await User.findById(req.user._id)
    if (!user)
        return res
            .status(400)
            .send('You need to login to check your collections')

    return res.status(200).send(user.collections)
})

router.get('/:id', [auth, validateObjectId], async (req, res) => {
    const collection = await Collection.findById(req.params.id)
    if (!collection)
        return res
            .status(404)
            .send('The collection with the given id was not found')

    if (collection.owner === req.user.email || collection.isPublic)
        return res.status(200).send(collection)

    return res.status(403).send('This collection is private')
})

router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    const user = await User.findById(req.user._id)
    if (!user) return res.status(401).send('You need to login first')

    const collection = new Collection({
        name: req.body.name,
        isPublic: req.body.isPublic,
        owner: req.user.email,
    })

    user.collections.push(collection._id)

    await collection.save()
    await user.save()

    return res.status(201).send(collection)
})

router.post('/:id', [auth, validateObjectId], async (req, res) => {
    const { error } = validateBookId(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    const collection = await Collection.findById(req.params.id)
    if (!collection)
        return res
            .status(404)
            .send('The collection with the given id was not found.')

    if (collection.owner !== req.user.email)
        return res
            .status(400)
            .send("Only the collection's owner can add books to it")

    const book = await Book.findById(req.body.bookId)
    if (!book)
        return res.status(404).send('The book with the given id was not found.')

    collection.book.push(book)

    await collection.save()

    return res.status(201).send(collection)
})

// Should books added into the collection here instead of by post route /:id ?
router.put('/:id', [auth, validateObjectId], async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    const collection = await Collection.findById(req.params.id)
    if (!collection)
        return res
            .status(404)
            .send('The collection with the given id was not found.')

    if (collection.owner !== req.user.email)
        return res
            .status(400)
            .send("Only the collection's owner can add books to it")

    collection.name = req.body.name
    collection.isPublic =
        req.body.isPublic !== undefined
            ? req.body.isPublic
            : collection.isPublic

    await collection.save()

    return res.status(200).send(collection)
})

router.delete('/:id', [auth, validateObjectId], async (req, res) => {
    let collection = await Collection.findById(req.params.id)

    if (!collection)
        return res
            .status(404)
            .send('The collection with the given id was not found.')

    if (collection.owner !== req.user.email)
        return res
            .status(400)
            .send('The collection with the given id was not found.')

    collection = await Collection.findByIdAndRemove(req.params.id)
    return res.status(200).send(collection)
})

module.exports = router
