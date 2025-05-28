import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: reviewId } = await params;
    const { comment } = await request.json();

    if (!comment || !comment.trim()) {
      return NextResponse.json(
        { error: "Comment is required" },
        { status: 400 }
      );
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { adminReply: true },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Check if admin reply already exists
    if (review.adminReply) {
      // Update existing reply
      const updatedReply = await prisma.adminReply.update({
        where: { id: review.adminReply.id },
        data: {
          comment: comment.trim(),
          updatedAt: new Date(),
        },
      });
      return NextResponse.json(
        {
          success: true,
          message: "Reply updated successfully",
          reply: updatedReply,
        },
        { status: 200 }
      );
    }

    // Create new admin reply
    const adminReply = await prisma.adminReply.create({
      data: {
        reviewId,
        comment: comment.trim(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Reply added successfully",
        reply: adminReply,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating admin reply:", error);
    return NextResponse.json(
      {
        error: "Failed to create admin reply",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params;

    const adminReply = await prisma.adminReply.findFirst({
      where: { reviewId },
    });

    if (!adminReply) {
      return NextResponse.json({ reply: null }, { status: 200 });
    }

    return NextResponse.json({ reply: adminReply }, { status: 200 });
  } catch (error) {
    console.error("Error fetching admin reply:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch admin reply",
        details: error instanceof Error ? error.message : "Unknown error",
      },
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

    const { id: reviewId } = await params;

    // Find and delete admin reply
    const adminReply = await prisma.adminReply.findFirst({
      where: { reviewId },
    });

    if (!adminReply) {
      return NextResponse.json({ error: "Reply not found" }, { status: 404 });
    }

    await prisma.adminReply.delete({
      where: { id: adminReply.id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Reply deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting admin reply:", error);
    return NextResponse.json(
      {
        error: "Failed to delete admin reply",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
