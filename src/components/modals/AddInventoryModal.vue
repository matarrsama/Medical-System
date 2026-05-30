<template>
  <div>
    <div class="flex items-center justify-between p-4 border-b border-outline-variant">
      <h3 class="text-headline-sm font-headline-md text-on-surface">Add Inventory Asset</h3>
      <button @click="$emit('close')" class="p-1 rounded hover:bg-surface-container text-on-surface-variant">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <form @submit.prevent="submit" class="p-4 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-label-md font-label-md text-on-surface">Asset Name</label>
          <input v-model="form.name" class="w-full mt-1 px-3 py-2 border border-outline-variant rounded text-body-sm bg-surface" required />
        </div>
        <div>
          <label class="text-label-md font-label-md text-on-surface">Category</label>
          <select v-model="form.category" class="w-full mt-1 px-3 py-2 border border-outline-variant rounded text-body-sm bg-surface">
            <option>Desktop</option><option>Network</option><option>Printer</option><option>Server</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-label-md font-label-md text-on-surface">Department</label>
          <select v-model="form.department" class="w-full mt-1 px-3 py-2 border border-outline-variant rounded text-body-sm bg-surface">
            <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
          </select>
        </div>
        <div>
          <label class="text-label-md font-label-md text-on-surface">Status</label>
          <select v-model="form.status" class="w-full mt-1 px-3 py-2 border border-outline-variant rounded text-body-sm bg-surface">
            <option>Active</option><option>Maintenance</option><option>Retired</option>
          </select>
        </div>
      </div>
    </form>
    <div class="flex justify-end gap-3 p-4 border-t border-outline-variant">
      <button @click="$emit('close')" class="px-4 py-2 border border-outline-variant rounded text-label-md text-on-surface hover:bg-surface-container">Cancel</button>
      <button @click="submit" :disabled="saving" class="px-4 py-2 bg-primary text-on-primary rounded text-label-md hover:bg-primary-container flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
        <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
        Add Asset
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { db } from '@/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'

const emit = defineEmits(['close'])
const toast = useToast()
const saving = ref(false)
const departments = ref([])
let unsubDepts = null

const form = reactive({ name: '', category: 'Desktop', department: 'ER', status: 'Active' })

function submit() {
  saving.value = true
  toast.success('Asset added successfully!')
  emit('close')
  saving.value = false
}

onMounted(() => {
  unsubDepts = onSnapshot(collection(db, 'departments'), (snap) => {
    departments.value = snap.docs.map(d => d.data().name)
  })
})

onUnmounted(() => {
  if (unsubDepts) unsubDepts()
})
</script>
