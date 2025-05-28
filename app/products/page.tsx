"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Star,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Eye,
  X,
  SlidersHorizontal,
} from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
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
  featured: boolean;
  userType: string;
  averageRating: number;
  reviewCount: number;
  salesCount: number;
  category: {
    id: string;
    name: string;
  };
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function ProductsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [productTypeFilter, setProductTypeFilter] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [
    searchTerm,
    sortBy,
    categoryFilter,
    productTypeFilter,
    priceRange,
    minRating,
    inStockOnly,
    session,
  ]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();

      if (searchTerm) params.append("search", searchTerm);
      if (sortBy) params.append("sortBy", sortBy);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (productTypeFilter !== "all")
        params.append("productType", productTypeFilter);
      if (priceRange[0] > 0)
        params.append("minPrice", priceRange[0].toString());
      if (priceRange[1] < 10000)
        params.append("maxPrice", priceRange[1].toString());
      if (minRating > 0) params.append("minRating", minRating.toString());
      if (inStockOnly) params.append("inStockOnly", "true");

      const response = await fetch(`/api/products?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        throw new Error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSortBy("featured");
    setCategoryFilter("all");
    setProductTypeFilter("all");
    setPriceRange([0, 10000]);
    setMinRating(0);
    setInStockOnly(false);
  };

  const addToCart = async (productId: string) => {
    if (!session) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      router.push("/auth/login");
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (!product.inStock || product.stockCount <= 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock",
        variant: "destructive",
      });
      return;
    }

    setAddingToCart(productId);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
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
      setAddingToCart(null);
    }
  };

  const isBusinessUser = session?.user?.role === "BUSINESS";
  const isApprovedBusiness =
    isBusinessUser && session?.user?.businessStatus === "APPROVED";

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <div className="bg-emerald-800 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Products
            </h1>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              Premium marinated chicken with 6 signature recipes in every pack
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Basic Filters */}
        <motion.div
          className="bg-white rounded-lg shadow-md p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-5 w-5" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-emerald-200 focus:border-emerald-500"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full lg:w-48 border-emerald-200">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isApprovedBusiness && (
              <Select
                value={productTypeFilter}
                onValueChange={setProductTypeFilter}
              >
                <SelectTrigger className="w-full lg:w-48 border-emerald-200">
                  <SelectValue placeholder="Product Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="CONSUMER">Consumer</SelectItem>
                  <SelectItem value="BUSINESS">Business</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48 border-emerald-200">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="most-sold">Most Sold</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-emerald-600 text-emerald-600"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-emerald-100"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Price Range */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-emerald-900">
                    Price Range: PKR {priceRange[0].toLocaleString()} - PKR{" "}
                    {priceRange[1].toLocaleString()}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={10000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                </div>

                {/* Rating Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-emerald-900">
                    Minimum Rating
                  </label>
                  <Select
                    value={minRating.toString()}
                    onValueChange={(value) => setMinRating(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any rating</SelectItem>
                      <SelectItem value="1">1+ stars</SelectItem>
                      <SelectItem value="2">2+ stars</SelectItem>
                      <SelectItem value="3">3+ stars</SelectItem>
                      <SelectItem value="4">4+ stars</SelectItem>
                      <SelectItem value="5">5 stars only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Stock Filter */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inStock"
                      checked={inStockOnly}
                      onCheckedChange={setInStockOnly}
                    />
                    <label
                      htmlFor="inStock"
                      className="text-sm font-medium text-emerald-900"
                    >
                      In stock only
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="text-emerald-600 border-emerald-600"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Business User Notices */}
        {isBusinessUser && session?.user?.businessStatus !== "APPROVED" && (
          <motion.div
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start space-x-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Business Account{" "}
                  {session.user.businessStatus === "PENDING"
                    ? "Pending Approval"
                    : "Not Approved"}
                </h3>
                <p className="text-yellow-700">
                  {session.user.businessStatus === "PENDING"
                    ? "Your business account is under review. You can browse consumer products while waiting for approval."
                    : "Your business account was not approved. You can continue using consumer products."}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {isApprovedBusiness && (
          <motion.div
            className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center space-x-4">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-emerald-800">
                  Welcome, Business Partner!
                </h3>
                <p className="text-emerald-700">
                  You have access to both consumer and business products with
                  special pricing.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-emerald-700">
            Showing {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={fadeInUp}>
                <Card className="group overflow-hidden border-emerald-100 hover:border-emerald-300 hover:shadow-xl transition-all duration-300">
                  <div className="relative overflow-hidden">
                    <Image
                      src={
                        product.images[0] ||
                        "/placeholder.svg?height=300&width=300&query=marinated chicken pack"
                      }
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {product.originalPrice && (
                        <Badge className="bg-emerald-600 text-white">
                          {Math.round(
                            ((product.originalPrice - product.price) /
                              product.originalPrice) *
                              100
                          )}
                          % OFF
                        </Badge>
                      )}
                      <Badge
                        variant={
                          product.userType === "BUSINESS"
                            ? "secondary"
                            : "default"
                        }
                        className={
                          product.userType === "BUSINESS"
                            ? "bg-blue-600 text-white"
                            : "bg-green-600 text-white"
                        }
                      >
                        {product.userType === "BUSINESS"
                          ? "Business"
                          : "Consumer"}
                      </Badge>
                    </div>

                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      {product.featured && (
                        <Badge className="bg-yellow-600 text-white">
                          Featured
                        </Badge>
                      )}
                      {product.salesCount > 0 && (
                        <Badge variant="outline" className="bg-white/90">
                          {product.salesCount} sold
                        </Badge>
                      )}
                    </div>

                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge
                          variant="destructive"
                          className="text-lg px-4 py-2"
                        >
                          Out of Stock
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-lg text-emerald-900 group-hover:text-emerald-700 transition-colors">
                          {product.name}
                        </h3>

                        {/* Star Rating */}
                        {product.reviewCount > 0 && (
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(product.averageRating)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-emerald-700">
                              {product.averageRating.toFixed(1)} (
                              {product.reviewCount})
                            </span>
                          </div>
                        )}

                        <p className="text-emerald-600 text-sm mt-2 line-clamp-2">
                          {product.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {product.category.name}
                        </p>

                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {product.tags.slice(0, 3).map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {product.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{product.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Stock Information */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {product.inStock ? (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                product.stockCount <= 5
                                  ? "border-yellow-500 text-yellow-700 bg-yellow-50"
                                  : "border-green-500 text-green-700 bg-green-50"
                              }`}
                            >
                              {product.stockCount <= 5 &&
                              product.stockCount > 0 ? (
                                <>
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Only {product.stockCount} left
                                </>
                              ) : (
                                `${product.stockCount} in stock`
                              )}
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              Out of Stock
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-emerald-800">
                              PKR {product.price.toLocaleString()}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                PKR {product.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {product.size}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <Button
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-400"
                          disabled={
                            !product.inStock ||
                            product.stockCount <= 0 ||
                            addingToCart === product.id
                          }
                          onClick={() => addToCart(product.id)}
                        >
                          {addingToCart === product.id ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Adding...
                            </div>
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              {product.inStock && product.stockCount > 0
                                ? "Add to Cart"
                                : "Out of Stock"}
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                          onClick={() => router.push(`/products/${product.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Product
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!isLoading && products.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-emerald-600 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-emerald-900 mb-2">
              No products found
            </h3>
            <p className="text-emerald-700">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
