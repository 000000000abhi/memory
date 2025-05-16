"use client"

import { useState } from "react"
import { usePageReplacement } from "./page-replacement-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

export default function PageTableVisualization() {
  const {
    pageTable,
    filterSwappedPages,
    setFilterSwappedPages,
    filterReferencedPages,
    setFilterReferencedPages,
    filterModifiedPages,
    setFilterModifiedPages,
    searchPageNumber,
    setSearchPageNumber,
  } = usePageReplacement()

  const [searchInput, setSearchInput] = useState<string>("")

  const handleSearch = () => {
    const pageNum = Number.parseInt(searchInput)
    if (!isNaN(pageNum) && pageNum >= 0) {
      setSearchPageNumber(pageNum)
    } else {
      setSearchPageNumber(null)
    }
  }

  const clearSearch = () => {
    setSearchPageNumber(null)
    setSearchInput("")
  }

  // Filter page table entries based on criteria
  const filteredPageTable = pageTable.filter((entry) => {
    // Apply search filter
    if (searchPageNumber !== null && entry.virtualPageNumber !== searchPageNumber) {
      return false
    }

    // Apply other filters
    if (filterSwappedPages && !entry.inSwap) return false
    if (filterReferencedPages && !entry.referenced) return false
    if (filterModifiedPages && !entry.modified) return false

    return true
  })

  // Prepare data for pie chart
  const presentPages = pageTable.filter((entry) => entry.present).length
  const swappedPages = pageTable.filter((entry) => entry.inSwap).length
  const notLoadedPages = pageTable.filter((entry) => !entry.present && !entry.inSwap).length

  const pieData = [
    { name: "Present", value: presentPages, color: "#22c55e" },
    { name: "Swapped", value: swappedPages, color: "#f59e0b" },
    { name: "Not Loaded", value: notLoadedPages, color: "#ef4444" },
  ]

  // Prepare data for referenced/modified pages
  const referencedPages = pageTable.filter((entry) => entry.referenced).length
  const modifiedPages = pageTable.filter((entry) => entry.modified).length

  const statusData = [
    { name: "Referenced", value: referencedPages, color: "#3b82f6" },
    { name: "Modified", value: modifiedPages, color: "#8b5cf6" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Page Table</CardTitle>
            <CardDescription>Maps virtual page numbers to physical frame numbers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="search-page">Search Page</Label>
                  <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input
                      id="search-page"
                      type="number"
                      placeholder="Page number"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <Button type="button" size="icon" onClick={handleSearch}>
                      <Search className="h-4 w-4" />
                    </Button>
                    {searchPageNumber !== null && (
                      <Button type="button" variant="outline" onClick={clearSearch}>
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="filter-swapped" checked={filterSwappedPages} onCheckedChange={setFilterSwappedPages} />
                  <Label htmlFor="filter-swapped">Swapped Pages</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="filter-referenced"
                    checked={filterReferencedPages}
                    onCheckedChange={setFilterReferencedPages}
                  />
                  <Label htmlFor="filter-referenced">Referenced Pages</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="filter-modified" checked={filterModifiedPages} onCheckedChange={setFilterModifiedPages} />
                  <Label htmlFor="filter-modified">Modified Pages</Label>
                </div>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Virtual Page</TableHead>
                    <TableHead>Physical Frame</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Referenced</TableHead>
                    <TableHead>Modified</TableHead>
                    <TableHead>In Swap</TableHead>
                    <TableHead>Last Accessed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPageTable.length > 0 ? (
                    filteredPageTable.map((entry) => (
                      <TableRow key={entry.virtualPageNumber}>
                        <TableCell>{entry.virtualPageNumber}</TableCell>
                        <TableCell>{entry.physicalFrameNumber !== null ? entry.physicalFrameNumber : "N/A"}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              entry.present
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {entry.present ? "Yes" : "No"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              entry.referenced
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {entry.referenced ? "Yes" : "No"}
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
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              entry.inSwap
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {entry.inSwap ? "Yes" : "No"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {entry.lastAccessed > 0 ? new Date(entry.lastAccessed).toLocaleTimeString() : "Never"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No page table entries match the current filters
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
            <CardTitle>Memory Usage Distribution</CardTitle>
            <CardDescription>Status of pages in memory and swap space</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Page Status</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>
              Total pages: {pageTable.length} | Present: {presentPages} | Swapped: {swappedPages} | Not loaded:{" "}
              {notLoadedPages}
            </p>
            <p>
              Referenced: {referencedPages} | Modified: {modifiedPages}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              Export Page Table
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
