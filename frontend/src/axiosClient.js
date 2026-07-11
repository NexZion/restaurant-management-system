import axios from "axios";
import { clearAuthSession, getStoredToken, isSessionValid } from "./utils/authStorage";

const axiosClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

axiosClient.interceptors.request.use(
    (config) => {
        const token = getStoredToken()

        if (token && !isSessionValid()) {
            window.location.href = '/'
            return Promise.reject(new axios.Cancel('Session expired'));
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;   
    }, (error) => {
        return Promise.reject(error);
    }
)

axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            clearAuthSession()
            window.location.href = '/'
        }

        return Promise.reject(error);
    }
)

export default axiosClient;
