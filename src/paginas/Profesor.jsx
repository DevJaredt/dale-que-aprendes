import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, esErrorDeSesion, setTokenProfe, getTokenProfe } from '../lib/api.js'
import { copiarTexto, formatearTiempo } from '../lib/util.js'
import Boton from '../components/Boton.jsx'
import { Campo, Cargando, Vacio } from '../components/Ui.jsx'

const CLAVE_NOMBRE = 'dqa_profesor'

const guardarNombreLocal = (nombre) => {
  try {
    localStorage.setItem(CLAVE_NOMBRE, nombre)
  } catch {
    /* ignore */
  }
}

const leerNombreLocal = () => {
  try {
    return localStorage.getItem(CLAVE_NOMBRE) || ''
  } catch {
    return ''
  }
}

/** Panel del profesor: ingreso con clave, dashboard y lista de tareas. */
export default function Profesor() {
  const navegar = useNavigate()

  const [sesion, setSesion] = useState('comprobando') // comprobando | fuera | sin-conexion | dentro
  const [motivo, setMotivo] = useState('')
  const [nombre, setNombre] = useState(leerNombreLocal)
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [entrando, setEntrando] = useState(false)

  const [tareas, setTareas] = useState([])
  const [resumen, setResumen] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [verTodas, setVerTodas] = useState(false)
  const [mostrarClave, setMostrarClave] = useState(false)

  /* -------------------- Sesión -------------------- */
  const comprobarSesion = useCallback(async () => {
    if (!getTokenProfe()) {
      setSesion('fuera')
      return
    }
    setSesion('comprobando')
    setError('')
    try {
      await api.validarSesion()
      setSesion('dentro')
    } catch (e) {
      if (esErrorDeSesion(e)) {
        // La sesión ya no es válida (expiró o se cambió la clave).
        setTokenProfe(null)
        setMotivo('Tu sesión anterior terminó. Vuelve a entrar con tu clave.')
        setSesion('fuera')
      } else {
        // Falla de red o servidor apagado: NO se cierra la sesión.
        setError(`No pudimos conectar con el servidor. ${e.message}`)
        setSesion('sin-conexion')
      }
    }
  }, [])

  useEffect(() => {
    comprobarSesion()
  }, [comprobarSesion])

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const [lista, res] = await Promise.all([api.listarTareas(verTodas ? '' : nombre), api.resumen()])
      setTareas(lista.tareas)
      setResumen(res)
    } catch (e) {
      if (esErrorDeSesion(e)) setSesion('fuera')
      else setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [verTodas, nombre])

  useEffect(() => {
    if (sesion === 'dentro') cargar()
  }, [sesion, cargar])

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
      if (nombre.trim()) guardarNombreLocal(nombre.trim())
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
    setResumen(null)
    setTareas([])
    setMotivo('')
    setSesion('fuera')
  }

  async function borrar(tarea) {
    if (!confirm(`¿Borrar la tarea "${tarea.titulo}"? También se borrarán sus resultados.`)) return
    try {
      await api.borrarTarea(tarea.id)
      setTareas((ts) => ts.filter((t) => t.id !== tarea.id))
      cargar()
    } catch (e) {
      if (esErrorDeSesion(e)) setSesion('fuera')
      else alert(e.message)
    }
  }

  async function copiar(texto, mensaje = 'Copiado al portapapeles') {
    const ok = await copiarTexto(texto)
    if (ok) alert(mensaje)
    else prompt('Copia manualmente:', texto)
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
              ayuda="La encuentras en la consola al encender el servidor. Es 'dale2026' la primera vez."
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

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Boton variante="fantasma" mini onClick={() => navegar('/')}>
              ← Volver al inicio
            </Boton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="contenedor">
      <div className="encabezado-app" style={{ marginBottom: 14 }}>
        <div>
          <h2 style={{ marginBottom: 2 }}>👩‍🏫 Panel de {nombre || 'profesor'}</h2>
          <span className="ayuda">Tareas, estudiantes y porcentajes en un solo lugar.</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Boton variante="fantasma" mini onClick={cargar}>
            🔄 Actualizar
          </Boton>
          <Boton variante="amarillo" onClick={() => navegar('/profesor/crear')}>
            ➕ Crear tarea
          </Boton>
          <Boton variante="fantasma" mini onClick={salir}>
            🚪 Salir
          </Boton>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {cargando && !resumen ? (
        <Cargando texto="Cargando el panel…" />
      ) : (
        <>
          {/* ---------------- Dashboard ---------------- */}
          {resumen && (
            <>
              <div className="metricas">
                <div className="metrica">
                  <div className="valor">{resumen.totalTareas}</div>
                  <div className="rotulo">Tareas</div>
                </div>
                <div className="metrica">
                  <div className="valor">{resumen.totalIntentos}</div>
                  <div className="rotulo">Participaciones</div>
                </div>
                <div className="metrica">
                  <div className="valor">{resumen.estudiantesUnicos}</div>
                  <div className="rotulo">Estudiantes</div>
                </div>
                <div className="metrica">
                  <div className="valor">{resumen.precisionPromedio}%</div>
                  <div className="rotulo">Precisión promedio</div>
                </div>
                <div className="metrica">
                  <div className="valor">{resumen.puntajePromedio}</div>
                  <div className="rotulo">Puntaje promedio</div>
                </div>
              </div>

              {resumen.totalIntentos === 0 ? (
                <div className="tarjeta">
                  <Vacio
                    emoji="📊"
                    titulo="Aún no hay participaciones"
                    texto="Cuando tus estudiantes jueguen, aquí verás los porcentajes por materia y por grado."
                  />
                </div>
              ) : (
                <div className="fila" style={{ alignItems: 'stretch' }}>
                  <div className="tarjeta" style={{ flex: '1 1 320px' }}>
                    <h3 style={{ fontSize: '1.05rem' }}>📘 Por materia</h3>
                    <Barras datos={resumen.porMateria} />
                  </div>
                  <div className="tarjeta" style={{ flex: '1 1 320px' }}>
                    <h3 style={{ fontSize: '1.05rem' }}>🎓 Por grado</h3>
                    <Barras datos={resumen.porGrado} />
                  </div>
                </div>
              )}

              {resumen.ultimos.length > 0 && (
                <div className="tarjeta">
                  <h3 style={{ fontSize: '1.05rem' }}>🕒 Últimas participaciones</h3>
                  <div className="tabla-scroll">
                    <table className="tabla">
                      <thead>
                        <tr>
                          <th>Estudiante</th>
                          <th>Tarea</th>
                          <th>Puntaje</th>
                          <th>Precisión</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumen.ultimos.map((u) => (
                          <tr key={u.id}>
                            <td>
                              {u.avatar} {u.estudiante}
                            </td>
                            <td>
                              {u.tarea ? (
                                <button
                                  className="marca"
                                  style={{ fontSize: '0.9rem', fontWeight: 700 }}
                                  onClick={() => navegar(`/profesor/tarea/${u.tarea.codigo}`)}
                                >
                                  {u.tarea.titulo}
                                </button>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td>
                              <strong>{u.puntaje}</strong>
                            </td>
                            <td>
                              {u.precision}% ({u.correctas}/{u.total})
                            </td>
                            <td>{new Date(u.fecha).toLocaleString('es-CO')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ---------------- Mis tareas ---------------- */}
          <div className="encabezado-app" style={{ marginTop: 26, marginBottom: 10 }}>
            <h3 style={{ margin: 0 }}>📚 Mis tareas</h3>
            <div className="subopcion" style={{ margin: 0 }}>
              <input
                type="checkbox"
                id="vertodas"
                checked={verTodas}
                onChange={(e) => setVerTodas(e.target.checked)}
              />
              <label htmlFor="vertodas">Ver de otros profes</label>
            </div>
          </div>

          {tareas.length === 0 ? (
            <div className="tarjeta">
              <Vacio
                emoji="🗂️"
                titulo="Todavía no tienes tareas"
                texto="Crea tu primera tarea: elige grado, materia y arma las preguntas desde el banco o escríbelas tú."
              >
                <Boton variante="amarillo" onClick={() => navegar('/profesor/crear')}>
                  Crear mi primera tarea
                </Boton>
              </Vacio>
            </div>
          ) : (
            <div className="lista-tareas">
              {tareas.map((t) => (
                <div className="tarea-item" key={t.id}>
                  <div className="info">
                    <h3>{t.titulo}</h3>
                    <div className="ayuda">
                      {t.grado}° · {t.materia} · {t.tema}
                    </div>
                    <div className="ayuda">
                      👤 {t.profesor} · {t.totalPreguntas} preguntas · {t.totalIntentos} participaciones
                    </div>
                    <span className="codigo-chip">{t.codigo}</span>
                  </div>
                  <div className="acciones-tarea">
                    <Boton variante="primario" mini onClick={() => navegar(`/profesor/tarea/${t.codigo}`)}>
                      📊 Resultados
                    </Boton>
                    <Boton variante="fantasma" mini onClick={() => copiar(t.codigo, 'Código copiado')}>
                      📋 Código
                    </Boton>
                    <Boton
                      variante="fantasma"
                      mini
                      onClick={() =>
                        copiar(`${window.location.origin}/entrar?codigo=${t.codigo}`, 'Enlace copiado')
                      }
                    >
                      🔗 Enlace
                    </Boton>
                    <Boton variante="rojo" mini onClick={() => borrar(t)}>
                      🗑️
                    </Boton>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ---------------- Cambiar clave ---------------- */}
          <div className="tarjeta" style={{ marginTop: 24 }}>
            <button
              className="marca"
              style={{ fontSize: '1.05rem' }}
              onClick={() => setMostrarClave((v) => !v)}
            >
              🔑 Cambiar la clave de profesores {mostrarClave ? '▲' : '▼'}
            </button>
            {mostrarClave && <CambiarClave onListo={() => setMostrarClave(false)} />}
          </div>
        </>
      )}

      <div style={{ textAlign: 'center', marginTop: 22 }}>
        <Boton variante="fantasma" mini onClick={() => navegar('/')}>
          ← Volver al inicio
        </Boton>
      </div>
    </div>
  )
}

/* -------------------- Subcomponentes -------------------- */

function Barras({ datos }) {
  if (!datos?.length) return <p className="ayuda">Sin datos todavía.</p>
  return (
    <div>
      {datos.map((d) => (
        <div key={d.nombre} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem' }}>
            <span>{d.nombre}</span>
            <span className="ayuda">{d.precision}% · {d.intentos} jugadas</span>
          </div>
          <div className={`barra-mini ${d.precision < 50 ? 'baja' : ''}`} style={{ marginTop: 4 }}>
            <div style={{ width: `${d.precision}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

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
      setTimeout(onListo, 1200)
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={guardar} style={{ marginTop: 12 }}>
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
    </form>
  )
}
