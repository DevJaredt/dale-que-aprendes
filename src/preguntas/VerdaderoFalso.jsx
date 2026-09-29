import { useState } from 'react'

/** Pregunta de verdadero / falso. */
export default function VerdaderoFalso({ pregunta, onResponder, bloqueado }) {
  const [elegida, setElegida] = useState(null)
  const opciones = [
    { valor: true, texto: 'Verdadero', emoji: '✅' },
    { valor: false, texto: 'Falso', emoji: '❌' },
  ]

  const responder = (valor) => {
    if (bloqueado || elegida !== null) return
    setElegida(valor)
    onResponder({
      correcto: valor === pregunta.correcta,
      intento: valor ? 'Verdadero' : 'Falso',
    })
  }

  return (
    <div className="opciones">
      {opciones.map((op) => {
        const esCorrecta = op.valor === pregunta.correcta
        const esElegida = elegida === op.valor
        const clases = ['opcion']
        if (elegida !== null && esCorrecta) clases.push('correcta')
        if (esElegida && !esCorrecta) clases.push('incorrecta')
        if (esElegida) clases.push('elegida')

        return (
          <button
            key={op.texto}
            className={clases.join(' ')}
            disabled={elegida !== null || bloqueado}
            onClick={() => responder(op.valor)}
          >
            <span className="letra">{op.emoji}</span>
            <span>{op.texto}</span>
          </button>
        )
      })}
    </div>
  )
}
