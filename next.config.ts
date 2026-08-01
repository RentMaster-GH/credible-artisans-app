import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination:
          "https://credible-artisans-app-zkl9jigjz3aqeupvjc8vhn.streamlit.app/:path*",
      },
    ];
  },
};

export default nextConfig;
