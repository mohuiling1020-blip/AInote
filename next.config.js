/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable development overlay to reduce UI clutter
  devIndicators: {
    position: 'bottom-right',
  },
  // Reduce development tool visibility
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;

