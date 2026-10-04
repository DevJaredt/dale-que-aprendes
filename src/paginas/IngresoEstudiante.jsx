import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  api,
  getTokenEstudiante,
  getEstudianteLocal,
  setEstudianteLocal,
  setTokenEstudiante,
} from '../lib/api.js'
import { AVATARES } from '../lib/util.js'
import Boton from '../components/Boton.jsx'
import { Campo, Cargando } from '../components/Ui.jsx'

/** Ingreso del estudiante: cuenta propia o juego rápido sin cuenta. */
export default function IngresoEstudiante() {
  const navegar = useNavigate()
  const [params] = useSearchParams()

  const [estudiante, setEstudiante] = useState(getEstudianteLocal())
  const [comprobando, setComprobando] = useState(Boolean(getTokenEstudiante()))
  const [codigo, setCodigo] = useState((params.get('codigo') || '').toUpperCase())
  const [nombre, setNombre] = useState('')
  const [avatar, setAvatar] = useState(AVATARES[0])
  const [tarea, setTarea] = useState(null)
  const [error, setError] = useState('')
  const [buscando, setBuscando] = useState(false)

  // Si hay una cuenta guardada, se comprueba que la sesión siga siendo válida.
  useEffect(() => {
    if (!getTokenEstudiante()) {
      setComprobando(false)
      return
    }
    let vigente = true
    api
      .perfilEstudiante()
      .then((datos) => {
        if (!vigente) return
        setEstudianteLocal(datos.estudiante)
        setEstudiante(datos.estudiante)
      })
      .catch(() => {
        if (!vigente) return
        setTokenEstudiante(null)
        setEstudianteLocal(null)
        setEstudiante(null)
      })
      .finally(() => vigente && setComprobando(false))
    return () => {
      vigente = false
    }
  }, [])

  // Si el código llega por la URL (QR), se consulta solo.
  useEffect(() => {
    const inicial = (params.get('codigo') || '').trim().toUpperCase()
    if (inicial.length >= 4) buscar(inicial, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function buscar(cod, mostrarError = true) {
    const limpio = (cod || '').trim().toUpperCase()
    if (limpio.length < 4) {
      if (mostrarError) setError('Escribe el código de la tarea.')
      return null
    }
    setBuscando(true)
    setError('')
    try {
      const { tarea } = await api.obtenerTarea(limpio)
      setTarea(tarea)
      setCodigo(tarea.codigo)
      return tarea
    } catch (err) {
      setTarea(null)
      if (mostrarError) setError(err.message)
      return null
    } finally {
      setBuscando(false)
    }
  }

  async function enviar(e) {
    e.preventDefault()
    setError('')

    const quienJuega = estudiante
      ? { nombre: estudiante.nombre, avatar: estudiante.avatar }
      : { nombre: nombre.trim(), avatar }

    if (!quienJuega.nombre) {
      setError('Escribe tu nombre para empezar.')
      return
    }

    const encontrada = tarea?.codigo === codigo.trim().toUpperCase() ? tarea : await buscar(codigo)
    if (!encontrada) return

    navegar(`/jugar/${encontrada.codigo}`, {
      state: { estudiante: quienJuega.nombre, avatar: quienJuega.avatar, tarea: encontrada },
    })
  }

  async function cambiarDeCuenta() {
    await api.salirEstudiante()
    setEstudiante(null)
    setNombre('')
  }

  if (comprobando) return <Cargando texto="Revisando tu cuenta…" />

  return (
    <div className="contenedor-angosto">
      <div className="tarjeta animar-entrada">
        <h2>🧑‍🎓 Entrar a jugar</h2>
        <p className="ayuda" style={{ marginBottom: 18 }}>
          Pide a tu profe el código de la tarea y escríbelo aquí.
        </p>

        {estudiante ? (
          <div className="exito" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.8rem' }}>{estudiante.avatar}</span>
            <div style={{ flex: 1 }}>
              <strong>¡Hola, {estudiante.nombre}!</strong>
              <div style={{ fontSize: '0.85rem' }}>
                Tus puntos e insignias se guardarán en tu cuenta.
              </div>
            </div>
          </div>
        ) : (
          <div className="aviso">
            ¿Quieres guardar tus puntos e insignias?{' '}
            <button className="enlace" onClick={() => navegar('/cuenta?volver=/entrar')}>
              Entra a tu cuenta
            </button>{' '}
            o{' '}
            <button className="enlace" onClick={() => navegar('/cuenta?modo=crear&volver=/entrar')}>
              crea una
            </button>
            . También puedes jugar sin cuenta.
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <form onSubmit={enviar}>
          <Campo etiqueta="Código de la tarea">
            <div className="fila">
              <input
                type="text"
                className="entrada-codigo"
                placeholder="ABC123"
                maxLength={6}
                value={codigo}
                onChange={(e) => {
                  const v = e.target.value.toUpperCase()
                  setCodigo(v)
                  if (tarea && v !== tarea.codigo) setTarea(null)
                }}
              />
              <Boton
                variante="fantasma"
                onClick={() => buscar(codigo)}
                disabled={buscando}
                style={{ flex: '0 0 auto' }}
              >
                {buscando ? '…' : 'Buscar'}
              </Boton>
            </div>
          </Campo>

          {tarea && (
            <div className="exito">
              <strong>{tarea.titulo}</strong>
              <div style={{ fontSize: '0.85rem', marginTop: 4 }}>
                {tarea.grado}° · {tarea.materia} · {tarea.tema} · {tarea.preguntas.length} preguntas
              </div>
            </div>
          )}

          {!estudiante && (
            <>
              <Campo etiqueta="Tu nombre">
                <input
                  type="text"
                  placeholder="Ej: Ana María Rojas"
                  maxLength={60}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </Campo>

              <Campo etiqueta="Elige tu avatar">
                <div className="avatares">
                  {AVATARES.map((a) => (
                    <button
                      key={a}
                      type="button"
                      className={`avatar ${avatar === a ? 'activo' : ''}`}
                      onClick={() => setAvatar(a)}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </Campo>
            </>
          )}

          <Boton variante="amarillo" tamano="grande" bloque type="submit" disabled={buscando}>
            🚀 ¡Empezar a jugar!
          </Boton>
        </form>

        {estudiante && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
            <Boton variante="primario" mini onClick={() => navegar('/progreso')}>
              📈 Mi progreso
            </Boton>
            <Boton variante="fantasma" mini onClick={cambiarDeCuenta}>
              🔄 Cambiar de cuenta
            </Boton>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Boton variante="fantasma" mini onClick={() => navegar('/')}>
          ← Volver al inicio
        </Boton>
      </div>
    </div>
  )
}
