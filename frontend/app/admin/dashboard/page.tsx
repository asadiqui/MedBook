"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, UserCheck, UserX, Calendar, 
  TrendingUp, Activity, LogOut, Shield,
  FileText, Eye, Trash2, CheckCircle, XCircle,
  Search, Filter, Download, Mail, Phone, X
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAuthStore } from "@/lib/store/auth";
import { Logo } from "@/components/ui/Logo";
import api from "@/lib/api";

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  const { user, isBootstrapping } = useAuth();
  const { logout } = useAuthStore();
  const router = useRouter();
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
    if (isBootstrapping) return;

    if (!user) {
      setLoading(false);
      return;
    }

    if (user.role !== "ADMIN") {
      setLoading(false);
      return;
    }

    fetchDashboardData();
  }, [isBootstrapping, user]);

  const fetchDashboardData = async () => {
    setLoading(true);

    try {

      const statsResponse = await api.get("/users/stats");
      setStats(statsResponse.data);

      const usersResponse = await api.get("/users");
      setUsers(usersResponse.data.data || []);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Session expired. Please log in again.");
        logout();
        window.location.href = "/auth/login";
        return;
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDoctor = async (userId: string) => {
    try {
      await api.post(`/users/${userId}/approve-doctor`);
      toast.success("Doctor verified successfully!");
      fetchDashboardData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to verify doctor";
      toast.error(errorMessage);
    }
  };

  const handleDeactivateUser = async (userId: string) => {

    if (user && userId === user.id) {
      toast.error("You cannot deactivate your own account");
      return;
    }

    if (!confirm("Are you sure you want to deactivate this user?")) {
      return;
    }

    try {
      await api.patch(`/users/${userId}/admin`, { isActive: false });
      toast.success("User deactivated successfully!");
      fetchDashboardData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to deactivate user";
      toast.error(errorMessage);
    }
  };

  const handleActivateUser = async (userId: string) => {

    if (user && userId === user.id) {
      toast.error("You cannot activate your own account");
      return;
    }

    if (!confirm("Are you sure you want to activate this user?")) {
      return;
    }

    try {
      await api.patch(`/users/${userId}/admin`, { isActive: true });
      toast.success("User activated successfully!");
      fetchDashboardData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to activate user";
      toast.error(errorMessage);
    }
  };

  const handleViewDocument = async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}/document`);
      const data = response.data;
      
      if (data.documentUrl) {
        setDocumentUrl(`${process.env.NEXT_PUBLIC_BASE_URL}${data.documentUrl}`);
        setShowDocumentModal(true);
      } else {
        toast.error("No document available for this doctor");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch document";
      toast.error(errorMessage);
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

    if (user && userToDelete.id === user.id) {
      toast.error("You cannot delete your own account");
      setShowDeleteModal(false);
      setUserToDelete(null);
      return;
    }

    try {
      await api.delete(`/users/${userToDelete.id}/admin`);
      
      toast.success("User deleted successfully!");
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchDashboardData();
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Session expired. Please log in again.");
        logout();
        window.location.href = "/auth/login";
        return;
      }
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete user";
      toast.error(errorMessage);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const filteredUsers = users.filter((user) => {

    if (user.role === "ADMIN") return false;
    

    let roleMatch = true;
    if (filter === "PENDING") {
      roleMatch = user.role === "DOCTOR" && !user.isVerified;
    } else if (filter !== "ALL") {
      roleMatch = user.role === filter;
    }

    const searchLower = searchTerm.toLowerCase();
    const searchMatch = searchTerm === "" || 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.specialty && user.specialty.toLowerCase().includes(searchLower));

    return roleMatch && searchMatch;
  });

  if (loading || isBootstrapping) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-6 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
            <p className="mt-6 text-gray-600 text-lg font-medium">Loading Admin Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="md" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Manage users, approvals, and bookings.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Patients</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalPatients}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Verified Doctors</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{stats.verifiedDoctors}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <UserCheck className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{stats.pendingDoctors}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-xl">
              <Shield className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-2xl shadow border border-gray-100">
        {}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900">User Management</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              {}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition w-full sm:w-64"
                />
              </div>
              {}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter("ALL")}
                  className={`px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                    filter === "ALL"
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("PATIENT")}
                  className={`px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                    filter === "PATIENT"
                      ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                  }`}
                >
                  Patients
                </button>
                <button
                  onClick={() => setFilter("DOCTOR")}
                  className={`px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                    filter === "DOCTOR"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                  }`}
                >
                  Doctors
                </button>
                <button
                  onClick={() => setFilter("PENDING")}
                  className={`px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                    filter === "PENDING"
                      ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/30"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                  }`}
                >
                  Pending ({stats.pendingDoctors})
                </button>
              </div>
            </div>
          </div>
        </div>
        {}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="h-12 w-12 text-gray-300" />
                      <p className="text-gray-400 font-medium">No users found</p>
                      <p className="text-gray-500 text-sm">Try adjusting your filters or search terms</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_BASE_URL}${user.avatar}`}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-200"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center ring-2 ring-gray-200">
                            <span className="text-sm font-bold text-white">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          {user.role === "DOCTOR" && user.specialty && (
                            <div className="text-xs text-gray-500 mt-0.5">
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
                            ? "bg-purple-100 text-purple-700 ring-1 ring-purple-200"
                            : "bg-green-100 text-green-700 ring-1 ring-green-200"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          <span className="truncate max-w-xs">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
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
                              ? "bg-green-100 text-green-700 ring-1 ring-green-200"
                              : "bg-red-100 text-red-700 ring-1 ring-red-200"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                        {user.role === "DOCTOR" && (
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-lg inline-block w-fit ${
                              user.isVerified
                                ? "bg-blue-100 text-blue-700 ring-1 ring-blue-200"
                                : "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200"
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
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {user.role === "DOCTOR" && (
                          <button
                            onClick={() => handleViewDocument(user.id)}
                            className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition"
                            title="View License Document"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        )}
                        {user.role === "DOCTOR" && !user.isVerified && (
                          <button
                            onClick={() => handleVerifyDoctor(user.id)}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition"
                            title="Approve Doctor"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {user.isActive ? (
                          <button
                            onClick={() => handleDeactivateUser(user.id)}
                            className="p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 rounded-lg transition"
                            title="Deactivate User"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateUser(user.id)}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition"
                            title="Activate User"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => confirmDeleteUser(user)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition"
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

      {}
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
              {}
              <div className="flex items-center gap-4 pb-6 border-b border-gray-700">
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar.startsWith('http') ? selectedUser.avatar : `${process.env.NEXT_PUBLIC_BASE_URL}${selectedUser.avatar}`}
                    alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                    className="h-20 w-20 rounded-full object-cover ring-4 ring-gray-700"
                    referrerPolicy="no-referrer"
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

              {}
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

              {}
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

              {}
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

      {}
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

      {}
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
    </div>
  );
}
