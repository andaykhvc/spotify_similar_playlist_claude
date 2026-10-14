import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Spotify only accepts loopback IP redirect URIs, so the app is opened at 127.0.0.1 in dev.
  allowedDevOrigins: ["127.0.0.1"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
