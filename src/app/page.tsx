'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

/**
 * Landing page de Garpa
 * Página principal — explica el producto y dirige al login o a la demo
 */
export default function LandingPage() {
  const router = useRouter()

  /**
   * Activa el modo demo
   * Setea una cookie de sesión temporal (desaparece al cerrar el navegador)
   * No genera ningún dato en Supabase
   */
  function activarDemo() {
    document.cookie = 'garpa-demo=true; path=/; SameSite=Lax'
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-[#0F1923] text-[#E8E0D5]">

      {/* ===== NAVBAR ===== */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#1E2D3D]">
        <span className="text-lg font-medium text-[#E8E0D5]">garpa</span>
        <div className="flex items-center gap-3">
          <Link
            href="/register"
            className="text-sm text-[#8A9BAA] hover:text-[#E8E0D5] transition"
          >
            Registrarse
          </Link>
          <Link
            href="/login"
            className="text-sm bg-[#172130] border border-[#1E2D3D] text-[#E8E0D5] px-4 py-2 rounded-lg hover:border-[#3D8B7A] transition"
          >
            Ingresar
          </Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-16 max-w-3xl mx-auto">
        <div className="inline-block text-xs font-medium px-3 py-1 rounded-full border border-[#1E2D3D] text-[#3D8B7A] mb-6">
          Gestión de gastos compartidos
        </div>
        <h1 className="text-5xl font-semibold leading-tight mb-6">
          Split expenses,{' '}
          <span className="text-[#3D8B7A]">simplify debts.</span>
          <br />No drama.
        </h1>
        <p className="text-lg text-[#8A9BAA] mb-10 max-w-xl">
          Garpa te permite dividir gastos con amigos y grupos de forma simple.
          Sin cuentas complicadas, sin peleas. Solo claridad.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={activarDemo}
            className="bg-[#3D8B7A] text-[#0F1923] font-medium px-6 py-3 rounded-lg hover:opacity-90 transition text-sm"
          >
            Probar demo gratis
          </button>
          <Link
            href="/login"
            className="border border-[#1E2D3D] text-[#E8E0D5] px-6 py-3 rounded-lg hover:border-[#3D8B7A] transition text-sm"
          >
            Ir a la app
          </Link>
        </div>
      </section>

      {/* ===== PLACEHOLDER — Screenshot de la app ===== */}
      <section className="px-8 max-w-5xl mx-auto mb-24">
        <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-[#1E2D3D] flex flex-col items-center justify-center gap-3">
          <div className="text-4xl opacity-30">📱</div>
          <p className="text-sm text-[#4A6A7A]">Screenshot de la app — próximamente</p>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="px-8 max-w-5xl mx-auto mb-24">
        <h2 className="text-2xl font-semibold text-center mb-12">
          Todo lo que necesitás para dividir sin drama
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            {
              icon: '⚡',
              title: 'Gastos al instante',
              desc: 'Registrá quién pagó, cuánto y a quiénes aplica en segundos. Sin formularios interminables.',
            },
            {
              icon: '🧮',
              title: 'Deudas simplificadas',
              desc: 'Nuestro algoritmo reduce al mínimo las transferencias necesarias. Menos pagos, más claridad.',
            },
            {
              icon: '👥',
              title: 'Grupos y amigos',
              desc: 'Creá grupos para viajes, casa o salidas. También podés dividir gastos directamente con un amigo.',
            },
            {
              icon: '📊',
              title: 'Balance en tiempo real',
              desc: 'Siempre sabés cuánto debés y cuánto te deben. El dashboard te lo muestra de un vistazo.',
            },
            {
              icon: '✅',
              title: 'Saldá con un click',
              desc: 'Cuando alguien paga lo que debe, marcalo como saldado y el balance se actualiza solo.',
            },
            {
              icon: '🔒',
              title: 'Tus datos seguros',
              desc: 'Cada usuario solo ve sus propios datos. Row Level Security en cada tabla de la base de datos.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-[#172130] border border-[#1E2D3D] rounded-xl p-6"
            >
              <div className="text-2xl mb-3">{feature.icon}</div>
              <h3 className="text-sm font-medium text-[#E8E0D5] mb-2">{feature.title}</h3>
              <p className="text-sm text-[#8A9BAA] leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="px-8 max-w-3xl mx-auto mb-24 text-center">
        <div className="bg-[#172130] border border-[#1E2D3D] rounded-2xl p-12">
          <h2 className="text-2xl font-semibold mb-4">¿Listo para dividir sin drama?</h2>
          <p className="text-[#8A9BAA] mb-8 text-sm">
            Creá tu cuenta gratis y empezá a usar Garpa hoy.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/register"
              className="bg-[#3D8B7A] text-[#0F1923] font-medium px-6 py-3 rounded-lg hover:opacity-90 transition text-sm"
            >
              Crear cuenta gratis
            </Link>
            <button
              onClick={activarDemo}
              className="border border-[#1E2D3D] text-[#E8E0D5] px-6 py-3 rounded-lg hover:border-[#3D8B7A] transition text-sm"
            >
              Ver demo
            </button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[#1E2D3D] px-8 py-6 flex items-center justify-between max-w-5xl mx-auto">
        <span className="text-sm text-[#4A6A7A]">garpa — Split expenses, simplify debts.</span>
        <span className="text-sm text-[#4A6A7A]">Hecho con Next.js + Supabase</span>
      </footer>

    </main>
  )
}