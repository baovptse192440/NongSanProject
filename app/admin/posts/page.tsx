"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  Eye,
  CheckCircle2,
  Archive,
  Loader2,
  ArrowUp,
  ArrowDown,
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

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  status: "draft" | "published" | "archived";
  publishedAt: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export default function PostsPage() {
  const { toasts, toast, removeToast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "published" | "archived">("all");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<{ id: string; title: string } | null>(null);

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/posts?${params.toString()}`);
      const result = await response.json();
      if (result.success) {
        setPosts(result.data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Error", "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Calculate stats
  const stats = {
    total: posts.length,
    draft: posts.filter((p) => p.status === "draft").length,
    published: posts.filter((p) => p.status === "published").length,
    archived: posts.filter((p) => p.status === "archived").length,
  };

  // Sort posts
  const sortedPosts = [...posts].sort((a, b) => {
    if (!sortConfig) return 0;

    const { key, direction } = sortConfig;
    let aValue: string | number = a[key as keyof Post] as string | number;
    let bValue: string | number = b[key as keyof Post] as string | number;

    if (key === "createdAt" || key === "updatedAt" || key === "publishedAt") {
      aValue = new Date(aValue || 0).getTime();
      bValue = new Date(bValue || 0).getTime();
    }

    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const handleDeleteClick = (id: string, title: string) => {
    setPostToDelete({ id, title });
  };

  const handleDelete = async () => {
    if (!postToDelete) return;

    const { id, title } = postToDelete;

    try {
      setDeletingId(id);
      const response = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        await fetchPosts();
        toast.success("Success", `Deleted post "${title}"`);
        setPostToDelete(null);
      } else {
        toast.error("Error", result.error || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Error", "Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("en-AU");
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            <CheckCircle2 className="w-3 h-3" />
            Published
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
            <FileText className="w-3 h-3" />
            Draft
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
            <Archive className="w-3 h-3" />
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  const SortableHeader = ({
    children,
    sortKey,
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
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Posts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage blog posts and articles</p>
        </div>
        <Link
          href="/admin/posts/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a923c] hover:bg-[#0d7a33] text-white text-sm font-medium rounded-md transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Post
        </Link>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</span>
            <div className="p-2 rounded-md bg-[#0a923c]/10">
              <FileText className="h-4 w-4 text-[#0a923c]" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">Posts</p>
        </div>

        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Published</span>
            <div className="p-2 rounded-md bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.published}</p>
          <p className="text-xs text-gray-400 mt-1">Posts</p>
        </div>

        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Draft</span>
            <div className="p-2 rounded-md bg-yellow-50">
              <FileText className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.draft}</p>
          <p className="text-xs text-gray-400 mt-1">Posts</p>
        </div>

        <div className="bg-white rounded-md p-4 border border-gray-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Archived</span>
            <div className="p-2 rounded-md bg-gray-50">
              <Archive className="h-4 w-4 text-gray-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.archived}</p>
          <p className="text-xs text-gray-400 mt-1">Posts</p>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white rounded-md p-4 border border-gray-200/60">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all"
            />
          </div>
          <Select
            value={filterStatus}
            onValueChange={(value: "all" | "draft" | "published" | "archived") => setFilterStatus(value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-md border border-gray-200/60 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#0a923c] mb-2" />
            <p className="text-xs font-medium text-gray-500">Loading...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">No posts</p>
            <p className="text-xs text-gray-500 mb-4">No posts found in the system</p>
            <Link
              href="/admin/posts/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a923c] hover:bg-[#0d7a33] text-white text-sm font-medium rounded-md transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create First Post
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <SortableHeader sortKey="featuredImage">Image</SortableHeader>
                  <SortableHeader sortKey="title">Title</SortableHeader>
                  <SortableHeader sortKey="status">Status</SortableHeader>
                  <SortableHeader sortKey="views">Views</SortableHeader>
                  <SortableHeader sortKey="publishedAt">Published</SortableHeader>
                  <SortableHeader sortKey="createdAt">Created</SortableHeader>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedPosts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="h-10 w-10 text-gray-300 mb-2" />
                        <p className="text-xs font-medium text-gray-500">No results found</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Try changing filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedPosts.map((post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                          {post.featuredImage ? (
                            <Image
                              src={post.featuredImage}
                              alt={post.title}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {post.title}
                          </p>
                          {post.excerpt && (
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {post.excerpt}
                            </p>
                          )}
                          <code className="text-[10px] text-gray-400 mt-1 block">
                            /{post.slug}
                          </code>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(post.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Eye className="w-3 h-3" />
                          {post.views || 0}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-600">
                          {formatDate(post.publishedAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-600">
                          {formatDate(post.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/posts/${post.id}/edit`}
                            className="p-1.5 text-gray-400 hover:text-[#0a923c] hover:bg-[#0a923c]/10 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(post.id, post.title)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete"
                            disabled={deletingId === post.id}
                          >
                            {deletingId === post.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
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

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={!!postToDelete} onOpenChange={() => setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{postToDelete?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

