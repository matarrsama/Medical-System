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
    const { email, password, displayName, role, department, staffId } = JSON.parse(event.body);

    if (!email || !password) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email and password are required' }) };
    }

    const { auth, firestore } = getFirebaseAdmin();
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: displayName || '',
      disabled: false,
    });

    await firestore.collection('users').doc(userRecord.uid).set({
      email,
      displayName: displayName || '',
      user_role: role || 'staff',
      department: department || '',
      staffId: staffId || '',
      disabled: false,
      createdAt: new Date().toISOString(),
    });

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ uid: userRecord.uid, email: userRecord.email }),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
