/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS || false;
let repo = '';
if (isGithubActions) {
  repo = '/Yantra-OS';
}

const nextConfig = {
  reactStrictMode: true,
  output: process.env.EXPORT_STATIC ? 'export' : undefined,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || (isGithubActions ? repo : ''),
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || (isGithubActions ? repo : ''),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
