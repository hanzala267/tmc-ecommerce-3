"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Building, Package, ShoppingCart, TrendingUp, Clock, CheckCircle } from "lucide-react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BusinessDashboard() {
  const { data: session } = useSession()
  const [businessData, setBusinessData] = useState(null)
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role === "BUSINESS") {
      fetchBusinessData()
      fetchOrders()
    }
  }, [session])

  const fetchBusinessData = async () => {
    try {
      // Fetch business information
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching business data:", error)
      setIsLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  if (!session || session.user.role !== "BUSINESS") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-emerald-900 mb-4">Access Denied</h1>
          <p className="text-emerald-700">This page is only accessible to business users.</p>
        </div>
      </div>
    )
  }

  if (session.user.businessStatus !== "APPROVED") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
        <div className="bg-emerald-800 text-white py-12">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold mb-2">Business Dashboard</h1>
              <p className="text-emerald-100">Manage your business account</p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-yellow-200 bg-yellow-50 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-yellow-800 flex items-center">
                  <Clock className="h-6 w-6 mr-2" />
                  Application Under Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-yellow-700">
                    Your business application is currently being reviewed by our team. This process typically takes 2-3
                    business days.
                  </p>
                  <div className="bg-white border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">What happens next?</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Our team will review your submitted documents</li>
                      <li>• We may contact you if additional information is needed</li>
                      <li>• You'll receive an email notification once approved</li>
                      <li>• Approved accounts get access to bulk pricing and products</li>
                    </ul>
                  </div>
                  <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                    Status: {session.user.businessStatus || "Pending"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <div className="bg-emerald-800 text-white py-12">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-2">Business Dashboard</h1>
            <p className="text-emerald-100">Manage your business orders and account</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {[
            {
              title: "Total Orders",
              value: orders.length.toString(),
              icon: ShoppingCart,
              color: "text-blue-600",
            },
            {
              title: "This Month",
              value: orders
                .filter((order) => new Date(order.createdAt).getMonth() === new Date().getMonth())
                .length.toString(),
              icon: Package,
              color: "text-emerald-600",
            },
            {
              title: "Total Spent",
              value: `$${orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}`,
              icon: TrendingUp,
              color: "text-green-600",
            },
            {
              title: "Account Status",
              value: "Approved",
              icon: CheckCircle,
              color: "text-purple-600",
            },
          ].map((stat, index) => (
            <motion.div key={index} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-600 text-sm font-medium">{stat.title}</p>
                      <p className="text-2xl font-bold text-emerald-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-emerald-100 ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-emerald-100">
              <TabsTrigger value="orders" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                Recent Orders
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                Business Products
              </TabsTrigger>
              <TabsTrigger
                value="account"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                Account Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-emerald-900">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-8 text-emerald-600">
                      <ShoppingCart className="h-16 w-16 mx-auto mb-4" />
                      <p>No orders yet. Start shopping to see your orders here!</p>
                      <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700">Browse Products</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="border border-emerald-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-emerald-900">Order {order.orderNumber}</h4>
                              <p className="text-sm text-emerald-600">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-900">${order.totalAmount.toFixed(2)}</p>
                              <Badge className="bg-emerald-600">{order.status}</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-emerald-900">Business Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-emerald-600">
                    <Package className="h-16 w-16 mx-auto mb-4" />
                    <p className="mb-4">Access our exclusive business product catalog with bulk pricing.</p>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">View Business Products</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account">
              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Business Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-emerald-900">Account Benefits</h4>
                        <ul className="text-sm text-emerald-700 space-y-1 mt-2">
                          <li>• Access to bulk products (5kg, 10kg, 15kg, 20kg)</li>
                          <li>• Special business pricing discounts</li>
                          <li>• Priority customer support</li>
                          <li>• Dedicated account manager</li>
                          <li>• Flexible payment terms</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-emerald-900">Contact Information</h4>
                        <div className="text-sm text-emerald-700 space-y-1 mt-2">
                          <p>📧 business@tmc.com</p>
                          <p>📞 +1 (555) 123-4567</p>
                          <p>🕒 Mon-Fri: 9AM-6PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
