"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePageReplacement } from "./page-replacement-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function MemoryFragmentationManagement() {
  const {
    frames,
    internalFragmentation,
    externalFragmentation,
    frameCount,
    setFrameCount,
    resetSimulation,
    runSimulation,
    compactMemory,
    physicalMemory,
    // Remove these two lines that reference non-existent functions
    // allocateMemory,
    // deallocateMemory,
  } = usePageReplacement()

  const [pageSize, setPageSize] = useState(4) // KB
  const [memorySize, setMemorySize] = useState(frameCount * pageSize) // KB
  const [processSize, setProcessSize] = useState(1) // KB
  const [allocatedProcesses, setAllocatedProcesses] = useState<{ id: number; size: number; frames: number[] }[]>([])
  const [nextProcessId, setNextProcessId] = useState(1)
  const [memoryMap, setMemoryMap] = useState<{ frameNumber: number; allocated: boolean; processId: number | null }[]>(
    [],
  )

  // Calculate memory utilization
  const allocatedFrames = frames.filter((frame) => frame.pageNumber !== null).length
  const freeFrames = frameCount - allocatedFrames
  const memoryUtilization = (allocatedFrames / frameCount) * 100

  // Prepare data for memory allocation chart
  const memoryData = [
    { name: "Allocated", value: allocatedFrames, color: "#22c55e" },
    { name: "Free", value: freeFrames, color: "#ef4444" },
  ]

  // Prepare data for fragmentation chart
  const fragmentationData = [
    { name: "Internal", value: internalFragmentation, color: "#f59e0b" },
    { name: "External", value: externalFragmentation, color: "#3b82f6" },
  ]

  // Initialize memory map
  useEffect(() => {
    const map = Array.from({ length: frameCount }, (_, i) => ({
      frameNumber: i,
      allocated: frames[i]?.pageNumber !== null,
      processId: null,
    }))
    setMemoryMap(map)
  }, [frameCount, frames])

  // Handle frame count change
  const handleFrameCountChange = (value: number[]) => {
    const newFrameCount = value[0]
    setFrameCount(newFrameCount)
    setMemorySize(newFrameCount * pageSize)
  }

  // Handle page size change
  const handlePageSizeChange = (value: number[]) => {
    const newPageSize = value[0]
    setPageSize(newPageSize)
    setMemorySize(frameCount * newPageSize)
  }

  // Handle process size change
  const handleProcessSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = Number.parseInt(e.target.value) || 1
    setProcessSize(Math.max(1, Math.min(size, frameCount * pageSize)))
  }

  // Handle memory compaction
  const handleCompaction = () => {
    // Simulate memory compaction
    const newMap = [...memoryMap]
    const allocatedFrames = newMap.filter((frame) => frame.allocated)
    const freeFrames = newMap.filter((frame) => !frame.allocated)

    // Sort allocated frames by process ID
    allocatedFrames.sort((a, b) => {
      if (a.processId === null) return 1
      if (b.processId === null) return -1
      return a.processId - b.processId
    })

    // Combine sorted allocated frames with free frames
    const compactedMap = [...allocatedFrames, ...freeFrames].map((frame, index) => ({
      ...frame,
      frameNumber: index,
    }))

    setMemoryMap(compactedMap)
    compactMemory()
  }

  // Allocate memory for a new process
  const handleAllocateMemory = () => {
    // Calculate how many frames are needed
    const framesNeeded = Math.ceil(processSize / pageSize)

    // Check if we have enough free frames
    if (framesNeeded > freeFrames) {
      alert(`Not enough free memory. Need ${framesNeeded} frames but only ${freeFrames} available.`)
      return
    }

    // Find free frames
    const freeFrameIndices = memoryMap
      .filter((frame) => !frame.allocated)
      .map((frame) => frame.frameNumber)
      .slice(0, framesNeeded)

    // Allocate memory
    const newMap = [...memoryMap]
    freeFrameIndices.forEach((frameIndex) => {
      newMap[frameIndex].allocated = true
      newMap[frameIndex].processId = nextProcessId
    })

    // Add to allocated processes
    setAllocatedProcesses([
      ...allocatedProcesses,
      {
        id: nextProcessId,
        size: processSize,
        frames: freeFrameIndices,
      },
    ])

    setNextProcessId(nextProcessId + 1)
    setMemoryMap(newMap)

    // Instead of calling the non-existent allocateMemory function,
    // we'll simulate the allocation by updating the UI state only
    // This is a UI-only simulation, so we don't need to update the actual page replacement system
  }

  // Deallocate memory for a process
  const handleDeallocateMemory = (processId: number) => {
    const process = allocatedProcesses.find((p) => p.id === processId)
    if (!process) return

    // Free frames
    const newMap = [...memoryMap]
    process.frames.forEach((frameIndex) => {
      newMap[frameIndex].allocated = false
      newMap[frameIndex].processId = null
    })

    // Remove from allocated processes
    setAllocatedProcesses(allocatedProcesses.filter((p) => p.id !== processId))
    setMemoryMap(newMap)

    // Instead of calling the non-existent deallocateMemory function,
    // we'll simulate the deallocation by updating the UI state only
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Memory Allocation</CardTitle>
            <CardDescription>Current memory utilization: {memoryUtilization.toFixed(2)}%</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={memoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {memoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Memory Fragmentation</CardTitle>
            <CardDescription>
              Internal: {internalFragmentation.toFixed(2)}%, External: {externalFragmentation.toFixed(2)}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={fragmentationData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Fragmentation (%)" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Memory Configuration</CardTitle>
          <CardDescription>Adjust memory parameters and observe fragmentation effects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="frameCount">Number of Frames: {frameCount}</Label>
                <Slider
                  id="frameCount"
                  min={1}
                  max={20}
                  step={1}
                  value={[frameCount]}
                  onValueChange={handleFrameCountChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pageSize">Page Size: {pageSize} KB</Label>
                <Slider
                  id="pageSize"
                  min={1}
                  max={16}
                  step={1}
                  value={[pageSize]}
                  onValueChange={handlePageSizeChange}
                />
              </div>

              <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-800">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Memory Size</div>
                <div className="text-2xl font-bold">{memorySize} KB</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="processSize">Process Size (KB)</Label>
                <div className="flex gap-2">
                  <Input
                    id="processSize"
                    type="number"
                    min={1}
                    max={memorySize}
                    value={processSize}
                    onChange={handleProcessSizeChange}
                  />
                  <Button onClick={handleAllocateMemory}>Allocate</Button>
                </div>
              </div>

              <Button className="w-full" onClick={handleCompaction}>
                Perform Memory Compaction
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium mb-2">Allocated Processes</h3>

              <div className="rounded-md border overflow-auto max-h-64">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Process ID
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Size (KB)
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Frames
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {allocatedProcesses.length > 0 ? (
                      allocatedProcesses.map((process) => (
                        <tr key={process.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            P{process.id}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {process.size}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {process.frames.length} ({process.frames.join(", ")})
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <Button variant="destructive" size="sm" onClick={() => handleDeallocateMemory(process.id)}>
                              Deallocate
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          No processes allocated
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Memory Layout Visualization</CardTitle>
          <CardDescription>Visual representation of memory allocation and fragmentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative w-full h-16 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
              {memoryMap.map((frame) => {
                const width = (1 / frameCount) * 100
                const left = (frame.frameNumber / frameCount) * 100

                // Generate a color based on process ID
                const getColor = (processId: number | null) => {
                  if (processId === null) return "bg-gray-300 dark:bg-gray-600"
                  const colors = [
                    "bg-green-500 dark:bg-green-600",
                    "bg-blue-500 dark:bg-blue-600",
                    "bg-purple-500 dark:bg-purple-600",
                    "bg-yellow-500 dark:bg-yellow-600",
                    "bg-red-500 dark:bg-red-600",
                    "bg-indigo-500 dark:bg-indigo-600",
                    "bg-pink-500 dark:bg-pink-600",
                  ]
                  return colors[processId % colors.length]
                }

                return (
                  <div
                    key={frame.frameNumber}
                    className={`absolute h-full ${frame.allocated ? getColor(frame.processId) : "bg-gray-300 dark:bg-gray-600"}`}
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                    }}
                    title={`Frame ${frame.frameNumber}: ${frame.allocated ? `Process P${frame.processId}` : "Free"}`}
                  >
                    {width > 5 && (
                      <div className="text-xs text-center absolute inset-0 flex items-center justify-center text-white">
                        {frame.frameNumber}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>0 KB</span>
              <span>{memorySize / 4} KB</span>
              <span>{memorySize / 2} KB</span>
              <span>{(memorySize * 3) / 4} KB</span>
              <span>{memorySize} KB</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-sm"></div>
                <span>Free</span>
              </div>
              {allocatedProcesses.map((process) => {
                const getColor = (processId: number) => {
                  const colors = [
                    "bg-green-500",
                    "bg-blue-500",
                    "bg-purple-500",
                    "bg-yellow-500",
                    "bg-red-500",
                    "bg-indigo-500",
                    "bg-pink-500",
                  ]
                  return colors[processId % colors.length]
                }

                return (
                  <div key={process.id} className="flex items-center space-x-1">
                    <div className={`w-3 h-3 ${getColor(process.id)} rounded-sm`}></div>
                    <span>P{process.id}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>
              Memory size: {memorySize} KB | Page size: {pageSize} KB | Frames: {frameCount}
            </p>
            <p>
              Allocated: {allocatedFrames} frames ({allocatedFrames * pageSize} KB) | Free: {freeFrames} frames (
              {freeFrames * pageSize} KB)
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetSimulation}>
              Reset Memory
            </Button>
            <Button onClick={() => window.print()}>Export Data</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
