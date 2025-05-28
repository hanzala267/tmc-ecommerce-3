import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "last30days"

    // Calculate date range
    const now = new Date()
    const startDate = new Date()

    switch (range) {
      case "last7days":
        startDate.setDate(now.getDate() - 7)
        break
      case "last30days":
        startDate.setDate(now.getDate() - 30)
        break
      case "last90days":
        startDate.setDate(now.getDate() - 90)
        break
      case "lastyear":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Get total counts
    const totalUsers = await prisma.user.count()
    const totalProducts = await prisma.product.count()
    const totalOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    })

    // Get total revenue
    const orders = await prisma.order.findMany({
      where: {
        status: "DELIVERED",
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        totalAmount: true,
      },
    })
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)

    // Get top products
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
        price: true,
      },
      where: {
        order: {
          createdAt: {
            gte: startDate,
          },
        },
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    })

    const topProductsWithNames = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true },
        })
        return {
          name: product?.name || "Unknown Product",
          sales: item._sum.quantity || 0,
          revenue: (item._sum.price || 0) * (item._sum.quantity || 0),
        }
      }),
    )

    // Get orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    })

    const formattedOrdersByStatus = ordersByStatus.map((item) => ({
      status: item.status,
      count: item._count.status,
    }))

    // Get monthly revenue (simplified - last 6 months)
    const monthlyRevenue = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const monthOrders = await prisma.order.findMany({
        where: {
          status: "DELIVERED",
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        select: {
          totalAmount: true,
        },
      })

      const monthRevenue = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0)

      monthlyRevenue.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        revenue: monthRevenue,
      })
    }

    const reportData = {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      topProducts: topProductsWithNames,
      ordersByStatus: formattedOrdersByStatus,
      monthlyRevenue,
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error("Error fetching report data:", error)
    return NextResponse.json({ error: "Failed to fetch report data" }, { status: 500 })
  }
}
