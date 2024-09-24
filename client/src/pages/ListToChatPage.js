import React, { useEffect, useState, useRef } from 'react';
import { getAllUsers } from '../services/Auth';
import io from 'socket.io-client';

const socket = io('http://localhost:8888');

export const ListToChatPage = () => {
    // Sidebar logic to fetch users
    const [users, setUsers] = useState([]);
    const [userToTalk, setUserToTalk] = useState('');
    const [useridToTalk, setUserToTalkId] = useState('');
    const [showAlert, setShowAlert] = useState(false); // To show confirmation modal
    const [fileToSend, setFileToSend] = useState(null); // Store file selected
    const [loading, setLoading] = useState(false); // Loading state for file upload

    const fetchUser = async () => {
        try {
            const res = await getAllUsers();
            if (res.status === 200) {
                const filteredUsers = res.data.data.filter(user => user._id !== localStorage.getItem('id'));
                setUsers(filteredUsers);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    // Chat logic
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [name, setName] = useState('');
    const [Id, setId] = useState(localStorage.getItem('id'));

    useEffect(() => {
        const userName = localStorage.getItem('name');
        setName(userName);
        setId(localStorage.getItem('id'))
        // When the user to talk changes, fetch messages
        if (useridToTalk) {
            
            socket.emit('loadMessages', { userToTalkId: useridToTalk , userId: Id ? Id : localStorage.getItem('id') }); // Send userToTalkId to load messages
        }

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
    }, [useridToTalk]);

    const sendMessage = async () => {
        setLoading(true);
        if (!input && !fileToSend) {
            alert('Write an Input or Select a file.')
            setLoading(false);

            return;
        }
        if (fileToSend) {
            const reader = new FileReader();
            reader.readAsDataURL(fileToSend);

            reader.onloadend = () => {
                const base64File = reader.result;
                const messageData = {
                    sender: Id ? Id : localStorage.getItem('id'),
                    content: input,
                    file: base64File,
                    receiver: useridToTalk,
                };
                // Emit the message after confirming and showing loading
                socket.emit('sendMessage', messageData);
            };
            setInput('');
        setFileToSend(null);
        setShowAlert(false);
        setLoading(false);
            return;
        }
        const messageData = {
            sender: Id ? Id : localStorage.getItem('id'),
            content: input,
            file: '',
            receiver: useridToTalk,
        };
        // Emit the message after confirming and showing loading
        socket.emit('sendMessage', messageData);
        
        setInput('');
        setFileToSend(null);
        setShowAlert(false);
        setLoading(false);
    };

    // File input reference
    const fileInputRef = useRef(null);

    // Function to trigger file input click
    const handleIconClick = () => {
        fileInputRef.current.click(); // Programmatically click the hidden input
    };

    // Handle file selection and show confirmation alert
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFileToSend(selectedFile);
        setShowAlert(true); // Show confirmation modal
    };

    

    return (
        <div className="h-screen flex bg-gray-100">
            {/* Sidebar */}
            <div className="w-1/4 bg-gray-900 text-white p-4">
                <div className="flex items-center space-x-2 mb-4">
                    <span className="text-lg font-bold">Contacts</span>
                </div>
                <ul className="space-y-4">
                    {users.map((user) => (
                        <li
                            key={user._id}
                            onClick={() => {setUserToTalk(user.name); setUserToTalkId(user._id)}}
                            className="cursor-pointer p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                        >
                            {user.name}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Chat Window */}
            <div className="flex flex-col flex-1">
                {userToTalk ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-gray-800 text-white p-4 flex items-center">
                            <div className="ml-4">
                                <h1 className="text-xl font-semibold">{userToTalk}</h1>
                                <p className="text-gray-400">Online</p>
                            </div>
                        </div>

                        {/* Chat Messages */}

                        <div className="flex-1 p-4 overflow-y-auto bg-white">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`mb-4 p-2 rounded-lg ${msg.sender === localStorage.getItem('id') ? 'bg-slate-500 text-white self-end ml-auto' : 'bg-gray-200'} max-w-xs`}
                                >
                                    <p>{msg.content}{' '}</p>
                                    {msg.fileUrl && (
                                        <a href={`http://localhost:8888${msg.fileUrl}`} className="text-white" target="_blank" rel="noreferrer">
                                            Click here to open file
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Input Field */}
                        <div className="bg-gray-100 p-4 flex items-center">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Type a message"
                            />
                            {/* File button */}
                            <button
                                onClick={handleIconClick}
                                className="bg-blue-500 ms-2 text-white p-2 rounded-full hover:bg-blue-600 transition flex items-center justify-center"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileChange}
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
                            <button
                                onClick={sendMessage}
                                className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                disabled={loading} // Disable button during loading
                            >
                                {loading ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </>
                ) : (
                    <></>
                )}

                {/* Custom Alert Modal for confirmation */}
                {showAlert && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-8 rounded-lg shadow-lg">
                            <h2 className="text-lg font-semibold mb-4">Confirm File Upload</h2>
                            <p className="mb-4">Are you sure you want to upload <strong>{fileToSend.name}</strong>?</p>
                            <div className="flex space-x-4">
                                <button
                                    onClick={sendMessage}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={() => setShowAlert(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
