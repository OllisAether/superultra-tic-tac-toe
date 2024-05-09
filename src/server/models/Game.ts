import { GlobalBoard, createGlobalBoard } from "./TicTacToe";

export class Game {
  private board: GlobalBoard = createGlobalBoard()
  private currentPlayer: 'x' | 'o' = 'x'
  private activeBoards: number[] = Array(9).fill(0).map((_, i) => i)

  getBoard() {
    return this.board
  }

  getActiveBoards() {
    return this.activeBoards
  }

  getCurrentPlayer() {
    return this.currentPlayer
  }

  constructor() {
    this.nextTurn()
  }


  nextTurnListeners: ((board: GlobalBoard, player: 'x' | 'o', activeBoards: number[]) => void)[] = []
  onNextTurn(callback: (board: GlobalBoard, player: 'x' | 'o', activeBoards: number[]) => void) {
    this.nextTurnListeners.push(callback)
  }
  private nextTurn() {
    this.nextTurnListeners.forEach(listener => listener(
      this.board.map(board => ({
        fields: [...board.fields],
        winner: board.winner
      })) as GlobalBoard, // deep copy
      this.currentPlayer,
      [...this.activeBoards]
    ))
  }

  won: boolean = false
  winListeners: ((winner: 'x' | 'o' | 'draw' | null) => void)[] = []
  onWin(callback: (winner: 'x' | 'o' | 'draw' | null) => void) {
    this.winListeners.push(callback)
  }
  private win(winner: 'x' | 'o' | 'draw') {
    if (this.won) return
    this.won = true
    this.winListeners.forEach(listener => listener(winner))
  }

  takeTurn(boardIndex: number, fieldIndex: number) {
    if (
      this.won ||
      this.board[boardIndex].fields[fieldIndex] ||
      !this.activeBoards.includes(boardIndex)
    ) return false

    this.board[boardIndex].fields[fieldIndex] = this.currentPlayer

    this.board[boardIndex].winner = this.checkWinner(this.board[boardIndex].fields)

    if (this.board[boardIndex].winner) {
      const winner = this.checkWinner(this.board.map(board => board.winner))

      if (winner) {
        this.activeBoards = []
        this.nextTurn()
        this.win(winner)
        return true
      }
    }

    if (this.board[fieldIndex].winner) {
      this.activeBoards = this.board.map((board, i) => board.winner ? -1 : i).filter(i => i !== -1)
    } else {
      this.activeBoards = [fieldIndex]
    }

    this.currentPlayer = this.currentPlayer === 'x' ? 'o' : 'x'

    this.nextTurn()
    return true
  }

  private checkWinner(fields: ('x' | 'o' | 'draw' | null)[]): 'x' | 'o' | 'draw' | null {
    const winningCombos = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ]

    for (const combo of winningCombos) {
      const [a, b, c] = combo
      if (
        fields[a] !== 'draw' &&
        fields[a] &&
        fields[a] === fields[b] &&
        fields[a] === fields[c]
      ) return fields[a]
    }

    if (fields.every(field => field)) return 'draw'
    return null
  }

  destroy() {
    this.nextTurnListeners = []
  }
}