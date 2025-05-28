"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, MapPin, User, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    size: string;
    images: string[];
    stockCount: number;
    inStock: boolean;
  };
}

// Faisalabad areas/towns
const faisalabadAreas = [
  "Allama Iqbal Town",
  "Batala Colony",
  "Canal Road",
  "Civil Lines",
  "D-Type Colony",
  "Faisal Town",
  "Ghulam Muhammad Abad",
  "Gulberg",
  "Jinnah Colony",
  "Kotwali Road",
  "Madina Town",
  "Model Town",
  "Narwala Road",
  "Peoples Colony",
  "Samanabad",
  "Sargodha Road",
  "Susan Road",
  "Warispura",
  "Other",
];

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    area: "",
    town: "",
    fullAddress: "",
    apartmentNumber: "",
    notes: "",
  });

  useEffect(() => {
    if (session) {
      fetchCartItems();
      // Pre-fill form with user data
      setFormData((prev) => ({
        ...prev,
        firstName: session.user.name?.split(" ")[0] || "",
        lastName: session.user.name?.split(" ")[1] || "",
        email: session.user.email || "",
      }));
    } else {
      router.push("/auth/login");
    }
  }, [session, router]);

  const fetchCartItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();

        // Check for stock issues
        const hasStockIssues = data.some(
          (item: CartItem) =>
            !item.product.inStock ||
            item.product.stockCount <= 0 ||
            item.quantity > item.product.stockCount
        );

        if (hasStockIssues) {
          toast({
            title: "Stock Issues Detected",
            description: "Please review your cart before proceeding",
            variant: "destructive",
          });
          router.push("/cart");
          return;
        }

        setItems(data);
        if (data.length === 0) {
          router.push("/cart");
        }
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
      router.push("/cart");
    } finally {
      setIsLoading(false);
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlacingOrder(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shippingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            city: "Faisalabad",
            area: formData.area,
            town: formData.town,
            fullAddress: formData.fullAddress,
            apartmentNumber: formData.apartmentNumber,
          },
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        const order = await response.json();
        toast({
          title: "Order placed successfully!",
          description: `Your order ${order.orderNumber} has been confirmed.`,
        });
        window.dispatchEvent(new Event("cartUpdated"));
        router.push(`/orders/${order.id}`);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to place order");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-emerald-900 mb-4">
            Please login to checkout
          </h1>
          <Link href="/auth/login">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-emerald-900 mb-4">
            Your cart is empty
          </h1>
          <Link href="/products">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Continue Shopping
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
            className="flex items-center"
          >
            <Link href="/cart" className="mr-4">
              <Button
                variant="outline"
                size="sm"
                className="border-white text-white hover:bg-white hover:text-emerald-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cart
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold mb-2">Checkout</h1>
              <p className="text-emerald-100">
                Complete your order - Delivery in Faisalabad only
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Delivery Notice */}
              <Card className="border-blue-200 bg-blue-50 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-blue-900">
                        Delivery Area
                      </h4>
                      <p className="text-sm text-blue-700">
                        We currently deliver only within Faisalabad city limits
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-emerald-800">
                          First Name *
                        </Label>
                        <Input
                          id="firstName"
                          placeholder="Enter first name"
                          value={formData.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          className="border-emerald-200 focus:border-emerald-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-emerald-800">
                          Last Name *
                        </Label>
                        <Input
                          id="lastName"
                          placeholder="Enter last name"
                          value={formData.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          className="border-emerald-200 focus:border-emerald-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-emerald-800">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter email address"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className="border-emerald-200 focus:border-emerald-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-emerald-800">
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="03XX-XXXXXXX"
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          className="border-emerald-200 focus:border-emerald-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-emerald-900 flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        Delivery Address (Faisalabad Only)
                      </h3>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="area" className="text-emerald-800">
                            Area/Locality *
                          </Label>
                          <Select
                            value={formData.area}
                            onValueChange={(value) =>
                              handleInputChange("area", value)
                            }
                          >
                            <SelectTrigger className="border-emerald-200 focus:border-emerald-500">
                              <SelectValue placeholder="Select your area" />
                            </SelectTrigger>
                            <SelectContent>
                              {faisalabadAreas.map((area) => (
                                <SelectItem key={area} value={area}>
                                  {area}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="town" className="text-emerald-800">
                            Town/Sector *
                          </Label>
                          <Input
                            id="town"
                            placeholder="e.g., Block A, Sector 1"
                            value={formData.town}
                            onChange={(e) =>
                              handleInputChange("town", e.target.value)
                            }
                            className="border-emerald-200 focus:border-emerald-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="fullAddress"
                          className="text-emerald-800"
                        >
                          Full Address *
                        </Label>
                        <Input
                          id="fullAddress"
                          placeholder="Street name, landmark, etc."
                          value={formData.fullAddress}
                          onChange={(e) =>
                            handleInputChange("fullAddress", e.target.value)
                          }
                          className="border-emerald-200 focus:border-emerald-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="apartmentNumber"
                          className="text-emerald-800"
                        >
                          House/Apartment Number *
                        </Label>
                        <Input
                          id="apartmentNumber"
                          placeholder="House #123, Apt #456, etc."
                          value={formData.apartmentNumber}
                          onChange={(e) =>
                            handleInputChange("apartmentNumber", e.target.value)
                          }
                          className="border-emerald-200 focus:border-emerald-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Order Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-emerald-800">
                        Order Notes (Optional)
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Any special instructions for delivery..."
                        value={formData.notes}
                        onChange={(e) =>
                          handleInputChange("notes", e.target.value)
                        }
                        className="border-emerald-200 focus:border-emerald-500 min-h-[100px]"
                      />
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-emerald-900 flex items-center">
                        <CreditCard className="h-5 w-5 mr-2" />
                        Payment Method
                      </h3>
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              💰
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-emerald-900">
                              Cash on Delivery (COD)
                            </h4>
                            <p className="text-sm text-emerald-700">
                              Pay when you receive your order in Faisalabad
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
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
                  {/* Order Items */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-3"
                      >
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <span className="text-emerald-600 font-bold">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-emerald-900 text-sm">
                            {item.product.name}
                          </h4>
                          <p className="text-xs text-emerald-600">
                            {item.product.size}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-900">
                            PKR{" "}
                            {(
                              item.product.price * item.quantity
                            ).toLocaleString()}
                          </p>
                          {item.product.originalPrice && (
                            <p className="text-xs text-gray-500 line-through">
                              PKR{" "}
                              {(
                                item.product.originalPrice * item.quantity
                              ).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
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
                      <span>Delivery (Faisalabad)</span>
                      <span className="text-green-600">FREE</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold text-emerald-900">
                    <span>Total</span>
                    <span>PKR {total.toLocaleString()}</span>
                  </div>

                  {/* Place Order Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={isPlacingOrder}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3"
                  >
                    {isPlacingOrder ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Place Order
                      </div>
                    )}
                  </Button>

                  {/* Delivery Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700 text-center">
                      📍 Free delivery within Faisalabad city limits only
                    </p>
                  </div>

                  {/* Security Notice */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <p className="text-xs text-emerald-700 text-center">
                      🔒 Your information is secure and will only be used for
                      order processing
                    </p>
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
