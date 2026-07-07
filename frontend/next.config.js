/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn3.saiwa.ai' },
      { protocol: 'https', hostname: 'www.csm.tech' },
      { protocol: 'https', hostname: 'camo.githubusercontent.com' },
      { protocol: 'https', hostname: 'orchardly.co' },
      { protocol: 'https', hostname: 'helios-i.mashable.com' },
      { protocol: 'https', hostname: 'cdn.qwenlm.ai' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
}

module.exports = nextConfig
