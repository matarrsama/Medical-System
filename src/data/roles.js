export const ROLES = [
  { id: 'sys_admin', label: 'Sys Administrator' },
  { id: 'ict_officer', label: 'ICT Officer' },
  { id: 'physician', label: 'Physician' },
  { id: 'nurse', label: 'Nurse' },
  { id: 'doctor', label: 'Doctor' },
  { id: 'hospital_admin', label: 'Hospital Admin' },
  { id: 'lab_technician', label: 'Lab Technician' },
  { id: 'pharmacist', label: 'Pharmacist' },
  { id: 'accounting', label: 'Accounting' },
  { id: 'procurement', label: 'Procurement' },
  { id: 'viewer', label: 'Viewer' }
]

export function labelToId(label) {
  const found = ROLES.find(r => r.label === label)
  return found ? found.id : label
}

export function idToLabel(id) {
  const found = ROLES.find(r => r.id === id)
  return found ? found.label : id
}
