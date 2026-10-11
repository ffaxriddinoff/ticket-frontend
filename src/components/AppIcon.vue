<script setup lang="ts">
defineProps<{ name: string; size?: number }>()

const paths: Record<string, string[]> = {
  train: ['M8 3h8a4 4 0 0 1 4 4v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a4 4 0 0 1 4-4Z', 'M4 11h16M12 3v8M8 20l-2 2m10-2 2 2M8 16h.01M16 16h.01'],
  home: ['m3 10 9-7 9 7', 'M5 9v12h5v-7h4v7h5V9'],
  bell: ['M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9', 'M10 21h4'],
  user: ['M20 21v-2a7 7 0 0 0-14 0v2', 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z'],
  plus: ['M12 5v14M5 12h14'],
  arrow: ['M4 12h16m-6-6 6 6-6 6'],
  back: ['M20 12H4m6-6-6 6 6 6'],
  chevron: ['m9 5 7 7-7 7'],
  swap: ['M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4'],
  calendar: ['M8 2v4M16 2v4M3 10h18', 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z', 'M8 14h2m4 0h2M8 18h2'],
  pin: ['M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z', 'M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'],
  telegram: ['m22 2-7 20-4-8-9-4L22 2Z', 'm22 2-11 12'],
  check: ['m5 12 4 4L19 6'],
  shield: ['m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6l9-4Z', 'm8 12 3 3 5-6'],
  clock: ['M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z', 'M12 6v6l4 2'],
  edit: ['m16 3 5 5-12 12-6 1 1-6L16 3Z', 'm14 5 5 5'],
  trash: ['M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7'],
  close: ['m6 6 12 12M6 18 18 6'],
  info: ['M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z', 'M12 11v6M12 7h.01'],
  seat: ['M5 3v12h14M5 10h9a3 3 0 0 1 3 3v2M7 15v6m10-6v6'],
  refresh: ['M20 7a9 9 0 1 0 1 8', 'M20 2v5h-5'],
  filter: ['M4 6h16M7 12h10M10 18h4'],
  document: ['M14 2H5v20h14V7l-5-5Z', 'M14 2v5h5M8 12h8M8 16h5'],
  sparkles: ['m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z'],
}
</script>

<template>
  <svg :width="size || 20" :height="size || 20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path v-for="(path, index) in paths[name] || paths.info" :key="index" :d="path" />
  </svg>
</template>
