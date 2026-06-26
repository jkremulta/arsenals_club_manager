import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import attendanceApi from '../services/attendance'


export const useManualAttendance = () => {

  const manualAttendanceMutation = useMutation({
    mutationFn: (name) => attendanceApi.addManually(name),
    // onSuccess: () => toast.success('Checked in successfully.', { duration: 2000 }),
    onError: (e) => toast.error(e?.response?.data?.error ?? 'Could not connect to server.',{ duration: 2000 })
  })

  const handleCheckIn = async (name) => {
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