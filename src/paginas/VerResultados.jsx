import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, esErrorDeSesion } from '../lib/api.js'
import { useConexion } from '../lib/conexion.js'
import { formatearTiempo } from '../lib/util.js'
import Boton from '../components/Boton.jsx'
import CodigoQR from '../components/CodigoQR.jsx'
import { Cargando, Vacio } from '../components/Ui.jsx'

const RANGOS = [
  { nombre: '90 – 100%', min: 90, max: 101, color: 'var(--verde)' },
  { nombre: '70 – 89%', min: 70, max: 90, color: '#7ac943' },
  { nombre: '50 – 69%', min: 50, max: 70, color: 'var(--amarillo-oscuro)' },
  { nombre: '0 – 49%', min: 0, max: 50, color: 'var(--rojo)' },
]

/** Resultados y estadísticas de una tarea. */
export default function VerResultados() {
  const { codigo } = useParams()
  const navegar = useNavigate()
  const { base } = useConexion()
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      setDatos(await api.resultados(codigo))
    } catch (e) {
      if (esErrorDeSesion(e)) navegar('/profesor', { replace: true })
      else setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [codigo, navegar])

  useEffect(() => {
    cargar()
  }, [cargar])

  const distribucion = useMemo(() => {
    const intentos = datos?.intentos || []
    return RANGOS.map((r) => {
      const cantidad = intentos.filter((i) => {
        const p = i.total ? (i.correctas / i.total) * 100 : 0
        return p >= r.min && p < r.max
      }).length
      return {
        ...r,
        cantidad,
        porcentaje: intentos.length ? Math.round((cantidad / intentos.length) * 100) : 0,
      }
    })
  }, [datos])

  if (cargando) return <Cargando texto="Cargando resultados…" />

  if (error || !datos) {
    return (
      <div className="contenedor-angosto">
        <div className="tarjeta">
          <Vacio emoji="🔍" titulo="No encontramos la tarea" texto={error}>
            <Boton variante="primario" onClick={() => navegar('/profesor')}>
              Volver al panel
            </Boton>
          </Vacio>
        </div>
      </div>
    )
  }

  const { tarea, intentos, porPregunta, resumen } = datos
  const enlace = `${base}/entrar?codigo=${tarea.codigo}`
  const res = resumen || {}

  function exportarCsv() {
    const filas = [
      ['Estudiante', 'Avatar', 'Puntaje', 'Correctas', 'Total', 'Precision %', 'Segundos', 'Fecha'],
      ...intentos.map((i) => [
        i.estudiante,
        i.avatar,
        i.puntaje,
        i.correctas,
        i.total,
        i.total ? Math.round((i.correctas / i.total) * 100) : 0,
        i.segundos,
        new Date(i.fecha).toLocaleString('es-CO'),
      ]),
    ]
    const csv = filas.map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resultados-${tarea.codigo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="contenedor">
      <div className="encabezado-app" style={{ marginBottom: 14 }}>
        <div>
          <h2 style={{ marginBottom: 2 }}>{tarea.titulo}</h2>
          <span className="ayuda">
            {tarea.grado}° · {tarea.materia} · {tarea.tema} · Código <strong>{tarea.codigo}</strong>
          </span>
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

      <div className="metricas">
        <div className="metrica">
          <div className="valor">{res.totalIntentos ?? intentos.length}</div>
          <div className="rotulo">Participaciones</div>
        </div>
        <div className="metrica">
          <div className="valor">{res.estudiantesUnicos ?? 0}</div>
          <div className="rotulo">Estudiantes</div>
        </div>
        <div className="metrica">
          <div className="valor">{res.precisionPromedio ?? 0}%</div>
          <div className="rotulo">Precisión promedio</div>
        </div>
        <div className="metrica">
          <div className="valor">{res.puntajePromedio ?? 0}</div>
          <div className="rotulo">Puntaje promedio</div>
        </div>
        <div className="metrica">
          <div className="valor">{res.mejorPuntaje ?? 0}</div>
          <div className="rotulo">Mejor puntaje</div>
        </div>
      </div>

      {intentos.length === 0 ? (
        <div className="tarjeta">
          <Vacio
            emoji="⏳"
            titulo="Todavía no hay respuestas"
            texto="Comparte el código o el QR para que tus estudiantes empiecen a jugar."
          >
            <div className="caja-qr" style={{ marginTop: 12 }}>
              <CodigoQR texto={enlace} />
              <div className="enlace-tarea">{enlace}</div>
            </div>
          </Vacio>
        </div>
      ) : (
        <>
          <div className="tarjeta">
            <h3 style={{ fontSize: '1.05rem' }}>🎯 Distribución de resultados</h3>
            <p className="ayuda">Cuántos estudiantes cayeron en cada rango de precisión.</p>
            {distribucion.map((r) => (
              <div key={r.nombre} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem' }}>
                  <span>{r.nombre}</span>
                  <span className="ayuda">
                    {r.cantidad} estudiante(s) · {r.porcentaje}%
                  </span>
                </div>
                <div className="barra-mini" style={{ marginTop: 4 }}>
                  <div style={{ width: `${r.porcentaje}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="tarjeta">
            <div className="encabezado-app" style={{ marginBottom: 10 }}>
              <h3 style={{ margin: 0 }}>🏆 Tabla de posiciones</h3>
              <Boton variante="fantasma" mini onClick={exportarCsv}>
                ⬇️ Exportar CSV
              </Boton>
            </div>
            <div className="tabla-scroll">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Estudiante</th>
                    <th>Puntaje</th>
                    <th>Aciertos</th>
                    <th>Precisión</th>
                    <th>Tiempo</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {intentos.map((i, idx) => {
                    const precision = i.total ? Math.round((i.correctas / i.total) * 100) : 0
                    return (
                      <tr key={i.id}>
                        <td>
                          <span className="medalla">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                          </span>
                        </td>
                        <td>
                          {i.avatar} {i.estudiante}
                        </td>
                        <td>
                          <strong>{i.puntaje}</strong>
                        </td>
                        <td>
                          {i.correctas}/{i.total}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className={`barra-mini ${precision < 50 ? 'baja' : ''}`} style={{ width: 70 }}>
                              <div style={{ width: `${precision}%` }} />
                            </div>
                            <span>{precision}%</span>
                          </div>
                        </td>
                        <td>{formatearTiempo(i.segundos)}</td>
                        <td>{new Date(i.fecha).toLocaleString('es-CO')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="tarjeta">
            <h3 style={{ marginBottom: 4 }}>📈 Desempeño por pregunta</h3>
            <p className="ayuda">
              Te ayuda a saber qué temas reforzar en clase. Las barras rojas son las preguntas más difíciles.
            </p>
            {porPregunta.map((p, i) => (
              <div key={p.preguntaId} style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  {i + 1}. {p.enunciado}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className={`barra-mini ${p.porcentaje < 50 ? 'baja' : ''}`} style={{ flex: 1 }}>
                    <div style={{ width: `${p.porcentaje}%` }} />
                  </div>
                  <span className="ayuda" style={{ minWidth: 110, textAlign: 'right' }}>
                    {p.porcentaje}% ({p.aciertos}/{p.respondida})
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="tarjeta caja-qr">
            <h3 style={{ margin: 0 }}>📱 Entrar a la tarea</h3>
            <CodigoQR texto={enlace} />
            <div className="enlace-tarea">{enlace}</div>
          </div>
        </>
      )}
    </div>
  )
}
