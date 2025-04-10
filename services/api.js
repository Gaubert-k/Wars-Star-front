import axios from 'axios';

const API_URL = 'http://89.80.190.158:5000/api';

export const checkUserExists = async (phone) => {
    try {
        const response = await axios.get(`${API_URL}/users/${phone}`);
        return { exists: true, user: response.data };
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return { exists: false };
        }
        throw error;
    }
};

export const createUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/users`, userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};
