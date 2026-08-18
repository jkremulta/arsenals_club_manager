import axios from './axiosInstance'
const baseUrl = '/api/login'

interface LoginType {
  username: string
  password: string
}
const login = async (credentials: LoginType) => {
  const response = await axios.post(baseUrl, credentials)
  return response.data
}

export default { login}
