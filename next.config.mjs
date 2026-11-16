/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'maktab51.pythonanywhere.com', pathname: '/media/**' },
    ],
  },
};
export default nextConfig;
