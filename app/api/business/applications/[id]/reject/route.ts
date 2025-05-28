import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reason } = await request.json()

    const business = await prisma.business.update({
      where: {
        id: params.id,
      },
      data: {
        status: "REJECTED",
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // TODO: Send rejection email to business user with reason
    console.log(`Business rejected: ${business.businessName} for user ${business.user.email}. Reason: ${reason}`)

    return NextResponse.json({ message: "Business application rejected" })
  } catch (error) {
    console.error("Error rejecting business:", error)
    return NextResponse.json({ error: "Failed to reject business" }, { status: 500 })
  }
}
