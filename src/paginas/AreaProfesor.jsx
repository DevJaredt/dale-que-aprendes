import { useCallback, useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { api, esErrorDeSesion, getTokenProfe, setTokenProfe } from '../lib/api.js'
import { AVATARES } from '../lib/util.js'
import Boton from '../components/Boton.jsx'
import { Campo, Cargando, Vacio } from '../components/Ui.jsx'

const CLAVE_NOMBRE = 'dqa_profesor'

const leerNombre = () => {
  try {
    return localStorage.getItem(CLAVE_NOMBRE) || ''
  } catch {
    return ''
  }
}

const guardarNombre = (nombre) => {
  try {
    localStorage.setItem(CLAVE_NOMBRE, nombre)
  } catch {
    /* ignore */
  }
}

/**
 * Área exclusiva de profesores.
 * Se encarga del ingreso y del menú lateral; cada página se dibuja adentro.
 */
export default function AreaProfesor() {
  const navegar = useNavigate()

  const [sesion, setSesion] = useState('comprobando') // comprobando | fuera | sin-conexion | dentro
  const [perfil, setPerfil] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [nombre, setNombre] = useState(leerNombre)
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [entrando, setEntrando] = useState(false)

  const cargarPerfil = useCallback(async () => {
    const { profesor } = await api.perfilProfesor()
    setPerfil(profesor)
    return profesor
  }, [])

  const comprobarSesion = useCallback(async () => {
    if (!getTokenProfe()) {
      setSesion('fuera')
      return
    }
    setSesion('comprobando')
    setError('')
    try {
      await cargarPerfil()
      setSesion('dentro')
    } catch (e) {
      if (esErrorDeSesion(e)) {
        setTokenProfe(null)
        setMotivo('Tu sesión anterior terminó. Vuelve a entrar con tu clave.')
        setSesion('fuera')
      } else {
        setError(`No pudimos conectar con el servidor. ${e.message}`)
        setSesion('sin-conexion')
      }
    }
  }, [cargarPerfil])

  useEffect(() => {
    comprobarSesion()
  }, [comprobarSesion])

  async function entrar(e) {
    e.preventDefault()
    if (!clave.trim()) {
      setError('Escribe la clave de profesor.')
      return
    }
    setEntrando(true)
    setError('')
    try {
      const { token } = await api.entrarProfesor(clave)
      setTokenProfe(token)

      // La primera vez, se guarda el nombre en el perfil del servidor.
      try {
        const actual = await cargarPerfil()
        const escribioNombre = nombre.trim()
        if (escribioNombre && (!actual?.nombre || actual.nombre === 'Profesor(a)')) {
          const { profesor } = await api.actualizarPerfilProfesor({ nombre: escribioNombre })
          setPerfil(profesor)
        }
        if (escribioNombre) guardarNombre(escribioNombre)
      } catch {
        /* si falla, igual se entra */
      }

      setClave('')
      setMotivo('')
      setSesion('dentro')
    } catch (err) {
      setError(err.message)
    } finally {
      setEntrando(false)
    }
  }

  async function salir() {
    await api.salirProfesor()
    setPerfil(null)
    setMotivo('')
    setSesion('fuera')
  }

  /* -------------------- Pantallas -------------------- */

  if (sesion === 'comprobando') return <Cargando texto="Verificando sesión…" />

  if (sesion === 'sin-conexion') {
    return (
      <div className="contenedor-angosto">
        <div className="tarjeta">
          <Vacio emoji="📡" titulo="Sin conexión con el servidor" texto={error}>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Boton variante="primario" onClick={comprobarSesion}>
                🔄 Reintentar
              </Boton>
              <Boton variante="fantasma" onClick={() => navegar('/')}>
                ← Inicio
              </Boton>
            </div>
          </Vacio>
        </div>
      </div>
    )
  }

  if (sesion === 'fuera') {
    return (
      <div className="contenedor-angosto">
        <div className="tarjeta animar-entrada">
          <div style={{ fontSize: '2.6rem', textAlign: 'center' }}>👩‍🏫</div>
          <h2 style={{ textAlign: 'center' }}>Ingreso de profesores</h2>
          <p className="ayuda" style={{ textAlign: 'center', marginBottom: 20 }}>
            Esta sección es solo para docentes: aquí se crean las tareas y se ven los resultados.
            Los estudiantes <strong>no</strong> entran por aquí.
          </p>

          {motivo && <div className="aviso">{motivo}</div>}
          {error && <div className="error">{error}</div>}

          <form onSubmit={entrar}>
            <Campo etiqueta="Tu nombre">
              <input
                type="text"
                placeholder="Ej: Profe Carolina Pérez"
                maxLength={60}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </Campo>

            <Campo
              etiqueta="Clave de profesor"
              ayuda="La encuentras en la consola al encender el servidor. La de fábrica es 'dale2026'."
            >
              <input
                type="password"
                placeholder="••••••••"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
              />
            </Campo>

            <Boton variante="primario" bloque tamano="grande" type="submit" disabled={entrando}>
              {entrando ? 'Entrando…' : '🔐 Entrar al panel'}
            </Boton>
          </form>

          <div style={{ textAlign: 'center', marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Boton variante="fantasma" mini onClick={() => navegar('/entrar')}>
              🧑‍🎓 Soy estudiante
            </Boton>
            <Boton variante="fantasma" mini onClick={() => navegar('/')}>
              🏠 Inicio
            </Boton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="area-docente">
      <aside className="lateral-docente">
        <div className="lateral-perfil">
          <span className="lateral-avatar">{perfil?.avatar || '👩‍🏫'}</span>
          <div className="lateral-datos">
            <strong>{perfil?.nombre || 'Profesor(a)'}</strong>
            <span>Panel docente</span>
          </div>
        </div>

        <nav className="lateral-menu">
          <NavLink to="/profesor" end className={({ isActive }) => `nav-item ${isActive ? 'activo' : ''}`}>
            <span>📊</span> Panel
          </NavLink>
          <NavLink to="/profesor/crear" className={({ isActive }) => `nav-item ${isActive ? 'activo' : ''}`}>
            <span>➕</span> Crear tarea
          </NavLink>
          <NavLink to="/profesor/reportes" className={({ isActive }) => `nav-item ${isActive ? 'activo' : ''}`}>
            <span>📈</span> Reportes
          </NavLink>
          <NavLink to="/profesor/conexion" className={({ isActive }) => `nav-item ${isActive ? 'activo' : ''}`}>
            <span>📡</span> Conexión
          </NavLink>
          <NavLink to="/profesor/perfil" className={({ isActive }) => `nav-item ${isActive ? 'activo' : ''}`}>
            <span>👤</span> Mi perfil
          </NavLink>
        </nav>

        <div className="lateral-pie">
          <button className="nav-item" onClick={salir}>
            <span>🚪</span> Cerrar sesión
          </button>
          <NavLink to="/" className="nav-item">
            <span>🏠</span> Ir al inicio
          </NavLink>
        </div>
      </aside>

      <main className="contenido-docente">
        <Outlet context={{ perfil, setPerfil, recargarPerfil: cargarPerfil, salir, avatares: AVATARES }} />
      </main>
    </div>
  )
}
