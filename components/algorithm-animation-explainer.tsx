"use client"

import { useState, useEffect, useRef } from "react"
import { usePageReplacement } from "./page-replacement-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, SkipBack, SkipForward, RefreshCw } from "lucide-react"

export default function AlgorithmAnimationExplainer() {
  const { algorithm, referenceString, frameCount, resetSimulation } = usePageReplacement()

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(1000)
  const [frames, setFrames] = useState<Array<{ pageNumber: number | null; isNew: boolean }>>([])
  const [explanation, setExplanation] = useState("")
  const [decision, setDecision] = useState("")
  const [highlightedPage, setHighlightedPage] = useState<number | null>(null)
  const [victimFrame, setVictimFrame] = useState<number | null>(null)
  const [animationHistory, setAnimationHistory] = useState<
    Array<{
      frames: Array<{ pageNumber: number | null; isNew: boolean }>
      explanation: string
      decision: string
      highlightedPage: number | null
      victimFrame: number | null
    }>
  >([])

  const animationRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize frames
  useEffect(() => {
    initializeAnimation()
  }, [frameCount, algorithm, referenceString])

  // Handle animation playback
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = setTimeout(() => {
        if (currentStep < referenceString.length - 1) {
          handleStepForward()
        } else {
          setIsPlaying(false)
        }
      }, animationSpeed)
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
    }
  }, [isPlaying, currentStep, animationSpeed, referenceString.length])

  const initializeAnimation = () => {
    // Reset state
    setCurrentStep(0)
    setIsPlaying(false)

    // Initialize empty frames
    const initialFrames = Array(frameCount)
      .fill(null)
      .map(() => ({
        pageNumber: null,
        isNew: false,
      }))

    setFrames(initialFrames)

    // Set initial explanation
    setExplanation(`Starting ${getAlgorithmName(algorithm)} simulation with ${frameCount} frames.`)
    setDecision("Let's begin by accessing the first page in the reference string.")
    setHighlightedPage(null)
    setVictimFrame(null)

    // Initialize animation history with the starting state
    setAnimationHistory([
      {
        frames: initialFrames,
        explanation: `Starting ${getAlgorithmName(algorithm)} simulation with ${frameCount} frames.`,
        decision: "Let's begin by accessing the first page in the reference string.",
        highlightedPage: null,
        victimFrame: null,
      },
    ])
  }

  const simulateStep = (step: number) => {
    if (step >= referenceString.length || step < 0) return

    const pageNumber = referenceString[step]
    const currentFrames = [...frames]
    let newExplanation = ""
    let newDecision = ""
    let newVictimFrame = null

    // Check if page is already in a frame (hit)
    const frameIndex = currentFrames.findIndex((frame) => frame.pageNumber === pageNumber)

    if (frameIndex !== -1) {
      // Page hit
      newExplanation = `Page ${pageNumber} is already in frame ${frameIndex}.`
      newDecision = "This is a page hit! No replacement needed."

      // Mark all frames as not new
      currentFrames.forEach((frame) => (frame.isNew = false))

      // Update algorithm-specific behavior on hit
      switch (algorithm) {
        case "lru":
          newExplanation += " With LRU, we update this page as most recently used."
          break
        case "clock":
          newExplanation += " With Clock, we set the referenced bit to 1."
          break
        case "mlru":
          newExplanation += " With MLRU, we promote this page to a higher queue level."
          break
        case "lfu-lru":
          newExplanation += " With LFU-LRU, we increment the frequency counter for this page."
          break
        case "fru":
          newExplanation += " With FRU, we update the frequency, recency, and usage pattern."
          break
      }
    } else {
      // Page fault - need to find a frame for this page
      newExplanation = `Page ${pageNumber} is not in memory. This is a page fault.`

      // Check for empty frame
      const emptyFrameIndex = currentFrames.findIndex((frame) => frame.pageNumber === null)

      if (emptyFrameIndex !== -1) {
        // Place in empty frame
        newExplanation += ` Found an empty frame at position ${emptyFrameIndex}.`
        newDecision = `Placing page ${pageNumber} in empty frame ${emptyFrameIndex}.`

        currentFrames[emptyFrameIndex] = { pageNumber, isNew: true }
      } else {
        // Need to replace a page based on the algorithm
        newExplanation += " All frames are occupied. Need to select a victim frame based on the algorithm."

        // Determine victim frame based on algorithm
        switch (algorithm) {
          case "fifo":
            // For FIFO, we'll just use the first frame as the victim for simplicity
            newVictimFrame = 0
            newDecision = `Using FIFO, we replace the oldest page (frame ${newVictimFrame}) with page ${pageNumber}.`
            break
          case "lru":
            // For LRU, we'll use a random frame as the victim for this simulation
            newVictimFrame = Math.floor(Math.random() * frameCount)
            newDecision = `Using LRU, we replace the least recently used page (frame ${newVictimFrame}) with page ${pageNumber}.`
            break
          case "opt":
            // For OPT, we'll use a random frame as the victim for this simulation
            newVictimFrame = Math.floor(Math.random() * frameCount)
            newDecision = `Using OPT, we replace the page that won't be used for the longest time (frame ${newVictimFrame}) with page ${pageNumber}.`
            break
          case "clock":
            // For Clock, we'll use a random frame as the victim for this simulation
            newVictimFrame = Math.floor(Math.random() * frameCount)
            newDecision = `Using Clock, we move the clock hand until finding a frame with reference bit = 0 (frame ${newVictimFrame}) and replace it with page ${pageNumber}.`
            break
          case "nru":
            // For NRU, we'll use a random frame as the victim for this simulation
            newVictimFrame = Math.floor(Math.random() * frameCount)
            newDecision = `Using NRU, we replace a page from the lowest priority class (frame ${newVictimFrame}) with page ${pageNumber}.`
            break
          case "random":
            // For Random, we'll use a random frame as the victim
            newVictimFrame = Math.floor(Math.random() * frameCount)
            newDecision = `Using Random, we randomly select frame ${newVictimFrame} to replace with page ${pageNumber}.`
            break
          case "mlru":
            // For MLRU, we'll use a random frame as the victim for this simulation
            newVictimFrame = Math.floor(Math.random() * frameCount)
            newDecision = `Using MLRU, we replace a page from the cold queue (frame ${newVictimFrame}) with page ${pageNumber}.`
            break
          case "lfu-lru":
            // For LFU-LRU, we'll use a random frame as the victim for this simulation
            newVictimFrame = Math.floor(Math.random() * frameCount)
            newDecision = `Using LFU-LRU, we replace the least frequently used page (frame ${newVictimFrame}) with page ${pageNumber}.`
            break
          case "fru":
            // For FRU, we'll use a random frame as the victim for this simulation
            newVictimFrame = Math.floor(Math.random() * frameCount)
            newDecision = `Using FRU, we replace the page with the lowest combined score (frame ${newVictimFrame}) with page ${pageNumber}.`
            break
        }

        // Mark all frames as not new
        currentFrames.forEach((frame) => (frame.isNew = false))

        // Replace the victim frame
        if (newVictimFrame !== null) {
          currentFrames[newVictimFrame] = { pageNumber, isNew: true }
        }
      }
    }

    // Update state
    setFrames(currentFrames)
    setExplanation(newExplanation)
    setDecision(newDecision)
    setHighlightedPage(pageNumber)
    setVictimFrame(newVictimFrame)

    // Add to animation history
    const newHistoryEntry = {
      frames: [...currentFrames],
      explanation: newExplanation,
      decision: newDecision,
      highlightedPage: pageNumber,
      victimFrame: newVictimFrame,
    }

    // Update animation history
    const newHistory = [...animationHistory]
    newHistory[step + 1] = newHistoryEntry
    setAnimationHistory(newHistory)
  }

  const handleStepForward = () => {
    if (currentStep >= referenceString.length - 1) return

    const nextStep = currentStep + 1

    // Check if we already have this step in history
    if (animationHistory[nextStep]) {
      // Restore from history
      const historyEntry = animationHistory[nextStep]
      setFrames(historyEntry.frames)
      setExplanation(historyEntry.explanation)
      setDecision(historyEntry.decision)
      setHighlightedPage(historyEntry.highlightedPage)
      setVictimFrame(historyEntry.victimFrame)
    } else {
      // Simulate this step
      simulateStep(nextStep)
    }

    setCurrentStep(nextStep)
  }

  const handleStepBackward = () => {
    if (currentStep <= 0) return

    const prevStep = currentStep - 1

    // Restore from history
    if (animationHistory[prevStep]) {
      const historyEntry = animationHistory[prevStep]
      setFrames(historyEntry.frames)
      setExplanation(historyEntry.explanation)
      setDecision(historyEntry.decision)
      setHighlightedPage(historyEntry.highlightedPage)
      setVictimFrame(historyEntry.victimFrame)
    }

    setCurrentStep(prevStep)
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    initializeAnimation()
  }

  const getAlgorithmName = (alg: string) => {
    switch (alg) {
      case "fifo":
        return "First-In-First-Out (FIFO)"
      case "lru":
        return "Least Recently Used (LRU)"
      case "opt":
        return "Optimal (OPT)"
      case "clock":
        return "Clock"
      case "nru":
        return "Not Recently Used (NRU)"
      case "random":
        return "Random"
      case "mlru":
        return "Multi-level LRU (MLRU)"
      case "lfu-lru":
        return "LFU-LRU Hybrid"
      case "fru":
        return "Frequency + Recency + Usage (FRU)"
      default:
        return alg.toUpperCase()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Algorithm Animation: {getAlgorithmName(algorithm)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Reference String with Current Position */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Reference String</h3>
              <div className="flex flex-wrap gap-1">
                {referenceString.map((page, index) => (
                  <motion.div
                    key={index}
                    className={`px-2 py-1 rounded-md text-xs font-medium ${
                      index === currentStep
                        ? "bg-primary text-primary-foreground"
                        : index < currentStep
                          ? "bg-muted text-muted-foreground"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    }`}
                    animate={
                      index === currentStep
                        ? {
                            scale: [1, 1.2, 1],
                            transition: {
                              duration: 0.5,
                              repeat: isPlaying ? Number.POSITIVE_INFINITY : 0,
                              repeatDelay: 1,
                            },
                          }
                        : {}
                    }
                  >
                    {page}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Memory Frames Animation */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Memory Frames</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {frames.map((frame, index) => (
                  <motion.div
                    key={index}
                    className={`p-4 rounded-md border relative overflow-hidden ${
                      frame.pageNumber !== null
                        ? "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700"
                        : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                    } ${victimFrame === index ? "ring-2 ring-red-500" : ""}`}
                    animate={
                      frame.isNew
                        ? {
                            scale: [1, 1.05, 1],
                            transition: { duration: 0.5 },
                          }
                        : {}
                    }
                  >
                    {/* Overlay animation for victim frame */}
                    <AnimatePresence>
                      {victimFrame === index && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.3 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-0 bg-red-500"
                        />
                      )}
                    </AnimatePresence>

                    <div className="relative z-10">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Frame {index}</div>
                      <div className="text-lg font-bold">
                        {frame.pageNumber !== null ? `Page ${frame.pageNumber}` : "Empty"}
                      </div>
                      {frame.pageNumber === highlightedPage && <Badge className="mt-1 bg-blue-500">Current</Badge>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div className="space-y-2 bg-muted p-4 rounded-md">
              <h3 className="text-sm font-medium">Explanation</h3>
              <p>{explanation}</p>
              <p className="font-medium mt-2">{decision}</p>
            </div>

            {/* Animation Controls */}
            <div className="space-y-4">
              <div className="flex justify-center space-x-2">
                <Button variant="outline" size="icon" onClick={handleReset}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleStepBackward}>
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button onClick={handlePlayPause}>
                  {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button variant="outline" size="icon" onClick={handleStepForward}>
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Animation Speed: {animationSpeed}ms</span>
                </div>
                <Slider
                  min={500}
                  max={3000}
                  step={100}
                  value={[animationSpeed]}
                  onValueChange={(value) => setAnimationSpeed(value[0])}
                />
                <p className="text-xs text-muted-foreground">Lower values = faster animations</p>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">
                  Progress: {currentStep} / {referenceString.length - 1}
                </span>
                <span className="text-sm">{Math.round((currentStep / (referenceString.length - 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${(currentStep / (referenceString.length - 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
