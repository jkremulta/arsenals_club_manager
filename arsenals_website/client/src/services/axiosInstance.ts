import axiosLib from 'axios'
import { useLoginStore } from '@/stores/useLoginStore'

const instance = axiosLib.create()

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useLoginStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export default instance