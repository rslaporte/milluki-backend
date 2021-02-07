const request = require('supertest')
const mongoose = require('mongoose')
const { Genre } = require('../../models/genre')

let server

describe('GET /', () => {
    beforeEach(() => {
        // eslint-disable-next-line global-require
        server = require('../../index')
    })

    afterEach(async () => {
        await Genre.deleteMany({})
        server.close()
    })

    it('should return all genres in database', async () => {
        await Genre.collection.insertMany([
            { name: 'genre1' },
            { name: 'genre2' },
        ])
        const res = await request(server).get('/api/genres')

        expect(res.status).toBe(200)
        expect(res.body.length).toBe(2)
        expect(res.body.some(genre => genre.name === 'genre1')).toBeTruthy()
    })
})

describe('GET /:id', () => {
    beforeEach(() => {
        // eslint-disable-next-line global-require
        server = require('../../index')
    })

    afterEach(async () => {
        await Genre.deleteMany({})
        server.close()
    })

    it('should return status 404 if the id is invalid', async () => {
        const res = await request(server).get(`/api/genres/1`)

        expect(res.status).toBe(404)
    })

    it('should return status 404 with the genre was not found', async () => {
        const id = mongoose.Types.ObjectId().toHexString()

        const res = await request(server).get(`/api/genres/${id}`)
        expect(res.status).toBe(404)
    })

    it('should return the genre with the given id', async () => {
        const genre = new Genre({ name: 'genre1' })
        await genre.save()

        const res = await request(server).get(`/api/genres/${genre._id}`)

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('_id')
        expect(res.body).toHaveProperty('name', 'genre1')
    })
})

describe('POST /', () => {
    beforeEach(() => {
        // eslint-disable-next-line global-require
        server = require('../../index')
    })

    afterEach(async () => {
        await Genre.deleteMany({})
        server.close()
    })

    it('should return 400 if the genre is not valid', async () => {
        const res = await request(server)
            .post('/api/genres')
            .send({ name: '123' })

        expect(res.status).toBe(400)
    })

    it('should return 400 if the genre already exists', async () => {
        const genre = new Genre({ name: 'genre1' })
        await genre.save()

        const res = await request(server)
            .post('/api/genres')
            .send({ name: 'genre1' })

        expect(res.status).toBe(400)
    })

    it('should return 201 if the genre was created', async () => {
        const res = await request(server)
            .post('/api/genres')
            .send({ name: 'genre1' })

        expect(res.status).toBe(201)
    })

    it('should save the genre in database', async () => {
        await request(server).post('/api/genres').send({ name: 'genre1' })

        const genre = await Genre.find({ name: 'genre1' })

        expect(genre[0]).not.toBeNull()
        expect(genre[0]).toHaveProperty('name', 'genre1')
        expect(genre[0]).toHaveProperty('_id')
    })
})

describe('PUT /:id', () => {
    let genreId

    beforeEach(async () => {
        // eslint-disable-next-line global-require
        server = require('../../index')

        const genre = new Genre({ name: 'genre1' })
        await genre.save()

        genreId = genre._id
    })

    afterEach(async () => {
        await Genre.deleteMany({})
        server.close()
    })

    it('should return 400 if the genre is not valid', async () => {
        const res = await request(server)
            .put(`/api/genres/${genreId}`)
            .send({ name: '123' })

        expect(res.status).toBe(400)
    })

    it('should return 404 if the genre does not exists', async () => {
        genreId = mongoose.Types.ObjectId().toHexString()

        const res = await request(server)
            .put(`/api/genres/${genreId}`)
            .send({ name: 'genre2' })

        expect(res.status).toBe(404)
    })

    it('should update the valid genre in the database', async () => {
        const res = await request(server)
            .put(`/api/genres/${genreId}`)
            .send({ name: 'genre2' })

        const newGenre = await Genre.find({ name: 'genre2' })

        expect(res.status).toBe(200)
        expect(newGenre[0]).toHaveProperty('_id')
        expect(newGenre[0]).toHaveProperty('name', 'genre2')
    })
})

describe('DELETE /:id', () => {
    let genreId

    beforeEach(async () => {
        // eslint-disable-next-line global-require
        server = require('../../index')

        const genre = new Genre({ name: 'genre1' })
        await genre.save()

        genreId = genre._id
    })

    afterEach(async () => {
        await Genre.deleteMany({})
        server.close()
    })

    it('should return 404 if the genre id was not found', async () => {
        genreId = mongoose.Types.ObjectId().toHexString()

        const res = await request(server).delete(`/api/genres/${genreId}`)

        expect(res.status).toBe(404)
    })

    it('should delete the genre from the database', async () => {
        const res = await request(server).delete(`/api/genres/${genreId}`)

        const deletedGenre = await Genre.findById(genreId)

        expect(res.status).toBe(200)
        expect(deletedGenre).toBeNull()
    })
})
