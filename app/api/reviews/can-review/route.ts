import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ canReview: false }, { status: 200 });
    }

    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { canReview: false, hasReviewed: true },
        { status: 200 }
      );
    }

    // Check if user has purchased and received this product
    const userOrder = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: "DELIVERED",
        orderItems: {
          some: {
            productId,
          },
        },
      },
    });

    return NextResponse.json({ canReview: !!userOrder }, { status: 200 });
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    return NextResponse.json(
      { error: "Failed to check review eligibility" },
      { status: 500 }
    );
  }
}
