"use client"

import { usePageReplacement } from "./page-replacement-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function MemoryFrameDetail() {
  const { frames, selectedFrame, setSelectedFrame, writeToPage, physicalMemory } = usePageReplacement()

  const [newData, setNewData] = useState("")

  if (selectedFrame === null) {
    return null
  }

  const frame = frames[selectedFrame]
  const physicalBlock = physicalMemory[selectedFrame]

  const handleWriteData = () => {
    if (frame.pageNumber !== null && newData) {
      writeToPage(frame.pageNumber, newData)
      setNewData("")
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Memory Frame {selectedFrame} Details</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setSelectedFrame(null)}>
            Close
          </Button>
        </div>
        <CardDescription>
          Physical Address: 0x{(physicalBlock?.address || 0).toString(16).padStart(8, "0")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Frame Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Frame Number:</span>
                  <span className="text-sm font-medium">{frame.frameNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Page Number:</span>
                  <span className="text-sm font-medium">{frame.pageNumber !== null ? frame.pageNumber : "Empty"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Last Accessed:</span>
                  <span className="text-sm font-medium">
                    {frame.lastAccessed > 0 ? new Date(frame.lastAccessed).toLocaleTimeString() : "Never"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Status:</span>
                  <div>
                    {frame.referenced && <Badge className="mr-1 bg-blue-500">Referenced</Badge>}
                    {frame.modified && <Badge className="bg-purple-500">Modified</Badge>}
                    {!frame.referenced && !frame.modified && <Badge className="bg-gray-500">None</Badge>}
                  </div>
                </div>
                {frame.frequency > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Access Frequency:</span>
                    <span className="text-sm font-medium">{frame.frequency}</span>
                  </div>
                )}
                {frame.queueType && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Queue Type:</span>
                    <span className="text-sm font-medium">
                      <Badge
                        className={
                          frame.queueType === "hot"
                            ? "bg-red-500"
                            : frame.queueType === "warm"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                        }
                      >
                        {frame.queueType.charAt(0).toUpperCase() + frame.queueType.slice(1)}
                      </Badge>
                    </span>
                  </div>
                )}
                {frame.recentAccessMask > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Recent Access Pattern:</span>
                    <span className="text-sm font-mono">{frame.recentAccessMask.toString(2).padStart(8, "0")}</span>
                  </div>
                )}
                {frame.score !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">FRU Score:</span>
                    <span className="text-sm font-medium">{(-frame.score).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-1">Physical Memory</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Address:</span>
                  <span className="text-sm font-medium">
                    0x{(physicalBlock?.address || 0).toString(16).padStart(8, "0")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Size:</span>
                  <span className="text-sm font-medium">{physicalBlock?.size || 0} bytes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Allocated:</span>
                  <span className="text-sm font-medium">{physicalBlock?.allocated ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Process ID:</span>
                  <span className="text-sm font-medium">{physicalBlock?.processId || "None"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-2">Memory Contents</h3>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-auto max-h-32">
              <pre className="text-xs">{frame.data || "Empty frame"}</pre>
            </div>
          </div>

          {frame.pageNumber !== null && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Write to Memory</h3>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="newData" className="sr-only">
                    New Data
                  </Label>
                  <Input
                    id="newData"
                    placeholder="Enter new data to write to this page"
                    value={newData}
                    onChange={(e) => setNewData(e.target.value)}
                  />
                </div>
                <Button onClick={handleWriteData} disabled={!newData}>
                  Write
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
