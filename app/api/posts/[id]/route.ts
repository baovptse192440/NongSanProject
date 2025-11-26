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

// GET - Get single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const post = await Post.findById(id).lean();

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
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
      },
    });
  } catch (error: any) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// PUT - Update post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

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

    // Find post
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    // Check if user is the author or admin
    if (post.authorId !== decoded.userId && decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update fields
    if (title !== undefined) post.title = title;
    if (slug !== undefined) {
      // Check if new slug already exists (excluding current post)
      const existingPost = await Post.findOne({ slug, _id: { $ne: id } });
      if (existingPost) {
        return NextResponse.json(
          { success: false, error: "Slug already exists" },
          { status: 400 }
        );
      }
      post.slug = slug;
    }
    if (excerpt !== undefined) post.excerpt = excerpt;
    if (content !== undefined) {
      post.content = content;
      // Use provided TOC or auto-generate
      if (tableOfContents !== undefined) {
        post.tableOfContents = tableOfContents;
      } else {
        post.tableOfContents = generateTableOfContents(content);
      }
    } else if (tableOfContents !== undefined) {
      // Allow updating TOC without changing content
      post.tableOfContents = tableOfContents;
    }
    if (featuredImage !== undefined) post.featuredImage = featuredImage;
    if (tags !== undefined) post.tags = tags;
    if (status !== undefined) {
      post.status = status;
      // Set publishedAt if publishing for the first time
      if (status === "published" && !post.publishedAt) {
        post.publishedAt = publishedAt ? new Date(publishedAt) : new Date();
      }
    }
    if (publishedAt !== undefined && status === "published") {
      post.publishedAt = new Date(publishedAt);
    }

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
    console.error("Error updating post:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

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

    // Find post
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    // Check if user is the author or admin
    if (post.authorId !== decoded.userId && decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    await Post.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete post" },
      { status: 500 }
    );
  }
}

