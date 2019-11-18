const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

// creating schema for Exercise model
const exerciseSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 300
  },
  duration:{
  type:Number,
  required:true,
  },
  date:String
});

//create a Exercise model

const Exercise = mongoose.model("Exercise", exerciseSchema);

const validateExercise = exercise => {
              
  const schema = Joi.object({
  userId:Joi.objectId().required(),
  description: Joi.string().max(300).required(),
  duration:Joi.number().required()
}) 

  return schema.validate(exercise);
};

module.exports.Exercise = Exercise;
module.exports.validateExercise = validateExercise;
