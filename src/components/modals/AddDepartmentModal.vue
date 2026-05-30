<template>
  <div>
    <div class="flex items-center justify-between p-4 border-b border-outline-variant">
      <h3 class="text-headline-sm font-headline-md text-on-surface">Add Department</h3>
      <button @click="$emit('close')" class="p-1 rounded hover:bg-surface-container text-on-surface-variant">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <form @submit.prevent="submit" class="p-4 space-y-4">
      <div>
        <label class="text-label-md font-label-md text-on-surface">Department Name</label>
        <input v-model="form.name" class="w-full mt-1 px-3 py-2 border border-outline-variant rounded text-body-sm bg-surface focus:ring-1 focus:ring-primary" required />
      </div>
      <div>
        <label class="text-label-md font-label-md text-on-surface">Department Head</label>
        <input v-model="form.head" class="w-full mt-1 px-3 py-2 border border-outline-variant rounded text-body-sm bg-surface" />
      </div>
      <div>
        <label class="text-label-md font-label-md text-on-surface">Location</label>
        <input v-model="form.location" class="w-full mt-1 px-3 py-2 border border-outline-variant rounded text-body-sm bg-surface" />
      </div>
    </form>
    <div class="flex justify-end gap-3 p-4 border-t border-outline-variant">
      <button @click="$emit('close')" class="px-4 py-2 border border-outline-variant rounded text-label-md text-on-surface hover:bg-surface-container">Cancel</button>
      <button @click="submit" class="px-4 py-2 bg-primary text-on-primary rounded text-label-md hover:bg-primary-container">Add Department</button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useToast } from '@/composables/useToast'

const emit = defineEmits(['close'])
const toast = useToast()

const form = reactive({ name: '', head: '', location: '' })

function submit() {
  toast.success('Department added successfully!')
  emit('close')
}
</script>
