const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }, 
  content: { type: String, required: false }, 
  receiver:{ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  timestamp: { type: Date, default: Date.now }, 
  fileUrl: { type: String } 
})

module.exports = mongoose.model("messages", MessageSchema)