const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // form data
    name: { type: String, default: "admin" },
    email: { type: String},
    password: { type: String, default:"admin123" },
    department :{type:String , default:"IT"},
    // 
    token: { type: String },
    resetToken: String,
    resetTokenExpiration: Date,
})

module.exports = mongoose.model("User", UserSchema)