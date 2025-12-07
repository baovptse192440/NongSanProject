"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Calendar, User, Eye, Grid3x3, List, Loader2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { enAU } from "date-fns/locale";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  publishedAt: string | null;
  author?: {
    fullName: string;
    avatar?: string;
  } | null;
  views: number;
  tags?: string[];
}

interface ApiResponse {
  success: boolean;
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular">("newest");
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 12;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          status: "published",
          limit: postsPerPage.toString(),
          page: currentPage.toString(),
        });

        if (searchQuery) {
          params.append("search", searchQuery);
        }

        const response = await fetch(`/api/posts?${params.toString()}`);
        const result: ApiResponse = await response.json();

        if (result.success && result.data) {
          // Sort posts based on sortBy
          let sortedPosts = [...result.data];
          if (sortBy === "oldest") {
            sortedPosts.sort((a, b) => {
              const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
              const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
              return dateA - dateB;
            });
          } else if (sortBy === "popular") {
            sortedPosts.sort((a, b) => (b.views || 0) - (a.views || 0));
          } else {
            // newest (default)
            sortedPosts.sort((a, b) => {
              const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
              const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
              return dateB - dateA;
            });
          }

          setPosts(sortedPosts);
          setTotalPages(result.pagination?.pages || 1);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, searchQuery, sortBy]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return format(date, "dd MMMM yyyy", { locale: enAU });
    } catch {
      return dateString;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#eeeeee] md:mt-36 mt-30">
      {/* Breadcrumb */}
      <div className="hidden md:flex bg-[#e6e6e6] border-gray-200">
        <div className="mx-auto w-full max-w-7xl pl-[0.4rem] pr-[0.4rem] md:pl-4 md:pr-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900">Posts</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-full md:max-w-[1260px] mx-auto md:py-5 md:px-4 lg:px-6">
        {/* Header */}
        <div className="bg-white md:rounded-sm p-5 sm:p-6 lg:p-8 mb-5 sm:mb-6 lg:mb-8">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <h1 className="md:text-xl text-lg font-semibold text-gray-900 tracking-tight">All Posts</h1>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 w-full sm:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] text-sm"
                />
              </div>
            </form>

            {/* View Mode and Sort */}
            <div className="flex items-center gap-3">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as "newest" | "oldest" | "popular");
                  setCurrentPage(1);
                }}
                className="px-3 py-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#0a923c] focus:border-transparent text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 border border-gray-300 rounded-sm overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${
                    viewMode === "grid"
                      ? "bg-[#0a923c] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${
                    viewMode === "list"
                      ? "bg-[#0a923c] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-[#0a923c] animate-spin" />
              <p className="text-sm text-gray-600">Loading posts...</p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white md:rounded-sm p-12 sm:p-16 text-center">
            <p className="text-base sm:text-lg text-gray-600 mb-4 font-medium">No posts found</p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="text-sm text-[#0a923c] hover:text-[#0a923c]/80 hover:underline transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7 mb-8 sm:mb-10"
                  : "space-y-5 sm:space-y-6 lg:space-y-7 mb-8 sm:mb-10"
              }
            >
              {posts.map((post) => (
                <PostCard key={post.id} post={post} viewMode={viewMode} formatDate={formatDate} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 sm:mt-10">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
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
                        className={`px-4 py-2 border rounded-sm transition-colors ${
                          currentPage === pageNum
                            ? "bg-[#0a923c] text-white border-[#0a923c]"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* Post Card Component */
function PostCard({
  post,
  viewMode,
  formatDate,
}: {
  post: Post;
  viewMode: "grid" | "list";
  formatDate: (date: string | null) => string;
}) {
  if (viewMode === "list") {
    return (
      <Link href={`/post/${post.slug}`} className="block">
        <div className="bg-white md:rounded-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300 group">
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 p-5 sm:p-6 lg:p-7">
            {/* Thumbnail */}
            <div className="relative w-full sm:w-48 md:w-64 h-48 sm:h-40 md:h-48 rounded-sm overflow-hidden shrink-0 bg-gray-100">
              {post.featuredImage ? (
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 192px, 256px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <Sparkles className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2.5 sm:mb-3 group-hover:text-[#0a923c] transition-colors line-clamp-2 leading-snug">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-5 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-auto">
                {post.publishedAt && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#0a923c]" />
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                )}
                {post.author && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#0a923c]" />
                    <span>{post.author.fullName}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#0a923c]" />
                  <span>{post.views || 0} views</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view
  return (
    <Link href={`/post/${post.slug}`} className="block h-full">
      <div className="bg-white md:rounded-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col h-full">
        {/* Thumbnail */}
        <div className="relative w-full aspect-video sm:aspect-[4/3] overflow-hidden bg-gray-100">
          {post.featuredImage ? (
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <Sparkles className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2.5 sm:mb-3 group-hover:text-[#0a923c] transition-colors line-clamp-2 leading-snug">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-gray-600 mb-4 sm:mb-5 line-clamp-2 flex-1 leading-relaxed">
              {post.excerpt}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
            {post.publishedAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#0a923c]" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-[#0a923c]" />
              <span>{post.views || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

