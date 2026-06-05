export function formatPhone(val) {
  if (!val) return '+220 '
  let rest = val.startsWith('+220') ? val.slice(4) : val
  let digits = rest.replace(/[^0-9]/g, '')
  if (digits.length > 7) digits = digits.slice(0, 7)
  let formatted = '+220'
  if (digits.length > 3) {
    formatted += ' ' + digits.slice(0, 3) + ' ' + digits.slice(3)
  } else if (digits.length > 0) {
    formatted += ' ' + digits
  } else {
    formatted += ' '
  }
  return formatted
}
