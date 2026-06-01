export function timeAgo(date) {
  if (!date) return 'Never'
  const now = Date.now()
  const then = typeof date === 'string' ? new Date(date).getTime() : date.toMillis?.() || date.getTime()
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
