const express = require("express");
const router = express.Router();
const { validateUser, User } = require("../models/users.js");
const { validateExercise, Exercise } = require("../models/exercise.js");
const Joi = require("@hapi/joi");
const url = require("url");

//Fetching all the users
router.get("/users", async (req, res) => {
  let users = await User.find({});

  if (users.length === 0) return res.send("No users present.");

  res.send(users);
});

//Creating a new User
router.post("/new-user", async (req, res) => {
  const { error } = validateUser(req.body.username);
  if (error) return res.status(400).send(error.details[0].message);

  let newUser = await User.findOne({ username: req.body.username });
  console.log(newUser);
  if (newUser) return res.status(400).send("Username already taken");

  newUser = new User({
    username: req.body.username
  });
  await newUser.save();

  const details = {
    username: newUser.username,
    _id: newUser._id
  };

  res.send(details);
});

//creating a new exercise for a user
router.post("/add", async (req, res) => {
  let { userId, description, duration, date } = req.body;

  //if the date if provided by the user parse it to a date string else set the current date
  date = getDateValueAsSpecified(date);

  const exerciseData = { userId, description, duration };

  const { error } = validateExercise(exerciseData);
  if (error) return res.status(400).send(error.details[0].message);

  //get the user details
  const user = await User.findById({ _id: userId });
  if (!user) return res.status(400).send("Invalid userId");

  //Save the Exercise details
  let newExercise = new Exercise({
    userId,
    description,
    duration,
    date
  });
  await newExercise.save();

  //create an object with both the user & exercise properties and send
  const details = {
    username: user.username,
    _id: user._id,
    description,
    duration,
    date: new Date(date).toDateString()
  };

  res.send(details);
});

module.exports = router;

//get all the logs for the specified user
router.get("/log", async (req, res) => {
  let { userId, from, to, limit } = req.query;

  limit = setLimit(limit);

  // userId is mandatory
  if (typeof userId === "undefined") {
    return res.status(400).send("unknown userId");
  } else {
    const { error } = validateId(userId);
    if (error) return res.status(400).send(error.details[0].message);
  }

  //get the user details
  const user = await User.findById({ _id: userId });
  if (!user) return res.status(400).send("Invalid userId");

  // find all the exercise
  const exerciseQuery = buildExerciseQuery(req.query);

  let exercise = await Exercise.find(exerciseQuery)
    .select("description duration date -_id")
    .limit(Number(limit));

  if (exercise.length === 0) return res.status(400).send("No exercise present");

  let noOfExercise = await noOfDocumentsInDb(limit, exerciseQuery, exercise);
  console.log(noOfExercise);

  exercise = convertDateToDateString(exercise);

  const details = exerciseResult(
    req.query,
    noOfExercise,
    exercise,
    user,
    limit
  );

  res.send(details);
});

const validateId = userId => {
  const schema = Joi.objectId();
  return schema.validate(userId);
};

const getDateValueAsSpecified = date => {
  if (typeof date === "undefined") {
    date = new Date().toISOString();
  } else {
    date = new Date(date).toISOString();
  }
  return date;
};

const buildExerciseQuery = query => {
  let exerciseQuery = {
    userId: query.userId
  };
  let dateQuery = {};
  if (query.from) {
    dateQuery.$gte = new Date(query.from).toISOString();
    exerciseQuery.date = dateQuery;
  }
  if (query.to) {
    dateQuery.$lt = new Date(query.to).toISOString();
    exerciseQuery.date = dateQuery;
  }
  return exerciseQuery;
};

const setLimit = limit => {
  return limit ? Number(limit) : (limit = 0);
};

const noOfDocumentsInDb = (limit, exerciseQuery, exercise) => {
  // find the of exercise
  if (Number(limit) === 0) {
    return Exercise.where(exerciseQuery).countDocuments();
  } else {
    if (exercise.length < Number(limit)) {
      return exercise.length;
    } else {
      return Number(limit);
    }
  }
};

const convertDateToDateString = exercise => {
  exercise.forEach(item => {
    item.date = new Date(item.date).toDateString();
  });
  return exercise;
};

const exerciseResult = (query, noOfExercise, exercise, user, limit) => {
  let details = {
    _id: query.userId,
    username: user.username,
    count: noOfExercise,
    log: exercise
  };
  if (query.from) {
    details.from = query.from;
  }
  if (query.to) {
    details.to = query.to;
  }
  if (limit !== 0) {
    details.limit = limit;
  }
  return details;
};
