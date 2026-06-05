import { corsHeaders } from './_shared/admin.js'
import { sendEmail } from './_shared/email.js'

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }
  try {
    const { to, subject, body, type } = JSON.parse(event.body)

    if (!to || !subject || !body) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Missing required fields: to, subject, body' }) }
    }

    const result = await sendEmail({ to, subject, body })
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(result) }
  } catch (err) {
    console.error('[send-email] Error:', err)
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) }
  }
}
