import axios from './axiosInstance'
const baseUrl = '/api/login'
import type { User } from '@/stores/useLoginStore'

export interface LoginType {
  username: string
  password: string
}

const login = async (credentials: LoginType): Promise<User> => {
  const response = await axios.post(baseUrl, credentials)
  return response.data
}

export default { login}
