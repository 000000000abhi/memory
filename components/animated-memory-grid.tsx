"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedMemoryGridProps {
  rows?: number
  cols?: number
  className?: string
}

export default function AnimatedMemoryGrid({ rows = 6, cols = 6, className }: AnimatedMemoryGridProps) {
  const [grid, setGrid] = useState<Array<Array<{ active: boolean; value: string }>>>([])

  useEffect(() => {
    // Initialize grid
    const initialGrid = Array(rows)
      .fill(null)
      .map(() =>
        Array(cols)
          .fill(null)
          .map(() => ({
            active: false,
            value: Math.floor(Math.random() * 256)
              .toString(16)
              .padStart(2, "0")
              .toUpperCase(),
          })),
      )
    setGrid(initialGrid)

    // Animate random cells
    const interval = setInterval(() => {
      setGrid((currentGrid) => {
        const newGrid = [...currentGrid.map((row) => [...row])]

        // Randomly activate 1-3 cells
        const activationsCount = Math.floor(Math.random() * 3) + 1

        for (let i = 0; i < activationsCount; i++) {
          const randomRow = Math.floor(Math.random() * rows)
          const randomCol = Math.floor(Math.random() * cols)

          // Update value and set active
          newGrid[randomRow][randomCol] = {
            active: true,
            value: Math.floor(Math.random() * 256)
              .toString(16)
              .padStart(2, "0")
              .toUpperCase(),
          }
        }

        // Reset previously active cells after a delay
        setTimeout(() => {
          setGrid((currentGrid) => {
            return currentGrid.map((row) =>
              row.map((cell) => ({
                ...cell,
                active: false,
              })),
            )
          })
        }, 500)

        return newGrid
      })
    }, 800)

    return () => clearInterval(interval)
  }, [rows, cols])

  return (
    <div className={cn("grid gap-1", className)} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={cn(
              "aspect-square flex items-center justify-center text-xs font-mono border transition-all duration-300",
              cell.active
                ? "bg-blue-500 dark:bg-blue-600 text-white border-blue-600 dark:border-blue-500 scale-105 shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700",
            )}
          >
            {cell.value}
          </div>
        )),
      )}
    </div>
  )
}
