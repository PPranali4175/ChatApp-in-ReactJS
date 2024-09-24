const Message = require('../models/Message');
const express = require("express");

const socketIo = require("socket.io");
const http = require("http");
const app = express();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});
const getMessage = async ({ userId, userToTalkId }) => {
    try {
        console.log("userId:", userId, "userToTalkId:", userToTalkId); // Ensure the correct IDs are being passed

        const messages = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: userId, receiver: userToTalkId },
                        { sender: userToTalkId, receiver: userId }
                    ]
                }
            },
            { $sort: { timestamp: -1 } }, // Sort by most recent
            { $limit: 50 } // Limit to last 50 messages
        ]);

        console.log("Fetched messages:", messages); // Log messages returned by the query

        socket.emit("loadMessages", messages.reverse());
    } catch (err) {
        console.error("Error loading messages:", err);
    }
}

const sendMessage = async (messageData) => {
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
}

module.exports = { getMessage, sendMessage };