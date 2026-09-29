import { ETIQUETA_TIPO } from '../lib/util.js'
import OpcionMultiple from './OpcionMultiple.jsx'
import VerdaderoFalso from './VerdaderoFalso.jsx'
import Emparejar from './Emparejar.jsx'
import Ordenar from './Ordenar.jsx'
import RespuestaCorta from './RespuestaCorta.jsx'

/** Renderiza el componente interactivo según el tipo de pregunta. */
export default function PreguntaInteractiva({ pregunta, onResponder, bloqueado }) {
  const comunes = { pregunta, onResponder, bloqueado }
  switch (pregunta.tipo) {
    case 'multiple':
      return <OpcionMultiple {...comunes} />
    case 'boolean':
      return <VerdaderoFalso {...comunes} />
    case 'emparejar':
      return <Emparejar {...comunes} />
    case 'ordenar':
      return <Ordenar {...comunes} />
    case 'corta':
      return <RespuestaCorta {...comunes} />
    default:
      return <p>Tipo de pregunta no soportado: {pregunta.tipo}</p>
  }
}

export { ETIQUETA_TIPO }
