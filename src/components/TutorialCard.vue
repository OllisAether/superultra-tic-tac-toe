<template>
  <VCard
    :title="'Tutorial'"
  >
    <template #text>
      <p>Welcome to the SUPERULTRA - Tic Tac Toe tutorial!</p>
      <p>
        Assuming you know how to play Tic Tac Toe, the goal of SUPERULTRA - Tic Tac Toe is to win 3 regular Tic Tac Toe games in a row.
      </p>
      <p>
        The game board is divided into 9 smaller Tic Tac Toe boards. The first player to play (X) will choose a square anywhere on the board.
        The square they choose inside the small board will determine which small board the next player (O) will play in.
      </p>
      <p>
        For example, if player X chooses the center square in the top left small board, player O will play in the center board of the big board.
      </p>
      <p>
        If a small board is won by either player, that small board will be marked with an X or O.
        If a small board is a draw, the board is now closed and cannot be played in.
      </p>
      <p>
        If a player is forced to play in a closed board, they can play anywhere on the big board.
      </p>
    </template>
    <VCardActions>
      <slot></slot>
    </VCardActions>
  </VCard>
</template>