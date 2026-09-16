'use client'

import { useLang } from '@/context/LangContext'

/**
 * Panel derecho visual para las páginas de autenticación (login y register)
 * Conectado al contexto global de idioma (LangContext)
 */
export default function AuthRightPanel() {
  const { t, lang, setLang } = useLang()

  const features = [
    {
      icon: '⚡',
      title: t('auth_panel_f1_title'),
      desc: t('auth_panel_f1_desc'),
    },
    {
      icon: '🧮',
      title: t('auth_panel_f2_title'),
      desc: t('auth_panel_f2_desc'),
    },
    {
      icon: '👥',
      title: t('auth_panel_f3_title'),
      desc: t('auth_panel_f3_desc'),
    },
  ]

  return (
    <div className="hidden lg:flex w-[60%] flex-col items-center justify-center bg-gray-950 px-12 relative overflow-hidden">
      {/* Botón de cambio de idioma en la esquina superior derecha */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-1 bg-white/10 p-1 rounded-lg text-xs font-medium text-white border border-white/10">
        <button
          type="button"
          onClick={() => setLang('es')}
          className={`px-2 py-1 rounded transition ${
            lang === 'es' ? 'bg-white/20 text-white font-semibold' : 'text-gray-400 hover:text-white'
          }`}
        >
          ES
        </button>
        <button
          type="button"
          onClick={() => setLang('en')}
          className={`px-2 py-1 rounded transition ${
            lang === 'en' ? 'bg-white/20 text-white font-semibold' : 'text-gray-400 hover:text-white'
          }`}
        >
          EN
        </button>
      </div>

      {/* Logo / nombre */}
      <div className="relative z-10 text-center mb-10">
        <h1 className="text-5xl font-semibold text-white tracking-tight mb-3">
          garpa
        </h1>
        <p className="text-gray-400 text-lg">
          {t('auth_panel_tagline')}
        </p>
      </div>

      {/* Features */}
      <div className="relative z-10 flex flex-col gap-3 w-full max-w-sm">
        {features.map((feature) => (
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
  )
}
