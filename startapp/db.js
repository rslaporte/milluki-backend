const mongoose = require('mongoose')
const config = require('config')

module.exports = () => {
    const db = config.get('db')
    mongoose
        .connect(db)
        .then(() => console.log(`Connected to ${db}`))
        .catch(err => console.log(err))
}
