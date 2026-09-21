import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Artwork fidelity: never upscale, never re-encode lossily beyond these steps.
    // AVIF is excluded deliberately — its chroma handling can shift artwork colour.
    formats: ['image/webp'],
    remotePatterns: [],
  },
  experimental: {
    optimizePackageImports: ['@react-three/drei'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};

export default nextConfig;
