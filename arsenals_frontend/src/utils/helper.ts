const formatTime = time => {
  if (!time) return null

  return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
const capitalize = (str = '') => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const initials = (name = '') => {
  return name.charAt(0).toUpperCase()
}

export default {
  formatTime,
  initials,
  capitalize
}