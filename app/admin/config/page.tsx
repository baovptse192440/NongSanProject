"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Save,
  Image as ImageIcon,
  Upload,
  Loader2,
  Settings,
  Globe,
  Search,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  BarChart,
  X,
} from "lucide-react";
import ToastContainer from "@/app/common/Toast";
import { useToast } from "@/app/common/useToast";

interface SiteConfig {
  id: string;
  siteName: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  logoDark: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  ogTitle: string;
  ogDescription: string;
  email: string;
  phone: string;
  address: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  updatedAt: string;
}

export default function ConfigPage() {
  const { toasts, toast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null); // Track which image is uploading

  const [formData, setFormData] = useState<SiteConfig>({
    id: "",
    siteName: "",
    siteDescription: "",
    logo: "",
    favicon: "",
    logoDark: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ogImage: "",
    ogTitle: "",
    ogDescription: "",
    email: "",
    phone: "",
    address: "",
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
    googleAnalyticsId: "",
    googleTagManagerId: "",
    updatedAt: "",
  });

  // Fetch config
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/config");
      const result = await response.json();
      if (result.success) {
        setFormData(result.data);
      } else {
        toast.error("Lỗi", "Không thể tải cấu hình");
      }
    } catch (error) {
      console.error("Error fetching config:", error);
      toast.error("Lỗi", "Đã xảy ra lỗi khi tải cấu hình");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "favicon" | "logoDark" | "ogImage") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(type);
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("type", type);

      const response = await fetch("/api/config/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const result = await response.json();
      if (result.success) {
        setFormData((prev) => ({ ...prev, [type]: result.data.url }));
        toast.success("Thành công", "Tải ảnh lên thành công");
      } else {
        toast.error("Lỗi", result.error || "Không thể tải ảnh lên");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Lỗi", "Đã xảy ra lỗi khi tải ảnh lên");
    } finally {
      setUploading(null);
      // Reset input
      e.target.value = "";
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const response = await fetch("/api/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Thành công", "Cập nhật cấu hình thành công");
        await fetchConfig(); // Reload để lấy updatedAt mới
      } else {
        toast.error("Lỗi", result.error || "Không thể cập nhật cấu hình");
      }
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Lỗi", "Đã xảy ra lỗi khi lưu cấu hình");
    } finally {
      setSaving(false);
    }
  };

  // Image upload component
  const ImageUploadField = ({ 
    label, 
    type, 
    value, 
    description 
  }: { 
    label: string; 
    type: "logo" | "favicon" | "logoDark" | "ogImage";
    value: string;
    description?: string;
  }) => {
    const isUploading = uploading === type;
    const acceptedTypes = type === "favicon" 
      ? ".ico,.png,.svg" 
      : ".jpg,.jpeg,.png,.webp,.svg";

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
        <div className="flex items-start gap-4">
          <div className="relative w-24 h-24 rounded-md overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 shrink-0">
            {value ? (
              <>
                <Image
                  src={value}
                  alt={label}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, [type]: "" })}
                  className="absolute top-1 right-1 p-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                  title="Xóa ảnh"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-gray-300" />
                )}
              </div>
            )}
          </div>
          <div className="flex-1">
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a923c] hover:bg-[#0d7a33] text-white text-sm font-medium rounded-md transition-colors cursor-pointer">
              {isUploading ? (
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
                accept={acceptedTypes}
                onChange={(e) => handleImageUpload(e, type)}
                className="hidden"
                disabled={isUploading}
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              {type === "favicon" 
                ? "Kích thước khuyến nghị: 32x32px hoặc 16x16px (ICO, PNG, SVG)"
                : "Kích thước khuyến nghị: tối đa 5MB (JPG, PNG, WebP, SVG)"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#0a923c] mb-3" />
        <p className="text-sm font-medium text-gray-500">Đang tải cấu hình...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TOAST CONTAINER */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Cấu hình website</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý logo, SEO và thông tin website
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a923c] hover:bg-[#0d7a33] text-white text-sm font-medium rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Lưu cấu hình
            </>
          )}
        </button>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* GENERAL SETTINGS */}
        <div className="bg-white rounded-md border border-gray-200/60 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="h-5 w-5 text-[#0a923c]" />
            <h2 className="text-lg font-semibold text-gray-900">Thông tin chung</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="siteName" className="text-sm font-medium text-gray-700">
                Tên website <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="siteName"
                required
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                placeholder="Ví dụ: Website Nông Sản"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="siteDescription" className="text-sm font-medium text-gray-700">
                Mô tả website
              </label>
              <textarea
                id="siteDescription"
                rows={3}
                value={formData.siteDescription}
                onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all resize-none"
                placeholder="Mô tả ngắn về website..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500">{formData.siteDescription.length}/500</p>
            </div>
          </div>
        </div>

        {/* LOGO SETTINGS */}
        <div className="bg-white rounded-md border border-gray-200/60 p-6">
          <div className="flex items-center gap-2 mb-5">
            <ImageIcon className="h-5 w-5 text-[#0a923c]" />
            <h2 className="text-lg font-semibold text-gray-900">Logo & Icon</h2>
          </div>
          
          <div className="space-y-5">
            <ImageUploadField
              label="Logo chính"
              type="logo"
              value={formData.logo}
              description="Logo hiển thị trên header website"
            />
            
            <ImageUploadField
              label="Logo Dark Mode"
              type="logoDark"
              value={formData.logoDark}
              description="Logo cho chế độ tối (tùy chọn)"
            />

            <ImageUploadField
              label="Favicon"
              type="favicon"
              value={formData.favicon}
              description="Icon hiển thị trên tab trình duyệt"
            />
          </div>
        </div>

        {/* SEO SETTINGS */}
        <div className="bg-white rounded-md border border-gray-200/60 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Search className="h-5 w-5 text-[#0a923c]" />
            <h2 className="text-lg font-semibold text-gray-900">Cài đặt SEO</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="metaTitle" className="text-sm font-medium text-gray-700">
                Meta Title
              </label>
              <input
                type="text"
                id="metaTitle"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                placeholder="Tiêu đề hiển thị trên kết quả tìm kiếm"
                maxLength={60}
              />
              <p className="text-xs text-gray-500">{formData.metaTitle.length}/60</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="metaDescription" className="text-sm font-medium text-gray-700">
                Meta Description
              </label>
              <textarea
                id="metaDescription"
                rows={3}
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all resize-none"
                placeholder="Mô tả hiển thị trên kết quả tìm kiếm"
                maxLength={160}
              />
              <p className="text-xs text-gray-500">{formData.metaDescription.length}/160</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="metaKeywords" className="text-sm font-medium text-gray-700">
                Meta Keywords
              </label>
              <input
                type="text"
                id="metaKeywords"
                value={formData.metaKeywords}
                onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                placeholder="từ khóa 1, từ khóa 2, từ khóa 3"
                maxLength={255}
              />
              <p className="text-xs text-gray-500">Phân cách bằng dấu phẩy</p>
            </div>

            <ImageUploadField
              label="OG Image (Open Graph)"
              type="ogImage"
              value={formData.ogImage}
              description="Ảnh hiển thị khi chia sẻ link trên mạng xã hội (khuyến nghị: 1200x630px)"
            />

            <div className="space-y-2">
              <label htmlFor="ogTitle" className="text-sm font-medium text-gray-700">
                OG Title
              </label>
              <input
                type="text"
                id="ogTitle"
                value={formData.ogTitle}
                onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                placeholder="Tiêu đề khi chia sẻ trên mạng xã hội"
                maxLength={60}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="ogDescription" className="text-sm font-medium text-gray-700">
                OG Description
              </label>
              <textarea
                id="ogDescription"
                rows={2}
                value={formData.ogDescription}
                onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all resize-none"
                placeholder="Mô tả khi chia sẻ trên mạng xã hội"
                maxLength={160}
              />
            </div>
          </div>
        </div>

        {/* CONTACT INFO */}
        <div className="bg-white rounded-md border border-gray-200/60 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Mail className="h-5 w-5 text-[#0a923c]" />
            <h2 className="text-lg font-semibold text-gray-900">Thông tin liên hệ</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                placeholder="contact@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                Số điện thoại
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                placeholder="+84 123 456 789"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="address" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Địa chỉ
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
                maxLength={500}
              />
            </div>
          </div>
        </div>

        {/* SOCIAL MEDIA */}
        <div className="bg-white rounded-md border border-gray-200/60 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Facebook className="h-5 w-5 text-[#0a923c]" />
            <h2 className="text-lg font-semibold text-gray-900">Mạng xã hội</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="facebook" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Facebook className="h-3.5 w-3.5" />
                Facebook URL
              </label>
              <input
                type="url"
                id="facebook"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                placeholder="https://facebook.com/yourpage"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="instagram" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Instagram className="h-3.5 w-3.5" />
                Instagram URL
              </label>
              <input
                type="url"
                id="instagram"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                placeholder="https://instagram.com/yourpage"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="twitter" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Twitter className="h-3.5 w-3.5" />
                Twitter URL
              </label>
              <input
                type="url"
                id="twitter"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                placeholder="https://twitter.com/yourhandle"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="youtube" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Youtube className="h-3.5 w-3.5" />
                YouTube URL
              </label>
              <input
                type="url"
                id="youtube"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                placeholder="https://youtube.com/yourchannel"
              />
            </div>
          </div>
        </div>

        {/* ANALYTICS */}
        <div className="bg-white rounded-md border border-gray-200/60 p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart className="h-5 w-5 text-[#0a923c]" />
            <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="googleAnalyticsId" className="text-sm font-medium text-gray-700">
                Google Analytics ID
              </label>
              <input
                type="text"
                id="googleAnalyticsId"
                value={formData.googleAnalyticsId}
                onChange={(e) => setFormData({ ...formData, googleAnalyticsId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                placeholder="G-XXXXXXXXXX"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="googleTagManagerId" className="text-sm font-medium text-gray-700">
                Google Tag Manager ID
              </label>
              <input
                type="text"
                id="googleTagManagerId"
                value={formData.googleTagManagerId}
                onChange={(e) => setFormData({ ...formData, googleTagManagerId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                placeholder="GTM-XXXXXXX"
              />
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0a923c] hover:bg-[#0d7a33] text-white text-sm font-medium rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Lưu cấu hình
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

