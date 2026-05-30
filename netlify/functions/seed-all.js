import { db } from './_shared/admin.js'

const SEED = {
  tickets: [
    { id: 'INC-9042', title: 'Radiology PACS Server Offline', department: 'Imaging', priority: 'critical', status: 'Investigating', assignee: 'John S.', created: '2026-05-30' },
    { id: 'INC-9038', title: 'EHR Login Timeout Errors', department: 'ER', priority: 'high', status: 'Assigned', assignee: 'Maria G.', created: '2026-05-30' },
    { id: 'INC-9012', title: 'Network Switch Failure - Floor 3', department: 'Infrastructure', priority: 'high', status: 'Pending Vendor', assignee: 'David K.', created: '2026-05-29' },
    { id: 'INC-8995', title: 'Pharmacy Dispensing App Crash', department: 'Pharmacy', priority: 'medium', status: 'Resolved', assignee: 'Lisa M.', created: '2026-05-29' }
  ],
  inventory: [
    { tag: 'AST-001', name: 'Dell Optiplex 7090', category: 'Desktop', department: 'ER', status: 'Active', purchaseDate: '2024-03-15' },
    { tag: 'AST-002', name: 'Cisco Catalyst 9300', category: 'Network', department: 'Infrastructure', status: 'Active', purchaseDate: '2024-01-20' },
    { tag: 'AST-003', name: 'HP LaserJet M404', category: 'Printer', department: 'Admin', status: 'Maintenance', purchaseDate: '2023-11-10' }
  ],
  departments: [
    { name: 'Emergency Room', head: 'Dr. Sarah Chen', icon: 'local_hospital', staffCount: 48, devices: 156 },
    { name: 'Imaging & Radiology', head: 'Dr. James Mitchell', icon: 'radiology', staffCount: 32, devices: 89 },
    { name: 'Pharmacy', head: 'Mark Thompson', icon: 'medication', staffCount: 24, devices: 45 },
    { name: 'Infrastructure', head: 'Ahmed Al-Rashid', icon: 'dns', staffCount: 18, devices: 234 },
    { name: 'Administration', head: 'Lisa Thompson', icon: 'admin_panel_settings', staffCount: 15, devices: 67 },
    { name: 'Pathology Lab', head: 'Dr. James Wilson', icon: 'biotech', staffCount: 12, devices: 34 },
    { name: 'Finance', head: 'John Mwangi', icon: 'account_balance', staffCount: 10, devices: 28 },
    { name: 'ICT', head: 'Ahmed Al-Rashid', icon: 'computer', staffCount: 22, devices: 189 },
    { name: 'Maternity', head: 'Dr. Mary Wanjiku', icon: 'pregnancy', staffCount: 56, devices: 112 },
    { name: 'LAB', head: 'Dr. James Wilson', icon: 'science', staffCount: 18, devices: 67 },
    { name: 'Super Admin', head: 'Dr. Peter Kamau', icon: 'shield', staffCount: 5, devices: 45 },
    { name: 'Procurement', head: 'Grace Akinyi', icon: 'shopping_cart', staffCount: 8, devices: 22 },
    { name: 'Human Resources', head: 'Jane Wanjiku', icon: 'badge', staffCount: 7, devices: 18 }
  ],
  requests: [
    { id: 'REQ-2026-001', title: 'MRI Scanner Maintenance Contract Renewal', requester: 'Dr. Sarah Chen', department: 'Imaging', status: 'Pending', date: '2026-05-28' },
    { id: 'REQ-2026-002', title: 'Additional Workstation for Pharmacy', requester: 'Mark Thompson', department: 'Pharmacy', status: 'Approved', date: '2026-05-27' },
    { id: 'REQ-2026-003', title: 'VPN Access for Remote Pathologist', requester: 'Dr. James Wilson', department: 'Pathology', status: 'Pending', date: '2026-05-26' },
    { id: 'REQ-2026-004', title: 'Server Rack UPS Replacement', requester: 'Ahmed Al-Rashid', department: 'Infrastructure', status: 'Rejected', date: '2026-05-25' },
    { id: 'REQ-2026-005', title: 'EHR Software License Upgrade (10 seats)', requester: 'Lisa Thompson', department: 'Admin', status: 'Pending', date: '2026-05-24' }
  ],
  equipment: [
    { id: 'BME-001', name: 'Siemens MRI 3T', department: 'Imaging', status: 'Operational', lastCalibration: '2026-04-15' },
    { id: 'BME-002', name: 'GE CT Scanner', department: 'Imaging', status: 'Needs Calibration', lastCalibration: '2025-11-20' },
    { id: 'BME-003', name: 'Philips Ventilator V60', department: 'ICU', status: 'Operational', lastCalibration: '2026-05-01' },
    { id: 'BME-004', name: 'Defibrillator Zoll X', department: 'ER', status: 'Out of Service', lastCalibration: '2026-01-10' }
  ],
  maintenanceTasks: [
    { id: 'MT-001', equipment: 'MRI Scanner - Suite A', type: 'Preventive', location: 'Imaging', date: '2026-06-01', status: 'Scheduled' },
    { id: 'MT-002', equipment: 'CT Scanner - Suite B', type: 'Calibration', location: 'Imaging', date: '2026-06-02', status: 'In Progress' },
    { id: 'MT-003', equipment: 'Ventilator Bank - ICU', type: 'Safety Check', location: 'ICU', date: '2026-06-03', status: 'Scheduled' },
    { id: 'MT-004', equipment: 'UPS Backup - Server Room', type: 'Battery Test', location: 'Infrastructure', date: '2026-05-28', status: 'Overdue' }
  ],
  purchaseOrders: [
    { id: 'PO-2026-042', vendor: 'MedTech Solutions Inc.', amount: 45000, status: 'Pending' },
    { id: 'PO-2026-041', vendor: 'Cisco Systems', amount: 120000, status: 'Approved' },
    { id: 'PO-2026-040', vendor: 'Dell Technologies', amount: 85000, status: 'Delivered' }
  ],
  vendors: [
    { name: 'MedTech Solutions Inc.', slug: 'medtech', contracts: 12, status: 'Active' },
    { name: 'Cisco Systems', slug: 'cisco', contracts: 8, status: 'Active' },
    { name: 'Dell Technologies', slug: 'dell', contracts: 6, status: 'Active' },
    { name: 'Epic Systems', slug: 'epic', contracts: 3, status: 'Under Review' }
  ],
  auditLogs: [
    { id: 'AUD-001', timestamp: '2026-05-30 10:14:22', user: 'Ahmed Al-Rashid', action: 'Update', resource: 'Ticket INC-9042', details: 'Changed status to Investigating' },
    { id: 'AUD-002', timestamp: '2026-05-30 09:45:00', user: 'Maria Gonzalez', action: 'Create', resource: 'User EMP-10299', details: 'New user account created' },
    { id: 'AUD-003', timestamp: '2026-05-30 08:30:15', user: 'James Okafor', action: 'Login', resource: 'System', details: 'Successful login from 10.0.1.45' },
    { id: 'AUD-004', timestamp: '2026-05-29 23:00:00', user: 'System', action: 'Delete', resource: 'Backup Log', details: 'Auto-purged logs older than 90 days' },
    { id: 'AUD-005', timestamp: '2026-05-29 16:20:33', user: 'Ahmed Al-Rashid', action: 'Update', resource: 'Configuration', details: 'Changed backup retention policy' }
  ],
  notifications: [
    { id: 'NOTIF-001', title: 'PACS Server Restored', message: 'Radiology PACS server has been restored after maintenance.', icon: 'check_circle', time: '5 min ago', read: false },
    { id: 'NOTIF-002', title: 'SLA Breach Warning', message: 'Ticket INC-9042 is approaching SLA deadline.', icon: 'warning', time: '1 hour ago', read: false },
    { id: 'NOTIF-003', title: 'New User Registered', message: 'Dr. Emily Watson has been registered and pending approval.', icon: 'person_add', time: '3 hours ago', read: true },
    { id: 'NOTIF-004', title: 'Backup Completed', message: 'Nightly system backup completed successfully.', icon: 'backup', time: '8 hours ago', read: true },
    { id: 'NOTIF-005', title: 'Certificate Expiry Notice', message: 'SSL certificate for portal.hospital.org expires in 14 days.', icon: 'verified_user', time: '1 day ago', read: true }
  ],
  reports: [
    { id: 'RPT-001', title: 'Incident Summary', description: 'Monthly incident metrics and trends', icon: 'assessment', updated: '2 hours ago' },
    { id: 'RPT-002', title: 'Asset Inventory', description: 'Complete asset register by department', icon: 'inventory_2', updated: '1 day ago' },
    { id: 'RPT-003', title: 'User Activity', description: 'Login and access logs analysis', icon: 'group', updated: '3 hours ago' },
    { id: 'RPT-004', title: 'SLA Compliance', description: 'Service level agreement adherence', icon: 'timer', updated: '1 day ago' },
    { id: 'RPT-005', title: 'Procurement Spend', description: 'Vendor spending and budget tracking', icon: 'shopping_cart', updated: '1 week ago' },
    { id: 'RPT-006', title: 'Maintenance History', description: 'Equipment maintenance records', icon: 'build', updated: '2 days ago' }
  ]
}

const toId = (doc) => doc.id || doc.slug || doc.name?.toLowerCase().replace(/\s+/g, '-') || crypto.randomUUID()

export const handler = async () => {
  const results = {}

  const ops = Object.entries(SEED).flatMap(([coll, docs]) => {
    results[coll] ??= { created: 0, skipped: 0, errors: [] }
    return docs.map(async (doc) => {
      const docId = toId(doc)
      try {
        const existing = await db.collection(coll).doc(docId).get()
        if (existing.exists) {
          results[coll].skipped++
        } else {
          await db.collection(coll).doc(docId).set(doc)
          results[coll].created++
        }
      } catch (err) {
        results[coll].errors.push(`${doc.id || doc.name}: ${err.message}`)
      }
    })
  })

  await Promise.all(ops)

  return {
    statusCode: 200,
    body: JSON.stringify(results)
  }
}
