"use client"

import { useState } from "react"
import { usePageReplacement } from "./page-replacement-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AlgorithmAnimationExplainer from "./algorithm-animation-explainer"

export default function AlgorithmExplanation() {
  const { algorithm } = usePageReplacement()
  const [activeTab, setActiveTab] = useState("animation")

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

  const getAlgorithmDescription = (alg: string) => {
    switch (alg) {
      case "fifo":
        return (
          <div className="space-y-4">
            <p>
              <strong>First-In-First-Out (FIFO)</strong> is one of the simplest page replacement algorithms. It works
              exactly as its name suggests: the first page that was brought into memory will be the first one to be
              replaced when a new page needs to be loaded.
            </p>
            <h3 className="text-lg font-medium">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>The system maintains a queue of all pages currently in memory, with the oldest page at the front.</li>
              <li>
                When a page fault occurs and all frames are full, the page at the front of the queue (the oldest) is
                selected for replacement.
              </li>
              <li>The new page is added to the rear of the queue.</li>
            </ol>
            <h3 className="text-lg font-medium">Advantages:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Simple to understand and implement</li>
              <li>Low overhead - no need to track when pages are accessed</li>
            </ul>
            <h3 className="text-lg font-medium">Disadvantages:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Does not consider page usage frequency or recency</li>
              <li>May remove frequently used pages just because they were loaded early</li>
              <li>
                Suffers from "Belady's anomaly" - increasing the number of frames can sometimes increase page faults
              </li>
            </ul>
          </div>
        )
      case "lru":
        return (
          <div className="space-y-4">
            <p>
              <strong>Least Recently Used (LRU)</strong> replaces the page that has not been used for the longest period
              of time. This algorithm is based on the principle of locality of reference - if a page has been used
              recently, it's likely to be used again soon.
            </p>
            <h3 className="text-lg font-medium">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>The system keeps track of when each page was last accessed.</li>
              <li>
                When a page fault occurs and all frames are full, the page that has not been used for the longest time
                is selected for replacement.
              </li>
              <li>Each time a page is accessed, its "last used" timestamp is updated.</li>
            </ol>
            <h3 className="text-lg font-medium">Advantages:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Generally performs better than FIFO</li>
              <li>Respects temporal locality</li>
              <li>Does not suffer from Belady's anomaly</li>
            </ul>
            <h3 className="text-lg font-medium">Disadvantages:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>More complex to implement than FIFO</li>
              <li>Requires tracking each memory access</li>
              <li>Can be expensive in terms of hardware or software overhead</li>
            </ul>
          </div>
        )
      case "opt":
        return (
          <div className="space-y-4">
            <p>
              <strong>Optimal (OPT)</strong>, also known as Belady's algorithm, replaces the page that will not be used
              for the longest period of time in the future. This is a theoretical algorithm that provides the best
              possible performance but requires future knowledge of the reference string.
            </p>
            <h3 className="text-lg font-medium">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>When a page fault occurs and all frames are full, the algorithm looks at future page references.</li>
              <li>It selects for replacement the page that will not be used for the longest time in the future.</li>
              <li>If a page will never be used again, it is an ideal candidate for replacement.</li>
            </ol>
            <h3 className="text-lg font-medium">Advantages:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Provides the lowest possible page fault rate</li>
              <li>Serves as a theoretical benchmark for other algorithms</li>
              <li>Does not suffer from Belady's anomaly</li>
            </ul>
            <h3 className="text-lg font-medium">Disadvantages:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Requires future knowledge of the reference string, which is typically not available in real systems
              </li>
              <li>Not implementable in practice for general-purpose computing</li>
              <li>Can only be used in special cases where the reference pattern is known in advance</li>
            </ul>
          </div>
        )
      case "clock":
        return (
          <div className="space-y-4">
            <p>
              <strong>Clock</strong> is an approximation of LRU that is more efficient to implement. It uses a circular
              list of pages in memory, with a "clock hand" pointing to the oldest page.
            </p>
            <h3 className="text-lg font-medium">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Each page has a "referenced" bit that is set to 1 when the page is accessed.</li>
              <li>
                When a page fault occurs, the "clock hand" scans in a circular fashion looking for a page with a
                referenced bit of 0.
              </li>
              <li>As it scans, it sets the referenced bit of each page it examines to 0.</li>
              <li>When it finds a page with a referenced bit of 0, that page is replaced.</li>
            </ol>
            <h3 className="text-lg font-medium">Advantages:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>More efficient than LRU while providing similar performance</li>
              <li>Only requires a single bit per page frame</li>
              <li>Does not need to move pages in a queue or update timestamps</li>
            </ul>
            <h3 className="text-lg font-medium">Disadvantages:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Not as accurate as LRU in identifying the least recently used page</li>
              <li>Performance depends on the pattern of reference bits</li>
              <li>May require multiple scans if many pages have their referenced bits set</li>
            </ul>
          </div>
        )
      case "nru":
        return (
          <div className="space-y-4">
            <p>
              <strong>Not Recently Used (NRU)</strong> is a simple approximation of LRU that categorizes pages into four
              classes based on their referenced and modified bits.
            </p>
            <h3 className="text-lg font-medium">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Each page has two status bits: Referenced (R) and Modified (M).</li>
              <li>
                Pages are classified into four classes:
                <ul className="list-disc list-inside ml-6">
                  <li>Class 0: not referenced, not modified (R=0, M=0)</li>
                  <li>Class 1: not referenced, modified (R=0, M=1)</li>
                  <li>Class 2: referenced, not modified (R=1, M=0)</li>
                  <li>Class 3: referenced, modified (R=1, M=1)</li>
                </ul>
              </li>
              <li>When a page fault occurs, NRU removes a page from the lowest non-empty class.</li>
              <li>Periodically (e.g., on a timer interrupt), all R bits are cleared.</li>
            </ol>
            <h3 className="text-lg font-medium">Advantages:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Simple to implement</li>
              <li>Requires only two bits per page</li>
              <li>Provides a reasonable approximation of LRU</li>
            </ul>
            <h3 className="text-lg font-medium">Disadvantages:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Less accurate than LRU</li>
              <li>Does not distinguish between pages within the same class</li>
              <li>Performance depends on the frequency of R bit clearing</li>
            </ul>
          </div>
        )
      case "random":
        return (
          <div className="space-y-4">
            <p>
              <strong>Random</strong> replacement simply selects a random page for replacement when a page fault occurs
              and all frames are full.
            </p>
            <h3 className="text-lg font-medium">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>When a page fault occurs and all frames are full, a random page is selected for replacement.</li>
              <li>No tracking of page usage or history is required.</li>
            </ol>
            <h3 className="text-lg font-medium">Advantages:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Extremely simple to implement</li>
              <li>No overhead for tracking page usage</li>
              <li>Can work surprisingly well in some cases, especially with a large number of frames</li>
            </ul>
            <h3 className="text-lg font-medium">Disadvantages:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>May replace frequently used pages</li>
              <li>Performance is unpredictable</li>
              <li>Generally performs worse than algorithms that consider page usage patterns</li>
            </ul>
          </div>
        )
      case "mlru":
        return (
          <div className="space-y-4">
            <p>
              <strong>Multi-level LRU (MLRU)</strong> is an extension of LRU that maintains multiple queues representing
              different levels of "hotness" for pages.
            </p>
            <h3 className="text-lg font-medium">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Pages are organized into multiple queues: typically "hot", "warm", and "cold".</li>
              <li>New pages enter the "cold" queue.</li>
              <li>When a page is accessed, it may be promoted to a higher-level queue.</li>
              <li>
                When a page fault occurs, pages are first evicted from the "cold" queue, then from "warm", and finally
                from "hot" if necessary.
              </li>
            </ol>
            <h3 className="text-lg font-medium">Advantages:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Better adaptation to different access patterns than simple LRU</li>
              <li>Protects frequently accessed pages from being evicted</li>
              <li>Can be tuned by adjusting promotion/demotion policies</li>
            </ul>
            <h3 className="text-lg font-medium">Disadvantages:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>More complex to implement than basic LRU</li>
              <li>Requires tuning of queue sizes and promotion policies</li>
              <li>May not perform well if access patterns change rapidly</li>
            </ul>
          </div>
        )
      case "lfu-lru":
        return (
          <div className="space-y-4">
            <p>
              <strong>LFU-LRU Hybrid</strong> combines aspects of Least Frequently Used (LFU) and Least Recently Used
              (LRU) algorithms to make replacement decisions.
            </p>
            <h3 className="text-lg font-medium">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Each page has a frequency counter that is incremented when the page is accessed.</li>
              <li>When a page fault occurs, the algorithm first identifies pages with the lowest frequency count.</li>
              <li>If multiple pages have the same frequency, LRU is used as a tie-breaker.</li>
            </ol>
            <h3 className="text-lg font-medium">Advantages:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Considers both frequency and recency of access</li>
              <li>Often performs better than either LFU or LRU alone</li>
              <li>Adapts well to various access patterns</li>
            </ul>
            <h3 className="text-lg font-medium">Disadvantages:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>More complex to implement</li>
              <li>Requires tracking both frequency counts and timestamps</li>
              <li>May still struggle with changing access patterns over time</li>
            </ul>
          </div>
        )
      case "fru":
        return (
          <div className="space-y-4">
            <p>
              <strong>Frequency + Recency + Usage (FRU)</strong> is an advanced algorithm that combines multiple metrics
              to make replacement decisions.
            </p>
            <h3 className="text-lg font-medium">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Each page is assigned a score based on three components:
                <ul className="list-disc list-inside ml-6">
                  <li>Frequency: How often the page has been accessed</li>
                  <li>Recency: How recently the page was accessed</li>
                  <li>Usage Pattern: Recent access history represented as a bit pattern</li>
                </ul>
              </li>
              <li>The components are weighted using parameters (α, β, γ) that can be tuned.</li>
              <li>When a page fault occurs, the page with the lowest score is selected for replacement.</li>
            </ol>
            <h3 className="text-lg font-medium">Advantages:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Highly adaptable through parameter tuning</li>
              <li>Considers multiple aspects of page usage</li>
              <li>Can outperform simpler algorithms in complex workloads</li>
            </ul>
            <h3 className="text-lg font-medium">Disadvantages:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Complex to implement and understand</li>
              <li>Requires careful tuning of weight parameters</li>
              <li>Higher computational overhead</li>
            </ul>
          </div>
        )
      default:
        return <p>No explanation available for this algorithm.</p>
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="animation">Animation</TabsTrigger>
          <TabsTrigger value="explanation">Explanation</TabsTrigger>
        </TabsList>

        <TabsContent value="animation">
          <AlgorithmAnimationExplainer />
        </TabsContent>

        <TabsContent value="explanation">
          <Card>
            <CardHeader>
              <CardTitle>{getAlgorithmName(algorithm)}</CardTitle>
              <CardDescription>Detailed explanation of how the algorithm works</CardDescription>
            </CardHeader>
            <CardContent>{getAlgorithmDescription(algorithm)}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
