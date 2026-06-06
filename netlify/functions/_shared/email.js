const GAS_URL = process.env.GAS_URL

export async function sendEmail({ to, subject, body }) {
  if (!GAS_URL) {
    console.warn('[email] GAS_URL not set, skipping email to', to)
    return { success: false, skipped: true }
  }
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, body })
    })
    const text = await response.text()
    if (!text) return { success: false, error: 'Empty response from GAS' }
    return JSON.parse(text)
  } catch (err) {
    console.error('[email] GAS call failed:', err.message)
    return { success: false, error: err.message }
  }
}
