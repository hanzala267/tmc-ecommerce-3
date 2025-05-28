import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number is required"),
  userType: z.enum(["consumer", "business"]),
  businessData: z
    .object({
      businessName: z.string().min(1, "Business name is required"),
      businessType: z.enum([
        "RESTAURANT",
        "CATERING",
        "RETAIL",
        "DISTRIBUTOR",
        "OTHER",
      ]),
      address: z.string().min(1, "Address is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      zipCode: z.string().min(1, "Zip code is required"),
      contactPerson: z.string().min(1, "Contact person is required"),
      website: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Registration request body:", body);

    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        password: hashedPassword,
        phone: validatedData.phone,
        role: validatedData.userType === "business" ? "BUSINESS" : "CONSUMER",
      },
    });

    console.log("User created:", user.id);

    // Create business if user type is business
    if (validatedData.userType === "business" && validatedData.businessData) {
      const business = await prisma.business.create({
        data: {
          userId: user.id,
          businessName: validatedData.businessData.businessName,
          businessType: validatedData.businessData.businessType,
          address: validatedData.businessData.address,
          city: validatedData.businessData.city,
          state: validatedData.businessData.state,
          zipCode: validatedData.businessData.zipCode,
          contactPerson: validatedData.businessData.contactPerson,
          website: validatedData.businessData.website,
          description: validatedData.businessData.description,
          status: "PENDING", // Business accounts need approval
        },
      });
      console.log("Business created:", business.id);
    }

    return NextResponse.json(
      {
        message: "User registered successfully",
        userId: user.id,
        requiresApproval: validatedData.userType === "business",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
