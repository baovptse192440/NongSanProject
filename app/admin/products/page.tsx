"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  Package,
  Filter,
  Eye,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  DollarSign,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  price: number;
  oldPrice: number;
  discount: number;
  image: string;
  description: string;
  stock: number;
  sold: number;
  rating: number;
  status: "active" | "inactive";
  createdAt: string;
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Mock categories - trong thực tế sẽ lấy từ API
  const categories = [
    { id: "1", name: "Trái cây" },
    { id: "2", name: "Rau củ" },
    { id: "3", name: "Cà phê" },
    { id: "4", name: "Trà" },
    { id: "5", name: "Mật ong" },
    { id: "6", name: "Đặc sản" },
  ];

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    categoryId: "",
    price: "",
    oldPrice: "",
    image: "",
    description: "",
    stock: "",
    status: "active" as "active" | "inactive",
  });

  const products: Product[] = [
    {
      id: "1",
      name: "Cam Nam Phi - Nông Sản Fruits",
      slug: "cam-nam-phi",
      categoryId: "1",
      categoryName: "Trái cây",
      price: 78000,
      oldPrice: 200000,
      discount: 61,
      image: "/sp/1.jpg",
      description: "Cam Nam Phi tươi ngon, giàu vitamin C",
      stock: 150,
      sold: 707,
      rating: 4.5,
      status: "active",
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Kẹo Dynamite BigBang Vị Socola Bạc Hà",
      slug: "keo-dynamite",
      categoryId: "6",
      categoryName: "Đặc sản",
      price: 60000,
      oldPrice: 100000,
      discount: 40,
      image: "/sp/2.jpg",
      description: "Kẹo Dynamite BigBang vị socola bạc hà - Gói 120g",
      stock: 200,
      sold: 999,
      rating: 4.8,
      status: "active",
      createdAt: "2024-02-01",
    },
    {
      id: "3",
      name: "Thùng 24 Ly Trà Sữa (12 Oolong Nướng)",
      slug: "tra-sua-oolong",
      categoryId: "4",
      categoryName: "Trà",
      price: 310000,
      oldPrice: 360000,
      discount: 14,
      image: "/sp/3.jpg",
      description: "Thùng 24 ly trà sữa với 12 ly Oolong nướng",
      stock: 80,
      sold: 658,
      rating: 4.6,
      status: "active",
      createdAt: "2024-02-10",
    },
    {
      id: "4",
      name: "Cà Phê Cappuccino Sữa Dừa Hoà Tan",
      slug: "ca-phe-cappuccino",
      categoryId: "3",
      categoryName: "Cà phê",
      price: 259000,
      oldPrice: 400000,
      discount: 35,
      image: "/sp/4.jpg",
      description: "Cà phê Cappuccino sữa dừa hoà tan - UFO Coffee",
      stock: 120,
      sold: 707,
      rating: 4.9,
      status: "active",
      createdAt: "2024-01-20",
    },
    {
      id: "5",
      name: "Mật Ong Rừng U Minh Hạ - Chai 500ml",
      slug: "mat-ong-uminh",
      categoryId: "5",
      categoryName: "Mật ong",
      price: 180000,
      oldPrice: 250000,
      discount: 28,
      image: "/sp/1.jpg",
      description: "Mật ong rừng U Minh Hạ nguyên chất, chai 500ml",
      stock: 50,
      sold: 450,
      rating: 4.8,
      status: "active",
      createdAt: "2024-02-15",
    },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || product.status === filterStatus;
    const matchesCategory = filterCategory === "all" || product.categoryId === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === "active").length,
    inactive: products.filter((p) => p.status === "inactive").length,
    totalStock: products.reduce((sum, p) => sum + p.stock, 0),
    totalSold: products.reduce((sum, p) => sum + p.sold, 0),
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const openAddModal = () => {
    if (categories.length === 0) {
      alert("Vui lòng tạo danh mục trước khi thêm sản phẩm!");
      return;
    }
    setEditingProduct(null);
    setFormData({
      name: "",
      slug: "",
      categoryId: categories[0].id,
      price: "",
      oldPrice: "",
      image: "",
      description: "",
      stock: "",
      status: "active",
    });
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      categoryId: product.categoryId,
      price: product.price.toString(),
      oldPrice: product.oldPrice.toString(),
      image: product.image,
      description: product.description,
      stock: product.stock.toString(),
      status: product.status,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      alert("Vui lòng chọn danh mục!");
      return;
    }
    try {
      if (!formData.slug && formData.name) {
        setFormData({ ...formData, slug: generateSlug(formData.name) });
      }
      console.log("Saving product:", formData);
      setShowModal(false);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Có lỗi xảy ra khi lưu. Vui lòng thử lại.");
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      console.log("Deleting:", id);
    }
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Quản lý Sản phẩm</h1>
          <p className="text-sm text-gray-500">Quản lý danh sách sản phẩm của cửa hàng</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/categories"
            className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors"
          >
            Quản lý Danh mục
          </Link>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0a923c] hover:bg-[#0d7a33] text-white rounded-lg font-semibold transition-colors shadow-sm"
          >
            <Plus size={20} />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">Tổng sản phẩm</span>
            <Package className="w-5 h-5 text-[#0a923c]" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">Đang bán</span>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">Ngừng bán</span>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">Tồn kho</span>
            <Package className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalStock}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">Đã bán</span>
            <TrendingUp className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalSold}</p>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a923c] focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0a923c] focus:border-transparent cursor-pointer"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0a923c] focus:border-transparent cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang bán</option>
              <option value="inactive">Ngừng bán</option>
            </select>
          </div>
        </div>
      </div>

      {/* PRODUCTS GRID/LIST */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl p-12 text-center border border-gray-200">
              <p className="text-gray-500 font-medium">Không tìm thấy sản phẩm nào</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group"
              >
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    -{product.discount}%
                  </div>
                  <span
                    className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold ${
                      product.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.status === "active" ? "Đang bán" : "Ngừng bán"}
                  </span>
                </div>

                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">{product.categoryName}</p>
                  <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-[#0a923c] transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[#0a923c] font-bold text-lg">{formatPrice(product.price)}</p>
                      <p className="line-through text-gray-400 text-xs">{formatPrice(product.oldPrice)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pt-3 border-t border-gray-200">
                    <span>Kho: {product.stock}</span>
                    <span>Đã bán: {product.sold}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/product/${product.id}`}
                      className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye size={14} />
                      Xem
                    </Link>
                    <button
                      onClick={() => openEditModal(product)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Sản phẩm</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Danh mục</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Giá</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Kho</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Đã bán</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Trạng thái</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          <Image src={product.image} alt={product.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{formatPrice(product.price)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.categoryName}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-[#0a923c]">{formatPrice(product.price)}</p>
                        <p className="text-xs text-gray-400 line-through">{formatPrice(product.oldPrice)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.stock}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.sold}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          product.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.status === "active" ? "Đang bán" : "Ngừng bán"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/product/${product.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL ADD/EDIT PRODUCT */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên sản phẩm <span className="text-red-500">*</span>
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a923c] focus:border-transparent"
                    placeholder="Nhập tên sản phẩm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  {categories.length === 0 ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 mb-2">
                        Chưa có danh mục nào. Vui lòng tạo danh mục trước!
                      </p>
                      <Link
                        href="/admin/categories"
                        className="text-sm font-semibold text-yellow-700 hover:underline"
                      >
                        Tạo danh mục ngay →
                      </Link>
                    </div>
                  ) : (
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0a923c] focus:border-transparent cursor-pointer"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0a923c] focus:border-transparent"
                    placeholder="cam-nam-phi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL hình ảnh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a923c] focus:border-transparent"
                    placeholder="/sp/1.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giá bán (₫) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a923c] focus:border-transparent"
                    placeholder="78000"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giá cũ (₫)
                  </label>
                  <input
                    type="number"
                    value={formData.oldPrice}
                    onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a923c] focus:border-transparent"
                    placeholder="200000"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số lượng tồn kho <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a923c] focus:border-transparent"
                    placeholder="150"
                    min="0"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0a923c] focus:border-transparent cursor-pointer"
                  >
                    <option value="active">Đang bán</option>
                    <option value="inactive">Ngừng bán</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mô tả sản phẩm
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a923c] focus:border-transparent resize-none"
                    placeholder="Nhập mô tả chi tiết về sản phẩm..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0a923c] hover:bg-[#0d7a33] text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <Save size={18} />
                  <span>Lưu sản phẩm</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

