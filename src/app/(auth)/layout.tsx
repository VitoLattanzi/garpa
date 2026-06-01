import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Garpa — Ingresá',
}

/**
 * Layout compartido para login y register
 * Split screen: formulario a la izquierda, panel visual a la derecha
 * h-screen overflow-hidden para que no haya scroll
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen overflow-hidden flex">

      {/* Panel izquierdo — formulario */}
      <div className="w-[40%] flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Panel derecho — visual */}
      <div className="hidden lg:flex w-[60%] flex-col items-center justify-center bg-gray-950 px-12 relative overflow-hidden">

        {/* Logo / nombre */}
        <div className="relative z-10 text-center mb-10">
          <h1 className="text-5xl font-semibold text-white tracking-tight mb-3">
            garpa
          </h1>
          <p className="text-gray-400 text-lg">
            Split expenses, simplify debts.
          </p>
        </div>

        {/* Features */}
        <div className="relative z-10 flex flex-col gap-3 w-full max-w-sm">
          {[
            { icon: '⚡', title: 'Gastos al instante', desc: 'Registrá quién pagó y a quiénes aplica en segundos' },
            { icon: '🧮', title: 'Deudas simplificadas', desc: 'El algoritmo reduce al mínimo las transferencias necesarias' },
            { icon: '👥', title: 'Grupos y amigos', desc: 'Viajes, casa, salidas — organizá por contexto' },
          ].map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 bg-white/5 rounded-2xl px-5 py-4 border border-white/10"
            >
              <span className="text-2xl">{feature.icon}</span>
              <div>
                <p className="text-white font-medium text-sm">{feature.title}</p>
                <p className="text-gray-500 text-sm mt-0.5">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Decoración de fondo */}
        <div className="absolute -top-25 -right-25 w-100 h-100 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-25 -left-25 w-75 h-75 bg-white/3 rounded-full blur-3xl" />
      </div>

    </div>
  )
}