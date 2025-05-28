import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId, rating, comment } = await request.json()

    // Check if user has purchased this product
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
    })

    if (!userOrder) {
      return NextResponse.json({ error: "You can only review products you have purchased" }, { status: 400 })
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    })

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 400 })
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId,
        rating: Number.parseInt(rating),
        comment,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}
