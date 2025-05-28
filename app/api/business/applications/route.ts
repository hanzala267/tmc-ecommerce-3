import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";

    const applications = await prisma.business.findMany({
      where: {
        status: status as any,
      },
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
        documents: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching business applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId, status, reason } = await request.json();

    if (!businessId || !status) {
      return NextResponse.json(
        { error: "Business ID and status are required" },
        { status: 400 }
      );
    }

    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const business = await prisma.business.update({
      where: {
        id: businessId,
      },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Log the status change
    console.log(
      `Business status changed: ${business.businessName} - ${status} by admin`
    );
    if (reason) {
      console.log(`Reason: ${reason}`);
    }

    return NextResponse.json({
      message: `Business status updated to ${status}`,
      business,
    });
  } catch (error) {
    console.error("Error updating business status:", error);
    return NextResponse.json(
      { error: "Failed to update business status" },
      { status: 500 }
    );
  }
}
