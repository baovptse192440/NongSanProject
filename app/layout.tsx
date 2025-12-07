import type { Metadata } from "next";
import "./globals.css";
import { getSiteConfig } from "@/lib/getConfig";
import ClientLayout from "./components/ClientLayout";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();

  const title = config.metaTitle || config.siteName || "AU - Nông Sản Sạch Việt Nam";
  const description = config.metaDescription || config.siteDescription || "Cửa hàng nông sản sạch, đặc sản Việt Nam chất lượng cao";
  const keywords = config.metaKeywords || "";
  const ogImage = config.ogImage || config.logo || "";

  return {
    title: title,
    description: description,
    keywords: keywords ? keywords.split(",").map((k) => k.trim()) : undefined,
    openGraph: {
      title: config.ogTitle || title,
      description: config.ogDescription || description,
      images: ogImage ? [{ url: ogImage }] : undefined,
      type: "website",
      locale: "vi_VN",
    },
    twitter: {
      card: "summary_large_image",
      title: config.ogTitle || title,
      description: config.ogDescription || description,
      images: ogImage ? [ogImage] : undefined,
    },
    icons: {
      icon: config.favicon || "/favicon.ico",
      shortcut: config.favicon || "/favicon.ico",
      apple: config.favicon || "/favicon.ico",
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getSiteConfig();

  return (
    <html lang="vi">
      <head>
        {config.favicon && (
          <>
            <link rel="icon" href={config.favicon} />
            <link rel="shortcut icon" href={config.favicon} />
            <link rel="apple-touch-icon" href={config.favicon} />
          </>
        )}
        {config.googleAnalyticsId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${config.googleAnalyticsId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${config.googleAnalyticsId}');
                `,
              }}
            />
          </>
        )}
        {config.googleTagManagerId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${config.googleTagManagerId}');
              `,
            }}
          />
        )}
      </head>
      <body className="antialiased pb-20 lg:pb-0 bg-white">
        {config.googleTagManagerId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${config.googleTagManagerId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
