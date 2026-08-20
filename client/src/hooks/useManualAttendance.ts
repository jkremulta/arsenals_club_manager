import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import attendanceApi from '../services/attendance'


export const useManualAttendance = () => {

  const manualAttendanceMutation = useMutation({
    mutationFn: (name: string) => attendanceApi.addManually(name),
    // onSuccess: () => toast.success('Checked in successfully.', { duration: 2000 }),
    onError: (e: AxiosError<{ error: string }>) => {
    toast.error(e.response?.data.error ?? 'Could not connect to server.', { duration: 2000 })
  },
  })

  const handleCheckIn = async (name: string) => {
    if (!name.trim()) return

    try {
      await manualAttendanceMutation.mutateAsync(
        name.trim()
      )
      return true
    } catch {
      // error handled by mutation
      return false
    }
    
  }

  return {
    manualAttendanceMutation,
    loading: manualAttendanceMutation.isPending,
    handleCheckIn
  }

}