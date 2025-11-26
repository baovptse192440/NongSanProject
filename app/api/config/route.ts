import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SiteConfig from "@/models/SiteConfig";

// GET - Lấy config (chỉ có 1 config duy nhất)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    let config = await SiteConfig.findOne().lean();

    // Nếu chưa có config, tạo config mặc định
    if (!config) {
      const defaultConfig = await SiteConfig.create({
        siteName: "Website Nông Sản",
        siteDescription: "",
      });
      config = defaultConfig.toObject();
    }

    // Format response
    const formattedConfig = {
      id: config._id?.toString(),
      siteName: config.siteName,
      siteDescription: config.siteDescription || "",
      logo: config.logo || "",
      favicon: config.favicon || "",
      logoDark: config.logoDark || "",
      metaTitle: config.metaTitle || "",
      metaDescription: config.metaDescription || "",
      metaKeywords: config.metaKeywords || "",
      ogImage: config.ogImage || "",
      ogTitle: config.ogTitle || "",
      ogDescription: config.ogDescription || "",
      email: config.email || "",
      phone: config.phone || "",
      address: config.address || "",
      facebook: config.facebook || "",
      instagram: config.instagram || "",
      twitter: config.twitter || "",
      youtube: config.youtube || "",
      googleAnalyticsId: config.googleAnalyticsId || "",
      googleTagManagerId: config.googleTagManagerId || "",
      shippingFee: config.shippingFee ?? 10,
      minimumOrderForFreeShipping: config.minimumOrderForFreeShipping ?? 50,
      updatedAt: config.updatedAt?.toISOString() || new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedConfig,
    });
  } catch (error) {
    console.error("Error fetching config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch config" },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật config
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      siteName,
      siteDescription,
      logo,
      favicon,
      logoDark,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImage,
      ogTitle,
      ogDescription,
      email,
      phone,
      address,
      facebook,
      instagram,
      twitter,
      youtube,
      googleAnalyticsId,
      googleTagManagerId,
      shippingFee,
      minimumOrderForFreeShipping,
    } = body;

    // Validation
    if (!siteName) {
      return NextResponse.json(
        { success: false, error: "Tên website là bắt buộc" },
        { status: 400 }
      );
    }

    // Tìm config hiện tại hoặc tạo mới
    let config = await SiteConfig.findOne();

    if (!config) {
      // Tạo config mới
      config = await SiteConfig.create({
        siteName,
        siteDescription: siteDescription || "",
        logo: logo || "",
        favicon: favicon || "",
        logoDark: logoDark || "",
        metaTitle: metaTitle || "",
        metaDescription: metaDescription || "",
        metaKeywords: metaKeywords || "",
        ogImage: ogImage || "",
        ogTitle: ogTitle || "",
        ogDescription: ogDescription || "",
        email: email || "",
        phone: phone || "",
        address: address || "",
        facebook: facebook || "",
        instagram: instagram || "",
        twitter: twitter || "",
        youtube: youtube || "",
        googleAnalyticsId: googleAnalyticsId || "",
        googleTagManagerId: googleTagManagerId || "",
        shippingFee: shippingFee !== undefined ? shippingFee : 10,
        minimumOrderForFreeShipping: minimumOrderForFreeShipping !== undefined ? minimumOrderForFreeShipping : 50,
      });
    } else {
      // Cập nhật config hiện tại
      config.siteName = siteName;
      config.siteDescription = siteDescription || "";
      config.logo = logo || "";
      config.favicon = favicon || "";
      config.logoDark = logoDark || "";
      config.metaTitle = metaTitle || "";
      config.metaDescription = metaDescription || "";
      config.metaKeywords = metaKeywords || "";
      config.ogImage = ogImage || "";
      config.ogTitle = ogTitle || "";
      config.ogDescription = ogDescription || "";
      config.email = email || "";
      config.phone = phone || "";
      config.address = address || "";
      config.facebook = facebook || "";
      config.instagram = instagram || "";
      config.twitter = twitter || "";
      config.youtube = youtube || "";
      config.googleAnalyticsId = googleAnalyticsId || "";
      config.googleTagManagerId = googleTagManagerId || "";
      if (shippingFee !== undefined) {
        config.shippingFee = shippingFee;
      }
      if (minimumOrderForFreeShipping !== undefined) {
        config.minimumOrderForFreeShipping = minimumOrderForFreeShipping;
      }
      
      await config.save();
    }

    const formattedConfig = {
      id: config._id.toString(),
      siteName: config.siteName,
      siteDescription: config.siteDescription || "",
      logo: config.logo || "",
      favicon: config.favicon || "",
      logoDark: config.logoDark || "",
      metaTitle: config.metaTitle || "",
      metaDescription: config.metaDescription || "",
      metaKeywords: config.metaKeywords || "",
      ogImage: config.ogImage || "",
      ogTitle: config.ogTitle || "",
      ogDescription: config.ogDescription || "",
      email: config.email || "",
      phone: config.phone || "",
      address: config.address || "",
      facebook: config.facebook || "",
      instagram: config.instagram || "",
      twitter: config.twitter || "",
      youtube: config.youtube || "",
      googleAnalyticsId: config.googleAnalyticsId || "",
      googleTagManagerId: config.googleTagManagerId || "",
      shippingFee: config.shippingFee ?? 10,
      minimumOrderForFreeShipping: config.minimumOrderForFreeShipping ?? 50,
      updatedAt: config.updatedAt?.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedConfig,
      message: "Cập nhật cấu hình thành công",
    });
  } catch (error: any) {
    console.error("Error updating config:", error);
    
    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to update config" },
      { status: 500 }
    );
  }
}

