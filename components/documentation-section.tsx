"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BookOpen, Code, FileText, Terminal, ArrowRight, Bookmark } from "lucide-react"

interface DocItem {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  content: React.ReactNode
}

export default function DocumentationSection() {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)

  const documentationItems: DocItem[] = [
    {
      id: "getting-started",
      title: "Getting Started",
      description: "Learn the basics of memory management and how to use the simulator",
      icon: <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Getting Started with DynamicBytes</h3>
          <p>
            Welcome to DynamicBytes, the advanced memory management visualization and simulation platform. This guide
            will help you get started with the basic features and concepts.
          </p>
          <h4 className="text-lg font-semibold mt-4">Understanding Memory Management</h4>
          <p>
            Memory management is a critical aspect of operating systems that involves controlling and coordinating
            computer memory, assigning portions called blocks to various running programs to optimize overall system
            performance.
          </p>
          <h4 className="text-lg font-semibold mt-4">Key Concepts</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Page:</strong> A fixed-size block of memory that is the unit of data transfer between main memory
              and secondary storage.
            </li>
            <li>
              <strong>Frame:</strong> A fixed-size block of physical memory that can contain a page.
            </li>
            <li>
              <strong>Page Fault:</strong> Occurs when a program accesses a page that is not currently in physical
              memory, requiring the operating system to retrieve it from secondary storage.
            </li>
            <li>
              <strong>Page Replacement Algorithm:</strong> The method used to decide which page to remove from memory
              when a new page needs to be loaded and no free frames are available.
            </li>
          </ul>
          <Button className="mt-4">Continue to Simulator Guide →</Button>
        </div>
      ),
    },
    {
      id: "algorithms",
      title: "Page Replacement Algorithms",
      description: "Detailed explanations of different page replacement strategies",
      icon: <Code className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Page Replacement Algorithms</h3>
          <p>
            Page replacement algorithms are designed to manage the limited physical memory by deciding which pages to
            keep in memory and which to replace when new pages need to be loaded.
          </p>
          <Tabs defaultValue="fifo">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="fifo">FIFO</TabsTrigger>
              <TabsTrigger value="lru">LRU</TabsTrigger>
              <TabsTrigger value="opt">OPT</TabsTrigger>
              <TabsTrigger value="ai">AI/ML</TabsTrigger>
            </TabsList>
            <TabsContent value="fifo" className="space-y-4">
              <h4 className="text-lg font-semibold">First-In-First-Out (FIFO)</h4>
              <p>
                The FIFO algorithm replaces the oldest page in memory. It maintains a queue of pages, with the oldest
                page at the front of the queue.
              </p>
              <h5 className="font-medium mt-2">Advantages:</h5>
              <ul className="list-disc pl-5">
                <li>Simple to implement and understand</li>
                <li>Low overhead</li>
              </ul>
              <h5 className="font-medium mt-2">Disadvantages:</h5>
              <ul className="list-disc pl-5">
                <li>Does not consider page usage frequency</li>
                <li>Can lead to Belady's anomaly</li>
              </ul>
            </TabsContent>
            <TabsContent value="lru" className="space-y-4">
              <h4 className="text-lg font-semibold">Least Recently Used (LRU)</h4>
              <p>
                The LRU algorithm replaces the page that has not been used for the longest period of time. It requires
                tracking when each page was last accessed.
              </p>
              <h5 className="font-medium mt-2">Advantages:</h5>
              <ul className="list-disc pl-5">
                <li>Good performance in most cases</li>
                <li>Adapts to changing access patterns</li>
              </ul>
              <h5 className="font-medium mt-2">Disadvantages:</h5>
              <ul className="list-disc pl-5">
                <li>Higher implementation overhead</li>
                <li>Requires tracking page access times</li>
              </ul>
            </TabsContent>
            <TabsContent value="opt" className="space-y-4">
              <h4 className="text-lg font-semibold">Optimal (OPT)</h4>
              <p>
                The Optimal algorithm replaces the page that will not be used for the longest period of time in the
                future. This is a theoretical algorithm that requires future knowledge.
              </p>
              <h5 className="font-medium mt-2">Advantages:</h5>
              <ul className="list-disc pl-5">
                <li>Best possible performance (theoretical upper bound)</li>
                <li>No Belady's anomaly</li>
              </ul>
              <h5 className="font-medium mt-2">Disadvantages:</h5>
              <ul className="list-disc pl-5">
                <li>Requires future knowledge (not implementable in practice)</li>
                <li>Used mainly as a benchmark</li>
              </ul>
            </TabsContent>
            <TabsContent value="ai" className="space-y-4">
              <h4 className="text-lg font-semibold">AI/ML-Based Algorithms</h4>
              <p>
                AI/ML-based algorithms use machine learning techniques to predict future page accesses and make
                replacement decisions based on these predictions.
              </p>
              <h5 className="font-medium mt-2">Advantages:</h5>
              <ul className="list-disc pl-5">
                <li>Can adapt to complex access patterns</li>
                <li>Potentially better performance than traditional algorithms</li>
                <li>Continuous improvement through learning</li>
              </ul>
              <h5 className="font-medium mt-2">Disadvantages:</h5>
              <ul className="list-disc pl-5">
                <li>Higher computational overhead</li>
                <li>Requires training data</li>
                <li>May have unpredictable behavior in new scenarios</li>
              </ul>
            </TabsContent>
          </Tabs>
          <Button className="mt-4">Try in Simulator →</Button>
        </div>
      ),
    },
    {
      id: "workload-generator",
      title: "Memory Workload Generator",
      description: "Learn how to create and analyze realistic memory access patterns",
      icon: <Terminal className="h-6 w-6 text-green-600 dark:text-green-400" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Memory Workload Generator</h3>
          <p>
            The Memory Workload Generator allows you to create realistic memory access patterns based on common
            application behaviors for testing and analysis.
          </p>
          <h4 className="text-lg font-semibold mt-4">Workload Types</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Sequential Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Pages are accessed in sequential order, common in array traversals and file operations.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Random Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Pages are accessed randomly, simulating hash tables or random data structures.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Locality-Based</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Exhibits temporal and spatial locality, common in most real-world applications.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Loop Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Repeating access patterns, simulating loops in program execution.</p>
              </CardContent>
            </Card>
          </div>
          <h4 className="text-lg font-semibold mt-4">Using the Generator</h4>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Select a workload type or customize parameters</li>
            <li>Generate the pattern and analyze its characteristics</li>
            <li>Apply the pattern to the simulator or run algorithm comparisons</li>
            <li>Save profiles for future use</li>
          </ol>
          <Button className="mt-4">Open Workload Generator →</Button>
        </div>
      ),
    },
    {
      id: "ai-predictions",
      title: "AI Predictions",
      description: "Understanding the AI-powered page replacement algorithm",
      icon: <FileText className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">AI-Powered Page Replacement</h3>
          <p>
            Our AI-powered page replacement algorithm uses machine learning to predict future page accesses and make
            intelligent replacement decisions.
          </p>
          <h4 className="text-lg font-semibold mt-4">How It Works</h4>
          <p>
            The AI model analyzes historical page access patterns to identify recurring patterns and predict which pages
            are likely to be accessed in the near future. It considers factors such as:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Frequency of page access</li>
            <li>Recency of page access</li>
            <li>Temporal and spatial locality patterns</li>
            <li>Program phase behavior</li>
          </ul>
          <h4 className="text-lg font-semibold mt-4">Training the Model</h4>
          <p>
            You can train the AI model on your specific workloads to improve its prediction accuracy. The training
            process involves:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Collecting page access traces from your application</li>
            <li>Preprocessing the data to extract relevant features</li>
            <li>Training the model using supervised learning techniques</li>
            <li>Evaluating the model's performance against traditional algorithms</li>
          </ol>
          <h4 className="text-lg font-semibold mt-4">Feature Importance</h4>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <div className="space-y-2">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Recency</span>
                  <span className="text-sm font-medium">65%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full" style={{ width: "65%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Frequency</span>
                  <span className="text-sm font-medium">48%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full" style={{ width: "48%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Spatial Locality</span>
                  <span className="text-sm font-medium">37%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full" style={{ width: "37%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Program Phase</span>
                  <span className="text-sm font-medium">25%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full" style={{ width: "25%" }}></div>
                </div>
              </div>
            </div>
          </div>
          <Button className="mt-4">Try AI Predictions →</Button>
        </div>
      ),
    },
  ]

  return (
    <div className="w-full">
      {selectedDoc ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Documentation</h2>
            <Button variant="ghost" onClick={() => setSelectedDoc(null)}>
              Back to All Docs
            </Button>
          </div>
          <Card className="w-full">
            <CardContent className="pt-6">
              {documentationItems.find((item) => item.id === selectedDoc)?.content}
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button variant="outline" onClick={() => setSelectedDoc(null)}>
                Back to All Docs
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Bookmark className="h-4 w-4" /> Bookmark
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Documentation</h2>
            <Button variant="outline">View All Docs</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {documentationItems.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-700"
                onClick={() => setSelectedDoc(item.id)}
              >
                <CardHeader>
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" className="ml-auto">
                    Read More <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
