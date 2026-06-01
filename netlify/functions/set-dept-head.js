import { auth, corsHeaders } from './_shared/admin.js'

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }
  try {
    const { uid, department } = JSON.parse(event.body)

    const userRecord = await auth.getUser(uid)
    const claims = userRecord.customClaims || {}

    if (department) {
      claims.deptHeadOf = department
    } else {
      delete claims.deptHeadOf
    }

    await auth.setCustomUserClaims(uid, claims)

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ uid, deptHeadOf: department || null }) }
  } catch (err) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) }
  }
}
