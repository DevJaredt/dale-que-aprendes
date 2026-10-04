import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { api } from '../lib/api.js'
import { copiarTexto } from '../lib/util.js'
import { useConexion } from '../lib/conexion.js'
import Boton from '../components/Boton.jsx'
import CodigoQR from '../components/CodigoQR.jsx'
import { Campo, Cargando } from '../components/Ui.jsx'

/** Perfil del profesor: datos, clave y resumen de su actividad. */
export default function PerfilProfesor() {
  const { perfil, setPerfil, avatares = [] } = useOutletContext()
  const { base, local } = useConexion()

  const [datos, setDatos] = useState(null)
  const [form, setForm] = useState({ nombre: perfil?.nombre || '', avatar: perfil?.avatar || '👩‍🏫' })
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    try {
      const respuesta = await api.perfilProfesor()
      setDatos(respuesta)
      setPerfil(respuesta.profesor)
      setForm({ nombre: respuesta.profesor.nombre, avatar: respuesta.profesor.avatar })
    } catch {
      /* si falla, se queda con lo que ya hay */
    }
  }, [setPerfil])

  useEffect(() => {
    cargar()
  }, [cargar])

  async function guardar(e) {
    e.preventDefault()
    setGuardando(true)
    setError('')
    setAviso('')
    try {
      const { profesor } = await api.actualizarPerfilProfesor(form)
      setPerfil(profesor)
      setForm({ nombre: profesor.nombre, avatar: profesor.avatar })
      try {
        localStorage.setItem('dqa_profesor', profesor.nombre)
      } catch {
        /* ignore */
      }
      setAviso('Perfil guardado.')
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 4 }}>👤 Mi perfil</h2>
      <p className="ayuda" style={{ marginBottom: 18 }}>
        Estos datos aparecen como autor de las tareas que creas.
      </p>

      {aviso && <div className="exito">{aviso}</div>}
      {error && <div className="error">{error}</div>}

      <div className="tarjeta">
        <form onSubmit={guardar}>
          <Campo etiqueta="Nombre">
            <input
              type="text"
              maxLength={60}
              placeholder="Ej: Profe Carolina Pérez"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            />
          </Campo>

          <Campo etiqueta="Avatar">
            <div className="avatares" style={{ justifyContent: 'flex-start' }}>
              {['👩‍🏫', '👨‍🏫', '🧑‍🏫', ...avatares.filter((a) => !['👩‍🏫', '👨‍🏫', '🧑‍🏫'].includes(a))].map((a) => (
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

          <Boton variante="primario" type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : '💾 Guardar cambios'}
          </Boton>
        </form>
      </div>

      <div className="metricas" style={{ marginTop: 18 }}>
        <div className="metrica">
          <div className="valor">{datos?.estadisticas.tareas ?? '—'}</div>
          <div className="rotulo">Tareas creadas</div>
        </div>
        <div className="metrica">
          <div className="valor">{datos?.estadisticas.intentos ?? '—'}</div>
          <div className="rotulo">Participaciones</div>
        </div>
        <div className="metrica">
          <div className="valor">{datos?.estadisticas.estudiantes ?? '—'}</div>
          <div className="rotulo">Estudiantes</div>
        </div>
        <div className="metrica">
          <div className="valor">{datos?.estadisticas.estudiantesConCuenta ?? '—'}</div>
          <div className="rotulo">Con cuenta propia</div>
        </div>
      </div>

      <div className="tarjeta">
        <h3 style={{ fontSize: '1.05rem' }}>🔑 Cambiar la clave de profesores</h3>
        <p className="ayuda">
          La clave es compartida por todos los docentes de este servidor. Al cambiarla se cierran
          las sesiones abiertas en otros dispositivos.
        </p>
        <CambiarClave onListo={() => setAviso('Clave cambiada correctamente.')} />
      </div>

      <div className="tarjeta">
        <h3 style={{ fontSize: '1.05rem' }}>📱 Enlace para los estudiantes</h3>
        {local ? (
          <>
            <p className="ayuda">
              Como abriste la app en <code>localhost</code>, los enlaces y los QR usan esta dirección
              de tu red para que el celular sí pueda conectarse:
            </p>
            <div className="caja-qr">
              <div className="codigo-chip" style={{ fontSize: '0.95rem', letterSpacing: 0 }}>
                {base}
              </div>
              <CodigoQR texto={base} tamano={160} />
            </div>
            <p className="ayuda" style={{ marginTop: 10 }}>
              Si no funciona desde el celular, revisa la sección <strong>📡 Conexión</strong>.
            </p>
          </>
        ) : (
          <>
            <p className="ayuda">Ya estás usando la dirección de la red. Comparte esta:</p>
            <div className="caja-qr">
              <div className="codigo-chip" style={{ fontSize: '0.95rem', letterSpacing: 0 }}>
                {base}
              </div>
              <CodigoQR texto={base} tamano={160} />
            </div>
          </>
        )}
        <div style={{ marginTop: 12 }}>
          <Boton
            variante="fantasma"
            mini
            onClick={async () => {
              const ok = await copiarTexto(base)
              alert(ok ? 'Enlace copiado' : base)
            }}
          >
            📋 Copiar enlace
          </Boton>
        </div>
      </div>
    </div>
  )
}

/* -------------------- Cambiar clave -------------------- */

function CambiarClave({ onListo }) {
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function guardar(e) {
    e.preventDefault()
    setErr('')
    setMsg('')
    setGuardando(true)
    try {
      await api.cambiarClave(actual, nueva)
      setMsg('Clave cambiada correctamente.')
      setActual('')
      setNueva('')
      onListo?.()
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={guardar}>
      {err && <div className="error">{err}</div>}
      {msg && <div className="exito">{msg}</div>}
      <div className="fila">
        <Campo etiqueta="Clave actual">
          <input type="password" value={actual} onChange={(e) => setActual(e.target.value)} />
        </Campo>
        <Campo etiqueta="Clave nueva" ayuda="Mínimo 4 caracteres.">
          <input type="password" value={nueva} onChange={(e) => setNueva(e.target.value)} />
        </Campo>
      </div>
      <Boton variante="primario" type="submit" disabled={guardando}>
        {guardando ? 'Guardando…' : 'Cambiar clave'}
      </Boton>
      <p className="ayuda" style={{ marginTop: 10 }}>
        ¿Olvidaste la clave? En el computador del servidor ejecuta <code>npm run clave:reset</code>.
      </p>
    </form>
  )
}
