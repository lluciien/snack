"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Pause, Play } from "lucide-react"

// Game constants
const GRID_SIZE = 20
const GAME_SPEED = 150
const CANVAS_SIZE = 400

// Direction enum
enum Direction {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

// Food types
enum FoodType {
  REGULAR = "REGULAR",
  SPECIAL = "SPECIAL",
}

// Food interface
interface Food {
  x: number
  y: number
  type: FoodType
  value: number
}

// Snake segment interface
interface SnakeSegment {
  x: number
  y: number
}

interface SnakeGameProps {
  onScoreChange: (score: number) => void
  currentScore: number
  funFacts: string[]
}

export function SnakeGame({ onScoreChange, currentScore, funFacts }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isPaused, setIsPaused] = useState(true)
  const [gameOver, setGameOver] = useState(false)
  const [direction, setDirection] = useState<Direction>(Direction.RIGHT)
  const [snake, setSnake] = useState<SnakeSegment[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ])
  const [food, setFood] = useState<Food>({ x: 15, y: 10, type: FoodType.REGULAR, value: 1 })
  const [message, setMessage] = useState<string>("")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("hard") // Changed default difficulty to "hard"
  const [gameTime, setGameTime] = useState(0)

  // Prevent direction change to opposite direction
  const changeDirection = useCallback(
    (newDirection: Direction) => {
      if (
        (newDirection === Direction.UP && direction !== Direction.DOWN) ||
        (newDirection === Direction.DOWN && direction !== Direction.UP) ||
        (newDirection === Direction.LEFT && direction !== Direction.RIGHT) ||
        (newDirection === Direction.RIGHT && direction !== Direction.LEFT)
      ) {
        setDirection(newDirection)
      }
    },
    [direction],
  )

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          changeDirection(Direction.UP)
          break
        case "ArrowDown":
          changeDirection(Direction.DOWN)
          break
        case "ArrowLeft":
          changeDirection(Direction.LEFT)
          break
        case "ArrowRight":
          changeDirection(Direction.RIGHT)
          break
        case " ":
          setIsPaused((prev) => !prev)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [changeDirection])

  // Generate random food
  const generateFood = useCallback(() => {
    const x = Math.floor(Math.random() * GRID_SIZE)
    const y = Math.floor(Math.random() * GRID_SIZE)

    // Check if food is not on snake
    const isOnSnake = snake.some((segment) => segment.x === x && segment.y === y)

    if (isOnSnake) {
      return generateFood()
    }

    // 20% chance for special food
    const isSpecial = Math.random() < 0.2

    return {
      x,
      y,
      type: isSpecial ? FoodType.SPECIAL : FoodType.REGULAR,
      value: isSpecial ? 3 : 1,
    }
  }, [snake])

  // Move snake - defined before it's used in the game loop
  const moveSnake = useCallback(() => {
    setSnake((prevSnake) => {
      const head = { ...prevSnake[0] }

      // Move head based on direction
      switch (direction) {
        case Direction.UP:
          head.y -= 1
          break
        case Direction.DOWN:
          head.y += 1
          break
        case Direction.LEFT:
          head.x -= 1
          break
        case Direction.RIGHT:
          head.x += 1
          break
      }

      // Check if snake hit wall
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true)
        return prevSnake
      }

      // Check if snake hit itself
      if (prevSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true)
        return prevSnake
      }

      // Check if snake ate food
      if (head.x === food.x && head.y === food.y) {
        // Generate new food - but don't set state during render
        const newFood = generateFood()

        // Use setTimeout to update state after render is complete
        setTimeout(() => {
          // Update score - double points in hard mode for regular food
          const pointsEarned = difficulty === "hard" ? (food.type === FoodType.REGULAR ? 2 : food.value) : food.value

          onScoreChange(currentScore + pointsEarned)

          // Show random fun fact
          const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)]
          setMessage(randomFact)

          // Set the new food
          setFood(newFood)

          // Clear message after 3 seconds
          setTimeout(() => setMessage(""), 3000)
        }, 0)

        // Don't remove tail when eating
        return [head, ...prevSnake]
      }

      // Remove tail
      const newSnake = [head, ...prevSnake.slice(0, -1)]
      return newSnake
    })
  }, [direction, food, generateFood, onScoreChange, currentScore, funFacts, difficulty])

  // Game loop - now placed after moveSnake is defined
  useEffect(() => {
    if (isPaused || gameOver) return

    // Adjust game speed based on difficulty
    let baseSpeed = {
      easy: GAME_SPEED * 1.5, // Slower
      medium: GAME_SPEED, // Normal
      hard: GAME_SPEED * 0.7, // Slightly slower than before (was 0.6)
    }[difficulty]

    // In hard mode, increase speed over time
    if (difficulty === "hard") {
      // Reduce time by up to 40% based on game time (max speed after 2 minutes)
      const speedReduction = Math.min(0.4, gameTime / (120 * 1000)) * baseSpeed
      baseSpeed -= speedReduction
    }

    const gameLoop = setInterval(() => {
      moveSnake()
    }, baseSpeed)

    // Timer for increasing game time (only when not paused and not game over)
    const timeInterval = setInterval(() => {
      setGameTime((prev) => prev + 100) // Increment by 100ms
    }, 100)

    return () => {
      clearInterval(gameLoop)
      clearInterval(timeInterval)
    }
  }, [isPaused, gameOver, moveSnake, difficulty, gameTime])

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // Draw grid background
    ctx.fillStyle = "#98FB98"
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // Draw grid lines
    ctx.strokeStyle = "#7CFC00"
    ctx.lineWidth = 0.5

    const cellSize = CANVAS_SIZE / GRID_SIZE

    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cellSize, 0)
      ctx.lineTo(i * cellSize, CANVAS_SIZE)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, i * cellSize)
      ctx.lineTo(CANVAS_SIZE, i * cellSize)
      ctx.stroke()
    }

    // Draw snake
    snake.forEach((segment, index) => {
      // Create gradient for snake body
      const gradientValue = Math.max(50, 255 - index * 10)
      ctx.fillStyle =
        index === 0
          ? "#2E8B57" // Head color
          : `rgb(46, ${gradientValue}, 87)` // Body gradient

      ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize)

      // Draw eyes on head
      if (index === 0) {
        ctx.fillStyle = "white"

        // Position eyes based on direction
        if (direction === Direction.RIGHT || direction === Direction.LEFT) {
          ctx.fillRect(
            segment.x * cellSize + (direction === Direction.RIGHT ? cellSize * 0.7 : cellSize * 0.1),
            segment.y * cellSize + cellSize * 0.2,
            cellSize * 0.2,
            cellSize * 0.2,
          )
          ctx.fillRect(
            segment.x * cellSize + (direction === Direction.RIGHT ? cellSize * 0.7 : cellSize * 0.1),
            segment.y * cellSize + cellSize * 0.6,
            cellSize * 0.2,
            cellSize * 0.2,
          )
        } else {
          ctx.fillRect(
            segment.x * cellSize + cellSize * 0.2,
            segment.y * cellSize + (direction === Direction.DOWN ? cellSize * 0.7 : cellSize * 0.1),
            cellSize * 0.2,
            cellSize * 0.2,
          )
          ctx.fillRect(
            segment.x * cellSize + cellSize * 0.6,
            segment.y * cellSize + (direction === Direction.DOWN ? cellSize * 0.7 : cellSize * 0.1),
            cellSize * 0.2,
            cellSize * 0.2,
          )
        }
      }
    })

    // Draw food
    if (food.type === FoodType.REGULAR) {
      // Draw regular food (apple)
      ctx.fillStyle = "#FF0000"
      ctx.beginPath()
      ctx.arc(food.x * cellSize + cellSize / 2, food.y * cellSize + cellSize / 2, cellSize / 2, 0, Math.PI * 2)
      ctx.fill()

      // Draw apple stem
      ctx.fillStyle = "#654321"
      ctx.fillRect(food.x * cellSize + cellSize * 0.45, food.y * cellSize, cellSize * 0.1, cellSize * 0.2)
    } else {
      // Draw special food (cake, gift, or balloon)
      const specialFoods = ["cake", "gift", "balloon"]
      const foodType = specialFoods[Math.floor(Math.random() * specialFoods.length)]

      if (foodType === "cake") {
        // Draw cake
        ctx.fillStyle = "#FFD700"
        ctx.fillRect(
          food.x * cellSize + cellSize * 0.1,
          food.y * cellSize + cellSize * 0.3,
          cellSize * 0.8,
          cellSize * 0.6,
        )

        // Draw frosting
        ctx.fillStyle = "#FF69B4"
        ctx.fillRect(
          food.x * cellSize + cellSize * 0.1,
          food.y * cellSize + cellSize * 0.3,
          cellSize * 0.8,
          cellSize * 0.1,
        )

        // Draw candle
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(
          food.x * cellSize + cellSize * 0.45,
          food.y * cellSize + cellSize * 0.1,
          cellSize * 0.1,
          cellSize * 0.2,
        )

        // Draw flame
        ctx.fillStyle = "#FFA500"
        ctx.beginPath()
        ctx.arc(food.x * cellSize + cellSize * 0.5, food.y * cellSize + cellSize * 0.1, cellSize * 0.1, 0, Math.PI * 2)
        ctx.fill()
      } else if (foodType === "gift") {
        // Draw gift box
        ctx.fillStyle = "#FF69B4"
        ctx.fillRect(
          food.x * cellSize + cellSize * 0.1,
          food.y * cellSize + cellSize * 0.2,
          cellSize * 0.8,
          cellSize * 0.7,
        )

        // Draw ribbon
        ctx.fillStyle = "#FFD700"
        ctx.fillRect(
          food.x * cellSize + cellSize * 0.45,
          food.y * cellSize + cellSize * 0.2,
          cellSize * 0.1,
          cellSize * 0.7,
        )
        ctx.fillRect(
          food.x * cellSize + cellSize * 0.1,
          food.y * cellSize + cellSize * 0.45,
          cellSize * 0.8,
          cellSize * 0.1,
        )

        // Draw bow
        ctx.fillStyle = "#FFD700"
        ctx.beginPath()
        ctx.arc(food.x * cellSize + cellSize * 0.5, food.y * cellSize + cellSize * 0.2, cellSize * 0.15, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Draw balloon
        ctx.fillStyle = "#FF69B4"
        ctx.beginPath()
        ctx.arc(food.x * cellSize + cellSize / 2, food.y * cellSize + cellSize * 0.3, cellSize * 0.3, 0, Math.PI * 2)
        ctx.fill()

        // Draw string
        ctx.strokeStyle = "#FFFFFF"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(food.x * cellSize + cellSize / 2, food.y * cellSize + cellSize * 0.6)
        ctx.lineTo(food.x * cellSize + cellSize / 2, food.y * cellSize + cellSize * 0.9)
        ctx.stroke()
      }
    }

    // Draw game over message
    if (gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

      ctx.fillStyle = "#FFFFFF"
      ctx.font = "30px Arial"
      ctx.textAlign = "center"
      ctx.fillText("游戏结束!", CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 20)

      ctx.font = "20px Arial"
      ctx.fillText(`最终得分: ${currentScore}`, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 20)

      ctx.font = "16px Arial"
      ctx.fillText("点击重新开始", CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 60)
    }

    // Draw message
    if (message && !gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(0, CANVAS_SIZE - 60, CANVAS_SIZE, 60)

      ctx.fillStyle = "#FFFFFF"
      ctx.font = "14px Arial"
      ctx.textAlign = "center"

      // Split message if too long
      const words = message.split(" ")
      let line = ""
      const lines = []

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " "
        if (ctx.measureText(testLine).width > CANVAS_SIZE - 20) {
          lines.push(line)
          line = words[i] + " "
        } else {
          line = testLine
        }
      }
      lines.push(line)

      lines.forEach((line, index) => {
        ctx.fillText(line, CANVAS_SIZE / 2, CANVAS_SIZE - 40 + index * 20)
      })
    }
  }, [snake, food, gameOver, direction, currentScore, message])

  // Reset game
  const resetGame = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ])
    setDirection(Direction.RIGHT)
    setFood(generateFood())
    setGameOver(false)
    setDifficulty("hard") // Reset difficulty to hard
    setGameTime(0) // Reset game time
    onScoreChange(0)
    setIsPaused(true)
  }

  // Handle canvas click
  const handleCanvasClick = () => {
    if (gameOver) {
      resetGame()
    }
  }

  return (
    <div className="flex flex-col items-center bg-gradient-to-b from-[#1a472a] to-[#2d6a4f] p-6 rounded-2xl shadow-xl border-2 border-[#98FB98]/30">
      <div className="flex justify-between items-center w-full mb-4">
        <h3 className="text-2xl font-bold text-[#FFFDD0]">贪吃蛇游戏</h3>

        <div className="flex items-center space-x-2">
          <span className="text-[#FFFDD0] text-sm">难度:</span>
          <div className="flex rounded-lg overflow-hidden border border-[#98FB98]/50">
            <button
              className={`px-2 py-1 text-xs ${
                difficulty === "easy"
                  ? "bg-[#98FB98] text-[#1a472a] font-bold"
                  : "bg-[#1a472a]/50 text-[#FFFDD0] hover:bg-[#2E8B57]/30"
              }`}
              onClick={() => setDifficulty("easy")}
            >
              简单
            </button>
            <button
              className={`px-2 py-1 text-xs ${
                difficulty === "medium"
                  ? "bg-[#98FB98] text-[#1a472a] font-bold"
                  : "bg-[#1a472a]/50 text-[#FFFDD0] hover:bg-[#2E8B57]/30"
              }`}
              onClick={() => setDifficulty("medium")}
            >
              中等
            </button>
            <button
              className={`px-2 py-1 text-xs ${
                difficulty === "hard"
                  ? "bg-[#98FB98] text-[#1a472a] font-bold"
                  : "bg-[#1a472a]/50 text-[#FFFDD0] hover:bg-[#2E8B57]/30"
              }`}
              onClick={() => setDifficulty("hard")}
            >
              困难
            </button>
          </div>
        </div>
      </div>
      <div className="text-[#FFFDD0] text-xs mb-2 text-center">
        {difficulty === "hard" && "困难模式: 每个苹果2分，速度会随时间增加"}
      </div>

      <div className="relative mb-5">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#98FB98] to-[#2E8B57] rounded-lg blur-sm"></div>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="relative border-4 border-[#2E8B57] rounded-lg bg-[#98FB98]/90 cursor-pointer shadow-inner"
          onClick={handleCanvasClick}
        />
      </div>

      {/* Score and unlockables */}
      <div className="mb-5 flex flex-col items-center">
        <div className="bg-[#2E8B57] text-[#FFFDD0] px-6 py-2 rounded-full font-mono text-xl shadow-md flex items-center mb-2">
          <span className="mr-2">🏆</span> 得分: {currentScore}
        </div>

        {/* Unlockable content - only show 50 and 100 */}
        <div className="flex space-x-2 text-xs">
          <div
            className={`px-3 py-1 rounded-full flex items-center ${currentScore >= 50 ? "bg-[#2E8B57] text-white" : "bg-gray-600/30 text-gray-300"}`}
          >
            <div className={`w-3 h-3 rounded-full mr-1 ${currentScore >= 50 ? "bg-[#98FB98]" : "bg-gray-500"}`}></div>
            50分
          </div>
          <div
            className={`px-3 py-1 rounded-full flex items-center ${currentScore >= 100 ? "bg-[#2E8B57] text-white" : "bg-gray-600/30 text-gray-300"}`}
          >
            <div className={`w-3 h-3 rounded-full mr-1 ${currentScore >= 100 ? "bg-[#98FB98]" : "bg-gray-500"}`}></div>
            100分
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 gap-2 w-40 h-40">
        <div className="col-start-2">
          <Button
            variant="outline"
            className="w-full h-full rounded-full bg-[#98FB98]/80 hover:bg-[#2E8B57] hover:text-white border-2 border-[#2E8B57] shadow-md transition-all"
            onClick={() => changeDirection(Direction.UP)}
          >
            <ArrowUp size={24} />
          </Button>
        </div>
        <div></div>
        <div className="col-start-1 row-start-2">
          <Button
            variant="outline"
            className="w-full h-full rounded-full bg-[#98FB98]/80 hover:bg-[#2E8B57] hover:text-white border-2 border-[#2E8B57] shadow-md transition-all"
            onClick={() => changeDirection(Direction.LEFT)}
          >
            <ArrowLeft size={24} />
          </Button>
        </div>
        <div className="col-start-2 row-start-2">
          <Button
            variant="outline"
            className="w-full h-full rounded-full bg-[#FFD700]/80 hover:bg-[#FFD700] text-[#2E8B57] hover:text-[#2E8B57] border-2 border-[#2E8B57] shadow-md transition-all"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? <Play size={24} /> : <Pause size={24} />}
          </Button>
        </div>
        <div className="col-start-3 row-start-2">
          <Button
            variant="outline"
            className="w-full h-full rounded-full bg-[#98FB98]/80 hover:bg-[#2E8B57] hover:text-white border-2 border-[#2E8B57] shadow-md transition-all"
            onClick={() => changeDirection(Direction.RIGHT)}
          >
            <ArrowRight size={24} />
          </Button>
        </div>
        <div></div>
        <div className="col-start-2 row-start-3">
          <Button
            variant="outline"
            className="w-full h-full rounded-full bg-[#98FB98]/80 hover:bg-[#2E8B57] hover:text-white border-2 border-[#2E8B57] shadow-md transition-all"
            onClick={() => changeDirection(Direction.DOWN)}
          >
            <ArrowDown size={24} />
          </Button>
        </div>
      </div>

      {/* Game instructions */}
      <div className="mt-4 text-[#FFFDD0] text-sm text-center opacity-80">
        <p>使用方向键或按钮控制蛇的移动</p>
        <p>吃到食物可以增加分数和长度</p>
      </div>
    </div>
  )
}

