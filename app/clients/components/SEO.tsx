"use client";

import { useEffect } from "react";
import Script from "next/script";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  structuredData?: object | object[];
  type?: "website" | "article" | "product";
}

export default function SEO({
  title,
  description,
  canonical,
  ogImage = "/hero_banner.jpg",
  structuredData,
  type = "website",
}: SEOProps) {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = `${title} | AusGlobal Connection`;
    }

    // Update meta description
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", description);
      } else {
        const meta = document.createElement("meta");
        meta.name = "description";
        meta.content = description;
        document.head.appendChild(meta);
      }
    }

    // Update canonical URL
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (link) {
        link.href = canonical;
      } else {
        link = document.createElement("link");
        link.rel = "canonical";
        link.href = canonical;
        document.head.appendChild(link);
      }
    }

    // Update Open Graph tags
    const updateOGTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (meta) {
        meta.content = content;
      } else {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    if (title) updateOGTag("og:title", title);
    if (description) updateOGTag("og:description", description);
    if (canonical) updateOGTag("og:url", canonical);
    updateOGTag("og:image", ogImage);
    updateOGTag("og:type", type);
  }, [title, description, canonical, ogImage, type]);

  return (
    <>
      {structuredData && (
        <>
          {Array.isArray(structuredData) ? (
            structuredData.map((data, index) => (
              <Script
                key={index}
                id={`structured-data-${index}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(data),
                }}
              />
            ))
          ) : (
            <Script
              id="structured-data"
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(structuredData),
              }}
            />
          )}
        </>
      )}
    </>
  );
}

