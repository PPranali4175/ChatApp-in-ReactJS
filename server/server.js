const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const socketIo = require("socket.io");
const http = require("http");

const app = express();

const Router = require("./router/routes.js");
const Message = require("./models/Message.js");
const { getFileExtension } = require("./utility/Functions.js");
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});
dotenv.config();

app.use(cors());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

require("./config/db.js").connect();

app.use("/", Router);
app.use("/uploads", express.static("uploads"));

io.on("connection", async (socket) => {
  console.log("A user connected");

  // Listen for the 'loadMessages' event, which will carry both senderId and receiverId
  socket.on("loadMessages", async ({ userId, userToTalkId }) => {
    try {
      console.log("userId:", userId, "userToTalkId:", userToTalkId); // Ensure the correct IDs are being passed

      const messages = await Message.find({
        $or: [
          { sender: userId, receiver: userToTalkId },
          { sender: userToTalkId, receiver: userId }
        ]
      })
      .sort({ timestamp: -1 }) 
      .limit(50) 
      .populate('sender') 
      .populate('receiver')
      .exec();
      

      console.log("Fetched messages:", messages); // Log messages returned by the query

      socket.emit("loadMessages", messages.reverse());
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  });


  // Listen for 'sendMessage' event
  socket.on("sendMessage", async (messageData) => {
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
        const filePath = path.join(__dirname, "uploads", fileName);

        fs.writeFileSync(filePath, fileBuffer);
        fileUrl = `/uploads/${fileName}`; // Path to the file
      }

      // Save the message to the database
      const message = new Message({
        sender: messageData.sender,
        content: messageData.content || "",
        fileUrl: fileUrl || "",
        receiver: messageData.receiver,
        timestamp: new Date(), // Ensure timestamp is stored
      });

      await message.save();

      // Broadcast the message to all connected clients
      io.emit("receiveMessage", message);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server running on PORT ${process.env.PORT}`);
});
