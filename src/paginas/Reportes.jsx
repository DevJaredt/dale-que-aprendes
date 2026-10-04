import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, esErrorDeSesion, getTokenProfe } from '../lib/api.js'
import Boton from '../components/Boton.jsx'
import { Cargando, Vacio } from '../components/Ui.jsx'

/** Reportes comparativos: por materia, por grado y en el tiempo. */
export default function Reportes() {
  const navegar = useNavigate()
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [abierta, setAbierta] = useState(null)

  const cargar = useCallback(async () => {
    if (!getTokenProfe()) {
      navegar('/profesor', { replace: true })
      return
    }
    setCargando(true)
    setError('')
    try {
      setDatos(await api.reportes())
    } catch (e) {
      if (esErrorDeSesion(e)) navegar('/profesor', { replace: true })
      else setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [navegar])

  useEffect(() => {
    cargar()
  }, [cargar])

  if (cargando && !datos) return <Cargando texto="Armando los reportes…" />

  if (error || !datos) {
    return (
      <div className="contenedor-angosto">
        <div className="tarjeta">
          <Vacio emoji="📡" titulo="No pudimos cargar los reportes" texto={error}>
            <Boton variante="primario" onClick={cargar}>
              🔄 Reintentar
            </Boton>
          </Vacio>
        </div>
      </div>
    )
  }

  const { totales, porMateria, porGrado, porCombinacion, porSemana, tareas } = datos
  const maxSemana = Math.max(1, ...porSemana.map((s) => s.intentos))

  return (
    <div className="contenedor">
      <div className="encabezado-app" style={{ marginBottom: 14 }}>
        <div>
          <h2 style={{ marginBottom: 2 }}>📈 Reportes comparativos</h2>
          <span className="ayuda">Compara materias, grados y semanas para saber dónde reforzar.</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Boton variante="fantasma" mini onClick={cargar}>
            🔄 Actualizar
          </Boton>
          <Boton variante="fantasma" mini onClick={() => navegar('/profesor')}>
            ← Panel
          </Boton>
        </div>
      </div>

      {totales.intentos === 0 ? (
        <div className="tarjeta">
          <Vacio
            emoji="📊"
            titulo="Todavía no hay datos"
            texto="Cuando tus estudiantes jueguen, aquí verás las comparaciones por materia, grado y semana."
          />
        </div>
      ) : (
        <>
          <div className="metricas">
            <div className="metrica">
              <div className="valor">{totales.tareas}</div>
              <div className="rotulo">Tareas</div>
            </div>
            <div className="metrica">
              <div className="valor">{totales.intentos}</div>
              <div className="rotulo">Participaciones</div>
            </div>
            <div className="metrica">
              <div className="valor">{totales.estudiantes}</div>
              <div className="rotulo">Estudiantes</div>
            </div>
            <div className="metrica">
              <div className="valor">{totales.estudiantesConCuenta}</div>
              <div className="rotulo">Con cuenta</div>
            </div>
            <div className="metrica">
              <div className="valor">{totales.precision}%</div>
              <div className="rotulo">Precisión general</div>
            </div>
          </div>

          <div className="fila" style={{ alignItems: 'stretch' }}>
            <div className="tarjeta" style={{ flex: '1 1 320px' }}>
              <h3 style={{ fontSize: '1.05rem' }}>📘 Comparación por materia</h3>
              <TablaComparativa filas={porMateria} />
            </div>
            <div className="tarjeta" style={{ flex: '1 1 320px' }}>
              <h3 style={{ fontSize: '1.05rem' }}>🎓 Comparación por grado</h3>
              <TablaComparativa filas={porGrado} />
            </div>
          </div>

          <div className="tarjeta">
            <h3 style={{ fontSize: '1.05rem' }}>🔎 Grado + materia</h3>
            <p className="ayuda">Las combinaciones que más se juegan, con su precisión.</p>
            <TablaComparativa filas={porCombinacion} />
          </div>

          {porSemana.length > 0 && (
            <div className="tarjeta">
              <h3 style={{ fontSize: '1.05rem' }}>🗓️ Evolución por semana</h3>
              <p className="ayuda">Participaciones y precisión de las últimas semanas con actividad.</p>
              {porSemana.map((s) => (
                <div key={s.semana} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.88rem' }}>
                    <span>Semana del {s.semana}</span>
                    <span className="ayuda">
                      {s.intentos} jugada(s) · {s.precision}%
                    </span>
                  </div>
                  <div className="barra-mini" style={{ marginTop: 4 }}>
                    <div
                      style={{
                        width: `${Math.round((s.intentos / maxSemana) * 100)}%`,
                        background:
                          s.precision < 50
                            ? 'linear-gradient(90deg, var(--rojo), #ff8a8a)'
                            : 'linear-gradient(90deg, var(--verde), #2ec98f)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="tarjeta">
            <h3 style={{ fontSize: '1.05rem' }}>🛠️ Qué conviene reforzar</h3>
            <p className="ayuda">
              Tareas ordenadas de la que más se falla a la que mejor sale. Toca una para ver sus preguntas.
            </p>

            {tareas.map((t, i) => (
              <div key={t.codigo} className="tarea-reporte">
                <button
                  className="tarea-reporte-cabecera"
                  onClick={() => setAbierta(abierta === t.codigo ? null : t.codigo)}
                >
                  <span className="numero">{i + 1}</span>
                  <span className="titulo">
                    <strong>{t.titulo}</strong>
                    <span className="ayuda">
                      {t.grado}° · {t.materia} · {t.tema} · {t.estudiantes} estudiante(s) · {t.intentos} jugada(s)
                    </span>
                  </span>
                  <span className={`precision ${t.precision < 50 ? 'baja' : ''}`}>{t.precision}%</span>
                  <span className="flecha">{abierta === t.codigo ? '▲' : '▼'}</span>
                </button>

                {abierta === t.codigo && (
                  <div className="tarea-reporte-detalle">
                    {t.preguntas.map((p, j) => (
                      <div key={j} style={{ marginBottom: 12 }}>
                        <div style={{ fontWeight: 700, marginBottom: 6, fontSize: '0.92rem' }}>
                          {j + 1}. {p.enunciado}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className={`barra-mini ${p.porcentaje < 50 ? 'baja' : ''}`} style={{ flex: 1 }}>
                            <div style={{ width: `${p.porcentaje}%` }} />
                          </div>
                          <span className="ayuda" style={{ minWidth: 90, textAlign: 'right' }}>
                            {p.porcentaje}% ({p.respondida})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function TablaComparativa({ filas }) {
  if (!filas?.length) return <p className="ayuda">Sin datos todavía.</p>
  return (
    <div className="tabla-scroll">
      <table className="tabla">
        <thead>
          <tr>
            <th>Grupo</th>
            <th>Jugadas</th>
            <th>Estudiantes</th>
            <th>Precisión</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.nombre}>
              <td>
                <strong>{f.nombre}</strong>
              </td>
              <td>{f.intentos}</td>
              <td>{f.estudiantes}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className={`barra-mini ${f.precision < 50 ? 'baja' : ''}`} style={{ width: 70 }}>
                    <div style={{ width: `${f.precision}%` }} />
                  </div>
                  <span>{f.precision}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
