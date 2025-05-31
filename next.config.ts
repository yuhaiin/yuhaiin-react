import type { NextConfig } from 'next'

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
    /* config options here */
    output: 'export',
    compress: true,
    trailingSlash: true,
    transpilePackages: ['react-bootstrap'],
    experimental: {
        optimizePackageImports: ['react-select', 'shlex', 'bootstrap-icons', 'bootstrap', '@bufbuild/buf', '@bufbuild/protobuf', 'swr'],
    },
}

module.exports = withBundleAnalyzer(nextConfig)

export default nextConfig