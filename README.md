# TMC - Premium Marinated Chicken E-commerce Platform

A modern, full-stack e-commerce website built with Next.js 14, featuring role-based access control, real-time cart management, and comprehensive business functionality.

## 🚀 Features

### 🛍️ **E-commerce Core**
- **Product Catalog** with search, filtering, and sorting
- **Shopping Cart** with persistent state management
- **Checkout Process** with Cash on Delivery (COD)
- **Order Management** with status tracking
- **User Reviews** and ratings system

### 👥 **User Management**
- **Multi-role Authentication** (Consumer, Business, Admin)
- **NextAuth.js** with Google OAuth and credentials
- **Role-based Access Control (RBAC)**
- **User Profiles** with editable information

### 🏢 **Business Features**
- **Business Registration** with multi-step form
- **Document Upload** for verification
- **Admin Approval Workflow** for business accounts
- **Bulk Product Access** for approved businesses
- **Special Business Pricing**

### 🔧 **Admin Dashboard**
- **Business Application Management**
- **Order Monitoring** and status updates
- **User Management** capabilities
- **Product Management** (CRUD operations)
- **Analytics** and reporting

### 🎨 **Design & UX**
- **Responsive Design** with Tailwind CSS
- **Framer Motion** animations
- **Nature-inspired** color scheme
- **Modern UI Components** with shadcn/ui
- **Toast Notifications** for user feedback

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **shadcn/ui** component library
- **Zustand** for state management

### **Backend**
- **Next.js API Routes** for server-side logic
- **Prisma ORM** with PostgreSQL
- **NextAuth.js** for authentication
- **Cloudinary** for image storage
- **bcryptjs** for password hashing

### **Database**
- **PostgreSQL** (Neon/Supabase)
- **Prisma** as ORM
- **Database seeding** for initial data

## 📦 Installation & Setup

### **Prerequisites**
- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Cloudinary account
- Google OAuth credentials

### **Environment Variables**
Create a `.env.local` file with:

\`\`\`env
# Database
DATABASE_URL="your-postgresql-connection-string"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
\`\`\`

### **Installation Steps**

1. **Install Dependencies**
\`\`\`bash
npm install
\`\`\`

2. **Setup Database**
\`\`\`bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed initial data
curl -X POST http://localhost:3000/api/seed
\`\`\`

3. **Run Development Server**
\`\`\`bash
npm run dev
\`\`\`

4. **Access the Application**
- Frontend: `http://localhost:3000`
- Admin Login: `admin@tmc.com` / `admin123`

## 🗂️ Project Structure

\`\`\`
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── business/          # Business features
│   ├── products/          # Product catalog
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   └── orders/            # Order management
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── navigation/       # Navigation components
│   └── providers/        # Context providers
├── lib/                  # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   └── store.ts          # Zustand stores
├── prisma/               # Database schema
└── middleware.ts         # Route protection
\`\`\`

## 🔐 Authentication & Authorization

### **User Roles**
- **Consumer**: Regular customers with access to consumer products
- **Business**: Bulk buyers with access to business products (requires approval)
- **Admin**: Full system access with management capabilities

### **Protected Routes**
- `/cart/*` - Requires authentication
- `/checkout/*` - Requires authentication
- `/orders/*` - Requires authentication
- `/business/dashboard/*` - Requires approved business account
- `/admin/*` - Requires admin role

## 🛒 E-commerce Features

### **Product Types**
- **Consumer Products**: 4-piece, 8-piece, 1kg, 2kg packs
- **Business Products**: 5kg, 10kg, 15kg, 20kg bulk packs

### **Payment Methods**
- **Cash on Delivery (COD)** - Primary payment method
- **Free Shipping** on all orders

### **Order Statuses**
- Pending → Confirmed → Processing → Shipped → Delivered

## 🏢 Business Workflow

1. **Registration**: Business users register with company details
2. **Document Upload**: Upload business verification documents
3. **Admin Review**: Admin reviews and approves/rejects applications
4. **Access Granted**: Approved businesses get access to bulk products and pricing

## 🚀 Deployment

### **Vercel Deployment**
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Database Setup**
- Use Neon or Supabase for PostgreSQL hosting
- Run migrations: `npx prisma db push`
- Seed data: `curl -X POST https://your-domain.com/api/seed`

## 🔧 Development

### **Available Scripts**
\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push database schema
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Generate Prisma client
\`\`\`

### **Database Management**
\`\`\`bash
# View database in browser
npx prisma studio

# Reset database
npx prisma db push --force-reset

# Generate new migration
npx prisma migrate dev
\`\`\`

## 📱 API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### **Products**
- `GET /api/products` - Get products with filtering
- `POST /api/products` - Create product (admin only)

### **Cart**
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/[id]` - Update cart item
- `DELETE /api/cart/[id]` - Remove cart item

### **Orders**
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order

### **Business**
- `GET /api/business/applications` - Get business applications (admin)
- `POST /api/business/applications/[id]/approve` - Approve business
- `POST /api/business/applications/[id]/reject` - Reject business

### **File Upload**
- `POST /api/upload` - Upload files to Cloudinary

## 🎨 Customization

### **Styling**
- Modify `tailwind.config.ts` for theme customization
- Update color scheme in `app/globals.css`
- Customize components in `components/ui/`

### **Business Logic**
- Extend Prisma schema in `prisma/schema.prisma`
- Add new API routes in `app/api/`
- Implement custom hooks in `lib/`

## 🐛 Troubleshooting

### **Common Issues**
1. **Database Connection**: Verify DATABASE_URL format
2. **Authentication**: Check NEXTAUTH_SECRET and OAuth credentials
3. **File Upload**: Verify Cloudinary configuration
4. **Build Errors**: Run `npx prisma generate` before building

### **Development Tips**
- Use `npx prisma studio` to inspect database
- Check browser console for client-side errors
- Monitor API responses in Network tab
- Use TypeScript for better error catching

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting section

---

**TMC - Premium Marinated Chicken** - Delivering quality and freshness with modern technology.
