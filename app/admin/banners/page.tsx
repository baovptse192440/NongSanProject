"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Upload,
  ArrowUp,
  ArrowDown,
  Loader2,
  X,
  Layout,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Banner {
  id: string;
  type: "main" | "side";
  image: string;
  title: string;
  link: string;
  order: number;
  status: "active" | "inactive";
  createdAt: string;
}

export default function BannersPage() {
  const { toasts, toast, removeToast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [filterType, setFilterType] = useState<"all" | "main" | "side">("all");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bannerToDelete, setBannerToDelete] = useState<{ id: string; name: string } | null>(null);

  const [formData, setFormData] = useState({
    type: "main" as "main" | "side",
    image: "",
    title: "",
    link: "",
    order: 0,
    status: "active" as "active" | "inactive",
  });

  // Fetch banners function
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/banners");
      const result = await response.json();
      if (result.success) {
        setBanners(result.data);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast.error("Lỗi", "Không thể tải danh sách banner");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const filteredBanners = banners.filter((banner) => {
    const matchesSearch =
      banner.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      banner.link.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || banner.status === filterStatus;
    const matchesType = filterType === "all" || banner.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Sort banners
  const sortedBanners = [...filteredBanners].sort((a, b) => {
    if (!sortConfig) return 0;
    const aValue = a[sortConfig.key as keyof Banner];
    const bValue = b[sortConfig.key as keyof Banner];
    
    if (aValue === undefined || bValue === undefined) return 0;
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === "asc"
          ? { key, direction: "desc" }
          : null;
      }
      return { key, direction: "asc" };
    });
  };

  const stats = {
    total: banners.length,
    active: banners.filter((b) => b.status === "active").length,
    inactive: banners.filter((b) => b.status === "inactive").length,
    main: banners.filter((b) => b.type === "main").length,
    side: banners.filter((b) => b.type === "side").length,
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch("/api/banners/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const result = await response.json();
      if (result.success) {
        setFormData((prev) => ({ ...prev, image: result.data.url }));
        toast.success("Thành công", "Tải ảnh lên thành công");
      } else {
        toast.error("Lỗi", result.error || "Không thể tải ảnh lên");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Lỗi", "Đã xảy ra lỗi khi tải ảnh lên");
    } finally {
      setUploadingImage(false);
    }
  };

  const openAddModal = () => {
    setEditingBanner(null);
    setFormData({
      type: "main",
      image: "",
      title: "",
      link: "",
      order: 0,
      status: "active",
    });
    setShowModal(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      type: banner.type,
      image: banner.image,
      title: banner.title,
      link: banner.link,
      order: banner.order,
      status: banner.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      toast.error("Lỗi", "Vui lòng tải ảnh banner");
      return;
    }

    try {
      const url = editingBanner
        ? `/api/banners/${editingBanner.id}`
        : "/api/banners";
      const method = editingBanner ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        await fetchBanners();
        setShowModal(false);
        toast.success(
          "Thành công",
          editingBanner ? "Cập nhật banner thành công" : "Tạo banner thành công"
        );
      } else {
        toast.error("Lỗi", result.error || "Không thể lưu banner");
      }
    } catch (error) {
      console.error("Error saving banner:", error);
      toast.error("Lỗi", "Đã xảy ra lỗi khi lưu banner");
    }
  };

  const handleDeleteClick = (id: string, title: string) => {
    setBannerToDelete({ id, name: title || "Banner" });
  };

  const handleDelete = async () => {
    if (!bannerToDelete) return;

    const { id, name } = bannerToDelete;
    
    try {
      setDeletingId(id);
      const response = await fetch(`/api/banners/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        await fetchBanners();
        toast.success("Thành công", `Đã xóa banner "${name}"`);
        setBannerToDelete(null);
      } else {
        toast.error("Lỗi", result.error || "Không thể xóa banner");
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("Lỗi", "Đã xảy ra lỗi khi xóa banner");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  const SortableHeader = ({ 
    children, 
    sortKey 
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
          <h1 className="text-2xl font-semibold text-gray-900">Banner</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý banner trang chủ
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a923c] hover:bg-[#0d7a33] text-white text-sm font-medium rounded-md transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Thêm mới
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tổng số</span>
            <div className="p-2 rounded-md bg-[#0a923c]/10">
              <Layout className="h-4 w-4 text-[#0a923c]" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">Banner</p>
        </div>

        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hoạt động</span>
            <div className="p-2 rounded-md bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
          <p className="text-xs text-gray-400 mt-1">Banner</p>
        </div>

        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ngừng</span>
            <div className="p-2 rounded-md bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.inactive}</p>
          <p className="text-xs text-gray-400 mt-1">Banner</p>
        </div>

        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Banner chính</span>
            <div className="p-2 rounded-md bg-blue-50">
              <ImageIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.main}</p>
          <p className="text-xs text-gray-400 mt-1">Banner</p>
        </div>

        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Banner phụ</span>
            <div className="p-2 rounded-md bg-purple-50">
              <ImageIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.side}</p>
          <p className="text-xs text-gray-400 mt-1">Banner</p>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white rounded-md p-4 border border-gray-200/60">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề, link..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
            />
          </div>
          <Select
            value={filterType}
            onValueChange={(value: "all" | "main" | "side") => setFilterType(value)}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Loại banner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="main">Banner chính</SelectItem>
              <SelectItem value="side">Banner phụ</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filterStatus}
            onValueChange={(value: "all" | "active" | "inactive") => setFilterStatus(value)}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Ngừng</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-md border border-gray-200/60 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#0a923c] mb-2" />
            <p className="text-xs font-medium text-gray-500">Đang tải...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Layout className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              Không có dữ liệu
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Chưa có banner nào trong hệ thống
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a923c] hover:bg-[#0d7a33] text-white text-sm font-medium rounded-md transition-colors"
            >
              <Plus className="h-4 w-4" />
              Thêm banner đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <SortableHeader sortKey="image">Hình ảnh</SortableHeader>
                  <SortableHeader sortKey="type">Loại</SortableHeader>
                  <SortableHeader sortKey="title">Tiêu đề</SortableHeader>
                  <SortableHeader sortKey="link">Link</SortableHeader>
                  <SortableHeader sortKey="order">Thứ tự</SortableHeader>
                  <SortableHeader sortKey="status">Trạng thái</SortableHeader>
                  <SortableHeader sortKey="createdAt">Ngày tạo</SortableHeader>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedBanners.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <Layout className="h-10 w-10 text-gray-300 mb-2" />
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
                  sortedBanners.map((banner) => (
                    <tr
                      key={banner.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="relative w-16 h-10 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                          {banner.image ? (
                            <Image
                              src={banner.image}
                              alt={banner.title || "Banner"}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          banner.type === "main"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-purple-50 text-purple-700 border border-purple-200"
                        }`}>
                          {banner.type === "main" ? "Chính" : "Phụ"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">
                          {banner.title || "(Không có tiêu đề)"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {banner.link ? (
                          <a
                            href={banner.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline truncate block max-w-[200px]"
                          >
                            {banner.link}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">(Không có link)</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">
                          {banner.order}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            banner.status === "active"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {banner.status === "active" ? "Hoạt động" : "Ngừng"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">
                          {formatDate(banner.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(banner)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(banner.id, banner.title || "Banner")}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            title="Xóa"
                            disabled={deletingId === banner.id}
                          >
                            {deletingId === banner.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingBanner ? "Chỉnh sửa banner" : "Thêm banner mới"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Type */}
                <div>
                  <Label htmlFor="type" className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Loại banner <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "main" | "side") => setFormData((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Banner chính (Slider)</SelectItem>
                      <SelectItem value="side">Banner phụ (Bên phải)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.type === "main" 
                      ? "Banner hiển thị trong slider chính (có thể nhiều banner)"
                      : "Banner phụ bên cạnh slider (tối đa 2 banner đang hoạt động)"}
                  </p>
                </div>

                {/* Image Upload */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Hình ảnh <span className="text-red-500">*</span>
                  </Label>
                  <div className="space-y-2">
                    {formData.image ? (
                      <div className="relative w-full h-48 rounded-md overflow-hidden border border-gray-200">
                        <Image
                          src={formData.image}
                          alt="Banner preview"
                          fill
                          className="object-cover"
                          sizes="100%"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-[#0a923c] transition-colors bg-gray-50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {uploadingImage ? (
                            <Loader2 className="h-8 w-8 animate-spin text-[#0a923c] mb-2" />
                          ) : (
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          )}
                          <p className="text-sm text-gray-500 mb-1">
                            <span className="font-medium">Click để tải ảnh</span> hoặc kéo thả
                          </p>
                          <p className="text-xs text-gray-400">
                            PNG, JPG, WEBP (tối đa 10MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Tiêu đề
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Nhập tiêu đề (không bắt buộc)"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                {/* Link */}
                <div>
                  <Label htmlFor="link" className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Link
                  </Label>
                  <Input
                    id="link"
                    type="url"
                    placeholder="https://example.com (không bắt buộc)"
                    value={formData.link}
                    onChange={(e) => setFormData((prev) => ({ ...prev, link: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL khi người dùng click vào banner
                  </p>
                </div>

                {/* Order */}
                <div>
                  <Label htmlFor="order" className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Thứ tự hiển thị
                  </Label>
                  <Input
                    id="order"
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Số nhỏ hơn sẽ hiển thị trước
                  </p>
                </div>

                {/* Status */}
                <div>
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Trạng thái
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "active" | "inactive") => setFormData((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="inactive">Ngừng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a923c] hover:bg-[#0d7a33] text-white text-sm font-medium rounded-md transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    {editingBanner ? "Cập nhật" : "Tạo mới"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={!!bannerToDelete} onOpenChange={(open) => !open && setBannerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa banner "{bannerToDelete?.name}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

