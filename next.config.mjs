/** @type {import('next').NextConfig} */
const backendBaseUrl = (process.env.BACKEND_BASE_URL || "").replace(/\/$/, "");

const localApiRewrites = [
  {
    source: "/v1/v1/:path*",
    destination: "/api/v1/:path*"
  },
  {
    source: "/v1/v1",
    destination: "/api/v1"
  },
  {
    source: "/codex/:path*",
    destination: "/api/v1/responses"
  },
  {
    source: "/v1/:path*",
    destination: "/api/v1/:path*"
  },
  {
    source: "/v1",
    destination: "/api/v1"
  }
];

const remoteBackendRewrites = backendBaseUrl
  ? [
      {
        source: "/api/:path*",
        destination: `${backendBaseUrl}/api/:path*`
      },
      {
        source: "/v1/:path*",
        destination: `${backendBaseUrl}/v1/:path*`
      },
      {
        source: "/v1",
        destination: `${backendBaseUrl}/v1`
      },
      {
        source: "/codex/:path*",
        destination: `${backendBaseUrl}/api/v1/responses`
      }
    ]
  : [];

const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3", "sql.js", "node:sqlite", "bun:sqlite"],
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_BACKEND_BASE_URL: backendBaseUrl
  },
  async rewrites() {
    return backendBaseUrl
      ? { beforeFiles: remoteBackendRewrites }
      : localApiRewrites;
  }
};

export default nextConfig;
