<template>
  <svg
    class="x-icon"
    v-bind="$attrs"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="none"
    :stroke-width="stroke"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M4 4L12 12M4 12L12 4" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  stroke?: number
}>(), {
  stroke: 1.5
})
</script>

<style scoped lang="scss">
.x-icon {
  stroke: #fda;
  filter: drop-shadow(0 0 4px #f8a) drop-shadow(0 0 8px #f64) drop-shadow(0 0 16px #f22);
}
</style>
