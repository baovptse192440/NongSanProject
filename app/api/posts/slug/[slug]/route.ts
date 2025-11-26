import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";
import User from "@/models/User";

// GET - Get post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    // Await params as it's a Promise in Next.js App Router
    const { slug } = await params;

    // Try to find post - allow admin to see draft posts
    let post = await Post.findOne({ 
      slug: slug,
      status: "published"
    }).lean();

    // If not found, check if it exists as draft (for debugging)
    if (!post) {
      const draftPost = await Post.findOne({ slug: slug }).lean();
      if (draftPost) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Post found but status is "${draftPost.status}". Only published posts are accessible.` 
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    // Get author information
    let author = null;
    if (post.authorId) {
      const authorData = await User.findById(post.authorId).lean();
      if (authorData) {
        author = {
          id: authorData._id?.toString(),
          fullName: authorData.fullName,
          email: authorData.email,
          avatar: authorData.avatar || "",
          role: authorData.role || "user",
        };
      }
    }

    // Increment views
    await Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } });

    // Add IDs to headings in content for TOC linking
    let contentWithIds = post.content || "";
    const headingRegex = /<h([1-6])([^>]*)>(.*?)<\/h[1-6]>/gi;
    const headingMatches: Array<{ fullMatch: string; level: string; attributes: string; text: string; id: string }> = [];
    let headingMatch;
    
    // Collect all headings first
    while ((headingMatch = headingRegex.exec(post.content || "")) !== null) {
      const fullMatch = headingMatch[0];
      const level = headingMatch[1];
      const attributes = headingMatch[2] || "";
      const text = headingMatch[3].replace(/<[^>]*>/g, "").trim();
      
      if (text) {
        const id = text
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        
        headingMatches.push({ fullMatch, level, attributes, text: headingMatch[3], id });
      }
    }
    
    // Replace headings with IDs (in reverse order to avoid index issues)
    for (let i = headingMatches.length - 1; i >= 0; i--) {
      const { fullMatch, level, attributes, text, id } = headingMatches[i];
      
      // Check if ID already exists in attributes
      if (!attributes.includes('id=')) {
        const newHeading = `<h${level} id="${id}"${attributes ? ` ${attributes.trim()}` : ""}>${text}</h${level}>`;
        contentWithIds = contentWithIds.replace(fullMatch, newHeading);
      }
    }

    // Format post
    const formattedPost = {
      id: post._id?.toString(),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: contentWithIds,
      tableOfContents: post.tableOfContents || "",
      featuredImage: post.featuredImage || "",
      author,
      tags: post.tags || [],
      status: post.status,
      publishedAt: post.publishedAt?.toISOString() || null,
      views: (post.views || 0) + 1, // Show incremented views
      createdAt: post.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: post.updatedAt?.toISOString() || new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedPost,
    });
  } catch (error: any) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch post" },
      { status: 500 }
    );
  }
}

