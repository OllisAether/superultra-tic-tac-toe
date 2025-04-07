import { GameRoom } from "./server/GameRoomManager"

interface Env {
  ASSETS: Fetcher
  GAME_ROOM_MANAGER: DurableObjectNamespace<GameRoom>
}
