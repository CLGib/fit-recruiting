import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    /**
     * Server Actions default to a 1 MB request body, which silently 500s on any
     * résumé with real formatting. Raised to Vercel's own ceiling.
     *
     * 4.5 MB is a HARD PLATFORM LIMIT on Vercel Functions (413
     * FUNCTION_PAYLOAD_TOO_LARGE) and cannot be raised from here. That is why
     * the form validates at 4 MB: it leaves headroom for multipart overhead so
     * our friendly error fires instead of the platform rejecting the request.
     * Raising the advertised cap means moving uploads off the function
     * entirely, via a direct-to-storage presigned upload.
     */
    serverActions: {
      bodySizeLimit: "4.5mb",
    },
  },
};

export default nextConfig;
