import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // vì mình serve uploads cùng origin qua Nginx (http://13.213.48.10)
    // nên KHÔNG cần remotePatterns nếu dùng đường dẫn tương đối (/uploads/...)
    // Nếu bạn vẫn dùng full URL 13.213.48.10 thì dùng remotePatterns:
    remotePatterns: [
      {
        protocol: "http",
        hostname: "13.213.48.10",
        port: "",          // để trống = port 80
        pathname: "/uploads/**",
      },
      // nếu thật sự còn chỗ nào dùng :8888
      {
        protocol: "http",
        hostname: "13.213.48.10",
        port: "8888",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
