"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Leaf,
  Star,
  Award,
  Clock,
  Shield,
  Package,
  Truck,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navigation/navbar";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Enhanced Product Showcase Component with real data
const EnhancedProductShowcase = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured products from API
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch("/api/products/featured");
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    if (!isHovered && products.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [products.length, isHovered]);

  const nextProduct = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const prevProduct = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center py-20">
          <p className="text-emerald-700 text-lg">
            No featured products available at the moment.
          </p>
        </div>
      </div>
    );
  }

  const currentProduct = products[currentIndex];

  return (
    <div className="container mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Product Image and Circular Navigation */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative h-[450px] w-full max-w-[450px] mx-auto">
            {/* Main product image */}
            <motion.div
              className="absolute inset-0 rounded-full overflow-hidden border-8 border-emerald-100 shadow-2xl"
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src={
                  currentProduct.images?.[0] ||
                  "/placeholder.svg?height=450&width=450&query=marinated chicken"
                }
                alt={currentProduct.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 to-transparent" />

              {/* Product name overlay */}
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <h3 className="text-white text-2xl font-bold drop-shadow-lg">
                  {currentProduct.name}
                </h3>
                <div className="flex justify-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(currentProduct.averageRating || 0)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-white text-sm ml-2">
                    {currentProduct.averageRating?.toFixed(1) || "0.0"}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Circular navigation indicators */}
            <div className="absolute inset-0">
              {products.map((_, index) => {
                const angle = (index * 360) / products.length;
                const isActive = index === currentIndex;

                return (
                  <motion.div
                    key={index}
                    className={`absolute w-4 h-4 rounded-full cursor-pointer ${
                      isActive
                        ? "bg-emerald-500 scale-125"
                        : "bg-emerald-200 hover:bg-emerald-300"
                    }`}
                    style={{
                      top: `${50 - 45 * Math.cos((angle * Math.PI) / 180)}%`,
                      left: `${50 + 45 * Math.sin((angle * Math.PI) / 180)}%`,
                    }}
                    onClick={() => setCurrentIndex(index)}
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.2 }}
                  />
                );
              })}
            </div>

            {/* Navigation buttons */}
            <button
              className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-emerald-50 transition-colors"
              onClick={prevProduct}
              aria-label="Previous product"
            >
              <ChevronLeft className="h-6 w-6 text-emerald-700" />
            </button>
            <button
              className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-emerald-50 transition-colors"
              onClick={nextProduct}
              aria-label="Next product"
            >
              <ChevronRight className="h-6 w-6 text-emerald-700" />
            </button>
          </div>

          {/* Small product previews */}
          <div className="flex justify-center mt-8 space-x-4 overflow-x-auto pb-2">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                className={`flex-shrink-0 w-12 h-12 rounded-full overflow-hidden cursor-pointer border-2 ${
                  index === currentIndex
                    ? "border-emerald-500 ring-2 ring-emerald-300"
                    : "border-gray-200"
                }`}
                onClick={() => setCurrentIndex(index)}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <Image
                  src={
                    product.images?.[0] ||
                    "/placeholder.svg?height=48&width=48&query=marinated chicken"
                  }
                  alt={product.name}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right side - Product Details */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-emerald-900">
                {currentProduct.name}
              </h2>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                {currentProduct.category?.name}
              </span>
            </div>

            <div className="flex items-center mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(currentProduct.averageRating || 0)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-emerald-700 ml-2">
                {currentProduct.averageRating?.toFixed(1) || "0.0"} (
                {currentProduct._count?.reviews || 0} reviews)
              </span>
            </div>

            <p className="text-2xl font-bold text-emerald-700 mt-4">
              PKR {currentProduct.price}
            </p>
          </div>

          <div>
            <p className="text-gray-600 leading-relaxed">
              {currentProduct.description}
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Link href={`/products/${currentProduct.id}`} className="flex-1">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                View Details
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Product indicators */}
          <div className="flex justify-center space-x-2 pt-4">
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-emerald-600 scale-125"
                    : "bg-emerald-200 hover:bg-emerald-400"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    let startTime = null;
    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      onViewportEnter={() => setIsVisible(true)}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="text-4xl font-bold text-emerald-900">
        {count}
        {suffix}
      </div>
    </motion.div>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-20 h-20 bg-emerald-200 rounded-full opacity-20"
            animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.div
            className="absolute top-40 right-20 w-16 h-16 bg-emerald-300 rounded-full opacity-20"
            animate={{ y: [0, 20, 0], rotate: [0, -180, -360] }}
            transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.div
            className="absolute bottom-20 left-1/4 w-12 h-12 bg-emerald-400 rounded-full opacity-20"
            animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div
            className="grid lg:grid-cols-2 gap-16 items-center"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp} className="space-y-8">
              <div className="space-y-6">
                <motion.div
                  className="inline-block px-4 py-2 bg-emerald-100 rounded-full text-emerald-700 font-medium text-sm"
                  variants={fadeInUp}
                >
                  🍗 Premium Quality Since 2020
                </motion.div>

                <motion.h1
                  className="text-6xl lg:text-8xl font-bold leading-tight"
                  variants={fadeInUp}
                >
                  <span className="bg-gradient-to-r from-emerald-900 to-emerald-700 bg-clip-text text-transparent">
                    Premium
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                    Marinated
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">
                    Chicken
                  </span>
                </motion.h1>

                <motion.p
                  className="text-xl text-emerald-700 max-w-lg leading-relaxed"
                  variants={fadeInUp}
                >
                  Experience the finest quality marinated chicken with our
                  signature recipes. Fresh, natural, and bursting with authentic
                  flavors that will transform your meals.
                </motion.p>
              </div>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                variants={fadeInUp}
              >
                <Link href="/products">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/business/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-4 text-lg"
                  >
                    Business Orders
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                className="flex items-center space-x-8 pt-6"
                variants={fadeInUp}
              >
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <span className="text-emerald-700 font-medium">
                    4.9/5 Rating
                  </span>
                </div>
                <div className="text-emerald-700">
                  <AnimatedCounter end={1000} suffix="+" />
                  <span className="text-sm">Happy Customers</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div variants={fadeInUp} className="relative">
              <div className="relative z-10">
                <Image
                  src="/hero-marinated-chicken.jpg" // Updated to a stock image
                  alt="Premium Marinated Chicken Platter"
                  width={500}
                  height={600}
                  className="rounded-3xl shadow-2xl"
                />

                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-xl border border-emerald-100"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-emerald-900">
                      Fresh Daily
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-emerald-100"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                >
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-900">
                      100% Natural
                    </span>
                  </div>
                </motion.div>
              </div>

              <motion.div
                className="absolute -top-8 -right-8 w-full h-full bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-3xl -z-10"
                animate={{
                  rotate: [0, 2, 0, -2, 0],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Signature Collection Section with real products */}
      <section className="py-24 bg-gradient-to-r from-emerald-100 via-emerald-50 to-emerald-100">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1 bg-emerald-200 rounded-full text-emerald-800 text-sm font-medium mb-4">
              PREMIUM SELECTION
            </span>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-emerald-900 to-emerald-700 bg-clip-text text-transparent mb-4">
              Our Signature Collection
            </h2>
            <p className="text-xl text-emerald-700 max-w-2xl mx-auto">
              Discover our most popular marinated chicken varieties - each
              recipe perfected over years of culinary expertise
            </p>
          </motion.div>

          <EnhancedProductShowcase />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold bg-gradient-to-r from-emerald-900 to-emerald-700 bg-clip-text text-transparent mb-4">
              Why Choose Marinzo?
            </h2>
            <p className="text-xl text-emerald-700 max-w-2xl mx-auto">
              We're committed to delivering the highest quality marinated
              chicken with exceptional service
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Leaf,
                title: "100% Natural",
                description:
                  "No artificial preservatives or chemicals. Just pure, natural ingredients.",
                color: "emerald",
              },
              {
                icon: Star,
                title: "Signature Recipes",
                description:
                  "Carefully crafted marinades that bring out the best flavors in every bite.",
                color: "yellow",
              },
              {
                icon: Clock,
                title: "Fresh Daily",
                description:
                  "Same-day preparation with cash on delivery for maximum freshness.",
                color: "blue",
              },
              {
                icon: Award,
                title: "Premium Quality",
                description:
                  "Award-winning recipes trusted by thousands of satisfied customers.",
                color: "purple",
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl group h-full">
                  <CardContent className="p-8 text-center h-full flex flex-col">
                    <motion.div
                      className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="h-10 w-10 text-emerald-600" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-emerald-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-emerald-700 flex-grow">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Delivery & Service Section */}
      <section className="py-20 bg-emerald-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold bg-gradient-to-r from-emerald-900 to-emerald-700 bg-clip-text text-transparent mb-4">
              Delivery & Service
            </h2>
            <p className="text-xl text-emerald-700 max-w-2xl mx-auto">
              Fast, reliable delivery service across Faisalabad with flexible
              payment options
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Truck,
                title: "Same Day Delivery",
                description:
                  "Order before 2 PM and get fresh chicken delivered the same day",
                features: [
                  "Free delivery over PKR 2,000",
                  "Faisalabad coverage",
                  "Real-time tracking",
                ],
              },
              {
                icon: Package,
                title: "Secure Packaging",
                description:
                  "Temperature-controlled packaging to maintain freshness during delivery",
                features: [
                  "Insulated containers",
                  "Leak-proof sealing",
                  "Hygiene certified",
                ],
              },
              {
                icon: CheckCircle,
                title: "Cash on Delivery",
                description:
                  "Pay when you receive your order - no advance payment required",
                features: [
                  "No hidden charges",
                  "Exact change preferred",
                  "Receipt provided",
                ],
              },
            ].map((service, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="border-emerald-200 hover:shadow-xl transition-all duration-300 group h-full">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <service.icon className="h-10 w-10 text-emerald-600" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-emerald-900 mb-4">
                      {service.title}
                    </h3>
                    <p className="text-emerald-700 mb-4">
                      {service.description}
                    </p>
                    <div className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm text-emerald-700">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className=" my-12 py-20 bg-gradient-to-r from-emerald-50 to-emerald-100 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid md:grid-cols-4 gap-8 text-center"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { number: 1000, suffix: "+", label: "Happy Customers" },
              { number: 50, suffix: "+", label: "Business Partners" },
              { number: 6, suffix: "", label: "Signature Recipes" },
              { number: 99, suffix: "%", label: "Customer Satisfaction" },
            ].map((stat, index) => (
              <motion.div key={index} variants={fadeInUp} className="space-y-2">
                <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                <p className="text-emerald-900 text-lg">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Leaf className="h-10 w-10 text-emerald-400" />
                <span className="text-3xl font-bold">Marinzo</span>
              </div>
              <p className="text-emerald-200 mb-4">
                Premium marinated chicken delivered fresh to your doorstep in
                Faisalabad.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-emerald-700 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-emerald-700 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-emerald-700 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">i</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-lg">Quick Links</h3>
              <div className="space-y-3">
                <Link
                  href="/products"
                  className="block text-emerald-200 hover:text-white transition-colors"
                >
                  Products
                </Link>
                <Link
                  href="/about"
                  className="block text-emerald-200 hover:text-white transition-colors"
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className="block text-emerald-200 hover:text-white transition-colors"
                >
                  Contact
                </Link>
                <Link
                  href="/orders"
                  className="block text-emerald-200 hover:text-white transition-colors"
                >
                  Track Order
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-lg">For Business</h3>
              <div className="space-y-3">
                <Link
                  href="/business/register"
                  className="block text-emerald-200 hover:text-white transition-colors"
                >
                  Business Registration
                </Link>
                <Link
                  href="/products?userType=BUSINESS"
                  className="block text-emerald-200 hover:text-white transition-colors"
                >
                  Bulk Orders
                </Link>
                <Link
                  href="/business/dashboard"
                  className="block text-emerald-200 hover:text-white transition-colors"
                >
                  Business Dashboard
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-lg">Contact Info</h3>
              <div className="space-y-3 text-emerald-200">
                <p className="flex items-center space-x-2">
                  <span>📞</span>
                  <span>+92 (300) 123-4567</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span>📧</span>
                  <span>info@marinzo-chicken.com</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span>📍</span>
                  <span>Faisalabad, Pakistan</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span>🕒</span>
                  <span>9 AM - 9 PM (Daily)</span>
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-emerald-700 mt-12 pt-8 text-center text-emerald-200">
            <p>
              &copy; 2024 Marinzo - The Marinated Chicken. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
