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
import { useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/navigation/navbar";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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

// Enhanced Product Showcase Component with better mobile responsiveness
const EnhancedProductShowcase = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
        // Fallback mock data for demo
        setProducts([
          {
            id: 1,
            name: "Tandoori Chicken",
            price: 850,
            description:
              "Authentic tandoori marinated chicken with traditional spices",
            images: [
              "/placeholder.svg?height=450&width=450&query=tandoori chicken",
            ],
            averageRating: 4.8,
            category: { name: "Spicy" },
            _count: { reviews: 124 },
          },
          {
            id: 2,
            name: "BBQ Chicken",
            price: 900,
            description: "Smoky BBQ marinated chicken with honey glaze",
            images: ["/placeholder.svg?height=450&width=450&query=bbq chicken"],
            averageRating: 4.9,
            category: { name: "BBQ" },
            _count: { reviews: 98 },
          },
          {
            id: 3,
            name: "Herb Chicken",
            price: 800,
            description: "Fresh herbs and garlic marinated chicken",
            images: [
              "/placeholder.svg?height=450&width=450&query=herb chicken",
            ],
            averageRating: 4.7,
            category: { name: "Mild" },
            _count: { reviews: 156 },
          },
        ]);
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
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left side - Product Image and Navigation */}
        <motion.div
          className="relative order-2 lg:order-1"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className={`relative mx-auto ${
              isMobile
                ? "h-[300px] w-[300px]"
                : "h-[400px] w-[400px] lg:h-[450px] lg:w-[450px]"
            }`}
          >
            {/* Main product image */}
            <motion.div
              className="absolute inset-0 rounded-full overflow-hidden border-4 lg:border-8 border-emerald-100 shadow-2xl"
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
              <div className="absolute bottom-4 lg:bottom-8 left-0 right-0 text-center px-4">
                <h3 className="text-white text-lg lg:text-2xl font-bold drop-shadow-lg">
                  {currentProduct.name}
                </h3>
                <div className="flex justify-center items-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 lg:w-4 lg:h-4 ${
                        i < Math.floor(currentProduct.averageRating || 0)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-white text-xs lg:text-sm ml-2">
                    {currentProduct.averageRating?.toFixed(1) || "0.0"}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Circular navigation indicators - Hidden on mobile */}
            {!isMobile && (
              <div className="absolute inset-0">
                {products.map((_, index) => {
                  const angle = (index * 360) / products.length;
                  const isActive = index === currentIndex;

                  return (
                    <motion.div
                      key={index}
                      className={`absolute w-3 h-3 lg:w-4 lg:h-4 rounded-full cursor-pointer ${
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
            )}

            {/* Navigation buttons */}
            <button
              className={`absolute top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-emerald-50 transition-colors ${
                isMobile ? "-left-2" : "-left-4"
              }`}
              onClick={prevProduct}
              aria-label="Previous product"
            >
              <ChevronLeft className="h-4 w-4 lg:h-6 lg:w-6 text-emerald-700" />
            </button>
            <button
              className={`absolute top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-emerald-50 transition-colors ${
                isMobile ? "-right-2" : "-right-4"
              }`}
              onClick={nextProduct}
              aria-label="Next product"
            >
              <ChevronRight className="h-4 w-4 lg:h-6 lg:w-6 text-emerald-700" />
            </button>
          </div>

          {/* Small product previews */}
          <div className="flex justify-center mt-6 lg:mt-8 space-x-2 lg:space-x-4 overflow-x-auto pb-2">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                className={`flex-shrink-0 w-8 h-8 lg:w-12 lg:h-12 rounded-full overflow-hidden cursor-pointer border-2 ${
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
          className="space-y-4 lg:space-y-6 order-1 lg:order-2"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-2xl lg:text-3xl font-bold text-emerald-900">
                {currentProduct.name}
              </h2>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium w-fit">
                {currentProduct.category?.name}
              </span>
            </div>

            <div className="flex items-center mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 lg:w-5 lg:h-5 ${
                    i < Math.floor(currentProduct.averageRating || 0)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-emerald-700 ml-2 text-sm lg:text-base">
                {currentProduct.averageRating?.toFixed(1) || "0.0"} (
                {currentProduct._count?.reviews || 0} reviews)
              </span>
            </div>

            <p className="text-xl lg:text-2xl font-bold text-emerald-700 mt-4">
              PKR {currentProduct.price}
            </p>
          </div>

          <div>
            <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
              {currentProduct.description}
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 lg:gap-4">
            <Button
              size={isMobile ? "default" : "lg"}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
            >
              <ShoppingCart className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
              Add to Cart
            </Button>
            <Link href={`/products/${currentProduct.id}`} className="flex-1">
              <Button
                size={isMobile ? "default" : "lg"}
                variant="outline"
                className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                View Details
                <ChevronRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
              </Button>
            </Link>
          </div>

          {/* Product indicators - Mobile only */}
          {isMobile && (
            <div className="flex justify-center space-x-2 pt-4">
              {products.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-emerald-600 scale-125"
                      : "bg-emerald-200 hover:bg-emerald-400"
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// GSAP Scroll Animation Section
const GSAPScrollSection = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const cards = cardsRef.current;

    if (!section || !title) return;

    // Title animation
    gsap.fromTo(
      title,
      {
        y: 100,
        opacity: 0,
        scale: 0.8,
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      }
    );

    // Cards animation
    cards.forEach((card, index) => {
      if (card) {
        gsap.fromTo(
          card,
          {
            y: 80,
            opacity: 0,
            rotateX: 45,
          },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.8,
            delay: index * 0.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    });

    // Floating animation for cards
    cards.forEach((card) => {
      if (card) {
        gsap.to(card, {
          y: -10,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut",
          delay: Math.random() * 2,
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const features = [
    {
      title: "Farm Fresh",
      description: "Sourced directly from local farms",
      icon: "🚜",
      color: "from-green-400 to-emerald-600",
    },
    {
      title: "Expert Chefs",
      description: "Marinated by culinary professionals",
      icon: "👨‍🍳",
      color: "from-blue-400 to-indigo-600",
    },
    {
      title: "Quick Delivery",
      description: "Fresh to your door in hours",
      icon: "🚚",
      color: "from-purple-400 to-pink-600",
    },
    {
      title: "Quality Assured",
      description: "100% satisfaction guaranteed",
      icon: "✅",
      color: "from-orange-400 to-red-600",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div ref={titleRef} className="text-center mb-16">
          <h2 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Why We're Different
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the perfect blend of tradition and innovation in every
            bite
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => (cardsRef.current[index] = el)}
              className="group"
            >
              <div
                className={`bg-gradient-to-br ${feature.color} p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-white text-center h-full`}
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/90">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
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
                  🍗 Premium Quality, Seasoned to Sizzle
                </motion.div>

                <motion.h1
                  className="text-4xl md:text-6xl lg:text-8xl font-bold leading-tight"
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
                  className="text-lg lg:text-xl text-emerald-700 max-w-lg leading-relaxed"
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
                className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 space-y-4 sm:space-y-0 pt-6"
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
                  src="/hero-marinated-chicken.jpg"
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

      {/* Enhanced Signature Collection Section with better mobile responsiveness */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-emerald-100 via-emerald-50 to-emerald-100">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12 lg:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1 bg-emerald-200 rounded-full text-emerald-800 text-sm font-medium mb-4">
              PREMIUM SELECTION
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-900 to-emerald-700 bg-clip-text text-transparent mb-4">
              Our Signature Collection
            </h2>
            <p className="text-lg lg:text-xl text-emerald-700 max-w-2xl mx-auto">
              Discover our most popular marinated chicken varieties - each
              recipe perfected over years of culinary expertise
            </p>
          </motion.div>

          <EnhancedProductShowcase />
        </div>
      </section>
      {/* 
      GSAP Scroll Animation Section
      <GSAPScrollSection /> */}

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-900 to-emerald-700 bg-clip-text text-transparent mb-4">
              Why Choose Marinzo?
            </h2>
            <p className="text-lg lg:text-xl text-emerald-700 max-w-2xl mx-auto">
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
                  <CardContent className="p-6 lg:p-8 text-center h-full flex flex-col">
                    <motion.div
                      className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="h-8 w-8 lg:h-10 lg:w-10 text-emerald-600" />
                    </motion.div>
                    <h3 className="text-lg lg:text-xl font-bold text-emerald-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-emerald-700 flex-grow text-sm lg:text-base">
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
            <h2 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-900 to-emerald-700 bg-clip-text text-transparent mb-4">
              Delivery & Service
            </h2>
            <p className="text-lg lg:text-xl text-emerald-700 max-w-2xl mx-auto">
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
                  <CardContent className="p-6 lg:p-8 text-center">
                    <motion.div
                      className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <service.icon className="h-8 w-8 lg:h-10 lg:w-10 text-emerald-600" />
                    </motion.div>
                    <h3 className="text-lg lg:text-xl font-bold text-emerald-900 mb-4">
                      {service.title}
                    </h3>
                    <p className="text-emerald-700 mb-4 text-sm lg:text-base">
                      {service.description}
                    </p>
                    <div className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span className="text-xs lg:text-sm text-emerald-700">
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
      <section className="my-12 py-20 bg-gradient-to-r from-emerald-50 to-emerald-100 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
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
                <p className="text-emerald-900 text-sm lg:text-lg">
                  {stat.label}
                </p>
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
                <Image
                  src="/logo-w.png"
                  alt="Marinzo Logo"
                  width={150}
                  height={100}
                  className="rounded-lg"
                />
              </div>
              <p className="text-emerald-200 mb-4 text-sm lg:text-base">
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
                  className="block text-emerald-200 hover:text-white transition-colors text-sm lg:text-base"
                >
                  Products
                </Link>
                <Link
                  href="/about"
                  className="block text-emerald-200 hover:text-white transition-colors text-sm lg:text-base"
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className="block text-emerald-200 hover:text-white transition-colors text-sm lg:text-base"
                >
                  Contact
                </Link>
                <Link
                  href="/orders"
                  className="block text-emerald-200 hover:text-white transition-colors text-sm lg:text-base"
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
                  className="block text-emerald-200 hover:text-white transition-colors text-sm lg:text-base"
                >
                  Business Registration
                </Link>
                <Link
                  href="/products?userType=BUSINESS"
                  className="block text-emerald-200 hover:text-white transition-colors text-sm lg:text-base"
                >
                  Bulk Orders
                </Link>
                <Link
                  href="/business/dashboard"
                  className="block text-emerald-200 hover:text-white transition-colors text-sm lg:text-base"
                >
                  Business Dashboard
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-lg">Contact Info</h3>
              <div className="space-y-3 text-emerald-200 text-sm lg:text-base">
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

          <div className="border-t border-emerald-700 mt-12 pt-8 text-center text-emerald-200 text-sm lg:text-base">
            <p>
              &copy; 2024 Marinzo - The Marinated Chicken. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
