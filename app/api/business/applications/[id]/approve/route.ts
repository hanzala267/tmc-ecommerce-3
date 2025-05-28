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

    const business = await prisma.business.update({
      where: {
        id: params.id,
      },
      data: {
        status: "APPROVED",
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

    // TODO: Send approval email to business user
    console.log(`Business approved: ${business.businessName} for user ${business.user.email}`)

    return NextResponse.json({ message: "Business application approved" })
  } catch (error) {
    console.error("Error approving business:", error)
    return NextResponse.json({ error: "Failed to approve business" }, { status: 500 })
  }
}
