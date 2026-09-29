import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import Boton from '../components/Boton.jsx'
import { Campo, Cargando } from '../components/Ui.jsx'

const AVATARES = ['🐯', '🦊', '🐼', '🐨', '🦁', '🐸', '🐵', '🦄', '🐶', '🐱', '🐢', '🦉']

/** Ingreso del estudiante: código + nombre + avatar. */
export default function IngresoEstudiante() {
  const navegar = useNavigate()
  const [params] = useSearchParams()

  const [codigo, setCodigo] = useState((params.get('codigo') || '').toUpperCase())
  const [nombre, setNombre] = useState('')
  const [avatar, setAvatar] = useState(AVATARES[0])
  const [tarea, setTarea] = useState(null)
  const [cargandoTarea, setCargandoTarea] = useState(false)
  const [error, setError] = useState('')
  const [buscando, setBuscando] = useState(false)

  // Si llega un código por la URL (QR), se consulta automáticamente.
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
      setCargandoTarea(false)
    }
  }

  async function enviar(e) {
    e.preventDefault()
    setError('')
    if (!nombre.trim()) {
      setError('Escribe tu nombre para empezar.')
      return
    }
    const encontrada = tarea?.codigo === codigo.trim().toUpperCase() ? tarea : await buscar(codigo)
    if (!encontrada) return
    navegar(`/jugar/${encontrada.codigo}`, {
      state: { estudiante: nombre.trim(), avatar, tarea: encontrada },
    })
  }

  return (
    <div className="contenedor-angosto">
      <div className="tarjeta animar-entrada">
        <h2>🧑‍🎓 Entrar a jugar</h2>
        <p className="ayuda" style={{ marginBottom: 18 }}>
          Pide a tu profe el código de la tarea y escríbelo aquí.
        </p>

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
                onClick={() => {
                  setCargandoTarea(true)
                  buscar(codigo)
                }}
                disabled={buscando}
                style={{ flex: '0 0 auto' }}
              >
                {buscando ? '…' : 'Buscar'}
              </Boton>
            </div>
          </Campo>

          {cargandoTarea && <Cargando texto="Buscando la tarea…" />}

          {tarea && (
            <div className="exito">
              <strong>{tarea.titulo}</strong>
              <div style={{ fontSize: '0.85rem', marginTop: 4 }}>
                {tarea.grado}° · {tarea.materia} · {tarea.tema} · {tarea.preguntas.length} preguntas
              </div>
            </div>
          )}

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

          <Boton variante="amarillo" tamano="grande" bloque type="submit" disabled={buscando}>
            🚀 ¡Empezar a jugar!
          </Boton>
        </form>
      </div>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Boton variante="fantasma" mini onClick={() => navegar('/')}>
          ← Volver al inicio
        </Boton>
      </div>
    </div>
  )
}
