"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Calendar,
  MapPin,
  CreditCard,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  Star,
  MessageSquare,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  shippingAddress: any;
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      images: string[];
      size: string;
    };
  }>;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function OrdersPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [existingReviews, setExistingReviews] = useState<
    Record<string, Review>
  >({});

  useEffect(() => {
    if (session) {
      fetchOrders();
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);

        // Fetch existing reviews for delivered orders
        const deliveredOrders = data.filter(
          (order: Order) => order.status.toLowerCase() === "delivered"
        );
        for (const order of deliveredOrders) {
          for (const item of order.orderItems) {
            await checkExistingReview(item.product.id);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingReview = async (productId: string) => {
    try {
      const response = await fetch(
        `/api/reviews/user-review?productId=${productId}`
      );
      if (response.ok) {
        const review = await response.json();
        if (review) {
          setExistingReviews((prev) => ({ ...prev, [productId]: review }));
        }
      }
    } catch (error) {
      console.error("Error checking existing review:", error);
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedProduct || !session) return;

    setIsSubmittingReview(true);

    try {
      const existingReview = existingReviews[selectedProduct.id];
      const method = existingReview ? "PUT" : "POST";
      const url = existingReview
        ? `/api/reviews/${existingReview.id}`
        : "/api/reviews";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      if (response.ok) {
        const review = await response.json();
        toast({
          title: "Success",
          description: existingReview
            ? "Review updated successfully"
            : "Review submitted successfully",
        });

        // Update existing reviews
        setExistingReviews((prev) => ({
          ...prev,
          [selectedProduct.id]: review,
        }));

        // Reset form
        setReviewDialogOpen(false);
        setSelectedProduct(null);
        setReviewRating(5);
        setReviewComment("");
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit review");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const openReviewDialog = (product: any) => {
    setSelectedProduct(product);
    const existingReview = existingReviews[product.id];
    if (existingReview) {
      setReviewRating(existingReview.rating);
      setReviewComment(existingReview.comment);
    } else {
      setReviewRating(5);
      setReviewComment("");
    }
    setReviewDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-600";
      case "confirmed":
      case "processing":
        return "bg-blue-600";
      case "shipped":
        return "bg-purple-600";
      case "delivered":
        return "bg-green-600";
      case "cancelled":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-emerald-900 mb-4">
            Please sign in to view your orders
          </h1>
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
          >
            <h1 className="text-3xl font-bold mb-2">My Orders</h1>
            <p className="text-emerald-100">Track and manage your orders</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Package className="h-24 w-24 text-emerald-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-emerald-900 mb-4">
              No orders yet
            </h2>
            <p className="text-emerald-700 mb-8">
              Start shopping to see your orders here!
            </p>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Browse Products
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-emerald-900 flex items-center">
                          <Package className="h-5 w-5 mr-2" />
                          Order {order.orderNumber}
                        </CardTitle>
                        <p className="text-sm text-emerald-600 mt-1">
                          Placed on{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge
                          className={`${getStatusColor(
                            order.status
                          )} text-white`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">
                            {order.status}
                          </span>
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-emerald-600 text-emerald-600"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-4"
                        >
                          <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Package className="h-8 w-8 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-emerald-900">
                              {item.product.name}
                            </h4>
                            <p className="text-sm text-emerald-600">
                              {item.product.size} • Quantity: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          {/* Review Button for Delivered Orders */}
                          {order.status.toLowerCase() === "delivered" && (
                            <div className="flex flex-col space-y-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                                onClick={() => openReviewDialog(item.product)}
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                {existingReviews[item.product.id]
                                  ? "Edit Review"
                                  : "Add Review"}
                              </Button>
                              {existingReviews[item.product.id] && (
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i <
                                        existingReviews[item.product.id].rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Order Summary */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="font-medium text-emerald-900">
                            ${order.totalAmount.toFixed(2)}
                          </p>
                          <p className="text-sm text-emerald-600">
                            Total Amount
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="font-medium text-emerald-900">
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.state}
                          </p>
                          <p className="text-sm text-emerald-600">
                            Delivery Address
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="font-medium text-emerald-900">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-emerald-600">Order Date</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Status Timeline */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <h4 className="font-medium text-emerald-900 mb-3">
                        Order Status
                      </h4>
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            [
                              "confirmed",
                              "processing",
                              "shipped",
                              "delivered",
                            ].includes(order.status.toLowerCase())
                              ? "bg-emerald-600"
                              : "bg-gray-300"
                          }`}
                        />
                        <span className="text-sm text-emerald-700">
                          Confirmed
                        </span>
                        <div className="flex-1 h-px bg-gray-300" />
                        <div
                          className={`w-3 h-3 rounded-full ${
                            ["processing", "shipped", "delivered"].includes(
                              order.status.toLowerCase()
                            )
                              ? "bg-emerald-600"
                              : "bg-gray-300"
                          }`}
                        />
                        <span className="text-sm text-emerald-700">
                          Processing
                        </span>
                        <div className="flex-1 h-px bg-gray-300" />
                        <div
                          className={`w-3 h-3 rounded-full ${
                            ["shipped", "delivered"].includes(
                              order.status.toLowerCase()
                            )
                              ? "bg-emerald-600"
                              : "bg-gray-300"
                          }`}
                        />
                        <span className="text-sm text-emerald-700">
                          Shipped
                        </span>
                        <div className="flex-1 h-px bg-gray-300" />
                        <div
                          className={`w-3 h-3 rounded-full ${
                            order.status.toLowerCase() === "delivered"
                              ? "bg-emerald-600"
                              : "bg-gray-300"
                          }`}
                        />
                        <span className="text-sm text-emerald-700">
                          Delivered
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {existingReviews[selectedProduct?.id]
                ? "Edit Your Review"
                : "Write a Review"}
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-emerald-900">
                  {selectedProduct.name}
                </h4>
                <p className="text-sm text-emerald-600">
                  {selectedProduct.size}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-2">
                  Rating
                </label>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-8 w-8 cursor-pointer transition-colors ${
                        i < reviewRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 hover:text-yellow-300"
                      }`}
                      onClick={() => setReviewRating(i + 1)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-2">
                  Comment
                </label>
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setReviewDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={isSubmittingReview || !reviewComment.trim()}
                  onClick={handleReviewSubmit}
                >
                  {isSubmittingReview ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {existingReviews[selectedProduct.id]
                        ? "Updating..."
                        : "Submitting..."}
                    </div>
                  ) : existingReviews[selectedProduct.id] ? (
                    "Update Review"
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
