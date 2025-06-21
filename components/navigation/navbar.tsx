"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Leaf, ShoppingCart, User, Menu, X, LogOut } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      fetchCartCount();
    } else {
      setCartCount(0);
    }
  }, [session]);

  const fetchCartCount = async () => {
    try {
      const response = await fetch("/api/cart/count");
      if (response.ok) {
        const data = await response.json();
        setCartCount(data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
      setCartCount(0);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: "/",
        redirect: true,
      });
      setCartCount(0);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      if (session) {
        fetchCartCount();
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [session]);

  // Handle navigation with authentication check
  const handleProtectedNavigation = (path: string) => {
    if (!session) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(path)}`);
      return;
    }
    router.push(path);
  };

  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-emerald-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <Link href="/" className="flex items-center space-x-2">
              <span>
                <Image src="/logo.png" height={150} width={100} alt="marinzo" />
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/products"
              className="text-emerald-700 hover:text-emerald-900 transition-colors"
            >
              Products
            </Link>
            <Link
              href="/about"
              className="text-emerald-700 hover:text-emerald-900 transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-emerald-700 hover:text-emerald-900 transition-colors"
            >
              Contact
            </Link>
            {session?.user?.role === "BUSINESS" && (
              <Link
                href="/business/dashboard"
                className="text-emerald-700 hover:text-emerald-900 transition-colors"
              >
                Business
              </Link>
            )}
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin/dashboard"
                className="text-emerald-700 hover:text-emerald-900 transition-colors"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart - Only show if authenticated */}
            {session && (
              <Button
                variant="outline"
                size="sm"
                className="relative border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                onClick={() => handleProtectedNavigation("/cart")}
              >
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            )}

            {/* User Menu */}
            {status === "loading" ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {session.user.name?.split(" ")[0] || "User"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() => handleProtectedNavigation("/profile")}
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleProtectedNavigation("/orders")}
                  >
                    My Orders
                  </DropdownMenuItem>
                  {session.user.role === "BUSINESS" && (
                    <DropdownMenuItem
                      onClick={() => router.push("/business/dashboard")}
                    >
                      Business Dashboard
                    </DropdownMenuItem>
                  )}
                  {session.user.role === "ADMIN" && (
                    <DropdownMenuItem
                      onClick={() => router.push("/admin/dashboard")}
                    >
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="sm"
              className="md:hidden border-emerald-600 text-emerald-600"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pb-4 border-t border-emerald-200"
          >
            <div className="flex flex-col space-y-4 pt-4">
              <Link
                href="/products"
                className="text-emerald-700 hover:text-emerald-900 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/about"
                className="text-emerald-700 hover:text-emerald-900 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-emerald-700 hover:text-emerald-900 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              {session?.user?.role === "BUSINESS" && (
                <Link
                  href="/business/dashboard"
                  className="text-emerald-700 hover:text-emerald-900 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Business Dashboard
                </Link>
              )}
              {session?.user?.role === "ADMIN" && (
                <Link
                  href="/admin/dashboard"
                  className="text-emerald-700 hover:text-emerald-900 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}

              {/* Mobile Auth Actions */}
              {session ? (
                <div className="pt-4 border-t border-emerald-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="w-full text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="pt-4 border-t border-emerald-200 space-y-2">
                  <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                    <Button
                      size="sm"
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
