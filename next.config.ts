import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    /* config options here */
    output: 'export',
    compress: true,
    trailingSlash: true,
    transpilePackages: ['react-bootstrap'],
}

export default nextConfig