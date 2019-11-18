const express = require('express')
const app = express()

require("./startup/index.js")(app)
require("./startup/db.js")()


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
