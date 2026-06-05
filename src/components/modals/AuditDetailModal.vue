<template>
  <div>
    <div class="flex items-center justify-between p-4 border-b border-outline-variant dark:border-outline">
      <h3 class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface">Audit Log Details</h3>
      <button @click="$emit('close')" class="p-1 rounded hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="p-4 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div><span class="text-label-sm text-on-surface-variant dark:text-outline">Timestamp</span><p class="text-body-md text-on-surface dark:text-inverse-on-surface">2026-05-30 10:14:22</p></div>
        <div><span class="text-label-sm text-on-surface-variant dark:text-outline">User</span><p class="text-body-md text-on-surface dark:text-inverse-on-surface">Ahmed Al-Rashid</p></div>
        <div><span class="text-label-sm text-on-surface-variant dark:text-outline">Action</span><p class="text-body-md"><span class="px-2 py-0.5 rounded text-label-sm bg-blue-100 text-blue-800">Update</span></p></div>
        <div><span class="text-label-sm text-on-surface-variant dark:text-outline">Resource</span><p class="text-body-md text-on-surface dark:text-inverse-on-surface">Ticket INC-9042</p></div>
      </div>
      <div class="pt-4 border-t border-outline-variant dark:border-outline">
        <span class="text-label-sm text-on-surface-variant dark:text-outline">Details</span>
        <p class="text-body-md text-on-surface dark:text-inverse-on-surface mt-1">Changed status from "Open" to "Investigating". Added internal note regarding PACS server diagnostic results.</p>
      </div>
    </div>
    <div class="flex justify-end p-4 border-t border-outline-variant dark:border-outline">
      <button @click="$emit('close')" class="px-4 py-2 border border-outline-variant dark:border-outline rounded text-label-md text-on-surface dark:text-inverse-on-surface hover:bg-surface-container dark:hover:bg-white/[0.08]">Close</button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['close'])
</script>
