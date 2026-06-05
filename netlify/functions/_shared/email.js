const GAS_URL = process.env.GAS_URL

export async function sendEmail({ to, subject, body }) {
  if (!GAS_URL) {
    console.warn('[email] GAS_URL not set, skipping email to', to)
    return { success: false, skipped: true }
  }
  const response = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, body })
  })
  return response.json()
}
