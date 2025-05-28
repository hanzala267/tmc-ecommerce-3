import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch all products that are in stock with custom sorting
    const allProducts = await prisma.product.findMany({
      where: {
        inStock: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        originalPrice: true,
        images: true,
        featured: true,
        size: true,
        userType: true,
        category: {
          select: {
            name: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    // Calculate average rating and sort products
    const productsWithRating = allProducts.map((product) => {
      const totalRating = product.reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const averageRating =
        product.reviews.length > 0 ? totalRating / product.reviews.length : 0;

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        images: product.images,
        featured: product.featured,
        size: product.size,
        userType: product.userType,
        averageRating: averageRating,
        reviewCount: product._count.reviews,
        category: product.category,
      };
    });

    // Sort products: First rated products (highest first), then unrated products
    const sortedProducts = productsWithRating.sort((a, b) => {
      // If both have ratings, sort by rating (highest first)
      if (a.averageRating > 0 && b.averageRating > 0) {
        return b.averageRating - a.averageRating;
      }

      // If only one has rating, prioritize the one with rating
      if (a.averageRating > 0 && b.averageRating === 0) {
        return -1;
      }
      if (a.averageRating === 0 && b.averageRating > 0) {
        return 1;
      }

      // If neither has rating, prioritize featured products first
      if (a.averageRating === 0 && b.averageRating === 0) {
        if (a.featured && !b.featured) {
          return -1;
        }
        if (!a.featured && b.featured) {
          return 1;
        }
        // If both have same featured status, sort by name
        return a.name.localeCompare(b.name);
      }

      return 0;
    });

    return NextResponse.json(sortedProducts);
  } catch (error) {
    console.error("Error fetching all products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
