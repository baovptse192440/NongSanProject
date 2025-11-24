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
  Folder,
  FolderOpen,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Upload,
  ArrowUp,
  ArrowDown,
  Loader2,
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

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: "active" | "inactive";
  productCount: number;
  parentId?: string;
  createdAt: string;
}

export default function CategoriesPage() {
  const { toasts, toast, removeToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    status: "active" as "active" | "inactive",
    parentId: "",
  });

  // Fetch categories function
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/categories");
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Lỗi", "Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  // Chỉ fetch 1 lần khi component mount
  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - chỉ chạy 1 lần khi mount

  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || category.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Sort categories
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (!sortConfig) return 0;
    const aValue = a[sortConfig.key as keyof Category];
    const bValue = b[sortConfig.key as keyof Category];
    
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
    total: categories.length,
    active: categories.filter((c) => c.status === "active").length,
    inactive: categories.filter((c) => c.status === "inactive").length,
    totalProducts: categories.reduce((sum, c) => sum + c.productCount, 0),
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch("/api/categories/upload", {
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
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: "",
      status: "active",
      parentId: "",
    });
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      status: category.status,
      parentId: category.parentId || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        await fetchCategories();
        setShowModal(false);
        toast.success(
          "Thành công",
          editingCategory ? "Cập nhật danh mục thành công" : "Tạo danh mục thành công"
        );
      } else {
        toast.error("Lỗi", result.error || "Không thể lưu danh mục");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Lỗi", "Đã xảy ra lỗi khi lưu danh mục");
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setCategoryToDelete({ id, name });
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    const { id, name } = categoryToDelete;
    
    try {
      setDeletingId(id);
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        await fetchCategories();
        toast.success("Thành công", `Đã xóa danh mục "${name}"`);
        setCategoryToDelete(null);
      } else {
        toast.error("Lỗi", result.error || "Không thể xóa danh mục");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Lỗi", "Đã xảy ra lỗi khi xóa danh mục");
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
          <h1 className="text-2xl font-semibold text-gray-900">Danh mục</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý danh mục sản phẩm
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tổng số</span>
            <div className="p-2 rounded-md bg-[#0a923c]/10">
              <Folder className="h-4 w-4 text-[#0a923c]" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">Danh mục</p>
        </div>

        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hoạt động</span>
            <div className="p-2 rounded-md bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
          <p className="text-xs text-gray-400 mt-1">Danh mục</p>
        </div>

        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ngừng</span>
            <div className="p-2 rounded-md bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.inactive}</p>
          <p className="text-xs text-gray-400 mt-1">Danh mục</p>
        </div>

        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sản phẩm</span>
            <div className="p-2 rounded-md bg-blue-50">
              <FolderOpen className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
          <p className="text-xs text-gray-400 mt-1">Tổng cộng</p>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white rounded-md p-4 border border-gray-200/60">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
            />
          </div>
          <Select
            value={filterStatus}
            onValueChange={(value: "all" | "active" | "inactive") => setFilterStatus(value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
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
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Folder className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              Không có dữ liệu
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Chưa có danh mục nào trong hệ thống
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a923c] hover:bg-[#0d7a33] text-white text-sm font-medium rounded-md transition-colors"
            >
              <Plus className="h-4 w-4" />
              Thêm danh mục đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <SortableHeader sortKey="image">Hình</SortableHeader>
                  <SortableHeader sortKey="name">Tên</SortableHeader>
                  <SortableHeader sortKey="slug">Slug</SortableHeader>
                  <SortableHeader sortKey="productCount">SP</SortableHeader>
                  <SortableHeader sortKey="status">Trạng thái</SortableHeader>
                  <SortableHeader sortKey="createdAt">Ngày tạo</SortableHeader>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <Folder className="h-10 w-10 text-gray-300 mb-2" />
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
                  sortedCategories.map((category) => (
                    <tr
                      key={category.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                          {category.image ? (
                            <Image
                              src={category.image}
                              alt={category.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {category.name}
                          </p>
                          {category.description && (
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md font-mono border border-gray-200">
                          /{category.slug}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">
                          {category.productCount}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            category.status === "active"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {category.status === "active" ? "Hoạt động" : "Ngừng"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">
                          {formatDate(category.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(category)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(category.id, category.name)}
                            disabled={deletingId === category.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                            title="Xóa"
                          >
                            {deletingId === category.id ? (
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

      {/* MODAL WITH BLUR BACKDROP */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* BACKDROP WITH BLUR */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            
            {/* MODAL CONTENT */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-hidden bg-white rounded-md shadow-2xl border border-gray-200/60"
              onClick={(e) => e.stopPropagation()}
            >
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {editingCategory
                      ? "Cập nhật thông tin danh mục"
                      : "Thêm danh mục sản phẩm mới"}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              {/* MODAL BODY */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* IMAGE UPLOAD */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Hình ảnh
                  </label>
                  <div className="flex items-start gap-4">
                    <div className="relative w-20 h-20 rounded-md overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 shrink-0">
                      {formData.image ? (
                        <>
                          <Image
                            src={formData.image}
                            alt="Preview"
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, image: "" })}
                            className="absolute top-1 right-1 p-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                          <Upload className="h-4 w-4" />
                          <span>{uploadingImage ? "Đang tải..." : "Chọn ảnh"}</span>
                        </div>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      <p className="text-xs text-gray-500">
                        PNG, JPG, WebP (tối đa 5MB)
                      </p>
                    </div>
                  </div>
                </div>

                {/* NAME */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Tên danh mục <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: formData.slug || generateSlug(e.target.value),
                      });
                    }}
                    placeholder="Ví dụ: Trái cây tươi"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                  />
                </div>

                {/* SLUG */}
                <div className="space-y-2">
                  <label htmlFor="slug" className="text-sm font-medium text-gray-700">
                    Slug (URL) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="slug"
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: generateSlug(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all font-mono"
                    placeholder="trai-cay-tuoi"
                  />
                  <p className="text-xs text-gray-500">
                    URL: <code className="bg-gray-50 px-1.5 py-0.5 rounded-md">/category/{formData.slug || "..."}</code>
                  </p>
                </div>

                {/* DESCRIPTION */}
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Mô tả
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Nhập mô tả..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] resize-none transition-all"
                  />
                </div>

                {/* STATUS */}
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Trạng thái
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "active" | "inactive") =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a923c] hover:bg-[#0d7a33] text-white text-sm font-medium rounded-md transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    {editingCategory ? "Cập nhật" : "Tạo mới"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent className="rounded-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600">
              Bạn có chắc chắn muốn xóa danh mục <span className="font-semibold text-gray-900">"{categoryToDelete?.name}"</span>? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-md">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-md"
              disabled={!!deletingId}
            >
              {deletingId ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
