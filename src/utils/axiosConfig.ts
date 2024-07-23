import axios from 'axios';

// Define the base URL for your API
const API_BASE_URL = 'http://138.3.222.185';

// Create an Axios instance with custom config
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 seconds
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});


export default axiosInstance;