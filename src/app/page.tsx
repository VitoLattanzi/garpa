'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLang } from '@/context/LangContext'

/**
 * Landing page de Garpa
 * Soporta español e inglés via LangContext
 * El botón demo setea una cookie temporal y redirige al dashboard
 */
export default function LandingPage() {
  const router = useRouter()
  const { t, lang, setLang } = useLang()

  /**
   * Activa el modo demo
   * Setea una cookie de sesión (desaparece al cerrar el navegador)
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
        <span className="text-lg font-medium">garpa</span>
        <div className="flex items-center gap-4">

          {/* Selector de idioma */}
          <button
            onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
            className="text-xs text-[#4A6A7A] hover:text-[#8A9BAA] transition border border-[#1E2D3D] px-2.5 py-1.5 rounded-lg"
          >
            {lang === 'es' ? 'EN' : 'ES'}
          </button>

          <Link href="/register" className="text-sm text-[#8A9BAA] hover:text-[#E8E0D5] transition">
            {t('nav_register')}
          </Link>
          <Link
            href="/login"
            className="text-sm bg-[#172130] border border-[#1E2D3D] text-[#E8E0D5] px-4 py-2 rounded-lg hover:border-[#3D8B7A] transition"
          >
            {t('nav_login')}
          </Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-16 max-w-3xl mx-auto">
        <div className="inline-block text-xs font-medium px-3 py-1 rounded-full border border-[#1E2D3D] text-[#3D8B7A] mb-6">
          {t('hero_badge')}
        </div>
        <h1 className="text-5xl font-semibold leading-tight mb-6">
          {t('hero_title_1')}{' '}
          <span className="text-[#3D8B7A]">{t('hero_title_2')}</span>
          <br />
          {t('hero_title_3')}
        </h1>
        <p className="text-lg text-[#8A9BAA] mb-10 max-w-xl">
          {t('hero_subtitle')}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={activarDemo}
            className="bg-[#3D8B7A] text-[#0F1923] font-medium px-6 py-3 rounded-lg hover:opacity-90 transition text-sm"
          >
            {t('hero_demo')}
          </button>
          <Link
            href="/login"
            className="border border-[#1E2D3D] text-[#E8E0D5] px-6 py-3 rounded-lg hover:border-[#3D8B7A] transition text-sm"
          >
            {t('hero_app')}
          </Link>
        </div>
      </section>

      {/* ===== PLACEHOLDER screenshot ===== */}
      <section className="px-8 max-w-5xl mx-auto mb-24">
        <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-[#1E2D3D] flex flex-col items-center justify-center gap-3">
          <div className="text-4xl opacity-30">📱</div>
          <p className="text-sm text-[#4A6A7A]">{t('screenshot_placeholder')}</p>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="px-8 max-w-5xl mx-auto mb-24">
        <h2 className="text-2xl font-semibold text-center mb-12">
          {t('features_title')}
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {([
            ['feature_1_title', 'feature_1_desc', '⚡'],
            ['feature_2_title', 'feature_2_desc', '🧮'],
            ['feature_3_title', 'feature_3_desc', '👥'],
            ['feature_4_title', 'feature_4_desc', '📊'],
            ['feature_5_title', 'feature_5_desc', '✅'],
            ['feature_6_title', 'feature_6_desc', '🔒'],
          ] as const).map(([titleKey, descKey, icon]) => (
            <div
              key={titleKey}
              className="bg-[#172130] border border-[#1E2D3D] rounded-xl p-6"
            >
              <div className="text-2xl mb-3">{icon}</div>
              <h3 className="text-sm font-medium text-[#E8E0D5] mb-2">{t(titleKey)}</h3>
              <p className="text-sm text-[#8A9BAA] leading-relaxed">{t(descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="px-8 max-w-3xl mx-auto mb-24 text-center">
        <div className="bg-[#172130] border border-[#1E2D3D] rounded-2xl p-12">
          <h2 className="text-2xl font-semibold mb-4">{t('cta_title')}</h2>
          <p className="text-[#8A9BAA] mb-8 text-sm">{t('cta_subtitle')}</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/register"
              className="bg-[#3D8B7A] text-[#0F1923] font-medium px-6 py-3 rounded-lg hover:opacity-90 transition text-sm"
            >
              {t('cta_register')}
            </Link>
            <button
              onClick={activarDemo}
              className="border border-[#1E2D3D] text-[#E8E0D5] px-6 py-3 rounded-lg hover:border-[#3D8B7A] transition text-sm"
            >
              {t('cta_demo')}
            </button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[#1E2D3D] px-8 py-6 flex items-center justify-between max-w-5xl mx-auto">
        <span className="text-sm text-[#4A6A7A]">{t('footer_tagline')}</span>
        <span className="text-sm text-[#4A6A7A]">{t('footer_tech')}</span>
      </footer>

    </main>
  )
}