const mongoose = require("mongoose");

module.exports = () => {
  mongoose
    .connect(process.env.MLAB_URI || "mongodb://localhost/exercise-track", {
      useUnifiedTopology: true,
      useNewUrlParser: true
    })
    .then(()=> {console.log("Connected to database")})
    .catch(err => {console.log("Error in connecting to DB.." + err)});
};
