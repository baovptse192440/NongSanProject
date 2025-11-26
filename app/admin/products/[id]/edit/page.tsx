"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Upload,
  Loader2,
  X,
  Plus,
  Trash2,
  Package,
  DollarSign,
  FileText,
  Layers,
  Percent,
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import TinyMCEEditor from "@/components/editor/TinyMCEEditor";

interface Category {
  id: string;
  name: string;
}

interface ProductVariant {
  id?: string;
  name: string;
  sku: string;
  retailPrice: string;
  wholesalePrice: string;
  stock: string;
  onSale: boolean;
  salePrice: string;
  salePercentage: string;
  saleStartDate: string;
  saleEndDate: string;
  weight: string;
  status: "active" | "inactive" | "out_of_stock";
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const { toasts, toast, removeToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [existingVariantIds, setExistingVariantIds] = useState<string[]>([]); // Track existing variant IDs

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    categoryId: "",
    images: [] as string[],
    retailPrice: "",
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

  // Fetch product data và categories
  useEffect(() => {
    const fetchData = async () => {
      if (!productId) return;
      
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesResponse = await fetch("/api/categories?status=active");
        const categoriesResult = await categoriesResponse.json();
        if (categoriesResult.success) {
          setCategories(categoriesResult.data.map((cat: { id: string; name: string }) => ({ id: cat.id, name: cat.name })));
        }

        // Fetch product
        const productResponse = await fetch(`/api/products/${productId}`);
        const productResult = await productResponse.json();
        
        if (!productResult.success) {
          toast.error("Lỗi", productResult.error || "Không thể tải sản phẩm");
          router.push("/admin/products");
          return;
        }

        const product = productResult.data;
        
        // Normalize description - fix image URLs that might have /admin/ prefix
        let normalizedDescription = product.description || "";
        if (normalizedDescription) {
          // Replace /admin/uploads/editor/ with /uploads/editor/
          normalizedDescription = normalizedDescription.replace(/\/admin\/uploads\/editor\//g, "/uploads/editor/");
          // Fix URLs in img src attributes (both single and double quotes)
          normalizedDescription = normalizedDescription.replace(/src=["']\/admin\/uploads\/editor\//g, 'src="/uploads/editor/');
          // Ensure relative URLs for editor images start with /
          normalizedDescription = normalizedDescription.replace(/src=["']uploads\/editor\//g, 'src="/uploads/editor/');
        }

        // Pre-fill form data
        setFormData({
          name: product.name || "",
          slug: product.slug || "",
          description: normalizedDescription,
          shortDescription: product.shortDescription || "",
          categoryId: product.categoryId || "",
          images: product.images || [],
          retailPrice: product.retailPrice?.toString() || "",
          wholesalePrice: product.wholesalePrice?.toString() || "",
          onSale: product.onSale || false,
          salePrice: product.salePrice?.toString() || "",
          salePercentage: product.salePercentage?.toString() || "",
          saleStartDate: product.saleStartDate ? product.saleStartDate.split("T")[0] : "",
          saleEndDate: product.saleEndDate ? product.saleEndDate.split("T")[0] : "",
          stock: product.stock?.toString() || "",
          sku: product.sku || "",
          status: product.status || "active",
        });

        // Check if product has variants
        setHasVariants(product.hasVariants || false);

        // Fetch variants if hasVariants
        if (product.hasVariants) {
          const variantsResponse = await fetch(`/api/products/variants?productId=${productId}`);
          const variantsResult = await variantsResponse.json();
          
          if (variantsResult.success && variantsResult.data) {
            const formattedVariants: ProductVariant[] = variantsResult.data.map((v: any) => ({
              id: v.id,
              name: v.name || "",
              sku: v.sku || "",
              retailPrice: v.retailPrice?.toString() || "",
              wholesalePrice: v.wholesalePrice?.toString() || "",
              stock: v.stock?.toString() || "",
              onSale: v.onSale || false,
              salePrice: v.salePrice?.toString() || "",
              salePercentage: v.salePercentage?.toString() || "",
              saleStartDate: v.saleStartDate ? v.saleStartDate.split("T")[0] : "",
              saleEndDate: v.saleEndDate ? v.saleEndDate.split("T")[0] : "",
              weight: v.weight?.toString() || "",
              status: v.status || "active",
            }));
            
            setVariants(formattedVariants);
            setExistingVariantIds(formattedVariants.filter(v => v.id).map(v => v.id!));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Lỗi", "Không thể tải dữ liệu");
        router.push("/admin/products");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

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

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        name: "",
        sku: "",
        retailPrice: "",
        wholesalePrice: "",
        stock: "",
        onSale: false,
        salePrice: "",
        salePercentage: "",
        saleStartDate: "",
        saleEndDate: "",
        weight: "",
        status: "active",
      },
    ]);
  };

  const removeVariant = async (index: number) => {
    const variant = variants[index];
    
    // If variant has ID, delete it from server
    if (variant.id) {
      try {
        const response = await fetch(`/api/products/variants/${variant.id}`, {
          method: "DELETE",
        });
        
        const result = await response.json();
        if (!result.success) {
          toast.error("Lỗi", result.error || "Không thể xóa variant");
          return;
        }
        
        setExistingVariantIds(existingVariantIds.filter(id => id !== variant.id));
      } catch (error) {
        console.error("Error deleting variant:", error);
        toast.error("Lỗi", "Không thể xóa variant");
        return;
      }
    }
    
    // Remove from local state
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number | boolean) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
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

    // Validate variants if hasVariants is true
    if (hasVariants) {
      if (variants.length === 0) {
        toast.error("Lỗi", "Sản phẩm có variants phải có ít nhất một variant");
        return;
      }
      
      for (const variant of variants) {
        if (!variant.name || !variant.retailPrice || !variant.wholesalePrice) {
          toast.error("Lỗi", "Tất cả variants phải có tên và giá");
          return;
        }
      }
    } else {
      // Validate normal product
      if (!formData.retailPrice || !formData.wholesalePrice) {
        toast.error("Lỗi", "Vui lòng nhập giá bán lẻ và giá đại lý");
        return;
      }
    }

    try {
      setSaving(true);

      // Normalize description before saving - ensure no /admin/ prefix in image URLs
      let descriptionToSave = formData.description || "";
      if (descriptionToSave) {
        // Remove /admin/ prefix from editor image URLs
        descriptionToSave = descriptionToSave.replace(/\/admin\/uploads\/editor\//g, "/uploads/editor/");
        descriptionToSave = descriptionToSave.replace(/src=["']\/admin\/uploads\/editor\//g, 'src="/uploads/editor/');
      }

      // Update product
      const productBody: {
        name: string;
        slug: string;
        description: string;
        shortDescription: string;
        categoryId: string;
        images: string[];
        hasVariants: boolean;
        retailPrice?: number;
        wholesalePrice?: number;
        onSale?: boolean;
        salePrice?: number;
        salePercentage?: number;
        saleStartDate?: string;
        saleEndDate?: string;
        stock?: number;
        sku?: string;
        status: "active" | "inactive" | "out_of_stock";
      } = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: descriptionToSave,
        shortDescription: formData.shortDescription,
        categoryId: formData.categoryId,
        images: formData.images,
        hasVariants: hasVariants,
        status: formData.status,
      };

      if (!hasVariants) {
        productBody.retailPrice = parseFloat(formData.retailPrice);
        productBody.wholesalePrice = parseFloat(formData.wholesalePrice);
        productBody.onSale = formData.onSale;
        productBody.stock = parseInt(formData.stock);
        if (formData.sku) productBody.sku = formData.sku;
        if (formData.onSale) {
          if (formData.salePrice) productBody.salePrice = parseFloat(formData.salePrice);
          if (formData.salePercentage) productBody.salePercentage = parseFloat(formData.salePercentage);
          if (formData.saleStartDate) productBody.saleStartDate = formData.saleStartDate;
          if (formData.saleEndDate) productBody.saleEndDate = formData.saleEndDate;
        }
      }

      const productResponse = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productBody),
      });

      const productResult = await productResponse.json();

      if (!productResult.success) {
        toast.error("Lỗi", productResult.error || "Không thể cập nhật sản phẩm");
        return;
      }

      // Handle variants if hasVariants
      if (hasVariants && variants.length > 0) {
        const variantPromises = variants.map(async (variant) => {
          const variantBody: {
            productId: string;
            name: string;
            sku?: string;
            retailPrice: number;
            wholesalePrice: number;
            stock: number;
            onSale: boolean;
            salePrice?: number;
            salePercentage?: number;
            saleStartDate?: string;
            saleEndDate?: string;
            weight?: number;
            status: "active" | "inactive" | "out_of_stock";
          } = {
            productId: productId,
            name: variant.name,
            retailPrice: variant.retailPrice ? parseFloat(variant.retailPrice) : 0,
            wholesalePrice: variant.wholesalePrice ? parseFloat(variant.wholesalePrice) : 0,
            stock: variant.stock ? parseInt(variant.stock) : 0,
            onSale: variant.onSale,
            status: variant.status,
          };

          if (variant.sku) variantBody.sku = variant.sku;
          if (variant.weight) variantBody.weight = parseFloat(variant.weight);
          if (variant.onSale) {
            if (variant.salePrice) variantBody.salePrice = parseFloat(variant.salePrice);
            if (variant.salePercentage) variantBody.salePercentage = parseFloat(variant.salePercentage);
            if (variant.saleStartDate) variantBody.saleStartDate = variant.saleStartDate;
            if (variant.saleEndDate) variantBody.saleEndDate = variant.saleEndDate;
          }

          // Update existing variant or create new one
          if (variant.id && existingVariantIds.includes(variant.id)) {
            // Update existing variant
            const variantResponse = await fetch(`/api/products/variants/${variant.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(variantBody),
            });

            const variantResult = await variantResponse.json();
            if (!variantResult.success) {
              throw new Error(variantResult.error || "Không thể cập nhật variant");
            }
            return variantResult;
          } else {
            // Create new variant
            const variantResponse = await fetch("/api/products/variants", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(variantBody),
            });

            const variantResult = await variantResponse.json();
            if (!variantResult.success) {
              throw new Error(variantResult.error || "Không thể tạo variant");
            }
            return variantResult;
          }
        });

        await Promise.all(variantPromises);
      }

      toast.success("Thành công", "Cập nhật sản phẩm thành công");
      router.push("/admin/products");
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Lỗi", "Đã xảy ra lỗi khi cập nhật sản phẩm");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#0a923c] mb-3" />
        <p className="text-sm font-medium text-gray-500">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TOAST CONTAINER */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* PAGE HEADER */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Chỉnh sửa sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-1">
            Cập nhật thông tin sản phẩm
          </p>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* BASIC INFO & IMAGES SECTION - SIDE BY SIDE */}
          <div className="bg-white rounded-md border border-gray-200/60 p-6">
            <div className="flex items-center gap-2 mb-5">
              <FileText className="h-5 w-5 text-[#0a923c]" />
              <h2 className="text-lg font-semibold text-gray-900">Thông tin cơ bản & Hình ảnh</h2>
            </div>
            
            <div className="">
              {/* LEFT COLUMN - BASIC INFO */}
              <div className="">
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
                </div>
              </div>
            </div>
          </div>

          {/* VARIANT & PRICING SECTION */}
          <div className="bg-white rounded-md border border-gray-200/60 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Layers className="h-5 w-5 text-[#0a923c]" />
              <h2 className="text-lg font-semibold text-gray-900">Biến thể & Giá cả</h2>
            </div>
            
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md border border-gray-200">
                <div>
                  <Label htmlFor="hasVariants" className="text-sm font-medium text-gray-900">
                    Sản phẩm có nhiều biến thể
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Ví dụ: Dưa hấu có &quot;1kg&quot; = 300 AUD và &quot;Thùng 12 trái&quot; = giá khác
                  </p>
                </div>
                <Switch
                  id="hasVariants"
                  checked={hasVariants}
                  onCheckedChange={(checked) => {
                    setHasVariants(checked);
                    if (!checked) {
                      setVariants([]);
                      setExistingVariantIds([]);
                    }
                  }}
                />
              </div>

              {hasVariants ? (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={addVariant}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a923c] hover:bg-[#0d7a33] text-white text-sm font-medium rounded-md transition-colors shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm biến thể
                  </button>

                  {variants.length > 0 && (
                    <div className="space-y-4">
                      {variants.map((variant, index) => (
                        <div key={index} className="p-5 border border-gray-200 rounded-md space-y-4 bg-gray-50/50">
                          <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-[#0a923c]" />
                              <h4 className="text-sm font-semibold text-gray-900">Biến thể {index + 1}</h4>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeVariant(index)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 block">
                                Tên biến thể <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={variant.name}
                                onChange={(e) => updateVariant(index, "name", e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                                placeholder="Ví dụ: 1kg, Thùng 12 trái"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 block">SKU</label>
                              <input
                                type="text"
                                value={variant.sku}
                                onChange={(e) => updateVariant(index, "sku", e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                                placeholder="SKU variant"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 block">
                                Giá bán lẻ (AUD) <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                required
                                step="0.01"
                                min="0"
                                value={variant.retailPrice}
                                onChange={(e) => updateVariant(index, "retailPrice", e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                                placeholder="0.00"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 block">
                                Giá đại lý (AUD) <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                required
                                step="0.01"
                                min="0"
                                value={variant.wholesalePrice}
                                onChange={(e) => updateVariant(index, "wholesalePrice", e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                                placeholder="0.00"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 block">
                                Số lượng tồn kho <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                required
                                min="0"
                                value={variant.stock}
                                onChange={(e) => updateVariant(index, "stock", e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                                placeholder="0"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 block">Trạng thái</label>
                              <Select
                                value={variant.status}
                                onValueChange={(value: "active" | "inactive" | "out_of_stock") =>
                                  updateVariant(index, "status", value)
                                }
                              >
                                <SelectTrigger className="w-full">
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
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* NORMAL PRICING */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <h3 className="text-sm font-semibold text-gray-900">Giá cả (AUD)</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="retailPrice" className="text-sm font-medium text-gray-700">
                          Giá bán lẻ (AUD) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          id="retailPrice"
                          required={!hasVariants}
                          step="0.01"
                          min="0"
                          value={formData.retailPrice}
                          onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                          placeholder="0.00"
                          disabled={hasVariants}
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="wholesalePrice" className="text-sm font-medium text-gray-700">
                          Giá đại lý (AUD) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          id="wholesalePrice"
                          required={!hasVariants}
                          step="0.01"
                          min="0"
                          value={formData.wholesalePrice}
                          onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                          placeholder="0.00"
                          disabled={hasVariants}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SALE SETTINGS */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md border border-gray-200">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-gray-500" />
                        <div>
                          <Label htmlFor="onSale" className="text-sm font-medium text-gray-900">
                            Bật khuyến mãi
                          </Label>
                          <p className="text-xs text-gray-500 mt-0.5">Áp dụng giảm giá cho sản phẩm</p>
                        </div>
                      </div>
                      <Switch
                        id="onSale"
                        checked={formData.onSale}
                        onCheckedChange={(checked) => setFormData({ ...formData, onSale: checked })}
                        disabled={hasVariants}
                      />
                    </div>

                    {formData.onSale && !hasVariants && (
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
                    <div className="flex items-center gap-2 mb-4">
                      <Package className="h-4 w-4 text-gray-500" />
                      <h3 className="text-sm font-semibold text-gray-900">Kho & Trạng thái</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="stock" className="text-sm font-medium text-gray-700">
                          Số lượng tồn kho <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          id="stock"
                          required={!hasVariants}
                          min="0"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                          placeholder="0"
                          disabled={hasVariants}
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
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-md border border-gray-200/60 p-6">
            {/* RIGHT COLUMN - IMAGES */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-[#0a923c]" />
                <label className="text-sm font-medium text-gray-700">
                  Hình ảnh <span className="text-red-500">*</span>
                </label>
              </div>
              
              <div className="space-y-3">
                <label className="inline-flex items-center gap-2 px-3 py-2 w-full justify-center bg-[#0a923c] hover:bg-[#0d7a33] text-white text-sm font-medium rounded-md transition-colors cursor-pointer">
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

                {formData.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                          <Image
                            src={image}
                            alt={`Product image ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                          {index === 0 && (
                            <div className="absolute top-1 left-1 bg-[#0a923c] text-white text-xs font-medium px-1.5 py-0.5 rounded">
                              Chính
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 p-1 rounded bg-red-500 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center bg-gray-50">
                    <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Chưa có ảnh</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md border border-gray-200/60 p-6">
          <div className="flex items-center gap-2 mb-5">
            <ImageIcon className="h-5 w-5 text-[#0a923c]" />
            <h2 className="text-lg font-semibold text-gray-900">Mô tả chi tiết sản phẩm</h2>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label htmlFor="description" className="text-sm font-semibold text-gray-900">
              Mô tả chi tiết
            </label>
            <TinyMCEEditor
              value={formData.description}
              onChange={(content) => setFormData({ ...formData, description: content })}
              height={400}
              placeholder="Nhập mô tả chi tiết về sản phẩm..."
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 bg-white rounded-md border border-gray-200/60 p-4">
          <Link
            href="/admin/products"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-[#0a923c] hover:bg-[#0d7a33] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Cập nhật sản phẩm
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

