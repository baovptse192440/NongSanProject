"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  Upload,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Users,
  Shield,
  X,
} from "lucide-react";
import ToastContainer from "@/app/common/Toast";
import { useToast } from "@/app/common/useToast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: "admin" | "user";
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  gender: "male" | "female" | "other" | null;
  status: "active" | "inactive" | "banned";
  emailVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export default function UsersPage() {
  const { toasts, toast, removeToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "user">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "banned">("all");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    admin: 0,
    user: 0,
    active: 0,
    inactive: 0,
    banned: 0,
  });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    role: "user" as "admin" | "user",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Việt Nam",
    dateOfBirth: "",
    gender: null as "male" | "female" | "other" | null,
    status: "active" as "active" | "inactive" | "banned",
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterRole !== "all") params.append("role", filterRole);
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (searchQuery) params.append("search", searchQuery);
      params.append("page", currentPage.toString());
      params.append("limit", limit.toString());

      const response = await fetch(`/api/users?${params.toString()}`);
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
        setTotal(result.total || 0);
        setTotalPages(result.totalPages || 1);
        
        // Calculate stats from all users
        await fetchStats();
      } else {
        toast.error("Lỗi", "Không thể tải danh sách người dùng");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Lỗi", "Đã xảy ra lỗi khi tải người dùng");
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch("/api/users?limit=1000");
      const result = await response.json();
      if (result.success) {
        const allUsers = result.data;
        setStats({
          total: result.total || 0,
          admin: allUsers.filter((u: User) => u.role === "admin").length,
          user: allUsers.filter((u: User) => u.role === "user").length,
          active: allUsers.filter((u: User) => u.status === "active").length,
          inactive: allUsers.filter((u: User) => u.status === "inactive").length,
          banned: allUsers.filter((u: User) => u.status === "banned").length,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filter changes
  }, [filterRole, filterStatus]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRole, filterStatus, currentPage, limit]);

  // Re-fetch when search query changes (with debounce)
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when search changes
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const sortedUsers = [...users].sort((a, b) => {
    if (!sortConfig) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    const aValue = a[sortConfig.key as keyof User];
    const bValue = b[sortConfig.key as keyof User];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return prev.direction === "asc"
          ? { key, direction: "desc" }
          : null;
      }
      return { key, direction: "asc" };
    });
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      email: "",
      password: "",
      fullName: "",
      phone: "",
      role: "user",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Việt Nam",
      dateOfBirth: "",
      gender: null,
      status: "active",
    });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: "", // Don't show password
      fullName: user.fullName,
      phone: user.phone || "",
      role: user.role,
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      zipCode: user.zipCode || "",
      country: user.country || "Việt Nam",
      dateOfBirth: "",
      gender: user.gender || null,
      status: user.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.fullName) {
      toast.error("Lỗi", "Email và họ tên là bắt buộc");
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error("Lỗi", "Mật khẩu là bắt buộc khi tạo mới");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const method = editingUser ? "PUT" : "POST";

      const body: {
        email: string;
        fullName: string;
        phone: string | null;
        role: "admin" | "user";
        address: string | null;
        city: string | null;
        state: string | null;
        zipCode: string | null;
        country: string;
        gender: "male" | "female" | "other" | null;
        status: "active" | "inactive" | "banned";
        password?: string;
        dateOfBirth?: string;
      } = {
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone || null,
        role: formData.role,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zipCode: formData.zipCode || null,
        country: formData.country || "Việt Nam",
        gender: formData.gender || null,
        status: formData.status,
      };

      if (formData.password) {
        body.password = formData.password;
      }

      if (formData.dateOfBirth) {
        body.dateOfBirth = formData.dateOfBirth;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Thành công", editingUser ? "Cập nhật người dùng thành công" : "Tạo người dùng thành công");
        setShowModal(false);
        await fetchUsers();
        await fetchStats();
      } else {
        toast.error("Lỗi", result.error || "Không thể lưu người dùng");
      }
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Lỗi", "Đã xảy ra lỗi khi lưu người dùng");
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setUserToDelete({ id, name });
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      setDeletingId(userToDelete.id);
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        await fetchUsers();
        await fetchStats();
        toast.success("Thành công", `Đã xóa người dùng "${userToDelete.name}"`);
        setUserToDelete(null);
      } else {
        toast.error("Lỗi", result.error || "Không thể xóa người dùng");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Lỗi", "Đã xảy ra lỗi khi xóa người dùng");
    } finally {
      setDeletingId(null);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingExcel(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/users/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Thành công", result.message || `Đã import ${result.created} người dùng`);
        if (result.errors && result.errors.length > 0) {
          console.warn("Import errors:", result.errors);
        }
        if (result.skipped && result.skipped.length > 0) {
          console.warn("Skipped:", result.skipped);
        }
        setShowImportModal(false);
        await fetchUsers();
        await fetchStats();
      } else {
        toast.error("Lỗi", result.error || "Không thể import file Excel");
        if (result.errors && result.errors.length > 0) {
          console.error("Import errors:", result.errors);
        }
      }
    } catch (error) {
      console.error("Error importing Excel:", error);
      toast.error("Lỗi", "Đã xảy ra lỗi khi import file Excel");
    } finally {
      setUploadingExcel(false);
      e.target.value = "";
    }
  };

  const SortableHeader = ({
    children,
    sortKey,
  }: {
    children: React.ReactNode;
    sortKey: string;
  }) => {
    const isActive = sortConfig?.key === sortKey;
    const direction = sortConfig?.direction;

    return (
      <th className="px-4 py-3 text-left">
        <button
          onClick={() => handleSort(sortKey)}
          className="flex items-center gap-2 w-full text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors group"
        >
          <span>{children}</span>
          <div className="flex flex-col">
            <ArrowUp
              className={`w-3 h-3 transition-colors ${
                isActive && direction === "asc"
                  ? "text-[#0a923c]"
                  : "text-gray-300 group-hover:text-gray-400"
              }`}
            />
            <ArrowDown
              className={`w-3 h-3 -mt-0.5 transition-colors ${
                isActive && direction === "desc"
                  ? "text-[#0a923c]"
                  : "text-gray-300 group-hover:text-gray-400"
              }`}
            />
          </div>
        </button>
      </th>
    );
  };

  return (
    <div className="space-y-4">
      {/* TOAST CONTAINER */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Người dùng</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý người dùng hệ thống
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Import Excel
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a923c] hover:bg-[#0d7a33] text-white text-sm font-medium rounded-md transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Thêm mới
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tổng số</span>
            <div className="p-2 rounded-md bg-[#0a923c]/10">
              <Users className="h-4 w-4 text-[#0a923c]" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">Người dùng</p>
        </div>

        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Admin</span>
            <div className="p-2 rounded-md bg-purple-50">
              <Shield className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.admin}</p>
          <p className="text-xs text-gray-400 mt-1">Người dùng</p>
        </div>

        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">User</span>
            <div className="p-2 rounded-md bg-blue-50">
              <UserIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.user}</p>
          <p className="text-xs text-gray-400 mt-1">Người dùng</p>
        </div>

        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hoạt động</span>
            <div className="p-2 rounded-md bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
          <p className="text-xs text-gray-400 mt-1">Người dùng</p>
        </div>

        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ngừng</span>
            <div className="p-2 rounded-md bg-gray-50">
              <XCircle className="h-4 w-4 text-gray-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.inactive}</p>
          <p className="text-xs text-gray-400 mt-1">Người dùng</p>
        </div>

        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bị khóa</span>
            <div className="p-2 rounded-md bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.banned}</p>
          <p className="text-xs text-gray-400 mt-1">Người dùng</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-md border border-gray-200/60 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo email, tên, số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select
              value={filterRole}
              onValueChange={(value: "all" | "admin" | "user") => setFilterRole(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterStatus}
              onValueChange={(value: "all" | "active" | "inactive" | "banned") => setFilterStatus(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Ngừng</SelectItem>
                <SelectItem value="banned">Bị khóa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-md border border-gray-200/60 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#0a923c] mb-2" />
            <p className="text-xs font-medium text-gray-500">Đang tải...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <UserIcon className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              Không có dữ liệu
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Chưa có người dùng nào trong hệ thống
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a923c] hover:bg-[#0d7a33] text-white text-sm font-medium rounded-md transition-colors"
            >
              <Plus className="h-4 w-4" />
              Thêm người dùng đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                    STT
                  </th>
                  <SortableHeader sortKey="email">Email</SortableHeader>
                  <SortableHeader sortKey="fullName">Họ tên</SortableHeader>
                  <SortableHeader sortKey="phone">Số điện thoại</SortableHeader>
                  <SortableHeader sortKey="role">Vai trò</SortableHeader>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Địa chỉ
                  </th>
                  <SortableHeader sortKey="status">Trạng thái</SortableHeader>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <UserIcon className="h-10 w-10 text-gray-300 mb-2" />
                        <p className="text-xs font-medium text-gray-500">
                          Không tìm thấy
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Thử thay đổi bộ lọc
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedUsers.map((user, index) => {
                    // Calculate STT based on current page and limit
                    const stt = (currentPage - 1) * limit + index + 1;
                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-600">
                            {stt}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.email}
                            </p>
                            {user.emailVerified && (
                              <span className="inline-flex items-center gap-0.5 mt-0.5 text-[10px] text-green-600">
                                <CheckCircle2 className="h-3 w-3" />
                                Đã xác thực
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-gray-900">
                            {user.fullName}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-600">
                            {user.phone || "-"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {user.role === "admin" ? "Admin" : "User"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="max-w-xs">
                            <p className="text-xs text-gray-600 truncate">
                              {user.address ? (
                                <>
                                  {user.address}
                                  {user.city && `, ${user.city}`}
                                  {user.state && `, ${user.state}`}
                                </>
                              ) : (
                                "-"
                              )}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              user.status === "active"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : user.status === "inactive"
                                ? "bg-gray-50 text-gray-700 border border-gray-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {user.status === "active"
                              ? "Hoạt động"
                              : user.status === "inactive"
                              ? "Ngừng"
                              : "Bị khóa"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(user.id, user.fullName)}
                              disabled={deletingId === user.id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                              title="Xóa"
                            >
                              {deletingId === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {!loading && total > 0 && (
        <div className="bg-white rounded-md border border-gray-200/60 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Hiển thị {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, total)} của {total} người dùng
              </span>
              <Select
                value={limit.toString()}
                onValueChange={(value) => {
                  setLimit(parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-gray-500">/ trang</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        currentPage === pageNum
                          ? "bg-[#0a923c] text-white"
                          : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-md border border-gray-200 shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                        placeholder="user@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Mật khẩu {!editingUser && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="password"
                        id="password"
                        required={!editingUser}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                        placeholder={editingUser ? "Để trống nếu không đổi" : "Mật khẩu"}
                      />
                      {editingUser && (
                        <p className="text-xs text-gray-500">Để trống nếu không muốn đổi mật khẩu</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                        Họ tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                        placeholder="0123456789"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="role" className="text-sm font-medium text-gray-700">
                        Vai trò
                      </label>
                      <Select
                        value={formData.role}
                        onValueChange={(value: "admin" | "user") => setFormData({ ...formData, role: value })}
                      >
                        <SelectTrigger id="role" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="status" className="text-sm font-medium text-gray-700">
                        Trạng thái
                      </label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: "active" | "inactive" | "banned") => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger id="status" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Hoạt động</SelectItem>
                          <SelectItem value="inactive">Ngừng</SelectItem>
                          <SelectItem value="banned">Bị khóa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label htmlFor="address" className="text-sm font-medium text-gray-700">
                        Địa chỉ
                      </label>
                      <input
                        type="text"
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                        placeholder="Số nhà, đường, phường/xã"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="city" className="text-sm font-medium text-gray-700">
                        Thành phố
                      </label>
                      <input
                        type="text"
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                        placeholder="Thành phố"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="state" className="text-sm font-medium text-gray-700">
                        Tỉnh/Thành phố
                      </label>
                      <input
                        type="text"
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                        placeholder="Tỉnh/Thành phố"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="zipCode" className="text-sm font-medium text-gray-700">
                        Mã bưu điện
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                        placeholder="70000"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="country" className="text-sm font-medium text-gray-700">
                        Quốc gia
                      </label>
                      <input
                        type="text"
                        id="country"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                        placeholder="Việt Nam"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        id="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="gender" className="text-sm font-medium text-gray-700">
                        Giới tính
                      </label>
                      <Select
                        value={formData.gender || undefined}
                        onValueChange={(value: "male" | "female" | "other") => setFormData({ ...formData, gender: value })}
                      >
                        <SelectTrigger id="gender" className="w-full">
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Nam</SelectItem>
                          <SelectItem value="female">Nữ</SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium bg-[#0a923c] hover:bg-[#0d7a33] text-white rounded-md transition-colors"
                    >
                      {editingUser ? "Cập nhật" : "Tạo mới"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* IMPORT EXCEL MODAL */}
      <AnimatePresence>
        {showImportModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowImportModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-md border border-gray-200 shadow-xl w-full max-w-md">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Import người dùng từ Excel
                  </h2>
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">
                      Hướng dẫn:
                    </h3>
                    <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                      <li>Các cột bắt buộc: Email, FullName</li>
                      <li>Các cột tùy chọn: Password, Phone, Role, Address, City, State, ZipCode, Country, DateOfBirth, Gender, Status</li>
                      <li>Mật khẩu mặc định là &quot;123456&quot; nếu không có</li>
                      <li>Vai trò mặc định là &quot;user&quot; nếu không có</li>
                      <li>Trạng thái mặc định là &quot;active&quot; nếu không có</li>
                    </ul>
                  </div>

                  <label className="inline-flex items-center gap-2 px-4 py-3 w-full justify-center bg-[#0a923c] hover:bg-[#0d7a33] text-white text-sm font-medium rounded-md transition-colors cursor-pointer">
                    {uploadingExcel ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang import...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Chọn file Excel
                      </>
                    )}
                    <input
                      type="file"
                      accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                      onChange={handleImportExcel}
                      className="hidden"
                      disabled={uploadingExcel}
                    />
                  </label>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng &quot;{userToDelete?.name}&quot;? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={!!deletingId}
            >
              {deletingId ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

