"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Building,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { BusinessApplicationsTab } from "../components/business-applications";
import OrdersManagement from "../components/orders-management";
import { ProductsManagementTab } from "../components/products-management";
import { UsersManagementTab } from "../components/users-management";

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingRevenue: number;
  receivedRevenue: number;
  deliveredRevenue: number;
  pendingBusinesses: number;
  recentOrders: any[];
}

// Stock Management Component (inline to avoid import issues)
function StockManagementTab() {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStock, setUpdatingStock] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateStock = async (productId: string, newStock: number) => {
    if (newStock < 0) {
      toast({
        title: "Error",
        description: "Stock cannot be negative",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdatingStock(productId);
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stockCount: newStock,
          inStock: newStock > 0,
        }),
      });

      if (response.ok) {
        setProducts((prev) =>
          prev.map((product) =>
            product.id === productId
              ? { ...product, stockCount: newStock, inStock: newStock > 0 }
              : product
          )
        );
        toast({
          title: "Success",
          description: `Stock updated to ${newStock} units`,
        });
      } else {
        throw new Error("Failed to update stock");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive",
      });
    } finally {
      setUpdatingStock(null);
    }
  };

  const adjustStock = (
    productId: string,
    currentStock: number,
    adjustment: number
  ) => {
    const newStock = currentStock + adjustment;
    updateStock(productId, newStock);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return {
        label: "Out of Stock",
        color: "bg-red-600",
        textColor: "text-red-600",
      };
    } else if (stock <= 5) {
      return {
        label: "Low Stock",
        color: "bg-yellow-600",
        textColor: "text-yellow-600",
      };
    } else {
      return {
        label: "In Stock",
        color: "bg-green-600",
        textColor: "text-green-600",
      };
    }
  };

  const lowStockProducts = products.filter((p) => p.stockCount <= 5);
  const outOfStockProducts = products.filter((p) => p.stockCount === 0);

  return (
    <div className="space-y-6">
      {/* Stock Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">
              {products.length}
            </div>
            <p className="text-xs text-emerald-600">
              Active products in inventory
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900">
              Low Stock
            </CardTitle>
            <Package className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">
              {lowStockProducts.length}
            </div>
            <p className="text-xs text-yellow-600">Products with ≤5 units</p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-900">
              Out of Stock
            </CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {outOfStockProducts.length}
            </div>
            <p className="text-xs text-red-600">Products with 0 units</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Management Table */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900 flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Stock Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-emerald-600">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="space-y-4">
                {products.map((product) => {
                  const stockStatus = getStockStatus(product.stockCount);
                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-emerald-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-emerald-900">
                            {product.name}
                          </p>
                          <p className="text-sm text-emerald-600">
                            {product.size}
                          </p>
                          {product.weight && (
                            <p className="text-sm text-emerald-600">
                              {product.weight}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Badge className={`${stockStatus.color} text-white`}>
                          {stockStatus.label}
                        </Badge>

                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              adjustStock(product.id, product.stockCount, -1)
                            }
                            disabled={
                              updatingStock === product.id ||
                              product.stockCount === 0
                            }
                          >
                            -
                          </Button>

                          <span className="w-12 text-center font-semibold">
                            {product.stockCount}
                          </span>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              adjustStock(product.id, product.stockCount, 1)
                            }
                            disabled={updatingStock === product.id}
                          >
                            +
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="font-medium">
                            PKR {product.price.toLocaleString()}
                          </p>
                          {updatingStock === product.id && (
                            <p className="text-xs text-emerald-600">
                              Updating...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    receivedRevenue: 0,
    deliveredRevenue: 0,
    pendingBusinesses: 0,
    recentOrders: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchDashboardStats();
    }
  }, [session]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-emerald-900 mb-4">
            Access Denied
          </h1>
          <p className="text-emerald-700">
            This page is only accessible to administrators.
          </p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Products",
      value: stats.totalProducts.toString(),
      change: "+2",
      icon: Package,
      color: "text-emerald-600",
    },
    {
      title: "Orders",
      value: stats.totalOrders.toString(),
      change: "+23%",
      icon: ShoppingCart,
      color: "text-purple-600",
    },
    {
      title: "Total Revenue",
      value: `PKR ${stats.totalRevenue.toLocaleString()}`,
      change: "+18%",
      icon: TrendingUp,
      color: "text-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      {/* Header */}
      <div className="bg-emerald-800 text-white py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-emerald-100">
              Manage your Marinzo business operations
            </p>
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
          {statsCards.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-600 text-sm font-medium">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-emerald-900">
                        {stat.value}
                      </p>
                      <p className="text-sm text-green-600">
                        {stat.change} from last month
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-full bg-emerald-100 ${stat.color}`}
                    >
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Revenue Breakdown Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="border-green-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">
                      Received Revenue
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      PKR {stats.receivedRevenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600">Payments collected</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-600 text-sm font-medium">
                      Pending Revenue
                    </p>
                    <p className="text-2xl font-bold text-yellow-900">
                      PKR {stats.pendingRevenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-yellow-600">Awaiting payment</p>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-600 text-sm font-medium">
                      Delivered Revenue
                    </p>
                    <p className="text-2xl font-bold text-emerald-900">
                      PKR {stats.deliveredRevenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-emerald-600">Completed orders</p>
                  </div>
                  <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-emerald-100">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="businesses"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                Business Apps
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                Orders
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                Products
              </TabsTrigger>
              <TabsTrigger
                value="stock"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                Stock
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                Users
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-emerald-200">
                  <CardHeader>
                    <CardTitle className="text-emerald-900 flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      Pending Business Applications
                      {stats.pendingBusinesses > 0 && (
                        <Badge className="ml-2 bg-yellow-600">
                          {stats.pendingBusinesses}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.pendingBusinesses === 0 ? (
                      <p className="text-emerald-600">
                        No pending applications
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-emerald-700">
                          {stats.pendingBusinesses} applications awaiting review
                        </p>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => {
                            // Find the tabs container and click the businesses tab
                            const tabsList =
                              document.querySelector('[role="tablist"]');
                            const businessTab = tabsList?.querySelector(
                              '[data-state="inactive"][value="businesses"]'
                            ) as HTMLElement;
                            if (businessTab) {
                              businessTab.click();
                            } else {
                              // If tab is already active or selector doesn't work, try alternative approach
                              const businessTabTrigger = document.querySelector(
                                '[value="businesses"]'
                              ) as HTMLElement;
                              businessTabTrigger?.click();
                            }
                          }}
                        >
                          Review Applications
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-emerald-200">
                  <CardHeader>
                    <CardTitle className="text-emerald-900">
                      Recent Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.recentOrders.length === 0 ? (
                      <p className="text-emerald-600">No recent orders</p>
                    ) : (
                      <div className="space-y-3">
                        {stats.recentOrders.slice(0, 3).map((order) => (
                          <div
                            key={order.id}
                            className="flex justify-between items-center p-2 bg-emerald-50 rounded"
                          >
                            <div>
                              <p className="font-medium text-emerald-900">
                                {order.orderNumber}
                              </p>
                              <p className="text-sm text-emerald-600">
                                {order.user.firstName} {order.user.lastName}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-900">
                                PKR {order.totalAmount.toLocaleString()}
                              </p>
                              <Badge className="bg-emerald-600">
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="businesses">
              <BusinessApplicationsTab />
            </TabsContent>

            <TabsContent value="orders">
              <OrdersManagement />
            </TabsContent>

            <TabsContent value="products">
              <ProductsManagementTab />
            </TabsContent>

            <TabsContent value="stock">
              <StockManagementTab />
            </TabsContent>

            <TabsContent value="users">
              <UsersManagementTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
