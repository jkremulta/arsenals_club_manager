import axios from './axiosInstance'
const baseUrl = '/api/login'

const login = async (credentials) => {
  const response = await axios.post(baseUrl, credentials)
  return response.data
}

const verifyPassword = async (password, token) => {
  const response = await axios.post(
    `${baseUrl}/verify-password`,
    { password },
    { headers: { Authorization: `Bearer ${token}` } }
  )

  return response.data
}

export default { login, verifyPassword }
