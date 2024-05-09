export type Board = {
  fields: ('x' | 'o' | null)[]
  winner: 'x' | 'o' | 'draw' | null
}

export type GlobalBoard = [
  Board, Board, Board,
  Board, Board, Board,
  Board, Board, Board
]

export function createBoard(): Board {
  return {
    fields: Array(9).fill(null),
    winner: null
  }
}

export function createGlobalBoard(): GlobalBoard {
  return Array(9).fill(null).map(() => createBoard()) as GlobalBoard
}
