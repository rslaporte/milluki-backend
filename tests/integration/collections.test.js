const request = require('supertest')
const mongoose = require('mongoose')
const { Collection } = require('../../models/collection')
const { User } = require('../../models/user')
const { Book } = require('../../models/book')

let server

describe('GET /', () => {
    beforeEach(() => {
        server = require('../../index')
    })
    afterEach(async () => {
        await User.deleteMany({})
        server.close()
    })

    it('should return status 400 if the user has not logged in', async () => {
        const token = new User().generateToken()

        const res = await request(server)
            .get('/api/collections')
            .set('x-auth-token', token)

        expect(res.status).toBe(400)
    })

    it("should return the logged user's collection", async () => {
        const user = new User({
            name: 'name',
            email: 'email@email.com',
            password: 'password',
            collections: [
                { name: 'name1' },
                { name: 'name2', isPublic: false },
            ],
        })

        const user2 = new User({
            name: 'name2',
            email: 'email2@email.com',
            password: 'password',
            collections: [{ name: 'name3' }],
        })

        await user.save()
        await user2.save()

        const token = user.generateToken()

        const res = await request(server)
            .get('/api/collections')
            .set('x-auth-token', token)

        expect(res.status).toBe(200)
        expect(res.body.length).toBe(2)
        expect(
            res.body.some(collection => collection.isPublic === false),
        ).toBeTruthy()
        expect(
            res.body.some(collection => collection.isPublic === true),
        ).toBeFalsy()
    })
})

describe('GET /: id', () => {
    beforeEach(() => {
        server = require('../../index')
    })
    afterEach(async () => {
        await User.deleteMany({})
        await Collection.deleteMany({})
        server.close()
    })

    it('should return status 404 if the collection is not found', async () => {
        const collectionId = mongoose.Types.ObjectId().toHexString()
        const token = new User().generateToken()

        const res = await request(server)
            .get(`/api/collections/${collectionId}`)
            .set('x-auth-token', token)

        expect(res.status).toBe(404)
    })

    it('should return the collection if its public or belongs to the logged user', async () => {
        const user = new User({
            name: 'name',
            email: 'email@email.com',
            password: 'password',
        })

        const userCollection = new Collection({
            name: 'collection1',
            isPublic: false,
            owner: 'email@email.com',
        })

        const nonUserCollection = new Collection({
            name: 'collection2',
            isPublic: false,
            owner: 'email2@email.com',
        })

        await user.save()
        await userCollection.save()
        await nonUserCollection.save()

        const token = user.generateToken()

        let res = await request(server)
            .get(`/api/collections/${userCollection._id}`)
            .set('x-auth-token', token)

        expect(res.status).toBe(200)
        expect(res.body._id).toBe(userCollection._id.toHexString())

        res = await request(server)
            .get(`/api/collections/${nonUserCollection._id}`)
            .set('x-auth-token', token)

        expect(res.status).toBe(403)
        expect(res.body).toMatchObject({})

        nonUserCollection.isPublic = true
        await nonUserCollection.save()

        res = await request(server)
            .get(`/api/collections/${nonUserCollection._id}`)
            .set('x-auth-token', token)

        expect(res.status).toBe(200)
        expect(res.body._id).toBe(nonUserCollection._id.toHexString())
    })
})

describe('POST /', () => {
    beforeEach(() => {
        server = require('../../index')
    })

    afterEach(async () => {
        await User.deleteMany({})
        await Collection.deleteMany({})
        server.close()
    })

    it('should return status 400 if the collection is invalid', async () => {
        const user = new User({
            name: 'name',
            email: 'email@email.com',
            password: 'password',
        })

        await user.save()

        const token = user.generateToken()

        const res = await request(server)
            .post('/api/collections')
            .set('x-auth-token', token)
            .send({ isPublic: false }) // name is required

        expect(res.status).toBe(400)
    })

    it('should return status 401 if the user is not logged', async () => {
        const token = new User().generateToken()

        const res = await request(server)
            .post('/api/collections')
            .set('x-auth-token', token)
            .send({ name: 'collection', isPublic: false }) // name is required

        expect(res.status).toBe(401)
    })

    it('should save the valid collection in the database', async () => {
        const user = new User({
            name: 'name',
            email: 'email@email.com',
            password: 'password',
        })

        await user.save()

        const token = user.generateToken()

        const res = await request(server)
            .post('/api/collections')
            .set('x-auth-token', token)
            .send({ name: 'collection', isPublic: false })

        const collection = await Collection.find({ name: 'collection' })

        expect(res.status).toBe(201)
        expect(collection).not.toBeNull()
        expect(res.body._id).toBe(collection[0]._id.toHexString())
    })

    it('should store the collection to the current user', async () => {
        let user = new User({
            name: 'name',
            email: 'email@email.com',
            password: 'password',
        })

        await user.save()

        const token = user.generateToken()

        const res = await request(server)
            .post('/api/collections')
            .set('x-auth-token', token)
            .send({ name: 'collection', isPublic: false })

        user = await User.find({ email: user.email })

        expect(res.status).toBe(201)
        expect(res.body._id).toBe(user[0].collections[0].toHexString())
    })
})

describe('POST /:id', () => {
    beforeEach(() => {
        server = require('../../index')
    })

    afterEach(async () => {
        await User.deleteMany({})
        await Collection.deleteMany({})
        await Book.deleteMany({})
        server.close()
    })

    it('should return status 400 if the book id is invalid', async () => {
        const token = new User().generateToken()
        const collectionId = mongoose.Types.ObjectId().toHexString()

        const res = await request(server)
            .post(`/api/collections/${collectionId}`)
            .set('x-auth-token', token)
            .send('')

        expect(res.status).toBe(400)
    })

    it('should return status 404 if the collection was not found', async () => {
        const token = new User().generateToken()
        const collectionId = mongoose.Types.ObjectId().toHexString()
        const bookId = mongoose.Types.ObjectId().toHexString()

        const res = await request(server)
            .post(`/api/collections/${collectionId}`)
            .set('x-auth-token', token)
            // eslint-disable-next-line object-shorthand
            .send({ bookId: bookId })

        expect(res.status).toBe(404)
    })

    it('should return status 404 if the book was not found', async () => {
        const user = new User({
            name: 'name',
            email: 'email@email.com',
            password: 'password',
        })

        const collection = new Collection({
            name: 'name',
            owner: 'email@email.com',
        })

        await user.save()
        await collection.save()

        const token = user.generateToken()
        const bookId = mongoose.Types.ObjectId().toHexString()

        const res = await request(server)
            .post(`/api/collections/${collection._id}`)
            .set('x-auth-token', token)
            // eslint-disable-next-line object-shorthand
            .send({ bookId: bookId })

        expect(res.status).toBe(404)
    })

    it('should return status 400 if the requested collection does not belongs to the logged user', async () => {
        const token = new User().generateToken()
        const collection = new Collection({
            name: 'name',
            owner: 'email@email.com',
        })

        await collection.save()

        const bookId = mongoose.Types.ObjectId().toHexString()

        const res = await request(server)
            .post(`/api/collections/${collection._id}`)
            .set('x-auth-token', token)
            // eslint-disable-next-line object-shorthand
            .send({ bookId: bookId })

        expect(res.status).toBe(400)
    })

    it('should create the collection', async () => {
        const user = new User({
            name: 'name',
            email: 'email@email.com',
            password: 'password',
        })

        const collection = new Collection({
            name: 'name',
            owner: 'email@email.com',
        })

        const book = new Book({
            title: 'book',
            author: 'author',
        })

        await collection.save()
        await user.save()
        await book.save()

        const token = user.generateToken()
        const bookId = book._id

        const res = await request(server)
            .post(`/api/collections/${collection._id}`)
            .set('x-auth-token', token)
            // eslint-disable-next-line object-shorthand
            .send({ bookId: bookId })

        const collectionBooks = await Collection.find({
            owner: user.email,
        }).select('book')

        expect(res.status).toBe(201)
        expect(collectionBooks).not.toBeNull()
        expect(collectionBooks[0].book.length).toBe(1)
    })
})

describe('PUT /:id', () => {
    beforeEach(() => {
        server = require('../../index')
    })

    afterEach(async () => {
        await User.deleteMany({})
        await Collection.deleteMany({})
        server.close()
    })

    it('should return status 400 if the collection is invalid', async () => {
        const token = new User().generateToken()
        const collectionId = mongoose.Types.ObjectId().toHexString()

        const res = await request(server)
            .put(`/api/collections/${collectionId}`)
            .set('x-auth-token', token)
            .send('')

        expect(res.status).toBe(400)
    })

    it('should return status 404 if the collection was not found', async () => {
        const token = new User().generateToken()
        const collectionId = mongoose.Types.ObjectId().toHexString()

        const res = await request(server)
            .put(`/api/collections/${collectionId}`)
            .set('x-auth-token', token)
            // eslint-disable-next-line object-shorthand
            .send({ name: 'new_name' })

        expect(res.status).toBe(404)
    })

    it('should return status 400 if the requested collection does not belongs to the logged user', async () => {
        const collection = new Collection({
            name: 'name',
            owner: 'email@email.com',
        })

        await collection.save()
        const token = new User().generateToken()

        const res = await request(server)
            .put(`/api/collections/${collection._id}`)
            .set('x-auth-token', token)
            // eslint-disable-next-line object-shorthand
            .send({ name: 'new_name' })

        expect(res.status).toBe(400)
    })

    it('should update the privacy of the collection', async () => {
        let collection = new Collection({
            name: 'name',
            owner: 'email@email.com',
        })

        await collection.save()

        const token = new User({ email: 'email@email.com' }).generateToken()

        await request(server)
            .put(`/api/collections/${collection._id}`)
            .set('x-auth-token', token)
            // eslint-disable-next-line object-shorthand
            .send({ name: 'new_name' })

        collection = await Collection.findById(collection._id)

        expect(collection).toHaveProperty('isPublic', true)
    })

    it('should update the collection', async () => {
        let collection = new Collection({
            name: 'name',
            owner: 'email@email.com',
        })

        await collection.save()

        const token = new User({ email: 'email@email.com' }).generateToken()

        const res = await request(server)
            .put(`/api/collections/${collection._id}`)
            .set('x-auth-token', token)
            // eslint-disable-next-line object-shorthand
            .send({ name: 'new_name', isPublic: false })

        collection = await Collection.findById(collection._id)

        expect(res.status).toBe(200)
        expect(collection).toHaveProperty('name', 'new_name')
        expect(collection).toHaveProperty('isPublic', false)
    })
})

describe('DELETE /:id', () => {
    beforeEach(() => {
        server = require('../../index')
    })

    afterEach(async () => {
        await User.deleteMany({})
        await Collection.deleteMany({})
        server.close()
    })

    it('should return status 404 if the collection was not found', async () => {
        const token = new User().generateToken()
        const collectionId = mongoose.Types.ObjectId().toHexString()

        const res = await request(server)
            .delete(`/api/collections/${collectionId}`)
            .set('x-auth-token', token)

        expect(res.status).toBe(404)
    })

    it('should return status 400 if the requested collection does not belongs to the logged user', async () => {
        const collection = new Collection({
            name: 'name',
            owner: 'email@email.com',
        })

        await collection.save()
        const token = new User().generateToken()

        const res = await request(server)
            .delete(`/api/collections/${collection._id}`)
            .set('x-auth-token', token)

        expect(res.status).toBe(400)
    })

    it('should delete the collection', async () => {
        let collection = new Collection({
            name: 'name',
            owner: 'email@email.com',
        })

        await collection.save()
        const token = new User({ email: 'email@email.com' }).generateToken()

        const res = await request(server)
            .delete(`/api/collections/${collection._id}`)
            .set('x-auth-token', token)

        collection = await Collection.findById(collection._id)

        expect(res.status).toBe(200)
        expect(collection).toBeNull()
    })
})
