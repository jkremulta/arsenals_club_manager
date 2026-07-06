const formatTime = time => {
  if (!time) return null

  return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
const capitalize = (str = '') => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const skillFromRank = (rank) => {
  const numericRank = Number(rank)

  if (!Number.isFinite(numericRank)) return ''
  if (numericRank < 0.5 || numericRank > 10) return ''
  if (!Number.isInteger(numericRank * 2)) return ''
  if (numericRank <= 5) return 'beginner'
  if (numericRank <= 8) return 'intermediate'
  return 'advanced'
}

// skill pill
const skillPill = (skill) => {
  switch (skill) {
    case 'advanced':     return { label: 'ADV', className: 'bg-[#e8d9b5] text-[#1a2d4d] border font-bold' }
    case 'intermediate': return { label: 'INT', className: 'bg-[#c47a1e] text-white border font-bold' }
    case 'beginner':     return { label: 'BEG', className: 'bg-[#2e6f8e] text-[#e8d9b5] border font-bold' }
    default:             return { label: '—',   className: 'bg-white/10 text-white/30 border font-bold' }
  }
}

const skillLabel = (skill) => {
  switch (skill) {
    case 'advanced':     return 'Advanced'
    case 'intermediate': return 'Intermediate'
    case 'beginner':     return 'Beginner'
    default:             return skill ?? '—'
  }
}
const formatDate= (dateString) => {
  const date = new Date(dateString)

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

const toIsoDate = (formattedDate) => {
  return new Date(formattedDate).toISOString().slice(0, 10)
}


export default {
  formatTime,
  capitalize,
  skillFromRank,
  skillPill,
  skillLabel,
  formatDate,
  toIsoDate
}
