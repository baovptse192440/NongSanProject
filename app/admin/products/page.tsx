"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Upload,
  ArrowUp,
  ArrowDown,
  Loader2,
  X,
  Package,
  Tag,
  ChevronLeft,
  ChevronRight,
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

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  categoryName: string;
  images: string[];
  wholesalePrice: number;
  onSale: boolean;
  salePrice: number | null;
  salePercentage: number | null;
  saleStartDate: string | null;
  saleEndDate: string | null;
  stock: number;
  sku: string;
  status: "active" | "inactive" | "out_of_stock";
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const { toasts, toast, removeToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "out_of_stock">("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    categoryId: "",
    images: [] as string[],
    wholesalePrice: "",
    onSale: false,
    salePrice: "",
    salePercentage: "",
    saleStartDate: "",
    saleEndDate: "",
    stock: "",
    sku: "",
    status: "active" as "active" | "inactive" | "out_of_stock",
  });

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterCategory !== "all") params.append("categoryId", filterCategory);
      if (searchQuery) params.append("search", searchQuery);
      params.append("page", currentPage.toString());
      params.append("limit", limit.toString());

      const response = await fetch(`/api/products?${params.toString()}`);
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
        setTotal(result.total || 0);
        setTotalPages(result.totalPages || 1);
      } else {
        toast.error("Lỗi", "Không thể tải danh sách sản phẩm");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Lỗi", "Đã xảy ra lỗi khi tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories?status=active");
      const result = await response.json();
      if (result.success) {
        setCategories(result.data.map((cat: { id: string; name: string }) => ({ id: cat.id, name: cat.name })));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterCategory]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterCategory, currentPage, limit]);

  // Re-fetch when search query changes (with debounce)
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when search changes
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortConfig) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    const { key, direction } = sortConfig;
    let aValue: string | number | boolean | string[] | null | undefined = a[key as keyof Product];
    let bValue: string | number | boolean | string[] | null | undefined = b[key as keyof Product];

    // Handle arrays (like images)
    if (Array.isArray(aValue)) aValue = aValue.length.toString();
    if (Array.isArray(bValue)) bValue = bValue.length.toString();

    // Handle null/undefined
    if (aValue === null || aValue === undefined) aValue = "";
    if (bValue === null || bValue === undefined) bValue = "";

    // Convert to strings for comparison if needed
    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    // Compare values
    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === "active").length,
    inactive: products.filter((p) => p.status === "inactive").length,
    outOfStock: products.filter((p) => p.status === "out_of_stock").length,
    onSale: products.filter((p) => p.onSale).length,
  };

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        if (current.direction === "asc") {
          return { key, direction: "desc" };
        }
        return null;
      }
      return { key, direction: "asc" };
    });
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

  const formatPriceAUD = (price: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      categoryId: product.categoryId,
      images: product.images || [],
      wholesalePrice: product.wholesalePrice.toString(),
      onSale: product.onSale || false,
      salePrice: product.salePrice?.toString() || "",
      salePercentage: product.salePercentage?.toString() || "",
      saleStartDate: product.saleStartDate ? new Date(product.saleStartDate).toISOString().split("T")[0] : "",
      saleEndDate: product.saleEndDate ? new Date(product.saleEndDate).toISOString().split("T")[0] : "",
      stock: product.stock.toString(),
      sku: product.sku || "",
      status: product.status,
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImages(true);
      const uploadPromises = Array.from(files).map(async (file) => {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);

        const response = await fetch("/api/products/upload", {
          method: "POST",
          body: uploadFormData,
        });

        const result = await response.json();
        if (result.success) {
          return result.data.url;
        }
        throw new Error(result.error || "Upload failed");
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData({
        ...formData,
        images: [...formData.images, ...uploadedUrls],
      });
      toast.success("Thành công", `Đã tải lên ${uploadedUrls.length} ảnh`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Lỗi", "Không thể tải ảnh lên");
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.images.length === 0) {
      toast.error("Lỗi", "Sản phẩm phải có ít nhất một hình ảnh");
      return;
    }

    if (!formData.categoryId) {
      toast.error("Lỗi", "Vui lòng chọn danh mục");
      return;
    }

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      
      const method = editingProduct ? "PUT" : "POST";

      const body: {
        name: string;
        slug: string;
        description: string;
        shortDescription: string;
        categoryId: string;
        images: string[];
        wholesalePrice: number;
        onSale: boolean;
        stock: number;
        sku?: string;
        status: "active" | "inactive" | "out_of_stock";
        salePrice?: number;
        salePercentage?: number;
        saleStartDate?: string;
        saleEndDate?: string;
      } = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description,
        shortDescription: formData.shortDescription,
        categoryId: formData.categoryId,
        images: formData.images,
        wholesalePrice: parseFloat(formData.wholesalePrice),
        onSale: formData.onSale,
        stock: parseInt(formData.stock),
        status: formData.status,
      };

      if (formData.sku) body.sku = formData.sku;
      if (formData.onSale) {
        if (formData.salePrice) body.salePrice = parseFloat(formData.salePrice);
        if (formData.salePercentage) body.salePercentage = parseFloat(formData.salePercentage);
        if (formData.saleStartDate) body.saleStartDate = formData.saleStartDate;
        if (formData.saleEndDate) body.saleEndDate = formData.saleEndDate;
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
        toast.success("Thành công", editingProduct ? "Cập nhật sản phẩm thành công" : "Tạo sản phẩm thành công");
        setShowModal(false);
        await fetchProducts();
      } else {
        toast.error("Lỗi", result.error || "Không thể lưu sản phẩm");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Lỗi", "Đã xảy ra lỗi khi lưu sản phẩm");
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setProductToDelete({ id, name });
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    const { id, name } = productToDelete;
    
    try {
      setDeletingId(id);
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        await fetchProducts();
        toast.success("Thành công", `Đã xóa sản phẩm "${name}"`);
        setProductToDelete(null);
      } else {
        toast.error("Lỗi", result.error || "Không thể xóa sản phẩm");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Lỗi", "Đã xảy ra lỗi khi xóa sản phẩm");
    } finally {
      setDeletingId(null);
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
          <h1 className="text-2xl font-semibold text-gray-900">Sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý sản phẩm
          </p>
        </div>
        {categories.length === 0 ? (
          <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
            Vui lòng tạo danh mục trước khi thêm sản phẩm
          </div>
        ) : (
          <Link
            href="/admin/products/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a923c] hover:bg-[#0d7a33] text-white text-sm font-medium rounded-md transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Thêm mới
          </Link>
        )}
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tổng số</span>
            <div className="p-2 rounded-md bg-[#0a923c]/10">
              <Package className="h-4 w-4 text-[#0a923c]" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">Sản phẩm</p>
        </div>

        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hoạt động</span>
            <div className="p-2 rounded-md bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
          <p className="text-xs text-gray-400 mt-1">Sản phẩm</p>
        </div>

        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ngừng</span>
            <div className="p-2 rounded-md bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.inactive}</p>
          <p className="text-xs text-gray-400 mt-1">Sản phẩm</p>
        </div>

        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hết hàng</span>
            <div className="p-2 rounded-md bg-orange-50">
              <Package className="h-4 w-4 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.outOfStock}</p>
          <p className="text-xs text-gray-400 mt-1">Sản phẩm</p>
        </div>

        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Đang sale</span>
            <div className="p-2 rounded-md bg-red-50">
              <Tag className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.onSale}</p>
          <p className="text-xs text-gray-400 mt-1">Sản phẩm</p>
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
            value={filterCategory}
            onValueChange={(value) => {
              setFilterCategory(value);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filterStatus}
            onValueChange={(value: "all" | "active" | "inactive" | "out_of_stock") => setFilterStatus(value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Ngừng</SelectItem>
              <SelectItem value="out_of_stock">Hết hàng</SelectItem>
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
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              Không có dữ liệu
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Chưa có sản phẩm nào trong hệ thống
            </p>
            {categories.length > 0 && (
              <Link
                href="/admin/products/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a923c] hover:bg-[#0d7a33] text-white text-sm font-medium rounded-md transition-colors"
              >
                <Plus className="h-4 w-4" />
                Thêm sản phẩm đầu tiên
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                    STT
                  </th>
                  <SortableHeader sortKey="images">Hình</SortableHeader>
                  <SortableHeader sortKey="name">Tên</SortableHeader>
                  <SortableHeader sortKey="categoryName">Danh mục</SortableHeader>
                  <SortableHeader sortKey="wholesalePrice">Giá đại lý</SortableHeader>
                  <SortableHeader sortKey="stock">Kho</SortableHeader>
                  <SortableHeader sortKey="status">Trạng thái</SortableHeader>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="h-10 w-10 text-gray-300 mb-2" />
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
                  sortedProducts.map((product, index) => {
                    // Calculate STT based on current page and limit
                    const stt = (currentPage - 1) * limit + index + 1;
                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-600">
                            {stt}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                          {product.images && product.images.length > 1 && (
                            <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1 rounded-tl">
                              +{product.images.length - 1}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {product.sku && `SKU: ${product.sku}`}
                          </p>
                          {product.onSale && (
                            <span className="inline-flex items-center gap-0.5 mt-1 text-[10px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                              <Tag className="h-2.5 w-2.5" />
                              Sale
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                          {product.categoryName || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          {product.onSale && product.salePrice ? (
                            <>
                              <p className="text-sm font-semibold text-red-600">
                                {formatPriceAUD(product.salePrice)}
                              </p>
                              <p className="text-xs text-gray-400 line-through">
                                {formatPriceAUD(product.wholesalePrice)}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm font-semibold text-gray-900">
                              {formatPriceAUD(product.wholesalePrice)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${
                          product.stock === 0 ? "text-red-600" : product.stock < 10 ? "text-orange-600" : "text-gray-900"
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            product.status === "active"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : product.status === "inactive"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-orange-50 text-orange-700 border border-orange-200"
                          }`}
                        >
                          {product.status === "active" ? "Hoạt động" : product.status === "inactive" ? "Ngừng" : "Hết hàng"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(product.id, product.name)}
                            disabled={deletingId === product.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                            title="Xóa"
                          >
                            {deletingId === product.id ? (
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
                Hiển thị {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, total)} của {total} sản phẩm
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
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-md shadow-2xl border border-gray-200/60"
              onClick={(e) => e.stopPropagation()}
            >
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {editingProduct
                      ? "Cập nhật thông tin sản phẩm"
                      : "Thêm sản phẩm mới vào hệ thống"}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              {/* MODAL BODY - Scrollable */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* BASIC INFO */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">Thông tin cơ bản</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Tên sản phẩm <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            name: e.target.value,
                            slug: formData.slug || generateSlug(e.target.value),
                          });
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                        placeholder="Nhập tên sản phẩm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="slug" className="text-sm font-medium text-gray-700">
                        Slug <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="slug"
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all font-mono"
                        placeholder="san-pham-slug"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="sku" className="text-sm font-medium text-gray-700">
                        SKU
                      </label>
                      <input
                        type="text"
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                        placeholder="SKU123456"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label htmlFor="categoryId" className="text-sm font-medium text-gray-700">
                        Danh mục <span className="text-red-500">*</span>
                      </label>
                      {categories.length === 0 ? (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                          Vui lòng tạo danh mục trước
                        </div>
                      ) : (
                        <Select
                          value={formData.categoryId}
                          onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                        >
                          <SelectTrigger id="categoryId" className="w-full">
                            <SelectValue placeholder="Chọn danh mục" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label htmlFor="shortDescription" className="text-sm font-medium text-gray-700">
                        Mô tả ngắn
                      </label>
                      <textarea
                        id="shortDescription"
                        rows={2}
                        value={formData.shortDescription}
                        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all resize-none"
                        placeholder="Mô tả ngắn về sản phẩm..."
                        maxLength={500}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label htmlFor="description" className="text-sm font-medium text-gray-700">
                        Mô tả chi tiết
                      </label>
                      <textarea
                        id="description"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all resize-none"
                        placeholder="Mô tả chi tiết về sản phẩm..."
                      />
                    </div>
                  </div>
                </div>

                {/* IMAGES */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">Hình ảnh</h3>
                  
                  <div className="space-y-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a923c] hover:bg-[#0d7a33] text-white text-sm font-medium rounded-md transition-colors cursor-pointer">
                      {uploadingImages ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang tải...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Tải ảnh lên
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImages}
                      />
                    </label>

                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-3">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                              <Image
                                src={image}
                                alt={`Product image ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 25vw"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-1 right-1 p-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* PRICING */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">Giá cả (AUD)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="wholesalePrice" className="text-sm font-medium text-gray-700">
                        Giá đại lý (AUD) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="wholesalePrice"
                        required
                        step="0.01"
                        min="0"
                        value={formData.wholesalePrice}
                        onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* SALE SETTINGS */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <h3 className="text-sm font-semibold text-gray-900">Khuyến mãi</h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.onSale}
                        onChange={(e) => setFormData({ ...formData, onSale: e.target.checked })}
                        className="w-4 h-4 text-[#0a923c] border-gray-300 rounded focus:ring-[#0a923c]"
                      />
                      <span className="text-sm text-gray-700">Bật khuyến mãi</span>
                    </label>
                  </div>

                  {formData.onSale && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="salePrice" className="text-sm font-medium text-gray-700">
                          Giá sale (AUD)
                        </label>
                        <input
                          type="number"
                          id="salePrice"
                          step="0.01"
                          min="0"
                          value={formData.salePrice}
                          onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="salePercentage" className="text-sm font-medium text-gray-700">
                          % Giảm giá
                        </label>
                        <input
                          type="number"
                          id="salePercentage"
                          step="0.1"
                          min="0"
                          max="100"
                          value={formData.salePercentage}
                          onChange={(e) => setFormData({ ...formData, salePercentage: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="saleStartDate" className="text-sm font-medium text-gray-700">
                          Ngày bắt đầu
                        </label>
                        <input
                          type="date"
                          id="saleStartDate"
                          value={formData.saleStartDate}
                          onChange={(e) => setFormData({ ...formData, saleStartDate: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="saleEndDate" className="text-sm font-medium text-gray-700">
                          Ngày kết thúc
                        </label>
                        <input
                          type="date"
                          id="saleEndDate"
                          value={formData.saleEndDate}
                          onChange={(e) => setFormData({ ...formData, saleEndDate: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* STOCK & STATUS */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">Kho & Trạng thái</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="stock" className="text-sm font-medium text-gray-700">
                        Số lượng tồn kho <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="stock"
                        required
                        min="0"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="status" className="text-sm font-medium text-gray-700">
                        Trạng thái
                      </label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: "active" | "inactive" | "out_of_stock") =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger id="status" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Hoạt động</SelectItem>
                          <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                          <SelectItem value="out_of_stock">Hết hàng</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
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
                    className="px-4 py-2 text-sm font-medium bg-[#0a923c] hover:bg-[#0d7a33] text-white rounded-md transition-colors"
                  >
                    {editingProduct ? "Cập nhật" : "Tạo mới"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent className="rounded-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600">
              Bạn có chắc chắn muốn xóa sản phẩm <span className="font-semibold text-gray-900">&quot;{productToDelete?.name}&quot;</span>? 
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
