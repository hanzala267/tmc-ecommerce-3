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

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();
    const userId = params.id;

    if (!status || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update user's business status
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        businessStatus: status,
      },
      include: {
        business: true,
      },
    });

    // Also update the business record if it exists
    if (updatedUser.business) {
      await prisma.business.update({
        where: {
          userId: userId,
        },
        data: {
          status,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      message: `Business status updated to ${status}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user business status:", error);
    return NextResponse.json(
      { error: "Failed to update business status" },
      { status: 500 }
    );
  }
}
