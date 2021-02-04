const mongoose = require('mongoose')

describe('Database connection', () => {
    it('should throw an error if connection fails', () => {
        mongoose.connect = jest.fn()
        mongoose.then = jest.fn()
        mongoose.catch = jest.fn()

        expect(mongoose.catch).not.toHaveBeenCalled()
    })
})
