<template>
  <div class="game-layout__wrapper">
    <div class="game-layout__info">
      <h2 class="game-layout__info__title">
        <slot name="title" />
      </h2>

      <div class="game-layout__info__scroller">
        <slot name="info" />

      <div class="game-layout__info__spacer"></div>

        <transition name="game-layout__info__menu">
          <div v-if="menuOpen"class="game-layout__info__menu">
            <Btn
              v-for="item in menuItems"
              class="game-layout__info__menu__button"
              @click="item.click"
            >
              {{ item.title }}
            </Btn>
          </div>
        </transition>
      </div>

      <button
        @click="menuOpen = !menuOpen"
        :class="['game-layout__info__menu-button', {
          'game-layout__info__menu-button--open': menuOpen
        }]"
      >
        <MenuIcon class="game-layout__info__menu-button__menu-icon game-layout__info__menu-button__icon" />
        <ChevronIcon class="game-layout__info__menu-button__chevron-icon game-layout__info__menu-button__icon" />
      </button>
    </div>
    <div class="game-layout__board">
      <div :class="['game-layout__board__content', {
        'game-layout__board__content--win': winner,
        'game-layout__board__content--player': showPlayer
      }]">
        <slot />
      </div>

      <transition name="game-layout__win-overlay">
        <div v-if="winner" class="game-layout__win-overlay">
          <template v-if="winner === 'x'">
            <XIcon :width="1" class="game-layout__win-overlay__player" />
            <span>is the winner!</span>
          </template>
          <template v-else-if="winner === 'o'">
            <OIcon :width="1" class="game-layout__win-overlay__player" />
            <span>is the winner!</span>
          </template>
          <template v-else-if="winner === 'draw'">
            <span class="game-layout__win-overlay__draw">is the winner!</span>
          </template>

          <Btn class="game-layout__win-overlay__reset-btn" @click="emit('restart')">
            <template v-if="isOnline">
              Rematch ({{ rematch ? '1' : '0' }} / 2)
            </template>
            <template v-else>
              Start new game
            </template>
          </Btn>
        </div>
      </transition>

      <transition name="game-layout__player-overlay">
        <div v-if="showPlayer" class="game-layout__player-overlay">
          <div>
            You are
          </div>
          <template v-if="player === 'x'">
            <XIcon :width="1" class="game-layout__player-overlay__player" />
          </template>
          <template v-else-if="player === 'o'">
            <OIcon :width="1" class="game-layout__player-overlay__player" />
          </template>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import Btn from './Btn.vue';
import ChevronIcon from './ChevronIcon.vue';
import MenuIcon from './MenuIcon.vue';
import OIcon from './OIcon.vue';
import XIcon from './XIcon.vue';
import { ref } from 'vue';

defineProps<{
  menuItems: { title: string, click: () => void }[]
  winner: 'x' | 'o' | 'draw' | null,
  player?: 'x' | 'o' | null,
  isOnline?: boolean,
  rematch?: 'x' | 'o' | null
}>()

const emit = defineEmits<{
  restart: []
}>()

const menuOpen = ref(false)

const showPlayer = ref(false)

function triggerPlayer () {
  showPlayer.value = true
  setTimeout(() => {
    showPlayer.value = false
  }, 1000)
}

defineExpose({
  triggerPlayer
})
</script>


<style scoped lang="scss">
.game-layout{
  &__wrapper {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(calc(85vh - 5rem), 95vw);
  }

  &__board {
    position: relative;
    height: 100%;
    width: 100%;

    &__content {
      transition: filter .3s, opacity .3s;

      &--win, &--player {
        filter: blur(.25rem);
        opacity: 0.5;
      }
    }
  }

  &__info {
    height: 5rem;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    width: 100%;
    right: calc(100% + 1rem);
    background: #fff2;
    border-radius: 1rem;
    overflow: hidden;

    @media screen and (max-width: 768px){
      height: fit-content;
      flex-flow: row wrap;
      font-size: .8rem;
    }

    &__title {
      flex: 0 0 auto;
      font-size: 2rem;
      padding: 0 1.5rem 0 .5rem;
      margin: 1rem 0 1rem 1rem;
      font-weight: bold;
      border-right: .125rem solid #fff2;

      :deep(svg) {
        display: inline-block;
        vertical-align: middle;
        width: 1.2em;
        height: 1.2em;
      }

      @media (max-width: 768px) {
        width: 100%;
        font-size: 1rem;
        padding: 0 .5rem 0 .5rem;
        margin: 1rem 0 1rem .5rem;
      }
    }

    &__scroller {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      flex: 1 1 auto;
      align-self: stretch;
      width: 0;
      padding: 0 1rem;
      overflow: auto;

      white-space: nowrap;
      scrollbar-width: none;

      @media screen and (max-width: 768px) {
        padding: 0 1rem 1rem;
        flex-flow: row wrap;
        gap: .5rem;
        overflow: visible;
      }

      &::-webkit-scrollbar {
        display: none;
      }
    }

    &__spacer {
      flex: 1 1 auto;
    }

    &__menu {
      display: flex;
      gap: 1rem;
      clip-path: inset(0 0 0 0);
      flex: 0 0 auto;

      &-enter-active, &-leave-active {
        transition: .3s cubic-bezier(0.19, 1, 0.22, 1);
      }

      &-enter-from, &-leave-to {
        transform: translateX(2rem);
        opacity: 0;
      } 
    }

    &__menu-button {
      flex: 0 0 auto;
      margin: 0 1rem 0 0;
      position: relative;
      appearance: none;
      font: inherit;
      color: inherit;
      cursor: pointer;
      border-radius: 50%;
      width: 3rem;
      height: 3rem;
      background: #fff1;
      border: .125rem solid #fff0;
      box-shadow: 0 0 1rem #0002;
      overflow: hidden;

      transition: background-color .15s, border-color .15s .1s;
      @media screen and (max-width: 768px) {
        position: absolute;
        top: .5rem;
        right: -.5rem;
        width: 2rem;
        height: 2rem;

        .game-layout__info__menu-button__icon {
          width: 1rem;
          height: 1rem;
        }
      }

      &:hover {
        background: #fff2;
        border: .125rem solid #fff2;
      }

      &:active {
        background: #fff3;
        border: .125rem solid #fff3;
      }

      &__icon {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 1.5rem;
        height: 1.5rem;
        transition: .3s cubic-bezier(0.19, 1, 0.22, 1);
      }

      &__chevron-icon {
        left: 150%;
        transform: translate(0, -50%);
      }

      &__menu-icon {
        right: 50%;
        transform: translate(50%, -50%);
      }

      &--open {
        .game-layout__info__menu-button__menu-icon {
          right: 150%;
          transform: translate(0, -50%)
        }

        .game-layout__info__menu-button__chevron-icon {
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }
  }

  &__win-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &__player {
      width: 10rem;
      height: 10rem;
      margin-bottom: 2rem;
    }

    span {
      font-size: 3rem;
      text-align: center;
      margin-bottom: 4rem;
      padding: 0;
    }

    &__reset-btn {
      font-size: 1.5rem;
    }

    &-enter-active, &-leave-active {
      transition: .3s cubic-bezier(0.19, 1, 0.22, 1);
    }

    &-enter-from, &-leave-to {
      opacity: 0;
      transform: scale(0.5);
    }
  }

  &__player-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    text-align: center;

    &__player {
      width: 10rem;
      height: 10rem;
      margin-bottom: 2rem;
    }

    &-enter-active, &-leave-active {
      transition: .3s cubic-bezier(0.19, 1, 0.22, 1);
    }
    &-enter-from, &-leave-to {
      opacity: 0;
      transform: scale(0.5);
    }
  }
}
</style>