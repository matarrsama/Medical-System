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
    const { uid, disabled } = JSON.parse(event.body);
    if (!uid) return { statusCode: 400, headers, body: JSON.stringify({ error: 'uid is required' }) };

    const { auth, firestore } = getFirebaseAdmin();
    await auth.updateUser(uid, { disabled: !!disabled });
    await firestore.collection('users').doc(uid).update({ disabled: !!disabled });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: `User ${disabled ? 'suspended' : 'reactivated'}` }),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
