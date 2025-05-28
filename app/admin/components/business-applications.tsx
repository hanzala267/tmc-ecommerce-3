"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Building,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BusinessApplication {
  id: string;
  businessName: string;
  businessType: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contactPerson: string;
  website?: string;
  description?: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  documents: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
  }>;
}

export function BusinessApplicationsTab() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<BusinessApplication[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<BusinessApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/business/applications?status=${statusFilter}`
      );
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to fetch business applications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      setActionLoading(applicationId);
      const response = await fetch(
        `/api/business/applications/${applicationId}/approve`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Business application approved successfully",
        });
        fetchApplications();
      } else {
        throw new Error("Failed to approve application");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve application",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(applicationId);
      const response = await fetch(
        `/api/business/applications/${applicationId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: rejectionReason }),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Business application rejected",
        });
        setRejectionReason("");
        fetchApplications();
      } else {
        throw new Error("Failed to reject application");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject application",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-600"
          >
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleStatusChange = async (businessId: string, newStatus: string) => {
    try {
      setActionLoading(businessId);
      const response = await fetch(`/api/business/applications`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId,
          status: newStatus,
          reason:
            newStatus === "REJECTED" ? "Status changed by admin" : undefined,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Business status updated to ${newStatus}`,
        });
        fetchApplications();
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update business status",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {["PENDING", "APPROVED", "REJECTED"].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            onClick={() => setStatusFilter(status)}
            className={
              statusFilter === status
                ? "bg-emerald-600"
                : "border-emerald-600 text-emerald-600"
            }
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Applications List */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900 flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Business Applications ({statusFilter})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8 text-emerald-600">
              <Building className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No {statusFilter.toLowerCase()} applications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <motion.div
                  key={application.id}
                  className="border border-emerald-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-emerald-900 text-lg">
                          {application.businessName}
                        </h3>
                        {getStatusBadge(application.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-emerald-700">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4" />
                          <span>{application.businessType}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{application.user.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>
                            {application.user.phone || "Not provided"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {application.city}, {application.state}
                          </span>
                        </div>
                      </div>

                      <div className="text-sm text-emerald-600">
                        <span className="font-medium">Contact Person:</span>{" "}
                        {application.contactPerson}
                      </div>

                      <div className="text-sm text-emerald-600">
                        <span className="font-medium">Submitted:</span>{" "}
                        {new Date(application.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-600 text-emerald-600"
                            onClick={() => setSelectedApplication(application)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-emerald-900">
                              Business Application Details
                            </DialogTitle>
                          </DialogHeader>
                          {selectedApplication && (
                            <BusinessApplicationDetails
                              application={selectedApplication}
                              onApprove={() =>
                                handleApprove(selectedApplication.id)
                              }
                              onReject={() =>
                                handleReject(selectedApplication.id)
                              }
                              rejectionReason={rejectionReason}
                              setRejectionReason={setRejectionReason}
                              actionLoading={actionLoading}
                            />
                          )}
                        </DialogContent>
                      </Dialog>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-emerald-700">
                          Status:
                        </span>
                        <Select
                          value={application.status}
                          onValueChange={(value) =>
                            handleStatusChange(application.id, value)
                          }
                          disabled={actionLoading === application.id}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="APPROVED">Approved</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {actionLoading === application.id && (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BusinessApplicationDetails({
  application,
  onApprove,
  onReject,
  rejectionReason,
  setRejectionReason,
  actionLoading,
}: {
  application: BusinessApplication;
  onApprove: () => void;
  onReject: () => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  actionLoading: string | null;
}) {
  return (
    <div className="space-y-6">
      {/* Business Information */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-lg text-emerald-900">
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium text-emerald-800">
                Business Name:
              </span>
              <p className="text-emerald-700">{application.businessName}</p>
            </div>
            <div>
              <span className="font-medium text-emerald-800">
                Business Type:
              </span>
              <p className="text-emerald-700">{application.businessType}</p>
            </div>
            <div>
              <span className="font-medium text-emerald-800">Website:</span>
              <p className="text-emerald-700">
                {application.website || "Not provided"}
              </p>
            </div>
            <div>
              <span className="font-medium text-emerald-800">Description:</span>
              <p className="text-emerald-700">
                {application.description || "Not provided"}
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
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium text-emerald-800">
                Contact Person:
              </span>
              <p className="text-emerald-700">{application.contactPerson}</p>
            </div>
            <div>
              <span className="font-medium text-emerald-800">Email:</span>
              <p className="text-emerald-700">{application.user.email}</p>
            </div>
            <div>
              <span className="font-medium text-emerald-800">Phone:</span>
              <p className="text-emerald-700">
                {application.user.phone || "Not provided"}
              </p>
            </div>
            <div>
              <span className="font-medium text-emerald-800">Address:</span>
              <p className="text-emerald-700">
                {application.address}
                <br />
                {application.city}, {application.state} {application.zipCode}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      {application.documents.length > 0 && (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-lg text-emerald-900">
              Uploaded Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {application.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border border-emerald-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-emerald-900">
                      {doc.fileName}
                    </p>
                    <p className="text-sm text-emerald-600">{doc.fileType}</p>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      View
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {application.status === "PENDING" && (
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={onApprove}
            disabled={!!actionLoading}
          >
            {actionLoading ? "Processing..." : "Approve Application"}
          </Button>

          <div className="space-y-2">
            <Textarea
              placeholder="Reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-w-[300px]"
            />
            <Button
              variant="destructive"
              onClick={onReject}
              disabled={!rejectionReason.trim() || !!actionLoading}
            >
              {actionLoading ? "Processing..." : "Reject Application"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
