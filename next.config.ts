import { fileURLToPath } from 'node:url'

import createJiti from 'jiti'
import type { NextConfig } from 'next'

const jiti = createJiti(fileURLToPath(import.meta.url))
jiti('./src/env.ts')

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
