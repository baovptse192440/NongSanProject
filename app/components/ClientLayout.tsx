"use client";

import { usePathname } from "next/navigation";
import Header from "../common/header";
import Footer from "../common/footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  
  // Các route cần ẩn header trên mobile (chỉ hiển thị trên desktop)
  const hideHeaderOnMobile = pathname?.startsWith("/product/") || pathname === "/cart";
  
  // Class để ẩn header trên mobile cho các route cụ thể
  const headerClassName = hideHeaderOnMobile ? "hidden md:block" : "";

  return (
    <>
      {!isAdminRoute && (
        <div className={headerClassName}>
          <Header />
        </div>
      )}
      {children}
      {!isAdminRoute && <Footer />}
    </>
  );
}

