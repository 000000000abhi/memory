"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PageReplacementSimulator from "./page-replacement-simulator"
import PageTableVisualization from "./page-table-visualization"
import SwapSpaceVisualization from "./swap-space-visualization"
import TlbAnalytics from "./tlb-analytics"
import MemoryAnalytics from "./memory-analytics"
import DemandPagingSimulation from "./demand-paging-simulation"
import MemoryFragmentationManagement from "./memory-fragmentation-management"
import MemoryAccessAnalyzer from "./memory-access-analyzer.tsx"
import MemoryWorkloadGenerator from "./memory-workload-generator" // Import the new component

export default function MainDashboard() {
  const [activeTab, setActiveTab] = useState("simulator")

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-9">
          {" "}
          {/* Update to 9 columns */}
          <TabsTrigger value="simulator">Simulator</TabsTrigger>
          <TabsTrigger value="page-table">Page Table</TabsTrigger>
          <TabsTrigger value="swap-space">Swap Space</TabsTrigger>
          <TabsTrigger value="tlb-analytics">TLB Analytics</TabsTrigger>
          <TabsTrigger value="memory-analytics">Memory Analytics</TabsTrigger>
          <TabsTrigger value="demand-paging">Demand Paging</TabsTrigger>
          <TabsTrigger value="fragmentation">Fragmentation</TabsTrigger>
          <TabsTrigger value="access-patterns">Access Patterns</TabsTrigger>
          <TabsTrigger value="workload-generator">Workload Generator</TabsTrigger> {/* Add this tab */}
        </TabsList>

        <TabsContent value="simulator" className="mt-6">
          <PageReplacementSimulator />
        </TabsContent>

        <TabsContent value="page-table" className="mt-6">
          <PageTableVisualization />
        </TabsContent>

        <TabsContent value="swap-space" className="mt-6">
          <SwapSpaceVisualization />
        </TabsContent>

        <TabsContent value="tlb-analytics" className="mt-6">
          <TlbAnalytics />
        </TabsContent>

        <TabsContent value="memory-analytics" className="mt-6">
          <MemoryAnalytics />
        </TabsContent>

        <TabsContent value="demand-paging" className="mt-6">
          <DemandPagingSimulation />
        </TabsContent>

        <TabsContent value="fragmentation" className="mt-6">
          <MemoryFragmentationManagement />
        </TabsContent>

        <TabsContent value="access-patterns" className="mt-6">
          <MemoryAccessAnalyzer />
        </TabsContent>

        {/* Add this new tab content */}
        <TabsContent value="workload-generator" className="mt-6">
          <MemoryWorkloadGenerator />
        </TabsContent>
      </Tabs>

      {/* Main Dashboard Footer */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Virtual Memory Management Simulator</p>
            <p>© 2023 Memory Management Systems | Version 1.2.0</p> {/* Updated version number */}
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              onClick={() => window.print()}
            >
              Export Dashboard
            </button>
            <button
              className="px-3 py-1 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
              onClick={() => window.location.reload()}
            >
              Reset All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
