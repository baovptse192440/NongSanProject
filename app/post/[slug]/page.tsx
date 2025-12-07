"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, Calendar, User, Eye, Tag, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { enAU } from "date-fns/locale";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tableOfContents: string;
  featuredImage: string;
  author: {
    id: string;
    fullName: string;
    email: string;
    avatar: string;
  } | null;
  tags: string[];
  status: string;
  publishedAt: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface LatestPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  publishedAt: string | null;
  views: number;
}

export default function PostDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [post, setPost] = useState<Post | null>(null);
  const [latestPosts, setLatestPosts] = useState<LatestPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tocExpanded, setTocExpanded] = useState(true);

  // Fetch post detail
  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/posts/slug/${slug}`);
        const result = await response.json();

        if (result.success && result.data) {
          console.log('Post data:', result.data);
          console.log('Featured Image:', result.data.featuredImage);
          setPost(result.data);
        } else {
          setError(result.error || "Post not found");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  // Fetch latest posts from API
  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        setLoadingLatest(true);
        // Fetch more posts to ensure we have enough after filtering
        const response = await fetch("/api/posts?status=published&limit=15&page=1");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();

        if (result.success && result.data && Array.isArray(result.data)) {
          // Filter out current post and ensure we have valid data
          const filtered = result.data
            .filter((p: LatestPost) => {
              // Ensure post has required fields and is not current post
              return p.slug !== slug && 
                     p.title && 
                     p.slug && 
                     p.id;
            })
            .map((p: LatestPost) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
              excerpt: p.excerpt || "",
              featuredImage: p.featuredImage || "",
              publishedAt: p.publishedAt || null,
              views: p.views || 0,
            }))
            .slice(0, 8); // Get up to 8 posts for sidebar and related
          
          setLatestPosts(filtered);
        } else {
          console.error("Failed to fetch posts:", result.error || "Invalid response");
          setLatestPosts([]);
        }
      } catch (err) {
        console.error("Error fetching latest posts:", err);
        setLatestPosts([]);
      } finally {
        setLoadingLatest(false);
      }
    };

    if (slug) {
      fetchLatestPosts();
    }
  }, [slug]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eeeeee] mt-10 md:mt-32">
        <div className="hidden md:block">
          
        </div>
        <div className="flex items-center justify-center py-40">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            <p className="text-sm text-gray-600">Loading post...</p>
          </div>
        </div>
        
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#eeeeee] mt-10 md:mt-32">
        <div className="hidden md:block">
          
        </div>
        <div className="w-full bg-white md:container md:rounded-sm mx-auto md:py-5 xs:px-0 xs:py-0">
          <div className="px-4 md:px-6 py-12 text-center">
            <p className="text-lg text-gray-600 mb-4">{error || "Post not found"}</p>
            <Link
              href="/"
              className="inline-block px-6 py-2.5 bg-green-700 text-white rounded-xs font-semibold hover:bg-green-800 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
        
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eeeeee] md:mt-36 mt-30">
      {/* Breadcrumb - Desktop */}
      <div className="hidden md:flex bg-[#e6e6e6] border-gray-200">
        <div className="mx-auto w-full max-w-7xl pl-[0.4rem] pr-[0.4rem] md:pl-4 md:pr-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/posts" className="hover:text-green-600 transition-colors">
              Posts
            </Link>
            <span>/</span>
            <span className="text-gray-900 line-clamp-1">{post.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-full md:max-w-[1260px] mx-auto md:py-5 md:px-4 lg:px-6 ">
        {/* 2 Column Layout */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Left Column - Post Content */}
          <article className="flex-1 min-w-0 bg-white md:rounded-sm overflow-hidden">
            <div className="px-4 pb-4">

              {/* Featured Image */}
              {post.featuredImage && (
                <div className="mb-6 sm:mb-8 -mx-4 sm:-mx-6 lg:-mx-8 md:mx-0 md:rounded-sm overflow-hidden">
                  <div className="relative w-full aspect-video sm:aspect-[16/9] bg-gray-100">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 65vw, 800px"
                      priority
                      unoptimized
                      onError={(e) => {
                        console.error('Image load error for:', post.featuredImage);
                        const target = e.target as HTMLImageElement;
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-sm">Image not available</div>';
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Post Header */}
              <header className="mb-6 sm:mb-8">
                <h1 className="md:text-xl text-lg font-semibold text-gray-900 mb-4 sm:mb-6 leading-tight tracking-tight">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}

                {/* Post Meta */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-5 text-sm sm:text-base text-gray-500 pb-4 border-b border-gray-200">
                  {post.author && (
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      {post.author.avatar ? (
                        <Image
                          src={post.author.avatar}
                          alt={post.author.fullName}
                          width={32}
                          height={32}
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-gray-100"
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-green-700 flex items-center justify-center text-white font-medium ring-2 ring-gray-100 shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                      <span className="font-medium text-gray-700 text-sm sm:text-base">{post.author.fullName}</span>
                    </div>
                  )}

                  {post.publishedAt && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <time dateTime={post.publishedAt} className="text-gray-600 text-sm sm:text-base">
                        {formatDate(post.publishedAt)}
                      </time>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <span className="text-gray-600 text-sm sm:text-base">{post.views || 0}</span>
                  </div>
                </div>
              </header>

              {/* Table of Contents */}
              {post.tableOfContents && (
                <div className="mb-6 sm:mb-8 border-t border-b border-gray-200">
                  <button
                    onClick={() => setTocExpanded(!tocExpanded)}
                    className="w-full flex items-center justify-between py-3 sm:py-4 text-left hover:bg-gray-50 transition-colors px-1"
                  >
                    <span className="text-sm sm:text-base font-medium text-gray-900">Table of Contents</span>
                    {tocExpanded ? (
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 shrink-0" />
                    )}
                  </button>
                  {tocExpanded && (
                    <div
                      className="table-of-contents pb-3 sm:pb-4 px-1"
                      dangerouslySetInnerHTML={{ __html: post.tableOfContents }}
                    />
                  )}
                </div>
              )}

              {/* Post Content */}
              <div
                className="prose prose-sm sm:prose-base md:prose-lg lg:prose-xl max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-[15px] sm:prose-p:text-[16px] md:prose-p:text-[17px] prose-a:text-green-700 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-lg prose-img:my-6 sm:prose-img:my-8 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700 prose-li:leading-relaxed prose-blockquote:border-l-green-700 prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Tags
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Articles */}
              {latestPosts.length > 0 && (
                <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-100">
                  <h4 className="font-semibold text-base sm:text-lg text-gray-900 mb-4 sm:mb-5">Related Articles</h4>
                  <div className="space-y-2 sm:space-y-3">
                    {latestPosts.slice(0, 3).map((relatedPost) => (
                      <Link
                        key={relatedPost.id}
                        href={`/post/${relatedPost.slug}`}
                        className="flex items-start gap-3 p-2.5 sm:p-3 rounded-sm hover:bg-[#0a923c]/5 transition-all duration-200 group"
                      >
                        <div className="w-2 h-2 bg-[#0a923c] rounded-full mt-2 shrink-0 group-hover:scale-125 transition-transform duration-200"></div>
                        <p className="text-sm sm:text-base text-gray-700 group-hover:text-[#0a923c] font-medium transition-colors duration-200 line-clamp-2 flex-1">
                          {relatedPost.title}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* Right Column - Posts List Sidebar */}
          <aside className="w-full lg:w-[320px] xl:w-[360px] shrink-0 mt-6 lg:mt-0">
            <div className="sticky top-24 lg:top-28">
              {/* Trending Posts Section */}
              <div className="bg-white rounded-sm shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 sm:p-5 lg:p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#0a923c]" />
                    <h3 className="font-bold text-sm sm:text-base lg:text-lg text-gray-900">
                      Trending Posts
                    </h3>
                  </div>
                  <Link 
                    href="/posts"
                    className="text-xs sm:text-sm text-[#0a923c] hover:text-[#0a923c]/80 font-medium transition-colors"
                  >
                    View All
                  </Link>
                </div>
                
                {loadingLatest ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  </div>
                ) : latestPosts.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No posts available</p>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {latestPosts.map((latestPost) => (
                      <Link
                        key={latestPost.id}
                        href={`/post/${latestPost.slug}`}
                        className="flex gap-2.5 sm:gap-3 cursor-pointer group hover:bg-[#0a923c]/5 p-2 sm:p-2.5 rounded-sm transition-all duration-200"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-16 h-16 sm:w-20 sm:h-[60px] md:w-[100px] md:h-[70px] rounded-sm overflow-hidden shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-200">
                          {latestPost.featuredImage ? (
                            <Image
                              src={latestPost.featuredImage}
                              alt={latestPost.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                              sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 100px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold leading-snug text-gray-800 group-hover:text-[#0a923c] transition-colors duration-200 line-clamp-3 mb-1.5 sm:mb-2">
                            {latestPost.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-400">
                            <Calendar className="w-3 h-3 text-[#0a923c] shrink-0" />
                            {latestPost.publishedAt && (
                              <time dateTime={latestPost.publishedAt} className="line-clamp-1">
                                {formatDate(latestPost.publishedAt)}
                              </time>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      

      {/* Global styles for table of contents and smooth scroll */}
      <style jsx global>{`
        .table-of-contents h3 {
          display: none;
        }
        .table-of-contents ul {
          list-style: none;
          padding-left: 0;
          margin: 0;
        }
        .table-of-contents ul ul {
          padding-left: 1.25rem;
          margin-top: 0.125rem;
        }
        .table-of-contents li {
          margin-bottom: 0.25rem;
        }
        .table-of-contents a {
          color: #1d1d1f;
          text-decoration: none;
          font-size: 0.8125rem;
          line-height: 1.428571429;
          transition: color 0.2s ease;
          display: block;
          padding: 0.25rem 0;
          font-weight: 400;
        }
        @media (min-width: 640px) {
          .table-of-contents a {
            font-size: 0.875rem;
          }
        }
        .table-of-contents a:hover {
          color: #0071e3;
          text-decoration: none;
        }
        html {
          scroll-behavior: smooth;
        }
        [id] {
          scroll-margin-top: 80px;
        }
        @media (min-width: 768px) {
          [id] {
            scroll-margin-top: 100px;
          }
        }
      `}</style>
    </div>
  );
}

