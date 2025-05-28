"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { ImageUpload } from "@/components/ui/image-upload";
import { TagInputComponent } from "@/components/ui/tag-input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  userType: string;
  size: string;
  weight?: string;
  inStock: boolean;
  stockCount: number;
  images: string[];
  featured: boolean;
  createdAt: string;
  category: {
    id: string;
    name: string;
  };
  recipes: string[];
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

export function ProductsManagementTab() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter, userTypeFilter]);

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

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (product) => product.categoryId === categoryFilter
      );
    }

    if (userTypeFilter !== "all") {
      filtered = filtered.filter(
        (product) => product.userType === userTypeFilter
      );
    }

    setFilteredProducts(filtered);
  };

  const confirmDelete = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const deleteProduct = async () => {
    if (!productToDelete) return;

    try {
      setIsDeleting(productToDelete.id);
      setShowDeleteConfirm(false);

      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        if (data.action === "deleted") {
          // Product was actually deleted
          toast({
            title: "Success",
            description: "Product deleted successfully",
          });
          // Remove from local state
          setProducts((prevProducts) =>
            prevProducts.filter((p) => p.id !== productToDelete.id)
          );
        } else if (data.action === "deactivated") {
          // Product was deactivated instead of deleted
          toast({
            title: "Product Deactivated",
            description: data.message,
            variant: "default",
          });
          // Update the product in local state
          setProducts((prevProducts) =>
            prevProducts.map((p) =>
              p.id === productToDelete.id
                ? { ...p, inStock: false, stockCount: 0, featured: false }
                : p
            )
          );
        }
      } else {
        throw new Error(data.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
      setProductToDelete(null);
    }
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setShowEditDialog(true);
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    setSelectedProduct(null);
    fetchProducts(); // Refresh the products list to show updated data
  };

  const handleAddSuccess = () => {
    setShowAddDialog(false);
    fetchProducts(); // Refresh the products list to show new product
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-emerald-900">
          Products Management
        </h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <ProductForm categories={categories} onSuccess={handleAddSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Warning Alert */}
      {categories.length === 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Warning:</strong> No categories found. Please create
            categories first before adding products.
          </AlertDescription>
        </Alert>
      )}

      {/* Info Alert */}
      <Alert className="border-blue-100 bg-blue-50">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Note:</strong> Products with order history, cart items, or
          reviews cannot be permanently deleted. They will be deactivated
          instead to preserve data integrity.
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900">Product Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-emerald-200"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="border-emerald-200">
                <SelectValue placeholder="Filter by category" />
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

            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
              <SelectTrigger className="border-emerald-200">
                <SelectValue placeholder="Filter by user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="CONSUMER">Consumer</SelectItem>
                <SelectItem value="BUSINESS">Business</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={fetchProducts}
              className="border-emerald-600 text-emerald-600"
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900 flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Products ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
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
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow
                      key={product.id}
                      className={!product.inStock ? "opacity-60" : ""}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                            {product.images && product.images.length > 0 ? (
                              <Image
                                src={product.images[0] || "/placeholder.svg"}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="rounded-lg object-cover"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-emerald-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">
                              {product.size}
                            </p>
                            {product.featured && (
                              <Badge className="bg-yellow-600 text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.category?.name || "Uncategorized"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.userType === "CONSUMER"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {product.userType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold">
                            PKR {product.price.toLocaleString()}
                          </p>
                          {product.originalPrice && (
                            <p className="text-sm text-gray-500 line-through">
                              PKR {product.originalPrice.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p
                            className={
                              product.stockCount > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {product.stockCount} units
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product.inStock ? "default" : "destructive"}
                        >
                          {product.inStock ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedProduct(product)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Product Details</DialogTitle>
                              </DialogHeader>
                              {selectedProduct && (
                                <ProductDetails product={selectedProduct} />
                              )}
                            </DialogContent>
                          </Dialog>

                          <Dialog
                            open={showEditDialog}
                            onOpenChange={setShowEditDialog}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditClick(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit Product</DialogTitle>
                              </DialogHeader>
                              {selectedProduct && (
                                <ProductForm
                                  key={`edit-${selectedProduct.id}`} // Force re-render when product changes
                                  product={selectedProduct}
                                  categories={categories}
                                  onSuccess={handleEditSuccess}
                                />
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => confirmDelete(product)}
                            disabled={isDeleting === product.id}
                          >
                            {isDeleting === product.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete{" "}
              <strong>{productToDelete?.name}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Note: Products with order history, cart items, or reviews will be
              deactivated instead of deleted to preserve data integrity.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteProduct}
              disabled={isDeleting !== null}
              className="ml-2"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductDetails({ product }: { product: Product }) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-emerald-900 mb-2">
            Basic Information
          </h4>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Name:</strong> {product.name}
            </p>
            <p>
              <strong>Category:</strong>{" "}
              {product.category?.name || "Uncategorized"}
            </p>
            <p>
              <strong>User Type:</strong> {product.userType}
            </p>
            <p>
              <strong>Size:</strong> {product.size}
            </p>
            {product.weight && (
              <p>
                <strong>Weight:</strong> {product.weight}
              </p>
            )}
          </div>
        </div>
        <div>
          <h4 className="font-medium text-emerald-900 mb-2">Pricing & Stock</h4>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Price:</strong> PKR {product.price.toLocaleString()}
            </p>
            {product.originalPrice && (
              <p>
                <strong>Original Price:</strong> PKR{" "}
                {product.originalPrice.toLocaleString()}
              </p>
            )}
            <p>
              <strong>Stock Count:</strong> {product.stockCount}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {product.inStock ? "In Stock" : "Out of Stock"}
            </p>
            <p>
              <strong>Featured:</strong> {product.featured ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-emerald-900 mb-2">Description</h4>
        <p className="text-sm text-gray-700">{product.description}</p>
      </div>

      {product.recipes && product.recipes.length > 0 && (
        <div>
          <h4 className="font-medium text-emerald-900 mb-2">Recipes</h4>
          <div className="space-y-1">
            {product.recipes.map((recipe, index) => (
              <p key={index} className="text-sm text-gray-700">
                • {recipe}
              </p>
            ))}
          </div>
        </div>
      )}

      {product.tags && product.tags.length > 0 && (
        <div>
          <h4 className="font-medium text-emerald-900 mb-2">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {product.images && product.images.length > 0 && (
        <div>
          <h4 className="font-medium text-emerald-900 mb-2">Images</h4>
          <div className="grid grid-cols-3 gap-2">
            {product.images.map((image, index) => (
              <div
                key={index}
                className="w-20 h-20 bg-emerald-100 rounded-lg flex items-center justify-center"
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} ${index + 1}`}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductForm({
  product,
  categories,
  onSuccess,
}: {
  product?: Product;
  categories: Category[];
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    categoryId: "",
    userType: "CONSUMER",
    size: "",
    weight: "",
    stockCount: 0,
    inStock: true,
    featured: false,
    images: [] as string[],
    recipes: [] as string[],
    tags: [] as string[],
  });

  // Initialize form data
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        originalPrice: product.originalPrice || 0,
        categoryId: product.categoryId || "",
        userType: product.userType || "CONSUMER",
        size: product.size || "",
        weight: product.weight || "",
        stockCount: product.stockCount || 0,
        inStock: product.inStock ?? true,
        featured: product.featured || false,
        images: Array.isArray(product.images) ? [...product.images] : [],
        recipes: Array.isArray(product.recipes) ? [...product.recipes] : [],
        tags: Array.isArray(product.tags) ? [...product.tags] : [],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: 0,
        originalPrice: 0,
        categoryId: "",
        userType: "CONSUMER",
        size: "",
        weight: "",
        stockCount: 0,
        inStock: true,
        featured: false,
        images: [],
        recipes: [],
        tags: [],
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Product description is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.categoryId) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    if (!formData.size.trim()) {
      toast({
        title: "Validation Error",
        description: "Product size is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Price must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (formData.stockCount < 0) {
      toast({
        title: "Validation Error",
        description: "Stock count cannot be negative",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Product ${
            product ? "updated" : "created"
          } successfully`,
        });
        onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to ${product ? "update" : "create"} product`
        );
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${product ? "update" : "create"} product`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category *</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) => handleInputChange("categoryId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categories.length === 0 && (
            <p className="text-xs text-red-500">
              No categories available. Please create categories first.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          required
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (PKR) *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) =>
              handleInputChange("price", Number.parseFloat(e.target.value))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="originalPrice">Original Price (PKR)</Label>
          <Input
            id="originalPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.originalPrice}
            onChange={(e) =>
              handleInputChange(
                "originalPrice",
                Number.parseFloat(e.target.value)
              )
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stockCount">Stock Count *</Label>
          <Input
            id="stockCount"
            type="number"
            min="0"
            value={formData.stockCount}
            onChange={(e) =>
              handleInputChange("stockCount", Number.parseInt(e.target.value))
            }
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="userType">User Type *</Label>
          <Select
            value={formData.userType}
            onValueChange={(value) => handleInputChange("userType", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CONSUMER">Consumer</SelectItem>
              <SelectItem value="BUSINESS">Business</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="size">Size *</Label>
          <Input
            id="size"
            value={formData.size}
            onChange={(e) => handleInputChange("size", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Weight</Label>
          <Input
            id="weight"
            value={formData.weight}
            onChange={(e) => handleInputChange("weight", e.target.value)}
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="inStock"
            checked={formData.inStock}
            onCheckedChange={(checked) => handleInputChange("inStock", checked)}
          />
          <Label htmlFor="inStock">In Stock</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="featured"
            checked={formData.featured}
            onCheckedChange={(checked) =>
              handleInputChange("featured", checked)
            }
          />
          <Label htmlFor="featured">Featured Product</Label>
        </div>
      </div>

      <div className="space-y-2">
        <ImageUpload
          key={`images-${product?.id || "new"}-${formData.images.length}`} // Force re-render
          value={formData.images}
          onChange={(urls) => handleInputChange("images", urls)}
          maxImages={5}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipes">Recipes (Optional)</Label>
        <Textarea
          id="recipes"
          value={formData.recipes.join("\n")}
          onChange={(e) =>
            handleInputChange(
              "recipes",
              e.target.value.split("\n").filter((r) => r.trim())
            )
          }
          placeholder="Enter recipes, one per line..."
          className="min-h-[80px]"
        />
        <p className="text-xs text-gray-500">Enter each recipe on a new line</p>
      </div>

      <div className="space-y-2">
        <TagInputComponent
          value={formData.tags}
          onChange={(tags) => handleInputChange("tags", tags)}
          placeholder="Add tags (e.g., spicy, halal, premium)"
          label="Tags"
        />
        <p className="text-xs text-gray-500">
          Add relevant tags to help customers find your products
        </p>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || categories.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isLoading
            ? "Saving..."
            : product
            ? "Update Product"
            : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
