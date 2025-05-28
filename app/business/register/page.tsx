"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building, Phone, FileText, Upload, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const steps = [
  { id: 1, title: "Business Information", icon: Building },
  { id: 2, title: "Contact Details", icon: Phone },
  { id: 3, title: "Documentation", icon: FileText },
  { id: 4, title: "Review & Submit", icon: CheckCircle },
];

export default function BusinessRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    registrationNumber: "",
    taxId: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    description: "",
    documents: [],
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log("Business registration submitted:", formData);
    // Handle submission logic
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">
            Business Registration
          </h1>
          <p className="text-emerald-700">
            Join our business partner program for bulk orders and special
            pricing
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    currentStep >= step.id
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-emerald-300 text-emerald-600"
                  }`}
                >
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="ml-3 hidden md:block">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.id
                        ? "text-emerald-900"
                        : "text-emerald-600"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-4 transition-all duration-300 ${
                      currentStep > step.id
                        ? "bg-emerald-600"
                        : "bg-emerald-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-emerald-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-emerald-900">
                Step {currentStep}: {steps[currentStep - 1].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Business Information */}
              {currentStep === 1 && (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="businessName"
                        className="text-emerald-800"
                      >
                        Business Name *
                      </Label>
                      <Input
                        id="businessName"
                        placeholder="Enter business name"
                        value={formData.businessName}
                        onChange={(e) =>
                          updateFormData("businessName", e.target.value)
                        }
                        className="border-emerald-200 focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="businessType"
                        className="text-emerald-800"
                      >
                        Business Type *
                      </Label>
                      <Select
                        value={formData.businessType}
                        onValueChange={(value) =>
                          updateFormData("businessType", value)
                        }
                      >
                        <SelectTrigger className="border-emerald-200">
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="catering">
                            Catering Service
                          </SelectItem>
                          <SelectItem value="retail">Retail Store</SelectItem>
                          <SelectItem value="distributor">
                            Distributor
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="registrationNumber"
                        className="text-emerald-800"
                      >
                        Business Registration Number
                      </Label>
                      <Input
                        id="registrationNumber"
                        placeholder="Enter registration number"
                        value={formData.registrationNumber}
                        onChange={(e) =>
                          updateFormData("registrationNumber", e.target.value)
                        }
                        className="border-emerald-200 focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxId" className="text-emerald-800">
                        Tax ID / EIN
                      </Label>
                      <Input
                        id="taxId"
                        placeholder="Enter tax ID"
                        value={formData.taxId}
                        onChange={(e) =>
                          updateFormData("taxId", e.target.value)
                        }
                        className="border-emerald-200 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-emerald-800">
                      Business Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your business and how you plan to use our products"
                      value={formData.description}
                      onChange={(e) =>
                        updateFormData("description", e.target.value)
                      }
                      className="border-emerald-200 focus:border-emerald-500 min-h-[100px]"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Contact Details */}
              {currentStep === 2 && (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-emerald-800">
                      Business Address *
                    </Label>
                    <Input
                      id="address"
                      placeholder="Enter street address"
                      value={formData.address}
                      onChange={(e) =>
                        updateFormData("address", e.target.value)
                      }
                      className="border-emerald-200 focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-emerald-800">
                        City *
                      </Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => updateFormData("city", e.target.value)}
                        className="border-emerald-200 focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-emerald-800">
                        State *
                      </Label>
                      <Input
                        id="state"
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) =>
                          updateFormData("state", e.target.value)
                        }
                        className="border-emerald-200 focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode" className="text-emerald-800">
                        ZIP Code *
                      </Label>
                      <Input
                        id="zipCode"
                        placeholder="ZIP Code"
                        value={formData.zipCode}
                        onChange={(e) =>
                          updateFormData("zipCode", e.target.value)
                        }
                        className="border-emerald-200 focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="contactPerson"
                        className="text-emerald-800"
                      >
                        Contact Person *
                      </Label>
                      <Input
                        id="contactPerson"
                        placeholder="Full name of contact person"
                        value={formData.contactPerson}
                        onChange={(e) =>
                          updateFormData("contactPerson", e.target.value)
                        }
                        className="border-emerald-200 focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-emerald-800">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={(e) =>
                          updateFormData("phone", e.target.value)
                        }
                        className="border-emerald-200 focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-emerald-800">
                        Business Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="business@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          updateFormData("email", e.target.value)
                        }
                        className="border-emerald-200 focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-emerald-800">
                        Website (Optional)
                      </Label>
                      <Input
                        id="website"
                        placeholder="https://www.example.com"
                        value={formData.website}
                        onChange={(e) =>
                          updateFormData("website", e.target.value)
                        }
                        className="border-emerald-200 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Documentation */}
              {currentStep === 3 && (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-emerald-900 mb-2">
                      Upload Business Documents
                    </h3>
                    <p className="text-emerald-700">
                      Please upload the following documents to verify your
                      business
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-emerald-800">
                        Required Documents
                      </h4>
                      <div className="space-y-3">
                        {[
                          "Business Registration Certificate",
                          "Tax Registration Document",
                          "Business License",
                        ].map((doc, index) => (
                          <div
                            key={index}
                            className="border-2 border-dashed border-emerald-300 rounded-lg p-4 text-center hover:border-emerald-500 transition-colors"
                          >
                            <Upload className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                            <p className="text-sm font-medium text-emerald-900">
                              {doc}
                            </p>
                            <p className="text-xs text-emerald-600 mt-1">
                              PDF, JPG, PNG (Max 5MB)
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 border-emerald-300 text-emerald-700"
                            >
                              Choose File
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-emerald-800">
                        Optional Documents
                      </h4>
                      <div className="space-y-3">
                        {[
                          "Food Service License",
                          "Health Department Permit",
                          "Insurance Certificate",
                        ].map((doc, index) => (
                          <div
                            key={index}
                            className="border-2 border-dashed border-emerald-200 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors"
                          >
                            <Upload className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                            <p className="text-sm font-medium text-emerald-800">
                              {doc}
                            </p>
                            <p className="text-xs text-emerald-600 mt-1">
                              PDF, JPG, PNG (Max 5MB)
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 border-emerald-200 text-emerald-600"
                            >
                              Choose File
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <h4 className="font-medium text-emerald-900 mb-2">
                      Document Guidelines:
                    </h4>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• All documents must be clear and legible</li>
                      <li>• Documents should be current and valid</li>
                      <li>• File size should not exceed 5MB per document</li>
                      <li>• Accepted formats: PDF, JPG, PNG</li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-emerald-900 mb-2">
                      Review Your Information
                    </h3>
                    <p className="text-emerald-700">
                      Please review all information before submitting your
                      application
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-emerald-200">
                      <CardHeader>
                        <CardTitle className="text-lg text-emerald-900">
                          Business Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <span className="font-medium text-emerald-800">
                            Business Name:
                          </span>
                          <p className="text-emerald-700">
                            {formData.businessName || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-emerald-800">
                            Business Type:
                          </span>
                          <p className="text-emerald-700">
                            {formData.businessType || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-emerald-800">
                            Registration Number:
                          </span>
                          <p className="text-emerald-700">
                            {formData.registrationNumber || "Not provided"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-emerald-200">
                      <CardHeader>
                        <CardTitle className="text-lg text-emerald-900">
                          Contact Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <span className="font-medium text-emerald-800">
                            Contact Person:
                          </span>
                          <p className="text-emerald-700">
                            {formData.contactPerson || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-emerald-800">
                            Email:
                          </span>
                          <p className="text-emerald-700">
                            {formData.email || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-emerald-800">
                            Phone:
                          </span>
                          <p className="text-emerald-700">
                            {formData.phone || "Not provided"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                    <h4 className="font-medium text-emerald-900 mb-3">
                      What happens next?
                    </h4>
                    <div className="space-y-2 text-sm text-emerald-700">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-emerald-600">1</Badge>
                        <span>
                          Your application will be reviewed by our team within
                          2-3 business days
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-emerald-600">2</Badge>
                        <span>
                          We may contact you for additional information if
                          needed
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-emerald-600">3</Badge>
                        <span>
                          Once approved, you'll receive access to business
                          pricing and bulk products
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-emerald-600">4</Badge>
                        <span>
                          You'll be notified via email about your application
                          status
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-emerald-200">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  Previous
                </Button>

                {currentStep < steps.length ? (
                  <Button
                    onClick={handleNext}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Submit Application
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          className="mt-8 bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-emerald-900 mb-4 text-center">
            Business Partner Benefits
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Bulk Pricing",
                description:
                  "Special wholesale prices for bulk orders (5kg, 10kg, 15kg, 20kg)",
                icon: "💰",
              },
              {
                title: "Priority Support",
                description:
                  "Dedicated customer service and faster response times",
                icon: "🎯",
              },
              {
                title: "Flexible Orders",
                description:
                  "Custom order sizes and delivery schedules to fit your business needs",
                icon: "📦",
              },
            ].map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl mb-2">{benefit.icon}</div>
                <h4 className="font-semibold text-emerald-900 mb-2">
                  {benefit.title}
                </h4>
                <p className="text-emerald-700 text-sm">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
