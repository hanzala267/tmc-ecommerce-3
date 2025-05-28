"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Package,
  MapPin,
  CreditCard,
  Printer,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  shippingAddress: any;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  createdAt: string;
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      size: string;
      images: string[];
    };
  }>;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        throw new Error("Failed to fetch order");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "PROCESSING":
        return "bg-purple-100 text-purple-800";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-emerald-900 mb-4">
            Order not found
          </h1>
          <Link href="/orders">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              View All Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <div className="bg-emerald-800 text-white py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-400 mr-4" />
              <div>
                <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
                <p className="text-emerald-100">Order #{order.orderNumber}</p>
              </div>
            </div>
            <p className="text-emerald-100">
              Thank you for your order. We'll send you updates as it progresses.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center justify-between">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Order Status
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0) +
                        order.status.slice(1).toLowerCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-700">Order Number:</span>
                      <span className="font-bold text-emerald-900">
                        {order.orderNumber}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-700">Order Date:</span>
                      <span className="font-medium text-emerald-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-700">Payment Status:</span>
                      <Badge
                        variant={
                          order.paymentStatus === "PAID"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {order.paymentStatus.charAt(0) +
                          order.paymentStatus.slice(1).toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-emerald-900">
                    Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.orderItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-4 p-4 border border-emerald-100 rounded-lg"
                      >
                        <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <span className="text-emerald-600 font-bold">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-emerald-900">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-emerald-600">
                            {item.product.size}
                          </p>
                          <p className="text-sm text-gray-500">
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
                </CardContent>
              </Card>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium text-emerald-900">
                      {order.shippingAddress.firstName}{" "}
                      {order.shippingAddress.lastName}
                    </p>
                    <p className="text-emerald-700">
                      {order.shippingAddress.address}
                    </p>
                    <p className="text-emerald-700">
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}{" "}
                      {order.shippingAddress.zipCode}
                    </p>
                    <p className="text-emerald-700">
                      {order.shippingAddress.phone}
                    </p>
                    <p className="text-emerald-700">
                      {order.shippingAddress.email}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {order.notes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-emerald-200">
                  <CardHeader>
                    <CardTitle className="text-emerald-900">
                      Order Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-emerald-700">{order.notes}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-emerald-200 sticky top-4">
                <CardHeader>
                  <CardTitle className="text-emerald-900">
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-emerald-700">
                      <span>Subtotal</span>
                      <span>PKR {order.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>Shipping</span>
                      <span className="text-green-600">FREE</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold text-emerald-900">
                    <span>Total</span>
                    <span>PKR {order.totalAmount.toLocaleString()}</span>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-emerald-600" />
                      <div>
                        <h4 className="font-medium text-emerald-900">
                          Payment Method
                        </h4>
                        <p className="text-sm text-emerald-700">
                          {order.paymentMethod === "COD"
                            ? "Cash on Delivery"
                            : order.paymentMethod}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button
                      onClick={printReceipt}
                      variant="outline"
                      className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print Receipt
                    </Button>

                    <Link href="/orders">
                      <Button
                        variant="outline"
                        className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                      >
                        View All Orders
                      </Button>
                    </Link>

                    <Link href="/products">
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
