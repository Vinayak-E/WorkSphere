
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000',
     withCredentials: true,  // This is essential for sending cookies
    headers: {
        'Content-Type': 'application/json'
    }
});


export default api;
