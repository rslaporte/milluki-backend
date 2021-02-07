const request = require('supertest')
const jwt = require('jsonwebtoken')
const config = require('config')
const bcrypt = require('bcrypt')
const { User } = require('../../models/user')

describe('POST /', () => {
    let server

    beforeEach(() => {
        server = require('../../index')
    })

    afterEach(async () => {
        await User.deleteMany({})
        server.close()
    })

    it('should return status 400 if the user validation fails', async () => {
        const auth = { email: 'email@email.com' } // it has to have password

        const res = await request(server).post('/api/auth').send(auth)

        expect(res.status).toBe(400)
    })

    it('should return status 400 if the User does not exist', async () => {
        const auth = { email: 'email@email.com', password: 'password' }

        const res = await request(server).post('/api/auth').send(auth)

        expect(res.status).toBe(400)
    })

    it('should return status 400 if the password is not valid', async () => {
        const auth = { email: 'email@email.com', password: 'password' }

        const user = new User({
            name: 'name1',
            email: 'email@email.com',
            password: 'password1',
        })

        await user.save()

        const res = await request(server).post('/api/auth').send(auth)

        expect(res.status).toBe(400)
    })

    it('it should generate a valid JWT', async () => {
        const salt = await bcrypt.genSalt(10)
        const password = await bcrypt.hash('password', salt)

        const user = new User({
            name: 'name',
            email: 'email@email.com',
            password,
        })

        await user.save()

        const auth = { email: user.email, password: 'password' }
        const token = jwt.sign(
            { _id: user._id, email: user.email },
            config.get('jwtPrivateKey'),
        )

        const res = await request(server).post('/api/auth').send(auth)

        expect(res.status).toBe(200)
        expect(res.text).toBe(token)
    })
})
