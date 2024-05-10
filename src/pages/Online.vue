<template>
  <!-- <template v-if="!onlineGame.gameSession?.game">
    <h2>
      Room Code: {{ onlineGame.gameSession?.roomCode }}
    </h2>
  </template> -->
  <GameLayout
    :menuItems="[
      {
        title: 'Leave Game',
        click: () => {
          onlineGame.leaveRoom()

          // Redirect to the home page
          router.push('/')
        }
      }
    ]"
    :winner="onlineGame.gameSession?.game?.winner ?? null"
  >
      <template #title>
        <template v-if="onlineGame.gameSession?.opponentLeft || !onlineGame.gameSession?.game">
          Code: {{ onlineGame.gameSession?.roomCode }}
        </template>
        <template v-else>
          <XIcon v-if="onlineGame.gameSession?.player === 'x'" />
          <OIcon v-else />
        </template>
      </template>
      <template #info>
        <template v-if="!onlineGame.gameSession?.game">
          Waiting for an opponent to join...
        </template>
        <template v-if="onlineGame.gameSession?.opponentLeft">
            Your opponent has left the game.<br />
            They can rejoin using the same room code.
        </template>
        <template v-if="onlineGame.gameSession?.game?.currentPlayer === onlineGame.gameSession?.player">
          It's your turn!
        </template>
        <template v-else-if="onlineGame.gameSession?.game?.currentPlayer">
          Waiting for your opponent to take their turn...
        </template>
      </template>

    <GlobalBoard
      :board="onlineGame.gameSession?.game?.board ?? createGlobalBoard()"
      :activeBoards="onlineGame.gameSession?.game?.activeBoards ?? []"
      :currentPlayer="onlineGame.gameSession?.game?.currentPlayer ?? 'x'"
      @takeTurn="onlineGame.takeTurn"
    />
  </GameLayout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import GameLayout from '../components/GameLayout.vue';
import GlobalBoard from '../components/GlobalBoard.vue';
import { useOnline } from '../store/online';
import { createGlobalBoard } from '../server/models/TicTacToe';
import XIcon from '../components/XIcon.vue';
import OIcon from '../components/OIcon.vue';

const router = useRouter();
const onlineGame = useOnline();
</script>