<template>
  <svg
    class="o-icon"
    v-bind="$attrs"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="none"
    :stroke-width="width"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="8" cy="8" r="6"/>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  width?: number
}>(), {
  width: 1.5
})
</script>

<style scoped lang="scss">
.o-icon {
  stroke: #aff;
  filter: drop-shadow(0 0 4px #8af) drop-shadow(0 0 8px #48f) drop-shadow(0 0 16px #35f);
}
</style>