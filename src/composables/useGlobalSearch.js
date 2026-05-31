import { ref, computed, onUnmounted } from 'vue'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { useFirestoreCache } from '@/composables/useFirestoreCache'

export function useGlobalSearch() {
  const searchQuery = ref('')
  const isFocused = ref(false)
  const tickets = ref([])
  const users = ref([])
  const equipment = ref([])
  const departments = ref([])
  const cache = useFirestoreCache()

  const cachedTickets = cache.load('search_tickets')
  const cachedUsers = cache.load('search_users')
  const cachedEquipment = cache.load('search_equipment')
  const cachedDepartments = cache.load('search_departments')
  if (cachedTickets) tickets.value = cachedTickets
  if (cachedUsers) users.value = cachedUsers
  if (cachedEquipment) equipment.value = cachedEquipment
  if (cachedDepartments) departments.value = cachedDepartments

  function onError(label) {
    return (err) => console.error(`[useGlobalSearch] ${label} onSnapshot error:`, err.code, err.message)
  }

  const unsubTickets = onSnapshot(
    query(collection(db, 'tickets'), orderBy('created', 'desc'), limit(50)),
    snap => {
      const mapped = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      tickets.value = mapped
      cache.save('search_tickets', mapped)
    },
    onError('tickets')
  )

  const unsubUsers = onSnapshot(
    collection(db, 'users'),
    snap => {
      const mapped = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      users.value = mapped
      cache.save('search_users', mapped)
    },
    onError('users')
  )

  const unsubEquipment = onSnapshot(
    collection(db, 'equipment'),
    snap => {
      const mapped = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      equipment.value = mapped
      cache.save('search_equipment', mapped)
    },
    onError('equipment')
  )

  const unsubDepartments = onSnapshot(
    collection(db, 'departments'),
    snap => {
      const mapped = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      departments.value = mapped
      cache.save('search_departments', mapped)
    },
    onError('departments')
  )

  onUnmounted(() => {
    unsubTickets()
    unsubUsers()
    unsubEquipment()
    unsubDepartments()
  })

  const results = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    if (!q || q.length < 2) return []

    const out = []
    const maxPerType = 5

    for (const t of tickets.value) {
      if (out.filter(r => r.type === 'ticket').length >= maxPerType) break
      if ((t.title && t.title.toLowerCase().includes(q)) || (t.id && t.id.toLowerCase().includes(q))) {
        out.push({
          type: 'ticket',
          icon: 'confirmation_number',
          label: t.title || t.id,
          subtitle: `${t.id || ''}${t.status ? ' · ' + t.status : ''}`,
          route: '/tickets'
        })
      }
    }

    for (const u of users.value) {
      if (out.filter(r => r.type === 'user').length >= maxPerType) break
      const name = u.name || u.displayName || u.email || ''
      if (name.toLowerCase().includes(q) || (u.email && u.email.toLowerCase().includes(q)) || (u.employeeId && u.employeeId.toLowerCase().includes(q))) {
        out.push({
          type: 'user',
          icon: 'person',
          label: name,
          subtitle: `${u.role || ''}${u.department ? ' · ' + u.department : ''}`,
          route: '/users'
        })
      }
    }

    for (const e of equipment.value) {
      if (out.filter(r => r.type === 'equipment').length >= maxPerType) break
      if (e.name && e.name.toLowerCase().includes(q)) {
        out.push({
          type: 'equipment',
          icon: 'precision_manufacturing',
          label: e.name,
          subtitle: `${e.department || ''}${e.status ? ' · ' + e.status : ''}`,
          route: '/biomedical'
        })
      }
    }

    for (const d of departments.value) {
      if (out.filter(r => r.type === 'department').length >= maxPerType) break
      if (d.name && d.name.toLowerCase().includes(q)) {
        out.push({
          type: 'department',
          icon: 'domain',
          label: d.name,
          subtitle: `${d.head ? 'Head: ' + d.head : ''}`,
          route: '/departments'
        })
      }
    }

    return out
  })

  const groupedResults = computed(() => {
    const groups = []
    const seen = new Set()
    for (const r of results.value) {
      if (!seen.has(r.type)) {
        seen.add(r.type)
        groups.push({ type: r.type, icon: r.icon, items: [r] })
      } else {
        groups.find(g => g.type === r.type).items.push(r)
      }
    }
    return groups
  })

  return { searchQuery, isFocused, results, groupedResults }
}
