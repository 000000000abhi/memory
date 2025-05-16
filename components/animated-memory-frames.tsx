"use client"

import { useState, useEffect } from "react"
import { usePageReplacement } from "./page-replacement-context"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"

interface AnimatedMemoryFramesProps {
  animationSpeed?: number // in milliseconds
  showAnimations: boolean
}

export default function AnimatedMemoryFrames({
  animationSpeed = 500,
  showAnimations = true,
}: AnimatedMemoryFramesProps) {
  const { frames, pageHistory, currentStep } = usePageReplacement()
  const [activeFrame, setActiveFrame] = useState<number | null>(null)
  const [animationType, setAnimationType] = useState<"hit" | "miss" | "fault" | null>(null)
  const [lastPageAccessed, setLastPageAccessed] = useState<number | null>(null)

  // Effect to trigger animations when currentStep changes
  useEffect(() => {
    if (currentStep >= 0 && pageHistory[currentStep]) {
      const currentAccess = pageHistory[currentStep]
      setLastPageAccessed(currentAccess.pageNumber)

      if (currentAccess.frameNumber !== null) {
        setActiveFrame(currentAccess.frameNumber)
        setAnimationType(currentAccess.status)

        // Reset animation after delay
        if (showAnimations) {
          const timer = setTimeout(() => {
            setActiveFrame(null)
            setAnimationType(null)
          }, animationSpeed * 1.5)

          return () => clearTimeout(timer)
        }
      }
    }
  }, [currentStep, pageHistory, animationSpeed, showAnimations])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Memory Frames</h3>
        {animationType && lastPageAccessed !== null && (
          <div className="flex items-center space-x-2">
            <span className="text-sm">Page {lastPageAccessed}:</span>
            <Badge
              className={
                animationType === "hit"
                  ? "bg-green-500 text-white"
                  : animationType === "miss"
                    ? "bg-yellow-500 text-white"
                    : "bg-red-500 text-white"
              }
            >
              {animationType.toUpperCase()}
            </Badge>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {frames.map((frame) => (
          <motion.div
            key={frame.frameNumber}
            className={`p-4 rounded-md border relative overflow-hidden ${
              frame.pageNumber !== null
                ? "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700"
                : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            } ${activeFrame === frame.frameNumber ? "ring-2 ring-offset-2" : ""}`}
            animate={{
              scale: activeFrame === frame.frameNumber ? [1, 1.05, 1] : 1,
              transition: { duration: animationSpeed / 1000 },
            }}
          >
            {/* Overlay animation for hits/misses/faults */}
            <AnimatePresence>
              {showAnimations && activeFrame === frame.frameNumber && animationType && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: animationSpeed / 1000 }}
                  className={`absolute inset-0 ${
                    animationType === "hit" ? "bg-green-500" : animationType === "miss" ? "bg-yellow-500" : "bg-red-500"
                  }`}
                />
              )}
            </AnimatePresence>

            <div className="relative z-10">
              <div className="text-xs text-gray-500 dark:text-gray-400">Frame {frame.frameNumber}</div>
              <div className="text-lg font-bold">
                {frame.pageNumber !== null ? `Page ${frame.pageNumber}` : "Empty"}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {frame.referenced && (
                  <div className="text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100">
                    Referenced
                  </div>
                )}
                {frame.modified && (
                  <div className="text-xs px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-100">
                    Modified
                  </div>
                )}
                {frame.queueType && (
                  <div
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      frame.queueType === "hot"
                        ? "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100"
                        : frame.queueType === "warm"
                          ? "bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100"
                          : "bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100"
                    }`}
                  >
                    {frame.queueType.charAt(0).toUpperCase() + frame.queueType.slice(1)}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
