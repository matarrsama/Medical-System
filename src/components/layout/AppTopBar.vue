<template>
  <header class="bg-surface-container-lowest dark:bg-inverse-surface text-primary border-b border-outline-variant dark:border-outline flex justify-between items-center w-full px-lg h-16 sticky top-0 z-30 shrink-0">
    <div class="flex items-center gap-md w-1/3">
      <span class="text-headline-md font-headline-md font-bold text-primary dark:text-inverse-primary truncate">{{ hospitalName }}</span>
    </div>
    <div class="flex-1 flex justify-center max-w-md w-1/3">
      <div class="relative w-full">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-outline">search</span>
        <input
          v-model="searchQuery"
          class="w-full bg-surface-container-low dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-full py-2 pl-10 pr-4 text-body-md text-on-surface dark:text-inverse-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-on-surface-variant transition-colors"
          placeholder="Search tickets, assets, users..."
          type="text"
        />
      </div>
    </div>
    <div class="flex items-center justify-end gap-md w-1/3">
      <div class="flex items-center gap-xs">
        <button class="p-2 rounded-full hover:bg-surface-container-low dark:hover:bg-surface-variant transition-colors text-on-surface-variant">
          <span class="material-symbols-outlined">terminal</span>
        </button>
        <button class="p-2 rounded-full hover:bg-surface-container-low dark:hover:bg-surface-variant transition-colors text-on-surface-variant relative">
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
      <div class="ml-sm w-9 h-9 rounded-full overflow-hidden border-2 border-surface-container-highest cursor-pointer hover:border-primary transition-colors shrink-0">
        <img class="w-full h-full object-cover" :src="auth.user?.avatar" alt="User profile" />
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useSettings } from '@/composables/useSettings'

defineEmits(['new-ticket'])
const ui = useUIStore()
const auth = useAuthStore()
const { hospitalName } = useSettings()
const searchQuery = ref('')
</script>
