import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { mezclar, respuestaCorrectaTexto, ETIQUETA_TIPO } from '../lib/util.js'
import { sonidos } from '../lib/sonidos.js'
import PreguntaInteractiva from '../preguntas/index.jsx'
import { Cargando, Vacio } from '../components/Ui.jsx'

/** Punto de entrada: valida la sesión y carga la tarea. */
export default function Jugar() {
  const { codigo } = useParams()
  const { state } = useLocation()
  const navegar = useNavigate()

  useEffect(() => {
    if (!state?.estudiante) {
      navegar(`/entrar?codigo=${codigo}`, { replace: true })
    }
  }, [state, codigo, navegar])

  if (!state?.estudiante) {
    return <Cargando texto="Un momento…" />
  }

  return (
    <Cargador
      tareaInicial={state.tarea || null}
      codigo={codigo}
      estudiante={state.estudiante}
      avatar={state.avatar || '🐯'}
    />
  )
}

/** Se asegura de tener la tarea antes de montar el tablero. */
function Cargador({ tareaInicial, codigo, estudiante, avatar }) {
  const navegar = useNavigate()
  const [tarea, setTarea] = useState(tareaInicial)
  const [error, setError] = useState('')

  useEffect(() => {
    if (tarea) return
    api
      .obtenerTarea(codigo)
      .then((datos) => setTarea(datos.tarea))
      .catch((e) => setError(e.message))
  }, [tarea, codigo])

  if (error) {
    return (
      <div className="contenedor-angosto">
        <div className="tarjeta">
          <Vacio emoji="😕" titulo="No pudimos cargar la tarea" texto={error}>
            <button className="boton boton-primario" onClick={() => navegar('/entrar')}>
              Probar otro código
            </button>
          </Vacio>
        </div>
      </div>
    )
  }

  if (!tarea) return <Cargando texto="Preparando el reto…" />

  if (!tarea.preguntas?.length) {
    return (
      <div className="contenedor-angosto">
        <div className="tarjeta">
          <Vacio emoji="📭" titulo="Esta tarea no tiene preguntas" texto="Pídele a tu profe que agregue preguntas." />
        </div>
      </div>
    )
  }

  return <Tablero tarea={tarea} estudiante={estudiante} avatar={avatar} />
}

/* ============================================================== */

function Tablero({ tarea, estudiante, avatar }) {
  const navegar = useNavigate()
  const config = tarea.config || {}
  const tiempoPorPregunta = Number(config.tiempoPorPregunta) || 0

  const [preguntas] = useState(() =>
    config.mezclar === false ? tarea.preguntas : mezclar(tarea.preguntas)
  )
  const total = preguntas.length

  const [indice, setIndice] = useState(0)
  const [puntaje, setPuntaje] = useState(0)
  const [vidas, setVidas] = useState(Number(config.vidas) || 3)
  const [racha, setRacha] = useState(0)
  const [respuestas, setRespuestas] = useState([])
  const [retro, setRetro] = useState(null)
  const [tiempoRestante, setTiempoRestante] = useState(tiempoPorPregunta)
  const [segundos, setSegundos] = useState(0)

  const guardado = useRef(false)
  const inicioPregunta = useRef(Date.now())

  const preguntaActual = preguntas[indice]

  const responder = useCallback(
    ({ correcto, intento }) => {
      if (retro || guardado.current) return

      const base = Number(preguntaActual.puntos) || 10
      let ganados = 0

      if (correcto) {
        const bonusTiempo = tiempoPorPregunta
          ? Math.round(base * 0.5 * (tiempoRestante / tiempoPorPregunta))
          : 0
        const bonusRacha = Math.min(10, racha * 2)
        ganados = base + bonusTiempo + bonusRacha
        setPuntaje((p) => p + ganados)
        setRacha((r) => r + 1)
        sonidos.correcto()
      } else {
        setRacha(0)
        setVidas((v) => Math.max(0, v - 1))
        sonidos.incorrecto()
      }

      const ms = Date.now() - inicioPregunta.current
      setSegundos((s) => s + Math.round(ms / 1000))
      setRespuestas((rs) => [
        ...rs,
        {
          preguntaId: preguntaActual.id,
          correcta: correcto,
          intento,
          ms,
          enunciado: preguntaActual.enunciado,
          tipo: preguntaActual.tipo,
          explicacion: preguntaActual.explicacion,
          respuestaCorrecta: respuestaCorrectaTexto(preguntaActual),
        },
      ])
      setRetro({ correcto, intento, ganados })
    },
    [retro, racha, tiempoRestante, tiempoPorPregunta, preguntaActual]
  )

  // Cuenta regresiva por pregunta.
  useEffect(() => {
    if (!tiempoPorPregunta || retro || guardado.current) return
    if (tiempoRestante <= 0) {
      responder({ correcto: false, intento: 'Se acabó el tiempo' })
      return
    }
    const t = setTimeout(() => setTiempoRestante((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [tiempoRestante, retro, tiempoPorPregunta, responder])

  const finalizar = useCallback(
    (porVidas = false) => {
      if (guardado.current) return
      guardado.current = true

      const correctas = respuestas.filter((r) => r.correcta).length
      const resultado = {
        tarea: {
          codigo: tarea.codigo,
          titulo: tarea.titulo,
          grado: tarea.grado,
          materia: tarea.materia,
          tema: tarea.tema,
        },
        estudiante,
        avatar,
        puntaje: puntaje,
        correctas,
        total,
        segundos,
        respuestas,
        porVidas,
      }

      api
        .guardarIntento({ codigo: tarea.codigo, estudiante, avatar, puntaje, respuestas, segundos })
        .catch(() => {})

      try {
        sessionStorage.setItem('dqa_resultado', JSON.stringify(resultado))
      } catch {
        /* sessionStorage no disponible */
      }

      if (correctas >= total * 0.6) sonidos.victoria()
      else sonidos.derrota()

      navegar('/resultado', { state: resultado })
    },
    [respuestas, puntaje, total, segundos, tarea, estudiante, avatar, navegar]
  )

  const siguiente = () => {
    if (vidas <= 0) return finalizar(true)
    if (indice >= total - 1) return finalizar(false)
    setIndice((i) => i + 1)
    setRetro(null)
    setTiempoRestante(tiempoPorPregunta)
    inicioPregunta.current = Date.now()
  }

  const ultimaOSinVidas = vidas <= 0 || indice >= total - 1
  const precision = Math.round((respuestas.filter((r) => r.correcta).length / total) * 100)
  const progreso = Math.round((indice / total) * 100)

  return (
    <div className="juego">
      <div className="barra-juego">
        <div className="vidas" title={`Vidas: ${vidas}`}>
          {Array.from({ length: Number(config.vidas) || 3 }).map((_, i) => (
            <span key={i} className={i < vidas ? '' : 'vida-perdida'}>
              {i < vidas ? '❤️' : '🖤'}
            </span>
          ))}
        </div>
        <div className="pildoras">
          {racha > 1 && <span className="pildora racha">🔥 Racha {racha}</span>}
          <span className="pildora puntos">⭐ {puntaje} pts</span>
          {tiempoPorPregunta > 0 && (
            <span className={`pildora tiempo ${tiempoRestante <= 5 ? 'peligro' : ''}`}>
              ⏱ {tiempoRestante}s
            </span>
          )}
        </div>
      </div>

      <div className="barra-progreso">
        <div style={{ width: `${progreso}%` }} />
      </div>

      <div className="tarjeta">
        <div className="pregunta-meta">
          <span>
            Pregunta {indice + 1} de {total}
          </span>
          <span className="etiqueta-tipo">{ETIQUETA_TIPO[preguntaActual.tipo] || preguntaActual.tipo}</span>
        </div>

        <div className="enunciado">{preguntaActual.enunciado}</div>

        <PreguntaInteractiva
          key={preguntaActual.id}
          pregunta={preguntaActual}
          onResponder={responder}
          bloqueado={!!retro}
        />

        {retro && (
          <div className={`retro ${retro.correcto ? 'bien' : 'mal'} animar-entrada`}>
            <div className="retro-titulo">
              <span>{retro.correcto ? '🎉' : '💡'}</span>
              <span>
                {retro.correcto
                  ? `¡Correcto! +${retro.ganados} puntos`
                  : 'Respuesta incorrecta'}
              </span>
            </div>

            {!retro.correcto && (
              <p className="explicacion" style={{ marginBottom: 8 }}>
                Respuesta correcta: <strong>{respuestaCorrectaTexto(preguntaActual)}</strong>
              </p>
            )}

            {config.mostrarExplicacion !== false && preguntaActual.explicacion && (
              <p className="explicacion">
                <span className="porque">¿Por qué?</span>
                {preguntaActual.explicacion}
              </p>
            )}

            <div className="retro-acciones">
              <button className="boton boton-primario" onClick={siguiente}>
                {ultimaOSinVidas ? '🏁 Ver resultados' : 'Siguiente →'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 14 }}>
        <span className="ayuda">
          Precisión: {isNaN(precision) ? 0 : precision}% · {estudiante} {avatar}
        </span>
      </div>
    </div>
  )
}
