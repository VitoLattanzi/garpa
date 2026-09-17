import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Desactivamos Turbopack — usa menos RAM con el compilador clásico
  // Configuración para arreglar el problema de root en monorepos
  experimental: {
    turbopack: {
      root: '.'
    }
  }
}
