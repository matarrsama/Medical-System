<template>
  <header class="bg-surface-container-lowest dark:bg-inverse-surface text-primary border-b border-outline-variant dark:border-outline flex justify-between items-center w-full px-lg h-16 sticky top-0 z-50 shrink-0">
    <div class="flex items-center gap-md sm:w-1/3">
      <button @click="ui.toggleSidebar()" class="p-2 rounded-full hover:bg-surface-container-low dark:hover:bg-white/[0.08] transition-colors text-on-surface-variant dark:text-outline sm:hidden">
        <span class="material-symbols-outlined">menu</span>
      </button>
      <span class="material-symbols-outlined text-primary dark:text-inverse-primary text-[28px]">health_and_safety</span>
      <span class="text-headline-md font-headline-md font-bold text-primary dark:text-inverse-primary truncate">{{ hospitalName }}</span>
    </div>
    <div class="hidden sm:flex flex-1 justify-start ml-4 max-w-lg relative" style="z-index: 50">
      <div class="relative w-full">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-outline">search</span>
        <input
          ref="inputRef"
          v-model="searchQuery"
          @focus="onFocus"
          @blur="onBlur"
          @keydown="onKeydown"
          @input="onSearchInput"
          class="w-full bg-surface-container-low dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-full py-2 pl-10 pr-10 text-body-md text-on-surface dark:text-inverse-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-on-surface-variant dark:placeholder:text-outline transition-colors"
          placeholder="Search tickets, assets, users..."
          type="text"
        />
        <button v-if="searchQuery" @click="clearSearch" class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-outline hover:text-on-surface dark:hover:text-inverse-on-surface transition-colors">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
      <div v-if="isFocused && searchQuery.length >= 2" class="absolute top-full left-0 right-0 mt-2 bg-surface-container-high dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-xl max-h-96 overflow-y-auto">
        <div v-if="results.length === 0" class="p-6 text-center text-on-surface-variant dark:text-outline">
          <span class="material-symbols-outlined text-[36px] block mb-2">search_off</span>
          <p class="text-body-md font-body-md">No results found</p>
          <p class="text-body-sm">Try different keywords</p>
        </div>
        <template v-if="results.length > 0">
          <div v-for="(group, gi) in groupedResults" :key="gi" class="py-1">
            <div class="px-4 py-1.5 text-label-sm font-label-md text-outline uppercase tracking-wider flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">{{ group.icon }}</span>
              {{ group.type === 'ticket' ? 'Tickets' : group.type === 'user' ? 'Users' : group.type === 'equipment' ? 'Equipment' : 'Departments' }}
            </div>
            <div
              v-for="(item, ii) in group.items"
              :key="group.type + '-' + ii"
              :ref="el => setItemRef(el, gi, ii)"
              @mousedown.prevent
              @click="navigateTo(item)"
              @mouseenter="highlightIndex = flatIndex(gi, ii)"
              class="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors mx-1 rounded-lg"
              :class="highlightIndex === flatIndex(gi, ii)
                ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-inverse-primary'
                : 'hover:bg-surface-container-low dark:hover:bg-white/[0.08] text-on-surface dark:text-inverse-on-surface'"
            >
              <span class="material-symbols-outlined text-[20px] shrink-0">{{ item.icon }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-body-md font-body-md truncate">{{ item.label }}</p>
                <p class="text-body-sm font-body-sm text-on-surface-variant dark:text-outline truncate">{{ item.subtitle }}</p>
              </div>
              <span class="material-symbols-outlined text-[16px] text-outline-variant shrink-0">chevron_right</span>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="flex items-center justify-end gap-sm sm:gap-md sm:w-1/3">
      <button @click="ui.toggleSearch()" class="sm:hidden p-2 rounded-full hover:bg-surface-container-low dark:hover:bg-white/[0.08] transition-colors text-on-surface-variant dark:text-outline">
        <span class="material-symbols-outlined">search</span>
      </button>
      <div class="flex items-center gap-xs">
        <NetworkIndicator />
        <div class="relative">
          <button @click="showNotifications = !showNotifications" class="p-2 rounded-full hover:bg-surface-container-low dark:hover:bg-white/[0.08] transition-colors text-on-surface-variant dark:text-outline relative">
            <span class="material-symbols-outlined">notifications</span>
            <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <div v-if="showNotifications" class="fixed inset-0 z-40" @click="showNotifications = false"></div>
          <div v-if="showNotifications" class="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-xl shadow-xl z-50">
            <div class="p-4 border-b border-outline-variant dark:border-outline flex justify-between items-center">
              <span class="text-title-md font-label-md text-on-surface dark:text-inverse-on-surface">Notifications</span>
              <span v-if="unreadCount" class="text-label-sm text-on-surface-variant dark:text-outline">{{ unreadCount }} new</span>
            </div>
            <div class="max-h-80 overflow-y-auto">
              <div v-for="note in recentNotifications" :key="note.id" class="flex items-start gap-3 p-4 border-b border-outline-variant/30 dark:border-outline/30 last:border-0 hover:bg-surface-container-low dark:hover:bg-white/[0.08] transition-colors cursor-pointer" :class="!note.read ? 'bg-surface-container-low/50 dark:bg-white/[0.04]' : ''">
                <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0" :class="note.iconBg || 'bg-primary-container dark:bg-primary-container/40'">
                  <span class="material-symbols-outlined text-[18px]" :class="note.iconColor || 'text-primary dark:text-inverse-primary'">{{ note.icon || 'notifications' }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-body-sm font-medium text-on-surface dark:text-inverse-on-surface truncate">{{ note.title }}</p>
                  <p class="text-body-xs text-on-surface-variant dark:text-outline truncate">{{ note.message }}</p>
                  <p class="text-label-xs text-outline mt-0.5">{{ timeAgo(note.timestamp) }}</p>
                </div>
                <div v-if="!note.read" class="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5"></div>
              </div>
              <div v-if="!recentNotifications.length" class="p-8 text-center text-on-surface-variant dark:text-outline text-body-sm">
                <span class="material-symbols-outlined text-[36px] block mb-2">notifications_off</span>
                No notifications yet
              </div>
            </div>
            <div class="p-3 border-t border-outline-variant dark:border-outline text-center">
              <router-link to="/notifications" @click="showNotifications = false" class="text-label-md font-label-md text-primary dark:text-inverse-primary hover:underline">More</router-link>
            </div>
          </div>
        </div>
        <button @click="ui.toggleTheme()" class="p-2 rounded-full hover:bg-surface-container-low dark:hover:bg-white/[0.08] transition-colors text-on-surface-variant dark:text-outline">
          <span class="material-symbols-outlined">contrast</span>
        </button>
        <button @click="reloadPage" class="p-2 rounded-full hover:bg-surface-container-low dark:hover:bg-white/[0.08] transition-colors text-on-surface-variant dark:text-outline" title="Reload page">
          <span class="material-symbols-outlined">refresh</span>
        </button>
      </div>
      <div class="h-6 w-px bg-outline-variant dark:bg-outline mx-xs"></div>
      <button @click="ui.openModal('Help')" class="hidden sm:inline-block text-body-sm font-label-md text-primary dark:text-inverse-primary hover:bg-surface-container-low dark:hover:bg-white/[0.08] px-3 py-1.5 rounded transition-colors uppercase tracking-wider">Help</button>
    </div>
  </header>
  <div v-if="isFocused && searchQuery.length >= 2" class="fixed inset-0 z-40" @click="clearSearch"></div>
  <div v-if="ui.searchOpen" class="sm:hidden fixed inset-x-0 top-0 z-50 bg-surface-container-lowest dark:bg-inverse-surface border-b border-outline-variant dark:border-outline p-3 flex items-center gap-2">
    <div class="relative flex-1">
      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-outline">search</span>
      <input
        ref="inputRef"
        v-model="searchQuery"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
        @input="onSearchInput"
        class="w-full bg-surface-container-low dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-full py-2 pl-10 pr-10 text-body-md text-on-surface dark:text-inverse-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-on-surface-variant dark:placeholder:text-outline transition-colors"
        placeholder="Search tickets, assets, users..."
        type="text"
        autofocus
      />
      <button v-if="searchQuery" @click="clearSearch" class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-outline hover:text-on-surface dark:hover:text-inverse-on-surface transition-colors">
        <span class="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
    <button @click="ui.searchOpen = false" class="text-label-md font-label-md text-primary dark:text-inverse-primary px-2 py-1.5">Cancel</button>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useSettings } from '@/composables/useSettings'
import { useGlobalSearch } from '@/composables/useGlobalSearch'
import { useSearchNav } from '@/composables/useSearchNav'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { timeAgo } from '@/utils/timeAgo'
import NetworkIndicator from '@/components/NetworkIndicator.vue'

const router = useRouter()
const route = useRoute()
const searchNav = useSearchNav()
const ui = useUIStore()
const auth = useAuthStore()
const { hospitalName } = useSettings()
const { searchQuery, isFocused, results, groupedResults } = useGlobalSearch()

const inputRef = ref(null)
const highlightIndex = ref(-1)
const itemRefs = ref({})
let blurTimeout

const showNotifications = ref(false)
const recentNotifications = ref([])
let unsubNotifications = null

const unreadCount = computed(() => recentNotifications.value.filter(n => !n.read).length)

onMounted(() => {
  unsubNotifications = onSnapshot(
    query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(5)),
    (snap) => { recentNotifications.value = snap.docs.map(d => ({ id: d.id, ...d.data() })) },
    () => {}
  )
})

onUnmounted(() => {
  if (unsubNotifications) unsubNotifications()
})

watch(() => ui.searchOpen, (open) => {
  if (open) {
    nextTick(() => inputRef.value?.focus())
  }
})

function flatIndex(gi, ii) {
  let idx = 0
  for (let g = 0; g < gi; g++) {
    idx += groupedResults.value[g].items.length
  }
  return idx + ii
}

function setItemRef(el, gi, ii) {
  if (el) itemRefs.value[flatIndex(gi, ii)] = el
}

function totalItems() {
  let count = 0
  for (const g of groupedResults.value) count += g.items.length
  return count
}

function onSearchInput(e) {
  if (!e.target.value && route.query.q) {
    router.replace({ query: undefined })
  }
}

function onFocus() {
  clearTimeout(blurTimeout)
  isFocused.value = true
  highlightIndex.value = -1
}

function onBlur() {
  blurTimeout = setTimeout(() => { isFocused.value = false }, 200)
}

function clearSearch() {
  clearTimeout(blurTimeout)
  searchQuery.value = ''
  isFocused.value = false
  highlightIndex.value = -1
  ui.searchOpen = false
  router.replace({ query: undefined })
}

function navigateTo(item) {
  console.log('[AppTopBar] navigateTo called with item:', JSON.stringify(item))
  clearTimeout(blurTimeout)
  isFocused.value = false
  const q = searchQuery.value
  highlightIndex.value = -1
  console.log('[AppTopBar] pushing route:', item.route, 'with q:', q)
  router.push({ path: item.route, query: q ? { q } : undefined })
}

function onKeydown(e) {
  const total = totalItems()
  if (total === 0) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    const next = highlightIndex.value + 1
    highlightIndex.value = next >= total ? 0 : next
    scrollToHighlight()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    const prev = highlightIndex.value - 1
    highlightIndex.value = prev < 0 ? total - 1 : prev
    scrollToHighlight()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (highlightIndex.value >= 0) {
      // find the item at highlightIndex
      let idx = 0
      for (const g of groupedResults.value) {
        for (const item of g.items) {
          if (idx === highlightIndex.value) {
            navigateTo(item)
            return
          }
          idx++
        }
      }
    }
  } else if (e.key === 'Escape') {
    e.preventDefault()
    clearSearch()
    inputRef.value?.blur()
  }
}

function scrollToHighlight() {
  const el = itemRefs.value[highlightIndex.value]
  if (el) el.scrollIntoView({ block: 'nearest' })
}

function reloadPage() {
  window.location.reload()
}
</script>
