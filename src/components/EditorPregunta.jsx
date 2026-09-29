import { useState } from 'react'
import { nuevoId } from '../lib/util.js'
import Boton from './Boton.jsx'
import { Campo } from './Ui.jsx'

const TIPOS = [
  { valor: 'multiple', nombre: 'Opción múltiple' },
  { valor: 'boolean', nombre: 'Verdadero / Falso' },
  { valor: 'emparejar', nombre: 'Emparejar parejas' },
  { valor: 'ordenar', nombre: 'Ordenar secuencia' },
  { valor: 'corta', nombre: 'Respuesta corta' },
]

/** Formulario para que el profesor cree una pregunta propia. */
export default function EditorPregunta({ inicial, grado, materia, tema, onGuardar, onCancelar }) {
  const [tipo, setTipo] = useState(inicial?.tipo || 'multiple')
  const [enunciado, setEnunciado] = useState(inicial?.enunciado || '')
  const [explicacion, setExplicacion] = useState(inicial?.explicacion || '')
  const [puntos, setPuntos] = useState(inicial?.puntos || 10)
  const [error, setError] = useState('')

  // Opción múltiple
  const [opciones, setOpciones] = useState(inicial?.opciones || ['', '', '', ''])
  const [correcta, setCorrecta] = useState(inicial?.correcta ?? 0)

  // Verdadero / Falso
  const [vf, setVf] = useState(inicial?.correcta === false ? false : true)

  // Emparejar
  const [pares, setPares] = useState(inicial?.pares || [{ izq: '', der: '' }, { izq: '', der: '' }, { izq: '', der: '' }])

  // Ordenar
  const [secuencia, setSecuencia] = useState(inicial?.secuencia || ['', '', ''])

  // Respuesta corta
  const [respuestas, setRespuestas] = useState(inicial?.respuestas?.join(', ') || '')

  function construir() {
    const base = {
      id: nuevoId('q'),
      grado,
      materia,
      tema,
      tipo,
      enunciado: enunciado.trim(),
      explicacion: explicacion.trim(),
      puntos: Number(puntos) || 10,
    }
    if (!base.enunciado) return { error: 'Escribe el enunciado de la pregunta.' }

    if (tipo === 'multiple') {
      const limpias = opciones.map((o) => o.trim())
      const correctaTexto = limpias[correcta]
      if (!correctaTexto) return { error: 'Marca cuál es la opción correcta.' }
      const filtradas = limpias.filter(Boolean)
      if (filtradas.length < 2) return { error: 'Escribe al menos dos opciones con texto.' }
      return { pregunta: { ...base, opciones: filtradas, correcta: filtradas.indexOf(correctaTexto) } }
    }

    if (tipo === 'boolean') {
      return { pregunta: { ...base, correcta: vf } }
    }

    if (tipo === 'emparejar') {
      const limpias = pares.map((p) => ({ izq: p.izq.trim(), der: p.der.trim() })).filter((p) => p.izq && p.der)
      if (limpias.length < 2) return { error: 'Completa al menos dos parejas.' }
      return { pregunta: { ...base, pares: limpias } }
    }

    if (tipo === 'ordenar') {
      const limpias = secuencia.map((s) => s.trim()).filter(Boolean)
      if (limpias.length < 3) return { error: 'Escribe al menos tres elementos en el orden correcto.' }
      return { pregunta: { ...base, secuencia: limpias } }
    }

    if (tipo === 'corta') {
      const limpias = respuestas.split(',').map((s) => s.trim()).filter(Boolean)
      if (limpias.length === 0) return { error: 'Escribe al menos una respuesta aceptada (separa varias con comas).' }
      return { pregunta: { ...base, respuestas: limpias } }
    }

    return { error: 'Tipo de pregunta no válido.' }
  }

  function guardar() {
    const { pregunta, error: err } = construir()
    if (err) {
      setError(err)
      return
    }
    onGuardar(pregunta)
  }

  return (
    <div className="pregunta-editor">
      <h3 style={{ fontSize: '1.05rem' }}>{inicial ? 'Editar pregunta' : 'Nueva pregunta'}</h3>

      {error && <div className="error">{error}</div>}

      <Campo etiqueta="Tipo de pregunta">
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {TIPOS.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.nombre}
            </option>
          ))}
        </select>
      </Campo>

      <Campo etiqueta="Enunciado">
        <textarea
          value={enunciado}
          placeholder="Escribe la pregunta…"
          onChange={(e) => setEnunciado(e.target.value)}
        />
      </Campo>

      {tipo === 'multiple' && (
        <Campo etiqueta="Opciones (marca la correcta)">
          {opciones.map((op, i) => (
            <div className="subopcion" key={i}>
              <input
                type="radio"
                name="opcion-correcta"
                checked={correcta === i}
                onChange={() => setCorrecta(i)}
                aria-label={`Opción ${i + 1} correcta`}
              />
              <input
                type="text"
                value={op}
                placeholder={`Opción ${i + 1}`}
                onChange={(e) => {
                  const copia = [...opciones]
                  copia[i] = e.target.value
                  setOpciones(copia)
                }}
              />
            </div>
          ))}
        </Campo>
      )}

      {tipo === 'boolean' && (
        <Campo etiqueta="Respuesta correcta">
          <div className="fila">
            <button
              type="button"
              className={`boton ${vf === true ? 'boton-verde' : 'boton-fantasma'}`}
              onClick={() => setVf(true)}
            >
              ✅ Verdadero
            </button>
            <button
              type="button"
              className={`boton ${vf === false ? 'boton-verde' : 'boton-fantasma'}`}
              onClick={() => setVf(false)}
            >
              ❌ Falso
            </button>
          </div>
        </Campo>
      )}

      {tipo === 'emparejar' && (
        <Campo etiqueta="Parejas" ayuda="El estudiante unirá cada elemento de la columna A con su pareja de la columna B.">
          {pares.map((par, i) => (
            <div className="fila-pares" key={i}>
              <input
                type="text"
                placeholder="Columna A"
                value={par.izq}
                onChange={(e) => {
                  const copia = [...pares]
                  copia[i] = { ...copia[i], izq: e.target.value }
                  setPares(copia)
                }}
              />
              <span>↔</span>
              <input
                type="text"
                placeholder="Columna B"
                value={par.der}
                onChange={(e) => {
                  const copia = [...pares]
                  copia[i] = { ...copia[i], der: e.target.value }
                  setPares(copia)
                }}
              />
              {pares.length > 2 && (
                <button
                  type="button"
                  className="boton boton-icono"
                  onClick={() => setPares(pares.filter((_, j) => j !== i))}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {pares.length < 6 && (
            <Boton variante="fantasma" mini onClick={() => setPares([...pares, { izq: '', der: '' }])}>
              + Agregar pareja
            </Boton>
          )}
        </Campo>
      )}

      {tipo === 'ordenar' && (
        <Campo etiqueta="Elementos en el orden correcto" ayuda="Escríbelos ya ordenados; el juego los mostrará mezclados.">
          {secuencia.map((item, i) => (
            <div className="fila-pares" key={i}>
              <span className="numero" style={{ fontWeight: 900, width: 24 }}>{i + 1}.</span>
              <input
                type="text"
                placeholder={`Elemento ${i + 1}`}
                value={item}
                onChange={(e) => {
                  const copia = [...secuencia]
                  copia[i] = e.target.value
                  setSecuencia(copia)
                }}
              />
              {secuencia.length > 3 && (
                <button
                  type="button"
                  className="boton boton-icono"
                  onClick={() => setSecuencia(secuencia.filter((_, j) => j !== i))}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {secuencia.length < 8 && (
            <Boton variante="fantasma" mini onClick={() => setSecuencia([...secuencia, ''])}>
              + Agregar elemento
            </Boton>
          )}
        </Campo>
      )}

      {tipo === 'corta' && (
        <Campo etiqueta="Respuestas aceptadas" ayuda="Separa varias formas válidas con comas. Ej: 5, cinco, 5 m/s">
          <input type="text" value={respuestas} onChange={(e) => setRespuestas(e.target.value)} />
        </Campo>
      )}

      <Campo etiqueta="Explicación (¿por qué?)" ayuda="Se muestra al estudiante después de responder. ¡Refuerza el aprendizaje!">
        <textarea
          value={explicacion}
          placeholder="Explica brevemente la respuesta correcta…"
          onChange={(e) => setExplicacion(e.target.value)}
        />
      </Campo>

      <div className="fila">
        <Campo etiqueta="Puntos">
          <input
            type="number"
            min={1}
            max={50}
            value={puntos}
            onChange={(e) => setPuntos(e.target.value)}
          />
        </Campo>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, paddingBottom: 16 }}>
          <Boton variante="verde" onClick={guardar}>
            💾 Guardar pregunta
          </Boton>
          <Boton variante="fantasma" onClick={onCancelar}>
            Cancelar
          </Boton>
        </div>
      </div>
    </div>
  )
}
