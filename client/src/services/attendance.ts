import axios from "./axiosInstance"
import type { Player } from '../../../shared/types/player'

const baseUrl = "/api/attendance"

const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
})

type UpdateAttendanceData = Pick<Player, "paid">

interface RemoveAttendanceResponse {
  removedPlayer: string
}

interface AddAttendanceResponse {
  addedPlayer: string
}

interface ManualAddAttendanceResponse {
  ok: boolean
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

const addAttendanceManually = async (name: string): Promise<ManualAddAttendanceResponse> => {
  const { data } = await axios.post<ManualAddAttendanceResponse>(`${baseUrl}/manual`, { name })
  return data
}

export const attendanceApi = {
  getAttendance,
  deleteAttendance,
  updateAttendance,
  addAttendance,
  addAttendanceManually,
}