import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { api, esErrorDeSesion } from '../lib/api.js'
import { enlaceTarea } from '../lib/conexion.js'
import { copiarTexto } from '../lib/util.js'
import Boton from '../components/Boton.jsx'
import { Cargando, Vacio } from '../components/Ui.jsx'

/** Panel principal del profesor: resumen, dashboard y lista de tareas. */
export default function Profesor() {
  const navegar = useNavigate()
  const contexto = useOutletContext() || {}
  const nombreProfe = contexto.perfil?.nombre || ''

  const [tareas, setTareas] = useState([])
  const [resumen, setResumen] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [verTodas, setVerTodas] = useState(false)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const [lista, res] = await Promise.all([
        api.listarTareas(verTodas ? '' : nombreProfe),
        api.resumen(),
      ])
      setTareas(lista.tareas)
      setResumen(res)
    } catch (e) {
      // Si la sesión cayó, el área de docente se encarga de mostrar el ingreso.
      if (!esErrorDeSesion(e)) setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [verTodas, nombreProfe])

  useEffect(() => {
    cargar()
  }, [cargar])

  async function borrar(tarea) {
    if (!confirm(`¿Borrar la tarea "${tarea.titulo}"? También se borrarán sus resultados.`)) return
    try {
      await api.borrarTarea(tarea.id)
      setTareas((ts) => ts.filter((t) => t.id !== tarea.id))
      cargar()
    } catch (e) {
      alert(e.message)
    }
  }

  async function copiar(texto, mensaje = 'Copiado al portapapeles') {
    const ok = await copiarTexto(texto)
    if (ok) alert(mensaje)
    else prompt('Copia manualmente:', texto)
  }

  return (
    <div>
      <div className="encabezado-app" style={{ marginBottom: 14 }}>
        <div>
          <h2 style={{ marginBottom: 2 }}>📊 Panel</h2>
          <span className="ayuda">Tareas, estudiantes y porcentajes en un solo lugar.</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Boton variante="fantasma" mini onClick={cargar}>
            🔄 Actualizar
          </Boton>
          <Boton variante="amarillo" onClick={() => navegar('/profesor/crear')}>
            ➕ Crear tarea
          </Boton>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {cargando && !resumen ? (
        <Cargando texto="Cargando el panel…" />
      ) : (
        <>
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

              {(resumen.ultimos?.length || 0) > 0 && (
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

          <div className="encabezado-app" style={{ marginTop: 26, marginBottom: 10 }}>
            <h3 style={{ margin: 0 }}>📚 Tareas</h3>
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
                titulo={verTodas ? 'No hay tareas creadas' : 'Todavía no tienes tareas'}
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
                    <Boton variante="verde" mini onClick={() => navegar(`/profesor/vivo/${t.codigo}`)}>
                      🔴 En vivo
                    </Boton>
                    <Boton variante="fantasma" mini onClick={() => copiar(t.codigo, 'Código copiado')}>
                      📋 Código
                    </Boton>
                    <Boton
                      variante="fantasma"
                      mini
                      onClick={() => copiar(enlaceTarea(t.codigo), 'Enlace copiado')}
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
        </>
      )}
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
            <span className="ayuda">
              {d.precision}% · {d.intentos} jugadas
            </span>
          </div>
          <div className={`barra-mini ${d.precision < 50 ? 'baja' : ''}`} style={{ marginTop: 4 }}>
            <div style={{ width: `${d.precision}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
