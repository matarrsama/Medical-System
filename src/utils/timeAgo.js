export function timeAgo(date) {
  if (!date) return 'Never'
  const now = Date.now()
  let then
  if (typeof date === 'string') {
    then = new Date(date).getTime()
  } else if (typeof date === 'number') {
    then = date
  } else if (date.toMillis) {
    then = date.toMillis()
  } else if (date.seconds) {
    then = date.seconds * 1000 + (date.nanoseconds || 0) / 1e6
  } else if (date.getTime) {
    then = date.getTime()
  } else {
    then = Number(date) || 0
  }
  if (!then) return 'Never'
  const diff = now - then
  if (diff < 60000) return 'Just now'
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(diff / 3600000)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(diff / 86400000)
  if (days < 30) return `${days}d ago`
  return new Date(then).toLocaleDateString()
}
