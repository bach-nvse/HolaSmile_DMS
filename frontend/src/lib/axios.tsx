import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5135',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export default axiosInstance