const express = require('express')
const collections = require('../routes/collections')
const books = require('../routes/books')

module.exports = function (app) {
    app.use(express.json())
    app.use('/api/collections', collections)
    app.use('/api/collections', books)
}
