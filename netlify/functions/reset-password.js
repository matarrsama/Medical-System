const { getFirebaseAdmin } = require('./_shared/firebase-admin');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: 'Method Not Allowed' };

  try {
    const { email } = JSON.parse(event.body);
    if (!email) return { statusCode: 400, headers, body: JSON.stringify({ error: 'email is required' }) };

    const { auth } = getFirebaseAdmin();
    const link = await auth.generatePasswordResetLink(email);

    return { statusCode: 200, headers, body: JSON.stringify({ link }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
