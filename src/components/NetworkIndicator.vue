<template>
  <div class="relative flex items-center cursor-help" :title="tip">
    <div class="flex items-end gap-[2px] h-5 px-1.5">
      <div v-for="i in 4" :key="i"
        class="w-[3px] rounded-sm transition-all duration-300"
        :class="i <= network.bars ? network.color : 'bg-outline-variant/30'"
        :style="{ height: `${4 + i * 4}px` }"
      ></div>
    </div>
    <div v-if="sync.pendingCount > 0"
      class="absolute -top-1.5 -right-1 w-4 h-4 rounded-full bg-amber-400 text-[9px] font-bold text-white flex items-center justify-center shadow-sm"
      :title="`${sync.pendingCount} operation${sync.pendingCount > 1 ? 's' : ''} pending sync`"
    >{{ sync.pendingCount }}</div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useSyncStore } from '@/stores/sync'

const ui = useUIStore()
const sync = useSyncStore()

const network = reactive({ bars: 4, rtt: 0, color: 'bg-green-500' })
let pingTimer = null

const tip = computed(() => {
  if (!ui.isOnline) return 'Offline — showing cached data'
  if (sync.pendingCount > 0) return `${network.rtt}ms · ${sync.pendingCount} pending`
  return `${network.rtt}ms · online`
})

async function checkLatency() {
  const start = performance.now()
  try {
    await fetch('https://clients3.google.com/generate_204', { mode: 'no-cors', cache: 'no-store' })
    const rtt = Math.round(performance.now() - start)
    network.rtt = rtt
    if (rtt >= 3000) {
      network.bars = 0; network.color = 'bg-outline-variant'
    } else if (rtt >= 1000) {
      network.bars = 1; network.color = 'bg-error'
    } else if (rtt >= 400) {
      network.bars = 2; network.color = 'bg-orange-400'
    } else if (rtt >= 150) {
      network.bars = 3; network.color = 'bg-yellow-500'
    } else {
      network.bars = 4; network.color = 'bg-green-500'
    }
  } catch {
    if (!navigator.onLine) ui.isOnline = false
    network.bars = 0; network.color = 'bg-outline-variant'
    network.rtt = -1
  }
}

function startPinging() {
  checkLatency()
  pingTimer = setInterval(checkLatency, 30000)
}

function stopPinging() {
  if (pingTimer) { clearInterval(pingTimer); pingTimer = null }
}

onMounted(() => {
  startPinging()
  window.addEventListener('online', checkLatency)
  window.addEventListener('offline', checkLatency)
})

onUnmounted(() => {
  stopPinging()
  window.removeEventListener('online', checkLatency)
  window.removeEventListener('offline', checkLatency)
})
</script>
