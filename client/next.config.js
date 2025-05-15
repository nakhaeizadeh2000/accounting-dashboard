/** @type {import('next').NextConfig} */
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

const nextConfig = {
  productionBrowserSourceMaps: false, // Disables source maps for the browser in production
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverSourceMaps: false, // Disables server source maps in production
    typedRoutes: true,
    // Uncomment to optimize package imports if needed
    // optimizePackageImports: ['package-name'],
    // Uncomment if using Webpack memory optimizations in version 15
    // webpackMemoryOptimizations: true,
    serverActions: {
      // Uncomment and configure if needed
      // allowedOrigins: ['my-proxy.com', '*.my-proxy.com'],
      // bodySizeLimit: '1mb', // This is the default value
    },
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
    // This is critical to prevent Next.js from trying to optimize local API-served images
    unoptimized: true,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Add cache-control headers for images
    if (!isServer) {
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];

      // Add a rule to handle image requests with proper caching
      config.module.rules.push({
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'static/images/',
              name: '[name].[hash].[ext]',
            },
          },
        ],
      });
    }

    // config.plugins.push(
    //   new CopyPlugin({
    //     patterns: [
    //       {
    //         // from: path.join(__dirname, 'node_modules/tinymce'),
    //         // to: path.join(__dirname, 'public/assets/tinymce'),
    //       },
    //     ],
    //   }),
    // );
    // if (config.cache && !dev) {
    //   config.cache = Object.freeze({
    //     type: 'memory',
    //   });
    // }
    // Important: return the modified config
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['app', 'components', 'store', 'shared'], // Only run ESLint on the 'pages' and 'utils' directories during production builds (next build)
  },
  async redirects() {
    return [
      // Uncomment and configure redirects if needed
      // {
      //   source: '/about',
      //   destination: '/',
      //   permanent: true,
      // },
      // {
      //   source: '/blog/:slug',
      //   destination: '/news/:slug',
      //   permanent: true,
      // },
    ];
  },
  // Add headers to improve caching for images
  async headers() {
    return [
      {
        source: '/api/files/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ];
  },
};

// Check if NODE_ENV is 'production', then disable reactStrictMode
if (process.env.NODE_ENV === 'production') {
  nextConfig.reactStrictMode = false;
}

// Ensure the bundle analyzer is only required if used
let withBundleAnalyzer;
try {
  withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  });
} catch (error) {
  console.warn('Bundle Analyzer not found; skipping.');
}

module.exports = withBundleAnalyzer ? withBundleAnalyzer(nextConfig) : nextConfig;
