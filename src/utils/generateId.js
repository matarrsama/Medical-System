export function generateId(prefix = '', length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  let id = ''
  for (let i = 0; i < length; i++) {
    id += chars[array[i] % chars.length]
  }
  return `${prefix}${id}`
}
