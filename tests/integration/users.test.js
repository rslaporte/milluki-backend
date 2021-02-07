const request = require('supertest')
const bcrypt = require('bcrypt')
const { User } = require('../../models/user')

let server

describe('GET /', () => {
    beforeEach(() => {
        server = require('../../index')
    })

    afterEach(async () => {
        await User.deleteMany({})
        server.close()
    })

    it("should return the current user's name and password", async () => {
        const user = new User({
            name: 'name',
            email: 'email@email.com',
            password: 'password',
        })

        await user.save()

        const token = user.generateToken()

        const res = await request(server)
            .get('/api/users')
            .set('x-auth-token', token)

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('_id')
        expect(res.body).toHaveProperty('name', 'name')
        expect(res.body).toHaveProperty('email', 'email@email.com')
        expect(res.body).not.toHaveProperty('password')
    })
})

describe('POST /', () => {
    beforeEach(() => {
        server = require('../../index')
    })

    afterEach(async () => {
        await User.deleteMany({})
        server.close()
    })

    it('should return 400 if a invalid user was entered', async () => {
        const user = new User({
            name: 'name',
            email: 'email@email.com',
        }) // the password were required

        const res = await request(server).post('/api/users').send(user)

        expect(res.status).toBe(400)
    })

    it('should return 400 if the user is already registered', async () => {
        const user = new User({
            name: 'name',
            email: 'email@email.com',
            password: 'password',
        })

        await user.save()

        const res = await request(server).post('/api/users').send({
            name: 'name',
            email: 'email@email.com',
            password: 'password',
        })

        expect(res.status).toBe(400)
    })

    it('should save the created user in the database', async () => {
        const user = {
            name: 'name',
            email: 'email@email.com',
            password: 'password',
        }

        const res = await request(server).post('/api/users').send(user)

        const hashedUser = await User.findOne({ email: res.body.email })

        expect(hashedUser).not.toBeNull()
        expect(hashedUser).toHaveProperty('_id')
        expect(hashedUser).toHaveProperty('name', 'name')
        expect(hashedUser).toHaveProperty('email', 'email@email.com')
        expect(hashedUser).toHaveProperty('password')
    })

    it('should hash the password', async () => {
        const user = {
            name: 'nome',
            email: 'email@email.com',
            password: 'password',
        }

        const res = await request(server).post('/api/users').send(user)

        const createdUser = await User.findOne({ email: res.body.email })
        const hashed = await bcrypt.compare(user.password, createdUser.password)

        expect(hashed).toBeTruthy()
    })

    it('should send the user generated token in the header', async () => {
        const user = {
            name: 'nome',
            email: 'email@email.com',
            password: 'password',
        }

        const res = await request(server).post('/api/users').send(user)

        expect(res.header['x-auth-token']).not.toBe('')
    })

    it("should send created user's info without password", async () => {
        const user = {
            name: 'nome',
            email: 'email@email.com',
            password: 'password',
        }

        const res = await request(server).post('/api/users').send(user)

        expect(res.status).toBe(201)
        expect(res.body).toHaveProperty('_id')
        expect(res.body).toHaveProperty('name')
        expect(res.body).toHaveProperty('email')
        expect(res.body).not.toHaveProperty('password')
    })
})
