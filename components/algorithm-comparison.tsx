"use client"

import { usePageReplacement } from "./page-replacement-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function AlgorithmComparison() {
  const { comparisonResults, referenceString, frameCount } = usePageReplacement()

  const getAlgorithmName = (alg: string) => {
    switch (alg) {
      case "fifo":
        return "FIFO"
      case "lru":
        return "LRU"
      case "opt":
        return "OPT"
      case "clock":
        return "Clock"
      case "nru":
        return "NRU"
      case "random":
        return "Random"
      case "mlru":
        return "MLRU"
      case "lfu-lru":
        return "LFU-LRU"
      case "fru":
        return "FRU"
      default:
        return alg.toUpperCase()
    }
  }

  const getAlgorithmFullName = (alg: string) => {
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

  // Prepare data for charts
  const pageFaultData = comparisonResults.map((result) => ({
    name: getAlgorithmName(result.algorithm),
    faults: result.pageFaults,
  }))

  const hitRatioData = comparisonResults.map((result) => ({
    name: getAlgorithmName(result.algorithm),
    ratio: Number.parseFloat(result.hitRatio.toFixed(2)),
  }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Algorithm Comparison</CardTitle>
          <CardDescription>
            Compare performance of different page replacement algorithms with {frameCount} frames
            {referenceString.length > 0 && ` and ${referenceString.length} page references`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {comparisonResults.length > 0 ? (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Algorithm</TableHead>
                      <TableHead>Hits</TableHead>
                      <TableHead>Misses</TableHead>
                      <TableHead>Page Faults</TableHead>
                      <TableHead>Hit Ratio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonResults.map((result) => (
                      <TableRow key={result.algorithm}>
                        <TableCell className="font-medium">{getAlgorithmFullName(result.algorithm)}</TableCell>
                        <TableCell>{result.hits}</TableCell>
                        <TableCell>{result.misses}</TableCell>
                        <TableCell>{result.pageFaults}</TableCell>
                        <TableCell>{result.hitRatio.toFixed(2)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Page Faults Comparison</CardTitle>
                    <CardDescription>Lower is better</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={pageFaultData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="faults" name="Page Faults" fill="#ef4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Hit Ratio Comparison</CardTitle>
                    <CardDescription>Higher is better</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={hitRatioData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="ratio" name="Hit Ratio" fill="#22c55e" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-muted p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Analysis</h3>
                <p className="text-sm text-muted-foreground mb-2">Based on the comparison results:</p>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  <li>
                    <strong>Optimal (OPT)</strong> typically performs the best with the lowest page fault rate, but
                    requires future knowledge of page references.
                  </li>
                  <li>
                    <strong>LRU</strong> generally performs better than FIFO because it uses recency information.
                  </li>
                  <li>
                    <strong>Clock</strong> is a good approximation of LRU with lower implementation overhead.
                  </li>
                  <li>
                    <strong>Random</strong> can sometimes outperform FIFO on certain workloads despite its simplicity.
                  </li>
                  <li>
                    Performance differences become more pronounced with smaller frame counts relative to the working set
                    size.
                  </li>
                </ul>
              </div>

              {/* Heatmap Table */}
              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Heatmap: Page Fault Intensity</CardTitle>
                    <CardDescription>
                      Color intensity highlights the severity of page faults across algorithms.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Algorithm</TableHead>
                            <TableHead>Hits</TableHead>
                            <TableHead>Misses</TableHead>
                            <TableHead>Page Faults</TableHead>
                            <TableHead>Hit Ratio</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {comparisonResults.map((result) => {
                            const maxFaults = Math.max(...comparisonResults.map((r) => r.pageFaults))
                            const minFaults = Math.min(...comparisonResults.map((r) => r.pageFaults))
                            const range = maxFaults - minFaults || 1
                            const intensity = (result.pageFaults - minFaults) / range
                            const hue = 120 - intensity * 120 // 120 (green) to 0 (red)
                            const bgColor = `hsl(${hue}, 85%, 55%)`

                            return (
                              <TableRow key={result.algorithm}>
                                <TableCell className="font-semibold">{getAlgorithmName(result.algorithm)}</TableCell>
                                <TableCell>{result.hits}</TableCell>
                                <TableCell>{result.misses}</TableCell>
                                <TableCell style={{ backgroundColor: bgColor, color: "#fff", fontWeight: 600 }}>
                                  {result.pageFaults}
                                </TableCell>
                                <TableCell>{result.hitRatio.toFixed(2)}%</TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Legend */}
                    <div className="mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1 items-center">
                          <div className="w-5 h-5 rounded-sm" style={{ backgroundColor: "hsl(120, 85%, 55%)" }}></div>
                          <span>Low Faults</span>
                        </div>
                        <div className="flex gap-1 items-center ml-4">
                          <div className="w-5 h-5 rounded-sm" style={{ backgroundColor: "hsl(60, 85%, 55%)" }}></div>
                          <span>Moderate</span>
                        </div>
                        <div className="flex gap-1 items-center ml-4">
                          <div className="w-5 h-5 rounded-sm" style={{ backgroundColor: "hsl(0, 85%, 55%)" }}></div>
                          <span>High Faults</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No comparison data available. Run a comparison first.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
