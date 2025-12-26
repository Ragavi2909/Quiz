"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Trophy } from "lucide-react"

export function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [winner, setWinner] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [scores, setScores] = useState({ player: 0, computer: 0, ties: 0 })
  const [isThinking, setIsThinking] = useState(false)

  // Check for winner
  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // columns
      [0, 4, 8],
      [2, 4, 6], // diagonals
    ]

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }

    return null
  }

  // Check if board is full (draw)
  const isBoardFull = (squares) => {
    return squares.every((square) => square !== null)
  }

  // Computer move using minimax algorithm
  const getComputerMove = (currentBoard) => {
    // Simple AI: First try to win, then block player, then take center, then take corner, then any available
    const availableSquares = currentBoard
      .map((square, index) => (square === null ? index : null))
      .filter((val) => val !== null)

    // If board is empty, take a random corner or center
    if (availableSquares.length === 9) {
      const firstMoves = [0, 2, 4, 6, 8]
      return firstMoves[Math.floor(Math.random() * firstMoves.length)]
    }

    // Check if computer can win
    for (const square of availableSquares) {
      const boardCopy = [...currentBoard]
      boardCopy[square] = "O"
      if (checkWinner(boardCopy) === "O") {
        return square
      }
    }

    // Check if player can win and block
    for (const square of availableSquares) {
      const boardCopy = [...currentBoard]
      boardCopy[square] = "X"
      if (checkWinner(boardCopy) === "X") {
        return square
      }
    }

    // Take center if available
    if (availableSquares.includes(4)) {
      return 4
    }

    // Take corners if available
    const corners = [0, 2, 6, 8].filter((corner) => availableSquares.includes(corner))
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)]
    }

    // Take any available square
    return availableSquares[Math.floor(Math.random() * availableSquares.length)]
  }

  // Handle player move
  const handleClick = (index) => {
    if (board[index] || winner || !isXNext || isThinking || gameOver) {
      return
    }

    const newBoard = [...board]
    newBoard[index] = "X"
    setBoard(newBoard)
    setIsXNext(false)

    const playerWon = checkWinner(newBoard)
    if (playerWon) {
      setWinner(playerWon)
      setGameOver(true)
      setScores((prev) => ({ ...prev, player: prev.player + 1 }))
      return
    }

    if (isBoardFull(newBoard)) {
      setGameOver(true)
      setScores((prev) => ({ ...prev, ties: prev.ties + 1 }))
      return
    }

    // Computer's turn
    setIsThinking(true)
    setTimeout(() => {
      const computerMoveIndex = getComputerMove(newBoard)
      const afterComputerBoard = [...newBoard]
      afterComputerBoard[computerMoveIndex] = "O"
      setBoard(afterComputerBoard)

      const computerWon = checkWinner(afterComputerBoard)
      if (computerWon) {
        setWinner(computerWon)
        setGameOver(true)
        setScores((prev) => ({ ...prev, computer: prev.computer + 1 }))
      } else if (isBoardFull(afterComputerBoard)) {
        setGameOver(true)
        setScores((prev) => ({ ...prev, ties: prev.ties + 1 }))
      } else {
        setIsXNext(true)
      }

      setIsThinking(false)
    }, 600) // Add a small delay to make it feel like the computer is "thinking"
  }

  // Reset the game
  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
    setWinner(null)
    setGameOver(false)
  }

  // Render a square
  const renderSquare = (index) => {
    const isWinningSquare =
      winner &&
      [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8], // rows
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8], // columns
        [0, 4, 8],
        [2, 4, 6], // diagonals
      ].some(
        (line) =>
          line.includes(index) && board[line[0]] === winner && board[line[1]] === winner && board[line[2]] === winner,
      )

    return (
      <button
        className={`
          w-full aspect-square flex items-center justify-center text-3xl font-bold
          border border-purple-200 bg-white hover:bg-purple-50
          transition-colors duration-200
          ${board[index] === "X" ? "text-purple-600" : "text-pink-500"}
          ${isWinningSquare ? "bg-purple-100 border-purple-300" : ""}
        `}
        onClick={() => handleClick(index)}
        disabled={!!board[index] || !!winner || !isXNext || isThinking || gameOver}
      >
        {board[index]}
      </button>
    )
  }

  return (
    <Card className="bg-white border-purple-100 w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-purple-800 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-purple-500"
          >
            <path d="M10 3H6a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h4M16 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M9 3v18M9 14h6"></path>
          </svg>
          Tic-Tac-Toe
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-100 text-purple-800">You: X</Badge>
            <Badge className="bg-pink-100 text-pink-800">Computer: O</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-gray-600">
              {scores.player} - {scores.computer}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {Array(9)
            .fill(null)
            .map((_, i) => (
              <div key={i}>{renderSquare(i)}</div>
            ))}
        </div>

        {(winner || gameOver) && (
          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100 text-center">
            {winner === "X" && <p className="text-purple-600 font-bold">You win! 🎉</p>}
            {winner === "O" && <p className="text-pink-500 font-bold">Computer wins!</p>}
            {!winner && gameOver && <p className="text-gray-600 font-bold">It's a draw!</p>}
          </div>
        )}

        {isThinking && !gameOver && (
          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100 text-center">
            <p className="text-gray-600">Computer is thinking...</p>
          </div>
        )}

        {!isThinking && !gameOver && (
          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100 text-center">
            <p className="text-gray-600">{isXNext ? "Your turn" : "Computer's turn"}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={resetGame}
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={isThinking && !gameOver}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          New Game
        </Button>
      </CardFooter>
    </Card>
  )
}
