<template>
  <RouterLink v-bind="$attrs" v-if="to" :to="to" class="btn">
    <slot />
  </RouterLink>
  <button v-bind="$attrs" v-else class="btn">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { type RouteLocationRaw } from 'vue-router';

defineProps<{
  to?: RouteLocationRaw
}>()
</script>

<style scoped lang="scss">
.btn {
  appearance: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5em 1em;
  border-radius: 0.5em;
  background: #fff1;
  border: .125rem solid #fff0;
  box-shadow: 0 0 1rem #0002;
  text-decoration: none;

  transition: background-color .15s, border-color .15s .1s;

  &:hover {
    background: #fff2;
    border: .125rem solid #fff2;
  }

  &:active {
    background: #fff3;
    border: .125rem solid #fff3;
  }

  &:focus-visible {
    outline: none;
    background: #fff2;
    border: .125rem solid #fff2;
  }
}
</style>