<template>
  <GameLayout
    ref="gameLayout"
    :menuItems="[
      {
        title: 'Leave Game',
        click: () => {
          leaveDialog = true
        }
      }
    ]"
    :winner="onlineGame.game?.winner ?? null"
    :player="onlineGame.game?.player ?? 'x'"
    @restart="onlineGame.rematch()"
    is-online
    :rematch="onlineGame.game?.wantsRematch"
  >
    <template #title>
      <template v-if="onlineGame.game?.opponentLeft">
        Code: {{ onlineGame.game?.roomId }}

        <button class="copy-code" aria-label="Copy room code" @click="copyRoomCode">
          <VIcon v-if="copyCodeSuccess">
            mdi-check-circle-outline
          </VIcon>
          <VIcon v-else>mdi-clipboard-multiple-outline</VIcon>
        </button>
      </template>
      <template v-else>
        <XIcon v-if="onlineGame.game?.player === 'x'" />
        <OIcon v-else />
      </template>
    </template>
    <template #info>
      <div :class="{ 'info-alert': infoAlert }">
        <template v-if="!onlineGame.game?.board">
          Waiting for an opponent to join...
        </template>
        <template v-else-if="onlineGame.game?.opponentLeft && onlineGame.game?.board">
          Your opponent has left the game.<br />
          They can rejoin using the same room code.
        </template>
        <template v-else-if="onlineGame.game?.currentPlayer === onlineGame.game?.player">
          It's your turn!
        </template>
        <template v-else-if="onlineGame.game?.currentPlayer">
          Waiting for your opponent to take their turn...
        </template>
      </div>
    </template>

    <GlobalBoard
      :board="onlineGame.game?.board ?? createGlobalBoard()"
      :activeBoards="onlineGame.game?.activeBoards ?? []"
      :currentPlayer="onlineGame.game?.currentPlayer ?? 'x'"
      @takeTurn="takeTurn"
    />

    <VDialog
      v-model="leaveDialog"
      max-width="400"
    >
      <VCard
        :title="'Leave game?'"
        :text="'You can rejoin using the same room code as long as your opponent is still in the game.'"
      >
        <VCardActions>
          <VBtn
            @click="leaveDialog = false"
          >
            <XIcon width="1.5rem" style="margin-right: .5rem;" /> Cancel
          </VBtn>
          <VBtn
            @click="leaveRoom"
          >
            <OIcon width="1.5rem" style="margin-right: .5rem;" /> Leave
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </GameLayout>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import GameLayout from '../components/GameLayout.vue';
import { createGlobalBoard } from '../../shared/TicTacToe';
import XIcon from '../components/XIcon.vue';
import OIcon from '../components/OIcon.vue';
import { useOnlineGame } from '@/store/onlineGame';
import GlobalBoard from '@/components/GlobalBoard.vue';
import { onMounted, ref, toRef, watch } from 'vue';

const onlineGame = useOnlineGame();
const route = useRoute();

const leaveDialog = ref(false);

const gameLayout = ref<InstanceType<typeof GameLayout> | null>(null);

if (!onlineGame.game) {
  const roomId = route.params.room as string;
  onlineGame.connectToRoom(roomId);
}

onMounted(() => {
  if (onlineGame.game?.board) {
    gameStarted.value = true;
    gameLayout.value?.triggerPlayer();
  }
})

const gameStarted = ref(false);
watch(() => onlineGame.game?.board, (newBoard) => {
  if (newBoard && !gameStarted.value) {
    gameStarted.value = true;
    gameLayout.value?.triggerPlayer();
  }
})
watch(() => onlineGame.game?.flippedBoard, () => {
  gameLayout.value?.triggerPlayer();
})

function leaveRoom () {
  onlineGame.disconnect()
}

const copyCodeSuccess = ref(false);
function copyRoomCode () {
  navigator.clipboard.writeText(onlineGame.game?.roomId ?? '')
    .then(() => {
      copyCodeSuccess.value = true;
      setTimeout(() => {
        copyCodeSuccess.value = false;
      }, 1000);
    })
}

const infoAlert = ref(false);
function triggerAlert () {
  if (!infoAlert.value) {
    infoAlert.value = true;
    setTimeout(() => {
      infoAlert.value = false;
    }, 1000);
  }
}

function takeTurn (boardIndex: number, fieldIndex: number) {
  if (onlineGame.game) {
    if (onlineGame.game.currentPlayer !== onlineGame.game.player) {
      triggerAlert()
      return
    }

    if (onlineGame.game?.opponentLeft) {
      triggerAlert()
      return
    }

    onlineGame.takeTurn(boardIndex, fieldIndex);
  }
}
</script>


<style scoped lang="scss">
.info-alert {
  color: #f33;
  animation: wiggle 1s linear forwards;

  @keyframes wiggle {
    0%,
    100% {
      transform: translateX(0);
    }

    10%,
    30%,
    50%,
    70% {
      transform: translateX(-5px);
    }

    20%,
    40%,
    60% {
      transform: translateX(5px);
    }

    80% {
      transform: translateX(4px);
    }

    90% {
      transform: translateX(-4px);
    }
  }
}

.copy-code {
  margin-left: .2rem;
  display: inline-flex;
  width: 1em;
  height: 1.6em;
  justify-content: center;
  align-items: center;

  color: #fff8;

  & > * {
    font-size: .8em;
  }

  &:hover {
    color: #fff;
  }
}
</style>