import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ count: 0 });
    }

    const count = await prisma.cartItem.aggregate({
      where: {
        userId: session.user.id,
      },
      _sum: {
        quantity: true,
      },
    });

    return NextResponse.json({ count: count._sum.quantity || 0 });
  } catch (error) {
    console.error("Error fetching cart count:", error);
    return NextResponse.json({ count: 0 });
  }
}
