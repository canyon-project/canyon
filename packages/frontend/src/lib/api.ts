// Mock API function to simulate fetching coverage data
// In a real application, this would be replaced with actual API calls

interface CoverageDataPoint {
  date: string
  coverage: number
  changedLinesCoverage: number
}

interface CoverageData {
  totalCount: number
  maxCoverage: number
  latestReportTime: string
  latestCoverage: number
  chartData: CoverageDataPoint[]
}

export async function fetchCoverageData(): Promise<CoverageData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Generate mock data
  const chartData: CoverageDataPoint[] = []
  const now = new Date()

  // Generate data for the last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Generate random coverage data between 50% and 95%
    const coverage = 50 + Math.random() * 45
    // Generate random changed lines coverage data between 40% and 90%
    const changedLinesCoverage = 40 + Math.random() * 50

    chartData.push({
      date: date.toISOString().split("T")[0],
      coverage: Number.parseFloat(coverage.toFixed(2)),
      changedLinesCoverage: Number.parseFloat(changedLinesCoverage.toFixed(2)),
    })
  }

  // Calculate statistics
  const totalCount = 156
  const maxCoverage = Math.max(...chartData.map((item) => item.coverage))
  const latestReportTime = chartData[chartData.length - 1].date
  const latestCoverage = chartData[chartData.length - 1].coverage

  return {
    totalCount,
    maxCoverage,
    latestReportTime,
    latestCoverage,
    chartData,
  }
}

