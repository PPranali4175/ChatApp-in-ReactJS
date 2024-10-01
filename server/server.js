const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const socketIo = require("socket.io");
const http = require("http");

const app = express();
const Router = require("./router/routes.js");
const { loadMessages, sendMessage, fetchChatRoom, createChatRoom } = require("./controllers/ChatController.js"); 
const { createUser, getAllUser } = require("./controllers/Auth.js");

dotenv.config();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

require("./config/db.js").connect();

app.use("/", Router);
app.use("/uploads", express.static("uploads"));

io.on("connection", (socket) => {
  console.log("A user connected");
  
  // load Users
  socket.on("loadUser", () => {
    getAllUser(socket); 
  });

  
  // Handle loading messages
  socket.on("loadMessages", (data) => {
    
    loadMessages(data, socket); 
  });

  // fetch chat rooms
  socket.on("loadChatRooms", (data) => {
    
    fetchChatRoom(data, socket); 
  });

  // Handle Users fething
  socket.on("createUser",(userData)=>{
    createUser(userData,io)
  })

  // Handle sending messages
  socket.on("sendMessage", (messageData) => {
    sendMessage(messageData, io); 
  });

  // Handle group chats 
  socket.on("createChatRoom", (messageData) => {
    createChatRoom(messageData, io); 
  });


});

server.listen(process.env.PORT, () => {
  console.log(`Server running on PORT ${process.env.PORT}`);
});
