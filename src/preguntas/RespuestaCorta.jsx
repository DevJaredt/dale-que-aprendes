import { useState } from 'react'
import { respuestaCortaCorrecta } from '../lib/util.js'

/** Pregunta de respuesta corta: el estudiante escribe la respuesta. */
export default function RespuestaCorta({ pregunta, onResponder, bloqueado }) {
  const [valor, setValor] = useState('')
  const [comprobado, setComprobado] = useState(false)

  const comprobar = () => {
    if (bloqueado || comprobado || !valor.trim()) return
    setComprobado(true)
    onResponder({
      correcto: respuestaCortaCorrecta(valor, pregunta.respuestas),
      intento: valor.trim(),
    })
  }

  return (
    <div>
      <div className="respuesta-corta">
        <input
          type="text"
          value={valor}
          autoFocus
          disabled={comprobado || bloqueado}
          placeholder="Escribe tu respuesta aquí…"
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') comprobar()
          }}
        />
        {!comprobado && (
          <button
            className="boton boton-verde"
            disabled={!valor.trim() || bloqueado}
            onClick={comprobar}
          >
            Comprobar
          </button>
        )}
      </div>
      {comprobado && (
        <div className="ayuda" style={{ marginTop: 10 }}>
          Respuesta correcta: <strong>{pregunta.respuestas[0]}</strong>
        </div>
      )}
    </div>
  )
}
