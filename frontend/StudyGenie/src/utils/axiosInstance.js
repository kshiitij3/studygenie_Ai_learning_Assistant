import axios from 'axios';
import { BASE_URL } from './apiPaths';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout : 10000,
  headers: {
    "content-type":"appication/json",
     "accept":"application/json",
  },
});
//request interceptor
axiosInstance.interceptors.request.use(
  (config)=>{
    const accessToken = localStorage.getItem('accessToken');
    
  }
)
