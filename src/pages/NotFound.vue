<script lang="ts" setup>
import Btn from '@/components/Btn.vue';


</script>

<template>
  <div class="wrapper">
    <h2>
      <span>404</span>
      <span> - </span>
      <span>Page Not Found</span>
    </h2>
    <div class="buttons">
      <Btn
        to="/"
        class="home-button"
      >
        Go to Home
      </Btn>
    </div>
  </div>
</template>