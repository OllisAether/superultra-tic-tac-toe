<template>
  <GameLayout
    :menuItems="[
      {
        title: 'New Game',
        click: startNewGame,
      },
      {
        title: 'Quit',
        click: () => {
          router.push('/')
        },
      },
    ]"
    :winner="winner"
    @restart="startNewGame"
  >
    <template #title>
      <span>Offline Game</span>
    </template>

    <template #info>
      <div class="offline__current-player">
        <span>Current player:</span>
        <XIcon class="offline__current-player__icon" v-if="currentPlayer === 'x'" />
        <OIcon class="offline__current-player__icon" v-else />
      </div>
    </template>

    <GlobalBoardComponent
      v-if="board && currentPlayer && activeBoards"
      :board="board"
      :activeBoards="activeBoards"
      :currentPlayer="currentPlayer"
      @takeTurn="takeTurn"
    />
  </GameLayout>
</template>

<script setup lang="ts">
import GlobalBoardComponent from '../components/GlobalBoard.vue'
import OIcon from '../components/OIcon.vue'
import XIcon from '../components/XIcon.vue'
import { Game } from '../server/models/Game'
import { ref, onBeforeUnmount } from 'vue'
import GameLayout from '../components/GameLayout.vue'
import { GlobalBoard } from '../server/models/TicTacToe'
import router from '../router'

let game: Game

const board = ref<GlobalBoard>()
const currentPlayer = ref<'x' | 'o'>()
const activeBoards = ref<number[]>()
const winner = ref<'x' | 'o' | 'draw' | null>(null)

startNewGame()
function startNewGame () {
  if (game) game.destroy()

  game = new Game()

  board.value = game.getBoard()
  currentPlayer.value = game.getCurrentPlayer()
  activeBoards.value = game.getActiveBoards()
  winner.value = null

  game.onNextTurn((_board, _currentPlayer, _activeBoards) => {
    board.value = _board
    currentPlayer.value = _currentPlayer
    activeBoards.value = _activeBoards
  })

  game.onWin((_winner) => {
    winner.value = _winner
  })
}

function takeTurn(boardIndex: number, fieldIndex: number) {
  if (!game) return

  game.takeTurn(boardIndex, fieldIndex)
}

onBeforeUnmount(() => {
  if (game) game.destroy()
})
</script>

<style scoped lang="scss">
.offline {
  &__current-player {
    display: flex;
    align-items: center;
    gap: .5rem;

    &__icon {
      width: 2rem;
      height: 2rem;
    }
  }
}
</style>