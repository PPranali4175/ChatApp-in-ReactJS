const mongoose = require("mongoose");

exports.connect = () => {
  // Connecting to the database
  try {
  mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connected");
  } catch (error) {
    console.log("Connection Failed" , error)
  }
};