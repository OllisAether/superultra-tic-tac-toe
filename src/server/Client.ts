import { Response } from "express"

export interface Client {
  id: string
  room: string
  res?: Response
  player: "x" | "o"
}