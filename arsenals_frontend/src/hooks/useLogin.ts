import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import loginApi from '../services/login'
import { useLoginStore } from '../stores/useLoginStore'
import { setUnauthorizedHandler } from '@/services/axiosInstance'


export const useLogin = () => {

  const { setUser, logout } = useLoginStore()

  const loginMutation = useMutation({
    mutationFn: (credentials) =>
      loginApi.login(credentials),
    onSuccess: (user) => {
      setUser(user)
      setUnauthorizedHandler(logout)
      toast.success('Logged in successfully.', {
        duration: 2000
      })
    },
    onError: (e) => toast.error(e?.response?.data?.error ?? 'Could not connect to server.',{ duration: 2000 })

  })

  return {
    // mutation state
    loginMutation,

    loading: loginMutation.isPending,
  }

}