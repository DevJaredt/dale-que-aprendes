import { useMemo, useRef, useState } from 'react'
import { mezclar } from '../lib/util.js'

/**
 * Pregunta de emparejar: se toca un elemento de la izquierda y luego su pareja
 * en la derecha. Los errores se muestran y se pueden corregir.
 * Solo se considera acierto si no hubo ningún error.
 */
export default function Emparejar({ pregunta, onResponder, bloqueado }) {
  const pares = pregunta.pares
  const izquierda = useMemo(() => pares.map((p, i) => ({ texto: p.izq, indice: i })), [pregunta.id])
  const derecha = useMemo(() => mezclar(pares.map((p) => p.der)), [pregunta.id])

  const [selIzq, setSelIzq] = useState(null)
  const [selDer, setSelDer] = useState(null)
  const [emparejadas, setEmparejadas] = useState({}) // indiceIzq -> true
  const [errorPar, setErrorPar] = useState(false)
  const [errores, setErrores] = useState(0)
  const terminado = useRef(false)

  const intentar = (izq, der) => {
    if (izq === null || der === null) return
    if (pares[izq].der === der) {
      const nuevas = { ...emparejadas, [izq]: true }
      setEmparejadas(nuevas)
      setSelIzq(null)
      setSelDer(null)
      if (Object.keys(nuevas).length === pares.length && !terminado.current) {
        terminado.current = true
        onResponder({
          correcto: errores === 0,
          intento: errores === 0 ? 'Todas las parejas correctas' : `Emparejó con ${errores} error(es)`,
        })
      }
    } else {
      setErrores((n) => n + 1)
      setErrorPar(true)
      setTimeout(() => {
        setErrorPar(false)
        setSelIzq(null)
        setSelDer(null)
      }, 550)
    }
  }

  const elegirDer = (texto) => {
    if (bloqueado || errorPar) return
    setSelDer(texto)
    intentar(selIzq, texto)
  }

  return (
    <div>
      <div className="emparejar">
        <div className="columna" data-rotulo="Columna A">
          {izquierda.map((item) => {
            const yaEsta = emparejadas[item.indice]
            const clases = ['ficha']
            if (yaEsta) clases.push('emparejada')
            else if (selIzq === item.indice) clases.push('elegida')
            return (
              <button
                key={item.indice}
                className={clases.join(' ')}
                disabled={yaEsta || bloqueado || errorPar}
                onClick={() => {
                  if (errorPar) return
                  setSelIzq(item.indice === selIzq ? null : item.indice)
                  setSelDer(null)
                }}
              >
                {item.texto}
              </button>
            )
          })}
        </div>
        <div className="columna" data-rotulo="Columna B">
          {derecha.map((texto) => {
            const yaEsta = Object.keys(emparejadas).some((k) => pares[k].der === texto)
            const clases = ['ficha']
            if (yaEsta) clases.push('emparejada')
            else if (selDer === texto) clases.push('elegida')
            if (errorPar && selDer === texto) clases.push('error-par')
            return (
              <button
                key={texto}
                className={clases.join(' ')}
                disabled={yaEsta || bloqueado || errorPar}
                onClick={() => elegirDer(texto)}
              >
                {texto}
              </button>
            )
          })}
        </div>
      </div>
      <div className="ayuda" style={{ marginTop: 12 }}>
        Toca un elemento de la columna A y luego su pareja en la columna B.
        {errores > 0 && ` · Errores: ${errores}`}
      </div>
    </div>
  )
}
