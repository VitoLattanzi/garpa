'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useLang } from '@/context/LangContext'
import { Amigo } from '@/types/garpa'

type Props = {
  onClose: () => void
  onCreated: (grupo: { id: string; nombre: string }) => void
  amigos: Amigo[]
  userId: string
  isDemo: boolean
}

/**
 * Modal para crear un nuevo grupo
 * En modo real → guarda en Supabase y agrega miembros
 * En modo demo → genera un grupo ficticio con id temporal
 */
export default function ModalNuevoGrupo({ onClose, onCreated, amigos, userId, isDemo }: Props) {
  const { lang } = useLang()
  const supabase = createSupabaseBrowserClient()

  const [nombre, setNombre] = useState('')
  const [selectedAmigos, setSelectedAmigos] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Alterna la selección de un amigo para el grupo
  function toggleAmigo(id: string) {
    setSelectedAmigos(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  async function handleSubmit() {
    if (!nombre.trim()) {
      setError(lang === 'es' ? 'El nombre es obligatorio' : 'Name is required')
      return
    }

    setLoading(true)
    setError(null)

    if (isDemo) {
      // Modo demo — generamos un grupo ficticio sin tocar Supabase
      const nuevoGrupo = {
        id: `demo-grupo-${Date.now()}`,
        nombre: nombre.trim(),
      }
      onCreated(nuevoGrupo)
      return
    }

    // Modo real — creamos el grupo en Supabase
    const { data: grupo, error: grupoError } = await supabase
      .from('grupos')
      .insert({ nombre: nombre.trim(), creado_por: userId })
      .select('id, nombre')
      .single()

    if (grupoError || !grupo) {
      setError(lang === 'es' ? 'Error al crear el grupo' : 'Error creating group')
      setLoading(false)
      return
    }

    // Agregamos al creador como admin
    const miembros = [
      { grupo_id: grupo.id, usuario_id: userId, rol: 'admin' },
      ...selectedAmigos.map(amigoId => ({
        grupo_id: grupo.id,
        usuario_id: amigoId,
        rol: 'miembro',
      })),
    ]

    await supabase.from('miembros_grupo').insert(miembros)

    onCreated(grupo)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-[#172130] border border-[#1E2D3D] rounded-2xl p-6 w-full max-w-sm mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-medium text-[#E8E0D5]">
            {lang === 'es' ? 'Nuevo grupo' : 'New group'}
          </h3>
          <button onClick={onClose} className="text-[#4A6A7A] hover:text-[#8A9BAA]">✕</button>
        </div>

        {/* Nombre del grupo */}
        <div className="mb-4">
          <label className="block text-xs text-[#4A6A7A] mb-1.5">
            {lang === 'es' ? 'Nombre del grupo' : 'Group name'}
          </label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder={lang === 'es' ? 'Ej: Viaje a Brasil' : 'E.g: Brazil trip'}
            className="w-full bg-[#0F1923] border border-[#1E2D3D] rounded-lg px-3 py-2.5 text-sm text-[#E8E0D5] outline-none focus:border-[#3D8B7A] transition"
          />
        </div>

        {/* Agregar amigos al grupo */}
        {amigos.length > 0 && (
          <div className="mb-4">
            <label className="block text-xs text-[#4A6A7A] mb-1.5">
              {lang === 'es' ? 'Agregar amigos' : 'Add friends'}
            </label>
            <div className="flex flex-wrap gap-2">
              {amigos.map(amigo => (
                <button
                  key={amigo.id}
                  onClick={() => toggleAmigo(amigo.amigo_id)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs border transition
                    ${selectedAmigos.includes(amigo.amigo_id)
                      ? 'border-[#3D8B7A] text-[#3D8B7A] bg-[#3D8B7A]/10'
                      : 'border-[#1E2D3D] text-[#8A9BAA]'
                    }
                  `}
                >
                  {amigo.perfil.nombre}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-xs text-[#C0675A] mb-3">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#3D8B7A] text-[#0F1923] font-medium py-2.5 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
        >
          {loading
            ? (lang === 'es' ? 'Creando...' : 'Creating...')
            : (lang === 'es' ? 'Crear grupo' : 'Create group')
          }
        </button>

      </div>
    </div>
  )
}