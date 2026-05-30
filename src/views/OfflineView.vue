<template>
  <div class="flex flex-col items-center justify-center text-center py-xl">
    <span class="material-symbols-outlined text-[64px] text-outline mb-md">wifi_off</span>
    <h2 class="text-headline-md font-bold text-on-surface mb-xs">No Connection</h2>
    <p class="text-body-md text-on-surface-variant mb-md">You appear to be offline. Please check your network connection.</p>
    <button @click="retry" class="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-md font-bold hover:bg-primary-container transition-colors">Try Again</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
function retry() { router.go(0) }
</script>
