"use client"

import { useState } from "react"
import { usePageReplacement } from "./page-replacement-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, Play, SkipBack, SkipForward } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import AlgorithmComparison from "./algorithm-comparison"
import AlgorithmExplanation from "./algorithm-explanation"
import { Slider } from "@/components/ui/slider"
import AlgorithmVisualization from "./algorithm-visualization"
import AnimatedMemoryFrames from "./animated-memory-frames"
import AnimatedReferenceString from "./animated-reference-string"
import AnimatedAccessHistory from "./animated-access-history"
import MemoryAccessHeatmap from "./memory-access-heatmap"
import EvictionLog from "./eviction-log"
import AlgorithmStepExplainer from "./algorithm-step-explainer"

export default function PageReplacementSimulator() {
  const {
    frameCount,
    setFrameCount,
    algorithm,
    setAlgorithm,
    referenceString,
    manualReference,
    setManualReference,
    generateRandomReferences,
    frames,
    pageHistory,
    currentStep,
    runSimulation,
    stepForward,
    stepBackward,
    resetSimulation,
    hits,
    misses,
    pageFaults,
    hitRatio,
    comparisonResults,
    runComparison,
    tlbEnabled,
    setTlbEnabled,
    tlbSize,
    setTlbSize,
    tlbHits,
    tlbMisses,
    tlbHitRatio,
    alphaWeight,
    setAlphaWeight,
    betaWeight,
    setBetaWeight,
    gammaWeight,
    setGammaWeight,
  } = usePageReplacement()

  const [referenceLength, setReferenceLength] = useState<number>(20)
  const [maxPageNumber, setMaxPageNumber] = useState<number>(10)
  const [error, setError] = useState<string | null>(null)
  const [showAnimations, setShowAnimations] = useState<boolean>(true)
  const [animationSpeed, setAnimationSpeed] = useState<number>(500)
  const [visualizationTab, setVisualizationTab] = useState<string>("basic")

  const handleGenerateReferences = () => {
    if (referenceLength <= 0) {
      setError("Reference length must be greater than 0")
      return
    }

    if (maxPageNumber <= 0) {
      setError("Maximum page number must be greater than 0")
      return
    }

    generateRandomReferences(referenceLength, maxPageNumber)
    setError(null)
  }

  const handleRunSimulation = () => {
    if (!manualReference.trim() && referenceString.length === 0) {
      setError("Please enter a reference string or generate one")
      return
    }

    runSimulation()
    setError(null)
  }

  const handleRunComparison = () => {
    if (!manualReference.trim() && referenceString.length === 0) {
      setError("Please enter a reference string or generate one")
      return
    }

    runComparison()
    setError(null)
  }

  const getAlgorithmName = (alg: string) => {
    switch (alg) {
      case "fifo":
        return "First-In-First-Out (FIFO)"
      case "lru":
        return "Least Recently Used (LRU)"
      case "opt":
        return "Optimal (OPT)"
      case "clock":
        return "Clock"
      case "nru":
        return "Not Recently Used (NRU)"
      case "random":
        return "Random"
      case "mlru":
        return "Multi-level LRU (MLRU)"
      case "lfu-lru":
        return "LFU-LRU Hybrid"
      case "fru":
        return "Frequency + Recency + Usage (FRU)"
      default:
        return alg.toUpperCase()
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="simulator" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="simulator">Simulator</TabsTrigger>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
          <TabsTrigger value="comparison">Algorithm Comparison</TabsTrigger>
          <TabsTrigger value="explanation">Algorithm Explanation</TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Page Replacement Simulation</CardTitle>
                  <CardDescription>{algorithm && `Using ${getAlgorithmName(algorithm)} algorithm`}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Animated Memory Frames */}
                    <AnimatedMemoryFrames showAnimations={showAnimations} animationSpeed={animationSpeed} />

                    {/* TLB Visualization (if enabled) */}
                    {tlbEnabled && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Translation Lookaside Buffer (TLB)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {Array.from({ length: tlbSize }, (_, i) => (
                            <div
                              key={`tlb-${i}`}
                              className="p-3 rounded-md border bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                            >
                              <div className="text-xs text-gray-500 dark:text-gray-400">TLB Entry {i}</div>
                              <div className="text-sm font-medium">
                                {/* This is simplified - in a real implementation, TLB would track page-to-frame mappings */}
                                {i < currentStep && currentStep > 0 ? `Page → Frame` : "Empty"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Animated Reference String */}
                    <AnimatedReferenceString showAnimations={showAnimations} animationSpeed={animationSpeed} />

                    {/* Simulation Controls */}
                    <div className="flex justify-center space-x-2">
                      <Button variant="outline" size="icon" onClick={stepBackward}>
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button onClick={handleRunSimulation}>
                        <Play className="h-4 w-4 mr-2" />
                        Run Simulation
                      </Button>
                      <Button variant="outline" size="icon" onClick={stepForward}>
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-800">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Hits</div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{hits}</div>
                      </div>
                      <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-800">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Misses</div>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{misses}</div>
                      </div>
                      <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-800">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Page Faults</div>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{pageFaults}</div>
                      </div>
                      <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-800">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Hit Ratio</div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {hitRatio.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    {/* TLB Statistics (if enabled) */}
                    {tlbEnabled && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-md bg-blue-50 dark:bg-blue-950">
                          <div className="text-sm text-gray-500 dark:text-gray-400">TLB Hits</div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{tlbHits}</div>
                        </div>
                        <div className="p-4 rounded-md bg-blue-50 dark:bg-blue-950">
                          <div className="text-sm text-gray-500 dark:text-gray-400">TLB Misses</div>
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{tlbMisses}</div>
                        </div>
                        <div className="p-4 rounded-md bg-blue-50 dark:bg-blue-950">
                          <div className="text-sm text-gray-500 dark:text-gray-400">TLB Hit Ratio</div>
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {tlbHitRatio.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Animated Page Access History */}
                    {pageHistory.length > 0 && (
                      <AnimatedAccessHistory showAnimations={showAnimations} animationSpeed={animationSpeed} />
                    )}

                    {/* Algorithm Visualization */}
                    {(algorithm === "mlru" || algorithm === "lfu-lru" || algorithm === "fru") && (
                      <div className="mt-6">
                        <AlgorithmVisualization />
                      </div>
                    )}

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Simulation Settings</CardTitle>
                  <CardDescription>Configure the page replacement simulation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
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
                          <SelectItem value="mlru">Multi-level LRU (MLRU)</SelectItem>
                          <SelectItem value="lfu-lru">LFU-LRU Hybrid</SelectItem>
                          <SelectItem value="fru">Frequency + Recency + Usage (FRU)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="frameCount">Number of Frames</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="frameCount"
                          type="number"
                          min="1"
                          max="10"
                          value={frameCount}
                          onChange={(e) => setFrameCount(Number.parseInt(e.target.value) || 3)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="tlbEnabled">Enable TLB</Label>
                        <Switch id="tlbEnabled" checked={tlbEnabled} onCheckedChange={setTlbEnabled} />
                      </div>
                      {tlbEnabled && (
                        <div className="space-y-2 mt-2">
                          <Label htmlFor="tlbSize">TLB Size</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="tlbSize"
                              type="number"
                              min="1"
                              max="8"
                              value={tlbSize}
                              onChange={(e) => setTlbSize(Number.parseInt(e.target.value) || 4)}
                            />
                          </div>
                        </div>
                      )}
                      {algorithm === "fru" && (
                        <div className="space-y-4 mt-4 pt-4 border-t">
                          <h4 className="text-sm font-medium">FRU Algorithm Parameters</h4>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="alphaWeight">Frequency Weight (α): {alphaWeight.toFixed(2)}</Label>
                              <span className="text-xs text-muted-foreground">{(alphaWeight * 100).toFixed(0)}%</span>
                            </div>
                            <Slider
                              id="alphaWeight"
                              min={0}
                              max={1}
                              step={0.05}
                              value={[alphaWeight]}
                              onValueChange={(value) => setAlphaWeight(value[0])}
                            />
                            <p className="text-xs text-muted-foreground">
                              Higher values prioritize frequently accessed pages
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="betaWeight">Recency Weight (β): {betaWeight.toFixed(2)}</Label>
                              <span className="text-xs text-muted-foreground">{(betaWeight * 100).toFixed(0)}%</span>
                            </div>
                            <Slider
                              id="betaWeight"
                              min={0}
                              max={1}
                              step={0.05}
                              value={[betaWeight]}
                              onValueChange={(value) => setBetaWeight(value[0])}
                            />
                            <p className="text-xs text-muted-foreground">
                              Higher values prioritize recently accessed pages
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="gammaWeight">Usage Weight (γ): {gammaWeight.toFixed(2)}</Label>
                              <span className="text-xs text-muted-foreground">{(gammaWeight * 100).toFixed(0)}%</span>
                            </div>
                            <Slider
                              id="gammaWeight"
                              min={0}
                              max={1}
                              step={0.05}
                              value={[gammaWeight]}
                              onValueChange={(value) => setGammaWeight(value[0])}
                            />
                            <p className="text-xs text-muted-foreground">
                              Higher values prioritize pages with recent access patterns
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showAnimations">Show Animations</Label>
                        <Switch id="showAnimations" checked={showAnimations} onCheckedChange={setShowAnimations} />
                      </div>
                      {showAnimations && (
                        <div className="space-y-2 mt-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="animationSpeed">Animation Speed: {animationSpeed}ms</Label>
                          </div>
                          <Slider
                            id="animationSpeed"
                            min={100}
                            max={1000}
                            step={100}
                            value={[animationSpeed]}
                            onValueChange={(value) => setAnimationSpeed(value[0])}
                          />
                          <p className="text-xs text-muted-foreground">Lower values = faster animations</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="text-sm font-medium mb-2">Reference String</h3>

                      <div className="space-y-2">
                        <Label htmlFor="manualReference">Manual Reference String</Label>
                        <Input
                          id="manualReference"
                          placeholder="e.g., 1,2,3,4,1,2,5,1,2,3,4,5"
                          value={manualReference}
                          onChange={(e) => setManualReference(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Enter page numbers separated by commas</p>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Or Generate Random References</h4>

                        <div className="space-y-2">
                          <Label htmlFor="referenceLength">Reference Length</Label>
                          <Input
                            id="referenceLength"
                            type="number"
                            min="1"
                            max="100"
                            value={referenceLength}
                            onChange={(e) => setReferenceLength(Number.parseInt(e.target.value) || 20)}
                          />
                        </div>

                        <div className="space-y-2 mt-2">
                          <Label htmlFor="maxPageNumber">Max Page Number</Label>
                          <Input
                            id="maxPageNumber"
                            type="number"
                            min="1"
                            max="20"
                            value={maxPageNumber}
                            onChange={(e) => setMaxPageNumber(Number.parseInt(e.target.value) || 10)}
                          />
                        </div>

                        <Button className="w-full mt-2" variant="outline" onClick={handleGenerateReferences}>
                          Generate References
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleRunComparison}>
                    Compare All Algorithms
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="visualization" className="mt-6">
          <Tabs value={visualizationTab} onValueChange={setVisualizationTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Basic Visualization</TabsTrigger>
              <TabsTrigger value="heatmap">Access Heatmap</TabsTrigger>
              <TabsTrigger value="eviction">Eviction Log</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Memory Frames</CardTitle>
                    <CardDescription>Current state of physical memory frames</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AnimatedMemoryFrames showAnimations={showAnimations} animationSpeed={animationSpeed} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Reference String</CardTitle>
                    <CardDescription>Sequence of page references</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AnimatedReferenceString showAnimations={showAnimations} animationSpeed={animationSpeed} />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Access History</CardTitle>
                  <CardDescription>Detailed record of page accesses</CardDescription>
                </CardHeader>
                <CardContent>
                  <AnimatedAccessHistory showAnimations={showAnimations} animationSpeed={animationSpeed} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="heatmap">
              <MemoryAccessHeatmap />
            </TabsContent>

            <TabsContent value="eviction">
              <EvictionLog />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="comparison" className="mt-6">
          <AlgorithmComparison />
        </TabsContent>

        <TabsContent value="explanation" className="mt-6">
          <div className="space-y-6">
            <AlgorithmExplanation />
            <AlgorithmStepExplainer />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
