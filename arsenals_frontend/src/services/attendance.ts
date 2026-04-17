import axios from './axiosInstance'

const baseUrl = '/api/attendance'

const authHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
})

const getAttendance = async (token) => {
  const response = await axios.get(baseUrl, authHeaders(token))
  return response.data
}

const deleteAttendance = async (id, token) => {
  await axios.delete(`${baseUrl}/${id}`, authHeaders(token))
}

const updateAttendance = async (id, token, data) => {
  const response = await axios.put(
    `${baseUrl}/${id}`,
    data,
    authHeaders(token))
  
  return response.data
}

const addAttendance = async (id) => {

  const response = await axios.post(
    baseUrl,
    { id }
  )

  return response.data
}

const addAttendanceManually = async (name) => {
  const response = await axios.post(
    `${baseUrl}/manual`,
    { name }
  )

  return response.data
}

export default {
  get: getAttendance,
  delete: deleteAttendance,
  put: updateAttendance,
  post: addAttendance,
  addManually: addAttendanceManually
}