const FUNCTIONS_BASE = '/.netlify/functions'

async function call(name, data) {
  const res = await fetch(`${FUNCTIONS_BASE}/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Request failed')
  return json
}

export const createUser = (data) => call('create-user', data)
export const updateUser = (data) => call('update-user', data)
export const suspendUser = (uid, status) => call('suspend-user', { uid, status })
export const deleteUser = (uid) => call('delete-user', { uid })
export const resetPassword = (uid) => call('reset-password', { uid })
export const syncData = (users) => call('sync-data', { users })
