"use client"

import { useState, useEffect } from "react"
import { usePageReplacement } from "./page-replacement-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

type HeatmapType = "page-to-frame" | "page-sequence" | "frame-usage"

export default function MemoryAccessHeatmap() {
  const { pageHistory, frames, frameCount } = usePageReplacement()
  const [heatmapType, setHeatmapType] = useState<HeatmapType>("page-to-frame")
  const [heatmapData, setHeatmapData] = useState<number[][]>([])
  const [maxValue, setMaxValue] = useState(1)

  // Generate heatmap data based on selected type
  useEffect(() => {
    if (pageHistory.length === 0) return

    if (heatmapType === "page-to-frame") {
      // Create a mapping of page numbers to frames
      const maxPage = Math.max(...pageHistory.map((entry) => entry.pageNumber)) + 1
      const data: number[][] = Array(maxPage)
        .fill(0)
        .map(() => Array(frameCount).fill(0))

      pageHistory.forEach((entry) => {
        if (entry.frameNumber !== null) {
          data[entry.pageNumber][entry.frameNumber]++
        }
      })

      const max = Math.max(...data.flat())
      setHeatmapData(data)
      setMaxValue(max || 1)
    } else if (heatmapType === "page-sequence") {
      // Create a mapping of page transitions (which page follows which)
      const maxPage = Math.max(...pageHistory.map((entry) => entry.pageNumber)) + 1
      const data: number[][] = Array(maxPage)
        .fill(0)
        .map(() => Array(maxPage).fill(0))

      for (let i = 0; i < pageHistory.length - 1; i++) {
        const currentPage = pageHistory[i].pageNumber
        const nextPage = pageHistory[i + 1].pageNumber
        data[currentPage][nextPage]++
      }

      const max = Math.max(...data.flat())
      setHeatmapData(data)
      setMaxValue(max || 1)
    } else if (heatmapType === "frame-usage") {
      // Create a heatmap of frame usage over time
      const timeSlices = Math.min(20, pageHistory.length) // Divide history into 20 time slices
      const sliceSize = Math.max(1, Math.ceil(pageHistory.length / timeSlices))
      const data: number[][] = Array(frameCount)
        .fill(0)
        .map(() => Array(timeSlices).fill(0))

      for (let i = 0; i < pageHistory.length; i++) {
        const timeSlice = Math.min(timeSlices - 1, Math.floor(i / sliceSize))
        const entry = pageHistory[i]
        if (entry.frameNumber !== null) {
          data[entry.frameNumber][timeSlice]++
        }
      }

      const max = Math.max(...data.flat())
      setHeatmapData(data)
      setMaxValue(max || 1)
    }
  }, [heatmapType, pageHistory, frameCount])

  // Get color based on value intensity
  const getColor = (value: number) => {
    const intensity = value / maxValue
    if (intensity === 0) return "bg-gray-100 dark:bg-gray-800"

    // Color scale from light to dark
    if (intensity < 0.2) return "bg-blue-100 dark:bg-blue-900"
    if (intensity < 0.4) return "bg-blue-200 dark:bg-blue-800"
    if (intensity < 0.6) return "bg-blue-300 dark:bg-blue-700"
    if (intensity < 0.8) return "bg-blue-400 dark:bg-blue-600"
    return "bg-blue-500 dark:bg-blue-500"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Memory Access Heatmap</CardTitle>
        <CardDescription>Visualize memory access patterns</CardDescription>
        <div className="mt-2">
          <Label htmlFor="heatmap-type">Heatmap Type</Label>
          <Select value={heatmapType} onValueChange={(value) => setHeatmapType(value as HeatmapType)}>
            <SelectTrigger id="heatmap-type">
              <SelectValue placeholder="Select heatmap type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="page-to-frame">Page to Frame Mapping</SelectItem>
              <SelectItem value="page-sequence">Page Sequence Transitions</SelectItem>
              <SelectItem value="frame-usage">Frame Usage Over Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {heatmapData.length > 0 ? (
          <div className="overflow-auto">
            <div className="inline-block min-w-full">
              <div className="grid grid-flow-col auto-cols-min gap-px">
                {/* Header row for column labels */}
                <div className="w-16"></div> {/* Empty corner cell */}
                {heatmapType === "page-to-frame" &&
                  Array(frameCount)
                    .fill(0)
                    .map((_, i) => (
                      <div key={`col-${i}`} className="w-10 h-8 flex items-center justify-center text-xs font-medium">
                        F{i}
                      </div>
                    ))}
                {heatmapType === "page-sequence" &&
                  heatmapData[0].map((_, i) => (
                    <div key={`col-${i}`} className="w-10 h-8 flex items-center justify-center text-xs font-medium">
                      P{i}
                    </div>
                  ))}
                {heatmapType === "frame-usage" &&
                  heatmapData[0].map((_, i) => (
                    <div key={`col-${i}`} className="w-10 h-8 flex items-center justify-center text-xs font-medium">
                      T{i}
                    </div>
                  ))}
              </div>

              {/* Heatmap cells */}
              {heatmapData.map((row, rowIndex) => (
                <div key={`row-${rowIndex}`} className="grid grid-flow-col auto-cols-min gap-px">
                  {/* Row label */}
                  <div className="w-16 h-10 flex items-center justify-end pr-2 text-xs font-medium">
                    {heatmapType === "frame-usage" ? `Frame ${rowIndex}` : `Page ${rowIndex}`}
                  </div>

                  {/* Heatmap cells for this row */}
                  {row.map((value, colIndex) => (
                    <div
                      key={`cell-${rowIndex}-${colIndex}`}
                      className={`w-10 h-10 flex items-center justify-center text-xs ${getColor(value)}`}
                      title={`${value} access${value !== 1 ? "es" : ""}`}
                    >
                      {value > 0 ? value : ""}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-gray-500">
            Run a simulation to generate heatmap data
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <div>Low</div>
          <div className="flex space-x-1">
            <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900"></div>
            <div className="w-4 h-4 bg-blue-200 dark:bg-blue-800"></div>
            <div className="w-4 h-4 bg-blue-300 dark:bg-blue-700"></div>
            <div className="w-4 h-4 bg-blue-400 dark:bg-blue-600"></div>
            <div className="w-4 h-4 bg-blue-500 dark:bg-blue-500"></div>
          </div>
          <div>High</div>
        </div>
      </CardContent>
    </Card>
  )
}
