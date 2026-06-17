import axiosClient from "../axiosClient";

export const getUsers = async (params) => {
    try {
        const response = await axiosClient.get('/users', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    } finally {
        // Any cleanup if needed
    }
}