import axios from "./axiosInstance"

const baseUrl = "/api/attendance"

const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
})

const getAttendance = async (token: string) => {
  const response = await axios.get(baseUrl, authHeaders(token))
  return response.data
}

const deleteAttendance = async (id: string, token: string) => {
  const response = await axios.delete(`${baseUrl}/${id}`, authHeaders(token))

  return response.data
}

const updateAttendance = async (id: string, token: string, data) => {
  const response = await axios.put(`${baseUrl}/${id}`, data, authHeaders(token))

  return response.data
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
