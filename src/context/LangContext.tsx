'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

/**
 * Contexto global de idioma
 * Maneja el cambio entre español e inglés en toda la app
 * Se usa con el hook useLang() en cualquier componente
 */

type Lang = 'es' | 'en'

// Todas las traducciones de la app en un solo objeto
const translations = {
  es: {
    // Navbar
    nav_register: 'Registrarse',
    nav_login: 'Ingresar',

    // Hero
    hero_badge: 'Gestión de gastos compartidos',
    hero_title_1: 'Dividí gastos,',
    hero_title_2: 'simplificá deudas.',
    hero_title_3: 'Sin drama.',
    hero_subtitle: 'Garpa te permite dividir gastos con amigos y grupos de forma simple. Sin cuentas complicadas, sin peleas. Solo claridad.',
    hero_demo: 'Probar demo gratis',
    hero_app: 'Ir a la app',

    // Features
    features_title: 'Todo lo que necesitás para dividir sin drama',
    feature_1_title: 'Gastos al instante',
    feature_1_desc: 'Registrá quién pagó, cuánto y a quiénes aplica en segundos. Sin formularios interminables.',
    feature_2_title: 'Deudas simplificadas',
    feature_2_desc: 'Nuestro algoritmo reduce al mínimo las transferencias necesarias. Menos pagos, más claridad.',
    feature_3_title: 'Grupos y amigos',
    feature_3_desc: 'Creá grupos para viajes, casa o salidas. También podés dividir gastos directamente con un amigo.',
    feature_4_title: 'Balance en tiempo real',
    feature_4_desc: 'Siempre sabés cuánto debés y cuánto te deben. El dashboard te lo muestra de un vistazo.',
    feature_5_title: 'Saldá con un click',
    feature_5_desc: 'Cuando alguien paga lo que debe, marcalo como saldado y el balance se actualiza solo.',
    feature_6_title: 'Tus datos seguros',
    feature_6_desc: 'Cada usuario solo ve sus propios datos. Row Level Security en cada tabla de la base de datos.',

    // CTA
    cta_title: '¿Listo para dividir sin drama?',
    cta_subtitle: 'Creá tu cuenta gratis y empezá a usar Garpa hoy.',
    cta_register: 'Crear cuenta gratis',
    cta_demo: 'Ver demo',

    // Footer
    footer_tagline: 'Garpa — Dividí gastos, simplificá deudas.',
    footer_tech: 'Hecho con Next.js + Supabase',

    // Screenshot placeholder
    screenshot_placeholder: 'Screenshot de la app — próximamente',

    // Dashboard
    dash_greeting: 'Buen día',
    dash_debts_pending: 'deuda pendiente',
    dash_debts_pending_plural: 'deudas pendientes',
    dash_all_good: 'Todo al día 🎉',
    dash_owe: 'Lo que debés',
    dash_owed: 'Te deben',
    dash_balance: 'Balance neto',
    dash_movements: 'Últimos movimientos',
    dash_no_movements: 'Todavía no hay gastos registrados.',
    dash_you_paid: 'Pagaste vos',
    dash_paid: 'Pagó',
    dash_groups: 'Mis grupos',
    dash_new_group: 'Nuevo grupo',
    dash_menu: 'Menú',
    dash_home: 'Inicio',
    dash_friends: 'Amigos',
    dash_expenses: 'Gastos',
    dash_settings: 'Configuración',
    dash_no_groups: 'Sin grupos aún',
    dash_logout: 'Cerrar sesión',
    dash_general: 'general',
    dash_debts: 'deuda',
    dash_debts_plural: 'deudas',
    dash_people: 'persona',
    dash_people_plural: 'personas',

    // Modal deudas
    modal_owe_title: 'Lo que debés',
    modal_owed_title: 'Te deben',
    modal_no_debts: 'No debés nada 🎉',
    modal_nobody_owes: 'Nadie te debe nada.',
    modal_total: 'Total',

    // Demo banner
    demo_banner: 'Estás en modo demo — los datos son ficticios',
    demo_exit: 'Salir',

    // Auth
    login_title: 'Bienvenido a Garpa',
    login_subtitle: 'Ingresá para ver tus gastos compartidos',
    login_email: 'Email',
    login_password: 'Contraseña',
    login_btn: 'Ingresar',
    login_loading: 'Ingresando...',
    login_error: 'Email o contraseña incorrectos',
    login_no_account: '¿No tenés cuenta?',
    login_register: 'Registrate',
    register_title: 'Crear cuenta',
    register_subtitle: 'Empezá a dividir gastos sin drama',
    register_name: 'Nombre',
    register_btn: 'Crear cuenta',
    register_loading: 'Creando cuenta...',
    register_error_profile: 'Error al crear el perfil. Intentá de nuevo.',
    register_success_title: 'Revisá tu email',
    register_success_desc: 'Te mandamos un link de confirmación a',
    register_success_desc2: 'Confirmá tu cuenta para poder ingresar.',
    register_success_btn: 'Ir al login',
    register_has_account: '¿Ya tenés cuenta?',
    register_login: 'Ingresá',

    // Panel derecho auth
    auth_panel_tagline: 'Split expenses, simplify debts.',
    auth_panel_f1_title: 'Gastos al instante',
    auth_panel_f1_desc: 'Registrá quién pagó y a quiénes aplica en segundos',
    auth_panel_f2_title: 'Deudas simplificadas',
    auth_panel_f2_desc: 'El algoritmo reduce al mínimo las transferencias necesarias',
    auth_panel_f3_title: 'Grupos y amigos',
    auth_panel_f3_desc: 'Viajes, casa, salidas — organizá por contexto',
  },
  en: {
    // Navbar
    nav_register: 'Sign up',
    nav_login: 'Log in',

    // Hero
    hero_badge: 'Shared expense management',
    hero_title_1: 'Split expenses,',
    hero_title_2: 'simplify debts.',
    hero_title_3: 'No drama.',
    hero_subtitle: 'Garpa lets you split expenses with friends and groups simply. No complicated math, no arguments. Just clarity.',
    hero_demo: 'Try demo for free',
    hero_app: 'Go to app',

    // Features
    features_title: 'Everything you need to split without drama',
    feature_1_title: 'Instant expenses',
    feature_1_desc: 'Log who paid, how much and who it applies to in seconds. No endless forms.',
    feature_2_title: 'Simplified debts',
    feature_2_desc: 'Our algorithm minimizes the number of transfers needed. Fewer payments, more clarity.',
    feature_3_title: 'Groups and friends',
    feature_3_desc: 'Create groups for trips, home or outings. You can also split expenses directly with a friend.',
    feature_4_title: 'Real-time balance',
    feature_4_desc: 'Always know how much you owe and how much you\'re owed. The dashboard shows it at a glance.',
    feature_5_title: 'Settle with one click',
    feature_5_desc: 'When someone pays what they owe, mark it as settled and the balance updates automatically.',
    feature_6_title: 'Your data is safe',
    feature_6_desc: 'Each user only sees their own data. Row Level Security on every database table.',

    // CTA
    cta_title: 'Ready to split without drama?',
    cta_subtitle: 'Create your free account and start using Garpa today.',
    cta_register: 'Create free account',
    cta_demo: 'View demo',

    // Footer
    footer_tagline: 'Garpa — Split expenses, simplify debts.',
    footer_tech: 'Built with Next.js + Supabase',

    // Screenshot placeholder
    screenshot_placeholder: 'App screenshot — coming soon',

    // Dashboard
    dash_greeting: 'Good morning',
    dash_debts_pending: 'pending debt',
    dash_debts_pending_plural: 'pending debts',
    dash_all_good: 'All settled 🎉',
    dash_owe: 'You owe',
    dash_owed: 'You\'re owed',
    dash_balance: 'Net balance',
    dash_movements: 'Latest activity',
    dash_no_movements: 'No expenses registered yet.',
    dash_you_paid: 'You paid',
    dash_paid: 'Paid by',
    dash_groups: 'My groups',
    dash_new_group: 'New group',
    dash_menu: 'Menu',
    dash_home: 'Home',
    dash_friends: 'Friends',
    dash_expenses: 'Expenses',
    dash_settings: 'Settings',
    dash_no_groups: 'No groups yet',
    dash_logout: 'Log out',
    dash_general: 'overall',
    dash_debts: 'debt',
    dash_debts_plural: 'debts',
    dash_people: 'person',
    dash_people_plural: 'people',

    // Modal deudas
    modal_owe_title: 'You owe',
    modal_owed_title: 'You\'re owed',
    modal_no_debts: 'You don\'t owe anything 🎉',
    modal_nobody_owes: 'Nobody owes you anything.',
    modal_total: 'Total',

    // Demo banner
    demo_banner: 'You\'re in demo mode — data is fictional',
    demo_exit: 'Exit',

    // Auth
    login_title: 'Welcome to Garpa',
    login_subtitle: 'Log in to see your shared expenses',
    login_email: 'Email',
    login_password: 'Password',
    login_btn: 'Log in',
    login_loading: 'Logging in...',
    login_error: 'Incorrect email or password',
    login_no_account: 'Don\'t have an account?',
    login_register: 'Sign up',
    register_title: 'Create account',
    register_subtitle: 'Start splitting expenses without drama',
    register_name: 'Name',
    register_btn: 'Create account',
    register_loading: 'Creating account...',
    register_error_profile: 'Error creating profile. Please try again.',
    register_success_title: 'Check your email',
    register_success_desc: 'We sent a confirmation link to',
    register_success_desc2: 'Confirm your account to log in.',
    register_success_btn: 'Go to login',
    register_has_account: 'Already have an account?',
    register_login: 'Log in',

    // Panel derecho auth
    auth_panel_tagline: 'Split expenses, simplify debts.',
    auth_panel_f1_title: 'Instant expenses',
    auth_panel_f1_desc: 'Log who paid and who it applies to in seconds',
    auth_panel_f2_title: 'Simplified debts',
    auth_panel_f2_desc: 'The algorithm minimizes the transfers needed',
    auth_panel_f3_title: 'Groups and friends',
    auth_panel_f3_desc: 'Trips, home, outings — organize by context',
  },
}

type TranslationKey = keyof typeof translations.es

type LangContextType = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TranslationKey) => string
}

const LangContext = createContext<LangContextType | null>(null)

/**
 * Provider que envuelve toda la app
 * Hay que agregarlo en el layout raíz
 */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('es')

  // Función de traducción — recibe una clave y devuelve el texto en el idioma activo
  function t(key: TranslationKey): string {
    return translations[lang][key] ?? key
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

/**
 * Hook para usar el contexto de idioma en cualquier componente
 * Uso: const { t, lang, setLang } = useLang()
 */
export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang debe usarse dentro de LangProvider')
  return ctx
}