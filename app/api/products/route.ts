import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const sortBy = searchParams.get("sortBy") || "featured";
    const productType = searchParams.get("productType") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minRating = searchParams.get("minRating");
    const inStockOnly = searchParams.get("inStockOnly") === "true";

    // Build where clause
    const where: any = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { tags: { hasSome: [search] } },
              ],
            }
          : {},
        category ? { categoryId: category } : {},
        productType ? { userType: productType } : {},
        minPrice ? { price: { gte: Number.parseFloat(minPrice) } } : {},
        maxPrice ? { price: { lte: Number.parseFloat(maxPrice) } } : {},
        inStockOnly ? { inStock: true, stockCount: { gt: 0 } } : {},
      ],
    };

    // Filter by user type and business status
    if (!session?.user) {
      where.userType = "CONSUMER";
    } else if (session.user.role === "CONSUMER") {
      where.userType = "CONSUMER";
    } else if (session.user.role === "BUSINESS") {
      if (session.user.businessStatus !== "APPROVED") {
        where.userType = "CONSUMER";
      }
      // Approved business users can see all products
    }
    // Admin users can see all products

    // Build orderBy clause
    let orderBy: any = { createdAt: "desc" };

    switch (sortBy) {
      case "price-low":
        orderBy = { price: "asc" };
        break;
      case "price-high":
        orderBy = { price: "desc" };
        break;
      case "rating":
        orderBy = { reviews: { _count: "desc" } };
        break;
      case "most-sold":
        orderBy = { orderItems: { _count: "desc" } };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "featured":
        orderBy = [{ featured: "desc" }, { createdAt: "desc" }];
        break;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            orderItems: true,
          },
        },
      },
    });

    // Calculate average rating and filter by rating if specified
    let productsWithRating = products.map((product) => {
      const totalRating = product.reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const averageRating =
        product.reviews.length > 0 ? totalRating / product.reviews.length : 0;

      return {
        ...product,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: product._count.reviews,
        salesCount: product._count.orderItems,
        reviews: undefined,
        _count: undefined,
      };
    });

    // Filter by minimum rating if specified
    if (minRating) {
      const minRatingValue = Number.parseFloat(minRating);
      productsWithRating = productsWithRating.filter(
        (product) => product.averageRating >= minRatingValue
      );
    }

    return NextResponse.json(productsWithRating);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        price: Number.parseFloat(body.price),
        originalPrice: body.originalPrice
          ? Number.parseFloat(body.originalPrice)
          : null,
        categoryId: body.categoryId,
        userType: body.userType || "CONSUMER",
        size: body.size,
        weight: body.weight,
        stockCount: Number.parseInt(body.stockCount) || 0,
        inStock: body.inStock !== false,
        images: body.images || [],
        recipes: body.recipes || [],
        tags: body.tags || [],
        featured: body.featured || false,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
