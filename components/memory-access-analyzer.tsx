"use client"

import { useState } from "react"
import { usePageReplacement } from "./page-replacement-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"

// Define access pattern types
type AccessPattern = "sequential" | "random" | "localityBased" | "looping" | "custom"

// Define access pattern data structure
interface AccessPatternData {
  name: string
  description: string
  pageFaultRate: number
  hitRatio: number
  averageAccessTime: number
  pattern: number[]
  heatmapData: { x: number; y: number; value: number }[]
}

export default function MemoryAccessAnalyzer() {
  const {
    frameCount,
    algorithm,
    setAlgorithm,
    setReferenceString,
    runSimulation,
    runComparison,
    comparisonResults,
    hits,
    misses,
    pageFaults,
    hitRatio,
  } = usePageReplacement()

  // State for pattern selection and generation
  const [selectedPattern, setSelectedPattern] = useState<AccessPattern>("sequential")
  const [patternLength, setPatternLength] = useState<number>(50)
  const [maxPageNumber, setMaxPageNumber] = useState<number>(10)
  const [customPattern, setCustomPattern] = useState<string>("")
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false)
  const [localityFactor, setLocalityFactor] = useState<number>(70) // For locality-based pattern (percentage)
  const [loopSize, setLoopSize] = useState<number>(5) // For looping pattern

  // State for analysis results
  const [patternAnalysis, setPatternAnalysis] = useState<AccessPatternData[]>([])
  const [currentAnalysis, setCurrentAnalysis] = useState<AccessPatternData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)

  // Generate pattern based on selected type
  const generatePattern = (): number[] => {
    let pattern: number[] = []

    switch (selectedPattern) {
      case "sequential":
        // Simple sequential access
        for (let i = 0; i < patternLength; i++) {
          pattern.push(i % maxPageNumber)
        }
        break

      case "random":
        // Random access
        for (let i = 0; i < patternLength; i++) {
          pattern.push(Math.floor(Math.random() * maxPageNumber))
        }
        break

      case "localityBased":
        // Locality-based access (temporal locality)
        let currentLocality = Math.floor(Math.random() * maxPageNumber)
        const localityRange = Math.max(1, Math.floor(maxPageNumber * 0.2)) // 20% of max page number

        for (let i = 0; i < patternLength; i++) {
          // localityFactor% chance to stay in current locality
          if (Math.random() * 100 < localityFactor) {
            // Access a page within the current locality
            const offset = Math.floor(Math.random() * localityRange) - Math.floor(localityRange / 2)
            let page = (currentLocality + offset) % maxPageNumber
            if (page < 0) page += maxPageNumber
            pattern.push(page)
          } else {
            // Jump to a new locality
            currentLocality = Math.floor(Math.random() * maxPageNumber)
            pattern.push(currentLocality)
          }
        }
        break

      case "looping":
        // Looping pattern (repeated sequence)
        const loopPattern: number[] = []
        for (let i = 0; i < loopSize; i++) {
          loopPattern.push(Math.floor(Math.random() * maxPageNumber))
        }

        for (let i = 0; i < patternLength; i++) {
          pattern.push(loopPattern[i % loopSize])
        }
        break

      case "custom":
        // Parse custom pattern
        pattern = customPattern
          .split(/[,\s]+/)
          .map((num) => Number.parseInt(num.trim()))
          .filter((num) => !isNaN(num) && num >= 0 && num < maxPageNumber)
        break
    }

    return pattern
  }

  // Generate heatmap data from pattern
  const generateHeatmapData = (pattern: number[]): { x: number; y: number; value: number }[] => {
    const heatmapData: { x: number; y: number; value: number }[] = []
    const accessFrequency: Record<string, number> = {}

    // Track transitions between pages
    for (let i = 0; i < pattern.length - 1; i++) {
      const from = pattern[i]
      const to = pattern[i + 1]
      const key = `${from}-${to}`

      if (!accessFrequency[key]) {
        accessFrequency[key] = 0
      }
      accessFrequency[key]++
    }

    // Convert to heatmap format
    Object.entries(accessFrequency).forEach(([key, value]) => {
      const [from, to] = key.split("-").map(Number)
      heatmapData.push({ x: from, y: to, value })
    })

    return heatmapData
  }

  // Run analysis on the current pattern
  const runAnalysis = async () => {
    setIsAnalyzing(true)

    try {
      const pattern = generatePattern()
      if (pattern.length === 0) {
        alert("Please enter a valid pattern")
        setIsAnalyzing(false)
        return
      }

      // Set the reference string and run simulation
      setReferenceString(pattern)

      // Small delay to ensure state updates
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Run simulation with current algorithm
      runSimulation()

      // Small delay to ensure simulation completes
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Run comparison across all algorithms
      runComparison()

      // Small delay to ensure comparison completes
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Create analysis data
      const heatmapData = generateHeatmapData(pattern)

      const newAnalysis: AccessPatternData = {
        name: getPatternName(selectedPattern),
        description: getPatternDescription(selectedPattern),
        pageFaultRate: (pageFaults / (hits + misses)) * 100,
        hitRatio,
        averageAccessTime: comparisonResults.find((r) => r.algorithm === algorithm)?.avgAccessTime || 0,
        pattern,
        heatmapData,
      }

      setCurrentAnalysis(newAnalysis)

      // Add to analysis history if not already present
      setPatternAnalysis((prev) => {
        const exists = prev.some((p) => p.name === newAnalysis.name)
        if (exists) {
          return prev.map((p) => (p.name === newAnalysis.name ? newAnalysis : p))
        } else {
          return [...prev, newAnalysis]
        }
      })
    } catch (error) {
      console.error("Analysis error:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Helper functions for pattern descriptions
  const getPatternName = (pattern: AccessPattern): string => {
    switch (pattern) {
      case "sequential":
        return "Sequential Access"
      case "random":
        return "Random Access"
      case "localityBased":
        return "Locality-Based Access"
      case "looping":
        return "Looping Access"
      case "custom":
        return "Custom Pattern"
    }
  }

  const getPatternDescription = (pattern: AccessPattern): string => {
    switch (pattern) {
      case "sequential":
        return "Sequential access pattern where pages are accessed in order. Good for algorithms that benefit from predictable access."
      case "random":
        return "Random access pattern with no locality. Challenging for most page replacement algorithms."
      case "localityBased":
        return `Locality-based access with ${localityFactor}% locality factor. Simulates realistic program behavior with temporal locality.`
      case "looping":
        return `Looping access pattern that repeats a sequence of ${loopSize} pages. Tests how algorithms handle repeated sequences.`
      case "custom":
        return "Custom access pattern defined by the user."
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Memory Access Pattern Analyzer</CardTitle>
          <CardDescription>
            Analyze how different memory access patterns affect page replacement performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="generator">
            <TabsList className="mb-4">
              <TabsTrigger value="generator">Pattern Generator</TabsTrigger>
              <TabsTrigger value="analysis">Analysis Results</TabsTrigger>
              <TabsTrigger value="comparison">Pattern Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pattern-type">Access Pattern Type</Label>
                    <Select
                      value={selectedPattern}
                      onValueChange={(value) => setSelectedPattern(value as AccessPattern)}
                    >
                      <SelectTrigger id="pattern-type">
                        <SelectValue placeholder="Select pattern type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sequential">Sequential Access</SelectItem>
                        <SelectItem value="random">Random Access</SelectItem>
                        <SelectItem value="localityBased">Locality-Based Access</SelectItem>
                        <SelectItem value="looping">Looping Access</SelectItem>
                        <SelectItem value="custom">Custom Pattern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedPattern === "custom" ? (
                    <div className="space-y-2">
                      <Label htmlFor="custom-pattern">Custom Access Pattern</Label>
                      <Input
                        id="custom-pattern"
                        placeholder="e.g., 1,2,3,4,1,2,5,1,2,3,4,5"
                        value={customPattern}
                        onChange={(e) => setCustomPattern(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Enter page numbers separated by commas</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="pattern-length">Pattern Length</Label>
                        <Input
                          id="pattern-length"
                          type="number"
                          min="10"
                          max="200"
                          value={patternLength}
                          onChange={(e) => setPatternLength(Number.parseInt(e.target.value) || 50)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max-page">Maximum Page Number</Label>
                        <Input
                          id="max-page"
                          type="number"
                          min="2"
                          max="50"
                          value={maxPageNumber}
                          onChange={(e) => setMaxPageNumber(Number.parseInt(e.target.value) || 10)}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="advanced-options"
                      checked={showAdvancedOptions}
                      onCheckedChange={setShowAdvancedOptions}
                    />
                    <Label htmlFor="advanced-options">Show Advanced Options</Label>
                  </div>

                  {showAdvancedOptions && (
                    <div className="space-y-4 pt-2 border-t">
                      {selectedPattern === "localityBased" && (
                        <div className="space-y-2">
                          <Label htmlFor="locality-factor">Locality Factor: {localityFactor}%</Label>
                          <Input
                            id="locality-factor"
                            type="range"
                            min="0"
                            max="100"
                            value={localityFactor}
                            onChange={(e) => setLocalityFactor(Number.parseInt(e.target.value))}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            Higher values increase temporal locality (0-100%)
                          </p>
                        </div>
                      )}

                      {selectedPattern === "looping" && (
                        <div className="space-y-2">
                          <Label htmlFor="loop-size">Loop Size</Label>
                          <Input
                            id="loop-size"
                            type="number"
                            min="2"
                            max={maxPageNumber}
                            value={loopSize}
                            onChange={(e) => setLoopSize(Number.parseInt(e.target.value) || 5)}
                          />
                          <p className="text-xs text-muted-foreground">Number of pages in the repeating sequence</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="algorithm">Page Replacement Algorithm</Label>
                        <Select value={algorithm} onValueChange={(value) => setAlgorithm(value as any)}>
                          <SelectTrigger id="algorithm">
                            <SelectValue placeholder="Select algorithm" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fifo">First-In-First-Out (FIFO)</SelectItem>
                            <SelectItem value="lru">Least Recently Used (LRU)</SelectItem>
                            <SelectItem value="opt">Optimal (OPT)</SelectItem>
                            <SelectItem value="clock">Clock</SelectItem>
                            <SelectItem value="nru">Not Recently Used (NRU)</SelectItem>
                            <SelectItem value="random">Random</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Card className="bg-muted">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Pattern Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-32 overflow-auto text-sm font-mono bg-black/10 dark:bg-white/5 p-2 rounded">
                        {generatePattern().slice(0, 100).join(", ")}
                        {generatePattern().length > 100 ? "..." : ""}
                      </div>
                      <div className="mt-4 text-sm text-muted-foreground">
                        <p className="font-medium">{getPatternName(selectedPattern)}</p>
                        <p className="mt-1">{getPatternDescription(selectedPattern)}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Button className="w-full" onClick={runAnalysis} disabled={isAnalyzing}>
                    {isAnalyzing ? "Analyzing..." : "Run Pattern Analysis"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              {currentAnalysis ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>{currentAnalysis.name}</CardTitle>
                        <CardDescription>{currentAnalysis.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-md bg-muted">
                              <div className="text-sm text-muted-foreground">Page Fault Rate</div>
                              <div className="text-2xl font-bold">{currentAnalysis.pageFaultRate.toFixed(2)}%</div>
                            </div>
                            <div className="p-4 rounded-md bg-muted">
                              <div className="text-sm text-muted-foreground">Hit Ratio</div>
                              <div className="text-2xl font-bold">{currentAnalysis.hitRatio.toFixed(2)}%</div>
                            </div>
                          </div>

                          <div className="p-4 rounded-md bg-muted">
                            <div className="text-sm text-muted-foreground">Average Access Time</div>
                            <div className="text-2xl font-bold">{currentAnalysis.averageAccessTime.toFixed(2)} ns</div>
                          </div>

                          <div className="p-4 rounded-md bg-muted">
                            <div className="text-sm text-muted-foreground mb-2">Algorithm Performance</div>
                            <div className="h-40">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={comparisonResults.map((result) => ({
                                    name: result.algorithm.toUpperCase(),
                                    hitRatio: result.hitRatio,
                                    faults: result.pageFaults,
                                  }))}
                                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis />
                                  <Tooltip />
                                  <Bar dataKey="hitRatio" name="Hit Ratio (%)" fill="#22c55e" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Access Pattern Visualization</CardTitle>
                        <CardDescription>Heatmap of page transitions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 mb-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                              <CartesianGrid />
                              <XAxis
                                type="number"
                                dataKey="x"
                                name="From Page"
                                domain={[0, maxPageNumber - 1]}
                                label={{ value: "From Page", position: "insideBottom", offset: -10 }}
                              />
                              <YAxis
                                type="number"
                                dataKey="y"
                                name="To Page"
                                domain={[0, maxPageNumber - 1]}
                                label={{ value: "To Page", angle: -90, position: "insideLeft" }}
                              />
                              <ZAxis type="number" dataKey="value" range={[50, 500]} name="Frequency" />
                              <Tooltip
                                cursor={{ strokeDasharray: "3 3" }}
                                formatter={(value, name, props) => {
                                  if (name === "value") return [`Frequency: ${value}`, "Transitions"]
                                  return [value, name]
                                }}
                              />
                              <Scatter name="Page Transitions" data={currentAnalysis.heatmapData} fill="#8884d8" />
                            </ScatterChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="p-4 rounded-md bg-muted">
                          <div className="text-sm text-muted-foreground mb-2">Page Access Sequence</div>
                          <div className="h-32">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={currentAnalysis.pattern.slice(0, 50).map((page, index) => ({
                                  index,
                                  page,
                                }))}
                                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="index"
                                  label={{ value: "Access Sequence", position: "insideBottom", offset: -10 }}
                                />
                                <YAxis
                                  domain={[0, maxPageNumber - 1]}
                                  label={{ value: "Page Number", angle: -90, position: "insideLeft" }}
                                />
                                <Tooltip />
                                <Line type="stepAfter" dataKey="page" stroke="#8884d8" dot={{ r: 2 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">Showing first 50 accesses</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Pattern Insights</CardTitle>
                      <CardDescription>Analysis and recommendations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 rounded-md bg-muted">
                          <h3 className="font-medium mb-2">Performance Analysis</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedPattern === "sequential" &&
                              "Sequential access patterns typically perform well with most algorithms, especially FIFO, as they naturally follow the access order."}
                            {selectedPattern === "random" &&
                              "Random access patterns are challenging for all algorithms except OPT. LRU and Clock often perform better than FIFO for random access."}
                            {selectedPattern === "localityBased" &&
                              "Locality-based patterns benefit from algorithms that leverage temporal locality like LRU and Clock."}
                            {selectedPattern === "looping" &&
                              "Looping patterns can cause thrashing with FIFO if the loop size exceeds the frame count. LRU performs better with smaller loops."}
                            {selectedPattern === "custom" &&
                              "Custom patterns may exhibit characteristics of multiple pattern types. Analyze the visualization to identify dominant patterns."}
                          </p>
                        </div>

                        <div className="p-4 rounded-md bg-muted">
                          <h3 className="font-medium mb-2">Best Algorithm for This Pattern</h3>
                          <p className="text-sm text-muted-foreground">
                            {comparisonResults.length > 0 && (
                              <>
                                Based on the analysis,{" "}
                                <strong>
                                  {comparisonResults
                                    .reduce((best, current) => (current.hitRatio > best.hitRatio ? current : best))
                                    .algorithm.toUpperCase()}
                                </strong>{" "}
                                performs best for this access pattern with a hit ratio of{" "}
                                {comparisonResults
                                  .reduce((best, current) => (current.hitRatio > best.hitRatio ? current : best))
                                  .hitRatio.toFixed(2)}
                                %.
                              </>
                            )}
                          </p>
                        </div>

                        <div className="p-4 rounded-md bg-muted">
                          <h3 className="font-medium mb-2">Optimization Recommendations</h3>
                          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                            {selectedPattern === "sequential" && (
                              <>
                                <li>Sequential access patterns work well with prefetching techniques</li>
                                <li>Consider increasing page size for sequential access to reduce overhead</li>
                                <li>FIFO is often sufficient for purely sequential access</li>
                              </>
                            )}
                            {selectedPattern === "random" && (
                              <>
                                <li>Random access patterns benefit from larger frame counts</li>
                                <li>Consider using LRU or Clock algorithms instead of FIFO</li>
                                <li>Restructuring data to improve locality can significantly improve performance</li>
                              </>
                            )}
                            {selectedPattern === "localityBased" && (
                              <>
                                <li>Increase TLB size to capture more of the working set</li>
                                <li>LRU or Clock algorithms are recommended for locality-based patterns</li>
                                <li>Consider adjusting frame count to match the working set size</li>
                              </>
                            )}
                            {selectedPattern === "looping" && (
                              <>
                                <li>Ensure frame count is at least equal to loop size to prevent thrashing</li>
                                <li>LRU performs well when the loop size is smaller than the frame count</li>
                                <li>Consider loop unrolling or blocking techniques in the original code</li>
                              </>
                            )}
                            {selectedPattern === "custom" && (
                              <>
                                <li>Analyze the pattern visualization to identify dominant access patterns</li>
                                <li>Consider breaking down the pattern into smaller, more predictable segments</li>
                                <li>Test multiple algorithms to find the optimal one for your specific pattern</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No analysis results yet. Run a pattern analysis first.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6">
              {patternAnalysis.length > 0 ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Pattern Comparison</CardTitle>
                      <CardDescription>Compare performance across different access patterns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Pattern</th>
                              <th className="text-left p-2">Hit Ratio</th>
                              <th className="text-left p-2">Page Fault Rate</th>
                              <th className="text-left p-2">Avg. Access Time</th>
                              <th className="text-left p-2">Best Algorithm</th>
                            </tr>
                          </thead>
                          <tbody>
                            {patternAnalysis.map((analysis, index) => (
                              <tr key={index} className="border-b hover:bg-muted/50">
                                <td className="p-2 font-medium">{analysis.name}</td>
                                <td className="p-2">{analysis.hitRatio.toFixed(2)}%</td>
                                <td className="p-2">{analysis.pageFaultRate.toFixed(2)}%</td>
                                <td className="p-2">{analysis.averageAccessTime.toFixed(2)} ns</td>
                                <td className="p-2">
                                  {comparisonResults.length > 0 &&
                                    comparisonResults
                                      .reduce((best, current) => (current.hitRatio > best.hitRatio ? current : best))
                                      .algorithm.toUpperCase()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium mb-2">Hit Ratio Comparison</h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={patternAnalysis.map((analysis) => ({
                                  name: analysis.name,
                                  hitRatio: analysis.hitRatio,
                                }))}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="hitRatio" name="Hit Ratio (%)" fill="#22c55e" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2">Page Fault Rate Comparison</h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={patternAnalysis.map((analysis) => ({
                                  name: analysis.name,
                                  pageFaultRate: analysis.pageFaultRate,
                                }))}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="pageFaultRate" name="Page Fault Rate (%)" fill="#ef4444" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 rounded-md bg-muted">
                        <h3 className="font-medium mb-2">Pattern Analysis Insights</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Based on the comparison of different access patterns, we can draw the following conclusions:
                        </p>
                        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                          <li>
                            Sequential access patterns typically perform better than random access patterns across all
                            algorithms
                          </li>
                          <li>Patterns with high locality benefit most from LRU and Clock algorithms</li>
                          <li>
                            The Optimal (OPT) algorithm consistently outperforms other algorithms but requires future
                            knowledge
                          </li>
                          <li>Looping patterns can cause thrashing when the loop size exceeds the frame count</li>
                          <li>Increasing frame count generally improves performance but with diminishing returns</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No patterns analyzed yet. Run multiple pattern analyses to compare them.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
