import axios from "./axiosInstance"
import type { Player } from '../../../shared/types/player'
import type { Training } from '../../../shared/types/training'

const baseUrl = "/api/attendance"

const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
})

type UpdateAttendanceData = Pick<Player, "paid">

interface RemoveAttendanceResponse {
  removedPlayer: string
}

interface AddAttendanceResponse extends Training {
  addedPlayer: string
}

const getAttendance = async (token: string): Promise<Player[]> => {
  const { data } = await axios.get<Player[]>(baseUrl, authHeaders(token))
  return data
}

const deleteAttendance = async (id: string, token: string): Promise<RemoveAttendanceResponse> => {
  const { data } = await axios.delete<RemoveAttendanceResponse>(`${baseUrl}/${id}`, authHeaders(token))
  return data
}

const updateAttendance = async (
  id: string,
  token: string,
  data: UpdateAttendanceData
): Promise<void> => {
  await axios.put(`${baseUrl}/${id}`, data, authHeaders(token))
}

const addAttendance = async (id: string, token: string): Promise<AddAttendanceResponse> => {
  const { data } = await axios.post<AddAttendanceResponse>(baseUrl, { id }, authHeaders(token))
  return data
}

const addAttendanceManually = async (name: string): Promise<AddAttendanceResponse> => {
  const { data } = await axios.post<AddAttendanceResponse>(`${baseUrl}/manual`, { name })
  return data
}

export const attendanceApi = {
  getAttendance,
  deleteAttendance,
  updateAttendance,
  addAttendance,
  addAttendanceManually,
}