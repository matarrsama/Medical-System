import { ref } from 'vue'

const pendingQuery = ref('')

export function useSearchNav() {
  function setPendingSearch(q) {
    console.log('[useSearchNav] setPendingSearch:', q)
    pendingQuery.value = q
  }

  function consumePendingSearch() {
    const q = pendingQuery.value
    console.log('[useSearchNav] consumePendingSearch returning:', q)
    pendingQuery.value = ''
    return q
  }

  const hasPending = () => {
    const h = pendingQuery.value !== ''
    console.log('[useSearchNav] hasPending:', h)
    return h
  }

  return { setPendingSearch, consumePendingSearch, hasPending }
}
