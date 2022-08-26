import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://todo-app-backend.fly.dev'
})

export { axiosInstance };