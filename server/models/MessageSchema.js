const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }, // For one-to-one messaging
  room: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ChatRoom' 
  }, // For group messaging
  content: { 
    type: String, 
    required: true 
  },
  fileUrl: { 
    type: String,
    required: false 
  },
  readBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }], // For tracking read status in group chat
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
