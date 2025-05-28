const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create category
  const category = await prisma.category.upsert({
    where: { name: "Marinated Chicken" },
    update: {},
    create: {
      name: "Marinated Chicken",
      description: "Premium marinated chicken with signature recipes",
      image: "/placeholder.svg?height=200&width=200&query=marinated chicken category",
    },
  })
  console.log("✅ Category created")

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12)
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@tmc.com" },
    update: {},
    create: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@tmc.com",
      password: hashedPassword,
      phone: "+1234567890",
      role: "ADMIN",
    },
  })
  console.log("✅ Admin user created: admin@tmc.com / admin123")

  // Create test consumer user
  const consumerPassword = await bcrypt.hash("consumer123", 12)
  const consumerUser = await prisma.user.upsert({
    where: { email: "consumer@test.com" },
    update: {},
    create: {
      firstName: "John",
      lastName: "Doe",
      email: "consumer@test.com",
      password: consumerPassword,
      phone: "+1234567891",
      role: "CONSUMER",
    },
  })
  console.log("✅ Test consumer created: consumer@test.com / consumer123")

  // Create test business user
  const businessPassword = await bcrypt.hash("business123", 12)
  const businessUser = await prisma.user.upsert({
    where: { email: "business@test.com" },
    update: {},
    create: {
      firstName: "Jane",
      lastName: "Smith",
      email: "business@test.com",
      password: businessPassword,
      phone: "+1234567892",
      role: "BUSINESS",
    },
  })

  // Create business profile
  await prisma.business.upsert({
    where: { userId: businessUser.id },
    update: {},
    create: {
      userId: businessUser.id,
      businessName: "Test Restaurant",
      businessType: "RESTAURANT",
      address: "123 Business St",
      city: "Business City",
      state: "BC",
      zipCode: "12345",
      contactPerson: "Jane Smith",
      description: "Test restaurant for bulk orders",
      status: "APPROVED",
    },
  })
  console.log("✅ Test business created: business@test.com / business123")

  // Consumer products
  const consumerProducts = [
    {
      name: "Consumer Pack - 4 Pieces",
      description: "Perfect for small families. All 6 signature recipes included.",
      price: 12.99,
      originalPrice: 15.99,
      size: "4 pieces",
      weight: "800g",
      userType: "CONSUMER",
      stockCount: 50,
      featured: true,
    },
    {
      name: "Consumer Pack - 8 Pieces",
      description: "Great for medium families. All 6 signature recipes included.",
      price: 22.99,
      originalPrice: 27.99,
      size: "8 pieces",
      weight: "1.6kg",
      userType: "CONSUMER",
      stockCount: 30,
      featured: true,
    },
    {
      name: "Consumer Pack - 1kg",
      description: "Premium quality marinated chicken, 1kg pack.",
      price: 18.99,
      originalPrice: 22.99,
      size: "1kg",
      weight: "1kg",
      userType: "CONSUMER",
      stockCount: 40,
    },
    {
      name: "Consumer Pack - 2kg",
      description: "Value pack for larger families. All recipes included.",
      price: 34.99,
      originalPrice: 42.99,
      size: "2kg",
      weight: "2kg",
      userType: "CONSUMER",
      stockCount: 25,
    },
  ]

  // Business products
  const businessProducts = [
    {
      name: "Business Pack - 5kg",
      description: "Bulk pack for restaurants and catering. All 6 signature recipes.",
      price: 79.99,
      originalPrice: 99.99,
      size: "5kg",
      weight: "5kg",
      userType: "BUSINESS",
      stockCount: 20,
      featured: true,
    },
    {
      name: "Business Pack - 10kg",
      description: "Large bulk pack for commercial use. Premium quality guaranteed.",
      price: 149.99,
      originalPrice: 189.99,
      size: "10kg",
      weight: "10kg",
      userType: "BUSINESS",
      stockCount: 15,
      featured: true,
    },
    {
      name: "Business Pack - 15kg",
      description: "Extra large pack for high-volume businesses.",
      price: 219.99,
      originalPrice: 279.99,
      size: "15kg",
      weight: "15kg",
      userType: "BUSINESS",
      stockCount: 10,
    },
    {
      name: "Business Pack - 20kg",
      description: "Maximum bulk pack for large-scale operations.",
      price: 289.99,
      originalPrice: 369.99,
      size: "20kg",
      weight: "20kg",
      userType: "BUSINESS",
      stockCount: 8,
    },
  ]

  // Create all products
  for (const productData of [...consumerProducts, ...businessProducts]) {
    await prisma.product.upsert({
      where: { name: productData.name },
      update: {},
      create: {
        ...productData,
        categoryId: category.id,
        images: [`/placeholder.svg?height=400&width=400&query=${productData.name.toLowerCase().replace(/\s+/g, "-")}`],
        inStock: true,
      },
    })
  }
  console.log("✅ Products created (4 consumer + 4 business)")

  console.log("🎉 Database seeded successfully!")
  console.log("\n📋 Test Accounts:")
  console.log("👑 Admin: admin@tmc.com / admin123")
  console.log("👤 Consumer: consumer@test.com / consumer123")
  console.log("🏢 Business: business@test.com / business123")
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
