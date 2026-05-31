<template>
  <header class="bg-surface-container-lowest dark:bg-inverse-surface text-primary border-b border-outline-variant dark:border-outline flex justify-between items-center w-full px-lg h-16 sticky top-0 z-50 shrink-0">
    <div class="flex items-center gap-md w-1/3">
      <span class="text-headline-md font-headline-md font-bold text-primary dark:text-inverse-primary truncate">{{ hospitalName }}</span>
    </div>
    <div class="flex-1 flex justify-center max-w-md w-1/3 relative" style="z-index: 50">
      <div class="relative w-full">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-outline">search</span>
        <input
          ref="inputRef"
          v-model="searchQuery"
          @focus="onFocus"
          @blur="onBlur"
          @keydown="onKeydown"
          @input="onSearchInput"
          class="w-full bg-surface-container-low dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-full py-2 pl-10 pr-10 text-body-md text-on-surface dark:text-inverse-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-on-surface-variant transition-colors"
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
                : 'hover:bg-surface-container-low dark:hover:bg-surface-variant text-on-surface dark:text-inverse-on-surface'"
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
    <div class="flex items-center justify-end gap-md w-1/3">
      <div class="flex items-center gap-xs">
        <button class="p-2 rounded-full hover:bg-surface-container-low dark:hover:bg-surface-variant transition-colors text-on-surface-variant">
          <span class="material-symbols-outlined">terminal</span>
        </button>
        <button @click="router.push('/notifications')" class="p-2 rounded-full hover:bg-surface-container-low dark:hover:bg-surface-variant transition-colors text-on-surface-variant relative">
          <span class="material-symbols-outlined">notifications</span>
          <span class="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <button @click="ui.toggleTheme()" class="p-2 rounded-full hover:bg-surface-container-low dark:hover:bg-surface-variant transition-colors text-on-surface-variant">
          <span class="material-symbols-outlined">contrast</span>
        </button>
      </div>
      <div class="h-6 w-px bg-outline-variant mx-xs"></div>
      <button class="text-body-sm font-label-md text-primary dark:text-inverse-primary hover:bg-surface-container-low dark:hover:bg-surface-variant px-3 py-1.5 rounded transition-colors uppercase tracking-wider">Help</button>
      <button @click="$emit('new-ticket')" class="bg-primary text-on-primary text-label-md font-label-md px-4 py-2 rounded-lg hover:bg-primary-container transition-colors shadow-sm active:scale-95 duration-150 flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px]">add</span>
        New Ticket
      </button>
      <div
        @click="router.push('/settings')"
        class="ml-sm w-9 h-9 rounded-full overflow-hidden border-2 border-surface-container-highest cursor-pointer hover:border-primary hover:scale-105 active:scale-95 transition-all duration-150 shrink-0 flex items-center justify-center bg-surface-container-high text-on-surface-variant font-bold text-label-md select-none"
        title="View Settings"
      >
        <img v-if="auth.user?.avatar" class="w-full h-full object-cover" :src="auth.user?.avatar" alt="User profile" />
        <span v-else class="uppercase tracking-tighter">{{ auth.user?.initials || 'U' }}</span>
      </div>
    </div>
  </header>
  <div v-if="isFocused && searchQuery.length >= 2" class="fixed inset-0 z-40" @click="clearSearch"></div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useSettings } from '@/composables/useSettings'
import { useGlobalSearch } from '@/composables/useGlobalSearch'
import { useSearchNav } from '@/composables/useSearchNav'

defineEmits(['new-ticket'])
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
</script>
