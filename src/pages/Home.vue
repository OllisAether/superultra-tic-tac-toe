<template>
  <div class="wrapper">
    <h2>
      <span>SUPER</span>
      <span>ULTRA</span>
      <span> - </span>
      <span>TIC TAC TOE</span>
    </h2>
    <div class="buttons">
      <!-- <Textbox
        placeholder="Enter your name" 
        v-model="name"
        :error="nameError"
      /> -->

      <div class="spacer"></div>
      
      <Textbox
        class="code"
        placeholder="Enter game code"
        v-model="code"
        uppercase
      />
      <Btn @click="joinGame">Join Game</Btn>

      <div class="spacer"></div>

      <Btn @click="onlineGame.createRoom()">Create Game</Btn>

      <div class="divider"></div>
      <Btn to="/offline">
        Offline Game
      </Btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import Btn from '../components/Btn.vue';
import { ref } from 'vue';
import Textbox from '../components/Textbox.vue';
import { useOnline } from '../store/online';

const onlineGame = useOnline();

// const name = ref<string>('')
const code = ref<string>('')

// const nameError = computed(() => {
//   if (name.value.length === 0) return

//   if (name.value.trim().length < 3) {
//     return 'Name must be at least 3 characters long'
//   }
//   return ''
// })

function joinGame () {
  // if (nameError.value) return

  onlineGame.joinRoom('', code.value)
}
</script>

<style scoped lang="scss">
.wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

h2 {
  font-size: min(3rem, 7vw);
  text-align: center;
  margin: 0;
  padding: 0.5rem;
  font-weight: 400;

  span:nth-child(1) {
    color: #fda;
    text-shadow: 0 0 4px #f8a, 0 0 8px #f64, 0 0 16px #f22;
  }
  span:nth-child(2) {
    color: #aff;
    text-shadow: 0 0 4px #8af, 0 0 8px #48f, 0 0 16px #35f;
  }
  span:nth-child(3) {
    color: #fff8;
  }
}

.buttons {
  display: flex;
  flex-flow: column nowrap;
  align-items: stretch;
  justify-content: center;
  gap: .75rem;
  font-size: 1.5rem;
  max-width: 30rem;
  margin: 2rem auto 0;
  padding: 0 1rem;
}

.divider {
  height: .125rem;
  background: #fff2;
}

.spacer {
  flex: 1;
}
</style>