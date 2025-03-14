"use client"

import { useState } from "react"
import CharacterCard from "./CharacterCard"
import SnakeGame from "./SnakeGame"

const characters = [
  {
    id: 1,
    name: "Alice",
    funFacts: ["Loves cats", "Hates Mondays", "Can juggle"],
  },
  {
    id: 2,
    name: "Bob",
    funFacts: ["Loves dogs", "Hates Tuesdays", "Can code"],
  },
]

export default function Home() {
  const [selectedCharacter, setSelectedCharacter] = useState(characters[0])
  const [score, setScore] = useState(0)

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character)
    setScore(0) // Reset score when changing characters
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            isSelected={character === selectedCharacter}
            onSelect={handleCharacterSelect}
          />
        ))}
      </div>

      <div className="mt-10">
        <SnakeGame
          onScoreChange={(newScore) => {
            // Use setTimeout to avoid state updates during render
            setTimeout(() => {
              setScore(newScore)
            }, 0)
          }}
          currentScore={score}
          funFacts={selectedCharacter.funFacts}
        />
      </div>

      <p>Current Score: {score}</p>
    </main>
  )
}

