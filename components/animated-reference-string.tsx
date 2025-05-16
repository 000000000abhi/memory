"use client"

import { usePageReplacement } from "./page-replacement-context"
import { motion } from "framer-motion"

interface AnimatedReferenceStringProps {
  animationSpeed?: number
  showAnimations: boolean
}

export default function AnimatedReferenceString({
  animationSpeed = 500,
  showAnimations = true,
}: AnimatedReferenceStringProps) {
  const { referenceString, pageHistory, currentStep } = usePageReplacement()

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Reference String</h3>
      <div className="flex flex-wrap gap-1">
        {referenceString.map((page, index) => {
          const isCurrentStep = index === currentStep
          const isPastStep = index < currentStep
          const status = isPastStep && pageHistory[index] ? pageHistory[index].status : null

          return (
            <motion.div
              key={index}
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                isCurrentStep
                  ? "bg-primary text-primary-foreground"
                  : isPastStep
                    ? status === "hit"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              }`}
              animate={
                showAnimations && isCurrentStep
                  ? {
                      scale: [1, 1.2, 1],
                      transition: { duration: animationSpeed / 1000 },
                    }
                  : {}
              }
            >
              {page}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
