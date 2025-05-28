import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total users
    const totalUsers = await prisma.user.count();

    // Get total products
    const totalProducts = await prisma.product.count();

    // Get total orders
    const totalOrders = await prisma.order.count();

    // Get total revenue from all orders
    const allOrders = await prisma.order.findMany({
      select: {
        totalAmount: true,
        status: true,
        paymentStatus: true,
      },
    });

    // Calculate different revenue types
    const totalRevenue = allOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    const pendingRevenue = allOrders
      .filter((order) => order.paymentStatus === "PENDING")
      .reduce((sum, order) => sum + order.totalAmount, 0);

    const receivedRevenue = allOrders
      .filter((order) => order.paymentStatus === "PAID")
      .reduce((sum, order) => sum + order.totalAmount, 0);

    // Get delivered orders revenue (for completed transactions)
    const deliveredRevenue = allOrders
      .filter(
        (order) =>
          order.status === "DELIVERED" && order.paymentStatus === "PAID"
      )
      .reduce((sum, order) => sum + order.totalAmount, 0);

    // Get pending business applications
    const pendingBusinesses = await prisma.business.count({
      where: {
        status: "PENDING",
      },
    });

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingRevenue,
      receivedRevenue,
      deliveredRevenue,
      pendingBusinesses,
      recentOrders,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
