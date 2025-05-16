"use client"

import { useState, useEffect } from "react"
import { usePageReplacement } from "./page-replacement-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AlgorithmVisualization() {
  const { frames, algorithm, pageHistory, currentStep } = usePageReplacement()
  const [activeTab, setActiveTab] = useState<string>(algorithm)

  useEffect(() => {
    if (algorithm === "mlru" || algorithm === "lfu-lru" || algorithm === "fru") {
      setActiveTab(algorithm)
    }
  }, [algorithm])

  // Get the current state of frames for visualization
  const currentFrames = frames.map((frame) => ({
    ...frame,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Algorithm Visualization</CardTitle>
        <CardDescription>Visual representation of how the selected algorithm works</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="mlru">MLRU</TabsTrigger>
            <TabsTrigger value="lfu-lru">LFU-LRU Hybrid</TabsTrigger>
            <TabsTrigger value="fru">FRU</TabsTrigger>
          </TabsList>

          <TabsContent value="mlru" className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <p>
                Multi-level LRU maintains three queues: Hot, Warm, and Cold. Pages are promoted on access and eviction
                starts from the Cold queue.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-red-600 dark:text-red-400">Hot Queue</h3>
                <div className="border rounded-md p-2 min-h-32">
                  {currentFrames
                    .filter((frame) => frame.queueType === "hot" && frame.pageNumber !== null)
                    .map((frame) => (
                      <div
                        key={frame.frameNumber}
                        className="mb-2 p-2 bg-red-100 dark:bg-red-900 rounded-md flex justify-between items-center"
                      >
                        <span>
                          Frame {frame.frameNumber} (Page {frame.pageNumber})
                        </span>
                        <Badge variant="outline">Hot</Badge>
                      </div>
                    ))}
                  {currentFrames.filter((frame) => frame.queueType === "hot" && frame.pageNumber !== null).length ===
                    0 && <div className="text-center text-gray-500 py-4">No pages in Hot queue</div>}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Warm Queue</h3>
                <div className="border rounded-md p-2 min-h-32">
                  {currentFrames
                    .filter((frame) => frame.queueType === "warm" && frame.pageNumber !== null)
                    .map((frame) => (
                      <div
                        key={frame.frameNumber}
                        className="mb-2 p-2 bg-yellow-100 dark:bg-yellow-900 rounded-md flex justify-between items-center"
                      >
                        <span>
                          Frame {frame.frameNumber} (Page {frame.pageNumber})
                        </span>
                        <Badge variant="outline">Warm</Badge>
                      </div>
                    ))}
                  {currentFrames.filter((frame) => frame.queueType === "warm" && frame.pageNumber !== null).length ===
                    0 && <div className="text-center text-gray-500 py-4">No pages in Warm queue</div>}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">Cold Queue</h3>
                <div className="border rounded-md p-2 min-h-32">
                  {currentFrames
                    .filter((frame) => frame.queueType === "cold" && frame.pageNumber !== null)
                    .map((frame) => (
                      <div
                        key={frame.frameNumber}
                        className="mb-2 p-2 bg-blue-100 dark:bg-blue-900 rounded-md flex justify-between items-center"
                      >
                        <span>
                          Frame {frame.frameNumber} (Page {frame.pageNumber})
                        </span>
                        <Badge variant="outline">Cold</Badge>
                      </div>
                    ))}
                  {currentFrames.filter((frame) => frame.queueType === "cold" && frame.pageNumber !== null).length ===
                    0 && <div className="text-center text-gray-500 py-4">No pages in Cold queue</div>}
                </div>
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mt-4">
              <h3 className="text-sm font-medium mb-2">How MLRU Works</h3>
              <ol className="list-decimal pl-5 text-sm space-y-1">
                <li>New pages are initially placed in the Cold queue</li>
                <li>When a page is accessed, it's promoted: Cold → Warm → Hot</li>
                <li>When a page fault occurs, the victim is selected from the Cold queue first</li>
                <li>If the Cold queue is empty, the victim is selected from the Warm queue</li>
                <li>Only if both Cold and Warm queues are empty, a page from the Hot queue is selected</li>
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="lfu-lru" className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <p>
                LFU-LRU Hybrid combines frequency and recency. Pages are sorted by access frequency, with LRU as a
                tiebreaker.
              </p>
            </div>

            <div className="border rounded-md">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="p-2 text-left">Frame</th>
                    <th className="p-2 text-left">Page</th>
                    <th className="p-2 text-left">Frequency</th>
                    <th className="p-2 text-left">Last Accessed</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentFrames
                    .filter((frame) => frame.pageNumber !== null)
                    .sort((a, b) => {
                      // Sort by frequency (ascending)
                      if (a.frequency !== b.frequency) {
                        return a.frequency - b.frequency
                      }
                      // If frequencies are equal, sort by last accessed (ascending)
                      return a.lastAccessed - b.lastAccessed
                    })
                    .map((frame) => (
                      <tr key={frame.frameNumber} className="border-t">
                        <td className="p-2">{frame.frameNumber}</td>
                        <td className="p-2">{frame.pageNumber}</td>
                        <td className="p-2">{frame.frequency}</td>
                        <td className="p-2">
                          {frame.lastAccessed > 0 ? new Date(frame.lastAccessed).toLocaleTimeString() : "Never"}
                        </td>
                        <td className="p-2">
                          {frame.frequency ===
                            Math.min(...currentFrames.map((f) => f.frequency || Number.POSITIVE_INFINITY)) && (
                            <Badge className="bg-red-500">Potential Victim</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mt-4">
              <h3 className="text-sm font-medium mb-2">How LFU-LRU Hybrid Works</h3>
              <ol className="list-decimal pl-5 text-sm space-y-1">
                <li>Each page tracks its access frequency and last access timestamp</li>
                <li>When a page is accessed, its frequency is incremented</li>
                <li>When a page fault occurs, the page with the lowest frequency is selected as the victim</li>
                <li>If multiple pages have the same frequency, the least recently used page is selected</li>
                <li>This combines the benefits of both LFU and LRU algorithms</li>
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="fru" className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <p>
                FRU uses a scoring system based on frequency, recency, and usage patterns. The algorithm calculates a
                score for each page using tunable weights.
              </p>
            </div>

            <div className="border rounded-md">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="p-2 text-left">Frame</th>
                    <th className="p-2 text-left">Page</th>
                    <th className="p-2 text-left">Frequency</th>
                    <th className="p-2 text-left">Recency</th>
                    <th className="p-2 text-left">Usage Pattern</th>
                    <th className="p-2 text-left">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {currentFrames
                    .filter((frame) => frame.pageNumber !== null)
                    .sort((a, b) => (a.score || 0) - (b.score || 0))
                    .map((frame) => (
                      <tr key={frame.frameNumber} className="border-t">
                        <td className="p-2">{frame.frameNumber}</td>
                        <td className="p-2">{frame.pageNumber}</td>
                        <td className="p-2">{frame.frequency}</td>
                        <td className="p-2">
                          {frame.lastAccessed > 0
                            ? `${((Date.now() - frame.lastAccessed) / 1000).toFixed(1)}s ago`
                            : "Never"}
                        </td>
                        <td className="p-2 font-mono">{frame.recentAccessMask.toString(2).padStart(8, "0")}</td>
                        <td className="p-2">{frame.score !== undefined ? (-frame.score).toFixed(2) : "N/A"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mt-4">
              <h3 className="text-sm font-medium mb-2">How FRU Works</h3>
              <ol className="list-decimal pl-5 text-sm space-y-1">
                <li>Each page tracks frequency, recency, and a bitmask of recent accesses</li>
                <li>
                  The algorithm calculates a score using the formula: Score = α * frequency + β * recency + γ * recent
                  accesses
                </li>
                <li>When a page is accessed, its frequency increases and the access bitmask is updated</li>
                <li>When a page fault occurs, the page with the lowest score is selected as the victim</li>
                <li>
                  The weights (α, β, γ) can be tuned to optimize for different workloads (frequency-heavy,
                  recency-heavy, or bursty)
                </li>
              </ol>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
