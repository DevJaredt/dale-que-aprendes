import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api, setTokenEstudiante, setEstudianteLocal } from '../lib/api.js'
import { AVATARES } from '../lib/util.js'
import { GRADOS } from '../data/curriculo.js'
import Boton from '../components/Boton.jsx'
import { Campo } from '../components/Ui.jsx'

/** Entrar o crear la cuenta de estudiante. */
export default function CuentaEstudiante() {
  const navegar = useNavigate()
  const [params] = useSearchParams()
  const volverA = params.get('volver') || '/entrar'

  const [modo, setModo] = useState(params.get('modo') === 'crear' ? 'crear' : 'entrar')
  const [form, setForm] = useState({
    usuario: '',
    clave: '',
    nombre: '',
    grado: '6',
    avatar: '🦊',
  })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const datos =
        modo === 'crear'
          ? await api.registrarEstudiante({
              usuario: form.usuario.trim(),
              clave: form.clave,
              nombre: form.nombre.trim(),
              grado: form.grado,
              avatar: form.avatar,
            })
          : await api.entrarEstudiante(form.usuario.trim(), form.clave)

      setTokenEstudiante(datos.token)
      setEstudianteLocal(datos.estudiante)
      navegar(volverA, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="contenedor-angosto">
      <div className="tarjeta animar-entrada">
        <div style={{ fontSize: '2.6rem', textAlign: 'center' }}>🎒</div>
        <h2 style={{ textAlign: 'center' }}>
          {modo === 'crear' ? 'Crear mi cuenta' : 'Entrar a mi cuenta'}
        </h2>
        <p className="ayuda" style={{ textAlign: 'center', marginBottom: 18 }}>
          Con tu cuenta guardas tu progreso, tus puntos y tus insignias.
        </p>

        <div className="tabs">
          <button
            className={`tab ${modo === 'entrar' ? 'activo' : ''}`}
            onClick={() => {
              setModo('entrar')
              setError('')
            }}
          >
            Ya tengo cuenta
          </button>
          <button
            className={`tab ${modo === 'crear' ? 'activo' : ''}`}
            onClick={() => {
              setModo('crear')
              setError('')
            }}
          >
            Soy nuevo
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={enviar}>
          {modo === 'crear' && (
            <Campo etiqueta="¿Cómo te llamas?">
              <input
                type="text"
                placeholder="Ej: Ana María López"
                maxLength={60}
                value={form.nombre}
                onChange={cambiar('nombre')}
              />
            </Campo>
          )}

          <Campo etiqueta="Usuario" ayuda="Entre 3 y 20 caracteres. Sin espacios.">
            <input
              type="text"
              placeholder="Ej: ana.lopez"
              maxLength={20}
              autoCapitalize="none"
              value={form.usuario}
              onChange={cambiar('usuario')}
            />
          </Campo>

          <Campo etiqueta="Contraseña" ayuda="Mínimo 4 caracteres.">
            <input
              type="password"
              placeholder="••••••"
              maxLength={100}
              value={form.clave}
              onChange={cambiar('clave')}
            />
          </Campo>

          {modo === 'crear' && (
            <>
              <Campo etiqueta="Tu grado">
                <select value={form.grado} onChange={cambiar('grado')}>
                  {GRADOS.map((g) => (
                    <option key={g} value={g}>
                      {g}° ({Number(g) <= 5 ? 'Primaria' : 'Secundaria'})
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo etiqueta="Elige tu avatar">
                <div className="avatares">
                  {AVATARES.map((a) => (
                    <button
                      key={a}
                      type="button"
                      className={`avatar ${form.avatar === a ? 'activo' : ''}`}
                      onClick={() => setForm((f) => ({ ...f, avatar: a }))}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </Campo>
            </>
          )}

          <Boton variante="amarillo" tamano="grande" bloque type="submit" disabled={enviando}>
            {enviando ? 'Un momento…' : modo === 'crear' ? '🎉 Crear mi cuenta' : '🔑 Entrar'}
          </Boton>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Boton variante="fantasma" mini onClick={() => navegar(volverA)}>
            ← Volver
          </Boton>
          <Boton variante="fantasma" mini onClick={() => navegar('/')}>
            🏠 Inicio
          </Boton>
        </div>
      </div>
    </div>
  )
}
