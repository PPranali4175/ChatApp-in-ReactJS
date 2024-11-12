import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('https://chatapp-in-reactjs-server.onrender.com');

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [name, setName] = useState('')

  useEffect(() => {
    
    const userName = localStorage.getItem('name');
    setName(userName);

    socket.on('loadMessages', (loadedMessages) => {
      setMessages(loadedMessages);
    });

    socket.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('loadMessages');
      socket.off('receiveMessage');
    };
  }, []);

  const sendMessage = () => {
    const messageData = {
      sender: name, // Replace with actual user data
      content: input,
      fileUrl: file,
    };

    socket.emit('sendMessage', messageData);
    setInput('');
  };

  // const uploadFile = async () => {
  //   const formData = new FormData();
  //   formData.append('file', file);

  //   try {
  //     const header = {
  //       'Content-Type': 'multipart/form-data',
  //     }
  //     const response = await uploadFile(formData, header)
  //     console.log(response.data.filePath); // handle the uploaded file URL
  //   } catch (error) {
  //     console.error('Error uploading file:', error);
  //   }
  // };
  const fileInputRef = useRef(null);

  // Function to trigger file input click
  const handleIconClick = () => {
    fileInputRef.current.click(); // Programmatically click the hidden input
  };
  let file;
  const handleFileChange = (e) => {
    file = e.target.files[0];
    console.log(file)
    const reader = new FileReader();
  
    reader.onloadend = () => {
      const base64File = reader.result;
      
      // Send base64-encoded file via socket.io
      socket.emit('sendMessage', {
        sender: name,
        content: input,
        file: base64File, // Base64 string of the file
      });
    };
  
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        {/* Chat Messages */}
        <div className="h-80 overflow-y-auto border border-gray-200 rounded-md p-4 mb-4">
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <p key={index} className="mb-2">
                <strong className="text-blue-600">{msg.sender}:</strong> {msg.content}{' '}
                {msg.fileUrl && (
                  <a href={`http://localhost:8888${msg.fileUrl}`} className="text-blue-500 underline" target="_blank" rel="noreferrer">
                    File
                  </a>
                )}
              </p>
            ))
          ) : (
            <p className="text-gray-500">No messages yet.</p>
          )}
        </div>

        {/* Input Field */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={file ? file.name : "Type your message..."}
            className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* File button */}
          <button
            onClick={handleIconClick}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition flex items-center justify-center"
          >
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden" // Hide the input
              onChange={handleFileChange} // Handle file input change
            />

            {/* Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
              />
            </svg>
          </button>

          {/* send button */}
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;