import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  return NextResponse.json({
    message: "Seed endpoint available. Use POST to seed database.",
  });
}

export async function POST() {
  try {
    console.log("Starting database seed...");

    // Clear existing data (optional - remove if you want to keep existing data)
    await prisma.cartItem.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.review.deleteMany();
    await prisma.product.deleteMany();
    await prisma.businessDocument.deleteMany();
    await prisma.business.deleteMany();
    await prisma.category.deleteMany();
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();

    // Create categories
    const category = await prisma.category.create({
      data: {
        name: "Marinated Chicken",
        description: "Premium marinated chicken with signature recipes",
        image:
          "/placeholder.svg?height=200&width=200&query=marinated chicken category",
      },
    });

    console.log("Category created:", category.id);

    // Create admin user
    const hashedAdminPassword = await bcrypt.hash("admin123", 12);
    const adminUser = await prisma.user.create({
      data: {
        firstName: "Admin",
        lastName: "User",
        email: "admin@tmc.com",
        password: hashedAdminPassword,
        phone: "+923001234567",
        role: "ADMIN",
      },
    });

    console.log("Admin user created:", adminUser.id);

    // Create test consumer user
    const hashedConsumerPassword = await bcrypt.hash("consumer123", 12);
    const consumerUser = await prisma.user.create({
      data: {
        firstName: "John",
        lastName: "Doe",
        email: "consumer@test.com",
        password: hashedConsumerPassword,
        phone: "+923001234568",
        role: "CONSUMER",
      },
    });

    console.log("Consumer user created:", consumerUser.id);

    // Create test business user
    const hashedBusinessPassword = await bcrypt.hash("business123", 12);
    const businessUser = await prisma.user.create({
      data: {
        firstName: "Business",
        lastName: "Owner",
        email: "business@test.com",
        password: hashedBusinessPassword,
        phone: "+923001234569",
        role: "BUSINESS",
      },
    });

    // Create business profile
    const business = await prisma.business.create({
      data: {
        userId: businessUser.id,
        businessName: "Test Restaurant",
        businessType: "RESTAURANT",
        registrationNumber: "REG123456",
        taxId: "TAX789012",
        address: "123 Business Street",
        city: "Karachi",
        state: "Sindh",
        zipCode: "75000",
        contactPerson: "Business Owner",
        website: "https://testrestaurant.com",
        description: "A test restaurant for bulk orders",
        status: "APPROVED",
      },
    });

    console.log("Business created:", business.id);

    // Create consumer products (prices in PKR)
    const consumerProducts = [
      {
        name: "Consumer Pack - 4 Pieces",
        description:
          "Perfect for small families. All 6 signature recipes included.",
        price: 1299.0, // PKR
        originalPrice: 1599.0, // PKR
        size: "4 pieces",
        weight: "800g",
        userType: "CONSUMER",
        stockCount: 50,
        featured: true,
      },
      {
        name: "Consumer Pack - 8 Pieces",
        description:
          "Great for medium families. All 6 signature recipes included.",
        price: 2299.0, // PKR
        originalPrice: 2799.0, // PKR
        size: "8 pieces",
        weight: "1.6kg",
        userType: "CONSUMER",
        stockCount: 30,
        featured: true,
      },
      {
        name: "Consumer Pack - 1kg",
        description: "Premium quality marinated chicken, 1kg pack.",
        price: 1899.0, // PKR
        originalPrice: 2299.0, // PKR
        size: "1kg",
        weight: "1kg",
        userType: "CONSUMER",
        stockCount: 40,
      },
      {
        name: "Consumer Pack - 2kg",
        description: "Value pack for larger families. All recipes included.",
        price: 3499.0, // PKR
        originalPrice: 4299.0, // PKR
        size: "2kg",
        weight: "2kg",
        userType: "CONSUMER",
        stockCount: 25,
      },
    ];

    // Create business products (prices in PKR)
    const businessProducts = [
      {
        name: "Business Pack - 5kg",
        description:
          "Bulk pack for restaurants and catering. All 6 signature recipes.",
        price: 7999.0, // PKR
        originalPrice: 9999.0, // PKR
        size: "5kg",
        weight: "5kg",
        userType: "BUSINESS",
        stockCount: 20,
        featured: true,
      },
      {
        name: "Business Pack - 10kg",
        description:
          "Large bulk pack for commercial use. Premium quality guaranteed.",
        price: 14999.0, // PKR
        originalPrice: 18999.0, // PKR
        size: "10kg",
        weight: "10kg",
        userType: "BUSINESS",
        stockCount: 15,
        featured: true,
      },
      {
        name: "Business Pack - 15kg",
        description: "Extra large pack for high-volume businesses.",
        price: 21999.0, // PKR
        originalPrice: 27999.0, // PKR
        size: "15kg",
        weight: "15kg",
        userType: "BUSINESS",
        stockCount: 10,
      },
      {
        name: "Business Pack - 20kg",
        description: "Maximum bulk pack for large-scale operations.",
        price: 28999.0, // PKR
        originalPrice: 36999.0, // PKR
        size: "20kg",
        weight: "20kg",
        userType: "BUSINESS",
        stockCount: 8,
      },
    ];

    // Create all products
    for (const productData of [...consumerProducts, ...businessProducts]) {
      const product = await prisma.product.create({
        data: {
          ...productData,
          categoryId: category.id,
          images: [
            `/placeholder.svg?height=400&width=400&query=${productData.name
              .toLowerCase()
              .replace(/\s+/g, "-")}`,
          ],
          inStock: true,
        },
      });
      console.log("Product created:", product.name);
    }

    console.log("Database seeded successfully!");
    return NextResponse.json({
      message: "Database seeded successfully",
      data: {
        adminEmail: "admin@tmc.com",
        adminPassword: "admin123",
        consumerEmail: "consumer@test.com",
        consumerPassword: "consumer123",
        businessEmail: "business@test.com",
        businessPassword: "business123",
      },
    });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json(
      {
        error: "Failed to seed database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
