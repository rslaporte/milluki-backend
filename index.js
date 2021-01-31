const app = require('express')()

require('./startapp/routes')(app);
require('./startapp/db')();
require('./startapp/validation')()

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}`))
