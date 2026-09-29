import { useMemo, useState } from 'react'
import { mezclar } from '../lib/util.js'

const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F']

/**
 * Pregunta de opción múltiple: el estudiante toca una opción y responde al instante.
 * Las opciones se mezclan en cada intento para que no se copien entre compañeros.
 */
export default function OpcionMultiple({ pregunta, onResponder, bloqueado }) {
  const opciones = useMemo(
    () => mezclar(pregunta.opciones.map((texto, original) => ({ texto, original }))),
    [pregunta.id]
  )
  const [elegida, setElegida] = useState(null)

  const responder = (indice) => {
    if (bloqueado || elegida !== null) return
    setElegida(indice)
    onResponder({
      correcto: opciones[indice].original === pregunta.correcta,
      intento: opciones[indice].texto,
    })
  }

  return (
    <div className="opciones">
      {opciones.map((op, i) => {
        const esCorrecta = op.original === pregunta.correcta
        const esElegida = elegida === i
        const clases = ['opcion']
        if (elegida !== null && esCorrecta) clases.push('correcta')
        if (esElegida && !esCorrecta) clases.push('incorrecta')
        if (esElegida) clases.push('elegida')

        return (
          <button
            key={i}
            className={clases.join(' ')}
            disabled={elegida !== null || bloqueado}
            onClick={() => responder(i)}
          >
            <span className="letra">{LETRAS[i]}</span>
            <span>{op.texto}</span>
          </button>
        )
      })}
    </div>
  )
}
