"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  Phone,
  Mail,
  MapPin,
  Package,
  TrendingUp,
  X,
  Save,
  Building2,
  User,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: "active" | "inactive";
  totalProducts: number;
  totalOrders: number;
  createdAt: string;
}

export default function SupplyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    status: "active" as "active" | "inactive",
  });

  const suppliers: Supplier[] = [
    {
      id: "1",
      name: "Công ty Nông Sản Sạch Việt Nam",
      contactPerson: "Nguyễn Văn A",
      email: "contact@nongsanvietnam.com",
      phone: "0912345678",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      status: "active",
      totalProducts: 45,
      totalOrders: 234,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Trang trại Organic Hà Nội",
      contactPerson: "Trần Thị B",
      email: "info@organic.vn",
      phone: "0987654321",
      address: "456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội",
      status: "active",
      totalProducts: 32,
      totalOrders: 189,
      createdAt: "2024-02-20",
    },
    {
      id: "3",
      name: "Nhà cung cấp Trái Cây Miền Tây",
      contactPerson: "Lê Văn C",
      email: "sales@traicaymientay.com",
      phone: "0901234567",
      address: "789 Đường MNO, Cần Thơ",
      status: "inactive",
      totalProducts: 28,
      totalOrders: 145,
      createdAt: "2024-03-10",
    },
    {
      id: "4",
      name: "Cà Phê Tây Nguyên Premium",
      contactPerson: "Phạm Thị D",
      email: "contact@caohepremium.vn",
      phone: "0923456789",
      address: "321 Đường DEF, Đà Lạt, Lâm Đồng",
      status: "active",
      totalProducts: 15,
      totalOrders: 298,
      createdAt: "2024-01-05",
    },
    {
      id: "5",
      name: "Mật Ong Rừng U Minh",
      contactPerson: "Hoàng Văn E",
      email: "matong@uminh.com",
      phone: "0934567890",
      address: "654 Đường GHI, Cà Mau",
      status: "active",
      totalProducts: 12,
      totalOrders: 167,
      createdAt: "2024-02-28",
    },
  ];

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.phone.includes(searchQuery);
    
    const matchesStatus = filterStatus === "all" || supplier.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: suppliers.length,
    active: suppliers.filter((s) => s.status === "active").length,
    inactive: suppliers.filter((s) => s.status === "inactive").length,
    totalProducts: suppliers.reduce((sum, s) => sum + s.totalProducts, 0),
  };

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      status: "active",
    });
    setShowModal(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      status: supplier.status,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Handle save logic here
      console.log("Saving:", formData);
      // TODO: Add API call here
      setShowModal(false);
    } catch (error) {
      console.error("Error saving supplier:", error);
      alert("Có lỗi xảy ra khi lưu. Vui lòng thử lại.");
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) {
      console.log("Deleting:", id);
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

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Quản lý Nhà cung cấp</h1>
          <p className="text-sm text-gray-500">Quản lý danh sách nhà cung cấp và thông tin liên hệ</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0a923c] hover:bg-[#0d7a33] text-white rounded-lg font-semibold transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Thêm nhà cung cấp</span>
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">Tổng số</span>
            <Building2 className="w-5 h-5 text-[#0a923c]" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">Nhà cung cấp</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">Đang hoạt động</span>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
          <p className="text-xs text-gray-400 mt-1">Nhà cung cấp</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">Ngừng hoạt động</span>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
          <p className="text-xs text-gray-400 mt-1">Nhà cung cấp</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">Tổng sản phẩm</span>
            <Package className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
          <p className="text-xs text-gray-400 mt-1">Sản phẩm</p>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* SEARCH */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, người liên hệ, email, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a923c] focus:border-transparent"
            />
          </div>

          {/* FILTER STATUS */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0a923c] focus:border-transparent cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </div>
        </div>
      </div>

      {/* SUPPLIERS TABLE */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Nhà cung cấp
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Đơn hàng
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Ngày tham gia
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-gray-500 font-medium">Không tìm thấy nhà cung cấp nào</p>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0a923c] flex items-center justify-center text-white font-semibold">
                          {supplier.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{supplier.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {supplier.address}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {supplier.contactPerson}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {supplier.email}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {supplier.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-semibold text-gray-900">
                          {supplier.totalProducts}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-semibold text-gray-900">
                          {supplier.totalOrders}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(supplier.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          supplier.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {supplier.status === "active" ? "Hoạt động" : "Ngừng hoạt động"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(supplier)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {filteredSuppliers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Hiển thị <span className="font-semibold">1-{filteredSuppliers.length}</span> trong{" "}
              <span className="font-semibold">{filteredSuppliers.length}</span> nhà cung cấp
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                Trước
              </button>
              <button className="px-4 py-1.5 bg-[#0a923c] text-white rounded-lg text-sm font-semibold">
                1
              </button>
              <button className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                2
              </button>
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL ADD/EDIT SUPPLIER */}
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
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingSupplier ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp mới"}
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
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên nhà cung cấp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a923c] focus:border-transparent"
                    placeholder="Nhập tên nhà cung cấp"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Người liên hệ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPerson: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a923c] focus:border-transparent"
                    placeholder="Nhập tên người liên hệ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a923c] focus:border-transparent"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a923c] focus:border-transparent"
                    placeholder="0912345678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a923c] focus:border-transparent resize-none"
                  placeholder="Nhập địa chỉ chi tiết"
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
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Ngừng hoạt động</option>
                </select>
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
                  <span>Lưu thông tin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

