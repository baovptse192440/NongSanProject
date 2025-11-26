import connectDB from "@/lib/mongodb";
import SiteConfig from "@/models/SiteConfig";

export async function getSiteConfig() {
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
    return {
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
  } catch (error) {
    console.error("Error fetching config:", error);
    // Return default config on error
    return {
      siteName: "Website Nông Sản",
      siteDescription: "",
      logo: "",
      favicon: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      ogImage: "",
      email: "",
      phone: "",
    };
  }
}

