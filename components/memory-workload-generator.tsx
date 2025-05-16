"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Save,
  Download,
  Play,
  RefreshCw,
  Database,
  Globe,
  Gamepad2,
  FlaskRoundIcon as Flask,
  Server,
} from "lucide-react"
import {
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Bar,
  BarChart as RechartsBarChart,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Types
type WorkloadType = "database" | "web" | "gaming" | "scientific" | "virtualization" | "custom"
type WorkloadProfile = {
  name: string
  type: WorkloadType
  workingSetSize: number
  localityFactor: number
  burstiness: number
  readWriteRatio: number
  sequentialRatio: number
  pattern: number[]
}

// Default workload profiles
const defaultWorkloads: Record<WorkloadType, Omit<WorkloadProfile, "name" | "pattern">> = {
  database: {
    type: "database",
    workingSetSize: 70,
    localityFactor: 80,
    burstiness: 40,
    readWriteRatio: 30, // 30% reads, 70% writes
    sequentialRatio: 20, // 20% sequential, 80% random
  },
  web: {
    type: "web",
    workingSetSize: 60,
    localityFactor: 50,
    burstiness: 70,
    readWriteRatio: 80, // 80% reads, 20% writes
    sequentialRatio: 30, // 30% sequential, 70% random
  },
  gaming: {
    type: "gaming",
    workingSetSize: 90,
    localityFactor: 60,
    burstiness: 80,
    readWriteRatio: 60, // 60% reads, 40% writes
    sequentialRatio: 40, // 40% sequential, 60% random
  },
  scientific: {
    type: "scientific",
    workingSetSize: 95,
    localityFactor: 40,
    burstiness: 30,
    readWriteRatio: 50, // 50% reads, 50% writes
    sequentialRatio: 80, // 80% sequential, 20% random
  },
  virtualization: {
    type: "virtualization",
    workingSetSize: 85,
    localityFactor: 30,
    burstiness: 60,
    readWriteRatio: 40, // 40% reads, 60% writes
    sequentialRatio: 25, // 25% sequential, 75% random
  },
  custom: {
    type: "custom",
    workingSetSize: 50,
    localityFactor: 50,
    burstiness: 50,
    readWriteRatio: 50,
    sequentialRatio: 50,
  },
}

// Helper function to generate a workload pattern based on parameters
function generateWorkloadPattern(params: Omit<WorkloadProfile, "name" | "pattern">, length = 100): number[] {
  const { workingSetSize, localityFactor, burstiness, sequentialRatio } = params
  const pattern: number[] = []

  // Calculate the actual working set size (number of unique pages)
  const uniquePages = Math.max(5, Math.floor((workingSetSize / 100) * 50))

  // Initialize with some sequential access
  let currentPage = Math.floor(Math.random() * uniquePages)

  for (let i = 0; i < length; i++) {
    // Determine if this access should follow locality principle
    const useLocality = Math.random() * 100 < localityFactor

    // Determine if this access should be part of a burst
    const isBurst = Math.random() * 100 < burstiness

    // Determine if this access should be sequential
    const isSequential = Math.random() * 100 < sequentialRatio

    if (isBurst && i < length - 3) {
      // Create a burst of accesses to the same page
      const burstPage = Math.floor(Math.random() * uniquePages)
      pattern.push(burstPage)
      pattern.push(burstPage)
      pattern.push(burstPage)
      i += 2 // Skip the next 2 iterations since we've added 3 accesses
    } else if (isSequential && currentPage < uniquePages - 1) {
      // Sequential access - go to next page
      currentPage++
      pattern.push(currentPage)
    } else if (useLocality) {
      // Locality-based access - stay close to current page
      const delta = Math.floor(Math.random() * 5) - 2 // -2 to +2
      currentPage = Math.max(0, Math.min(uniquePages - 1, currentPage + delta))
      pattern.push(currentPage)
    } else {
      // Random access
      const randomPage = Math.floor(Math.random() * uniquePages)
      pattern.push(randomPage)
      currentPage = randomPage
    }
  }

  return pattern
}

// Helper function to analyze a workload pattern
function analyzePattern(pattern: number[]): {
  localityScore: number
  sequentialityScore: number
  workingSetSize: number
  burstinessScore: number
  uniquePages: number
  frequencyData: { page: number; count: number }[]
} {
  // Count unique pages
  const uniquePages = new Set(pattern).size

  // Calculate locality score (inverse of average distance between same page accesses)
  let localityScore = 0
  const pageLastSeen = new Map<number, number>()
  let totalDistance = 0
  let distanceCount = 0

  pattern.forEach((page, index) => {
    if (pageLastSeen.has(page)) {
      const distance = index - pageLastSeen.get(page)!
      totalDistance += distance
      distanceCount++
    }
    pageLastSeen.set(page, index)
  })

  localityScore = distanceCount > 0 ? 100 - Math.min(100, (totalDistance / distanceCount) * 10) : 0

  // Calculate sequentiality score
  let sequentialCount = 0
  for (let i = 1; i < pattern.length; i++) {
    if (pattern[i] === pattern[i - 1] + 1) {
      sequentialCount++
    }
  }
  const sequentialityScore = (sequentialCount / (pattern.length - 1)) * 100

  // Calculate burstiness (repeated accesses to same page)
  let burstCount = 0
  for (let i = 1; i < pattern.length; i++) {
    if (pattern[i] === pattern[i - 1]) {
      burstCount++
    }
  }
  const burstinessScore = (burstCount / (pattern.length - 1)) * 100

  // Calculate working set size over time (average number of unique pages in a sliding window)
  const windowSize = 20
  let totalWorkingSetSize = 0
  let windowCount = 0

  for (let i = 0; i <= pattern.length - windowSize; i++) {
    const window = pattern.slice(i, i + windowSize)
    const uniqueInWindow = new Set(window).size
    totalWorkingSetSize += uniqueInWindow
    windowCount++
  }

  const workingSetSize = windowCount > 0 ? (totalWorkingSetSize / windowCount / windowSize) * 100 : 0

  // Calculate page frequency
  const frequency = new Map<number, number>()
  pattern.forEach((page) => {
    frequency.set(page, (frequency.get(page) || 0) + 1)
  })

  const frequencyData = Array.from(frequency.entries())
    .map(([page, count]) => ({
      page,
      count,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    localityScore,
    sequentialityScore,
    workingSetSize,
    burstinessScore,
    uniquePages,
    frequencyData,
  }
}

export default function MemoryWorkloadGenerator() {
  const [activeTab, setActiveTab] = useState<string>("create")
  const [workloadType, setWorkloadType] = useState<WorkloadType>("database")
  const [workloadName, setWorkloadName] = useState<string>("New Workload")
  const [workloadParams, setWorkloadParams] = useState<Omit<WorkloadProfile, "name" | "pattern">>(
    defaultWorkloads.database,
  )
  const [generatedPattern, setGeneratedPattern] = useState<number[]>([])
  const [patternAnalysis, setPatternAnalysis] = useState<ReturnType<typeof analyzePattern> | null>(null)
  const [savedWorkloads, setSavedWorkloads] = useState<WorkloadProfile[]>([])
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("lru")

  // Handle workload type change
  const handleWorkloadTypeChange = (type: WorkloadType) => {
    setWorkloadType(type)
    setWorkloadParams(defaultWorkloads[type])
  }

  // Handle parameter change
  const handleParamChange = (param: keyof Omit<WorkloadProfile, "name" | "type" | "pattern">, value: number) => {
    setWorkloadParams((prev) => ({
      ...prev,
      [param]: value,
    }))
  }

  // Generate workload pattern
  const generateWorkload = () => {
    const pattern = generateWorkloadPattern(workloadParams)
    setGeneratedPattern(pattern)
    setPatternAnalysis(analyzePattern(pattern))
  }

  // Save current workload
  const saveWorkload = () => {
    if (workloadName && generatedPattern.length > 0) {
      const newWorkload: WorkloadProfile = {
        name: workloadName,
        ...workloadParams,
        pattern: generatedPattern,
      }

      setSavedWorkloads((prev) => [...prev, newWorkload])
    }
  }

  // Prepare chart data
  const getChartData = () => {
    if (!generatedPattern.length) return []

    return generatedPattern.map((page, index) => ({
      index,
      page,
    }))
  }

  // Prepare frequency chart data
  const getFrequencyChartData = () => {
    if (!patternAnalysis) return []
    return patternAnalysis.frequencyData.slice(0, 10) // Top 10 pages
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Memory Workload Generator</CardTitle>
          <CardDescription>
            Create realistic memory access patterns based on common application behaviors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create">Create Workload</TabsTrigger>
              <TabsTrigger value="analyze">Analyze Pattern</TabsTrigger>
              <TabsTrigger value="compare">Compare Algorithms</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="workload-name">Workload Name</Label>
                    <Input
                      id="workload-name"
                      value={workloadName}
                      onChange={(e) => setWorkloadName(e.target.value)}
                      placeholder="Enter workload name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="workload-type">Workload Type</Label>
                    <Select
                      value={workloadType}
                      onValueChange={(value) => handleWorkloadTypeChange(value as WorkloadType)}
                    >
                      <SelectTrigger id="workload-type">
                        <SelectValue placeholder="Select workload type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="database">
                          <div className="flex items-center">
                            <Database className="mr-2 h-4 w-4" />
                            <span>Database</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="web">
                          <div className="flex items-center">
                            <Globe className="mr-2 h-4 w-4" />
                            <span>Web Server</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="gaming">
                          <div className="flex items-center">
                            <Gamepad2 className="mr-2 h-4 w-4" />
                            <span>Gaming</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="scientific">
                          <div className="flex items-center">
                            <Flask className="mr-2 h-4 w-4" />
                            <span>Scientific Computing</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="virtualization">
                          <div className="flex items-center">
                            <Server className="mr-2 h-4 w-4" />
                            <span>Virtualization</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="working-set-size">Working Set Size</Label>
                        <span className="text-sm text-gray-500">{workloadParams.workingSetSize}%</span>
                      </div>
                      <Slider
                        id="working-set-size"
                        min={10}
                        max={100}
                        step={5}
                        value={[workloadParams.workingSetSize]}
                        onValueChange={(value) => handleParamChange("workingSetSize", value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="locality-factor">Locality Factor</Label>
                        <span className="text-sm text-gray-500">{workloadParams.localityFactor}%</span>
                      </div>
                      <Slider
                        id="locality-factor"
                        min={0}
                        max={100}
                        step={5}
                        value={[workloadParams.localityFactor]}
                        onValueChange={(value) => handleParamChange("localityFactor", value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="burstiness">Burstiness</Label>
                        <span className="text-sm text-gray-500">{workloadParams.burstiness}%</span>
                      </div>
                      <Slider
                        id="burstiness"
                        min={0}
                        max={100}
                        step={5}
                        value={[workloadParams.burstiness]}
                        onValueChange={(value) => handleParamChange("burstiness", value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="read-write-ratio">Read/Write Ratio</Label>
                        <span className="text-sm text-gray-500">{workloadParams.readWriteRatio}% reads</span>
                      </div>
                      <Slider
                        id="read-write-ratio"
                        min={0}
                        max={100}
                        step={5}
                        value={[workloadParams.readWriteRatio]}
                        onValueChange={(value) => handleParamChange("readWriteRatio", value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="sequential-ratio">Sequential Access Ratio</Label>
                        <span className="text-sm text-gray-500">{workloadParams.sequentialRatio}% sequential</span>
                      </div>
                      <Slider
                        id="sequential-ratio"
                        min={0}
                        max={100}
                        step={5}
                        value={[workloadParams.sequentialRatio]}
                        onValueChange={(value) => handleParamChange("sequentialRatio", value[0])}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 h-64 overflow-auto">
                    {generatedPattern.length > 0 ? (
                      <div className="h-full">
                        <ChartContainer
                          config={{
                            page: {
                              label: "Page Number",
                              color: "hsl(var(--chart-1))",
                            },
                          }}
                          className="h-full"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart
                              data={getChartData()}
                              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="index"
                                label={{ value: "Access Sequence", position: "insideBottom", offset: -5 }}
                              />
                              <YAxis label={{ value: "Page Number", angle: -90, position: "insideLeft" }} />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Line type="stepAfter" dataKey="page" stroke="var(--color-page)" dot={false} />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <p>No workload generated yet</p>
                          <p className="text-sm">Click "Generate Workload" to create a pattern</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {patternAnalysis && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <h4 className="text-sm font-medium mb-2">Pattern Analysis</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Locality Score:</span>
                            <span className="font-medium">{patternAnalysis.localityScore.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sequentiality:</span>
                            <span className="font-medium">{patternAnalysis.sequentialityScore.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Burstiness:</span>
                            <span className="font-medium">{patternAnalysis.burstinessScore.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Working Set:</span>
                            <span className="font-medium">{patternAnalysis.workingSetSize.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Unique Pages:</span>
                            <span className="font-medium">{patternAnalysis.uniquePages}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <h4 className="text-sm font-medium mb-2">Recommended Algorithms</h4>
                        <div className="space-y-1 text-sm">
                          {patternAnalysis.localityScore > 70 && (
                            <div className="flex items-center text-green-600 dark:text-green-400">
                              <span>• LRU (High locality)</span>
                            </div>
                          )}
                          {patternAnalysis.sequentialityScore > 60 && (
                            <div className="flex items-center text-green-600 dark:text-green-400">
                              <span>• SCAN (Sequential access)</span>
                            </div>
                          )}
                          {patternAnalysis.burstinessScore > 60 && (
                            <div className="flex items-center text-green-600 dark:text-green-400">
                              <span>• MRU (Bursty access)</span>
                            </div>
                          )}
                          {patternAnalysis.workingSetSize < 30 && (
                            <div className="flex items-center text-green-600 dark:text-green-400">
                              <span>• Working Set (Small WSS)</span>
                            </div>
                          )}
                          {patternAnalysis.localityScore < 40 && (
                            <div className="flex items-center text-green-600 dark:text-green-400">
                              <span>• CLOCK (Random access)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analyze" className="space-y-6">
              {generatedPattern.length > 0 && patternAnalysis ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Page Access Frequency</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ChartContainer
                            config={{
                              count: {
                                label: "Access Count",
                                color: "hsl(var(--chart-2))",
                              },
                            }}
                            className="h-full"
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsBarChart
                                data={getFrequencyChartData()}
                                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="page"
                                  label={{ value: "Page Number", position: "insideBottom", offset: -5 }}
                                />
                                <YAxis label={{ value: "Access Count", angle: -90, position: "insideLeft" }} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="count" fill="var(--color-count)" />
                              </RechartsBarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Pattern Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Locality</span>
                              <span className="text-sm font-medium">{patternAnalysis.localityScore.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full"
                                style={{ width: `${patternAnalysis.localityScore}%` }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Sequentiality</span>
                              <span className="text-sm font-medium">
                                {patternAnalysis.sequentialityScore.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div
                                className="bg-purple-600 dark:bg-purple-500 h-2.5 rounded-full"
                                style={{ width: `${patternAnalysis.sequentialityScore}%` }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Burstiness</span>
                              <span className="text-sm font-medium">{patternAnalysis.burstinessScore.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div
                                className="bg-cyan-600 dark:bg-cyan-500 h-2.5 rounded-full"
                                style={{ width: `${patternAnalysis.burstinessScore}%` }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Working Set Size</span>
                              <span className="text-sm font-medium">{patternAnalysis.workingSetSize.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div
                                className="bg-emerald-600 dark:bg-emerald-500 h-2.5 rounded-full"
                                style={{ width: `${patternAnalysis.workingSetSize}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="mt-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Workload Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Workload Type:</span>
                              <span className="font-medium capitalize">{workloadType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Accesses:</span>
                              <span className="font-medium">{generatedPattern.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Unique Pages:</span>
                              <span className="font-medium">{patternAnalysis.uniquePages}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Read/Write Ratio:</span>
                              <span className="font-medium">
                                {workloadParams.readWriteRatio}% / {100 - workloadParams.readWriteRatio}%
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <p className="text-gray-500 mb-4">No workload pattern to analyze</p>
                    <Button onClick={() => setActiveTab("create")}>Go to Create Workload</Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="compare" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Algorithm Selection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="algorithm">Select Algorithm</Label>
                          <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                            <SelectTrigger id="algorithm">
                              <SelectValue placeholder="Select algorithm" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lru">LRU</SelectItem>
                              <SelectItem value="fifo">FIFO</SelectItem>
                              <SelectItem value="opt">OPT</SelectItem>
                              <SelectItem value="clock">CLOCK</SelectItem>
                              <SelectItem value="mru">MRU</SelectItem>
                              <SelectItem value="ai">AI/ML</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="frame-count">Frame Count</Label>
                          <Input id="frame-count" type="number" min="1" max="10" defaultValue="4" />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch id="compare-all" />
                          <Label htmlFor="compare-all">Compare All Algorithms</Label>
                        </div>

                        <Button className="w-full">Run Simulation</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {generatedPattern.length > 0 ? (
                        <div className="h-64 flex items-center justify-center">
                          <p className="text-gray-500">Run simulation to see performance comparison</p>
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-gray-500 mb-4">No workload pattern available</p>
                            <Button onClick={() => setActiveTab("create")}>Generate Workload First</Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={generateWorkload}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate Workload
            </Button>
            <Button variant="outline" onClick={saveWorkload} disabled={!generatedPattern.length}>
              <Save className="mr-2 h-4 w-4" />
              Save Workload
            </Button>
          </div>
          <div>
            <Button disabled={!generatedPattern.length}>
              <Play className="mr-2 h-4 w-4" />
              Apply to Simulator
            </Button>
          </div>
        </CardFooter>
      </Card>

      {savedWorkloads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Workloads</CardTitle>
            <CardDescription>Your saved workload profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {savedWorkloads.map((workload, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{workload.name}</CardTitle>
                    <CardDescription className="capitalize">{workload.type}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Working Set:</span>
                        <span>{workload.workingSetSize}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Locality:</span>
                        <span>{workload.localityFactor}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pattern Length:</span>
                        <span>{workload.pattern.length}</span>
                      </div>
                    </div>
                  </CardContent>
                  <div className="px-6 pb-4">
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="mr-2 h-3 w-3" />
                      Load
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
