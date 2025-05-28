"use client";

import { useState, useEffect } from "react";
import { Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

interface Product {
  id: string;
  name: string;
  size: string;
  weight?: string;
  stockCount: number; // Use stockCount from schema
  inStock: boolean;
  price: number;
  images: string[];
}

export function StockManagement() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
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
          stock: newStock, // API will convert this to stockCount
        }),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update stock");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update stock",
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
    const newStock = Math.max(0, currentStock + adjustment);
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
    } else if (stock <= 20) {
      return {
        label: "Medium Stock",
        color: "bg-blue-600",
        textColor: "text-blue-600",
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
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
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

      {/* Stock Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {outOfStockProducts.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-red-800 mb-2">
                  Out of Stock ({outOfStockProducts.length})
                </h4>
                <div className="space-y-1">
                  {outOfStockProducts.map((product) => (
                    <p key={product.id} className="text-sm text-red-700">
                      {product.name} - {product.size}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {lowStockProducts.length > 0 && (
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">
                  Low Stock ({lowStockProducts.length})
                </h4>
                <div className="space-y-1">
                  {lowStockProducts.map((product) => (
                    <p key={product.id} className="text-sm text-orange-700">
                      {product.name} - {product.size} ({product.stockCount}{" "}
                      left)
                    </p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product.stockCount);
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                              {product.images.length > 0 ? (
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
                              {product.weight && (
                                <p className="text-sm text-emerald-600">
                                  {product.weight}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{product.size}</TableCell>
                        <TableCell>
                          <span
                            className={`font-bold ${stockStatus.textColor}`}
                          >
                            {product.stockCount} units
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${stockStatus.color} text-white`}>
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          PKR {product.price.toLocaleString()}
                        </TableCell>
                        <TableCell>
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
                              className="h-8 w-8 p-0"
                            >
                              <TrendingDown className="h-4 w-4" />
                            </Button>

                            <Input
                              type="number"
                              value={product.stockCount}
                              onChange={(e) => {
                                const newStock =
                                  Number.parseInt(e.target.value) || 0;
                                updateStock(product.id, newStock);
                              }}
                              disabled={updatingStock === product.id}
                              className="w-20 h-8 text-center"
                              min="0"
                            />

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                adjustStock(product.id, product.stockCount, 1)
                              }
                              disabled={updatingStock === product.id}
                              className="h-8 w-8 p-0"
                            >
                              <TrendingUp className="h-4 w-4" />
                            </Button>
                          </div>
                          {updatingStock === product.id && (
                            <div className="text-xs text-emerald-600 mt-1">
                              Updating...
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
