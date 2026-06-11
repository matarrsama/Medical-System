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
    try {
      return JSON.parse(text)
    } catch (parseErr) {
      console.error('[email] GAS returned non-JSON. Status:', response.status, 'Body preview:', text.slice(0, 300))
      return { success: false, error: 'GAS returned HTML instead of JSON — check GAS_URL or re-deploy the script' }
    }
  } catch (err) {
    console.error('[email] GAS call failed:', err.message)
    return { success: false, error: err.message }
  }
}
