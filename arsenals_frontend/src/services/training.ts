import axios from 'axios'

const baseUrl = '/api/training'

const authHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
})

export const createTraining = async (startTime, token) => {
  const { data } = await axios.post(baseUrl, { startTime }, authHeaders(token))
  return data
}

export const deleteTraining = async (token) => {
  const { data } = await axios.delete(baseUrl, authHeaders(token))
  return data
}

export const getTraining = async (token) => {
  const { data } = await axios.get(baseUrl, authHeaders(token))
  return data
}

export default {
  createTraining,
  deleteTraining,
  getTraining
}