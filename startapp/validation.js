const Joi = require('joi')

module.exports = () => {
    // eslint-disable-next-line global-require
    Joi.objectId = require('joi-objectid')(Joi)
}
