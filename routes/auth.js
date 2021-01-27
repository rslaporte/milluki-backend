const express = require('express')
const router = express.Router()

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Joi = require('joi')
const { User } = require('../models/user')

router.post('/', async(req, res) => {
    const {error} = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    const user = await User.findOne({email: req.body.email})
    if (!user) return res.status(400).send('Invalid email or password')

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) return res.status(400).send("Invalid email or password")

    const token = user.generateToken()
    res.send(token)
})

function validate(auth) {
    const schema = Joi.object({
        email: Joi.string().min(6).max(60).required(),
        password: Joi.string().min(6).max(20).required()
    })

    return schema.validate(auth)
}

module.exports = router