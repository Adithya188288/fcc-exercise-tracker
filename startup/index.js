const express = require("express")
const cors = require('cors')
const path = require("path")
const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)

const user = require("../routes/users")

module.exports = (app) => {


app.use(cors())
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "/index.html"))
});


app.use("/api/exercise/", user)





// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

}