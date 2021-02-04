const express = require('express')
const collections = require('../routes/collections')
const books = require('../routes/books')
const users = require('../routes/users')
const auth = require('../routes/auth')
const genres = require('../routes/genres')

module.exports = app => {
    app.use(express.json())
    app.use('/api/collections', collections)
    app.use('/api/books', books)
    app.use('/api/users', users)
    app.use('/api/auth', auth)
    app.use('/api/genres', genres)
}
