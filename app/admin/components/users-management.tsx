"use client";

import { useState, useEffect } from "react";
import { Users, Search, Eye, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
  business?: {
    id: string;
    businessName: string;
    status: string;
  };
}

export function UsersManagementTab() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleBusinessStatusChange = async (
    businessId: string,
    newStatus: string
  ) => {
    try {
      setUpdatingStatus(businessId);
      const response = await fetch(`/api/business/applications`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ businessId, status: newStatus }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Business status updated to ${newStatus}`,
        });
        fetchUsers();
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
      setUpdatingStatus(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: { color: "bg-purple-600", label: "Admin" },
      BUSINESS: { color: "bg-blue-600", label: "Business" },
      CONSUMER: { color: "bg-emerald-600", label: "Consumer" },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || {
      color: "bg-gray-600",
      label: role,
    };
    return (
      <Badge className={`${config.color} text-white`}>{config.label}</Badge>
    );
  };

  const getBusinessStatusBadge = (status?: string) => {
    if (!status) return null;

    const statusConfig = {
      PENDING: { color: "border-yellow-600 text-yellow-600", label: "Pending" },
      APPROVED: { color: "border-green-600 text-green-600", label: "Approved" },
      REJECTED: { color: "border-red-600 text-red-600", label: "Rejected" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900">User Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-emerald-200"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="border-emerald-200">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="BUSINESS">Business</SelectItem>
                <SelectItem value="CONSUMER">Consumer</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={fetchUsers}
              className="border-emerald-600 text-emerald-600"
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Users Management ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-emerald-600">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Business Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-emerald-600 font-medium">
                              {user.firstName.charAt(0)}
                              {user.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "Not provided"}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        {user.business ? (
                          <div>
                            <p className="font-medium text-sm">
                              {user.business.businessName}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.business ? (
                          <div className="flex items-center space-x-2">
                            {getBusinessStatusBadge(user.business.status)}
                            <Select
                              value={user.business.status}
                              onValueChange={(value) =>
                                handleBusinessStatusChange(
                                  user.business!.id,
                                  value
                                )
                              }
                              disabled={updatingStatus === user.business.id}
                            >
                              <SelectTrigger className="w-24 h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="APPROVED">
                                  Approved
                                </SelectItem>
                                <SelectItem value="REJECTED">
                                  Rejected
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>User Details</DialogTitle>
                              </DialogHeader>
                              {selectedUser && (
                                <UserDetails user={selectedUser} />
                              )}
                            </DialogContent>
                          </Dialog>
                          {updatingStatus === user.business?.id && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UserDetails({ user }: { user: User }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-lg text-emerald-900">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium text-emerald-800">Full Name:</span>
              <p className="text-emerald-700">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <span className="font-medium text-emerald-800">Email:</span>
              <p className="text-emerald-700">{user.email}</p>
            </div>
            <div>
              <span className="font-medium text-emerald-800">Phone:</span>
              <p className="text-emerald-700">{user.phone || "Not provided"}</p>
            </div>
            <div>
              <span className="font-medium text-emerald-800">Role:</span>
              <div className="mt-1">{getRoleBadge(user.role)}</div>
            </div>
            <div>
              <span className="font-medium text-emerald-800">
                Member Since:
              </span>
              <p className="text-emerald-700">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {user.business && (
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-lg text-emerald-900 flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium text-emerald-800">
                  Business Name:
                </span>
                <p className="text-emerald-700">{user.business.businessName}</p>
              </div>
              <div>
                <span className="font-medium text-emerald-800">Status:</span>
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className={
                      user.business.status === "APPROVED"
                        ? "border-green-600 text-green-600"
                        : user.business.status === "PENDING"
                        ? "border-yellow-600 text-yellow-600"
                        : "border-red-600 text-red-600"
                    }
                  >
                    {user.business.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function getRoleBadge(role: string) {
  const roleConfig = {
    ADMIN: { color: "bg-purple-600", label: "Admin" },
    BUSINESS: { color: "bg-blue-600", label: "Business" },
    CONSUMER: { color: "bg-emerald-600", label: "Consumer" },
  };

  const config = roleConfig[role as keyof typeof roleConfig] || {
    color: "bg-gray-600",
    label: role,
  };
  return <Badge className={`${config.color} text-white`}>{config.label}</Badge>;
}
