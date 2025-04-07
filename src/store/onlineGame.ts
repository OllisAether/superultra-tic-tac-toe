import { defineStore } from "pinia"
import { ref, watch } from "vue"
import type { GlobalBoard } from "../../shared/TicTacToe"
import { useRouter } from "vue-router"

export const useOnlineGame = defineStore("onlineGame", () => {
  const ws = ref<WebSocket | null>(null)
  const router = useRouter()

  const game = ref<{
    roomId: string
    player: 'x' | 'o'
    board: GlobalBoard
    currentPlayer: 'x' | 'o'
    activeBoards: number[]
    winner: 'x' | 'o' | 'draw' | null
    opponentLeft: boolean,
    flippedBoard: boolean,
    wantsRematch: 'x' | 'o' | null
  } | null>(null)

  const loading = ref(false)
  function connectToRoom(roomId: string) {
    return new Promise<void>((resolve, reject) => {
      if (ws.value) {
        ws.value.close()
        ws.value = null
      }

      const url = (import.meta.env.VITE_API_URL?.replace('http', 'ws') ?? '') + '/api/room/' + roomId

      loading.value = true
      ws.value = new WebSocket(url)

      const off = watch(game, (game) => {
        if (game?.roomId) {
          loading.value = false
          router.push({ name: 'room', params: { room: game.roomId } })
          off()
        }
      }, { immediate: true })

      handleWs()

      function res () {
        resolve()
        ws.value?.removeEventListener('open', res)
        ws.value?.removeEventListener('close', rej)
        ws.value?.removeEventListener('error', rej)
      }

      function rej () {
        reject()
        ws.value?.removeEventListener('open', res)
        ws.value?.removeEventListener('close', rej)
        ws.value?.removeEventListener('error', rej)
      }

      ws.value.addEventListener('open', res)
      ws.value.addEventListener('close', rej)
      ws.value.addEventListener('error', rej)
    })
  }

  function rematch() {
    if (ws.value) {
      ws.value.send(JSON.stringify({ type: 'rematch' }))
    }
  }

  function createRoom() {
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }

    loading.value = true
    ws.value = new WebSocket((import.meta.env.VITE_API_URL?.replace('http', 'ws') ?? '') + '/api/create')

    const off = watch(game, (game) => {
      if (game?.roomId) {
        loading.value = false
        router.push({ name: 'room', params: { room: game.roomId } })
        off()
      }
    }, { immediate: true })

    handleWs()
  }

  function disconnect() {
    if (ws.value) {
      let timeout = setTimeout(() => {
        if (ws.value) {
          ws.value.close()
        }
      }, 1000)

      ws.value.addEventListener("close", () => {
        clearTimeout(timeout)
      })
      
      ws.value.send(JSON.stringify({ type: 'disconnect' }))
    }
  }

  function handleWs () {
    if (!ws.value) return
    
    function flip<T extends 'x' | 'o' | 'draw' | null>(value: T, flip: boolean) {
      if (flip) {
        return value === 'x' ? 'o' : (value === 'o' ? 'x' : value)
      }

      return value
    }

    ws.value.addEventListener("open", () => {
      console.log("Connected to room")
      ws.value?.send(JSON.stringify({ type: 'inital' }))
    })
    ws.value.addEventListener("message", (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'all') {
        console.log("Received all data", data)
        game.value = {
          roomId: data.roomId,
          player: flip(data.player, data.flippedBoard),
          board: (data.game?.board as GlobalBoard)?.map(board => ({
            fields: board.fields.map(field => flip(field, data.flippedBoard)),
            winner: flip(board.winner, data.flippedBoard)
          })) as GlobalBoard,
          currentPlayer: flip(data.game?.currentPlayer, data.flippedBoard),
          activeBoards: data.game?.activeBoards,
          winner: flip(data.winner, data.flippedBoard),
          opponentLeft: !data.opponentConnected,
          flippedBoard: data.flippedBoard,
          wantsRematch: data.wantsRematch
        }
      } else if (data.type === 'opponent') {
        if (game.value) {
          game.value.opponentLeft = !data.opponentConnected
        }
      } else if (data.type === 'state') {
        if (game.value) {
          game.value.board = (data.board as GlobalBoard)?.map(board => ({
            fields: board.fields.map(field => flip(field, game.value!.flippedBoard)),
            winner: flip(board.winner, game.value!.flippedBoard)
          })) as GlobalBoard,
          game.value.currentPlayer = flip(data.currentPlayer, game.value.flippedBoard)
          game.value.activeBoards = data.activeBoards
          game.value.winner = flip(data.winner ?? null, game.value.flippedBoard)
        }
      } else if (data.type === 'flip') {
        if (game.value) {
          game.value.flippedBoard = data.flippedBoard
          game.value.player = flip(game.value.player, data.flippedBoard)
          game.value.currentPlayer = flip(game.value.currentPlayer, data.flippedBoard)
          game.value.winner = flip(game.value.winner, data.flippedBoard)
        }
      } else if (data.type === 'rematch') {
        if (game.value) {
          game.value.wantsRematch = data.wantsRematch
        }
      }
    })
    ws.value.addEventListener("close", () => {
      console.log("Disconnected from room")
      game.value = null
      loading.value = false
      ws.value = null
      router.push({ name: 'home' })
    })
  }

  function takeTurn(boardIndex: number, fieldIndex: number) {
    if (!ws.value) return

    ws.value.send(JSON.stringify({
      type: 'takeTurn',
      boardIndex,
      fieldIndex
    }))
  }

  return {
    ws,
    game,
    loading,
    connectToRoom,
    createRoom,
    disconnect,
    takeTurn,
    rematch
  }
})