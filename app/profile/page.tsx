"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Mail, Phone, Building, Calendar, Edit, Save, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  })

  useEffect(() => {
    if (session?.user) {
      const [firstName, lastName] = session.user.name?.split(" ") || ["", ""]
      setFormData({
        firstName,
        lastName,
        phone: "", // We'd need to fetch this from the database
      })
    }
  }, [session])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Here you would make an API call to update the user profile
      // For now, we'll just simulate a successful update
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (session?.user) {
      const [firstName, lastName] = session.user.name?.split(" ") || ["", ""]
      setFormData({
        firstName,
        lastName,
        phone: "",
      })
    }
    setIsEditing(false)
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-emerald-900 mb-4">Please sign in to view your profile</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <div className="bg-emerald-800 text-white py-12">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-emerald-100">Manage your account information</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="md:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-emerald-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-emerald-900 flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Personal Information
                      </CardTitle>
                      {!isEditing ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="border-emerald-600 text-emerald-600"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      ) : (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                            className="border-gray-300 text-gray-600"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isLoading}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {isLoading ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-emerald-800">
                              First Name
                            </Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              className="border-emerald-200 focus:border-emerald-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-emerald-800">
                              Last Name
                            </Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              className="border-emerald-200 focus:border-emerald-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-emerald-800">
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="border-emerald-200 focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-emerald-600" />
                          <div>
                            <p className="font-medium text-emerald-900">{session.user.name}</p>
                            <p className="text-sm text-emerald-600">Full Name</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-emerald-600" />
                          <div>
                            <p className="font-medium text-emerald-900">{session.user.email}</p>
                            <p className="text-sm text-emerald-600">Email Address</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-emerald-600" />
                          <div>
                            <p className="font-medium text-emerald-900">{formData.phone || "Not provided"}</p>
                            <p className="text-sm text-emerald-600">Phone Number</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-emerald-600" />
                          <div>
                            <p className="font-medium text-emerald-900">Member since 2024</p>
                            <p className="text-sm text-emerald-600">Join Date</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Account Status */}
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="border-emerald-200">
                  <CardHeader>
                    <CardTitle className="text-emerald-900">Account Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-700">Account Type</span>
                      <Badge
                        className={
                          session.user.role === "ADMIN"
                            ? "bg-purple-600"
                            : session.user.role === "BUSINESS"
                              ? "bg-blue-600"
                              : "bg-emerald-600"
                        }
                      >
                        {session.user.role === "ADMIN"
                          ? "Administrator"
                          : session.user.role === "BUSINESS"
                            ? "Business"
                            : "Consumer"}
                      </Badge>
                    </div>

                    {session.user.role === "BUSINESS" && (
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-700">Business Status</span>
                        <Badge
                          variant={session.user.businessStatus === "APPROVED" ? "default" : "outline"}
                          className={
                            session.user.businessStatus === "APPROVED"
                              ? "bg-green-600"
                              : session.user.businessStatus === "PENDING"
                                ? "border-yellow-600 text-yellow-600"
                                : "border-red-600 text-red-600"
                          }
                        >
                          {session.user.businessStatus || "Pending"}
                        </Badge>
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="font-medium text-emerald-900">Account Benefits</h4>
                      <ul className="text-sm text-emerald-700 space-y-1">
                        <li>• Free shipping on all orders</li>
                        <li>• Cash on delivery payment</li>
                        <li>• 24/7 customer support</li>
                        {session.user.role === "BUSINESS" && session.user.businessStatus === "APPROVED" && (
                          <>
                            <li>• Bulk pricing discounts</li>
                            <li>• Priority order processing</li>
                            <li>• Dedicated account manager</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {session.user.role === "BUSINESS" && session.user.businessStatus !== "APPROVED" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader>
                      <CardTitle className="text-yellow-800 flex items-center">
                        <Building className="h-5 w-5 mr-2" />
                        Business Application
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-yellow-700 mb-4">
                        Your business application is currently under review. You'll receive an email notification once
                        it's processed.
                      </p>
                      <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                        {session.user.businessStatus || "Pending Review"}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
