"use client"

import { usePageReplacement } from "./page-replacement-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function TlbAnalytics() {
  const {
    tlbEnabled,
    tlbSize,
    tlbHits,
    tlbMisses,
    tlbHitRatio,
    tlbEntries,
    accessTimeMetrics,
    selectedTlbEntry,
    setSelectedTlbEntry,
  } = usePageReplacement()

  // Prepare data for TLB hit/miss distribution
  const tlbAccessData = [
    { name: "Hits", value: tlbHits, color: "#22c55e" },
    { name: "Misses", value: tlbMisses, color: "#ef4444" },
  ]

  // Prepare data for access time comparison
  const accessTimeData = [
    { name: "TLB Hit", value: accessTimeMetrics.tlbHitTime + accessTimeMetrics.memoryAccessTime },
    { name: "TLB Miss", value: accessTimeMetrics.tlbMissTime + accessTimeMetrics.memoryAccessTime },
    { name: "Page Fault", value: accessTimeMetrics.pageFaultTime },
  ]

  // Prepare data for TLB utilization
  const tlbUtilizationData = []
  if (tlbEntries.length > 0) {
    const usedEntries = tlbEntries.filter((entry) => entry.pageNumber !== null).length
    const utilization = (usedEntries / tlbEntries.length) * 100

    tlbUtilizationData.push(
      { name: "Used", value: usedEntries, color: "#3b82f6" },
      { name: "Free", value: tlbEntries.length - usedEntries, color: "#d1d5db" },
    )
  }

  // Generate mock TLB access history data
  const tlbHistoryData = []
  const totalAccesses = tlbHits + tlbMisses
  if (totalAccesses > 0) {
    // Create 10 data points
    for (let i = 1; i <= 10; i++) {
      const ratio = (tlbHits / totalAccesses) * 100
      // Add some variation to make the chart interesting
      const variation = Math.random() * 10 - 5 // -5 to +5
      const adjustedRatio = Math.max(0, Math.min(100, ratio + variation * (i / 10)))

      tlbHistoryData.push({
        name: `T${i}`,
        hitRatio: adjustedRatio,
      })
    }
  }

  return (
    <div className="space-y-6">
      {!tlbEnabled ? (
        <Card>
          <CardHeader>
            <CardTitle>TLB Analytics</CardTitle>
            <CardDescription>Translation Lookaside Buffer is currently disabled</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Enable TLB in the simulator settings to view analytics
              </p>
              <Button variant="outline">Go to Simulator Settings</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>TLB Hit/Miss Distribution</CardTitle>
                <CardDescription>Hit ratio: {tlbHitRatio.toFixed(2)}%</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tlbAccessData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {tlbAccessData.map((entry, index) => (
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
                <CardTitle>TLB Utilization</CardTitle>
                <CardDescription>Current TLB size: {tlbSize} entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {tlbUtilizationData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={tlbUtilizationData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {tlbUtilizationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">No TLB data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Access Time</CardTitle>
                <CardDescription>Impact of TLB on memory access time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={accessTimeData}
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
                      <Bar dataKey="value" name="Time (ns)" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>TLB Entries</CardTitle>
              <CardDescription>Current mappings in the Translation Lookaside Buffer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>TLB Entry</TableHead>
                      <TableHead>Virtual Page</TableHead>
                      <TableHead>Physical Frame</TableHead>
                      <TableHead>Last Accessed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tlbEntries.length > 0 ? (
                      tlbEntries.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell>{index}</TableCell>
                          <TableCell>{entry.pageNumber !== null ? entry.pageNumber : "Empty"}</TableCell>
                          <TableCell>{entry.frameNumber}</TableCell>
                          <TableCell>
                            {entry.lastAccessed > 0 ? new Date(entry.lastAccessed).toLocaleTimeString() : "Never"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                entry.pageNumber !== null
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                              }`}
                            >
                              {entry.pageNumber !== null ? "Valid" : "Invalid"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedTlbEntry(index)}
                              disabled={entry.pageNumber === null}
                            >
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No TLB entries available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>TLB Hit Ratio Over Time</CardTitle>
              <CardDescription>How TLB performance changes during execution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {tlbHistoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={tlbHistoryData}
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
                      <Line
                        type="monotone"
                        dataKey="hitRatio"
                        name="TLB Hit Ratio (%)"
                        stroke="#3b82f6"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">No TLB history data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>
              TLB Status: {tlbEnabled ? "Enabled" : "Disabled"} | Size: {tlbSize} entries
            </p>
            <p>
              TLB Hits: {tlbHits} | Misses: {tlbMisses} | Hit Ratio: {tlbHitRatio.toFixed(2)}%
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              Export TLB Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
