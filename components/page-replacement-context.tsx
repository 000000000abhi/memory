"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Page replacement algorithms
export type PageReplacementAlgorithm = "fifo" | "lru" | "opt" | "clock" | "nru" | "random" | "mlru" | "lfu-lru" | "fru"

// Page status
export type PageStatus = "hit" | "miss" | "fault"

// Page entry
export interface PageEntry {
  pageNumber: number
  frameNumber: number | null
  status: PageStatus
  timestamp: number
}

// Frame entry
export interface FrameEntry {
  frameNumber: number
  pageNumber: number | null
  lastAccessed: number
  referenced: boolean
  modified: boolean
  data?: string // Actual data in the frame
  frequency: number
  queueType?: "hot" | "warm" | "cold"
  recentAccessMask: number
  score?: number
}

// Swap entry
export interface SwapEntry {
  pageNumber: number
  swappedIn: number | null
  swappedOut: number
  modified: boolean
  data: string // Actual data in swap
}

// Page table entry
export interface PageTableEntry {
  virtualPageNumber: number
  physicalFrameNumber: number | null
  present: boolean
  referenced: boolean
  modified: boolean
  lastAccessed: number
  inSwap: boolean
}

// Algorithm result
export interface AlgorithmResult {
  algorithm: PageReplacementAlgorithm
  hits: number
  misses: number
  pageFaults: number
  hitRatio: number
  swapIns: number
  swapOuts: number
  avgAccessTime: number
}

// Access time metrics
export interface AccessTimeMetrics {
  memoryAccessTime: number
  pageFaultTime: number
  tlbHitTime: number
  tlbMissTime: number
  effectiveAccessTime: number
}

// Physical memory block
export interface PhysicalMemoryBlock {
  address: number
  size: number
  allocated: boolean
  data: string
  processId?: string
}

interface PageReplacementContextType {
  // Configuration
  frameCount: number
  setFrameCount: (count: number) => void
  algorithm: PageReplacementAlgorithm
  setAlgorithm: (algorithm: PageReplacementAlgorithm) => void
  swapEnabled: boolean
  setSwapEnabled: (enabled: boolean) => void
  swapSize: number
  setSwapSize: (size: number) => void

  // Page reference sequence
  referenceString: number[]
  setReferenceString: (sequence: number[]) => void
  manualReference: string
  setManualReference: (reference: string) => void
  generateRandomReferences: (length: number, maxPage: number) => void

  // Simulation state
  frames: FrameEntry[]
  pageHistory: PageEntry[]
  currentStep: number
  setCurrentStep: (step: number) => void
  pageTable: PageTableEntry[]
  swapSpace: SwapEntry[]
  accessTimeMetrics: AccessTimeMetrics
  physicalMemory: PhysicalMemoryBlock[]
  selectedFrame: number | null
  setSelectedFrame: (frame: number | null) => void
  selectedTlbEntry: number | null
  setSelectedTlbEntry: (entry: number | null) => void

  // Simulation controls
  runSimulation: () => void
  stepForward: () => void
  stepBackward: () => void
  resetSimulation: () => void
  accessPage: (pageNumber: number) => PageStatus
  writeToPage: (pageNumber: number, data: string) => PageStatus

  // Statistics
  hits: number
  misses: number
  pageFaults: number
  hitRatio: number
  swapIns: number
  swapOuts: number

  // Comparison
  comparisonResults: AlgorithmResult[]
  runComparison: () => void

  // TLB
  tlbEnabled: boolean
  setTlbEnabled: (enabled: boolean) => void
  tlbSize: number
  setTlbSize: (size: number) => void
  tlbHits: number
  tlbMisses: number
  tlbHitRatio: number
  tlbEntries: FrameEntry[]

  // FRU algorithm parameters
  alphaWeight: number
  setAlphaWeight: (weight: number) => void
  betaWeight: number
  setBetaWeight: (weight: number) => void
  gammaWeight: number
  setGammaWeight: (weight: number) => void

  // Filtering
  filterSwappedPages: boolean
  setFilterSwappedPages: (filter: boolean) => void
  filterReferencedPages: boolean
  setFilterReferencedPages: (filter: boolean) => void
  filterModifiedPages: boolean
  setFilterModifiedPages: (filter: boolean) => void
  searchPageNumber: number | null
  setSearchPageNumber: (pageNumber: number | null) => void

  // Memory fragmentation
  internalFragmentation: number
  externalFragmentation: number
  compactMemory: () => void
}

const PageReplacementContext = createContext<PageReplacementContextType | undefined>(undefined)

// Generate random data for a page
const generatePageData = (pageNumber: number): string => {
  return `Data for page ${pageNumber}: ${Math.random().toString(36).substring(2, 10)}`
}

export const PageReplacementProvider = ({ children }: { children: ReactNode }) => {
  // Configuration
  const [frameCount, setFrameCount] = useState<number>(3)
  const [algorithm, setAlgorithm] = useState<PageReplacementAlgorithm>("fifo")
  const [swapEnabled, setSwapEnabled] = useState<boolean>(true)
  const [swapSize, setSwapSize] = useState<number>(8)

  // Page reference sequence
  const [referenceString, setReferenceString] = useState<number[]>([])
  const [manualReference, setManualReference] = useState<string>("")

  // Simulation state
  const [frames, setFrames] = useState<FrameEntry[]>([])
  const [pageHistory, setPageHistory] = useState<PageEntry[]>([])
  const [currentStep, setCurrentStep] = useState<number>(-1)
  const [pageTable, setPageTable] = useState<PageTableEntry[]>([])
  const [swapSpace, setSwapSpace] = useState<SwapEntry[]>([])
  const [physicalMemory, setPhysicalMemory] = useState<PhysicalMemoryBlock[]>([])
  const [selectedFrame, setSelectedFrame] = useState<number | null>(null)
  const [selectedTlbEntry, setSelectedTlbEntry] = useState<number | null>(null)
  const [accessTimeMetrics, setAccessTimeMetrics] = useState<AccessTimeMetrics>({
    memoryAccessTime: 100, // nanoseconds
    pageFaultTime: 8000000, // nanoseconds (8 milliseconds)
    tlbHitTime: 2, // nanoseconds
    tlbMissTime: 100, // nanoseconds
    effectiveAccessTime: 0,
  })

  // Statistics
  const [hits, setHits] = useState<number>(0)
  const [misses, setMisses] = useState<number>(0)
  const [pageFaults, setPageFaults] = useState<number>(0)
  const [hitRatio, setHitRatio] = useState<number>(0)
  const [swapIns, setSwapIns] = useState<number>(0)
  const [swapOuts, setSwapOuts] = useState<number>(0)

  // Comparison
  const [comparisonResults, setComparisonResults] = useState<AlgorithmResult[]>([])

  // TLB
  const [tlbEnabled, setTlbEnabled] = useState<boolean>(false)
  const [tlbSize, setTlbSize] = useState<number>(4)
  const [tlbHits, setTlbHits] = useState<number>(0)
  const [tlbMisses, setTlbMisses] = useState<number>(0)
  const [tlbHitRatio, setTlbHitRatio] = useState<number>(0)
  const [tlbEntries, setTlbEntries] = useState<FrameEntry[]>([])

  // FRU algorithm parameters
  const [alphaWeight, setAlphaWeight] = useState<number>(0.5)
  const [betaWeight, setBetaWeight] = useState<number>(0.3)
  const [gammaWeight, setGammaWeight] = useState<number>(0.2)

  // Filtering
  const [filterSwappedPages, setFilterSwappedPages] = useState<boolean>(false)
  const [filterReferencedPages, setFilterReferencedPages] = useState<boolean>(false)
  const [filterModifiedPages, setFilterModifiedPages] = useState<boolean>(false)
  const [searchPageNumber, setSearchPageNumber] = useState<number | null>(null)

  // Memory fragmentation
  const [internalFragmentation, setInternalFragmentation] = useState<number>(0)
  const [externalFragmentation, setExternalFragmentation] = useState<number>(0)

  // Initialize frames
  useEffect(() => {
    resetSimulation()
  }, [frameCount])

  // Update hit ratio when hits or misses change
  useEffect(() => {
    const total = hits + misses
    setHitRatio(total > 0 ? (hits / total) * 100 : 0)

    const tlbTotal = tlbHits + tlbMisses
    setTlbHitRatio(tlbTotal > 0 ? (tlbHits / tlbTotal) * 100 : 0)

    // Calculate effective access time
    const pageFaultRate = total > 0 ? pageFaults / total : 0
    const tlbHitRate = tlbTotal > 0 ? tlbHits / tlbTotal : 0
    const tlbMissRate = tlbTotal > 0 ? tlbMisses / tlbTotal : 0

    const effectiveTime = tlbEnabled
      ? tlbHitRate * (accessTimeMetrics.tlbHitTime + accessTimeMetrics.memoryAccessTime) +
        tlbMissRate * (accessTimeMetrics.tlbMissTime + accessTimeMetrics.memoryAccessTime) +
        pageFaultRate * accessTimeMetrics.pageFaultTime
      : accessTimeMetrics.memoryAccessTime + pageFaultRate * accessTimeMetrics.pageFaultTime

    setAccessTimeMetrics((prev) => ({
      ...prev,
      effectiveAccessTime: effectiveTime,
    }))
  }, [
    hits,
    misses,
    pageFaults,
    tlbHits,
    tlbMisses,
    tlbEnabled,
    accessTimeMetrics.tlbHitTime,
    accessTimeMetrics.tlbMissTime,
    accessTimeMetrics.memoryAccessTime,
    accessTimeMetrics.pageFaultTime,
  ])

  // Reset simulation
  const resetSimulation = () => {
    // Initialize frames
    const initialFrames: FrameEntry[] = Array.from({ length: frameCount }, (_, i) => ({
      frameNumber: i,
      pageNumber: null,
      lastAccessed: 0,
      referenced: false,
      modified: false,
      data: "",
      frequency: 0,
      queueType: "cold",
      recentAccessMask: 0,
      score: 0,
    }))

    // Initialize TLB
    const initialTlbEntries: FrameEntry[] = Array.from({ length: tlbSize }, (_, i) => ({
      frameNumber: i,
      pageNumber: null,
      lastAccessed: 0,
      referenced: false,
      modified: false,
      data: "",
    }))

    // Initialize page table with 20 entries (arbitrary number for initial state)
    const initialPageTable: PageTableEntry[] = Array.from({ length: 20 }, (_, i) => ({
      virtualPageNumber: i,
      physicalFrameNumber: null,
      present: false,
      referenced: false,
      modified: false,
      lastAccessed: 0,
      inSwap: false,
    }))

    // Initialize physical memory
    const initialPhysicalMemory: PhysicalMemoryBlock[] = Array.from({ length: frameCount }, (_, i) => ({
      address: i * 4096, // 4KB page size
      size: 4096,
      allocated: false,
      data: "",
    }))

    setFrames(initialFrames)
    setTlbEntries(initialTlbEntries)
    setPageTable(initialPageTable)
    setSwapSpace([])
    setPhysicalMemory(initialPhysicalMemory)
    setPageHistory([])
    setCurrentStep(-1)
    setHits(0)
    setMisses(0)
    setPageFaults(0)
    setSwapIns(0)
    setSwapOuts(0)
    setTlbHits(0)
    setTlbMisses(0)
    setInternalFragmentation(0)
    setExternalFragmentation(0)
    setSelectedFrame(null)
    setSelectedTlbEntry(null)
  }

  // Generate random reference string
  const generateRandomReferences = (length: number, maxPage: number) => {
    const sequence: number[] = []

    // Generate with some locality of reference
    let currentPage = Math.floor(Math.random() * maxPage)

    for (let i = 0; i < length; i++) {
      // 70% chance to stay within +/- 1 of current page
      if (Math.random() < 0.7) {
        const offset = Math.floor(Math.random() * 3) - 1 // -1, 0, or 1
        currentPage = Math.max(0, Math.min(maxPage - 1, currentPage + offset))
      } else {
        // 30% chance to jump to a random page
        currentPage = Math.floor(Math.random() * maxPage)
      }

      sequence.push(currentPage)
    }

    setReferenceString(sequence)
    setManualReference(sequence.join(","))
  }

  // FIFO (First-In-First-Out) algorithm
  const fifoAlgorithm = (
    pageNumber: number,
    currentFrames: FrameEntry[],
  ): [FrameEntry[], boolean, boolean, number | null] => {
    let pageFault = false
    const tlbHit = false
    let victimPage: number | null = null

    // Check if page is already in a frame
    const frameIndex = currentFrames.findIndex((frame) => frame.pageNumber === pageNumber)

    if (frameIndex !== -1) {
      // Page hit
      const updatedFrames = [...currentFrames]
      updatedFrames[frameIndex].lastAccessed = Date.now()
      return [updatedFrames, pageFault, tlbHit, victimPage]
    }

    // Page fault
    pageFault = true

    // Find an empty frame
    const emptyFrameIndex = currentFrames.findIndex((frame) => frame.pageNumber === null)

    if (emptyFrameIndex !== -1) {
      // Place page in empty frame
      const updatedFrames = [...currentFrames]
      updatedFrames[emptyFrameIndex].pageNumber = pageNumber
      updatedFrames[emptyFrameIndex].lastAccessed = Date.now()
      updatedFrames[emptyFrameIndex].data = generatePageData(pageNumber)
      return [updatedFrames, pageFault, tlbHit, victimPage]
    }

    // No empty frames, find oldest frame (FIFO)
    const oldestFrameIndex = currentFrames.reduce(
      (oldest, frame, index, array) => (frame.lastAccessed < array[oldest].lastAccessed ? index : oldest),
      0,
    )

    // Record the victim page
    victimPage = currentFrames[oldestFrameIndex].pageNumber

    // Replace page in oldest frame
    const updatedFrames = [...currentFrames]
    updatedFrames[oldestFrameIndex].pageNumber = pageNumber
    updatedFrames[oldestFrameIndex].lastAccessed = Date.now()
    updatedFrames[oldestFrameIndex].referenced = false
    updatedFrames[oldestFrameIndex].modified = false
    updatedFrames[oldestFrameIndex].data = generatePageData(pageNumber)

    return [updatedFrames, pageFault, tlbHit, victimPage]
  }

  // LRU (Least Recently Used) algorithm
  const lruAlgorithm = (
    pageNumber: number,
    currentFrames: FrameEntry[],
  ): [FrameEntry[], boolean, boolean, number | null] => {
    let pageFault = false
    const tlbHit = false
    let victimPage: number | null = null

    // Check if page is already in a frame
    const frameIndex = currentFrames.findIndex((frame) => frame.pageNumber === pageNumber)

    if (frameIndex !== -1) {
      // Page hit
      const updatedFrames = [...currentFrames]
      updatedFrames[frameIndex].lastAccessed = Date.now()
      return [updatedFrames, pageFault, tlbHit, victimPage]
    }

    // Page fault
    pageFault = true

    // Find an empty frame
    const emptyFrameIndex = currentFrames.findIndex((frame) => frame.pageNumber === null)

    if (emptyFrameIndex !== -1) {
      // Place page in empty frame
      const updatedFrames = [...currentFrames]
      updatedFrames[emptyFrameIndex].pageNumber = pageNumber
      updatedFrames[emptyFrameIndex].lastAccessed = Date.now()
      updatedFrames[emptyFrameIndex].data = generatePageData(pageNumber)
      return [updatedFrames, pageFault, tlbHit, victimPage]
    }

    // No empty frames, find least recently used frame
    const lruFrameIndex = currentFrames.reduce(
      (lru, frame, index, array) => (frame.lastAccessed < array[lru].lastAccessed ? index : lru),
      0,
    )

    // Record the victim page
    victimPage = currentFrames[lruFrameIndex].pageNumber

    // Replace page in LRU frame
    const updatedFrames = [...currentFrames]
    updatedFrames[lruFrameIndex].pageNumber = pageNumber
    updatedFrames[lruFrameIndex].lastAccessed = Date.now()
    updatedFrames[lruFrameIndex].referenced = false
    updatedFrames[lruFrameIndex].modified = false
    updatedFrames[lruFrameIndex].data = generatePageData(pageNumber)

    return [updatedFrames, pageFault, tlbHit, victimPage]
  }

  // OPT (Optimal) algorithm
  const optAlgorithm = (
    pageNumber: number,
    currentFrames: FrameEntry[],
    currentIndex: number,
  ): [FrameEntry[], boolean, boolean, number | null] => {
    let pageFault = false
    const tlbHit = false
    let victimPage: number | null = null

    // Check if page is already in a frame
    const frameIndex = currentFrames.findIndex((frame) => frame.pageNumber === pageNumber)

    if (frameIndex !== -1) {
      // Page hit
      const updatedFrames = [...currentFrames]
      updatedFrames[frameIndex].lastAccessed = Date.now()
      return [updatedFrames, pageFault, tlbHit, victimPage]
    }

    // Page fault
    pageFault = true

    // Find an empty frame
    const emptyFrameIndex = currentFrames.findIndex((frame) => frame.pageNumber === null)

    if (emptyFrameIndex !== -1) {
      // Place page in empty frame
      const updatedFrames = [...currentFrames]
      updatedFrames[emptyFrameIndex].pageNumber = pageNumber
      updatedFrames[emptyFrameIndex].lastAccessed = Date.now()
      updatedFrames[emptyFrameIndex].data = generatePageData(pageNumber)
      return [updatedFrames, pageFault, tlbHit, victimPage]
    }

    // No empty frames, find optimal page to replace
    // For each page in frames, find when it will be used next
    const nextUse: { [frameIndex: number]: number } = {}

    currentFrames.forEach((frame, index) => {
      if (frame.pageNumber === null) {
        nextUse[index] = Number.POSITIVE_INFINITY
        return
      }

      // Find next use of this page
      const nextUseIndex = referenceString.indexOf(frame.pageNumber as number, currentIndex + 1)

      if (nextUseIndex === -1) {
        // Page will not be used again
        nextUse[index] = Number.POSITIVE_INFINITY
      } else {
        nextUse[index] = nextUseIndex
      }
    })

    // Find frame with page that will be used furthest in future
    const optimalFrameIndex = Object.entries(nextUse).reduce(
      (optimal, [index, nextUseIndex]) => (nextUseIndex > nextUse[Number.parseInt(optimal)] ? index : optimal),
      "0",
    )

    // Record the victim page
    victimPage = currentFrames[Number.parseInt(optimalFrameIndex)].pageNumber

    // Replace page in optimal frame
    const updatedFrames = [...currentFrames]
    updatedFrames[Number.parseInt(optimalFrameIndex)].pageNumber = pageNumber
    updatedFrames[Number.parseInt(optimalFrameIndex)].lastAccessed = Date.now()
    updatedFrames[Number.parseInt(optimalFrameIndex)].referenced = false
    updatedFrames[Number.parseInt(optimalFrameIndex)].modified = false
    updatedFrames[Number.parseInt(optimalFrameIndex)].data = generatePageData(pageNumber)

    return [updatedFrames, pageFault, tlbHit, victimPage]
  }

  // CLOCK algorithm
  const clockAlgorithm = (
    pageNumber: number,
    currentFrames: FrameEntry[],
  ): [FrameEntry[], boolean, boolean, number | null] => {
    let pageFault = false
    const tlbHit = false
    let victimPage: number | null = null

    // Check if page is already in a frame
    const frameIndex = currentFrames.findIndex((frame) => frame.pageNumber === pageNumber)

    if (frameIndex !== -1) {
      // Page hit
      const updatedFrames = [...currentFrames]
      updatedFrames[frameIndex].referenced = true
      updatedFrames[frameIndex].lastAccessed = Date.now()
      return [updatedFrames, pageFault, tlbHit, victimPage]
    }

    // Page fault
    pageFault = true

    // Find an empty frame
    const emptyFrameIndex = currentFrames.findIndex((frame) => frame.pageNumber === null)

    if (emptyFrameIndex !== -1) {
      // Place page in empty frame
      const updatedFrames = [...currentFrames]
      updatedFrames[emptyFrameIndex].pageNumber = pageNumber
      updatedFrames[emptyFrameIndex].referenced = true
      updatedFrames[emptyFrameIndex].lastAccessed = Date.now()
      updatedFrames[emptyFrameIndex].data = generatePageData(pageNumber)
      return [updatedFrames, pageFault, tlbHit, victimPage]
    }

    // No empty frames, use clock algorithm
    const updatedFrames = [...currentFrames]
    let clockHand = 0

    // Find a frame with referenced bit = false
    while (true) {
      if (!updatedFrames[clockHand].referenced) {
        // Found a frame to replace
        victimPage = updatedFrames[clockHand].pageNumber
        updatedFrames[clockHand].pageNumber = pageNumber
        updatedFrames[clockHand].referenced = true
        updatedFrames[clockHand].lastAccessed = Date.now()
        updatedFrames[clockHand].data = generatePageData(pageNumber)
        break
      }

      // Clear referenced bit and move clock hand
      updatedFrames[clockHand].referenced = false
      clockHand = (clockHand + 1) % frameCount
    }

    return [updatedFrames, pageFault, tlbHit, victimPage]
  }

  // NRU (Not Recently Used) algorithm
  const nruAlgorithm = (
    pageNumber: number,
    currentFrames: FrameEntry[],
  ): [FrameEntry[], boolean, boolean, number | null] => {
    let pageFault = false
    const tlbHit = false
    let victimPage: number | null = null

    // Check if page is already in a frame
    const frameIndex = currentFrames.findIndex((frame) => frame.pageNumber === pageNumber)

    if (frameIndex !== -1) {
      // Page hit
      const updatedFrames = [...currentFrames]
      updatedFrames[frameIndex].referenced = true
      updatedFrames[frameIndex].lastAccessed = Date.now()
      return [updatedFrames, pageFault, tlbHit, victimPage]
    }

    // Page fault
    pageFault = true

    // Find an empty frame
    const emptyFrameIndex = currentFrames.findIndex((frame) => frame.pageNumber === null)

    if (emptyFrameIndex !== -1) {
      // Place page in empty frame
      const updatedFrames = [...currentFrames]
      updatedFrames[emptyFrameIndex].pageNumber = pageNumber
      updatedFrames[emptyFrameIndex].referenced = true
      updatedFrames[emptyFrameIndex].lastAccessed = Date.now()
      updatedFrames[emptyFrameIndex].data = generatePageData(pageNumber)
      return [updatedFrames, pageFault, tlbHit, victimPage]
    }

    // No empty frames, use NRU algorithm
    // Class 0: not referenced, not modified
    // Class 1: not referenced, modified
    // Class 2: referenced, not modified
    // Class 3: referenced, modified

    const updatedFrames = [...currentFrames]

    // Find lowest class frame
    const classFrames: { [key: number]: number[] } = {
      0: [],
      1: [],
      2: [],
      3: [],
    }

    updatedFrames.forEach((frame, index) => {
      const classKey = (frame.referenced ? 2 : 0) + (frame.modified ? 1 : 0)
      classFrames[classKey].push(index)
    })

    // Find lowest non-empty class
    let selectedClass = 0
    while (classFrames[selectedClass].length === 0 && selectedClass < 4) {
      selectedClass++
    }

    // Select random frame from the class
    const selectedFrameIndex = classFrames[selectedClass][0]

    // Record the victim page
    victimPage = updatedFrames[selectedFrameIndex].pageNumber

    // Replace page
    updatedFrames[selectedFrameIndex].pageNumber = pageNumber
    updatedFrames[selectedFrameIndex].referenced = true
    updatedFrames[selectedFrameIndex].modified = false
    updatedFrames[selectedFrameIndex].lastAccessed = Date.now()
    updatedFrames[selectedFrameIndex].data = generatePageData(pageNumber)

    return [updatedFrames, pageFault, tlbHit, victimPage]
  }

  // Random algorithm
  const randomAlgorithm = (
    pageNumber: number,
    currentFrames: FrameEntry[],
  ): [FrameEntry[], boolean, boolean, number | null] => {
    let pageFault = false
    const tlbHit = false
    let victimPage: number | null = null

    // Check if page is already in a frame
    const frameIndex = currentFrames.findIndex((frame) => frame.pageNumber === pageNumber)

    if (frameIndex !== -1) {
      // Page hit
      const updatedFrames = [...currentFrames]
      updatedFrames[frameIndex].lastAccessed = Date.now()
      return [updatedFrames, pageFault, tlbHit, victimPage]
    }

    // Page fault
    pageFault = true

    // Find an empty frame
    const emptyFrameIndex = currentFrames.findIndex((frame) => frame.pageNumber === null)

    if (emptyFrameIndex !== -1) {
      // Place page in empty frame
      const updatedFrames = [...currentFrames]
      updatedFrames[emptyFrameIndex].pageNumber = pageNumber
      updatedFrames[emptyFrameIndex].lastAccessed = Date.now()
      updatedFrames[emptyFrameIndex].data = generatePageData(pageNumber)
      return [updatedFrames, pageFault, tlbHit, victimPage]
    }

    // No empty frames, select random frame
    const randomFrameIndex = Math.floor(Math.random() * frameCount)

    // Record the victim page
    victimPage = currentFrames[randomFrameIndex].pageNumber

    // Replace page in random frame
    const updatedFrames = [...currentFrames]
    updatedFrames[randomFrameIndex].pageNumber = pageNumber
    updatedFrames[randomFrameIndex].lastAccessed = Date.now()
    updatedFrames[randomFrameIndex].referenced = false
    updatedFrames[randomFrameIndex].modified = false
    updatedFrames[randomFrameIndex].data = generatePageData(pageNumber)

    return [updatedFrames, pageFault, tlbHit, victimPage]
  }

  // MLRU (Multi-level LRU) algorithm
  const mlruAlgorithm = (
    pageNumber: number,
    currentFrames: FrameEntry[],
  ): [FrameEntry[], boolean, boolean, number | null] => {
    let pageFault = false
    const tlbHit = false
    let victimPage: number | null = null

    // Check if page is already in a frame
    const frameIndex = currentFrames.findIndex((frame) => frame.pageNumber === pageNumber)

    if (frameIndex !== -1) {
      // Page hit - promote the page if needed
      const updatedFrames = [...currentFrames]
      updatedFrames[frameIndex].lastAccessed = Date.now()

      // Promote page based on current queue type
      if (updatedFrames[frameIndex].queueType === "cold") {
        updatedFrames[frameIndex].queueType = "warm"
      } else if (updatedFrames[frameIndex].queueType === "warm") {
        updatedFrames[frameIndex].queueType = "hot"
      }

      return [updatedFrames, pageFault, tlbHit, victimPage]
    }

    // Page fault
    pageFault = true

    // Find an empty frame
    const emptyFrameIndex = currentFrames.findIndex((frame) => frame.pageNumber === null)

    if (emptyFrameIndex !== -1) {
      // Place page in empty frame (start in cold queue)
      const updatedFrames = [...currentFrames]
      updatedFrames[emptyFrameIndex].pageNumber = pageNumber
      updatedFrames[emptyFrameIndex].lastAccessed = Date.now()
      updatedFrames[emptyFrameIndex].queueType = "cold"
      updatedFrames[emptyFrameIndex].data = generatePageData(pageNumber)
      return [updatedFrames, pageFault, tlbHit, victimPage]
    }

    // No empty frames, use MLRU to find victim
    // First try to find a victim in the cold queue
    const updatedFrames = [...currentFrames]

    // Find oldest page in cold queue
    const coldFrames = updatedFrames.filter((frame) => frame.queueType === "cold")
    if (coldFrames.length > 0) {
      const oldestColdFrame = coldFrames.reduce(
        (oldest, frame) => (frame.lastAccessed < oldest.lastAccessed ? frame : oldest),
        coldFrames[0],
      )
      const victimIndex = updatedFrames.findIndex((frame) => frame.frameNumber === oldestColdFrame.frameNumber)

      // Record the victim page
      victimPage = updatedFrames[victimIndex].pageNumber

      // Replace page
      updatedFrames[victimIndex].pageNumber = pageNumber
      updatedFrames[victimIndex].lastAccessed = Date.now()
      updatedFrames[victimIndex].queueType = "cold"
      updatedFrames[victimIndex].data = generatePageData(pageNumber)

      return [updatedFrames, pageFault, tlbHit, victimPage]
    }

    // If no cold frames, try warm queue
    const warmFrames = updatedFrames.filter((frame) => frame.queueType === "warm")
    if (warmFrames.length > 0) {
      const oldestWarmFrame = warmFrames.reduce(
        (oldest, frame) => (frame.lastAccessed < oldest.lastAccessed ? frame : oldest),
        warmFrames[0],
      )
      const victimIndex = updatedFrames.findIndex((frame) => frame.frameNumber === oldestWarmFrame.frameNumber)

      // Record the victim page
      victimPage = updatedFrames[victimIndex].pageNumber

      // Replace page
      updatedFrames[victimIndex].pageNumber = pageNumber
      updatedFrames[victimIndex].lastAccessed = Date.now()
      updatedFrames[victimIndex].queueType = "cold"
      updatedFrames[victimIndex].data = generatePageData(pageNumber)

      return [updatedFrames, pageFault, tlbHit, victimPage]
    }

    // If no warm frames either, use hot queue (rare case)
    const hotFrames = updatedFrames.filter((frame) => frame.queueType === "hot")
    const oldestHotFrame = hotFrames.reduce(
      (oldest, frame) => (frame.lastAccessed < oldest.lastAccessed ? frame : oldest),
      hotFrames[0],
    )
    const victimIndex = updatedFrames.findIndex((frame) => frame.frameNumber === oldestHotFrame.frameNumber)

    // Record the victim page
    victimPage = updatedFrames[victimIndex].pageNumber

    // Replace page
    updatedFrames[victimIndex].pageNumber = pageNumber
    updatedFrames[victimIndex].lastAccessed = Date.now()
    updatedFrames[victimIndex].queueType = "cold"
    updatedFrames[victimIndex].data = generatePageData(pageNumber)

    return [updatedFrames, pageFault, tlbHit, victimPage]
  }

  // LFU-LRU Hybrid algorithm
  const lfuLruAlgorithm = (
    pageNumber: number,
    currentFrames: FrameEntry[],
  ): [FrameEntry[], boolean, boolean, number | null] => {
    let pageFault = false
    const tlbHit = false
    let victimPage: number | null = null

    // Check if page is already in a frame
    const frameIndex = currentFrames.findIndex((frame) => frame.pageNumber === pageNumber)

    if (frameIndex !== -1) {
      // Page hit - update frequency and timestamp
      const updatedFrames = [...currentFrames]
      updatedFrames[frameIndex].frequency += 1
      updatedFrames[frameIndex].lastAccessed = Date.now()
      return [updatedFrames, pageFault, tlbHit, victimPage]
    }

    // Page fault
    pageFault = true

    // Find an empty frame
    const emptyFrameIndex = currentFrames.findIndex((frame) => frame.pageNumber === null)

    if (emptyFrameIndex !== -1) {
      // Place page in empty frame
      const updatedFrames = [...currentFrames]
      updatedFrames[emptyFrameIndex].pageNumber = pageNumber
      updatedFrames[emptyFrameIndex].lastAccessed = Date.now()
      updatedFrames[emptyFrameIndex].frequency = 1
      updatedFrames[emptyFrameIndex].data = generatePageData(pageNumber)
      return [updatedFrames, pageFault, tlbHit, victimPage]
    }

    // No empty frames, use LFU-LRU hybrid to find victim
    const updatedFrames = [...currentFrames]

    // Find the frame with the lowest frequency
    const minFrequency = Math.min(...updatedFrames.map((frame) => frame.frequency))
    const leastFrequentFrames = updatedFrames.filter((frame) => frame.frequency === minFrequency)

    // If multiple frames have the same frequency, use LRU to break the tie
    const victimFrame = leastFrequentFrames.reduce(
      (oldest, frame) => (frame.lastAccessed < oldest.lastAccessed ? frame : oldest),
      leastFrequentFrames[0],
    )

    const victimIndex = updatedFrames.findIndex((frame) => frame.frameNumber === victimFrame.frameNumber)

    // Record the victim page
    victimPage = updatedFrames[victimIndex].pageNumber

    // Replace page
    updatedFrames[victimIndex].pageNumber = pageNumber
    updatedFrames[victimIndex].lastAccessed = Date.now()
    updatedFrames[victimIndex].frequency = 1
    updatedFrames[victimIndex].data = generatePageData(pageNumber)

    return [updatedFrames, pageFault, tlbHit, victimPage]
  }

  // FRU (Frequency + Recency + Usage) algorithm
  const fruAlgorithm = (
    pageNumber: number,
    currentFrames: FrameEntry[],
  ): [FrameEntry[], boolean, boolean, number | null] => {
    let pageFault = false
    const tlbHit = false
    let victimPage: number | null = null

    // Check if page is already in a frame
    const frameIndex = currentFrames.findIndex((frame) => frame.pageNumber === pageNumber)

    if (frameIndex !== -1) {
      // Page hit - update metrics
      const updatedFrames = [...currentFrames]
      updatedFrames[frameIndex].frequency += 1
      updatedFrames[frameIndex].lastAccessed = Date.now()

      // Update recent access mask (shift left and set lowest bit)
      updatedFrames[frameIndex].recentAccessMask = (updatedFrames[frameIndex].recentAccessMask << 1) | 1
      // Keep only the last 8 bits
      updatedFrames[frameIndex].recentAccessMask &= 0xff

      // Update score
      updatedFrames[frameIndex].score = calculateFruScore(updatedFrames[frameIndex])

      return [updatedFrames, pageFault, tlbHit, victimPage]
    }

    // Page fault
    pageFault = true

    // Find an empty frame
    const emptyFrameIndex = currentFrames.findIndex((frame) => frame.pageNumber === null)

    if (emptyFrameIndex !== -1) {
      // Place page in empty frame
      const updatedFrames = [...currentFrames]
      updatedFrames[emptyFrameIndex].pageNumber = pageNumber
      updatedFrames[emptyFrameIndex].lastAccessed = Date.now()
      updatedFrames[emptyFrameIndex].frequency = 1
      updatedFrames[emptyFrameIndex].recentAccessMask = 1 // Set lowest bit
      updatedFrames[emptyFrameIndex].data = generatePageData(pageNumber)

      // Calculate initial score
      updatedFrames[emptyFrameIndex].score = calculateFruScore(updatedFrames[emptyFrameIndex])

      return [updatedFrames, pageFault, tlbHit, victimPage]
    }

    // No empty frames, use FRU to find victim
    const updatedFrames = [...currentFrames]

    // Update scores for all frames
    updatedFrames.forEach((frame) => {
      frame.score = calculateFruScore(frame)
    })

    // Find the frame with the lowest score
    const victimFrame = updatedFrames.reduce(
      (lowest, frame) =>
        (frame.score ?? Number.POSITIVE_INFINITY) < (lowest.score ?? Number.POSITIVE_INFINITY) ? frame : lowest,
      updatedFrames[0],
    )

    const victimIndex = updatedFrames.findIndex((frame) => frame.frameNumber === victimFrame.frameNumber)

    // Record the victim page
    victimPage = updatedFrames[victimIndex].pageNumber

    // Replace page
    updatedFrames[victimIndex].pageNumber = pageNumber
    updatedFrames[victimIndex].lastAccessed = Date.now()
    updatedFrames[victimIndex].frequency = 1
    updatedFrames[victimIndex].recentAccessMask = 1 // Set lowest bit
    updatedFrames[victimIndex].data = generatePageData(pageNumber)

    // Calculate initial score
    updatedFrames[victimIndex].score = calculateFruScore(updatedFrames[victimIndex])

    return [updatedFrames, pageFault, tlbHit, victimPage]
  }

  // Helper function to calculate FRU score
  const calculateFruScore = (frame: FrameEntry): number => {
    if (frame.pageNumber === null) return 0

    const now = Date.now()
    const recencyScore = (now - frame.lastAccessed) / 1000 // Seconds since last access
    const frequencyScore = frame.frequency || 0

    // Count set bits in the recent access mask (population count)
    let recentAccessCount = 0
    let mask = frame.recentAccessMask || 0
    while (mask > 0) {
      if (mask & 1) recentAccessCount++
      mask >>= 1
    }

    // Calculate weighted score (higher is better, so we'll invert when selecting victim)
    // Make sure weights sum to 1.0 to keep the score normalized
    const normalizedAlpha = alphaWeight / (alphaWeight + betaWeight + gammaWeight)
    const normalizedBeta = betaWeight / (alphaWeight + betaWeight + gammaWeight)
    const normalizedGamma = gammaWeight / (alphaWeight + betaWeight + gammaWeight)

    const score = normalizedAlpha * frequencyScore - normalizedBeta * recencyScore + normalizedGamma * recentAccessCount

    // Return negative score so that higher values (better pages) have lower scores for victim selection
    return -score
  }

  // TLB lookup
  const tlbLookup = (pageNumber: number, tlbEntries: FrameEntry[]): boolean => {
    // Check if page is in TLB
    return tlbEntries.some((entry) => entry.pageNumber === pageNumber)
  }

  // TLB update
  const updateTLB = (pageNumber: number, frameNumber: number, tlbEntries: FrameEntry[]): FrameEntry[] => {
    const updatedTLB = [...tlbEntries]

    // Check if page is already in TLB
    const tlbIndex = updatedTLB.findIndex((entry) => entry.pageNumber === pageNumber)

    if (tlbIndex !== -1) {
      // Update existing entry
      updatedTLB[tlbIndex].lastAccessed = Date.now()
      return updatedTLB
    }

    // Find empty TLB entry
    const emptyIndex = updatedTLB.findIndex((entry) => entry.pageNumber === null)

    if (emptyIndex !== -1) {
      // Use empty entry
      updatedTLB[emptyIndex].pageNumber = pageNumber
      updatedTLB[emptyIndex].lastAccessed = Date.now()
      return updatedTLB
    }

    // Replace LRU entry
    const lruIndex = updatedTLB.reduce(
      (lru, entry, index, array) => (entry.lastAccessed < array[lru].lastAccessed ? index : lru),
      0,
    )

    updatedTLB[lruIndex].pageNumber = pageNumber
    updatedTLB[lruIndex].lastAccessed = Date.now()

    return updatedTLB
  }

  // Handle swap operations
  const handleSwapOperations = (victimPage: number | null, pageNumber: number): [SwapEntry[], boolean, boolean] => {
    let swapIn = false
    let swapOut = false
    const updatedSwapSpace = [...swapSpace]

    // Check if the requested page is in swap space (swap in)
    const swapInIndex = updatedSwapSpace.findIndex((entry) => entry.pageNumber === pageNumber)
    if (swapInIndex !== -1) {
      // Page is in swap, bring it in
      updatedSwapSpace[swapInIndex].swappedIn = Date.now()
      swapIn = true
    }

    // If there's a victim page, add it to swap space (swap out)
    if (victimPage !== null) {
      // Check if the victim page is already in swap
      const existingSwapIndex = updatedSwapSpace.findIndex((entry) => entry.pageNumber === victimPage)

      if (existingSwapIndex !== -1) {
        // Update existing entry
        updatedSwapSpace[existingSwapIndex].swappedOut = Date.now()
        updatedSwapSpace[existingSwapIndex].swappedIn = null
      } else {
        // Add new entry to swap space
        updatedSwapSpace.push({
          pageNumber: victimPage,
          swappedOut: Date.now(),
          swappedIn: null,
          modified: false, // Assume not modified for simplicity
          data: generatePageData(victimPage), // Store the data in swap
        })
      }
      swapOut = true
    }

    return [updatedSwapSpace, swapIn, swapOut]
  }

  // Update page table
  const updatePageTable = (
    pageNumber: number,
    frameNumber: number | null,
    isPresent: boolean,
    isReferenced: boolean,
    isModified: boolean,
    isInSwap: boolean,
  ): PageTableEntry[] => {
    const updatedPageTable = [...pageTable]

    // Ensure the page table is large enough
    while (updatedPageTable.length <= pageNumber) {
      updatedPageTable.push({
        virtualPageNumber: updatedPageTable.length,
        physicalFrameNumber: null,
        present: false,
        referenced: false,
        modified: false,
        lastAccessed: 0,
        inSwap: false,
      })
    }

    // Update the page table entry
    updatedPageTable[pageNumber] = {
      virtualPageNumber: pageNumber,
      physicalFrameNumber: frameNumber,
      present: isPresent,
      referenced: isReferenced,
      modified: isModified,
      lastAccessed: Date.now(),
      inSwap: isInSwap,
    }

    return updatedPageTable
  }

  // Update physical memory
  const updatePhysicalMemory = (
    frameNumber: number,
    pageNumber: number | null,
    data: string,
  ): PhysicalMemoryBlock[] => {
    const updatedPhysicalMemory = [...physicalMemory]

    // Ensure physical memory is large enough
    while (updatedPhysicalMemory.length <= frameNumber) {
      updatedPhysicalMemory.push({
        address: updatedPhysicalMemory.length * 4096,
        size: 4096,
        allocated: false,
        data: "",
      })
    }

    // Update the physical memory block
    updatedPhysicalMemory[frameNumber] = {
      address: frameNumber * 4096,
      size: 4096,
      allocated: pageNumber !== null,
      data: pageNumber !== null ? data : "",
      processId: pageNumber !== null ? `Process-${pageNumber}` : undefined,
    }

    return updatedPhysicalMemory
  }

  // Process a page reference
  const processPageReference = (
    pageNumber: number,
    currentFrames: FrameEntry[],
    currentIndex: number,
    tlbEntries: FrameEntry[] = [],
  ): [FrameEntry[], PageEntry, FrameEntry[], SwapEntry[], PageTableEntry[], PhysicalMemoryBlock[]] => {
    let pageFault = false
    let tlbHit = false
    let updatedFrames = [...currentFrames]
    let updatedTLB = [...tlbEntries]
    let updatedSwapSpace = [...swapSpace]
    let updatedPageTable = [...pageTable]
    let updatedPhysicalMemory = [...physicalMemory]
    let victimPage: number | null = null

    // Check TLB if enabled
    if (tlbEnabled && tlbEntries.length > 0) {
      tlbHit = tlbLookup(pageNumber, tlbEntries)

      if (tlbHit) {
        // TLB hit
        setTlbHits((prev) => prev + 1)

        // Find frame number from TLB
        const frameIndex = currentFrames.findIndex((frame) => frame.pageNumber === pageNumber)

        if (frameIndex !== -1) {
          // Update frame access time
          updatedFrames[frameIndex].lastAccessed = Date.now()
          updatedFrames[frameIndex].referenced = true

          // Update TLB
          updatedTLB = updateTLB(pageNumber, frameIndex, tlbEntries)

          // Update page table
          updatedPageTable = updatePageTable(
            pageNumber,
            frameIndex,
            true,
            true,
            updatedFrames[frameIndex].modified,
            false,
          )

          // Create page entry
          const pageEntry: PageEntry = {
            pageNumber,
            frameNumber: frameIndex,
            status: "hit",
            timestamp: Date.now(),
          }

          return [updatedFrames, pageEntry, updatedTLB, updatedSwapSpace, updatedPageTable, updatedPhysicalMemory]
        }
      } else {
        // TLB miss
        setTlbMisses((prev) => prev + 1)
      }
    }

    // Process page reference based on algorithm
    let newFrames: FrameEntry[]

    switch (algorithm) {
      case "fifo":
        ;[newFrames, pageFault, tlbHit, victimPage] = fifoAlgorithm(pageNumber, updatedFrames)
        break
      case "lru":
        ;[newFrames, pageFault, tlbHit, victimPage] = lruAlgorithm(pageNumber, updatedFrames)
        break
      case "opt":
        ;[newFrames, pageFault, tlbHit, victimPage] = optAlgorithm(pageNumber, updatedFrames, currentIndex)
        break
      case "clock":
        ;[newFrames, pageFault, tlbHit, victimPage] = clockAlgorithm(pageNumber, updatedFrames)
        break
      case "nru":
        ;[newFrames, pageFault, tlbHit, victimPage] = nruAlgorithm(pageNumber, updatedFrames)
        break
      case "random":
        ;[newFrames, pageFault, tlbHit, victimPage] = randomAlgorithm(pageNumber, updatedFrames)
        break
      case "mlru":
        ;[newFrames, pageFault, tlbHit, victimPage] = mlruAlgorithm(pageNumber, updatedFrames)
        break
      case "lfu-lru":
        ;[newFrames, pageFault, tlbHit, victimPage] = lfuLruAlgorithm(pageNumber, updatedFrames)
        break
      case "fru":
        ;[newFrames, pageFault, tlbHit, victimPage] = fruAlgorithm(pageNumber, updatedFrames)
        break
      default:
        ;[newFrames, pageFault, tlbHit, victimPage] = fifoAlgorithm(pageNumber, updatedFrames)
    }

    updatedFrames = newFrames

    // Handle swap operations if enabled
    let swapIn = false
    let swapOut = false
    if (swapEnabled && pageFault) {
      ;[updatedSwapSpace, swapIn, swapOut] = handleSwapOperations(victimPage, pageNumber)

      if (swapIn) setSwapIns((prev) => prev + 1)
      if (swapOut) setSwapOuts((prev) => prev + 1)
    }

    // Find frame number for this page
    const frameIndex = updatedFrames.findIndex((frame) => frame.pageNumber === pageNumber)

    // Update TLB if enabled
    if (tlbEnabled && frameIndex !== -1) {
      updatedTLB = updateTLB(pageNumber, frameIndex, tlbEntries)
    }

    // Update page table
    updatedPageTable = updatePageTable(
      pageNumber,
      frameIndex !== -1 ? frameIndex : null,
      frameIndex !== -1,
      frameIndex !== -1,
      false, // Assume not modified initially
      swapEnabled && !swapIn && victimPage === pageNumber,
    )

    // Update physical memory
    if (frameIndex !== -1) {
      updatedPhysicalMemory = updatePhysicalMemory(
        frameIndex,
        pageNumber,
        updatedFrames[frameIndex].data || generatePageData(pageNumber),
      )
    }

    // If victim page exists, update its page table entry
    if (victimPage !== null) {
      // Find if victim is in swap
      const victimInSwap = updatedSwapSpace.some((entry) => entry.pageNumber === victimPage)

      // Update victim's page table entry
      updatedPageTable = updatePageTable(victimPage, null, false, false, false, victimInSwap)
    }

    // Create page entry
    const pageEntry: PageEntry = {
      pageNumber,
      frameNumber: frameIndex !== -1 ? frameIndex : null,
      status: pageFault ? "fault" : "hit",
      timestamp: Date.now(),
    }

    return [updatedFrames, pageEntry, updatedTLB, updatedSwapSpace, updatedPageTable, updatedPhysicalMemory]
  }

  // Access a page (for demand paging)
  const accessPage = (pageNumber: number): PageStatus => {
    // Check if page is in memory
    const frameIndex = frames.findIndex((frame) => frame.pageNumber === pageNumber)

    if (frameIndex !== -1) {
      // Page hit
      setHits((prev) => prev + 1)

      // Update frame
      const updatedFrames = [...frames]
      updatedFrames[frameIndex].lastAccessed = Date.now()
      updatedFrames[frameIndex].referenced = true
      setFrames(updatedFrames)

      // Update page table
      const updatedPageTable = updatePageTable(pageNumber, frameIndex, true, true, frames[frameIndex].modified, false)
      setPageTable(updatedPageTable)

      // Add to history
      const pageEntry: PageEntry = {
        pageNumber,
        frameNumber: frameIndex,
        status: "hit",
        timestamp: Date.now(),
      }
      setPageHistory((prev) => [...prev, pageEntry])
      setCurrentStep((prev) => prev + 1)

      return "hit"
    } else {
      // Page fault
      setMisses((prev) => prev + 1)
      setPageFaults((prev) => prev + 1)

      // Process page fault
      const [newFrames, pageEntry, newTLB, newSwapSpace, newPageTable, newPhysicalMemory] = processPageReference(
        pageNumber,
        frames,
        pageHistory.length,
        tlbEntries,
      )

      // Update state
      setFrames(newFrames)
      setTlbEntries(newTLB)
      setSwapSpace(newSwapSpace)
      setPageTable(newPageTable)
      setPhysicalMemory(newPhysicalMemory)

      // Add to history
      setPageHistory((prev) => [...prev, pageEntry])
      setCurrentStep((prev) => prev + 1)

      // Calculate fragmentation
      calculateFragmentation(newFrames)

      return "fault"
    }
  }

  // Write to a page
  const writeToPage = (pageNumber: number, data: string): PageStatus => {
    // First access the page to ensure it's in memory
    const status = accessPage(pageNumber)

    // Find the frame containing the page
    const frameIndex = frames.findIndex((frame) => frame.pageNumber === pageNumber)

    if (frameIndex !== -1) {
      // Update frame data and mark as modified
      const updatedFrames = [...frames]
      updatedFrames[frameIndex].data = data
      updatedFrames[frameIndex].modified = true
      setFrames(updatedFrames)

      // Update page table
      const updatedPageTable = updatePageTable(
        pageNumber,
        frameIndex,
        true,
        true,
        true, // Modified
        false,
      )
      setPageTable(updatedPageTable)

      // Update physical memory
      const updatedPhysicalMemory = updatePhysicalMemory(frameIndex, pageNumber, data)
      setPhysicalMemory(updatedPhysicalMemory)
    }

    return status
  }

  // Run simulation
  const runSimulation = () => {
    if (referenceString.length === 0) {
      // Parse manual reference string if needed
      if (manualReference.trim()) {
        const parsed = manualReference
          .split(/[,\s]+/)
          .map((num) => Number.parseInt(num.trim()))
          .filter((num) => !isNaN(num))
        setReferenceString(parsed)
      } else {
        return
      }
    }

    resetSimulation()

    let currentFrames = [...frames]
    let currentTlbEntries = [...tlbEntries]
    let currentSwapSpace = [...swapSpace]
    let currentPageTable = [...pageTable]
    let currentPhysicalMemory = [...physicalMemory]
    const history: PageEntry[] = []
    let hitCount = 0
    let missCount = 0
    let faultCount = 0
    const swapInCount = 0
    const swapOutCount = 0

    // Process each page reference
    referenceString.forEach((pageNumber, index) => {
      const [newFrames, pageEntry, newTLB, newSwapSpace, newPageTable, newPhysicalMemory] = processPageReference(
        pageNumber,
        currentFrames,
        index,
        currentTlbEntries,
      )

      currentFrames = newFrames
      currentTlbEntries = newTLB
      currentSwapSpace = newSwapSpace
      currentPageTable = newPageTable
      currentPhysicalMemory = newPhysicalMemory
      history.push(pageEntry)

      if (pageEntry.status === "hit") {
        hitCount++
      } else {
        missCount++
        if (pageEntry.status === "fault") {
          faultCount++
        }
      }
    })

    setFrames(currentFrames)
    setTlbEntries(currentTlbEntries)
    setSwapSpace(currentSwapSpace)
    setPageTable(currentPageTable)
    setPhysicalMemory(currentPhysicalMemory)
    setPageHistory(history)
    setHits(hitCount)
    setMisses(missCount)
    setPageFaults(faultCount)
    setSwapIns(swapInCount)
    setSwapOuts(swapOutCount)
    setCurrentStep(history.length - 1)

    // Calculate fragmentation
    calculateFragmentation(currentFrames)
  }

  // Calculate memory fragmentation
  const calculateFragmentation = (currentFrames: FrameEntry[]) => {
    // External fragmentation: percentage of memory that is free but not usable for allocation
    const totalFreeFrames = currentFrames.filter((frame) => frame.pageNumber === null).length
    const externalFrag = totalFreeFrames > 0 ? (totalFreeFrames / frameCount) * 100 : 0

    // Internal fragmentation: percentage of allocated memory that is wasted
    // For simplicity, we'll assume each page uses 80% of its frame on average
    const allocatedFrames = currentFrames.filter((frame) => frame.pageNumber !== null).length
    const internalFrag = allocatedFrames > 0 ? ((allocatedFrames * 0.2) / frameCount) * 100 : 0

    setExternalFragmentation(externalFrag)
    setInternalFragmentation(internalFrag)
  }

  // Compact memory
  const compactMemory = () => {
    // Get all allocated frames
    const allocatedFrames = frames.filter((frame) => frame.pageNumber !== null)

    // Create new frames array with allocated frames at the beginning
    const newFrames: FrameEntry[] = []

    // Add allocated frames
    allocatedFrames.forEach((frame, index) => {
      newFrames.push({
        ...frame,
        frameNumber: index,
      })
    })

    // Add empty frames to fill the rest
    for (let i = allocatedFrames.length; i < frameCount; i++) {
      newFrames.push({
        frameNumber: i,
        pageNumber: null,
        lastAccessed: 0,
        referenced: false,
        modified: false,
        data: "",
      })
    }

    // Update page table to reflect new frame numbers
    const newPageTable = [...pageTable]
    allocatedFrames.forEach((frame, index) => {
      if (frame.pageNumber !== null) {
        const pageIndex = newPageTable.findIndex((entry) => entry.virtualPageNumber === frame.pageNumber)
        if (pageIndex !== -1) {
          newPageTable[pageIndex].physicalFrameNumber = index
        }
      }
    })

    // Update physical memory
    const newPhysicalMemory = [...physicalMemory]
    allocatedFrames.forEach((frame, index) => {
      if (frame.pageNumber !== null) {
        newPhysicalMemory[index] = {
          address: index * 4096,
          size: 4096,
          allocated: true,
          data: frame.data || "",
          processId: `Process-${frame.pageNumber}`,
        }
      }
    })

    // Fill remaining physical memory with empty blocks
    for (let i = allocatedFrames.length; i < frameCount; i++) {
      newPhysicalMemory[i] = {
        address: i * 4096,
        size: 4096,
        allocated: false,
        data: "",
      }
    }

    // Update state
    setFrames(newFrames)
    setPageTable(newPageTable)
    setPhysicalMemory(newPhysicalMemory)

    // Recalculate fragmentation
    calculateFragmentation(newFrames)
  }

  // Step forward in simulation
  const stepForward = () => {
    if (currentStep >= referenceString.length - 1 || referenceString.length === 0) {
      return
    }

    const nextStep = currentStep + 1
    const pageNumber = referenceString[nextStep]

    // Get current state
    const currentFrames = [...frames]
    const currentTlbEntries = [...tlbEntries]
    const currentSwapSpace = [...swapSpace]
    const currentPageTable = [...pageTable]
    const currentPhysicalMemory = [...physicalMemory]

    // Process the next page reference
    const [newFrames, pageEntry, newTLB, newSwapSpace, newPageTable, newPhysicalMemory] = processPageReference(
      pageNumber,
      currentFrames,
      nextStep,
      currentTlbEntries,
    )

    // Update state
    setFrames(newFrames)
    setTlbEntries(newTLB)
    setSwapSpace(newSwapSpace)
    setPageTable(newPageTable)
    setPhysicalMemory(newPhysicalMemory)

    // Update history
    const newHistory = [...pageHistory, pageEntry]
    setPageHistory(newHistory)

    // Update statistics
    if (pageEntry.status === "hit") {
      setHits((prev) => prev + 1)
    } else {
      setMisses((prev) => prev + 1)
      if (pageEntry.status === "fault") {
        setPageFaults((prev) => prev + 1)
      }
    }

    setCurrentStep(nextStep)

    // Calculate fragmentation
    calculateFragmentation(newFrames)
  }

  // Step backward in simulation
  const stepBackward = () => {
    if (currentStep <= 0) {
      resetSimulation()
      return
    }

    const prevStep = currentStep - 1

    // Rerun simulation up to previous step
    resetSimulation()

    let currentFrames = [...frames]
    let currentTlbEntries = [...tlbEntries]
    let currentSwapSpace = [...swapSpace]
    let currentPageTable = [...pageTable]
    let currentPhysicalMemory = [...physicalMemory]
    const history: PageEntry[] = []
    let hitCount = 0
    let missCount = 0
    let faultCount = 0
    const swapInCount = 0
    const swapOutCount = 0

    // Process each page reference up to previous step
    for (let i = 0; i <= prevStep; i++) {
      const pageNumber = referenceString[i]

      const [newFrames, pageEntry, newTLB, newSwapSpace, newPageTable, newPhysicalMemory] = processPageReference(
        pageNumber,
        currentFrames,
        i,
        currentTlbEntries,
      )

      currentFrames = newFrames
      currentTlbEntries = newTLB
      currentSwapSpace = newSwapSpace
      currentPageTable = newPageTable
      currentPhysicalMemory = newPhysicalMemory
      history.push(pageEntry)

      if (pageEntry.status === "hit") {
        hitCount++
      } else {
        missCount++
        if (pageEntry.status === "fault") {
          faultCount++
        }
      }
    }

    setFrames(currentFrames)
    setTlbEntries(currentTlbEntries)
    setSwapSpace(currentSwapSpace)
    setPageTable(currentPageTable)
    setPhysicalMemory(currentPhysicalMemory)
    setPageHistory(history)
    setHits(hitCount)
    setMisses(missCount)
    setPageFaults(faultCount)
    setSwapIns(swapInCount)
    setSwapOuts(swapOutCount)
    setCurrentStep(prevStep)

    // Calculate fragmentation
    calculateFragmentation(currentFrames)
  }

  // Run comparison of all algorithms
  const runComparison = () => {
    if (referenceString.length === 0) {
      // Parse manual reference string if needed
      if (manualReference.trim()) {
        const parsed = manualReference
          .split(/[,\s]+/)
          .map((num) => Number.parseInt(num.trim()))
          .filter((num) => !isNaN(num))
        setReferenceString(parsed)
      } else {
        return
      }
    }

    const algorithms: PageReplacementAlgorithm[] = [
      "fifo",
      "lru",
      "opt",
      "clock",
      "nru",
      "random",
      "mlru",
      "lfu-lru",
      "fru",
    ]
    const results: AlgorithmResult[] = []

    // Run simulation for each algorithm
    algorithms.forEach((alg) => {
      let currentFrames = Array.from({ length: frameCount }, (_, i) => ({
        frameNumber: i,
        pageNumber: null,
        lastAccessed: 0,
        referenced: false,
        modified: false,
        data: "",
        frequency: 0,
        queueType: "cold",
        recentAccessMask: 0,
        score: 0,
      }))

      let hitCount = 0
      let missCount = 0
      let faultCount = 0
      let swapInCount = 0
      let swapOutCount = 0

      // Process each page reference
      referenceString.forEach((pageNumber, index) => {
        let pageFault = false
        let tlbHit = false
        let victimPage: number | null = null

        // Check if page is already in a frame
        const frameIndex = currentFrames.findIndex((frame) => frame.pageNumber === pageNumber)

        if (frameIndex !== -1) {
          // Page hit
          hitCount++

          // Update frame
          currentFrames[frameIndex].lastAccessed = Date.now()

          // Update algorithm-specific metrics
          if (alg === "clock" || alg === "nru") {
            currentFrames[frameIndex].referenced = true
          }

          if (alg === "lfu-lru" || alg === "fru") {
            currentFrames[frameIndex].frequency = (currentFrames[frameIndex].frequency || 0) + 1
          }

          if (alg === "fru") {
            // Update recent access mask (shift left and set lowest bit)
            currentFrames[frameIndex].recentAccessMask = ((currentFrames[frameIndex].recentAccessMask || 0) << 1) | 1
            // Keep only the last 8 bits
            currentFrames[frameIndex].recentAccessMask &= 0xff
          }

          if (alg === "mlru") {
            // Promote page based on current queue type
            if (currentFrames[frameIndex].queueType === "cold") {
              currentFrames[frameIndex].queueType = "warm"
            } else if (currentFrames[frameIndex].queueType === "warm") {
              currentFrames[frameIndex].queueType = "hot"
            }
          }
        } else {
          // Page miss/fault
          missCount++
          faultCount++

          // Process based on algorithm
          switch (alg) {
            case "fifo":
              ;[currentFrames, pageFault, tlbHit, victimPage] = fifoAlgorithm(pageNumber, currentFrames)
              break
            case "lru":
              ;[currentFrames, pageFault, tlbHit, victimPage] = lruAlgorithm(pageNumber, currentFrames)
              break
            case "opt":
              ;[currentFrames, pageFault, tlbHit, victimPage] = optAlgorithm(pageNumber, currentFrames, index)
              break
            case "clock":
              ;[currentFrames, pageFault, tlbHit, victimPage] = clockAlgorithm(pageNumber, currentFrames)
              break
            case "nru":
              ;[currentFrames, pageFault, tlbHit, victimPage] = nruAlgorithm(pageNumber, currentFrames)
              break
            case "random":
              ;[currentFrames, pageFault, tlbHit, victimPage] = randomAlgorithm(pageNumber, currentFrames)
              break
            case "mlru":
              ;[currentFrames, pageFault, tlbHit, victimPage] = mlruAlgorithm(pageNumber, currentFrames)
              break
            case "lfu-lru":
              ;[currentFrames, pageFault, tlbHit, victimPage] = lfuLruAlgorithm(pageNumber, currentFrames)
              break
            case "fru":
              ;[currentFrames, pageFault, tlbHit, victimPage] = fruAlgorithm(pageNumber, currentFrames)
              break
          }

          // Simulate swap operations
          if (swapEnabled && victimPage !== null) {
            swapOutCount++
            // Check if the requested page was in swap
            if (Math.random() < 0.5) {
              // 50% chance for demonstration
              swapInCount++
            }
          }
        }
      })

      // Calculate hit ratio
      const total = hitCount + missCount
      const hitRatio = total > 0 ? (hitCount / total) * 100 : 0

      // Calculate average access time
      const pageFaultRate = total > 0 ? faultCount / total : 0
      const avgAccessTime = accessTimeMetrics.memoryAccessTime + pageFaultRate * accessTimeMetrics.pageFaultTime

      // Add result
      results.push({
        algorithm: alg,
        hits: hitCount,
        misses: missCount,
        pageFaults: faultCount,
        hitRatio,
        swapIns: swapInCount,
        swapOuts: swapOutCount,
        avgAccessTime,
      })
    })

    setComparisonResults(results)
  }

  const value = {
    // Configuration
    frameCount,
    setFrameCount,
    algorithm,
    setAlgorithm,
    swapEnabled,
    setSwapEnabled,
    swapSize,
    setSwapSize,

    // Page reference sequence
    referenceString,
    setReferenceString,
    manualReference,
    setManualReference,
    generateRandomReferences,

    // Simulation state
    frames,
    pageHistory,
    currentStep,
    setCurrentStep,
    pageTable,
    swapSpace,
    accessTimeMetrics,
    physicalMemory,
    selectedFrame,
    setSelectedFrame,
    selectedTlbEntry,
    setSelectedTlbEntry,

    // Simulation controls
    runSimulation,
    stepForward,
    stepBackward,
    resetSimulation,
    accessPage,
    writeToPage,

    // Statistics
    hits,
    misses,
    pageFaults,
    hitRatio,
    swapIns,
    swapOuts,

    // Comparison
    comparisonResults,
    runComparison,

    // TLB
    tlbEnabled,
    setTlbEnabled,
    tlbSize,
    setTlbSize,
    tlbHits,
    tlbMisses,
    tlbHitRatio,
    tlbEntries,

    // Filtering
    filterSwappedPages,
    setFilterSwappedPages,
    filterReferencedPages,
    setFilterReferencedPages,
    filterModifiedPages,
    setFilterModifiedPages,
    searchPageNumber,
    setSearchPageNumber,

    // Memory fragmentation
    internalFragmentation,
    externalFragmentation,
    compactMemory,
    alphaWeight,
    setAlphaWeight,
    betaWeight,
    setBetaWeight,
    gammaWeight,
    setGammaWeight,
  }

  return <PageReplacementContext.Provider value={value}>{children}</PageReplacementContext.Provider>
}

export const usePageReplacement = () => {
  const context = useContext(PageReplacementContext)
  if (context === undefined) {
    throw new Error("usePageReplacement must be used within a PageReplacementProvider")
  }
  return context
}
