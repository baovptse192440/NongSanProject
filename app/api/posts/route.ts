import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";
import { verifyToken } from "@/lib/jwt";
import { getTokenFromRequest } from "@/lib/getTokenFromRequest";

// Helper function to generate table of contents from HTML content
function generateTableOfContents(content: string): string {
  if (!content) return "";

  // Extract headings (h1-h6) from HTML
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
  const headings: Array<{ level: number; text: string; id: string }> = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = parseInt(match[1]);
    const text = match[2].replace(/<[^>]*>/g, "").trim(); // Remove HTML tags
    if (text) {
      const id = text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      headings.push({ level, text, id });
    }
  }

  if (headings.length === 0) return "";

  // Generate TOC HTML
  let tocHtml = '<div class="table-of-contents"><h3>Table of Contents</h3><ul>';
  let currentLevel = 0;

  headings.forEach((heading) => {
    // Close previous list items if going to a higher level
    if (heading.level > currentLevel) {
      for (let i = currentLevel; i < heading.level; i++) {
        tocHtml += "<ul>";
      }
    }
    // Close list items if going to a lower level
    else if (heading.level < currentLevel) {
      for (let i = heading.level; i < currentLevel; i++) {
        tocHtml += "</ul></li>";
      }
    } else if (currentLevel > 0) {
      tocHtml += "</li>";
    }

    tocHtml += `<li><a href="#${heading.id}">${heading.text}</a>`;
    currentLevel = heading.level;
  });

  // Close remaining list items
  for (let i = 0; i < currentLevel; i++) {
    tocHtml += "</li></ul>";
  }

  tocHtml += "</ul></div>";
  return tocHtml;
}

// GET - List all posts
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    // Fetch posts - sort by publishedAt if available, otherwise by createdAt
    const posts = await Post.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Get total count
    const total = await Post.countDocuments(query);

    // Format posts
    const formattedPosts = posts.map((post) => ({
      id: post._id?.toString(),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      tableOfContents: post.tableOfContents || "",
      featuredImage: post.featuredImage || "",
      authorId: post.authorId,
      tags: post.tags || [],
      status: post.status,
      publishedAt: post.publishedAt?.toISOString() || null,
      views: post.views || 0,
      createdAt: post.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: post.updatedAt?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST - Create new post
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, slug, excerpt, content, tableOfContents, featuredImage, tags, status, publishedAt } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    let finalSlug = slug || title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug already exists
    const existingPost = await Post.findOne({ slug: finalSlug });
    if (existingPost) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    // Use provided TOC or auto-generate
    const finalTableOfContents = tableOfContents || generateTableOfContents(content);

    // Create post
    const post = new Post({
      title,
      slug: finalSlug,
      excerpt: excerpt || "",
      content,
      tableOfContents: finalTableOfContents,
      featuredImage: featuredImage || "",
      authorId: decoded.userId,
      tags: tags || [],
      status: status || "draft",
      publishedAt: status === "published" && publishedAt ? new Date(publishedAt) : status === "published" ? new Date() : undefined,
      views: 0,
    });

    await post.save();

    return NextResponse.json({
      success: true,
      data: {
        id: post._id.toString(),
        title: post.title,
        slug: post.slug,
        status: post.status,
      },
    });
  } catch (error: any) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create post" },
      { status: 500 }
    );
  }
}

