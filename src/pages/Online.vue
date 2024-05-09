<template>
  <template v-if="!onlineGame.gameSession?.game">
    <h2>
      Room Code: {{ onlineGame.gameSession?.roomCode }}
    </h2>
  </template>
  <template v-else-if="onlineGame.gameSession.game">
    <GameLayout
      :menuItems="[]"
      :winner="onlineGame.gameSession?.game.winner ?? null"
    >
      <GlobalBoard
        :board="onlineGame.gameSession?.game.board"
        :activeBoards="onlineGame.gameSession?.game.activeBoards"
        :currentPlayer="onlineGame.gameSession?.game.currentPlayer"
        @takeTurn="onlineGame.takeTurn"
      />
    </GameLayout>
  </template>
</template>

<script setup lang="ts">
import GameLayout from '../components/GameLayout.vue';
import GlobalBoard from '../components/GlobalBoard.vue';
import { useOnline } from '../store/online';

const onlineGame = useOnline();
</script>