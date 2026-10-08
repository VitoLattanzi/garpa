import type { NextConfig } from 'next'
import withBundleAnalyzer from '@next/bundle-analyzer'

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  // Desactivamos Turbopack — usa menos RAM con el compilador clásico
}

export default withAnalyzer(nextConfig)

