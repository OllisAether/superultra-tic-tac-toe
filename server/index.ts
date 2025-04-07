import { Env } from '../worker-configuration'
import { GameRoomManager } from './GameRoomManager'

const createRoomHandler = (req: Request, env: Env) => {
  const objectId = env.GAME_ROOM_MANAGER.idFromName('instance')
  const stub = env.GAME_ROOM_MANAGER.get(objectId) as GameRoomManager

  return stub.fetch(req)
}

const connectToRoomHandler = (req: Request, env: Env, roomId: string) => {
  if (!roomId) {
    return new Response('Room ID is required', { status: 400 })
  }
  if (roomId.length !== 6) {
    return new Response('Room ID must be 6 characters long', { status: 400 })
  }
  if (!/^[a-zA-Z0-9]+$/.test(roomId)) {
    return new Response('Room ID must be alphanumeric', { status: 400 })
  }

  const objectId = env.GAME_ROOM_MANAGER.idFromName('instance')
  const stub = env.GAME_ROOM_MANAGER.get(objectId) as GameRoomManager

  return stub.fetch(req)
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(req.url)
    const path = url.pathname.split('/').filter(Boolean)
    const method = req.method

    if (path[0] === 'api' && path[1] === 'create') {
      if (method === 'GET') {
        return createRoomHandler(req, env)
      }
    }
    if (path[0] === 'api' && path[1] === 'room' && path[2]) {
      if (method === 'GET') {
        return connectToRoomHandler(req, env, path[2])
      }
    }

    return new Response('Not Found', { status: 404 })
  }
} satisfies ExportedHandler<Env>

export * from './GameRoomManager'