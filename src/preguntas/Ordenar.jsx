import { useMemo, useState } from 'react'
import { mezclar } from '../lib/util.js'

/**
 * Pregunta de ordenar: el estudiante acomoda los elementos con las flechas
 * y luego comprueba. Se considera acierto si el orden es exacto.
 */
export default function Ordenar({ pregunta, onResponder, bloqueado }) {
  const listaInicial = useMemo(() => {
    // Evita que aparezca ya resuelta.
    let intento = mezclar(pregunta.secuencia)
    for (let i = 0; i < 5 && intento.join('|') === pregunta.secuencia.join('|'); i++) {
      intento = mezclar(pregunta.secuencia)
    }
    return intento
  }, [pregunta.id])

  const [lista, setLista] = useState(listaInicial)
  const [comprobado, setComprobado] = useState(false)

  const mover = (pos, direccion) => {
    if (bloqueado || comprobado) return
    const destino = pos + direccion
    if (destino < 0 || destino >= lista.length) return
    const copia = [...lista]
    ;[copia[pos], copia[destino]] = [copia[destino], copia[pos]]
    setLista(copia)
  }

  const comprobar = () => {
    if (bloqueado || comprobado) return
    setComprobado(true)
    const correcto = lista.join('|') === pregunta.secuencia.join('|')
    onResponder({ correcto, intento: lista.join(' → ') })
  }

  return (
    <div>
      <div className="ordenar-lista">
        {lista.map((texto, i) => {
          const esCorrectaLaPosicion = comprobado && pregunta.secuencia[i] === texto
          const clases = ['ordenar-item']
          if (comprobado) clases.push(esCorrectaLaPosicion ? 'correcta' : 'incorrecta')
          return (
            <div key={`${texto}-${i}`} className={clases.join(' ')}>
              <span className="numero">{i + 1}</span>
              <span className="texto">{texto}</span>
              <div className="flechas">
                <button
                  aria-label="Subir"
                  disabled={i === 0 || comprobado || bloqueado}
                  onClick={() => mover(i, -1)}
                >
                  ▲
                </button>
                <button
                  aria-label="Bajar"
                  disabled={i === lista.length - 1 || comprobado || bloqueado}
                  onClick={() => mover(i, 1)}
                >
                  ▼
                </button>
              </div>
            </div>
          )
        })}
      </div>
      {!comprobado && (
        <button
          className="boton boton-verde boton-bloque"
          style={{ marginTop: 16 }}
          disabled={bloqueado}
          onClick={comprobar}
        >
          Comprobar orden
        </button>
      )}
    </div>
  )
}
