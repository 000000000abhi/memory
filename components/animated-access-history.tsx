"use client"

import { usePageReplacement } from "./page-replacement-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { motion, AnimatePresence } from "framer-motion"

interface AnimatedAccessHistoryProps {
  animationSpeed?: number
  showAnimations: boolean
}

export default function AnimatedAccessHistory({
  animationSpeed = 500,
  showAnimations = true,
}: AnimatedAccessHistoryProps) {
  const { pageHistory, currentStep } = usePageReplacement()

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Page Access History</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Step</TableHead>
              <TableHead>Page</TableHead>
              <TableHead>Frame</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {pageHistory.map((entry, index) => (
                <motion.tr
                  key={index}
                  className={index === currentStep ? "bg-muted" : ""}
                  initial={showAnimations && index === currentStep ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: animationSpeed / 1000 }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{entry.pageNumber}</TableCell>
                  <TableCell>{entry.frameNumber !== null ? entry.frameNumber : "N/A"}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        entry.status === "hit"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : entry.status === "miss"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </span>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
