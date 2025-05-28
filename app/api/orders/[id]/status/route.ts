import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();
    const orderId = params.id; // Fixed: directly access id without destructuring

    // Validate status
    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Start a transaction to update order status and handle stock
    const result = await prisma.$transaction(async (tx) => {
      // Get the current order with items
      const currentOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!currentOrder) {
        throw new Error("Order not found");
      }

      const now = new Date();
      const updateData: any = {
        status,
        updatedAt: now,
      };

      // Add timestamp based on status
      if (status === "CONFIRMED" && !currentOrder.confirmedAt) {
        updateData.confirmedAt = now;
      } else if (status === "SHIPPED" && !currentOrder.shippedAt) {
        updateData.shippedAt = now;
      } else if (status === "DELIVERED" && !currentOrder.deliveredAt) {
        updateData.deliveredAt = now;
      } else if (status === "CANCELLED" && !currentOrder.cancelledAt) {
        updateData.cancelledAt = now;
      }

      // Handle stock reduction when order is delivered
      if (status === "DELIVERED" && currentOrder.status !== "DELIVERED") {
        // Reduce stock for each product in the order
        for (const item of currentOrder.orderItems) {
          const newStock = Math.max(0, item.product.stockCount - item.quantity);

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockCount: newStock,
              inStock: newStock > 0,
            },
          });
        }
      }

      // Handle stock restoration if delivered order is cancelled
      if (status === "CANCELLED" && currentOrder.status === "DELIVERED") {
        // Restore stock for each product in the order
        for (const item of currentOrder.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockCount: {
                increment: item.quantity,
              },
              inStock: true,
            },
          });
        }
      }

      // Update the order
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  size: true,
                  weight: true,
                  images: true,
                  stockCount: true,
                  inStock: true,
                },
              },
            },
          },
        },
      });

      return updatedOrder;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update order status",
      },
      { status: 500 }
    );
  }
}
