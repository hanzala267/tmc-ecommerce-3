"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BarChart3, TrendingUp, Download, Package, Users, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface ReportData {
  totalRevenue: number
  totalOrders: number
  totalUsers: number
  totalProducts: number
  monthlyRevenue: Array<{ month: string; revenue: number }>
  topProducts: Array<{ name: string; sales: number; revenue: number }>
  ordersByStatus: Array<{ status: string; count: number }>
  usersByRole: Array<{ role: string; count: number }>
}

export function ReportsTab() {
  const { toast } = useToast()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState("last30days")

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/reports?range=${dateRange}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error("Error fetching report data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch report data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = async (format: string) => {
    try {
      const response = await fetch(`/api/admin/reports/export?format=${format}&range=${dateRange}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `tmc-report-${dateRange}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Success",
          description: `Report exported as ${format.toUpperCase()}`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export report",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="text-center py-16 text-emerald-600">
        <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p>No report data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Business Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-48 border-emerald-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="last90days">Last 90 Days</SelectItem>
                  <SelectItem value="lastyear">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => exportReport("csv")}
                className="border-emerald-600 text-emerald-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => exportReport("pdf")}
                className="border-emerald-600 text-emerald-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-emerald-900">PKR {reportData.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-full bg-emerald-100">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-sm font-medium">Total Orders</p>
                  <p className="text-2xl font-bold text-emerald-900">{reportData.totalOrders}</p>
                </div>
                <div className="p-3 rounded-full bg-emerald-100">
                  <ShoppingCart className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-sm font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-emerald-900">{reportData.totalUsers}</p>
                </div>
                <div className="p-3 rounded-full bg-emerald-100">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-sm font-medium">Total Products</p>
                  <p className="text-2xl font-bold text-emerald-900">{reportData.totalProducts}</p>
                </div>
                <div className="p-3 rounded-full bg-emerald-100">
                  <Package className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts and Tables */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-900">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.topProducts.map((product, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                  <div>
                    <p className="font-medium text-emerald-900">{product.name}</p>
                    <p className="text-sm text-emerald-600">{product.sales} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-900">PKR {product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-900">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.ordersByStatus.map((status, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                  <div>
                    <p className="font-medium text-emerald-900 capitalize">{status.status.toLowerCase()}</p>
                  </div>
                  <div>
                    <p className="font-bold text-emerald-900">{status.count} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="border-emerald-200 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-emerald-900">Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.monthlyRevenue.map((month, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                  <div>
                    <p className="font-medium text-emerald-900">{month.month}</p>
                  </div>
                  <div>
                    <p className="font-bold text-emerald-900">PKR {month.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
