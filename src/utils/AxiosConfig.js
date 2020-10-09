import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://api-savenote.herokuapp.com'
})

export { axiosInstance };