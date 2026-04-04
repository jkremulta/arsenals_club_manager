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
    case 'advanced':     return { label: 'Adv', className: 'bg-red-500/15 text-red-400' }
    case 'intermediate': return { label: 'Int', className: 'bg-yellow-500/15 text-yellow-400' }
    case 'beginner':     return { label: 'Beg', className: 'bg-emerald-500/15 text-emerald-400' }
    default:             return { label: '—',   className: 'bg-white/10 text-white/30' }
  }
}
export default {
  formatTime,
  capitalize,
  skillFromRank,
  skillPill
}
