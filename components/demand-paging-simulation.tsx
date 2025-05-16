"use client"

import { useState } from "react"
import { usePageReplacement } from "./page-replacement-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DemandPagingSimulation() {
  const {
    accessPage,
    writeToPage,
    pageTable,
    frames,
    swapSpace,
    hits,
    misses,
    pageFaults,
    hitRatio,
    swapIns,
    swapOuts,
    accessTimeMetrics,
  } = usePageReplacement()

  const [pageNumber, setPageNumber] = useState<number>(0)
  const [pageData, setPageData] = useState<string>("")
  const [accessHistory, setAccessHistory] = useState<
    { pageNumber: number; operation: "read" | "write"; status: "hit" | "fault"; timestamp: number }[]
  >([])
  const [activeTab, setActiveTab] = useState<string>("simulation")

  const handleAccessPage = () => {
    const status = accessPage(pageNumber)
    setAccessHistory([
      ...accessHistory,
      {
        pageNumber,
        operation: "read",
        status: status === "hit" ? "hit" : "fault",
        timestamp: Date.now(),
      },
    ])
  }

  const handleWritePage = () => {
    if (!pageData.trim()) {
      return
    }

    const status = writeToPage(pageNumber, pageData)
    setAccessHistory([
      ...accessHistory,
      {
        pageNumber,
        operation: "write",
        status: status === "hit" ? "hit" : "fault",
        timestamp: Date.now(),
      },
    ])
    setPageData("")
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="simulation">Demand Paging Simulation</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="explanation">Explanation</TabsTrigger>
        </TabsList>

        <TabsContent value="simulation" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Demand Paging Simulation</CardTitle>
                  <CardDescription>Pages are loaded into memory only when they are needed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="pageNumber">Page Number</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="pageNumber"
                              type="number"
                              min="0"
                              value={pageNumber}
                              onChange={(e) => setPageNumber(Number.parseInt(e.target.value) || 0)}
                            />
                            <Button onClick={handleAccessPage}>Access Page</Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="pageData">Page Data (for write)</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="pageData"
                              value={pageData}
                              onChange={(e) => setPageData(e.target.value)}
                              placeholder="Enter data to write to page"
                            />
                            <Button onClick={handleWritePage}>Write Page</Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Memory Status</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Hits</div>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{hits}</div>
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
                          <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Swap Operations</div>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {swapIns + swapOuts}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Access History</h3>
                      <div className="rounded-md border overflow-auto max-h-64">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Time</TableHead>
                              <TableHead>Page</TableHead>
                              <TableHead>Operation</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {accessHistory.length > 0 ? (
                              [...accessHistory].reverse().map((entry, index) => (
                                <TableRow key={index}>
                                  <TableCell>{new Date(entry.timestamp).toLocaleTimeString()}</TableCell>
                                  <TableCell>{entry.pageNumber}</TableCell>
                                  <TableCell>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${
                                        entry.operation === "read"
                                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                          : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                      }`}
                                    >
                                      {entry.operation === "read" ? "Read" : "Write"}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${
                                        entry.status === "hit"
                                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                      }`}
                                    >
                                      {entry.status === "hit" ? "Hit" : "Fault"}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-4">
                                  No access history yet
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Demand Paging Explanation</CardTitle>
                  <CardDescription>How demand paging works</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Demand Paging</AlertTitle>
                      <AlertDescription>
                        Demand paging is a type of virtual memory management where pages are loaded into physical memory
                        only when they are accessed, rather than loading the entire process into memory at once.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Key Concepts</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>Pages are loaded only when they are needed (on demand)</li>
                        <li>Reduces initial loading time and memory usage</li>
                        <li>Uses page faults to trigger loading of pages from disk</li>
                        <li>Relies on the principle of locality of reference</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Page Fault Handling</h3>
                      <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>CPU tries to access a page not in memory</li>
                        <li>MMU generates a page fault</li>
                        <li>OS suspends the process</li>
                        <li>OS locates the page on disk</li>
                        <li>OS loads the page into a free frame</li>
                        <li>OS updates the page table</li>
                        <li>OS resumes the process</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Analyzing the performance of demand paging</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Memory Access Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Total Accesses:</span>
                      <span className="text-sm font-medium">{hits + misses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Hits:</span>
                      <span className="text-sm font-medium">{hits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Misses:</span>
                      <span className="text-sm font-medium">{misses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Page Faults:</span>
                      <span className="text-sm font-medium">{pageFaults}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Hit Ratio:</span>
                      <span className="text-sm font-medium">{hitRatio.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Swap Activity</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Swap Ins:</span>
                      <span className="text-sm font-medium">{swapIns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Swap Outs:</span>
                      <span className="text-sm font-medium">{swapOuts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Total Swap Operations:</span>
                      <span className="text-sm font-medium">{swapIns + swapOuts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Pages in Swap:</span>
                      <span className="text-sm font-medium">
                        {swapSpace.filter((entry) => entry.swappedIn === null).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-medium">Access Time Analysis</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Memory Access Time:</span>
                    <span className="text-sm font-medium">{accessTimeMetrics.memoryAccessTime} ns</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Page Fault Time:</span>
                    <span className="text-sm font-medium">{accessTimeMetrics.pageFaultTime} ns</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Effective Access Time:</span>
                    <span className="text-sm font-medium">{accessTimeMetrics.effectiveAccessTime.toFixed(2)} ns</span>
                  </div>
                </div>

                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  <AlertTitle className="text-blue-700 dark:text-blue-300">Effective Access Time Formula</AlertTitle>
                  <AlertDescription className="text-blue-600 dark:text-blue-400">
                    EAT = (1 - p) × memory_access_time + p × page_fault_time
                    <br />
                    Where p is the page fault rate: {(pageFaults / (hits + misses || 1)).toFixed(4)}
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="explanation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Demand Paging Explained</CardTitle>
              <CardDescription>Detailed explanation of demand paging concepts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">What is Demand Paging?</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Demand paging is a method of virtual memory management where pages are loaded into physical memory
                    only when they are needed, rather than loading the entire process into memory at once. This approach
                    optimizes memory usage and reduces the initial loading time of programs.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">How Demand Paging Works</h3>
                  <ol className="list-decimal pl-5 space-y-2 text-gray-600 dark:text-gray-400">
                    <li>
                      <strong>Initial State:</strong> When a process starts, none of its pages are loaded into memory.
                      The page table entries are marked as "not present" or "invalid."
                    </li>
                    <li>
                      <strong>Page Fault:</strong> When the CPU tries to access a page that is not in memory, the MMU
                      generates a page fault.
                    </li>
                    <li>
                      <strong>OS Intervention:</strong> The operating system takes control and suspends the process.
                    </li>
                    <li>
                      <strong>Page Loading:</strong> The OS locates the required page on disk and loads it into a free
                      frame in physical memory.
                    </li>
                    <li>
                      <strong>Page Table Update:</strong> The OS updates the page table to mark the page as present and
                      sets up the mapping to the physical frame.
                    </li>
                    <li>
                      <strong>Process Resumption:</strong> The OS resumes the process, and the instruction that caused
                      the page fault is re-executed, this time successfully.
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Benefits of Demand Paging</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
                    <li>
                      <strong>Reduced Memory Usage:</strong> Only the pages that are actually needed are loaded into
                      memory.
                    </li>
                    <li>
                      <strong>Faster Program Startup:</strong> Programs can start execution without waiting for all
                      pages to be loaded.
                    </li>
                    <li>
                      <strong>Better Multiprogramming:</strong> More processes can fit in memory simultaneously.
                    </li>
                    <li>
                      <strong>Efficient Resource Utilization:</strong> Memory is allocated only when needed, reducing
                      waste.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Challenges and Solutions</h3>
                  <div className="space-y-2 text-gray-600 dark:text-gray-400">
                    <p>
                      <strong>Thrashing:</strong> When a system spends more time paging than executing, it's called
                      thrashing. This happens when the working set of a process doesn't fit in memory.
                    </p>
                    <p>
                      <strong>Solution:</strong> Implement working set models or page fault frequency algorithms to
                      detect and prevent thrashing.
                    </p>
                    <p>
                      <strong>Page Replacement:</strong> When memory is full and a new page needs to be loaded, an
                      existing page must be replaced.
                    </p>
                    <p>
                      <strong>Solution:</strong> Use efficient page replacement algorithms like LRU, FIFO, or Clock to
                      minimize page faults.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>
              Total accesses: {hits + misses} | Hits: {hits} | Misses: {misses} | Page faults: {pageFaults}
            </p>
            <p>
              Hit ratio: {hitRatio.toFixed(2)}% | Effective access time:{" "}
              {accessTimeMetrics.effectiveAccessTime.toFixed(2)} ns
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              Export Data
            </Button>
            <Button variant="outline" onClick={() => setAccessHistory([])}>
              Clear History
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
