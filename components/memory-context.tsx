"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Memory block types
export type MemoryBlockType = "free" | "allocated"

// Memory block structure
export interface MemoryBlock {
  id: string
  start: number
  size: number
  type: MemoryBlockType
  processId?: string
  color?: string
}

// Process structure
export interface Process {
  id: string
  size: number
  color: string
  allocated: boolean
}

// Allocation algorithms
export type AllocationAlgorithm = "firstFit" | "bestFit" | "worstFit"

interface MemoryContextType {
  memorySize: number
  memoryBlocks: MemoryBlock[]
  processes: Process[]
  algorithm: AllocationAlgorithm
  setAlgorithm: (algorithm: AllocationAlgorithm) => void
  addProcess: (size: number) => void
  removeProcess: (id: string) => void
  resetMemory: () => void
  compactMemory: () => void
  memoryUtilization: number
  fragmentation: number
}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined)

// Generate a random color for processes
const generateRandomColor = (): string => {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-cyan-500",
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export const MemoryProvider = ({ children }: { children: ReactNode }) => {
  const totalMemorySize = 1024 // 1024 MB
  const [memoryBlocks, setMemoryBlocks] = useState<MemoryBlock[]>([])
  const [processes, setProcesses] = useState<Process[]>([])
  const [algorithm, setAlgorithm] = useState<AllocationAlgorithm>("firstFit")
  const [memoryUtilization, setMemoryUtilization] = useState(0)
  const [fragmentation, setFragmentation] = useState(0)

  // Initialize memory with a single free block
  useEffect(() => {
    resetMemory()
  }, [])

  // Calculate memory utilization and fragmentation
  useEffect(() => {
    // Calculate memory utilization
    const allocatedMemory = memoryBlocks
      .filter((block) => block.type === "allocated")
      .reduce((sum, block) => sum + block.size, 0)

    const utilization = (allocatedMemory / totalMemorySize) * 100
    setMemoryUtilization(Math.round(utilization * 100) / 100)

    // Calculate fragmentation
    const freeBlocks = memoryBlocks.filter((block) => block.type === "free")
    const totalFreeMemory = freeBlocks.reduce((sum, block) => sum + block.size, 0)

    if (totalFreeMemory > 0) {
      const largestFreeBlock = Math.max(...freeBlocks.map((block) => block.size))
      const fragmentationValue = ((totalFreeMemory - largestFreeBlock) / totalFreeMemory) * 100
      setFragmentation(Math.round(fragmentationValue * 100) / 100)
    } else {
      setFragmentation(0)
    }
  }, [memoryBlocks])

  // Reset memory to initial state
  const resetMemory = () => {
    setMemoryBlocks([
      {
        id: "initial",
        start: 0,
        size: totalMemorySize,
        type: "free",
      },
    ])
    setProcesses([])
  }

  // Compact memory (defragmentation)
  const compactMemory = () => {
    const allocatedBlocks = memoryBlocks.filter((block) => block.type === "allocated").sort((a, b) => a.start - b.start)

    let currentPosition = 0
    const newBlocks: MemoryBlock[] = []

    // Reposition allocated blocks
    allocatedBlocks.forEach((block) => {
      const newBlock = {
        ...block,
        start: currentPosition,
      }
      newBlocks.push(newBlock)
      currentPosition += block.size
    })

    // Add remaining free space as a single block
    if (currentPosition < totalMemorySize) {
      newBlocks.push({
        id: `free-${Date.now()}`,
        start: currentPosition,
        size: totalMemorySize - currentPosition,
        type: "free",
      })
    }

    setMemoryBlocks(newBlocks)
  }

  // First Fit algorithm
  const firstFit = (size: number): number => {
    const freeBlocks = memoryBlocks.filter((block) => block.type === "free")
    for (const block of freeBlocks) {
      if (block.size >= size) {
        return block.start
      }
    }
    return -1 // No suitable block found
  }

  // Best Fit algorithm
  const bestFit = (size: number): number => {
    const freeBlocks = memoryBlocks.filter((block) => block.type === "free")
    let bestBlockStart = -1
    let bestBlockSize = Number.POSITIVE_INFINITY

    for (const block of freeBlocks) {
      if (block.size >= size && block.size < bestBlockSize) {
        bestBlockSize = block.size
        bestBlockStart = block.start
      }
    }

    return bestBlockStart
  }

  // Worst Fit algorithm
  const worstFit = (size: number): number => {
    const freeBlocks = memoryBlocks.filter((block) => block.type === "free")
    let worstBlockStart = -1
    let worstBlockSize = -1

    for (const block of freeBlocks) {
      if (block.size >= size && block.size > worstBlockSize) {
        worstBlockSize = block.size
        worstBlockStart = block.start
      }
    }

    return worstBlockStart
  }

  // Allocate memory for a process
  const allocateMemory = (size: number, processId: string, color: string): boolean => {
    let startPosition: number

    // Choose allocation algorithm
    switch (algorithm) {
      case "bestFit":
        startPosition = bestFit(size)
        break
      case "worstFit":
        startPosition = worstFit(size)
        break
      case "firstFit":
      default:
        startPosition = firstFit(size)
    }

    if (startPosition === -1) {
      return false // Allocation failed
    }

    // Find the block to allocate from
    const blockIndex = memoryBlocks.findIndex((block) => block.start === startPosition && block.type === "free")

    if (blockIndex === -1) {
      return false // Block not found (shouldn't happen)
    }

    const block = memoryBlocks[blockIndex]
    const newBlocks = [...memoryBlocks]

    // Remove the original block
    newBlocks.splice(blockIndex, 1)

    // Add the allocated block
    newBlocks.push({
      id: `allocated-${processId}`,
      start: startPosition,
      size: size,
      type: "allocated",
      processId,
      color,
    })

    // If there's remaining space, add a new free block
    if (block.size > size) {
      newBlocks.push({
        id: `free-${Date.now()}`,
        start: startPosition + size,
        size: block.size - size,
        type: "free",
      })
    }

    // Sort blocks by start position
    newBlocks.sort((a, b) => a.start - b.start)
    setMemoryBlocks(newBlocks)

    return true
  }

  // Add a new process
  const addProcess = (size: number) => {
    if (size <= 0 || size > totalMemorySize) {
      return false
    }

    const processId = `process-${Date.now()}`
    const color = generateRandomColor()

    const process: Process = {
      id: processId,
      size,
      color,
      allocated: false,
    }

    // Try to allocate memory
    const allocated = allocateMemory(size, processId, color)

    if (allocated) {
      process.allocated = true
      setProcesses([...processes, process])
      return true
    }

    return false
  }

  // Remove a process and free its memory
  const removeProcess = (id: string) => {
    const processIndex = processes.findIndex((p) => p.id === id)

    if (processIndex === -1) {
      return
    }

    // Find the memory block for this process
    const blockIndex = memoryBlocks.findIndex((block) => block.processId === id && block.type === "allocated")

    if (blockIndex === -1) {
      return
    }

    const block = memoryBlocks[blockIndex]
    const newBlocks = [...memoryBlocks]

    // Remove the allocated block
    newBlocks.splice(blockIndex, 1)

    // Add a free block in its place
    const freeBlock = {
      id: `free-${Date.now()}`,
      start: block.start,
      size: block.size,
      type: "free" as MemoryBlockType,
    }

    newBlocks.push(freeBlock)

    // Merge adjacent free blocks
    const sortedBlocks = [...newBlocks].sort((a, b) => a.start - b.start)
    const mergedBlocks: MemoryBlock[] = []

    for (let i = 0; i < sortedBlocks.length; i++) {
      const currentBlock = sortedBlocks[i]

      if (i > 0 && mergedBlocks[mergedBlocks.length - 1].type === "free" && currentBlock.type === "free") {
        // Merge with previous block
        const prevBlock = mergedBlocks[mergedBlocks.length - 1]
        prevBlock.size += currentBlock.size
      } else {
        mergedBlocks.push({ ...currentBlock })
      }
    }

    // Remove the process from the list
    const newProcesses = [...processes]
    newProcesses.splice(processIndex, 1)

    setMemoryBlocks(mergedBlocks)
    setProcesses(newProcesses)
  }

  const value = {
    memorySize: totalMemorySize,
    memoryBlocks,
    processes,
    algorithm,
    setAlgorithm,
    addProcess,
    removeProcess,
    resetMemory,
    compactMemory,
    memoryUtilization,
    fragmentation,
  }

  return <MemoryContext.Provider value={value}>{children}</MemoryContext.Provider>
}

export const useMemory = () => {
  const context = useContext(MemoryContext)
  if (context === undefined) {
    throw new Error("useMemory must be used within a MemoryProvider")
  }
  return context
}
