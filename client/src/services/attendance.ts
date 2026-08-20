import axios from "./axiosInstance"

const baseUrl = "/api/attendance"

const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
})

export type SkillType = 'beginner' | 'intermediate' | 'advanced'
export interface Players {
  name: string
  birthday: string
  gender: string
  skill: SkillType
  rank: number
  games_played: number
  paid: boolean
  late: boolean
  createdAt?: string
  updatedAt?: string
  id: string
}

const getAttendance = async (token: string): Promise<Players[]> => {
  const response = await axios.get(baseUrl, authHeaders(token))
  return response.data
}

interface RemoveAttendanceResponse {
  removedPlayer: string
}

const deleteAttendance = async (id: string, token: string): Promise<RemoveAttendanceResponse> => {
  const response = await axios.delete(`${baseUrl}/${id}`, authHeaders(token))

  return response.data
}

// this is for toggling the payment status of a player
type UpdateAttendanceData = Pick<Players, "paid">

const updateAttendance = async (
  id: string,
  token: string,
  data: UpdateAttendanceData
): Promise<void> => {
  await axios.put(`${baseUrl}/${id}`, data, authHeaders(token))
}

const addAttendance = async (id: string, token: string) => {
  const response = await axios.post(baseUrl, { id }, authHeaders(token))

  return response.data
}

const addAttendanceManually = async (name: string) => {
  const response = await axios.post(`${baseUrl}/manual`, { name })

  return response.data
}

export default {
  get: getAttendance,
  delete: deleteAttendance,
  put: updateAttendance,
  post: addAttendance,
  addManually: addAttendanceManually,
}


// ts need to be fixed to return only the needed data