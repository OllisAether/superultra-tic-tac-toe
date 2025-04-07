<template>
  <GameLayout
    :menuItems="[
      {
        title: 'New Game',
        click: () => startGame(true),
      },
      {
        title: 'Quit',
        click: () => {
          router.push('/')
        },
      },
    ]"
    :winner="winner"
    @restart="startGame(true)"
  >
    <template #title>
      <span>Local Game</span>
    </template>

    <template #info>
      <div class="local__current-player">
        <span>Current player:</span>
        <XIcon class="local__current-player__icon" v-if="currentPlayer === 'x'" />
        <OIcon class="local__current-player__icon" v-else />
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
import { Game } from '../../shared/Game'
import { ref, onBeforeUnmount } from 'vue'
import GameLayout from '../components/GameLayout.vue'
import router from '../router'
import type { GlobalBoard } from '../../shared/TicTacToe'

let game: Game

const board = ref<GlobalBoard>()
const currentPlayer = ref<'x' | 'o'>()
const activeBoards = ref<number[]>()
const winner = ref<'x' | 'o' | 'draw' | null>(null)

startGame()
function startGame (reset = false) {
  if (reset) {
    localStorage.removeItem('game')
  }
  if (game) game.destroy()

  const savedGame = localStorage.getItem('game')
  if (savedGame) {
    const parsedGame = JSON.parse(savedGame)
    game = new Game(
      parsedGame.board,
      parsedGame.currentPlayer,
      parsedGame.activeBoards,
      parsedGame.winner,
    )
  } else {
    game = new Game()
  }

  function saveGame () {
    localStorage.setItem('game', JSON.stringify({
      board: game.board,
      currentPlayer: game.currentPlayer,
      activeBoards: game.activeBoards,
      winner: game.winner,
    }))
  }
  saveGame()

  board.value = game.board
  currentPlayer.value = game.currentPlayer
  activeBoards.value = game.activeBoards
  winner.value = game.winner

  game.onNextTurn((_board, _currentPlayer, _activeBoards) => {
    board.value = _board
    currentPlayer.value = _currentPlayer
    activeBoards.value = _activeBoards

    saveGame()
  })

  game.onWin((_winner) => {
    winner.value = _winner

    saveGame()
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
.local {
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