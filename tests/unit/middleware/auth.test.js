const mongoose = require('mongoose')
const { User } = require('../../../models/user')
const auth = require('../../../middleware/auth')

describe('MIDDLEWARE auth', () => {
    it('should return status 401 if no token were provided', () => {
        const req = {
            header: jest.fn(),
        }
        const res = {
            status(s) {
                this.status = s
                return this
            },
            send: jest.fn(),
        }

        const next = jest.fn()

        auth(req, res, next)
        expect(res.status).toBe(401)
    })

    it('should return status 400 if the token cannot be decoded', () => {
        const req = {
            header: jest.fn().mockReturnValue('1abc'),
        }
        const res = {
            status(s) {
                this.status = s
                return this
            },
            send: jest.fn(),
        }

        const next = jest.fn()

        auth(req, res, next)
        expect(res.status).toBe(400)
    })

    it('should populate req.user with the decoded valid JWT', () => {
        const user = {
            _id: mongoose.Types.ObjectId().toHexString(),
            email: 'algum email',
        }

        const token = new User(user).generateToken()
        const req = {
            header: jest.fn().mockReturnValue(token),
        }
        const res = {}
        const next = jest.fn()

        auth(req, res, next)

        // expect(req.user).toMatchObject(user)
        expect(req.user).toHaveProperty('_id')
        expect(req.user).toHaveProperty('email')
    })
})
