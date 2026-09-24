import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="border-t border-[#1E2D3D] px-8 py-6 flex items-center justify-between max-w-5xl mx-auto w-full">
      <Image src="/logo-garpa.svg" alt="Garpa Logo" width={80} height={24} className="object-contain opacity-80" />
      <span className="text-sm text-[#4A6A7A]">
        © 2026 Garpa. Todos los derechos reservados.
      </span>
    </footer>
  )
}
