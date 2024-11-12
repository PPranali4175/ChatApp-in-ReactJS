import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:8000');

export const ListToChatPage = () => {
    // Sidebar logic to fetch users
    const [users, setUsers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [roomMembers, setRoomMembers] = useState([]);
    const [userToTalk, setUserToTalk] = useState('');
    const [useridToTalk, setUserToTalkId] = useState('');
    const [showAlert, setShowAlert] = useState(false); // To show confirmation modal
    const [fileToSend, setFileToSend] = useState(null); // Store file selected
    const [loading, setLoading] = useState(false); // Loading state for file upload
    const [talkInGroup, setTalkInGroup] = useState(false);
    const fetchUser = () => {
        socket.emit('loadUser'); 
        socket.emit('loadGroupChat', { members: Id ? Id : localStorage.getItem('id') }); // Fetch chat rooms
    };

    useEffect(() => {
        // Fetch users when component mounts
        fetchUser();

        // Handle user loading
        socket.on('loadUser', (loadedUsers) => {
            const filteredUsers = loadedUsers.filter(user => user._id !== localStorage.getItem('id'));
            setUsers(filteredUsers);
        });
        console.log("out")
        socket.on('loadGroupChat', (chatRooms) => {
            // Handle chat rooms here if necessary
            console.log("chatRooms")
            console.log(chatRooms)
            setRooms(chatRooms);
        });

        return () => {
            socket.off('loadUser'); // Cleanup socket listeners
            socket.off('loadGroupChat'); // Cleanup socket listeners
        };
    }, []);

    const onClickRoom = (room) => {
        setTalkInGroup(true);
        setUserToTalk(room.roomName);
        setUserToTalkId(room._id);

        setRoomMembers(room.members)
        const filterMembers = roomMembers.filter(member => member._id !== localStorage.getItem('id'));
        // setRoomMembers(filterMembers)
    }
    const onClickUser = (user) => {
        setUserToTalk(user.name);
        setUserToTalkId(user._id);
        setTalkInGroup(false)
    }

    // Chat logic
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [name, setName] = useState('');
    const [Id, setId] = useState(localStorage.getItem('id'));


    useEffect(() => {
        const userName = localStorage.getItem('name');
        setName(userName);
        setId(localStorage.getItem('id'));

        // When the user to talk changes, fetch messages and chat rooms
        if (useridToTalk) {
            
            socket.emit('loadMessages', {
                sender: Id ? Id : localStorage.getItem('id'),
                receiver : useridToTalk 
            })
             // 
        }

        socket.on('loadMessages', (loadedMessages) => {
            // need to do filter inside socket
            // const filterMessage = loadedMessages.filter()
            setMessages(loadedMessages);
        });



        socket.on('receiveMessage', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.off('loadMessages');
            socket.off('chatRooms');
            socket.off('receiveMessage');
        };
    }, [useridToTalk]);

    const sendMessage = async () => {
        setLoading(true);
        if (!input && !fileToSend) {
            alert('Write an input or select a file.');
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
                    type: talkInGroup ? '' : 'one',
                };
                // Emit the message with file data
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
            type: talkInGroup ? '' : 'one',
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
                    {rooms.map((room) => (
                        <li
                            key={room._id}
                            onClick={() => onClickRoom(room)}
                            className="cursor-pointer p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                        >
                            {room.roomName} Group
                        </li>
                    ))}
                    {users.map((user) => (
                        <li
                            key={user._id}
                            onClick={() => onClickUser(user)}
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
                                <p className="text-gray-400">{talkInGroup ? <> You{roomMembers.map((room) => (', ' + room.name))}</> : 'Online'}</p>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 p-4 overflow-y-auto bg-white">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`mb-4 p-2 rounded-lg ${msg.sender === localStorage.getItem('id') ? 'bg-slate-500 text-white self-end ml-auto' : 'bg-gray-200'} max-w-xs`}
                                >
                                    <p>{msg.content}</p>
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
                                        d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
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
                ) : null}

                {/* Custom Alert Modal for confirmation */}
                {showAlert && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-8 rounded-lg">
                            <p>Are you sure you want to send this file?</p>
                            <div className="mt-4 flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowAlert(false)}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={sendMessage}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
