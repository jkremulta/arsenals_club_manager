import axios from './axiosInstance'
const baseUrl = '/api/login'
import type { LoginCredentials, LoginResponse } from '../../../shared/types/user'

const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await axios.post(baseUrl, credentials)
  return response.data
}

export default { login}
