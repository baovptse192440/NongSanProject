"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, Sparkles, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { enAU } from "date-fns/locale";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  publishedAt: string | null;
  authorId?: string;
  author?: {
    fullName: string;
    avatar?: string;
  } | null;
}

interface ApiPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  publishedAt: string | null;
  authorId?: string;
  author?: {
    fullName: string;
    avatar?: string;
  } | null;
}

export default function AgrishowSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/posts?status=published&limit=10&page=1");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();

        if (result.success && result.data && Array.isArray(result.data)) {
          // Map posts - API returns authorId, not author object
          const formattedPosts = result.data
            .filter((p: ApiPost) => p.title && p.slug)
            .map((p: ApiPost) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
              excerpt: p.excerpt || "",
              featuredImage: p.featuredImage || "",
              publishedAt: p.publishedAt || null,
              authorId: p.authorId || null,
              author: p.author || null, // Will be null if API doesn't populate
            }));
          
          setPosts(formattedPosts);
        } else {
          console.error("Failed to fetch posts:", result.error || "Invalid response");
          setPosts([]);
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return format(date, "dd/MM/yyyy", { locale: enAU });
    } catch {
      return dateString;
    }
  };

  // Get featured post (first post)
  const featuredPost = posts.length > 0 ? posts[0] : null;
  // Get related posts (skip first, take next 2)
  const relatedPosts = posts.slice(1, 3);
  // Get trending posts (all posts for sidebar)
  const trendingPosts = posts.slice(0, 6);

  return (
    <div className="w-full py-6 sm:py-8 md:py-10">
      <div className="mx-auto w-full max-w-7xl pl-[0.4rem] pr-[0.4rem] md:pl-4 md:pr-4">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 lg:gap-6">
          {/* MAIN ARTICLE - Featured */}
          {loading ? (
            <div className="w-full lg:flex-1 bg-white rounded-sm shadow-lg border border-gray-100 flex items-center justify-center min-h-[500px]">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-[#0a923c] animate-spin" />
                <p className="text-sm text-gray-500">Loading posts...</p>
              </div>
            </div>
          ) : featuredPost ? (
            <div className="w-full lg:flex-1 bg-white rounded-sm shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
              {/* Featured Image */}
              <div className="relative w-full h-[200px] sm:h-[260px] md:h-80 lg:h-[380px] overflow-hidden">
                <Link href={`/post/${featuredPost.slug}`} className="block w-full h-full group">
                  {featuredPost.featuredImage ? (
                    <Image
                      src={featuredPost.featuredImage}
                      alt={featuredPost.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </Link>
              </div>

              {/* Article Content */}
              <div className="p-4 sm:p-5 md:p-6">
                <Link href={`/post/${featuredPost.slug}`}>
                  <h3 className="font-bold text-base sm:text-lg md:text-xl leading-tight text-gray-900 hover:text-[#0a923c] transition-colors duration-200 cursor-pointer mb-4">
                    {featuredPost.title}
                  </h3>
                </Link>

                {/* Excerpt */}
                {featuredPost.excerpt && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {featuredPost.excerpt}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500 mb-5">
                  {featuredPost.author && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#0a923c]" />
                      <span className="font-medium text-gray-700">{featuredPost.author.fullName || "Author"}</span>
                    </div>
                  )}
                  {featuredPost.publishedAt && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#0a923c]" />
                      <span>{formatDate(featuredPost.publishedAt)}</span>
                    </div>
                  )}
                </div>

                {/* Related Articles */}
                {relatedPosts.length > 0 && (
                  <div className="pt-5 sm:pt-6 border-t border-gray-100">
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-4">Related Articles</h4>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      {relatedPosts.map((post) => (
                        <Link
                          key={post.id}
                          href={`/post/${post.slug}`}
                          className="flex-1 group bg-gray-50 hover:bg-gray-100 rounded-sm overflow-hidden border border-gray-200 hover:border-[#0a923c]/30 transition-all duration-200"
                        >
                          {/* Thumbnail */}
                          <div className="relative w-full h-32 sm:h-40 overflow-hidden">
                            {post.featuredImage ? (
                              <Image
                                src={post.featuredImage}
                                alt={post.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                sizes="(max-width: 640px) 100vw, 50vw"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          {/* Content */}
                          <div className="p-3 sm:p-4">
                            <h5 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-[#0a923c] transition-colors duration-200 line-clamp-2 mb-2">
                              {post.title}
                            </h5>
                            {post.publishedAt && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Calendar className="w-3 h-3 text-[#0a923c]" />
                                <span>{formatDate(post.publishedAt)}</span>
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full lg:flex-1 bg-white rounded-sm shadow-lg border border-gray-100 flex items-center justify-center min-h-[500px]">
              <p className="text-sm text-gray-500">No posts available</p>
            </div>
          )}

          {/* RIGHT NEWS LIST - Trending */}
          <div className="w-full lg:w-[320px] bg-white rounded-sm shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 sm:p-5 border border-gray-100 lg:sticky lg:top-4 h-fit mt-6 lg:mt-0">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
              <h3 className="font-bold text-base sm:text-lg text-gray-900">
                Trending News
              </h3>
              <Link 
                href="/posts"
                className="text-xs sm:text-sm text-[#0a923c] hover:text-[#0a923c]/80 font-medium transition-colors"
              >
                View All
              </Link>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              </div>
            ) : trendingPosts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No posts available</p>
            ) : (
              <div className="space-y-4">
                {trendingPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.slug}`}
                    className="flex gap-3 cursor-pointer group hover:bg-[#0a923c]/5 p-2.5 rounded-sm transition-all duration-200"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 sm:w-[100px] h-[60px] sm:h-[70px] rounded-sm overflow-hidden shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-200">
                      {post.featuredImage ? (
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 640px) 80px, 100px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold leading-snug text-gray-800 group-hover:text-[#0a923c] transition-colors duration-200 line-clamp-3 mb-2">
                        {post.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-400">
                        <Calendar className="w-3 h-3 text-[#0a923c]" />
                        <span>{formatDate(post.publishedAt)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
