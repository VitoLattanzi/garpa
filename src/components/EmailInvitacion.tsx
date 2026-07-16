/**
 * Componente visual del email de invitación a Garpa
 * Usado como referencia para el template en Supabase → Authentication → Emails → Invite user
 * NO se renderiza en la app — es solo para diseñar y documentar el email
 */
export default function EmailInvitacion({
  nombreInvitador = 'Tu amigo',
  linkInvitacion = 'https://garpa.vercel.app/register',
}: {
  nombreInvitador?: string
  linkInvitacion?: string
}) {
  return (
    <div
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        background: '#0F1923',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          margin: '0 auto',
          background: '#172130',
          borderRadius: '16px',
          border: '1px solid #1E2D3D',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '32px 32px 24px',
            borderBottom: '1px solid #1E2D3D',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#E8E0D5',
              margin: '0 0 8px',
            }}
          >
            garpa
          </h1>

          <p
            style={{
              fontSize: '13px',
              color: '#4A6A7A',
              margin: 0,
            }}
          >
            Split expenses, simplify debts.
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '32px' }}>
          <p
            style={{
              fontSize: '15px',
              color: '#E8E0D5',
              margin: '0 0 12px',
              fontWeight: '500',
            }}
          >
            {nombreInvitador} te invitó a Garpa
          </p>

          <p
            style={{
              fontSize: '13px',
              color: '#8A9BAA',
              margin: '0 0 24px',
              lineHeight: '1.6',
            }}
          >
            Garpa es una app para dividir gastos con amigos y grupos de forma
            simple. Sin cuentas complicadas, sin peleas. Solo claridad.
          </p>

          {/* Features */}
          <div style={{ marginBottom: '28px' }}>
            {[
              {
                icon: '⚡',
                text: 'Registrá gastos al instante',
              },
              {
                icon: '🧮',
                text: 'Deudas simplificadas automáticamente',
              },
              {
                icon: '👥',
                text: 'Grupos para viajes, casa y salidas',
              },
            ].map((feature) => (
              <div
                key={feature.text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <span
                  style={{
                    fontSize: '16px',
                    marginRight: '10px',
                  }}
                >
                  {feature.icon}
                </span>

                <span
                  style={{
                    fontSize: '13px',
                    color: '#8A9BAA',
                  }}
                >
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href={linkInvitacion}
            style={{
              display: 'block',
              textAlign: 'center',
              background: '#3D8B7A',
              color: '#0F1923',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
              marginBottom: '20px',
            }}
          >
            Aceptar invitación
          </a>

          <p
            style={{
              fontSize: '11px',
              color: '#4A6A7A',
              textAlign: 'center',
              margin: 0,
            }}
          >
            Si no esperabas esta invitación, podés ignorar este email.
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 32px',
            borderTop: '1px solid #1E2D3D',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              color: '#4A6A7A',
              margin: 0,
            }}
          >
            Garpa · Split expenses, simplify debts · No drama.
          </p>
        </div>
      </div>
    </div>
  )
}