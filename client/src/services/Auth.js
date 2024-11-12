// apiClient.js
import axios from 'axios';
const getHeader = () =>{
  const token = localStorage.getItem('jwtToken');
  return {
    Authorization: token
  };
}

// Create an Axios instance with default settings
const apiClient = axios.create({
  baseURL: 'https://chatapp-in-reactjs-server.onrender.com', 
  timeout: 5000, 
  headers: getHeader()
});

// Custom error handler
const handleError = (error) => {
    if (error.response) {
      console.error('Server responded with an error:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  };

  


export const loginUserNew = async (data, headers = {})=>{
    try {
        const endpoint = `/login`
        const response = await apiClient.post(endpoint, data, { headers});
        return response;
      } catch (error) {
        handleError(error);
      }
};
export const getAllUsers = async (data, headers = {})=>{
    try {
        const endpoint = `/users`
        const response = await apiClient.get(endpoint, data, { headers});
        return response;
      } catch (error) {
        handleError(error);
      }
};



