"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  Folder,
  FolderOpen,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Upload,
  ArrowUpDown,
} from "lucide-react";
import ToastContainer from "@/app/common/Toast";
import { useToast } from "@/app/common/useToast";

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

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    status: "active" as "active" | "inactive",
    parentId: "",
  });

  // Fetch categories
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/categories/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setFormData({ ...formData, image: result.data.url });
        toast.success("Tải ảnh lên thành công");
      } else {
        toast.error("Lỗi tải ảnh", result.error || "Không thể tải ảnh lên");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Lỗi tải ảnh", "Đã xảy ra lỗi khi tải ảnh lên");
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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"?`)) return;

    try {
      setDeletingId(id);
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        await fetchCategories();
        toast.success("Xóa danh mục thành công", `Đã xóa "${name}"`);
      } else {
        toast.error("Lỗi xóa danh mục", result.error || "Không thể xóa danh mục");
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
  }) => (
    <th
      className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors group"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        <span>{children}</span>
        <ArrowUpDown className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
      </div>
    </th>
  );

  return (
    <div className="space-y-6">
      {/* TOAST CONTAINER */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Quản lý Danh mục</h1>
          <p className="text-sm text-gray-500">Quản lý các danh mục sản phẩm của cửa hàng</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0a923c] hover:bg-[#0d7a33] text-white rounded-lg font-semibold transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Thêm danh mục</span>
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">Tổng số</span>
            <Folder className="w-5 h-5 text-[#0a923c]" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">Danh mục</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">Đang hoạt động</span>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
          <p className="text-xs text-gray-400 mt-1">Danh mục</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">Ngừng hoạt động</span>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
          <p className="text-xs text-gray-400 mt-1">Danh mục</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">Tổng sản phẩm</span>
            <FolderOpen className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
          <p className="text-xs text-gray-400 mt-1">Sản phẩm</p>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, slug, mô tả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] cursor-pointer transition-all"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 font-medium">Đang tải...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-200">
                <tr>
                  <SortableHeader sortKey="image">Hình ảnh</SortableHeader>
                  <SortableHeader sortKey="name">Tên danh mục</SortableHeader>
                  <SortableHeader sortKey="slug">Slug</SortableHeader>
                  <SortableHeader sortKey="productCount">Sản phẩm</SortableHeader>
                  <SortableHeader sortKey="status">Trạng thái</SortableHeader>
                  <SortableHeader sortKey="createdAt">Ngày tạo</SortableHeader>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <p className="text-gray-500 font-medium">Không tìm thấy danh mục nào</p>
                    </td>
                  </tr>
                ) : (
                  sortedCategories.map((category) => (
                    <tr
                      key={category.id}
                      className="hover:bg-gray-50/50 transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          {category.image ? (
                            <Image
                              src={category.image}
                              alt={category.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{category.name}</p>
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                            {category.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded font-mono">
                          /{category.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {category.productCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            category.status === "active"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {category.status === "active" ? "Hoạt động" : "Ngừng hoạt động"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(category.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(category)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id, category.name)}
                            disabled={deletingId === category.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Xóa"
                          >
                            {deletingId === category.id ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <Trash2 size={16} />
                              </motion.div>
                            ) : (
                              <Trash2 size={16} />
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

      {/* MODAL ADD/EDIT CATEGORY */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* IMAGE UPLOAD */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hình ảnh danh mục
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                    {formData.image ? (
                      <Image
                        src={formData.image}
                        alt="Preview"
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                        <Upload size={18} />
                        <span>{uploadingImage ? "Đang tải..." : "Tải ảnh lên"}</span>
                      </div>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      PNG, JPG hoặc WebP (tối đa 5MB)
                    </p>
                    {formData.image && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="text-xs text-red-600 hover:text-red-700 mt-1"
                      >
                        Xóa ảnh
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
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
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                  placeholder="Nhập tên danh mục"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slug (URL) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: generateSlug(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                  placeholder="trai-cay"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL sẽ là: /category/{formData.slug || "..."}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] resize-none transition-all"
                  placeholder="Nhập mô tả danh mục"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as "active" | "inactive" })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] cursor-pointer transition-all"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Ngừng hoạt động</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0a923c] hover:bg-[#0d7a33] text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Save size={18} />
                  <span>Lưu danh mục</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
