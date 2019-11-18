const mongoose = require("mongoose");
const Joi = require("@hapi/joi")

// creating schema for user model
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    minlength:5,
    maxlength:35,
    required:true
  }
});


//create a users model

const User = mongoose.model('User', userSchema)


const validateUser = (username) => {
    
  const schema = Joi.string().min(5).max(35).required()
  
  return schema.validate(username)
}


module.exports.User = User
module.exports.validateUser = validateUser



