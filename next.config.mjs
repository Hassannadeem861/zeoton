/** @type {import('next').NextConfig} */
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig = {
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75],
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: cloudName ? `/${cloudName}/**` : '/**' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'antd'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
