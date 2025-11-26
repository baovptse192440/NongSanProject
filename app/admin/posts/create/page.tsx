"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Upload,
  Loader2,
  X,
  FileText,
  Tag,
  Calendar,
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
import { Label } from "@/components/ui/label";
import TinyMCEEditor from "@/components/editor/TinyMCEEditor";
import TableOfContentsGenerator from "@/components/admin/TableOfContentsGenerator";

export default function CreatePostPage() {
  const router = useRouter();
  const { toasts, toast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    tableOfContents: "",
    featuredImage: "",
    tags: [] as string[],
    status: "draft" as "draft" | "published" | "archived",
    publishedAt: "",
  });

  const [tagInput, setTagInput] = useState("");

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

      const response = await fetch("/api/products/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const result = await response.json();
      if (result.success) {
        setFormData({ ...formData, featuredImage: result.data.url });
        toast.success("Success", "Image uploaded successfully");
      } else {
        toast.error("Error", result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error", "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast.error("Error", "Title and content are required");
      return;
    }

    try {
      setSaving(true);

      const postBody = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        excerpt: formData.excerpt,
        content: formData.content,
        tableOfContents: formData.tableOfContents,
        featuredImage: formData.featuredImage,
        tags: formData.tags,
        status: formData.status,
        publishedAt:
          formData.status === "published" && formData.publishedAt
            ? formData.publishedAt
            : formData.status === "published"
            ? new Date().toISOString()
            : undefined,
      };

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postBody),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Success", "Post created successfully");
        router.push("/admin/posts");
      } else {
        toast.error("Error", result.error || "Failed to create post");
      }
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Error", "Failed to create post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* PAGE HEADER */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/posts"
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Create New Post</h1>
          <p className="text-sm text-gray-500 mt-1">Create a new blog post or article</p>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-6">
            {/* BASIC INFO */}
            <div className="bg-white rounded-md border border-gray-200/60 p-6">
              <div className="flex items-center gap-2 mb-5">
                <FileText className="h-5 w-5 text-[#0a923c]" />
                <h2 className="text-lg font-semibold text-gray-900">Post Information</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        title: e.target.value,
                        slug: formData.slug || generateSlug(e.target.value),
                      });
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                    placeholder="Enter post title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">
                    Slug <span className="text-red-500">*</span>
                  </Label>
                  <input
                    type="text"
                    id="slug"
                    required
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: generateSlug(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all font-mono"
                    placeholder="post-slug"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <textarea
                    id="excerpt"
                    rows={3}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all resize-none"
                    placeholder="Short description or summary..."
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500">{formData.excerpt.length}/500 characters</p>
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div className="bg-white rounded-md border border-gray-200/60 p-6">
              <div className="flex items-center gap-2 mb-5">
                <FileText className="h-5 w-5 text-[#0a923c]" />
                <h2 className="text-lg font-semibold text-gray-900">Content</h2>
              </div>

              <div className="space-y-2">
                <Label>
                  Content <span className="text-red-500">*</span>
                </Label>
                <TinyMCEEditor
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  height={500}
                  placeholder="Write your post content here..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Use headings (H1-H6) to automatically generate table of contents
                </p>
              </div>
            </div>

            {/* TABLE OF CONTENTS */}
            <div className="bg-white rounded-md border border-gray-200/60 p-6">
              <TableOfContentsGenerator
                content={formData.content}
                value={formData.tableOfContents}
                onChange={(toc) => setFormData({ ...formData, tableOfContents: toc })}
              />
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {/* PUBLISH */}
            <div className="bg-white rounded-md border border-gray-200/60 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Calendar className="h-5 w-5 text-[#0a923c]" />
                <h2 className="text-lg font-semibold text-gray-900">Publish</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "draft" | "published" | "archived") =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.status === "published" && (
                  <div className="space-y-2">
                    <Label htmlFor="publishedAt">Publish Date</Label>
                    <input
                      type="datetime-local"
                      id="publishedAt"
                      value={formData.publishedAt}
                      onChange={(e) =>
                        setFormData({ ...formData, publishedAt: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0a923c] hover:bg-[#0d7a33] text-white text-sm font-medium rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Post
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* FEATURED IMAGE */}
            <div className="bg-white rounded-md border border-gray-200/60 p-6">
              <div className="flex items-center gap-2 mb-5">
                <ImageIcon className="h-5 w-5 text-[#0a923c]" />
                <h2 className="text-lg font-semibold text-gray-900">Featured Image</h2>
              </div>

              <div className="space-y-4">
                {formData.featuredImage ? (
                  <div className="relative w-full aspect-video rounded-md overflow-hidden border border-gray-200 bg-gray-100">
                    <Image
                      src={formData.featuredImage}
                      alt="Featured"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, featuredImage: "" })}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                    <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 mb-3">No featured image</p>
                  </div>
                )}

                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                  <div className="w-full px-4 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors text-center">
                    {uploadingImage ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-[#0a923c]" />
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Upload className="h-4 w-4" />
                        <span>Upload Image</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* TAGS */}
            <div className="bg-white rounded-md border border-gray-200/60 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Tag className="h-5 w-5 text-[#0a923c]" />
                <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
                    placeholder="Add tag..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-[#0a923c] hover:bg-[#0d7a33] text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Add
                  </button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0a923c]/10 text-[#0a923c] text-xs font-medium rounded-md border border-[#0a923c]/20"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

