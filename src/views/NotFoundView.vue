<template>
  <div class="flex flex-col items-center justify-center text-center py-xl">
    <span class="material-symbols-outlined text-[64px] text-outline mb-md">search_off</span>
    <h2 class="text-headline-md font-bold text-on-surface mb-xs">Page Not Found</h2>
    <p class="text-body-md text-on-surface-variant mb-md">The page you're looking for doesn't exist or has been moved.</p>
    <router-link to="/dashboard" class="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-md font-bold hover:bg-primary-container transition-colors">Go to Dashboard</router-link>
  </div>
</template>
