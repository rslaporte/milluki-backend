const request = require('supertest')
const mongoose = require('mongoose')
const { Book } = require('../../models/book')

let server

describe('GET /', () => {
    beforeEach(() => {
        // eslint-disable-next-line global-require
        server = require('../../index')
    })

    afterEach(async () => {
        await Book.deleteMany({})
        server.close()
    })

    it('should return all books in database', async () => {
        await Book.collection.insertMany([
            {
                title: 'book1',
                author: 'author1',
                year: 2000,
                publisher: 'publisher1',
                genre: 'genre1',
                volume: 1,
                pageNumber: 100,
            },
            {
                title: 'book2',
                author: 'author2',
                year: 2001,
                publisher: 'publisher2',
                genre: 'genre2',
                volume: 2,
                pageNumber: 100,
            },
        ])
        const res = await request(server).get('/api/books')

        expect(res.status).toBe(200)
        expect(res.body.length).toBe(2)
        expect(res.body.some(book => book.title === 'book1')).toBeTruthy()
        expect(res.body.some(book => book.title === 'book2')).toBeTruthy()
    })
})

describe('GET /:id', () => {
    beforeEach(() => {
        // eslint-disable-next-line global-require
        server = require('../../index')
    })

    afterEach(async () => {
        await Book.deleteMany({})
        server.close()
    })

    it('should return status 404 if the id is invalid', async () => {
        const res = await request(server).get(`/api/books/1`)

        expect(res.status).toBe(404)
    })

    it('should return status 404 with the book was not found', async () => {
        const id = mongoose.Types.ObjectId().toHexString()

        const res = await request(server).get(`/api/books/${id}`)
        expect(res.status).toBe(404)
    })

    it('should return the book with the given id', async () => {
        const book = new Book({ title: 'book1', author: 'author1' })
        await book.save()

        const res = await request(server).get(`/api/books/${book._id}`)

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('_id')
        expect(res.body).toHaveProperty('title', 'book1')
        expect(res.body).toHaveProperty('author', 'author1')
    })
})

describe('POST /', () => {
    beforeEach(() => {
        // eslint-disable-next-line global-require
        server = require('../../index')
    })

    afterEach(async () => {
        await Book.deleteMany({})
        server.close()
    })

    it('should return 400 if the book was not valid', async () => {
        const res = await request(server)
            .post('/api/books')
            .send({ author: 'author1' }) // title is required

        expect(res.status).toBe(400)
    })

    it('should return 201 if the book was created', async () => {
        const res = await request(server)
            .post('/api/books')
            .send({ title: 'book1', author: 'author1' })

        expect(res.status).toBe(201)
    })

    it('should save the book in database', async () => {
        await request(server)
            .post('/api/books')
            .send({ title: 'book1', author: 'author1' })

        const book = await Book.find({ title: 'book1' })

        expect(book[0]).not.toBeNull()
        expect(book[0]).toHaveProperty('_id')
        expect(book[0]).toHaveProperty('title', 'book1')
        expect(book[0]).toHaveProperty('author', 'author1')
    })
})

describe('PUT /:id', () => {
    let bookId

    beforeEach(async () => {
        // eslint-disable-next-line global-require
        server = require('../../index')

        const book = new Book({ title: 'book1', author: 'author1' })
        await book.save()

        bookId = book._id
    })

    afterEach(async () => {
        await Book.deleteMany({})
        server.close()
    })

    it('should return 400 if the book is not valid', async () => {
        const res = await request(server)
            .put(`/api/books/${bookId}`)
            .send({ author: 'author1' }) // title is required

        expect(res.status).toBe(400)
    })

    it('should return 404 if the book does not exists', async () => {
        bookId = mongoose.Types.ObjectId().toHexString()

        const res = await request(server)
            .put(`/api/books/${bookId}`)
            .send({ title: 'book2' })

        expect(res.status).toBe(404)
    })

    it('should update the valid book in the database', async () => {
        const res = await request(server)
            .put(`/api/books/${bookId}`)
            .send({ title: 'book2' })

        const newBook = await Book.find({ title: 'book2' })

        expect(res.status).toBe(200)
        expect(newBook[0]).toHaveProperty('_id')
        expect(newBook[0]).toHaveProperty('title', 'book2')
    })
})

describe('DELETE /:id', () => {
    let bookId

    beforeEach(async () => {
        // eslint-disable-next-line global-require
        server = require('../../index')

        const book = new Book({ title: 'book1', author: 'author1' })
        await book.save()

        bookId = book._id
    })

    afterEach(async () => {
        await Book.deleteMany({})
        server.close()
    })

    it('should return 404 if the book id was not found', async () => {
        bookId = mongoose.Types.ObjectId().toHexString()

        const res = await request(server).delete(`/api/books/${bookId}`)

        expect(res.status).toBe(404)
    })

    it('should delete the book from the database', async () => {
        const res = await request(server).delete(`/api/books/${bookId}`)

        const deletedBook = await Book.findById(bookId)

        expect(res.status).toBe(200)
        expect(deletedBook).toBeNull()
    })
})
