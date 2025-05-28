"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    size: string;
    images: string[];
    inStock: boolean;
    stockCount: number;
  };
}

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");

  useEffect(() => {
    if (session) {
      fetchCartItems();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const fetchCartItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        throw new Error("Failed to fetch cart items");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    // Check if new quantity exceeds stock
    if (newQuantity > item.product.stockCount) {
      toast({
        title: "Stock Limit Exceeded",
        description: `Only ${item.product.stockCount} units available in stock`,
        variant: "destructive",
      });
      return;
    }

    setUpdatingItem(itemId);

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.ok) {
        setItems(
          items.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update quantity");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update quantity",
        variant: "destructive",
      });
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdatingItem(itemId);

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItems(items.filter((item) => item.id !== itemId));
        window.dispatchEvent(new Event("cartUpdated"));
        toast({
          title: "Success",
          description: "Item removed from cart",
        });
      } else {
        throw new Error("Failed to remove item");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    } finally {
      setUpdatingItem(null);
    }
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const savings = items.reduce(
    (sum, item) =>
      sum +
      (item.product.originalPrice
        ? (item.product.originalPrice - item.product.price) * item.quantity
        : 0),
    0
  );
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  // Check if any items exceed stock or are out of stock
  const hasStockIssues = items.some(
    (item) =>
      !item.product.inStock ||
      item.product.stockCount <= 0 ||
      item.quantity > item.product.stockCount
  );

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 text-emerald-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-emerald-900 mb-4">
            Please login to view your cart
          </h2>
          <Link href="/auth/login">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3">
              Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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
            <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
            <p className="text-emerald-100">
              Review your items and proceed to checkout
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {items.length === 0 ? (
          // Empty Cart
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ShoppingBag className="h-24 w-24 text-emerald-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-emerald-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-emerald-700 mb-8">
              Add some delicious marinated chicken to get started!
            </p>
            <Link href="/products">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3">
                Continue Shopping
              </Button>
            </Link>
          </motion.div>
        ) : (
          // Cart with Items
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-emerald-200">
                  <CardHeader>
                    <CardTitle className="text-emerald-900 flex items-center">
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      Cart Items ({items.length})
                    </CardTitle>
                    {hasStockIssues && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                        <p className="text-red-700 text-sm">
                          Some items in your cart have stock issues. Please
                          review before checkout.
                        </p>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {items.map((item, index) => {
                      const exceedsStock =
                        item.quantity > item.product.stockCount;
                      const outOfStock =
                        !item.product.inStock || item.product.stockCount <= 0;

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`border rounded-lg p-4 ${
                            outOfStock || exceedsStock
                              ? "border-red-200 bg-red-50"
                              : "border-emerald-200"
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <Image
                                src={
                                  item.product.images[0] ||
                                  "/placeholder.svg?height=100&width=100&query=marinated chicken" ||
                                  "/placeholder.svg"
                                }
                                alt={item.product.name}
                                width={100}
                                height={100}
                                className="rounded-lg object-cover"
                              />
                              {(outOfStock || exceedsStock) && (
                                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                  <AlertTriangle className="h-6 w-6 text-red-500" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1">
                              <h3 className="font-semibold text-emerald-900">
                                {item.product.name}
                              </h3>
                              <p className="text-sm text-emerald-600 mb-2">
                                {item.product.description}
                              </p>

                              {/* Stock Status */}
                              <div className="mb-2">
                                {outOfStock ? (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    Out of Stock
                                  </Badge>
                                ) : exceedsStock ? (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    Exceeds Stock (Only{" "}
                                    {item.product.stockCount} available)
                                  </Badge>
                                ) : item.product.stockCount <= 5 ? (
                                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                    Only {item.product.stockCount} left in stock
                                  </Badge>
                                ) : (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    {item.product.stockCount} in stock
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-lg font-bold text-emerald-800">
                                  PKR {item.product.price.toLocaleString()}
                                </span>
                                {item.product.originalPrice && (
                                  <span className="text-sm text-gray-500 line-through">
                                    PKR{" "}
                                    {item.product.originalPrice.toLocaleString()}
                                  </span>
                                )}
                                {item.product.originalPrice && (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    Save PKR{" "}
                                    {(
                                      item.product.originalPrice -
                                      item.product.price
                                    ).toLocaleString()}
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      updateQuantity(item.id, item.quantity - 1)
                                    }
                                    disabled={
                                      outOfStock || updatingItem === item.id
                                    }
                                    className="h-8 w-8 p-0"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-12 text-center font-medium">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      updateQuantity(item.id, item.quantity + 1)
                                    }
                                    disabled={
                                      outOfStock ||
                                      updatingItem === item.id ||
                                      item.quantity >= item.product.stockCount
                                    }
                                    className="h-8 w-8 p-0"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-emerald-900">
                                    PKR{" "}
                                    {(
                                      item.product.price * item.quantity
                                    ).toLocaleString()}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removeItem(item.id)}
                                    disabled={updatingItem === item.id}
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                  >
                                    {updatingItem === item.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-emerald-200 sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-emerald-900">
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Promo Code */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-emerald-800">
                        Promo Code
                      </label>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="border-emerald-200"
                        />
                        <Button
                          variant="outline"
                          className="border-emerald-600 text-emerald-600"
                        >
                          <Tag className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-emerald-700">
                        <span>Subtotal</span>
                        <span>PKR {subtotal.toLocaleString()}</span>
                      </div>
                      {savings > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>You Save</span>
                          <span>-PKR {savings.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-emerald-700">
                        <span>Shipping</span>
                        <span className="text-green-600">FREE</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold text-emerald-900">
                      <span>Total</span>
                      <span>PKR {total.toLocaleString()}</span>
                    </div>

                    {/* Checkout Button */}
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 disabled:bg-gray-400"
                      disabled={hasStockIssues}
                      onClick={() => router.push("/checkout")}
                    >
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    {hasStockIssues && (
                      <p className="text-sm text-red-600 text-center">
                        Please resolve stock issues before proceeding to
                        checkout
                      </p>
                    )}

                    {/* Delivery Info */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <h4 className="font-medium text-emerald-900 mb-2">
                        Delivery Information
                      </h4>
                      <p className="text-sm text-emerald-700 mb-2">
                        📍 We deliver only in Faisalabad city
                      </p>
                      <p className="text-sm text-emerald-700">
                        💰 Cash on Delivery (COD) - Pay when you receive your
                        order
                      </p>
                    </div>

                    {/* Continue Shopping */}
                    <Link href="/products">
                      <Button
                        variant="outline"
                        className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                      >
                        Continue Shopping
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
