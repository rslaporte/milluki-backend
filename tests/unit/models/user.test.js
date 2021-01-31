const {User} = require('../../../models/user')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const config = require('config')

describe('user.generateToken', () => {
    it ('should return a valid JWT', () => {
        const payload = {_id: new mongoose.Types.ObjectId().toHexString(), email: 'validEmail'}
        const user = new User(payload)
        const token = user.generateToken();
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'))
        expect(decoded).toMatchObject(payload)
    })
})
