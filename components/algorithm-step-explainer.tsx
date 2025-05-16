"use client"

import { useState, useEffect } from "react"
import { usePageReplacement } from "./page-replacement-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AlgorithmStepExplainer() {
  const { algorithm, referenceString, frameCount, currentStep, pageHistory } = usePageReplacement()
  const [stepExplanations, setStepExplanations] = useState<
    Array<{
      step: number
      page: number
      action: string
      explanation: string
      details: string
    }>
  >([])

  // Generate explanations when reference string or algorithm changes
  useEffect(() => {
    if (referenceString.length === 0) return

    const explanations = referenceString.map((page, index) => {
      let action = "Unknown"
      let explanation = ""
      let details = ""

      // If we have page history, use it to determine the action
      if (pageHistory[index]) {
        action = pageHistory[index].status === "hit" ? "Hit" : "Fault"
      }

      // Generate algorithm-specific explanations
      switch (algorithm) {
        case "fifo":
          if (action === "Hit") {
            explanation = `Page ${page} is already in memory.`
            details = "No replacement needed."
          } else {
            explanation = `Page ${page} is not in memory.`
            details = index < frameCount ? `Placed in empty frame ${index}.` : `Replaced oldest page in memory (FIFO).`
          }
          break

        case "lru":
          if (action === "Hit") {
            explanation = `Page ${page} is already in memory.`
            details = "Updated as most recently used."
          } else {
            explanation = `Page ${page} is not in memory.`
            details = index < frameCount ? `Placed in empty frame ${index}.` : `Replaced least recently used page.`
          }
          break

        case "opt":
          if (action === "Hit") {
            explanation = `Page ${page} is already in memory.`
            details = "No replacement needed."
          } else {
            explanation = `Page ${page} is not in memory.`
            details =
              index < frameCount
                ? `Placed in empty frame ${index}.`
                : `Replaced page that won't be used for the longest time.`
          }
          break

        case "clock":
          if (action === "Hit") {
            explanation = `Page ${page} is already in memory.`
            details = "Set reference bit to 1."
          } else {
            explanation = `Page ${page} is not in memory.`
            details =
              index < frameCount
                ? `Placed in empty frame ${index}.`
                : `Moved clock hand until finding a frame with reference bit = 0.`
          }
          break

        case "nru":
          if (action === "Hit") {
            explanation = `Page ${page} is already in memory.`
            details = "Set reference bit to 1."
          } else {
            explanation = `Page ${page} is not in memory.`
            details =
              index < frameCount ? `Placed in empty frame ${index}.` : `Replaced page from lowest priority class.`
          }
          break

        case "random":
          if (action === "Hit") {
            explanation = `Page ${page} is already in memory.`
            details = "No replacement needed."
          } else {
            explanation = `Page ${page} is not in memory.`
            details =
              index < frameCount ? `Placed in empty frame ${index}.` : `Randomly selected a frame for replacement.`
          }
          break

        case "mlru":
          if (action === "Hit") {
            explanation = `Page ${page} is already in memory.`
            details = "Promoted to a higher queue level."
          } else {
            explanation = `Page ${page} is not in memory.`
            details =
              index < frameCount ? `Placed in empty frame ${index} in cold queue.` : `Replaced page from cold queue.`
          }
          break

        case "lfu-lru":
          if (action === "Hit") {
            explanation = `Page ${page} is already in memory.`
            details = "Incremented frequency counter."
          } else {
            explanation = `Page ${page} is not in memory.`
            details = index < frameCount ? `Placed in empty frame ${index}.` : `Replaced least frequently used page.`
          }
          break

        case "fru":
          if (action === "Hit") {
            explanation = `Page ${page} is already in memory.`
            details = "Updated frequency, recency, and usage pattern."
          } else {
            explanation = `Page ${page} is not in memory.`
            details =
              index < frameCount ? `Placed in empty frame ${index}.` : `Replaced page with lowest combined score.`
          }
          break

        default:
          explanation = `Processing page ${page}.`
          details = "No specific details available."
      }

      return {
        step: index + 1,
        page,
        action,
        explanation,
        details,
      }
    })

    setStepExplanations(explanations)
  }, [algorithm, referenceString, frameCount, pageHistory])

  if (referenceString.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Algorithm Step-by-Step Explanation</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No reference string available. Please generate or enter a reference string.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Algorithm Step-by-Step Explanation</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Step</TableHead>
              <TableHead>Page</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Explanation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stepExplanations.map((step) => (
              <TableRow key={step.step} className={currentStep === step.step - 1 ? "bg-muted" : ""}>
                <TableCell>{step.step}</TableCell>
                <TableCell>{step.page}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      step.action === "Hit"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {step.action}
                  </span>
                </TableCell>
                <TableCell>
                  <div>
                    <p>{step.explanation}</p>
                    <p className="text-xs text-muted-foreground mt-1">{step.details}</p>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
