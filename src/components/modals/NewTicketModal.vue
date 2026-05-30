<template>
  <div>
    <div class="flex items-center justify-between p-4 border-b border-outline-variant">
      <h3 class="text-headline-sm font-headline-md text-on-surface">Create New Ticket</h3>
      <button @click="$emit('close')" class="p-1 rounded hover:bg-surface-container text-on-surface-variant">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <form @submit.prevent="submit" class="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
      <div>
        <label class="text-label-md font-label-md text-on-surface">Title</label>
        <input v-model="form.title" class="w-full mt-1 px-3 py-2 border border-outline-variant rounded text-body-sm bg-surface focus:ring-1 focus:ring-primary" required />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-label-md font-label-md text-on-surface">Priority</label>
          <select v-model="form.priority" class="w-full mt-1 px-3 py-2 border border-outline-variant rounded text-body-sm bg-surface">
            <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
          </select>
        </div>
        <div>
          <label class="text-label-md font-label-md text-on-surface">Category</label>
          <select v-model="form.category" class="w-full mt-1 px-3 py-2 border border-outline-variant rounded text-body-sm bg-surface">
            <option>Network</option><option>Hardware</option><option>Software</option><option>Access</option>
          </select>
        </div>
      </div>
      <div>
        <label class="text-label-md font-label-md text-on-surface">Description</label>
        <textarea v-model="form.description" rows="4" class="w-full mt-1 px-3 py-2 border border-outline-variant rounded text-body-sm bg-surface focus:ring-1 focus:ring-primary"></textarea>
      </div>
      <div>
        <label class="text-label-md font-label-md text-on-surface">Department</label>
        <select v-model="form.department" class="w-full mt-1 px-3 py-2 border border-outline-variant rounded text-body-sm bg-surface">
          <option>ER</option><option>Imaging & Radiology</option><option>Pharmacy</option><option>Infrastructure</option><option>Administration</option><option>Pathology Lab</option><option>Finance</option><option>ICT</option><option>Maternity</option><option>LAB</option><option>Super Admin</option><option>Procurement</option><option>Human Resources</option>
        </select>
      </div>
    </form>
    <div class="flex justify-end gap-3 p-4 border-t border-outline-variant">
      <button @click="$emit('close')" class="px-4 py-2 border border-outline-variant rounded text-label-md text-on-surface hover:bg-surface-container">Cancel</button>
      <button @click="submit" class="px-4 py-2 bg-primary text-on-primary rounded text-label-md hover:bg-primary-container">Create Ticket</button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useToast } from '@/composables/useToast'

const emit = defineEmits(['close'])
const toast = useToast()

const form = reactive({
  title: '', priority: 'Medium', category: 'Network', description: '', department: 'ER'
})

function submit() {
  toast.success('Ticket created successfully!')
  emit('close')
}
</script>
