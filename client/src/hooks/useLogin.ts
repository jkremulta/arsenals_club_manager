import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import loginApi from "../services/login"
import { useLoginStore } from "../stores/useLoginStore"

export const useLogin = () => {
  const { setUser } = useLoginStore()
  const loginMutation = useMutation({
    mutationFn: (credentials) => loginApi.login(credentials),
    onSuccess: (user) => {
      setUser(user)
      toast.success("Logged in successfully.", { duration: 2000 })
    },
    onError: () => {},
  })
  return {
    loginMutation,
    loading: loginMutation.isPending,
  }
}
