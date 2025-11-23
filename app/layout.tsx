import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "AU - Nông Sản Sạch Việt Nam",
  description: "Cửa hàng nông sản sạch, đặc sản Việt Nam chất lượng cao",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">
  
          {children} {/* <- bọc bằng CartProvider */}

      </body>
    </html>
  );
}
