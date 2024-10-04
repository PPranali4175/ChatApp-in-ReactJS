const fs = require("fs");
const path = require("path");
const Message = require("../models/MessageSchema.js");
const { getFileExtension } = require("../utility/Functions.js");
const ChatRoom = require("../models/ChatSchema.js");

const loadMessages = async ({ sender, receiver }, socket) => {
  try {
    
    const messages = await Message.find({
      $or: [
        { sender: sender, receiver: receiver },
        { sender: receiver, receiver: sender },
        // { room: sender },
        { room: receiver },
      ],
    })
      .sort({ timestamp: -1 })
      .limit(50)
      .populate("sender")
      .populate("receiver")
      .populate("room")
      .exec();
    // Emit messages back to the client
    socket.emit("loadMessages", messages);
  } catch (err) {
    console.error("Error loading messages:", err);
  }
};

const sendMessage = async (messageData, io) => {
  try {
    let fileUrl = "";
    // If the message contains a file
    if (messageData.file) {
      const ext = getFileExtension(messageData.file);

      // Convert base64 string to buffer
      const fileBuffer = Buffer.from(
        messageData.file.split(",")[1],
        "base64"
      );

      // Generate a unique filename and store it
      const fileName = `upload-${Date.now()}.${ext}`; // Change extension based on file type
      const filePath = path.join(__dirname, "../uploads", fileName);

      fs.writeFileSync(filePath, fileBuffer);
      fileUrl = `/uploads/${fileName}`; // Path to the file
    }

    // Save the message to the database
    let message;
    if(messageData.type === 'one'){
      message = new Message({
        sender: messageData.sender,
        content: messageData.content || "",
        fileUrl: fileUrl || "",
        receiver: messageData.receiver,
        timestamp: new Date(), // Ensure timestamp is stored
      });
    }
    else{
      message = new Message({
        sender: messageData.sender,
        content: messageData.content || "",
        fileUrl: fileUrl || "",
        room: messageData.receiver,
        timestamp: new Date(), // Ensure timestamp is stored
      });
    }
    await message.save();

    // Broadcast the message to all connected clients
    io.emit("receiveMessage", message);
  } catch (err) {
    console.error("Error saving message:", err);
  }
};

const createGroupChat = async (roomDetails,io) =>{
  try {
    const newRoom = await ChatRoom.create({
      roomName:roomDetails.roomName,
      members:roomDetails.members,
    })
    io.emit("roomCreated",newRoom);
  } catch (error) {
    console.error("Error Creating Room" ,error);
  }
};
const AddNewMemberInGroupChat = async (groupAndMemberDetails,io) =>{
  try {
    const newRoom = await ChatRoom.findByIdAndUpdate(groupAndMemberDetails.groupId,{
      $push:{
        members:groupAndMemberDetails.members
      }
    })
    io.emit("newMember",newRoom);
  } catch (error) {
    console.error("Error Creating Room" ,error);
  }
};

const fetchGroupChat = async(userId,socket) =>{
  try {
    
    const chatRooms = await ChatRoom.find({
      members:userId.members
    }).populate({
      path:'members',
      select:'name'
    })
    socket.emit('loadChatRooms',chatRooms)
  } catch (error) {
    console.error("Error loading chat rooms:", error);
  }
}

module.exports = { sendMessage, loadMessages, createGroupChat, AddNewMemberInGroupChat, fetchGroupChat }