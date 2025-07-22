import axios from 'axios';

const BASE_URL = 'https://5.35.101.87/v1';

export const getLeaderboard = async () => {
    const res = await axios.get(`${BASE_URL}/`);
    return res.data;
};

export const createUser = async (userData: { username: string }) => {
    const res = await axios.post(`${BASE_URL}/`, userData, {
        headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
};

export const getUser = async (userId: string) => {
    const res = await axios.get(`${BASE_URL}/${userId}`);
    return res.data;
};

export const updateScore = async (userId: string, score: number) => {
    const res = await axios.put(`${BASE_URL}/${userId}`, { score }, {
        headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
};
