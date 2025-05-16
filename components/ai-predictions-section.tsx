"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Brain, BarChart2, TrendingUp, RefreshCw } from "lucide-react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Sample data for the charts
const predictionAccuracyData = [
  { day: 1, accuracy: 78 },
  { day: 2, accuracy: 82 },
  { day: 3, accuracy: 85 },
  { day: 4, accuracy: 89 },
  { day: 5, accuracy: 91 },
  { day: 6, accuracy: 93 },
  { day: 7, accuracy: 94 },
]

const comparisonData = [
  { algorithm: "FIFO", hitRatio: 65, pageFaults: 35, avgAccessTime: 120 },
  { algorithm: "LRU", hitRatio: 78, pageFaults: 22, avgAccessTime: 85 },
  { algorithm: "OPT", hitRatio: 92, pageFaults: 8, avgAccessTime: 45 },
  { algorithm: "AI/ML", hitRatio: 89, pageFaults: 11, avgAccessTime: 52 },
]

const featureImportance = [
  { feature: "Recency", importance: 65 },
  { feature: "Frequency", importance: 48 },
  { feature: "Spatial Locality", importance: 37 },
  { feature: "Program Phase", importance: 25 },
]

const predictionData = [
  { time: "10:00", actual: 4, predicted: 5 },
  { time: "10:05", actual: 7, predicted: 6 },
  { time: "10:10", actual: 2, predicted: 3 },
  { time: "10:15", actual: 5, predicted: 5 },
  { time: "10:20", actual: 8, predicted: 7 },
  { time: "10:25", actual: 3, predicted: 4 },
  { time: "10:30", actual: 6, predicted: 6 },
]

export default function AIPredictionsSection() {
  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [modelAccuracy, setModelAccuracy] = useState(89)

  const startTraining = () => {
    setIsTraining(true)
    setTrainingProgress(0)

    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsTraining(false)
          setModelAccuracy((prev) => Math.min(prev + Math.floor(Math.random() * 3), 98))
          return 100
        }
        return prev + 5
      })
    }, 200)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI-Powered Page Replacement</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Machine learning model for intelligent page replacement decisions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Model Accuracy</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{modelAccuracy}%</p>
          </div>
          <Button onClick={startTraining} disabled={isTraining} className="flex items-center gap-2">
            {isTraining ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Training...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" /> Train Model
              </>
            )}
          </Button>
        </div>
      </div>

      {isTraining && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm font-medium">Training in progress...</p>
                <p className="text-sm font-medium">{trainingProgress}%</p>
              </div>
              <Progress value={trainingProgress} className="h-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Training on recent memory access patterns to improve prediction accuracy
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="predictions" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="features">Feature Importance</TabsTrigger>
          <TabsTrigger value="comparison">Algorithm Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions">
          <Card>
            <CardHeader>
              <CardTitle>Page Access Predictions</CardTitle>
              <CardDescription>Comparison of predicted vs. actual page accesses over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ChartContainer
                  config={{
                    actual: {
                      label: "Actual Page",
                      color: "hsl(var(--chart-1))",
                    },
                    predicted: {
                      label: "Predicted Page",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={predictionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis label={{ value: "Page Number", angle: -90, position: "insideLeft" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="var(--color-actual)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="var(--color-predicted)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                The model correctly predicted {predictionData.filter((d) => d.actual === d.predicted).length} out of{" "}
                {predictionData.length} page accesses.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Model Performance Over Time</CardTitle>
              <CardDescription>Prediction accuracy improvement with training</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ChartContainer
                  config={{
                    accuracy: {
                      label: "Accuracy (%)",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={predictionAccuracyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" label={{ value: "Training Day", position: "insideBottom", offset: -5 }} />
                      <YAxis domain={[50, 100]} label={{ value: "Accuracy (%)", angle: -90, position: "insideLeft" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="accuracy"
                        stroke="var(--color-accuracy)"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Initial accuracy: 78% | Current accuracy: {modelAccuracy}%
              </p>
              <Button variant="outline" size="sm">
                View Detailed Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Feature Importance</CardTitle>
              <CardDescription>Relative importance of different features in the prediction model</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featureImportance.map((feature) => (
                  <div key={feature.feature}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{feature.feature}</span>
                      <span className="text-sm font-medium">{feature.importance}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full"
                        style={{ width: `${feature.importance}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-2">Feature Descriptions</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <strong>Recency:</strong> How recently a page was accessed
                  </li>
                  <li>
                    <strong>Frequency:</strong> How often a page is accessed
                  </li>
                  <li>
                    <strong>Spatial Locality:</strong> Proximity to other accessed pages
                  </li>
                  <li>
                    <strong>Program Phase:</strong> Current execution phase of the program
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" size="sm">
                <TrendingUp className="mr-2 h-4 w-4" /> Analyze Feature Correlation
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Algorithm Comparison</CardTitle>
              <CardDescription>Performance metrics compared to traditional algorithms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3">Algorithm</th>
                      <th className="px-6 py-3">Hit Ratio (%)</th>
                      <th className="px-6 py-3">Page Faults (%)</th>
                      <th className="px-6 py-3">Avg. Access Time (ns)</th>
                      <th className="px-6 py-3">Relative Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((item) => (
                      <tr
                        key={item.algorithm}
                        className={`border-b dark:border-gray-700 ${
                          item.algorithm === "AI/ML" ? "bg-blue-50 dark:bg-blue-900/20" : ""
                        }`}
                      >
                        <td className="px-6 py-4 font-medium">
                          {item.algorithm}
                          {item.algorithm === "AI/ML" && (
                            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              Current
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">{item.hitRatio}%</td>
                        <td className="px-6 py-4">{item.pageFaults}%</td>
                        <td className="px-6 py-4">{item.avgAccessTime}</td>
                        <td className="px-6 py-4">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${
                                item.algorithm === "OPT"
                                  ? "bg-green-600 dark:bg-green-500"
                                  : item.algorithm === "AI/ML"
                                    ? "bg-blue-600 dark:bg-blue-500"
                                    : "bg-gray-600 dark:bg-gray-400"
                              }`}
                              style={{ width: `${(item.hitRatio / 92) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AI/ML performance is {Math.round((89 / 92) * 100)}% of theoretical optimal (OPT)
              </p>
              <Button variant="outline" size="sm">
                <BarChart2 className="mr-2 h-4 w-4" /> Run New Comparison
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
