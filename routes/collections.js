const express = require('express')
const router = express.Router()
const _ = require('lodash')

const {Collection, validate} = require('../models/collection')

router.get('/', async (req, res) => {
    const collections = await Collection.find()
    res.status(200).send(collections)
})

router.get('/:id', async (req, res) => {
    const collection = await Collection.findById(req.params.id)
    if (!collection) return res.status(404).send('The collection with the given id was not found')

    res.status(200).send(collection)
})

router.post('/', async (req, res) => {
    const {error} = validate(req.body)
    if (error) return res.status(400).send('Error:', error.details[0].message)

    let collection = await Collection.findOne({name: req.body.name})
    if(collection) return res.status(400).send('Collection already registered.')

    collection = new Collection({
        name: req.body.name
    })

    await collection.save()
    res.status(201).send(collection)
})

router.put('/:id', async (req, res) => {
    const {error} = validate(req.body)
    if (error) return res.status(400).send('Error:', error.details[0].message)

    const collection = await Collection.findByIdAndUpdate(req.params.id, {name: req.body.name, new: true})
    if (!collection) return res.status(400).send('The collection with the given id was not found')
    
    res.status(200).send(collection)
})

router.delete('/:id', async (req, res) => {
    const collection = await Collection.findByIdAndRemove(req.params.id)
    if (!collection) return res.status(400).send('The collection with the given id was not found')

    res.status(200).send(collection)
})

module.exports = router