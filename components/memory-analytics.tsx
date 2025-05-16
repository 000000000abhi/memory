"use client"

import { usePageReplacement } from "./page-replacement-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

export default function MemoryAnalytics() {
  const {
    hits,
    misses,
    pageFaults,
    hitRatio,
    swapIns,
    swapOuts,
    comparisonResults,
    internalFragmentation,
    externalFragmentation,
    pageHistory,
  } = usePageReplacement()

  // Prepare data for memory access distribution
  const accessData = [
    { name: "Hits", value: hits, color: "#22c55e" },
    { name: "Misses", value: misses, color: "#ef4444" },
  ]

  // Prepare data for page fault rate over time
  const faultHistoryData = []
  if (pageHistory.length > 0) {
    let faults = 0
    let total = 0

    for (let i = 0; i < pageHistory.length; i += 5) {
      // Group by 5 for readability
      const chunk = pageHistory.slice(i, i + 5)
      const chunkFaults = chunk.filter((entry) => entry.status === "fault").length

      faults += chunkFaults
      total += chunk.length

      faultHistoryData.push({
        name: `${i}-${Math.min(i + 4, pageHistory.length - 1)}`,
        rate: total > 0 ? (faults / total) * 100 : 0,
      })
    }
  }

  // Prepare data for algorithm comparison
  const algorithmData = comparisonResults.map((result) => ({
    name: result.algorithm.toUpperCase(),
    faults: result.pageFaults,
    hits: result.hits,
    hitRatio: result.hitRatio,
  }))

  // Prepare data for fragmentation
  const fragmentationData = [
    { name: "Internal", value: internalFragmentation },
    { name: "External", value: externalFragmentation },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Memory Access Distribution</CardTitle>
            <CardDescription>Hit ratio: {hitRatio.toFixed(2)}%</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={accessData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {accessData.map((entry, index) => (
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
            <CardTitle>Page Fault Rate Over Time</CardTitle>
            <CardDescription>How page fault rate changes during execution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={faultHistoryData}
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
                  <Line type="monotone" dataKey="rate" name="Fault Rate (%)" stroke="#ef4444" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Memory Fragmentation</CardTitle>
            <CardDescription>Internal and external fragmentation</CardDescription>
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
          <CardTitle>Algorithm Performance Comparison</CardTitle>
          <CardDescription>Comparing different page replacement algorithms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Page Faults by Algorithm</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={algorithmData}
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
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Hit Ratio by Algorithm</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={algorithmData}
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
                    <Bar dataKey="hitRatio" name="Hit Ratio (%)" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Detailed Algorithm Comparison</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Algorithm</TableHead>
                    <TableHead>Hits</TableHead>
                    <TableHead>Misses</TableHead>
                    <TableHead>Page Faults</TableHead>
                    <TableHead>Hit Ratio</TableHead>
                    <TableHead>Swap Ins</TableHead>
                    <TableHead>Swap Outs</TableHead>
                    <TableHead>Avg. Access Time (ns)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonResults.length > 0 ? (
                    comparisonResults.map((result) => (
                      <TableRow key={result.algorithm}>
                        <TableCell className="font-medium">{result.algorithm.toUpperCase()}</TableCell>
                        <TableCell>{result.hits}</TableCell>
                        <TableCell>{result.misses}</TableCell>
                        <TableCell>{result.pageFaults}</TableCell>
                        <TableCell>{result.hitRatio.toFixed(2)}%</TableCell>
                        <TableCell>{result.swapIns}</TableCell>
                        <TableCell>{result.swapOuts}</TableCell>
                        <TableCell>{result.avgAccessTime.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No comparison data available. Run a comparison first.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>
              Total accesses: {hits + misses} | Hits: {hits} | Misses: {misses} | Page faults: {pageFaults}
            </p>
            <p>
              Hit ratio: {hitRatio.toFixed(2)}% | Swap operations: {swapIns + swapOuts}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              onClick={() => window.print()}
            >
              Export Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
