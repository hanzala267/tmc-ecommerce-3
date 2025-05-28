"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Leaf, Eye, EyeOff, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push(callbackUrl);
    }
  }, [session, status, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      } else if (result?.ok) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });

        // Small delay to ensure session is updated
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 100);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-emerald-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Leaf className="h-12 w-12 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-emerald-900">
              Welcome Back
            </CardTitle>
            <p className="text-emerald-600">Sign in to your TMC account</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-emerald-800"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-emerald-200 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-emerald-800"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-emerald-200 focus:border-emerald-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-emerald-600 hover:text-emerald-800"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-emerald-700">
                Don't have an account?{" "}
                <Link
                  href="/auth/register"
                  className="font-medium text-emerald-600 hover:text-emerald-800"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {/* Demo Credentials Section */}
            <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h4 className="font-semibold text-emerald-900 mb-3 text-center">
                Demo Accounts
              </h4>
              <div className="space-y-3 text-sm">
                <div className="bg-white rounded-md p-3 border border-emerald-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-emerald-800">
                      👑 Admin Account
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail("admin@tmc.com");
                        setPassword("admin123");
                      }}
                      className="text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700"
                    >
                      Use
                    </button>
                  </div>
                  <div className="text-emerald-600">
                    <div>Email: admin@tmc.com</div>
                    <div>Password: admin123</div>
                  </div>
                </div>

                <div className="bg-white rounded-md p-3 border border-emerald-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-emerald-800">
                      👤 Consumer Account
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail("consumer@test.com");
                        setPassword("consumer123");
                      }}
                      className="text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700"
                    >
                      Use
                    </button>
                  </div>
                  <div className="text-emerald-600">
                    <div>Email: consumer@test.com</div>
                    <div>Password: consumer123</div>
                  </div>
                </div>

                <div className="bg-white rounded-md p-3 border border-emerald-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-emerald-800">
                      🏢 Business Account
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail("business@test.com");
                        setPassword("business123");
                      }}
                      className="text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700"
                    >
                      Use
                    </button>
                  </div>
                  <div className="text-emerald-600">
                    <div>Email: business@test.com</div>
                    <div>Password: business123</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-emerald-600 text-center">
                Click "Use" to auto-fill credentials for testing
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
