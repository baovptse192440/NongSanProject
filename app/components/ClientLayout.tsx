"use client";

import { usePathname } from "next/navigation";
import Header from "../common/header";
import Footer from "../common/footer";
import MobileBottomNav from "../common/MobileBottomNav";
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isAgency = pathname?.startsWith("/agency");
  
  // Các route cần ẩn header trên mobile (chỉ hiển thị trên desktop)
  const hideHeaderOnMobile = pathname?.startsWith("/product/");
  
  // Class để ẩn header trên mobile cho các route cụ thể
  const headerClassName = hideHeaderOnMobile ? "hidden md:block" : "";

  return (
    <>
      {!isAdminRoute && isAgency && (
        <div className={headerClassName}>
          <Header />
        </div>
      )}
      {children}
      {!isAdminRoute && isAgency && ( <><Footer /> <MobileBottomNav /></> )}
    </>
  );
}

