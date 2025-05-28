"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Eye,
  Printer,
  Search,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Filter,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  shippingAddress: any;
  notes?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      size: string;
      weight?: string;
      images: string[];
      stockCount: number;
      inStock: boolean;
    };
  }>;
}

export default function OrdersManagement() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user.firstName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.user.lastName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(
            (order) => new Date(order.createdAt) >= filterDate
          );
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(
            (order) => new Date(order.createdAt) >= filterDate
          );
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(
            (order) => new Date(order.createdAt) >= filterDate
          );
          break;
      }
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrder(orderId);
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders((prev) =>
          prev.map((order) => (order.id === orderId ? updatedOrder : order))
        );
        toast({
          title: "Success",
          description: `Order status updated to ${newStatus}${
            newStatus === "DELIVERED"
              ? ". Stock quantities have been reduced."
              : ""
          }`,
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrder(null);
    }
  };

  const updatePaymentStatus = async (
    orderId: string,
    newPaymentStatus: string
  ) => {
    try {
      setUpdatingOrder(orderId);
      const response = await fetch(`/api/orders/${orderId}/payment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders((prev) =>
          prev.map((order) => (order.id === orderId ? updatedOrder : order))
        );
        toast({
          title: "Success",
          description: `Payment status updated to ${newPaymentStatus}`,
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update payment status",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrder(null);
    }
  };

  const printReceipt = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const receiptHTML = generateReceiptHTML(order);
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const generateReceiptHTML = (order: Order) => {
    const itemsTotal = order.orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${order.orderNumber}</title>
          <style>
            body { 
              font-family: 'Arial', sans-serif; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px; 
              line-height: 1.6;
              color: #333;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #059669; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .logo { 
              font-size: 28px; 
              font-weight: bold; 
              color: #059669; 
              margin-bottom: 10px;
            }
            .tagline {
              color: #6b7280;
              font-style: italic;
              margin-bottom: 10px;
            }
            .receipt-title {
              font-size: 24px;
              color: #1f2937;
              margin-top: 20px;
            }
            .order-info { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 30px; 
              margin-bottom: 30px; 
            }
            .section { 
              margin-bottom: 25px; 
            }
            .section h3 { 
              color: #059669; 
              border-bottom: 2px solid #e5e7eb; 
              padding-bottom: 8px; 
              margin-bottom: 15px;
              font-size: 18px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              padding: 5px 0;
            }
            .info-label {
              font-weight: 600;
              color: #374151;
            }
            .info-value {
              color: #1f2937;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 25px; 
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            th, td { 
              padding: 12px; 
              text-align: left; 
              border-bottom: 1px solid #e5e7eb; 
            }
            th { 
              background-color: #f9fafb; 
              font-weight: 600;
              color: #374151;
            }
            .product-name {
              font-weight: 600;
              color: #1f2937;
            }
            .product-details {
              color: #6b7280;
              font-size: 14px;
            }
            .total-section {
              background-color: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 25px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding: 5px 0;
            }
            .total-label {
              font-weight: 500;
            }
            .total-value {
              font-weight: 600;
            }
            .grand-total {
              font-size: 20px;
              font-weight: bold;
              color: #059669;
              border-top: 2px solid #059669;
              padding-top: 15px;
              margin-top: 15px;
            }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              padding-top: 25px; 
              border-top: 2px solid #e5e7eb; 
              color: #6b7280; 
            }
            .footer h4 {
              color: #059669;
              margin-bottom: 15px;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .status-pending { background-color: #fef3c7; color: #92400e; }
            .status-confirmed { background-color: #dbeafe; color: #1e40af; }
            .status-processing { background-color: #e0e7ff; color: #5b21b6; }
            .status-shipped { background-color: #c7d2fe; color: #4338ca; }
            .status-delivered { background-color: #d1fae5; color: #065f46; }
            .status-cancelled { background-color: #fee2e2; color: #dc2626; }
            @media print {
              body { margin: 0; padding: 15px; }
              .header { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">TMC - Premium Marinated Chicken</div>
            <div class="tagline">Fresh, Natural, and Bursting with Flavor</div>
            <div class="receipt-title">ORDER RECEIPT</div>
          </div>

          <div class="order-info">
            <div class="section">
              <h3>📋 Order Information</h3>
              <div class="info-row">
                <span class="info-label">Order Number:</span>
                <span class="info-value">${order.orderNumber}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Order Date:</span>
                <span class="info-value">${new Date(
                  order.createdAt
                ).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="status-badge status-${order.status.toLowerCase()}">${
      order.status
    }</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Method:</span>
                <span class="info-value">${
                  order.paymentMethod === "COD"
                    ? "Cash on Delivery"
                    : order.paymentMethod
                }</span>
              </div>
            </div>
            
            <div class="section">
              <h3>👤 Customer Information</h3>
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${order.user.firstName} ${
      order.user.lastName
    }</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${order.user.email}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Phone:</span>
                <span class="info-value">${
                  order.user.phone || "Not provided"
                }</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>📍 Shipping Address</h3>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px;">
              <strong>${order.shippingAddress.firstName} ${
      order.shippingAddress.lastName
    }</strong><br>
              ${order.shippingAddress.address}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${
      order.shippingAddress.zipCode
    }<br>
              📞 ${order.shippingAddress.phone}
            </div>
          </div>

          <div class="section">
            <h3>🛒 Order Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.orderItems
                  .map(
                    (item) => `
                  <tr>
                    <td>
                      <div class="product-name">${item.product.name}</div>
                      ${
                        item.product.weight
                          ? `<div class="product-details">Weight: ${item.product.weight}</div>`
                          : ""
                      }
                    </td>
                    <td>${item.product.size}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td>PKR ${item.price.toLocaleString()}</td>
                    <td><strong>PKR ${(
                      item.price * item.quantity
                    ).toLocaleString()}</strong></td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="total-section">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-value">PKR ${itemsTotal.toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Shipping:</span>
              <span class="total-value" style="color: #059669;">FREE</span>
            </div>
            <div class="total-row">
              <span class="total-label">Tax:</span>
              <span class="total-value">PKR 0</span>
            </div>
            <div class="total-row grand-total">
              <span>TOTAL AMOUNT:</span>
              <span>PKR ${order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          ${
            order.notes
              ? `
            <div class="section">
              <h3>📝 Order Notes</h3>
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                ${order.notes}
              </div>
            </div>
          `
              : ""
          }

          <div class="footer">
            <h4>Thank you for choosing TMC!</h4>
            <p>🌟 We appreciate your business and hope you enjoy our premium marinated chicken.</p>
            <p>📧 Contact: info@tmc-chicken.com | 📞 +92 (300) 123-4567</p>
            <p>🌐 Visit us: www.tmc-chicken.com</p>
            <p style="margin-top: 20px; font-size: 12px;">
              This receipt was generated on ${new Date().toLocaleString()}
            </p>
          </div>
        </body>
      </html>
    `;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Pending",
      },
      CONFIRMED: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Confirmed",
      },
      PROCESSING: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        label: "Processing",
      },
      SHIPPED: {
        color: "bg-indigo-100 text-indigo-800 border-indigo-200",
        label: "Shipped",
      },
      DELIVERED: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Delivered",
      },
      CANCELLED: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Cancelled",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      label: status,
    };
    return (
      <Badge className={`${config.color} border font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter((o) => o.status === "PENDING").length,
      processing: orders.filter((o) =>
        ["CONFIRMED", "PROCESSING"].includes(o.status)
      ).length,
      shipped: orders.filter((o) => o.status === "SHIPPED").length,
      delivered: orders.filter((o) => o.status === "DELIVERED").length,
      revenue: orders
        .filter((o) => o.status === "DELIVERED")
        .reduce((sum, o) => sum + o.totalAmount, 0),
      pendingPayments: orders
        .filter((o) => o.paymentStatus === "PENDING")
        .reduce((sum, o) => sum + o.totalAmount, 0),
      receivedPayments: orders
        .filter((o) => o.paymentStatus === "PAID")
        .reduce((sum, o) => sum + o.totalAmount, 0),
    };
    return stats;
  };

  const stats = getOrderStats();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {stats.total}
                </p>
              </div>
              <Package className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {stats.pending}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Processing</p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats.processing}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">
                  Pending Payments
                </p>
                <p className="text-xl font-bold text-orange-900">
                  PKR {stats.pendingPayments.toLocaleString()}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">
                  Received Payments
                </p>
                <p className="text-xl font-bold text-green-900">
                  PKR {stats.receivedPayments.toLocaleString()}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">
                  Total Revenue
                </p>
                <p className="text-xl font-bold text-emerald-900">
                  PKR {stats.revenue.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Order Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-4 w-4" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-emerald-200 focus:border-emerald-500"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-emerald-200 focus:border-emerald-500">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="border-emerald-200 focus:border-emerald-500">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={fetchOrders}
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900 flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Orders Management ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-emerald-600">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No orders found</p>
              <p className="text-sm text-gray-500">
                Try adjusting your filters or check back later
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Order</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Total</TableHead>
                    <TableHead className="font-semibold">Payment</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-emerald-50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-emerald-900">
                            {order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.orderItems.length} items
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.user.firstName} {order.user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <p className="font-bold text-emerald-900">
                          PKR {order.totalAmount.toLocaleString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {order.paymentMethod === "COD"
                              ? "Cash on Delivery"
                              : order.paymentMethod}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.paymentStatus}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedOrder(order)}
                                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-emerald-900">
                                  Order Details - {order.orderNumber}
                                </DialogTitle>
                              </DialogHeader>
                              {selectedOrder && (
                                <OrderDetails
                                  order={selectedOrder}
                                  onStatusUpdate={updateOrderStatus}
                                  onPaymentStatusUpdate={updatePaymentStatus}
                                  onPrint={() => printReceipt(selectedOrder)}
                                  updatingOrder={updatingOrder}
                                />
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => printReceipt(order)}
                            className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OrderDetails({
  order,
  onStatusUpdate,
  onPaymentStatusUpdate,
  onPrint,
  updatingOrder,
}: {
  order: Order;
  onStatusUpdate: (orderId: string, status: string) => void;
  onPaymentStatusUpdate: (orderId: string, paymentStatus: string) => void;
  onPrint: () => void;
  updatingOrder: string | null;
}) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [newPaymentStatus, setNewPaymentStatus] = useState(order.paymentStatus);

  const handleStatusUpdate = () => {
    if (newStatus !== order.status) {
      onStatusUpdate(order.id, newStatus);
    }
  };

  const handlePaymentStatusUpdate = () => {
    if (newPaymentStatus !== order.paymentStatus) {
      onPaymentStatusUpdate(order.id, newPaymentStatus);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Pending",
      },
      CONFIRMED: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Confirmed",
      },
      PROCESSING: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        label: "Processing",
      },
      SHIPPED: {
        color: "bg-indigo-100 text-indigo-800 border-indigo-200",
        label: "Shipped",
      },
      DELIVERED: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Delivered",
      },
      CANCELLED: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Cancelled",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      label: status,
    };
    return (
      <Badge className={`${config.color} border font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Pending",
      },
      PAID: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Paid",
      },
      FAILED: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Failed",
      },
      REFUNDED: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: "Refunded",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      label: status,
    };
    return (
      <Badge className={`${config.color} border font-medium`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="flex justify-between items-start bg-emerald-50 p-4 rounded-lg">
        <div>
          <h3 className="text-xl font-bold text-emerald-900">
            {order.orderNumber}
          </h3>
          <p className="text-emerald-600">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
          <div className="mt-2">{getStatusBadge(order.status)}</div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={onPrint}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
        </div>
      </div>

      {/* Order Info Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-lg text-emerald-900 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Name:</span>
              <span className="text-gray-900">
                {order.user.firstName} {order.user.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Email:</span>
              <span className="text-gray-900">{order.user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Phone:</span>
              <span className="text-gray-900">
                {order.user.phone || "Not provided"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Info */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-lg text-emerald-900 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium text-gray-900">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </p>
            <p className="text-gray-700">{order.shippingAddress.address}</p>
            <p className="text-gray-700">
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.zipCode}
            </p>
            <p className="text-gray-700">{order.shippingAddress.phone}</p>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-lg text-emerald-900 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Method:</span>
              <span className="text-gray-900">
                {order.paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : order.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Status:</span>
              {getPaymentStatusBadge(order.paymentStatus)}
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Total:</span>
              <span className="text-lg font-bold text-emerald-900">
                PKR {order.totalAmount.toLocaleString()}
              </span>
            </div>

            {/* Payment Status Management */}
            <div className="pt-3 border-t space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Update Payment Status:
              </label>
              <Select
                value={newPaymentStatus}
                onValueChange={setNewPaymentStatus}
              >
                <SelectTrigger className="border-emerald-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
              {newPaymentStatus !== order.paymentStatus && (
                <Button
                  size="sm"
                  onClick={handlePaymentStatusUpdate}
                  disabled={updatingOrder === order.id}
                  className="bg-emerald-600 hover:bg-emerald-700 w-full"
                >
                  {updatingOrder === order.id
                    ? "Updating..."
                    : "Update Payment Status"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Status Management */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-lg text-emerald-900">
              Update Order Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Change Status:
              </label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="border-emerald-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {newStatus !== order.status && (
                <Button
                  size="sm"
                  onClick={handleStatusUpdate}
                  disabled={updatingOrder === order.id}
                  className="bg-emerald-600 hover:bg-emerald-700 w-full"
                >
                  {updatingOrder === order.id ? "Updating..." : "Update Status"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-lg text-emerald-900">
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.orderItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-4 p-4 border border-emerald-100 rounded-lg"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Package className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {item.product.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Size: {item.product.size}
                  </p>
                  {item.product.weight && (
                    <p className="text-sm text-gray-600">
                      Weight: {item.product.weight}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Stock: {item.product.stockCount}
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">
                    Qty: {item.quantity}
                  </p>
                  <p className="text-sm text-gray-600">
                    PKR {item.price.toLocaleString()} each
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-900">
                    PKR {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>
                PKR{" "}
                {order.orderItems
                  .reduce((sum, item) => sum + item.price * item.quantity, 0)
                  .toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping:</span>
              <span className="text-green-600">FREE</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-emerald-900 pt-2 border-t">
              <span>Total:</span>
              <span>PKR {order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Notes */}
      {order.notes && (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-lg text-emerald-900">
              Order Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-gray-700">{order.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
