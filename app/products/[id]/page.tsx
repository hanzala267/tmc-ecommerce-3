"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Star,
  ShoppingCart,
  ChevronLeft,
  AlertTriangle,
  Reply,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  size: string;
  weight?: string;
  inStock: boolean;
  stockCount: number;
  images: string[];
  recipes: string[];
  tags: string[];
  featured: boolean;
  userType: string;
  averageRating: number;
  reviewCount: number;
  category: {
    id: string;
    name: string;
  };
  reviews: Review[];
}

interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
  adminReply?: AdminReply;
}

interface AdminReply {
  id: string;
  reviewId: string;
  comment: string;
  createdAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("recipes");
  const [isReplyingToReview, setIsReplyingToReview] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyingToReviewId, setReplyingToReviewId] = useState<string | null>(
    null
  );
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id, session]);

  const fetchProduct = async (productId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const data = await response.json();

        // Ensure all arrays are properly initialized
        data.recipes = Array.isArray(data.recipes) ? data.recipes : [];
        data.tags = Array.isArray(data.tags) ? data.tags : [];
        data.reviews = Array.isArray(data.reviews) ? data.reviews : [];
        data.images = Array.isArray(data.images) ? data.images : [];
        data.averageRating = data.averageRating || 0;
        data.reviewCount = data.reviewCount || 0;

        setProduct(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        });
        router.push("/products");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async () => {
    if (!session) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      router.push("/auth/login");
      return;
    }

    if (!product) return;

    if (!product.inStock || product.stockCount <= 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock",
        variant: "destructive",
      });
      return;
    }

    if (quantity > product.stockCount) {
      toast({
        title: "Invalid Quantity",
        description: `Only ${product.stockCount} items available in stock`,
        variant: "destructive",
      });
      return;
    }

    setAddingToCart(true);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product added to cart",
        });
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to add to cart");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to add product to cart",
        variant: "destructive",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReplyToReview = async (reviewId: string) => {
    if (!session?.user || session.user.role !== "ADMIN") return;

    setIsSubmittingReply(true);

    try {
      const response = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: replyText,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: data.message || "Reply added successfully",
        });
        fetchProduct(product!.id);
        setReplyText("");
        setReplyingToReviewId(null);
        setIsReplyingToReview(false);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to add reply");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add reply",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Product Not Found</h2>
          <p className="mt-2 text-gray-600">
            The product you are looking for does not exist.
          </p>
          <Button className="mt-4" onClick={() => router.push("/products")}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="flex items-center text-emerald-700 hover:text-emerald-900"
            onClick={() => router.push("/products")}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Products
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg overflow-hidden shadow-lg">
              <div className="relative aspect-square">
                <Image
                  src={
                    (product.images &&
                      product.images.length > 0 &&
                      product.images[selectedImage]) ||
                    "/placeholder.svg?height=600&width=600&query=marinated chicken pack"
                  }
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
                {product.originalPrice && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-emerald-600 text-white">
                      {Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100
                      )}
                      % OFF
                    </Badge>
                  </div>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg px-4 py-2">
                      Out of Stock
                    </Badge>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="p-4 grid grid-cols-5 gap-2">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer border-2 rounded overflow-hidden ${
                        selectedImage === index
                          ? "border-emerald-500"
                          : "border-gray-200"
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <Image
                        src={
                          image ||
                          "/placeholder.svg?height=80&width=80&query=marinated chicken"
                        }
                        alt={`${product.name} thumbnail ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-16 object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-emerald-900">
                  {product.name}
                </h1>
                {product.featured && (
                  <Badge className="bg-yellow-600 text-white">Featured</Badge>
                )}
              </div>
              <div className="flex items-center mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.averageRating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-emerald-700">
                  {(product.averageRating || 0).toFixed(1)} (
                  {product.reviewCount || 0} reviews)
                </span>
              </div>
              <p className="text-emerald-700 mt-4">{product.description}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-emerald-800">
                      PKR {product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        PKR {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {product.size}
                </Badge>
                {product.weight && (
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {product.weight}
                  </Badge>
                )}
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {product.category?.name || "Uncategorized"}
                </Badge>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Stock Information */}
              <div className="flex items-center space-x-2">
                {product.inStock ? (
                  <Badge
                    variant="outline"
                    className={`text-sm ${
                      product.stockCount <= 5
                        ? "border-yellow-500 text-yellow-700 bg-yellow-50"
                        : "border-green-500 text-green-700 bg-green-50"
                    }`}
                  >
                    {product.stockCount <= 5 && product.stockCount > 0 ? (
                      <>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Only {product.stockCount} left
                      </>
                    ) : (
                      `${product.stockCount} in stock`
                    )}
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-sm">
                    Out of Stock
                  </Badge>
                )}
              </div>

              {/* Quantity Selector */}
              {product.inStock && (
                <div className="flex items-center space-x-4">
                  <span className="text-emerald-800 font-medium">
                    Quantity:
                  </span>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      className="px-3 py-1 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </button>
                    <span className="px-4 py-1 border-x border-gray-300">
                      {quantity}
                    </span>
                    <button
                      className="px-3 py-1 text-emerald-700 hover:bg-emerald-50"
                      onClick={() =>
                        setQuantity(Math.min(product.stockCount, quantity + 1))
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg"
                disabled={
                  !product.inStock || product.stockCount <= 0 || addingToCart
                }
                onClick={addToCart}
              >
                {addingToCart ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Adding...
                  </div>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {product.inStock && product.stockCount > 0
                      ? "Add to Cart"
                      : "Out of Stock"}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Product Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12"
        >
          <Tabs
            defaultValue="recipes"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
              <TabsTrigger value="recipes">Recipes</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({product.reviewCount || 0})
              </TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent
                value="recipes"
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-emerald-900">
                    Available Recipes
                  </h3>
                  {product.recipes && product.recipes.length > 0 ? (
                    <>
                      <p className="text-emerald-700">
                        Our marinated chicken comes with these signature
                        recipes. Each pack includes instructions for
                        preparation.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        {product.recipes.map((recipe, index) => (
                          <Card key={index} className="overflow-hidden">
                            <div className="h-32 bg-emerald-100 flex items-center justify-center">
                              <Image
                                src={`/placeholder.svg?height=128&width=256&query=${encodeURIComponent(
                                  recipe + " marinated chicken"
                                )}`}
                                alt={recipe}
                                width={256}
                                height={128}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <CardContent className="p-4">
                              <h4 className="font-medium text-emerald-800">
                                {recipe}
                              </h4>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No specific recipes available for this product.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                {/* All Reviews */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-emerald-900">
                    Customer Reviews
                  </h3>
                  {!product.reviews || product.reviews.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                      <p className="text-gray-500">
                        No reviews yet. Purchase this product to leave a review!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {product.reviews.map((review) => (
                        <Card key={review.id} className="overflow-hidden">
                          <CardContent className="p-6">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-emerald-800">
                                    {review.user?.firstName || "User"}{" "}
                                    {review.user?.lastName || ""}
                                  </h4>
                                  <div className="flex items-center mt-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < review.rating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                    <span className="ml-2 text-xs text-gray-500">
                                      {new Date(
                                        review.createdAt
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                {session?.user?.role === "ADMIN" &&
                                  !review.adminReply && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center"
                                      onClick={() => {
                                        setReplyingToReviewId(review.id);
                                        setIsReplyingToReview(true);
                                      }}
                                    >
                                      <Reply className="h-4 w-4 mr-1" />
                                      Reply
                                    </Button>
                                  )}
                              </div>
                              <p className="text-emerald-700">
                                {review.comment}
                              </p>

                              {/* Admin Reply */}
                              {review.adminReply && (
                                <div className="mt-4 pl-4 border-l-2 border-emerald-300">
                                  <div className="flex items-center">
                                    <Badge className="bg-emerald-600 text-white mr-2">
                                      Admin
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {new Date(
                                        review.adminReply.createdAt
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-emerald-700">
                                    {review.adminReply.comment}
                                  </p>
                                </div>
                              )}

                              {/* Reply Form */}
                              {isReplyingToReview &&
                                replyingToReviewId === review.id && (
                                  <div className="mt-4 pl-4 border-l-2 border-emerald-300 space-y-3">
                                    <div className="flex items-center">
                                      <Badge className="bg-emerald-600 text-white mr-2">
                                        Admin
                                      </Badge>
                                      <span className="text-sm font-medium">
                                        Reply to this review
                                      </span>
                                    </div>
                                    <Textarea
                                      value={replyText}
                                      onChange={(e) =>
                                        setReplyText(e.target.value)
                                      }
                                      placeholder="Write your reply..."
                                      className="min-h-[80px]"
                                    />
                                    <div className="flex justify-end space-x-3">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setIsReplyingToReview(false);
                                          setReplyingToReviewId(null);
                                          setReplyText("");
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                        disabled={
                                          isSubmittingReply || !replyText.trim()
                                        }
                                        onClick={() =>
                                          handleReplyToReview(review.id)
                                        }
                                      >
                                        {isSubmittingReply ? (
                                          <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                            Submitting...
                                          </div>
                                        ) : (
                                          "Submit Reply"
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
