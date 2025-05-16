"use client"

import { useState } from "react"
import { useMemory, type MemoryBlock } from "./memory-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function MemoryVisualizer() {
  const {
    memorySize,
    memoryBlocks,
    processes,
    algorithm,
    setAlgorithm,
    addProcess,
    removeProcess,
    resetMemory,
    compactMemory,
    memoryUtilization,
    fragmentation,
  } = useMemory()

  const [processSize, setProcessSize] = useState<number>(64)
  const [error, setError] = useState<string | null>(null)

  const handleAddProcess = () => {
    if (processSize <= 0) {
      setError("Process size must be greater than 0")
      return
    }

    if (processSize > memorySize) {
      setError(`Process size cannot exceed memory size (${memorySize} MB)`)
      return
    }

    const success = addProcess(processSize)

    if (!success) {
      setError(`Failed to allocate ${processSize} MB of memory. Try compacting memory or removing processes.`)
    } else {
      setError(null)
    }
  }

  const formatMemorySize = (size: number) => {
    return size >= 1024 ? `${size / 1024} GB` : `${size} MB`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Memory Map</CardTitle>
            <CardDescription>
              Visual representation of memory allocation ({formatMemorySize(memorySize)})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-16 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden mb-4">
              {memoryBlocks.map((block) => (
                <MemoryBlockVisual key={block.id} block={block} totalSize={memorySize} />
              ))}
            </div>

            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-8">
              <span>0</span>
              <span>{formatMemorySize(memorySize / 4)}</span>
              <span>{formatMemorySize(memorySize / 2)}</span>
              <span>{formatMemorySize((memorySize * 3) / 4)}</span>
              <span>{formatMemorySize(memorySize)}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm font-medium mb-1">Memory Utilization</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${memoryUtilization}%` }}></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{memoryUtilization}% used</div>
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Memory Fragmentation</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${fragmentation}%` }}></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{fragmentation}% fragmented</div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={resetMemory}>
                Reset Memory
              </Button>
              <Button variant="outline" onClick={compactMemory}>
                Compact Memory
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Memory Blocks</CardTitle>
            <CardDescription>Detailed view of memory allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Start Address</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>End Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Process ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memoryBlocks.map((block) => (
                  <TableRow key={block.id}>
                    <TableCell>{block.start}</TableCell>
                    <TableCell>{block.size} MB</TableCell>
                    <TableCell>{block.start + block.size - 1}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          block.type === "free"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }`}
                      >
                        {block.type === "free" ? "Free" : "Allocated"}
                      </span>
                    </TableCell>
                    <TableCell>{block.processId || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Memory Controls</CardTitle>
            <CardDescription>Add processes and configure memory allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="algorithm">Allocation Algorithm</Label>
                <Select value={algorithm} onValueChange={(value) => setAlgorithm(value as any)}>
                  <SelectTrigger id="algorithm">
                    <SelectValue placeholder="Select algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="firstFit">First Fit</SelectItem>
                    <SelectItem value="bestFit">Best Fit</SelectItem>
                    <SelectItem value="worstFit">Worst Fit</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {algorithm === "firstFit" && "Allocates the first free block that is large enough"}
                  {algorithm === "bestFit" && "Allocates the smallest free block that is large enough"}
                  {algorithm === "worstFit" && "Allocates the largest free block available"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="processSize">Process Size (MB)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="processSize"
                    type="number"
                    min="1"
                    max={memorySize}
                    value={processSize}
                    onChange={(e) => setProcessSize(Number.parseInt(e.target.value) || 0)}
                  />
                  <Button onClick={handleAddProcess}>Add Process</Button>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Memory Management</AlertTitle>
                <AlertDescription>
                  The simulator demonstrates how memory is allocated using different algorithms. Try adding processes of
                  different sizes and observe how fragmentation occurs.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Active Processes</CardTitle>
            <CardDescription>Manage running processes</CardDescription>
          </CardHeader>
          <CardContent>
            {processes.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">No active processes</div>
            ) : (
              <div className="space-y-2">
                {processes.map((process) => (
                  <div
                    key={process.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                  >
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${process.color}`}></div>
                      <div>
                        <div className="text-sm font-medium">{process.id}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{process.size} MB</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeProcess(process.id)}>
                      Terminate
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MemoryBlockVisual({ block, totalSize }: { block: MemoryBlock; totalSize: number }) {
  const width = (block.size / totalSize) * 100
  const left = (block.start / totalSize) * 100

  return (
    <div
      className={`absolute h-full ${
        block.type === "free" ? "bg-gray-300 dark:bg-gray-600" : block.color || "bg-blue-500"
      }`}
      style={{
        left: `${left}%`,
        width: `${width}%`,
      }}
      title={`${block.type === "free" ? "Free" : "Allocated"} - ${block.size} MB (${block.start} - ${
        block.start + block.size - 1
      })`}
    >
      {width > 5 && (
        <div className="text-xs text-center absolute inset-0 flex items-center justify-center text-white">
          {block.size}MB
        </div>
      )}
    </div>
  )
}
