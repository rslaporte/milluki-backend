const mongoose = require('mongoose')

module.exports = function () {
    mongoose.connect('mongodb://localhost/milluki')
        .then( () => console.log('Connected to MongoDB...'))
        .catch(err => console.log(err))
}