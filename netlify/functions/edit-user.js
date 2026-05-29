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
    const { uid, displayName, role, department } = JSON.parse(event.body);
    if (!uid) return { statusCode: 400, headers, body: JSON.stringify({ error: 'uid is required' }) };

    const { auth, firestore } = getFirebaseAdmin();

    const authUpdates = {};
    if (displayName !== undefined) authUpdates.displayName = displayName;
    const updatedUser = Object.keys(authUpdates).length > 0
      ? await auth.updateUser(uid, authUpdates)
      : null;

    const firestoreUpdates = {};
    if (displayName !== undefined) firestoreUpdates.displayName = displayName;
    if (role !== undefined) firestoreUpdates.user_role = role;
    if (department !== undefined) firestoreUpdates.department = department;
    firestoreUpdates.updatedAt = new Date().toISOString();
    await firestore.collection('users').doc(uid).update(firestoreUpdates);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'User updated', uid }),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
