"use client";

import type React from "react";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Leaf,
  Mail,
  Lock,
  User,
  Phone,
  Building,
  MapPin,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState("consumer");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [businessData, setBusinessData] = useState({
    businessName: "",
    businessType: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    contactPerson: "",
    website: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Error",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType,
        ...(userType === "business" && { businessData }),
      };

      console.log("Sending registration payload:", payload);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast({
        title: "Success!",
        description:
          userType === "business"
            ? "Business account created successfully! Your account is pending approval."
            : "Account created successfully! You can now sign in.",
      });

      // Redirect to login page
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBusinessDataChange = (field: string, value: string) => {
    setBusinessData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-emerald-200 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              className="flex justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center">
                <Leaf className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold text-emerald-900">
                Join TMC
              </CardTitle>
              <p className="text-emerald-600 mt-2">
                Create your account to start ordering
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Type Selection */}
              <div className="space-y-3">
                <Label className="text-emerald-800">Account Type</Label>
                <RadioGroup
                  value={userType}
                  onValueChange={setUserType}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 border border-emerald-200 rounded-lg p-3 hover:bg-emerald-50">
                    <RadioGroupItem value="consumer" id="consumer" />
                    <Label htmlFor="consumer" className="cursor-pointer">
                      <div>
                        <div className="font-medium text-emerald-900">
                          Consumer
                        </div>
                        <div className="text-xs text-emerald-600">
                          Personal orders
                        </div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border border-emerald-200 rounded-lg p-3 hover:bg-emerald-50">
                    <RadioGroupItem value="business" id="business" />
                    <Label htmlFor="business" className="cursor-pointer">
                      <div>
                        <div className="font-medium text-emerald-900">
                          Business
                        </div>
                        <div className="text-xs text-emerald-600">
                          Bulk orders
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-emerald-800">
                    First Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-5 w-5" />
                    <Input
                      id="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className="pl-10 border-emerald-200 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-emerald-800">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="border-emerald-200 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-emerald-800">
                  Email Address *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10 border-emerald-200 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-emerald-800">
                  Phone Number *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-5 w-5" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="pl-10 border-emerald-200 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-emerald-800">
                    Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-5 w-5" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="pl-10 pr-10 border-emerald-200 focus:border-emerald-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 hover:text-emerald-800"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-emerald-800">
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-5 w-5" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      className="pl-10 pr-10 border-emerald-200 focus:border-emerald-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 hover:text-emerald-800"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              {userType === "business" && (
                <motion.div
                  className="space-y-4 border border-emerald-200 rounded-lg p-4 bg-emerald-50"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="font-semibold text-emerald-900">
                    Business Information
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="businessName"
                        className="text-emerald-800"
                      >
                        Business Name *
                      </Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-5 w-5" />
                        <Input
                          id="businessName"
                          placeholder="Your business name"
                          value={businessData.businessName}
                          onChange={(e) =>
                            handleBusinessDataChange(
                              "businessName",
                              e.target.value
                            )
                          }
                          className="pl-10 border-emerald-200 focus:border-emerald-500"
                          required={userType === "business"}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="businessType"
                        className="text-emerald-800"
                      >
                        Business Type *
                      </Label>
                      <Select
                        value={businessData.businessType}
                        onValueChange={(value) =>
                          handleBusinessDataChange("businessType", value)
                        }
                      >
                        <SelectTrigger className="border-emerald-200 focus:border-emerald-500">
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RESTAURANT">Restaurant</SelectItem>
                          <SelectItem value="CATERING">Catering</SelectItem>
                          <SelectItem value="RETAIL">Retail</SelectItem>
                          <SelectItem value="DISTRIBUTOR">
                            Distributor
                          </SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-emerald-800">
                      Business Address *
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-emerald-600 h-5 w-5" />
                      <Textarea
                        id="address"
                        placeholder="Complete business address"
                        value={businessData.address}
                        onChange={(e) =>
                          handleBusinessDataChange("address", e.target.value)
                        }
                        className="pl-10 border-emerald-200 focus:border-emerald-500"
                        required={userType === "business"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-emerald-800">
                        City *
                      </Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={businessData.city}
                        onChange={(e) =>
                          handleBusinessDataChange("city", e.target.value)
                        }
                        className="border-emerald-200 focus:border-emerald-500"
                        required={userType === "business"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-emerald-800">
                        State *
                      </Label>
                      <Input
                        id="state"
                        placeholder="State"
                        value={businessData.state}
                        onChange={(e) =>
                          handleBusinessDataChange("state", e.target.value)
                        }
                        className="border-emerald-200 focus:border-emerald-500"
                        required={userType === "business"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode" className="text-emerald-800">
                        Zip Code *
                      </Label>
                      <Input
                        id="zipCode"
                        placeholder="12345"
                        value={businessData.zipCode}
                        onChange={(e) =>
                          handleBusinessDataChange("zipCode", e.target.value)
                        }
                        className="border-emerald-200 focus:border-emerald-500"
                        required={userType === "business"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="contactPerson"
                        className="text-emerald-800"
                      >
                        Contact Person *
                      </Label>
                      <Input
                        id="contactPerson"
                        placeholder="Contact person name"
                        value={businessData.contactPerson}
                        onChange={(e) =>
                          handleBusinessDataChange(
                            "contactPerson",
                            e.target.value
                          )
                        }
                        className="border-emerald-200 focus:border-emerald-500"
                        required={userType === "business"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-emerald-800">
                        Website (Optional)
                      </Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-5 w-5" />
                        <Input
                          id="website"
                          placeholder="https://yourwebsite.com"
                          value={businessData.website}
                          onChange={(e) =>
                            handleBusinessDataChange("website", e.target.value)
                          }
                          className="pl-10 border-emerald-200 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-emerald-800">
                      Business Description (Optional)
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of your business"
                      value={businessData.description}
                      onChange={(e) =>
                        handleBusinessDataChange("description", e.target.value)
                      }
                      className="border-emerald-200 focus:border-emerald-500"
                    />
                  </div>
                </motion.div>
              )}

              {/* Terms Agreement */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) =>
                    handleInputChange("agreeToTerms", checked)
                  }
                  className="border-emerald-300 mt-1"
                />
                <Label
                  htmlFor="terms"
                  className="text-sm text-emerald-700 leading-relaxed"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-emerald-600 hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-emerald-600 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3"
                  disabled={!formData.agreeToTerms || isLoading}
                >
                  {isLoading
                    ? "Creating Account..."
                    : userType === "business"
                    ? "Register Business Account"
                    : "Create Account"}
                </Button>
              </motion.div>
            </form>

            {userType === "business" && (
              <motion.div
                className="bg-emerald-50 border border-emerald-200 rounded-lg p-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="font-medium text-emerald-900 mb-2">
                  Business Account Benefits:
                </h4>
                <ul className="text-sm text-emerald-700 space-y-1">
                  <li>• Access to bulk packages (5kg, 10kg, 15kg, 20kg)</li>
                  <li>• Special business pricing in PKR</li>
                  <li>• Priority customer support</li>
                  <li>• Account requires admin approval</li>
                </ul>
              </motion.div>
            )}

            <div className="text-center">
              <p className="text-emerald-700">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-emerald-600 hover:text-emerald-800 font-medium hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
