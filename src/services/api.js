import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const getLesson = async (userId) => {
    const response = await axios.get(`${API_URL}/lesson`, { params: { userId } });
    return response.data;
};

export const submitAnswer = async (userId, answer) => {
    const response = await axios.post(`${API_URL}/answer`, { userId, answer });
    return response.data;
}; 