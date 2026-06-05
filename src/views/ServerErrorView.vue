<template>
  <div class="flex flex-col items-center justify-center text-center py-xl">
    <span class="material-symbols-outlined text-[64px] text-error mb-md">report_problem</span>
    <h2 class="text-headline-md font-bold text-on-surface dark:text-inverse-on-surface mb-xs">Server Error</h2>
    <p class="text-body-md text-on-surface-variant dark:text-outline mb-md">Something went wrong on our end. Please try again later.</p>
    <router-link to="/dashboard" class="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-md font-bold hover:bg-primary-container transition-colors">Go to Dashboard</router-link>
  </div>
</template>
