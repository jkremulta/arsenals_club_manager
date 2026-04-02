import axiosLib from 'axios'

const instance = axiosLib.create()

let onUnauthorized: (() => void) | null = null

export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn
}

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('loggedUser')
      localStorage.removeItem('token')
      if (onUnauthorized) onUnauthorized()
    }
    return Promise.reject(error)
  }
)

export default instance