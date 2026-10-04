import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { estrellas, mensajeFinal, formatearTiempo, ETIQUETA_TIPO } from '../lib/util.js'
import { api, getTokenEstudiante } from '../lib/api.js'
import { sonidos } from '../lib/sonidos.js'
import Confeti from '../components/Confeti.jsx'
import Boton from '../components/Boton.jsx'
import { Cargando } from '../components/Ui.jsx'

/** Pantalla final con el puntaje, las estrellas y el repaso de las preguntas. */
export default function Resultado() {
  const { state } = useLocation()
  const navegar = useNavigate()
  const [datos, setDatos] = useState(state || null)
  const [logrosNuevos, setLogrosNuevos] = useState([])
  const [conCuenta, setConCuenta] = useState(false)

  useEffect(() => {
    if (datos) return
    try {
      const guardado = sessionStorage.getItem('dqa_resultado')
      if (guardado) setDatos(JSON.parse(guardado))
    } catch {
      /* ignore */
    }
  }, [datos])

  // Si el estudiante tiene cuenta, se revisa si desbloqueó insignias nuevas.
  useEffect(() => {
    if (!getTokenEstudiante()) return
    setConCuenta(true)
    let vigente = true
    api
      .perfilEstudiante()
      .then(({ logros }) => {
        if (!vigente) return
        let anteriores = []
        try {
          anteriores = JSON.parse(localStorage.getItem('dqa_logros') || '[]')
        } catch {
          anteriores = []
        }
        const nuevos = logros.filter((l) => l.obtenido && !anteriores.includes(l.id))
        try {
          localStorage.setItem(
            'dqa_logros',
            JSON.stringify(logros.filter((l) => l.obtenido).map((l) => l.id))
          )
        } catch {
          /* ignore */
        }
        if (nuevos.length > 0) {
          setLogrosNuevos(nuevos)
          setTimeout(() => sonidos.victoria(), 400)
        }
      })
      .catch(() => {})
    return () => {
      vigente = false
    }
  }, [])

  if (!datos) {
    return (
      <div className="contenedor-angosto">
        <div className="tarjeta vacio">
          <span className="emoji">🤔</span>
          <h3>No hay resultados para mostrar</h3>
          <p>Parece que llegaste aquí sin terminar una tarea.</p>
          <Boton variante="primario" onClick={() => navegar('/')}>
            Ir al inicio
          </Boton>
        </div>
      </div>
    )
  }

  const { tarea, estudiante, avatar, puntaje, correctas, total, segundos, respuestas = [], porVidas } = datos
  const precision = total ? Math.round((correctas / total) * 100) : 0
  const estrellasGanadas = estrellas(precision)

  const reintentar = () => {
    navegar(`/jugar/${tarea.codigo}`, { state: { estudiante, avatar } })
  }

  return (
    <div className="contenedor-angosto">
      <Confeti activo={precision >= 60} />

      <div className="tarjeta resultado animar-entrada">
        <div style={{ fontSize: '3rem' }}>{avatar}</div>
        <h2 style={{ marginBottom: 4 }}>¡Buen trabajo, {estudiante}!</h2>
        <p className="ayuda" style={{ marginBottom: 4 }}>
          {tarea.titulo} · {tarea.grado}° · {tarea.materia}
        </p>

        {porVidas && (
          <div className="error" style={{ marginTop: 12 }}>
            Te quedaste sin vidas. ¡Repasa y vuelve a intentarlo!
          </div>
        )}

        <div className="estrellas">
          {[1, 2, 3].map((n) => (
            <span key={n} className={n <= estrellasGanadas ? '' : 'apagada'}>
              ⭐
            </span>
          ))}
        </div>

        <div className="puntaje-grande">{puntaje}</div>
        <div className="ayuda" style={{ fontSize: '0.95rem' }}>puntos</div>

        <div className="metricas">
          <div className="metrica">
            <div className="valor">
              {correctas}/{total}
            </div>
            <div className="rotulo">Correctas</div>
          </div>
          <div className="metrica">
            <div className="valor">{precision}%</div>
            <div className="rotulo">Precisión</div>
          </div>
          <div className="metrica">
            <div className="valor">{formatearTiempo(segundos)}</div>
            <div className="rotulo">Tiempo</div>
          </div>
        </div>

        <p style={{ fontWeight: 800, fontSize: '1.05rem' }}>{mensajeFinal(precision)}</p>

        {logrosNuevos.length > 0 && (
          <div className="logros-nuevos animar-entrada">
            <h3 style={{ marginBottom: 12 }}>🎉 ¡Desbloqueaste {logrosNuevos.length > 1 ? 'insignias nuevas' : 'una insignia nueva'}!</h3>
            <div className="logros-grid">
              {logrosNuevos.map((l) => (
                <div className="logro obtenido" key={l.id}>
                  <span className="emoji">{l.emoji}</span>
                  <strong>{l.nombre}</strong>
                  <span className="detalle">{l.descripcion}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="acciones-finales">
          <Boton variante="amarillo" tamano="grande" onClick={reintentar}>
            🔄 Intentar otra vez
          </Boton>
          {conCuenta && (
            <Boton variante="primario" onClick={() => navegar('/progreso')}>
              📈 Mi progreso
            </Boton>
          )}
          <Boton variante="fantasma" onClick={() => navegar('/entrar')}>
            🎟️ Entrar a otra tarea
          </Boton>
        </div>
      </div>

      {respuestas.length > 0 && (
        <div className="tarjeta repaso">
          <h3 style={{ marginBottom: 14 }}>📋 Repaso de tus respuestas</h3>
          {respuestas.map((r, i) => (
            <div key={`${r.preguntaId}-${i}`} className={`repaso-item ${r.correcta ? 'bien' : 'mal'}`}>
              <span className="icono">{r.correcta ? '✅' : '❌'}</span>
              <div className="contenido">
                <div className="enunciado-repaso">
                  {i + 1}. {r.enunciado}
                </div>
                <div className="detalle">
                  <span className="etiqueta-tipo" style={{ fontSize: '0.68rem', marginRight: 8 }}>
                    {ETIQUETA_TIPO[r.tipo] || r.tipo}
                  </span>
                  Tu respuesta: <strong>{r.intento || '—'}</strong>
                  {!r.correcta && r.respuestaCorrecta && (
                    <> · Correcta: <strong>{r.respuestaCorrecta}</strong></>
                  )}
                </div>
                {r.explicacion && (
                  <div className="detalle" style={{ marginTop: 6 }}>
                    💡 {r.explicacion}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
