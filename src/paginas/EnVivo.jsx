import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, esErrorDeSesion, getTokenProfe } from '../lib/api.js'
import { useConexion } from '../lib/conexion.js'
import { formatearTiempo } from '../lib/util.js'
import { sonidos } from '../lib/sonidos.js'
import Boton from '../components/Boton.jsx'
import CodigoQR from '../components/CodigoQR.jsx'
import { Cargando, Vacio } from '../components/Ui.jsx'

const CADA = 4000 // milisegundos entre actualizaciones

/** Modo clase en vivo: ranking que se actualiza solo, para proyectar. */
export default function EnVivo() {
  const { codigo } = useParams()
  const navegar = useNavigate()
  const { base } = useConexion()

  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  const [resaltados, setResaltados] = useState([])
  const [auto, setAuto] = useState(true)
  const desdeRef = useRef(null)
  const temporizador = useRef(null)

  const salir = useCallback(() => navegar('/profesor', { replace: true }), [navegar])

  const cargar = useCallback(async () => {
    if (!getTokenProfe()) return salir()
    try {
      const respuesta = await api.enVivo(codigo, desdeRef.current)
      desdeRef.current = respuesta.ahora
      setDatos(respuesta)
      setError('')

      if (respuesta.nuevos?.length) {
        const ids = respuesta.nuevos.map((n) => n.id)
        setResaltados(ids)
        sonidos.nuevo()
        setTimeout(() => setResaltados([]), 7000)
      }
    } catch (e) {
      if (esErrorDeSesion(e)) salir()
      else setError(e.message)
    }
  }, [codigo, salir])

  useEffect(() => {
    cargar()
  }, [cargar])

  useEffect(() => {
    if (!auto) {
      if (temporizador.current) clearInterval(temporizador.current)
      return
    }
    temporizador.current = setInterval(cargar, CADA)
    return () => {
      if (temporizador.current) clearInterval(temporizador.current)
    }
  }, [auto, cargar])

  if (!datos) {
    if (error) {
      return (
        <div className="contenedor-angosto">
          <div className="tarjeta">
            <Vacio emoji="📡" titulo="No pudimos conectar" texto={error}>
              <Boton variante="primario" onClick={cargar}>
                🔄 Reintentar
              </Boton>
            </Vacio>
          </div>
        </div>
      )
    }
    return <Cargando texto="Conectando con la clase…" />
  }

  const { tarea, total, estudiantes, precision, puntajePromedio, ranking } = datos
  const enlace = `${base}/entrar?codigo=${tarea.codigo}`
  const podio = ranking.slice(0, 3)
  const resto = ranking.slice(3)

  return (
    <div className="contenedor">
      <div className="encabezado-app" style={{ marginBottom: 14 }}>
        <div>
          <h2 style={{ marginBottom: 2 }}>
            <span className="punto-vivo" /> Clase en vivo
          </h2>
          <span className="ayuda">
            {tarea.titulo} · {tarea.grado}° · {tarea.materia}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Boton variante={auto ? 'verde' : 'fantasma'} mini onClick={() => setAuto((v) => !v)}>
            {auto ? '⏸️ Pausar' : '▶️ Reanudar'}
          </Boton>
          <Boton variante="fantasma" mini onClick={cargar}>
            🔄 Actualizar
          </Boton>
          <Boton variante="fantasma" mini onClick={() => navegar(`/profesor/tarea/${tarea.codigo}`)}>
            📊 Resultados
          </Boton>
          <Boton variante="fantasma" mini onClick={salir}>
            ← Panel
          </Boton>
        </div>
      </div>

      <div className="metrica-enorme">
        <div>
          <div className="valor">{estudiantes}</div>
          <div className="rotulo">Estudiantes</div>
        </div>
        <div>
          <div className="valor">{total}</div>
          <div className="rotulo">Participaciones</div>
        </div>
        <div>
          <div className="valor">{precision}%</div>
          <div className="rotulo">Precisión</div>
        </div>
        <div>
          <div className="valor">{puntajePromedio}</div>
          <div className="rotulo">Puntaje promedio</div>
        </div>
      </div>

      {ranking.length === 0 ? (
        <div className="tarjeta caja-qr">
          <h3 style={{ margin: 0 }}>Esperando a los estudiantes…</h3>
          <p className="ayuda">Que entren con el código o escaneen el QR:</p>
          <div className="codigo-chip" style={{ fontSize: '2rem', letterSpacing: '0.3em', padding: '10px 22px' }}>
            {tarea.codigo}
          </div>
          <CodigoQR texto={enlace} tamano={220} />
          <div className="enlace-tarea">{enlace}</div>
        </div>
      ) : (
        <>
          {podio.length > 0 && (
            <div className="podio">
              {[1, 0, 2].map((pos) => {
                const jugador = podio[pos]
                if (!jugador) return <div key={pos} />
                const medallas = ['🥇', '🥈', '🥉']
                return (
                  <div key={pos} className={`podio-lugar puesto-${pos + 1} ${resaltados.includes(jugador.id) ? 'nuevo' : ''}`}>
                    <span className="medalla">{medallas[pos]}</span>
                    <span className="avatar-grande">{jugador.avatar}</span>
                    <strong>{jugador.estudiante}</strong>
                    <span className="puntos">{jugador.puntaje} pts</span>
                    <span className="ayuda">
                      {jugador.correctas}/{jugador.total} · {jugador.precision}%
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <div className="tarjeta">
            <h3 style={{ fontSize: '1.05rem' }}>🏆 Tabla en vivo</h3>
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
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((j, i) => (
                    <tr key={j.id} className={resaltados.includes(j.id) ? 'fila-nueva' : ''}>
                      <td>{i + 1}</td>
                      <td>
                        {j.avatar} {j.estudiante}
                      </td>
                      <td>
                        <strong>{j.puntaje}</strong>
                      </td>
                      <td>
                        {j.correctas}/{j.total}
                      </td>
                      <td>{j.precision}%</td>
                      <td>{formatearTiempo(j.segundos)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {resto.length > 0 && (
              <p className="ayuda" style={{ marginTop: 10 }}>
                Mostrando los primeros {ranking.length} puestos.
              </p>
            )}
          </div>
        </>
      )}

      <div className="caja-qr" style={{ marginTop: 16 }}>
        {ranking.length > 0 && (
          <>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Los que lleguen tarde entran con:</h3>
            <div className="codigo-chip" style={{ fontSize: '1.4rem', letterSpacing: '0.25em', padding: '8px 18px' }}>
              {tarea.codigo}
            </div>
            <CodigoQR texto={enlace} tamano={150} />
          </>
        )}
      </div>
    </div>
  )
}
