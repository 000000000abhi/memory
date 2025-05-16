"use client"

import { usePageReplacement } from "./page-replacement-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function TlbEntryDetail() {
  const { tlbEntries, selectedTlbEntry, setSelectedTlbEntry, frames } = usePageReplacement()

  if (selectedTlbEntry === null) {
    return null
  }

  const tlbEntry = tlbEntries[selectedTlbEntry]
  const mappedFrame =
    tlbEntry.pageNumber !== null ? frames.find((frame) => frame.pageNumber === tlbEntry.pageNumber) : null

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>TLB Entry {selectedTlbEntry} Details</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setSelectedTlbEntry(null)}>
            Close
          </Button>
        </div>
        <CardDescription>Translation Lookaside Buffer mapping details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-1">TLB Entry Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Entry Number:</span>
                  <span className="text-sm font-medium">{selectedTlbEntry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Virtual Page:</span>
                  <span className="text-sm font-medium">
                    {tlbEntry.pageNumber !== null ? tlbEntry.pageNumber : "Empty"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Physical Frame:</span>
                  <span className="text-sm font-medium">{mappedFrame ? mappedFrame.frameNumber : "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Last Accessed:</span>
                  <span className="text-sm font-medium">
                    {tlbEntry.lastAccessed > 0 ? new Date(tlbEntry.lastAccessed).toLocaleTimeString() : "Never"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-1">Translation Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Valid:</span>
                  <Badge className={tlbEntry.pageNumber !== null ? "bg-green-500" : "bg-red-500"}>
                    {tlbEntry.pageNumber !== null ? "Yes" : "No"}
                  </Badge>
                </div>
                {tlbEntry.pageNumber !== null && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Virtual Address:</span>
                      <span className="text-sm font-medium">
                        0x{(tlbEntry.pageNumber * 4096).toString(16).padStart(8, "0")}
                      </span>
                    </div>
                    {mappedFrame && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Physical Address:</span>
                        <span className="text-sm font-medium">
                          0x{(mappedFrame.frameNumber * 4096).toString(16).padStart(8, "0")}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-2">TLB Performance Impact</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This TLB entry provides fast address translation for page{" "}
              {tlbEntry.pageNumber !== null ? tlbEntry.pageNumber : "N/A"}. When this entry is hit, the memory access
              time is reduced by avoiding a page table lookup.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
