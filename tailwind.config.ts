import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          base: '#0F1923',
          card: '#172130',
          border: '#1E2D3D',
        },
        text: {
          primary: '#E8E0D5',
          secondary: '#8A9BAA',
          muted: '#4A6A7A',
        },
        positive: '#3D8B7A',
        negative: '#C0675A',
        accent: '#2A6496',
      },
    },
  },
  plugins: [],
}

export default config
