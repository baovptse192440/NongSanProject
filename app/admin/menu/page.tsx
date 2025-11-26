"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Menu as MenuIcon,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  Loader2,
  X,
  ChevronRight,
  Link as LinkIcon,
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

interface Menu {
  id: string;
  title: string;
  url: string;
  icon: string;
  order: number;
  status: "active" | "inactive";
  parentId?: string;
  createdAt: string;
  parentTitle?: string; // For display
}

export default function MenuPage() {
  const { toasts, toast, removeToast } = useToast();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [menuToDelete, setMenuToDelete] = useState<{ id: string; title: string } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    url: "",
    icon: "",
    order: 0,
    status: "active" as "active" | "inactive",
    parentId: "",
  });

  // Fetch menus function
  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/menus");
      const result = await response.json();
      if (result.success) {
        // Enrich menus with parent title for display
        const enrichedMenus = result.data.map((menu: Menu) => {
          if (menu.parentId) {
            const parent = result.data.find((m: Menu) => m.id === menu.parentId);
            return { ...menu, parentTitle: parent?.title || "" };
          }
          return menu;
        });
        setMenus(enrichedMenus);
      }
    } catch (error) {
      console.error("Error fetching menus:", error);
      toast.error("Lỗi", "Không thể tải danh sách menu");
    } finally {
      setLoading(false);
    }
  };

  // Chỉ fetch 1 lần khi component mount
  useEffect(() => {
    fetchMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredMenus = menus.filter((menu) => {
    const matchesSearch = !searchQuery || 
      menu.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      menu.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || menu.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedMenus = [...filteredMenus].sort((a, b) => {
    if (!sortConfig) {
      // Default sort: parent menus first, then by order
      if (a.parentId && !b.parentId) return 1;
      if (!a.parentId && b.parentId) return -1;
      return a.order - b.order;
    }

    const { key, direction } = sortConfig;
    let aValue: string | number | Date | undefined = a[key as keyof Menu];
    let bValue: string | number | Date | undefined = b[key as keyof Menu];

    if (aValue === undefined) aValue = "";
    if (bValue === undefined) bValue = "";

    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue !== undefined && bValue !== undefined) {
      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const stats = {
    total: menus.length,
    active: menus.filter((m) => m.status === "active").length,
    inactive: menus.filter((m) => m.status === "inactive").length,
    parent: menus.filter((m) => !m.parentId).length,
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

  const openAddModal = () => {
    setEditingMenu(null);
    setFormData({
      title: "",
      url: "",
      icon: "",
      order: 0,
      status: "active",
      parentId: "",
    });
    setShowModal(true);
  };

  const openEditModal = (menu: Menu) => {
    setEditingMenu(menu);
    setFormData({
      title: menu.title,
      url: menu.url || "",
      icon: menu.icon || "",
      order: menu.order || 0,
      status: menu.status,
      parentId: menu.parentId || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingMenu
        ? `/api/menus/${editingMenu.id}`
        : "/api/menus";
      
      const method = editingMenu ? "PUT" : "POST";

      const body = {
        ...formData,
        parentId: formData.parentId || null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Thành công", editingMenu ? "Cập nhật menu thành công" : "Tạo menu thành công");
        setShowModal(false);
        await fetchMenus();
      } else {
        toast.error("Lỗi", result.error || "Không thể lưu menu");
      }
    } catch (error) {
      console.error("Error saving menu:", error);
      toast.error("Lỗi", "Đã xảy ra lỗi khi lưu menu");
    }
  };

  const handleDeleteClick = (id: string, title: string) => {
    setMenuToDelete({ id, title });
  };

  const handleDelete = async () => {
    if (!menuToDelete) return;

    const { id, title } = menuToDelete;
    
    try {
      setDeletingId(id);
      const response = await fetch(`/api/menus/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        await fetchMenus();
        toast.success("Thành công", `Đã xóa menu "${title}"`);
        setMenuToDelete(null);
      } else {
        toast.error("Lỗi", result.error || "Không thể xóa menu");
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
      toast.error("Lỗi", "Đã xảy ra lỗi khi xóa menu");
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

  // Get parent menus (for dropdown)
  const parentMenus = menus.filter((m) => !m.parentId);

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
          <h1 className="text-2xl font-semibold text-gray-900">Menu</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý menu điều hướng
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
              <MenuIcon className="h-4 w-4 text-[#0a923c]" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">Menu</p>
        </div>

        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hoạt động</span>
            <div className="p-2 rounded-md bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
          <p className="text-xs text-gray-400 mt-1">Menu</p>
        </div>

        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ngừng</span>
            <div className="p-2 rounded-md bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.inactive}</p>
          <p className="text-xs text-gray-400 mt-1">Menu</p>
        </div>

        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Menu cha</span>
            <div className="p-2 rounded-md bg-blue-50">
              <MenuIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.parent}</p>
          <p className="text-xs text-gray-400 mt-1">Menu gốc</p>
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
        ) : menus.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <MenuIcon className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              Không có dữ liệu
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Chưa có menu nào trong hệ thống
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a923c] hover:bg-[#0d7a33] text-white text-sm font-medium rounded-md transition-colors"
            >
              <Plus className="h-4 w-4" />
              Thêm menu đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <SortableHeader sortKey="title">Tiêu đề</SortableHeader>
                  <SortableHeader sortKey="url">URL</SortableHeader>
                  <SortableHeader sortKey="parentId">Menu cha</SortableHeader>
                  <SortableHeader sortKey="order">Thứ tự</SortableHeader>
                  <SortableHeader sortKey="status">Trạng thái</SortableHeader>
                  <SortableHeader sortKey="createdAt">Ngày tạo</SortableHeader>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedMenus.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <MenuIcon className="h-10 w-10 text-gray-300 mb-2" />
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
                  sortedMenus.map((menu) => (
                    <tr
                      key={menu.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {menu.parentId && (
                            <ChevronRight className="h-3 w-3 text-gray-400" />
                          )}
                          {menu.icon && (
                            <span className="text-gray-500">{menu.icon}</span>
                          )}
                          <p className="text-sm font-semibold text-gray-900">
                            {menu.title}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {menu.url ? (
                          <div className="flex items-center gap-1.5">
                            <LinkIcon className="h-3 w-3 text-gray-400" />
                            <code className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md font-mono border border-gray-200">
                              {menu.url}
                            </code>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {menu.parentTitle ? (
                          <span className="text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                            {menu.parentTitle}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">
                          {menu.order}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            menu.status === "active"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {menu.status === "active" ? "Hoạt động" : "Ngừng"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">
                          {formatDate(menu.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(menu)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(menu.id, menu.title)}
                            disabled={deletingId === menu.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                            title="Xóa"
                          >
                            {deletingId === menu.id ? (
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
                    {editingMenu ? "Chỉnh sửa menu" : "Thêm menu mới"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {editingMenu
                      ? "Cập nhật thông tin menu"
                      : "Thêm menu điều hướng mới"}
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
                {/* TITLE */}
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                    placeholder="Ví dụ: Trang chủ"
                  />
                </div>

                {/* URL */}
                <div className="space-y-2">
                  <label htmlFor="url" className="text-sm font-medium text-gray-700">
                    URL
                  </label>
                  <input
                    type="text"
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                    placeholder="Ví dụ: /home hoặc /category/fruit"
                  />
                </div>

                {/* PARENT MENU */}
                <div className="space-y-2">
                  <label htmlFor="parentId" className="text-sm font-medium text-gray-700">
                    Menu cha
                  </label>
                  <Select
                    value={formData.parentId}
                    onValueChange={(value) => setFormData({ ...formData, parentId: value === "none" ? "" : value })}
                  >
                    <SelectTrigger id="parentId" className="w-full">
                      <SelectValue placeholder="Chọn menu cha (để trống nếu là menu gốc)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không có (Menu gốc)</SelectItem>
                      {parentMenus
                        .filter((m) => !editingMenu || m.id !== editingMenu.id)
                        .map((menu) => (
                          <SelectItem key={menu.id} value={menu.id}>
                            {menu.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Chọn menu cha để tạo menu con
                  </p>
                </div>

                {/* ORDER */}
                <div className="space-y-2">
                  <label htmlFor="order" className="text-sm font-medium text-gray-700">
                    Thứ tự
                  </label>
                  <input
                    type="number"
                    id="order"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500">
                    Số nhỏ hơn sẽ hiển thị trước
                  </p>
                </div>

                {/* ICON */}
                <div className="space-y-2">
                  <label htmlFor="icon" className="text-sm font-medium text-gray-700">
                    Icon
                  </label>
                  <input
                    type="text"
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                    placeholder="Emoji hoặc ký tự icon"
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
                    className="px-4 py-2 text-sm font-medium bg-[#0a923c] hover:bg-[#0d7a33] text-white rounded-md transition-colors"
                  >
                    {editingMenu ? "Cập nhật" : "Tạo mới"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={!!menuToDelete} onOpenChange={(open) => !open && setMenuToDelete(null)}>
        <AlertDialogContent className="rounded-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600">
              Bạn có chắc chắn muốn xóa menu <span className="font-semibold text-gray-900">&quot;{menuToDelete?.title}&quot;</span>? 
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

