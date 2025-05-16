"use client"

import { useState, useEffect } from "react"
import { usePageReplacement } from "./page-replacement-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"

interface EvictionEvent {
  step: number
  timestamp: number
  pageNumber: number
  frameNumber: number
  algorithm: string
  reason: string
}

export default function EvictionLog() {
  const { pageHistory, algorithm, frames, currentStep } = usePageReplacement()
  const [evictions, setEvictions] = useState<EvictionEvent[]>([])

  // Generate eviction log based on page history
  useEffect(() => {
    if (pageHistory.length === 0) return

    const newEvictions: EvictionEvent[] = []
    const frameState: Record<number, number | null> = {}

    // Initialize frame state
    frames.forEach((frame) => {
      frameState[frame.frameNumber] = null
    })

    // Process page history to detect evictions
    pageHistory.forEach((entry, index) => {
      if (entry.frameNumber !== null) {
        const previousPage = frameState[entry.frameNumber]

        // If the frame was occupied by a different page, it's an eviction
        if (previousPage !== null && previousPage !== entry.pageNumber) {
          let reason = "Unknown"

          // Determine reason based on algorithm
          switch (algorithm) {
            case "fifo":
              reason = "First-in page selected for replacement"
              break
            case "lru":
              reason = "Least recently used page selected for replacement"
              break
            case "opt":
              reason = "Page not needed for longest future period"
              break
            case "clock":
              reason = "Clock hand found unreferenced page"
              break
            case "nru":
              reason = "Not recently used page selected"
              break
            case "random":
              reason = "Randomly selected for replacement"
              break
            case "mlru":
              reason = "Selected from cold/warm queue based on MLRU policy"
              break
            case "lfu-lru":
              reason = "Least frequently used page selected"
              break
            case "fru":
              reason = "Lowest combined frequency/recency/usage score"
              break
          }

          newEvictions.push({
            step: index,
            timestamp: Date.now(),
            pageNumber: previousPage,
            frameNumber: entry.frameNumber,
            algorithm: algorithm.toUpperCase(),
            reason,
          })
        }

        // Update frame state
        frameState[entry.frameNumber] = entry.pageNumber
      }
    })

    setEvictions(newEvictions)
  }, [pageHistory, algorithm, frames])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eviction Log</CardTitle>
        <CardDescription>Record of pages evicted from memory frames</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-60">
          {evictions.length > 0 ? (
            <div className="space-y-2">
              <AnimatePresence>
                {evictions.map((event, index) => (
                  <motion.div
                    key={index}
                    className={`p-3 border rounded-md ${
                      event.step <= currentStep ? "bg-gray-50 dark:bg-gray-800" : "opacity-50"
                    }`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          Page {event.pageNumber} evicted from Frame {event.frameNumber}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{event.reason}</div>
                      </div>
                      <Badge variant="outline">{event.algorithm}</Badge>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">Step {event.step + 1}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">No evictions recorded yet</div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
