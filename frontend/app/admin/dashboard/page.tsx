"use client";

import { useState, useEffect } from "react";
import { 
  Users, UserCheck, UserX, Calendar, 
  TrendingUp, Activity, LogOut, Shield,
  FileText, Eye, Trash2, CheckCircle, XCircle,
  Search, Filter, Download, Mail, Phone, X
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    verifiedDoctors: 0,
    pendingDoctors: 0,
    totalBookings: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState<"ALL" | "PATIENT" | "DOCTOR" | "PENDING">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentUrl, setDocumentUrl] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        window.location.href = "/auth/login";
        return;
      }

      // Fetch stats
      const statsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/stats`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch users
      const usersResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.data || []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDoctor = async (userId: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/${userId}/approve-doctor`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Doctor verified successfully!");
        fetchDashboardData();
      } else {
        toast.error("Failed to verify doctor");
      }
    } catch (error) {
      console.error("Failed to verify doctor:", error);
      toast.error("Failed to verify doctor");
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    // Get current admin ID to prevent self-deactivation
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const currentUserId = payload.sub;
      
      if (userId === currentUserId) {
        toast.error("You cannot deactivate your own account");
        return;
      }
    }

    if (!confirm("Are you sure you want to deactivate this user?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/${userId}/admin`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ isActive: false }),
        }
      );

      if (response.ok) {
        toast.success("User deactivated successfully!");
        fetchDashboardData();
      } else {
        toast.error("Failed to deactivate user");
      }
    } catch (error) {
      console.error("Failed to deactivate user:", error);
      toast.error("Failed to deactivate user");
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/${userId}/admin`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ isActive: true }),
        }
      );

      if (response.ok) {
        toast.success("User activated successfully!");
        fetchDashboardData();
      } else {
        toast.error("Failed to activate user");
      }
    } catch (error) {
      console.error("Failed to activate user:", error);
      toast.error("Failed to activate user");
    }
  };

  const handleViewDocument = async (userId: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/${userId}/document`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.documentUrl) {
          setDocumentUrl(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}${data.documentUrl}`);
          setShowDocumentModal(true);
        } else {
          toast.error("No document available for this doctor");
        }
      } else {
        toast.error("Failed to fetch document");
      }
    } catch (error) {
      console.error("Failed to fetch document:", error);
      toast.error("Failed to fetch document");
    }
  };

  const handleViewUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setShowUserModal(true);
    }
  };

  const confirmDeleteUser = (user: any) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    // Get current admin ID to prevent self-deletion
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const currentUserId = payload.sub;
      
      if (userToDelete.id === currentUserId) {
        toast.error("You cannot delete your own account");
        setShowDeleteModal(false);
        setUserToDelete(null);
        return;
      }
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/${userToDelete.id}/admin`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success("User deleted successfully!");
        setShowDeleteModal(false);
        setUserToDelete(null);
        fetchDashboardData();
      } else {
        toast.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/auth/login";
  };

  const filteredUsers = users.filter((user) => {
    // Exclude admin users from the list
    if (user.role === "ADMIN") return false;
    
    // Apply role filter
    let roleMatch = true;
    if (filter === "PENDING") {
      roleMatch = user.role === "DOCTOR" && !user.isVerified;
    } else if (filter !== "ALL") {
      roleMatch = user.role === filter;
    }

    // Apply search filter
    const searchLower = searchTerm.toLowerCase();
    const searchMatch = searchTerm === "" || 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.specialty && user.specialty.toLowerCase().includes(searchLower));

    return roleMatch && searchMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
          <p className="mt-6 text-gray-300 text-lg font-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg shadow-blue-500/30">
                <span className="text-2xl font-bold text-white">+</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Control Center</h1>
                <p className="text-sm text-gray-400">Sa7ti Platform Management</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition border border-gray-700"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl shadow-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Total Users</p>
                <p className="text-4xl font-bold text-white mt-2">{stats.totalUsers}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-xl shadow-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-100">Total Patients</p>
                <p className="text-4xl font-bold text-white mt-2">{stats.totalPatients}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Activity className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-xl shadow-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-100">Verified Doctors</p>
                <p className="text-4xl font-bold text-white mt-2">{stats.verifiedDoctors}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 shadow-xl shadow-yellow-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-100">Pending Approvals</p>
                <p className="text-4xl font-bold text-white mt-2">{stats.pendingDoctors}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Users Management Panel */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50">
          {/* Panel Header */}
          <div className="px-6 py-5 border-b border-gray-700/50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <h2 className="text-xl font-bold text-white">User Management</h2>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition w-full sm:w-64"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter("ALL")}
                    className={`px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                      filter === "ALL"
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
                        : "bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter("PATIENT")}
                    className={`px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                      filter === "PATIENT"
                        ? "bg-green-500 text-white shadow-lg shadow-green-500/50"
                        : "bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600"
                    }`}
                  >
                    Patients
                  </button>
                  <button
                    onClick={() => setFilter("DOCTOR")}
                    className={`px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                      filter === "DOCTOR"
                        ? "bg-purple-500 text-white shadow-lg shadow-purple-500/50"
                        : "bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600"
                    }`}
                  >
                    Doctors
                  </button>
                  <button
                    onClick={() => setFilter("PENDING")}
                    className={`px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                      filter === "PENDING"
                        ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/50"
                        : "bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600"
                    }`}
                  >
                    Pending ({stats.pendingDoctors})
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/30 border-b border-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="h-12 w-12 text-gray-600" />
                        <p className="text-gray-400 font-medium">No users found</p>
                        <p className="text-gray-500 text-sm">Try adjusting your filters or search terms</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700/30 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}${user.avatar}`}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-700"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center ring-2 ring-gray-700">
                              <span className="text-sm font-bold text-white">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-semibold text-white">
                              {user.firstName} {user.lastName}
                            </div>
                            {user.role === "DOCTOR" && user.specialty && (
                              <div className="text-xs text-gray-400 mt-0.5">
                                {user.specialty}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                            user.role === "DOCTOR"
                              ? "bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/50"
                              : "bg-green-500/20 text-green-300 ring-1 ring-green-500/50"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            <span className="truncate max-w-xs">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-lg inline-block w-fit ${
                              user.isActive
                                ? "bg-green-500/20 text-green-300 ring-1 ring-green-500/50"
                                : "bg-red-500/20 text-red-300 ring-1 ring-red-500/50"
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                          {user.role === "DOCTOR" && (
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-lg inline-block w-fit ${
                                user.isVerified
                                  ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/50"
                                  : "bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/50"
                              }`}
                            >
                              {user.isVerified ? "Verified" : "Pending"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewUser(user.id)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {user.role === "DOCTOR" && !user.isVerified && (
                            <>
                              <button
                                onClick={() => handleViewDocument(user.id)}
                                className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 rounded-lg transition"
                                title="View License Document"
                              >
                                <FileText className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleVerifyDoctor(user.id)}
                                className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition"
                                title="Approve Doctor"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          
                          {user.isActive ? (
                            <button
                              onClick={() => handleDeactivateUser(user.id)}
                              className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded-lg transition"
                              title="Deactivate User"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivateUser(user.id)}
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition"
                              title="Activate User"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => confirmDeleteUser(user)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-800 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">User Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-center gap-4 pb-6 border-b border-gray-700">
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar.startsWith('http') ? selectedUser.avatar : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}${selectedUser.avatar}`}
                    alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                    className="h-20 w-20 rounded-full object-cover ring-4 ring-gray-700"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center ring-4 ring-gray-700">
                    <span className="text-2xl font-bold text-white">
                      {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="text-2xl font-bold text-white">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h4>
                  <p className="text-gray-400 mt-1">{selectedUser.role}</p>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h5 className="text-sm font-semibold text-gray-400 uppercase mb-3">Contact Information</h5>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-white">{selectedUser.email}</span>
                  </div>
                  {selectedUser.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span className="text-white">{selectedUser.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Doctor Specific Info */}
              {selectedUser.role === "DOCTOR" && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-400 uppercase mb-3">Professional Information</h5>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedUser.specialty && (
                      <div>
                        <p className="text-sm text-gray-400">Specialty</p>
                        <p className="text-white font-medium">{selectedUser.specialty}</p>
                      </div>
                    )}
                    {selectedUser.licenseNumber && (
                      <div>
                        <p className="text-sm text-gray-400">License Number</p>
                        <p className="text-white font-medium">{selectedUser.licenseNumber}</p>
                      </div>
                    )}
                    {selectedUser.yearsOfExperience && (
                      <div>
                        <p className="text-sm text-gray-400">Experience</p>
                        <p className="text-white font-medium">{selectedUser.yearsOfExperience} years</p>
                      </div>
                    )}
                    {selectedUser.consultationFee && (
                      <div>
                        <p className="text-sm text-gray-400">Consultation Fee</p>
                        <p className="text-white font-medium">${selectedUser.consultationFee}</p>
                      </div>
                    )}
                  </div>
                  {selectedUser.bio && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-400 mb-2">Bio</p>
                      <p className="text-white text-sm leading-relaxed">{selectedUser.bio}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Status */}
              <div>
                <h5 className="text-sm font-semibold text-gray-400 uppercase mb-3">Status</h5>
                <div className="flex gap-3">
                  <span className={`px-4 py-2 text-sm font-semibold rounded-lg ${
                    selectedUser.isActive
                      ? "bg-green-500/20 text-green-300 ring-1 ring-green-500/50"
                      : "bg-red-500/20 text-red-300 ring-1 ring-red-500/50"
                  }`}>
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </span>
                  {selectedUser.role === "DOCTOR" && (
                    <span className={`px-4 py-2 text-sm font-semibold rounded-lg ${
                      selectedUser.isVerified
                        ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/50"
                        : "bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/50"
                    }`}>
                      {selectedUser.isVerified ? "Verified" : "Pending Verification"}
                    </span>
                  )}
                  <span className={`px-4 py-2 text-sm font-semibold rounded-lg ${
                    selectedUser.isEmailVerified
                      ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/50"
                      : "bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/50"
                  }`}>
                    {selectedUser.isEmailVerified ? "Email Verified" : "Email Unverified"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
            <div className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">License Document</h3>
              <button
                onClick={() => {
                  setShowDocumentModal(false);
                  setDocumentUrl("");
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-4 bg-gray-900 h-[calc(90vh-80px)]">
              <iframe
                src={documentUrl}
                className="w-full h-full rounded-lg"
                title="License Document"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-red-500/50">
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Confirm Deletion</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-300 font-medium mb-2">⚠️ Warning: This action cannot be undone!</p>
                <p className="text-gray-300 text-sm">
                  You are about to permanently delete <strong className="text-white">{userToDelete.firstName} {userToDelete.lastName}</strong> and all their associated data.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
