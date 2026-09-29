import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GRADOS, materiasDe, temasDe } from '../data/curriculo.js'
import { filtrarBanco } from '../data/bancoPreguntas.js'
import { api, getTokenProfe } from '../lib/api.js'
import { copiarTexto, ETIQUETA_TIPO } from '../lib/util.js'
import Boton from '../components/Boton.jsx'
import CodigoQR from '../components/CodigoQR.jsx'
import EditorPregunta from '../components/EditorPregunta.jsx'
import { Campo, Vacio } from '../components/Ui.jsx'

const OTRO = '__otro__'

/** Asistente para crear una tarea: datos → preguntas → publicar. */
export default function CrearTarea() {
  const navegar = useNavigate()
  const profesor = (() => {
    try {
      return localStorage.getItem('dqa_profesor') || 'Profesor(a)'
    } catch {
      return 'Profesor(a)'
    }
  })()

  const [paso, setPaso] = useState(1)
  const [datos, setDatos] = useState({
    titulo: '',
    grado: '5',
    materia: '',
    tema: '',
    temaOtro: '',
    config: { tiempoPorPregunta: 30, vidas: 3, mezclar: true, mostrarExplicacion: true },
  })
  const [preguntas, setPreguntas] = useState([])
  const [filtroTema, setFiltroTema] = useState('')
  const [editando, setEditando] = useState(null) // pregunta en edición o 'nueva'
  const [error, setError] = useState('')
  const [publicando, setPublicando] = useState(false)
  const [publicada, setPublicada] = useState(null)

  // Solo los profesores con sesión pueden crear tareas.
  useEffect(() => {
    if (!getTokenProfe()) navegar('/profesor', { replace: true })
  }, [navegar])

  const materias = materiasDe(datos.grado)
  const temas = temasDe(datos.grado, datos.materia)
  const temaEfectivo = datos.tema === OTRO ? datos.temaOtro.trim() : datos.tema

  const banco = useMemo(
    () => filtrarBanco({ grado: datos.grado, materia: datos.materia, tema: filtroTema || undefined }),
    [datos.grado, datos.materia, filtroTema]
  )

  const idsAgregadas = useMemo(() => new Set(preguntas.map((p) => p.id)), [preguntas])

  function cambiarGrado(grado) {
    setDatos((d) => ({ ...d, grado, materia: '', tema: '', temaOtro: '' }))
    setFiltroTema('')
  }

  function cambiarMateria(materia) {
    setDatos((d) => ({ ...d, materia, tema: '', temaOtro: '' }))
    setFiltroTema('')
  }

  function agregarDelBanco(p) {
    setPreguntas((ps) => [...ps, { ...p }])
  }

  function quitar(id) {
    setPreguntas((ps) => ps.filter((p) => p.id !== id))
  }

  function validarPaso1() {
    if (!datos.titulo.trim()) return 'Escribe un título para la tarea.'
    if (!datos.grado) return 'Elige el grado.'
    if (!datos.materia) return 'Elige la materia.'
    if (!temaEfectivo) return 'Elige o escribe el tema.'
    return ''
  }

  function avanzarAPreguntas() {
    const err = validarPaso1()
    if (err) {
      setError(err)
      return
    }
    setError('')
    setPaso(2)
  }

  function guardarPregunta(pregunta) {
    setPreguntas((ps) => {
      const existe = ps.findIndex((p) => p.id === pregunta.id)
      if (existe >= 0) {
        const copia = [...ps]
        copia[existe] = pregunta
        return copia
      }
      return [...ps, pregunta]
    })
    setEditando(null)
  }

  async function publicar() {
    if (preguntas.length === 0) {
      setError('Agrega al menos una pregunta antes de publicar.')
      return
    }
    setPublicando(true)
    setError('')
    try {
      const resultado = await api.crearTarea({
        titulo: datos.titulo.trim(),
        grado: datos.grado,
        materia: datos.materia,
        tema: temaEfectivo,
        profesor,
        config: datos.config,
        preguntas,
      })
      setPublicada({ ...resultado, preguntas: preguntas.length })
      setPaso(3)
    } catch (e) {
      setError(e.message)
    } finally {
      setPublicando(false)
    }
  }

  /* ------------------------- Paso 3: publicada ------------------------- */
  if (paso === 3 && publicada) {
    const enlace = `${window.location.origin}/entrar?codigo=${publicada.codigo}`
    return (
      <div className="contenedor-angosto">
        <div className="tarjeta animar-entrada" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>🎉</div>
          <h2>¡Tarea publicada!</h2>
          <p className="ayuda">Comparte este código con tus estudiantes.</p>

          <div
            className="codigo-chip"
            style={{ fontSize: '1.8rem', letterSpacing: '0.3em', padding: '12px 22px', display: 'inline-block' }}
          >
            {publicada.codigo}
          </div>

          <div className="caja-qr" style={{ marginTop: 20 }}>
            <CodigoQR texto={enlace} />
            <div className="enlace-tarea">{enlace}</div>
          </div>

          <div className="acciones-finales">
            <Boton
              variante="fantasma"
              onClick={async () => {
                const ok = await copiarTexto(publicada.codigo)
                alert(ok ? 'Código copiado' : publicada.codigo)
              }}
            >
              📋 Copiar código
            </Boton>
            <Boton
              variante="fantasma"
              onClick={async () => {
                const ok = await copiarTexto(enlace)
                alert(ok ? 'Enlace copiado' : enlace)
              }}
            >
              🔗 Copiar enlace
            </Boton>
            <Boton variante="primario" onClick={() => navegar(`/profesor/tarea/${publicada.codigo}`)}>
              📊 Ver resultados
            </Boton>
            <Boton variante="amarillo" onClick={() => navegar('/profesor')}>
              Volver al panel
            </Boton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="contenedor">
      <div className="encabezado-app" style={{ marginBottom: 14 }}>
        <h2 style={{ margin: 0 }}>➕ Crear tarea</h2>
        <Boton variante="fantasma" mini onClick={() => navegar('/profesor')}>
          ← Cancelar
        </Boton>
      </div>

      <div className="pasos">
        <div className={`paso ${paso === 1 ? 'activo' : ''}`}>
          <span className="num">1</span> Datos de la tarea
        </div>
        <div className={`paso ${paso === 2 ? 'activo' : ''}`}>
          <span className="num">2</span> Preguntas
        </div>
        <div className={`paso ${paso === 3 ? 'activo' : ''}`}>
          <span className="num">3</span> Compartir
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {paso === 1 && (
        <div className="tarjeta animar-entrada">
          <Campo etiqueta="Título de la tarea">
            <input
              type="text"
              placeholder="Ej: Repaso de fracciones y decimales"
              maxLength={120}
              value={datos.titulo}
              onChange={(e) => setDatos((d) => ({ ...d, titulo: e.target.value }))}
            />
          </Campo>

          <div className="fila">
            <Campo etiqueta="Grado">
              <select value={datos.grado} onChange={(e) => cambiarGrado(e.target.value)}>
                {GRADOS.map((g) => (
                  <option key={g} value={g}>
                    {g}° ({Number(g) <= 5 ? 'Primaria' : 'Secundaria'})
                  </option>
                ))}
              </select>
            </Campo>

            <Campo etiqueta="Materia">
              <select value={datos.materia} onChange={(e) => cambiarMateria(e.target.value)}>
                <option value="">Selecciona…</option>
                {materias.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          <Campo etiqueta="Tema">
            <select
              value={datos.tema}
              onChange={(e) => setDatos((d) => ({ ...d, tema: e.target.value }))}
              disabled={!datos.materia}
            >
              <option value="">Selecciona…</option>
              {temas.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              <option value={OTRO}>Otro tema (escribir)…</option>
            </select>
          </Campo>

          {datos.tema === OTRO && (
            <Campo etiqueta="Escribe el tema">
              <input
                type="text"
                placeholder="Ej: Números fraccionarios"
                value={datos.temaOtro}
                onChange={(e) => setDatos((d) => ({ ...d, temaOtro: e.target.value }))}
              />
            </Campo>
          )}

          <h3 style={{ marginTop: 22, fontSize: '1.05rem' }}>⚙️ Configuración del juego</h3>

          <div className="fila">
            <Campo etiqueta="Tiempo por pregunta (segundos)" ayuda="Escribe 0 para no poner límite.">
              <input
                type="number"
                min={0}
                max={180}
                value={datos.config.tiempoPorPregunta}
                onChange={(e) =>
                  setDatos((d) => ({ ...d, config: { ...d.config, tiempoPorPregunta: e.target.value } }))
                }
              />
            </Campo>

            <Campo etiqueta="Vidas">
              <input
                type="number"
                min={1}
                max={9}
                value={datos.config.vidas}
                onChange={(e) => setDatos((d) => ({ ...d, config: { ...d.config, vidas: e.target.value } }))}
              />
            </Campo>
          </div>

          <div className="subopcion">
            <input
              type="checkbox"
              id="mezclar"
              checked={datos.config.mezclar}
              onChange={(e) => setDatos((d) => ({ ...d, config: { ...d.config, mezclar: e.target.checked } }))}
            />
            <label htmlFor="mezclar">Mezclar el orden de las preguntas</label>
          </div>

          <div className="subopcion">
            <input
              type="checkbox"
              id="explicacion"
              checked={datos.config.mostrarExplicacion}
              onChange={(e) =>
                setDatos((d) => ({ ...d, config: { ...d.config, mostrarExplicacion: e.target.checked } }))
              }
            />
            <label htmlFor="explicacion">Mostrar la explicación después de cada respuesta</label>
          </div>

          <div style={{ marginTop: 20 }}>
            <Boton variante="primario" tamano="grande" onClick={avanzarAPreguntas}>
              Siguiente: elegir preguntas →
            </Boton>
          </div>
        </div>
      )}

      {paso === 2 && (
        <div className="animar-entrada">
          <div className="tarjeta">
            <div className="encabezado-app" style={{ marginBottom: 8 }}>
              <div>
                <h3 style={{ marginBottom: 2 }}>
                  Preguntas ({preguntas.length})
                </h3>
                <span className="ayuda">
                  {datos.grado}° · {datos.materia} · {temaEfectivo}
                </span>
              </div>
              <Boton variante="fantasma" mini onClick={() => setPaso(1)}>
                ← Editar datos
              </Boton>
            </div>

            {preguntas.length > 0 && (
              <div style={{ marginTop: 14 }}>
                {preguntas.map((p, i) => (
                  <div className="pregunta-editor" key={p.id}>
                    <div className="cabecera">
                      <div>
                        <span className="tipo-chip">{ETIQUETA_TIPO[p.tipo] || p.tipo}</span>
                        <div style={{ fontWeight: 700, marginTop: 6 }}>
                          {i + 1}. {p.enunciado}
                        </div>
                        <div className="ayuda">{p.puntos || 10} puntos</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Boton variante="fantasma" mini onClick={() => setEditando(p)}>
                          ✏️
                        </Boton>
                        <Boton variante="rojo" mini onClick={() => quitar(p.id)}>
                          ✕
                        </Boton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {editando && (
              <div style={{ marginTop: 16 }}>
                <EditorPregunta
                  inicial={editando === 'nueva' ? null : editando}
                  grado={datos.grado}
                  materia={datos.materia}
                  tema={temaEfectivo}
                  onGuardar={guardarPregunta}
                  onCancelar={() => setEditando(null)}
                />
              </div>
            )}

            {!editando && (
              <div style={{ marginTop: 16 }}>
                <Boton variante="verde" onClick={() => setEditando('nueva')}>
                  ✍️ Crear pregunta propia
                </Boton>
              </div>
            )}
          </div>

          <div className="tarjeta">
            <h3 style={{ fontSize: '1.05rem' }}>📚 Banco de preguntas sugeridas</h3>
            <p className="ayuda">
              Preguntas listas para {datos.grado}° de {datos.materia}. Toca "Agregar" para incluirlas en tu tarea.
            </p>

            <Campo etiqueta="Filtrar por tema">
              <select value={filtroTema} onChange={(e) => setFiltroTema(e.target.value)}>
                <option value="">Todos los temas</option>
                {temas.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Campo>

            {banco.length === 0 ? (
              <Vacio
                emoji="🗂️"
                titulo="No hay preguntas de este tema en el banco"
                texto="Puedes crear las tuyas con el botón de arriba."
              />
            ) : (
              <div className="banco-lista">
                {banco.map((p) => {
                  const agregada = idsAgregadas.has(p.id)
                  return (
                    <div className={`banco-item ${agregada ? 'agregada' : ''}`} key={p.id}>
                      <div className="texto">
                        <div className="meta">
                          {ETIQUETA_TIPO[p.tipo]} · {p.tema}
                        </div>
                        {p.enunciado}
                      </div>
                      {agregada ? (
                        <Boton variante="fantasma" mini onClick={() => quitar(p.id)}>
                          Quitar
                        </Boton>
                      ) : (
                        <Boton variante="primario" mini onClick={() => agregarDelBanco(p)}>
                          Agregar
                        </Boton>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <Boton variante="amarillo" tamano="grande" onClick={publicar} disabled={publicando}>
              {publicando ? 'Publicando…' : `🚀 Publicar tarea (${preguntas.length} preguntas)`}
            </Boton>
          </div>
        </div>
      )}
    </div>
  )
}
