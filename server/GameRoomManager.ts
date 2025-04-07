import { DurableObject } from "cloudflare:workers"
import { Env } from "../worker-configuration"
import { Game } from "../shared/Game"
import { GlobalBoard } from "../shared/TicTacToe"

interface GameRoomState {
  game: Game | null
  winner: 'x' | 'o' | 'draw' | null
  xConnected: boolean
  oConnected: boolean
  wantsRematch: 'x' | 'o' | null,
  flippedBoard: boolean
}

interface GameRoomStateStorage {
  game: {
    globalBoard: GlobalBoard
    currentPlayer: 'x' | 'o'
    activeBoards: number[]
  } | null
  winner: 'x' | 'o' | 'draw' | null
  xConnected: boolean
  oConnected: boolean
  wantsRematch: 'x' | 'o' | null,
  flippedBoard: boolean
}

export class GameRoomManager extends DurableObject {
  rooms: Map<string, GameRoomState> = new Map()

  constructor(state: DurableObjectState, env: Env) {
    super(state, env)

    state.setHibernatableWebSocketEventTimeout(1000)
    state.blockConcurrencyWhile(async () => {
      const rooms = await state.storage?.list<GameRoomStateStorage>({
        prefix: 'room-',
      })

      if (rooms) {
        for await (const [id, state] of rooms) {
          const roomId = id.replace('room-', '')

          this.rooms.set(roomId, {
            game: null,
            winner: state.winner,
            xConnected: this.ctx.getWebSockets(roomId).some(ws => this.ctx.getTags(ws).includes('x')),
            oConnected: this.ctx.getWebSockets(roomId).some(ws => this.ctx.getTags(ws).includes('o')),
            wantsRematch: state.wantsRematch,
            flippedBoard: state.flippedBoard
          })

          if (!state.xConnected && !state.oConnected) {
            this.rooms.delete(roomId)
            await this.ctx.storage?.delete('room-' + roomId)
            console.log('Deleted room', roomId)
            continue
          }

          if (state.game) {
            this.createGame(roomId, state.game.globalBoard, state.game.currentPlayer, state.game.activeBoards)
            console.log('Restored room', roomId, state)
          } else if (state.xConnected && state.oConnected && !state.game) {
            await this.createGame(roomId)
            console.log('Created game for room', roomId)
          }
        }
      }
    })
  }

  async updateRoomState(roomId: string, state: GameRoomState) {
    this.rooms.set(roomId, state)
    await this.ctx.storage?.put('room-' + roomId, {
      game: state.game ? {
        globalBoard: state.game.board,
        currentPlayer: state.game.currentPlayer,
        activeBoards: state.game.activeBoards
      } : null,
      winner: state.winner,
      xConnected: state.xConnected,
      oConnected: state.oConnected,
      wantsRematch: state.wantsRematch,
      flippedBoard: state.flippedBoard
    } satisfies GameRoomStateStorage)
  }

  async createGame(roomId: string, globalBoard?: GlobalBoard, currentPlayer?: 'x' | 'o', activeBoards?: number[]) {
    const room = this.rooms.get(roomId)
    if (!room) return
    const game = new Game(globalBoard, currentPlayer, activeBoards)

    game.onNextTurn(async (board, currentPlayer, activeBoards) => {
      await this.updateRoomState(roomId, {
        game,
        winner: room.winner,
        xConnected: room.xConnected,
        oConnected: room.oConnected,
        wantsRematch: room.wantsRematch,
        flippedBoard: room.flippedBoard
      })

      this.ctx.getWebSockets(roomId).forEach((ws) => {
        ws.send(JSON.stringify({
          type: 'state',
          board,
          currentPlayer,
          activeBoards,
          winner: room.winner
        }))
      })
    })

    game.onWin(async (winner) => {
      await this.updateRoomState(roomId, {
        game,
        winner,
        xConnected: room.xConnected,
        oConnected: room.oConnected,
        wantsRematch: room.wantsRematch,
        flippedBoard: room.flippedBoard
      })

      this.ctx.getWebSockets(roomId).forEach((ws) => {
        ws.send(JSON.stringify({
          type: 'state',
          board: game.board,
          currentPlayer: game.currentPlayer,
          activeBoards: game.activeBoards,
          winner
        }))
      })
    })

    await this.updateRoomState(roomId, {
      game,
      winner: room.winner,
      xConnected: room.xConnected,
      oConnected: room.oConnected,
      wantsRematch: room.wantsRematch,
      flippedBoard: room.flippedBoard
    })

    this.ctx.getWebSockets(roomId).forEach((ws) => {
      ws.send(JSON.stringify({
        type: 'state',
        board: game.board,
        currentPlayer: game.currentPlayer,
        activeBoards: game.activeBoards,
        winner: game.winner
      }))
    })

    return game
  }

  async takeTurn(roomId: string, player: 'x' | 'o',  boardIndex: number, fieldIndex: number) {
    const room = this.rooms.get(roomId)
    if (!room) return false
    if (!room.game) return false
    const { game } = room
    if (game.winner) return false
    if (game.currentPlayer !== player) return false
    
    const sucess = game.takeTurn(boardIndex, fieldIndex)
  
    return sucess
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    // console.log('Message received:', message)
    const [roomId, player] = this.ctx.getTags(ws) as [string, 'x' | 'o']
    const data = JSON.parse(message.toString())

    if (data.type === 'disconnect') {
      ws.close()
      return
    }

    if (data.type === 'takeTurn') {
      const { boardIndex, fieldIndex } = data
      const sucess = this.takeTurn(roomId, player, boardIndex, fieldIndex)

      if (!sucess) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid move' }))
      }
    }

    if (data.type === 'rematch') {
      let room = this.rooms.get(roomId)
      if (!room) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }))
        return
      }

      // Check if both players want a rematch
      if (room.wantsRematch && room.wantsRematch !== player) {
        room = this.rooms.get(roomId)
        if (!room) {
          ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }))
          return
        }

        room.game?.destroy()
        await this.updateRoomState(roomId, {
          game: null,
          winner: null,
          xConnected: room.xConnected,
          oConnected: room.oConnected,
          wantsRematch: null,
          flippedBoard: !room.flippedBoard
        })
        await this.createGame(roomId, undefined, !room.flippedBoard ? 'o' : 'x')

        room = this.rooms.get(roomId)
        if (!room) {
          ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }))
          return
        }

        this.ctx.getWebSockets(roomId).forEach((ws) => {
          if(!room) {
            ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }))
            return
          }

          ws.send(JSON.stringify({
            type: 'state',
            board: room.game?.board,
            currentPlayer: room.game?.currentPlayer,
            activeBoards: room.game?.activeBoards,
            winner: room.winner
          }))
          ws.send(JSON.stringify({
            type: 'flip',
            flippedBoard: room.flippedBoard
          }))
          ws.send(JSON.stringify({
            type: 'rematch',
            wantsRematch: room.wantsRematch
          }))
        })

        return
      }

      await this.updateRoomState(roomId, {
        game: room.game,
        winner: room.winner,
        xConnected: room.xConnected,
        oConnected: room.oConnected,
        wantsRematch: room.wantsRematch === player ? null : player,
        flippedBoard: room.flippedBoard
      })

      this.ctx.getWebSockets(roomId).forEach((ws) => {
        ws.send(JSON.stringify({
          type: 'rematch',
          wantsRematch: room.wantsRematch === player ? null : player
        }))
      })
      return
    }

    if (data.type === 'inital') {
      console.log(roomId)
      const room = this.rooms.get(roomId)
      if (!room) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }))
        return
      }
      const thisPlayer = this.ctx.getTags(ws)[1] as 'x' | 'o'

      let game = room.game
      if (room.xConnected && room.oConnected && !room.game) {
        game = await this.createGame(roomId) ?? null
      }

      ws.send(JSON.stringify({
        type: 'all',
        roomId,
        player: thisPlayer,
        opponentConnected: room.xConnected && room.oConnected,
        game: game ? {
          board: game.board,
          currentPlayer: game.currentPlayer,
          activeBoards: game.activeBoards
        } : null,
        winner: game?.winner ?? null,
        flippedBoard: room.flippedBoard,
        wantsRematch: room.wantsRematch
      }))
    }
  }

  webSocketClose(ws: WebSocket): void {
    const roomId = this.ctx.getTags(ws)[0]
    const room = this.rooms.get(roomId)
    if (!room) return

    if (this.ctx.getTags(ws).includes('x')) {
      room.xConnected = false
    }
    if (this.ctx.getTags(ws).includes('o')) {
      room.oConnected = false
    }

    if (!room.xConnected && !room.oConnected) {
      console.log('Everyone disconnected, game reset')
      this.rooms.delete(roomId)
      this.ctx.storage?.delete('room-' + roomId)
      return
    }
  
    this.ctx.getWebSockets().forEach((ws) => {
      ws.send(JSON.stringify({
        type: 'opponent',
        opponentConnected: room.xConnected && room.oConnected
      }))
    })

    this.updateRoomState(roomId, {
      game: room.game,
      winner: room.winner,
      xConnected: room.xConnected,
      oConnected: room.oConnected,
      wantsRematch: room.wantsRematch,
      flippedBoard: room.flippedBoard
    })
  }

  async connectToRoom(roomId: string): Promise<Response> {
    const [client, server] = Object.values(new WebSocketPair())

    const room = this.rooms.get(roomId)
    if (!room) {
      console.log('Room not found')
      return new Response('Room not found', { status: 404 })
    }

    const thisPlayer = room.xConnected ? (
      room.oConnected ? null : 'o'
    ) : 'x'

    if (thisPlayer === null) {
      console.log('Room is full')
      return new Response('Room is full', { status: 400 })
    }

    if (thisPlayer === 'x') {
      room.xConnected = true
    } else {
      room.oConnected = true
    }

    await this.updateRoomState(roomId, {
      game: room.game,
      winner: room.winner,
      xConnected: room.xConnected,
      oConnected: room.oConnected,
      wantsRematch: room.wantsRematch,
      flippedBoard: room.flippedBoard
    })

    this.ctx.acceptWebSocket(server, [roomId, thisPlayer])

    this.ctx.getWebSockets(roomId)
      .filter(ws => this.ctx
        .getTags(ws)
        .includes(thisPlayer === 'x' ? 'o' : 'x'))
      .forEach((ws) => {
        ws.send(JSON.stringify({
          type: 'opponent',
          opponentConnected: room.xConnected && room.oConnected
        }))
      })

    console.log(`Player ${thisPlayer} connected to room ${roomId}`)
    return new Response(null, { status: 101, webSocket: client })
  }

  async createRoom(): Promise<Response> {
    function generateRoomId() {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let result = ''
      for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
      }
      return result
    }

    let roomId = generateRoomId()
    while (this.rooms.has(roomId)) {
      roomId = generateRoomId()
    }

    await this.updateRoomState(roomId, {
      game: null,
      winner: null,
      xConnected: false,
      oConnected: false,
      wantsRematch: null,
      flippedBoard: false
    })

    console.log(`Room ${roomId} created`)
    
    return this.connectToRoom(roomId)
  }

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url)
    
    if (url.pathname === '/api/create') {
      return this.createRoom()
    }

    if (url.pathname.startsWith('/api/room/')) {
      const roomId = url.pathname.split('/')[3]
      console.log(`Connecting to room ${roomId}`)
      return this.connectToRoom(roomId)
    }

    return new Response('Not found', { status: 404 })
  }
}