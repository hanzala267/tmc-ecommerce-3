import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Try to fetch admin replies, but handle the case where the model doesn't exist
    let adminReplies: any[] = [];
    try {
      const reviewIds = product.reviews.map((review) => review.id);
      if (reviewIds.length > 0) {
        // Check if adminReply exists in prisma client
        if ("adminReply" in prisma) {
          adminReplies = await (prisma as any).adminReply.findMany({
            where: {
              reviewId: {
                in: reviewIds,
              },
            },
          });
        }
      }
    } catch (error) {
      console.log("AdminReply model not found, skipping admin replies");
      // Continue without admin replies if the model doesn't exist
    }

    // Attach admin replies to reviews
    const reviewsWithReplies = product.reviews.map((review) => ({
      ...review,
      adminReply:
        adminReplies.find((reply) => reply.reviewId === review.id) || null,
    }));

    // Calculate average rating
    const totalRating = product.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    const averageRating =
      product.reviews.length > 0 ? totalRating / product.reviews.length : 0;

    // Ensure arrays are properly initialized
    const responseData = {
      ...product,
      reviews: reviewsWithReplies,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: product._count.reviews,
      recipes: Array.isArray(product.recipes) ? product.recipes : [],
      tags: Array.isArray(product.tags) ? product.tags : [],
      images: Array.isArray(product.images) ? product.images : [],
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.description || !body.categoryId || !body.size) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate categoryId exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: body.categoryId },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { error: "Invalid category selected. Please choose a valid category." },
        { status: 400 }
      );
    }

    // Validate product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Process recipes and tags
    let recipes = [];
    let tags = [];

    if (body.recipes) {
      if (typeof body.recipes === "string") {
        recipes = body.recipes
          .split("\n")
          .filter((recipe: string) => recipe.trim() !== "");
      } else if (Array.isArray(body.recipes)) {
        recipes = body.recipes;
      }
    }

    if (body.tags) {
      if (typeof body.tags === "string") {
        tags = body.tags
          .split(",")
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag !== "");
      } else if (Array.isArray(body.tags)) {
        tags = body.tags;
      }
    }

    // Ensure images is an array
    const images = Array.isArray(body.images) ? body.images : [];

    // Validate numeric fields
    const price = Number.parseFloat(body.price?.toString() || "0");
    const originalPrice = body.originalPrice
      ? Number.parseFloat(body.originalPrice.toString())
      : null;
    const stockCount = Number.parseInt(body.stockCount?.toString() || "0");

    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Invalid price value" },
        { status: 400 }
      );
    }

    if (isNaN(stockCount) || stockCount < 0) {
      return NextResponse.json(
        { error: "Invalid stock count value" },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        price: price,
        originalPrice: originalPrice,
        categoryId: body.categoryId,
        userType: body.userType,
        size: body.size,
        weight: body.weight || null,
        stockCount: stockCount,
        inStock: body.inStock,
        images: images,
        recipes: recipes,
        tags: tags,
        featured: body.featured,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (
        error.message.includes("Foreign key constraint") ||
        error.message.includes("P2003")
      ) {
        if (error.message.includes("categoryId")) {
          return NextResponse.json(
            {
              error:
                "Invalid category selected. Please choose a valid category from the dropdown.",
            },
            { status: 400 }
          );
        }
        return NextResponse.json(
          {
            error: "Invalid reference data. Please check all selected values.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      (session.user.role !== "ADMIN" && session.user.role !== "BUSINESS")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    // Handle stock updates - use stockCount field from schema
    if (typeof data.stock === "number") {
      data.stockCount = data.stock;
      data.inStock = data.stock > 0;
      delete data.stock; // Remove the stock field since it doesn't exist in schema
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: {
          take: 1, // Just check if any exist
        },
        cartItems: {
          take: 1, // Just check if any exist
        },
        reviews: {
          take: 1, // Just check if any exist
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product has any dependencies
    const hasOrderItems = product.orderItems.length > 0;
    const hasCartItems = product.cartItems.length > 0;
    const hasReviews = product.reviews.length > 0;

    if (hasOrderItems || hasCartItems || hasReviews) {
      // Instead of hard delete, mark as inactive/discontinued
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          inStock: false,
          stockCount: 0,
          featured: false,
        },
      });

      return NextResponse.json({
        message:
          "Product has been deactivated instead of deleted because it has order history, cart items, or reviews.",
        product: updatedProduct,
        action: "deactivated",
      });
    }

    // If no dependencies, safe to delete
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Product deleted successfully",
      action: "deleted",
    });
  } catch (error) {
    console.error("Error deleting product:", error);

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (
        error.message.includes("Foreign key constraint") ||
        error.message.includes("P2003")
      ) {
        return NextResponse.json(
          {
            error:
              "Cannot delete product because it is referenced by orders, cart items, or reviews. The product has been marked as out of stock instead.",
            action: "deactivated",
          },
          { status: 200 } // Return 200 since we handled it gracefully
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
