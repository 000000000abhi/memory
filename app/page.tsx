"use client"

import { useState } from "react"
import { PageReplacementProvider } from "@/components/page-replacement-context"
import MainDashboard from "@/components/main-dashboard"
import AnimatedMemoryGrid from "@/components/animated-memory-grid"
import DocumentationSection from "@/components/documentation-section"
import AIPredictionsSection from "@/components/ai-predictions-section"
import { Button } from "@/components/ui/button"
import { ArrowRight, Cpu, Database, BarChart2 } from "lucide-react"

export default function Home() {
  const [activeSection, setActiveSection] = useState<string>("home")
  const [showFullSimulator, setShowFullSimulator] = useState(false)

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                DynamicBytes
              </span>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <Button
                  variant={activeSection === "home" ? "default" : "ghost"}
                  onClick={() => scrollToSection("home")}
                >
                  Home
                </Button>
                <Button
                  variant={activeSection === "features" ? "default" : "ghost"}
                  onClick={() => scrollToSection("features")}
                >
                  Features
                </Button>
                <Button
                  variant={activeSection === "documentation" ? "default" : "ghost"}
                  onClick={() => scrollToSection("documentation")}
                >
                  Documentation
                </Button>
                <Button
                  variant={activeSection === "ai-predictions" ? "default" : "ghost"}
                  onClick={() => scrollToSection("ai-predictions")}
                >
                  AI Predictions
                </Button>
                <Button
                  variant={activeSection === "simulator" ? "default" : "ghost"}
                  onClick={() => scrollToSection("simulator")}
                >
                  Simulator
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div id="home" className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-64 h-64 bg-cyan-400/10 dark:bg-cyan-600/10 rounded-full blur-3xl"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-16 pb-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-4">
                DynamicBytes
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Advanced memory management visualization and simulation platform with detailed analytics, page table
                visualization, and comprehensive performance metrics.
              </p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                  onClick={() => scrollToSection("simulator")}
                >
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-300 dark:border-gray-700"
                  onClick={() => scrollToSection("documentation")}
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-xl">
                  <AnimatedMemoryGrid rows={8} cols={8} className="max-w-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">99%</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">9+</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Algorithms</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">10x</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Performance</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">24/7</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Monitoring</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Powerful Features</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
            Our memory management simulator provides comprehensive tools for visualization, analysis, and optimization.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md hover:translate-y-[-4px] cursor-pointer"
            onClick={() => scrollToSection("simulator")}
          >
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 w-12 h-12 flex items-center justify-center mb-4">
              <Cpu className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Advanced Algorithms</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Visualize and compare multiple page replacement algorithms including LRU, FIFO, OPT, and AI-powered
              predictions.
            </p>
          </div>
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md hover:translate-y-[-4px] cursor-pointer"
            onClick={() => scrollToSection("simulator")}
          >
            <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3 w-12 h-12 flex items-center justify-center mb-4">
              <BarChart2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Real-time Analytics</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Comprehensive performance metrics and visualizations to understand memory management behavior.
            </p>
          </div>
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md hover:translate-y-[-4px] cursor-pointer"
            onClick={() => scrollToSection("simulator")}
          >
            <div className="rounded-full bg-cyan-100 dark:bg-cyan-900/30 p-3 w-12 h-12 flex items-center justify-center mb-4">
              <Database className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Workload Generation</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Create realistic memory access patterns based on common application behaviors for testing.
            </p>
          </div>
        </div>
      </div>

      {/* Documentation Section */}
      <div id="documentation" className="bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DocumentationSection />
        </div>
      </div>

      {/* AI Predictions Section */}
      <div id="ai-predictions" className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <AIPredictionsSection />
      </div>

      {/* Main Dashboard */}
      <div id="simulator" className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Memory Management Simulator</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Explore and analyze memory management techniques with our interactive simulator
                </p>
              </div>
              <Button
                variant={showFullSimulator ? "default" : "outline"}
                onClick={() => setShowFullSimulator(!showFullSimulator)}
              >
                {showFullSimulator ? "Compact View" : "Full Simulator"}
              </Button>
            </div>
          </div>
          <div
            className={`transition-all duration-500 ${showFullSimulator ? "max-h-[2000px]" : "max-h-[800px]"} overflow-hidden`}
          >
            <div className="p-6">
              <PageReplacementProvider>
                <MainDashboard />
              </PageReplacementProvider>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to optimize your memory management?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Start using our advanced simulation tools today and gain insights into your system's memory behavior.
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50"
            onClick={() => scrollToSection("simulator")}
          >
            Get Started Now
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">DynamicBytes</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Advanced memory management visualization and simulation platform.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Features
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection("simulator")
                    }}
                  >
                    Page Replacement
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection("simulator")
                    }}
                  >
                    TLB Analytics
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection("simulator")
                    }}
                  >
                    Memory Workloads
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection("ai-predictions")
                    }}
                  >
                    AI Predictions
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Resources
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection("documentation")
                    }}
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection("documentation")
                    }}
                  >
                    API Reference
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection("documentation")
                    }}
                  >
                    Tutorials
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection("documentation")
                    }}
                  >
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Contact
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Email
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
              © 2023 DynamicBytes. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
