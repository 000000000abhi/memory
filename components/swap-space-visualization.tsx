"use client"

import { usePageReplacement } from "./page-replacement-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { useState, useEffect } from "react"

export default function SwapSpaceVisualization() {
  const { swapSpace, swapIns, swapOuts, pageTable } = usePageReplacement()
  const [timelineData, setTimelineData] = useState<any[]>([])

  // Prepare data for swap operations chart
  const swapData = [
    { name: "Swap In", value: swapIns },
    { name: "Swap Out", value: swapOuts },
  ]

  // Prepare data for swap space usage
  const totalPages = pageTable.length
  const swappedPages = swapSpace.filter((entry) => entry.swappedIn === null).length
  const swapUsagePercentage = totalPages > 0 ? (swappedPages / totalPages) * 100 : 0

  const swapUsageData = [
    { name: "Used", value: swappedPages },
    { name: "Free", value: totalPages - swappedPages },
  ]

  // Generate mock timeline data if no real data exists
  useEffect(() => {
    if (swapSpace.length === 0) {
      setTimelineData([])
      return
    }

    // Create a timeline with 10 points
    const mockData = Array.from({ length: 10 }, (_, i) => {
      // Simulate increasing swap activity over time
      const swapInsAtPoint = Math.floor((i * swapIns) / 10)
      const swapOutsAtPoint = Math.floor((i * swapOuts) / 10)

      return {
        time: `T${i + 1}`,
        swapIns: swapInsAtPoint,
        swapOuts: swapOutsAtPoint,
        active: swapOutsAtPoint - swapInsAtPoint,
      }
    })

    setTimelineData(mockData)
  }, [swapSpace, swapIns, swapOuts])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Swap Space</CardTitle>
            <CardDescription>Pages that have been swapped out to disk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page Number</TableHead>
                    <TableHead>Swapped Out</TableHead>
                    <TableHead>Swapped In</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Modified</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {swapSpace.length > 0 ? (
                    swapSpace.map((entry) => (
                      <TableRow key={entry.pageNumber}>
                        <TableCell>{entry.pageNumber}</TableCell>
                        <TableCell>{new Date(entry.swappedOut).toLocaleTimeString()}</TableCell>
                        <TableCell>
                          {entry.swappedIn ? new Date(entry.swappedIn).toLocaleTimeString() : "Still in swap"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              entry.swappedIn === null
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            }`}
                          >
                            {entry.swappedIn === null ? "In Swap" : "Returned to Memory"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              entry.modified
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {entry.modified ? "Yes" : "No"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No pages in swap space
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
            <CardTitle>Swap Operations</CardTitle>
            <CardDescription>Number of swap in and swap out operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={swapData}
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
                  <Bar dataKey="value" name="Operations" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Swap Space Simulation</CardTitle>
          <CardDescription>Visual representation of swap space activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Swap Space Usage</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={swapUsageData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Pages" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Swap Activity Timeline</h3>
              <div className="h-64">
                {timelineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timelineData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="swapIns" name="Swap Ins" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="swapOuts" name="Swap Outs" stroke="#8884d8" />
                      <Line type="monotone" dataKey="active" name="Active in Swap" stroke="#ff7300" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
                    <p className="text-gray-500 dark:text-gray-400">No swap activity to display</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Total swap operations: {swapIns + swapOuts}</p>
            <p>Pages currently in swap: {swappedPages}</p>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              onClick={() => window.print()}
            >
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
