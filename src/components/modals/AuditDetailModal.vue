<template>
  <div>
    <div class="flex items-center justify-between p-4 border-b border-outline-variant">
      <h3 class="text-headline-sm font-headline-md text-on-surface">Audit Log Details</h3>
      <button @click="$emit('close')" class="p-1 rounded hover:bg-surface-container text-on-surface-variant">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="p-4 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div><span class="text-label-sm text-on-surface-variant">Timestamp</span><p class="text-body-md text-on-surface">2026-05-30 10:14:22</p></div>
        <div><span class="text-label-sm text-on-surface-variant">User</span><p class="text-body-md text-on-surface">Ahmed Al-Rashid</p></div>
        <div><span class="text-label-sm text-on-surface-variant">Action</span><p class="text-body-md"><span class="px-2 py-0.5 rounded text-label-sm bg-blue-100 text-blue-800">Update</span></p></div>
        <div><span class="text-label-sm text-on-surface-variant">Resource</span><p class="text-body-md text-on-surface">Ticket INC-9042</p></div>
      </div>
      <div class="pt-4 border-t border-outline-variant">
        <span class="text-label-sm text-on-surface-variant">Details</span>
        <p class="text-body-md text-on-surface mt-1">Changed status from "Open" to "Investigating". Added internal note regarding PACS server diagnostic results.</p>
      </div>
    </div>
    <div class="flex justify-end p-4 border-t border-outline-variant">
      <button @click="$emit('close')" class="px-4 py-2 border border-outline-variant rounded text-label-md text-on-surface hover:bg-surface-container">Close</button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['close'])
</script>
