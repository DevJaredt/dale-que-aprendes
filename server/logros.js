/**
 * Logros e insignias de los estudiantes.
 *
 * Se calculan a partir del historial de intentos, así que no hay que
 * guardarlos aparte: siempre están consistentes con lo que el estudiante jugó.
 *
 * Es un módulo puro (sin acceso a datos), fácil de probar.
 */

export const LOGROS = [
  {
    id: 'primer-paso',
    nombre: 'Primer paso',
    emoji: '👣',
    descripcion: 'Completa tu primera tarea.',
  },
  {
    id: 'perfecto',
    nombre: 'Puntaje perfecto',
    emoji: '💯',
    descripcion: 'Acierta todas las preguntas de una tarea.',
  },
  {
    id: 'perfecto-3',
    nombre: 'Tres perfectas',
    emoji: '🏅',
    descripcion: 'Consigue tres tareas con todo correcto.',
  },
  {
    id: 'racha-5',
    nombre: 'En racha',
    emoji: '🔥',
    descripcion: 'Acierta 5 preguntas seguidas.',
  },
  {
    id: 'racha-10',
    nombre: 'Imparable',
    emoji: '⚡',
    descripcion: 'Acierta 10 preguntas seguidas.',
  },
  {
    id: 'constante',
    nombre: 'Constante',
    emoji: '📅',
    descripcion: 'Juega en 3 días diferentes.',
  },
  {
    id: 'explorador',
    nombre: 'Explorador',
    emoji: '🧭',
    descripcion: 'Juega tareas de 4 materias distintas.',
  },
  {
    id: 'matematico',
    nombre: 'Matemático',
    emoji: '🧮',
    descripcion: 'Consigue 80 % o más en 3 tareas de Matemáticas.',
  },
  {
    id: 'cientifico',
    nombre: 'Científico',
    emoji: '🔬',
    descripcion: 'Consigue 80 % o más en 3 tareas de Ciencias Naturales.',
  },
  {
    id: 'lector',
    nombre: 'Gran lector',
    emoji: '📖',
    descripcion: 'Consigue 80 % o más en 3 tareas de Lenguaje.',
  },
  {
    id: 'poliglota',
    nombre: 'Políglota',
    emoji: '🗣️',
    descripcion: 'Consigue 80 % o más en 3 tareas de Inglés.',
  },
  {
    id: 'diez-tareas',
    nombre: 'Veterano',
    emoji: '🎖️',
    descripcion: 'Completa 10 tareas.',
  },
  {
    id: 'veloz',
    nombre: 'Mente rápida',
    emoji: '🚀',
    descripcion: 'Termina una tarea de 3 o más preguntas en menos de 15 segundos por pregunta.',
  },
]

/** Mayor cantidad de aciertos seguidos dentro de un intento. */
export function rachaMaxima(intento) {
  let mejor = 0
  let actual = 0
  for (const respuesta of intento?.respuestas || []) {
    if (respuesta?.correcta) {
      actual += 1
      if (actual > mejor) mejor = actual
    } else {
      actual = 0
    }
  }
  return mejor
}

const precisionDe = (intento) =>
  intento?.total > 0 ? intento.correctas / intento.total : 0

/**
 * Calcula qué logros tiene un estudiante.
 * `intentos` debe ser una lista de intentos, cada uno con al menos:
 * { total, correctas, segundos, fecha, respuestas, materia }
 *
 * Devuelve la lista completa de logros con `obtenido: true/false`
 * y el progreso hacia los que todavía no ha conseguido.
 */
export function calcularLogros(intentos) {
  const lista = Array.isArray(intentos) ? intentos.filter(Boolean) : []
  const obtenidos = new Set()
  const progreso = {}

  const perfectas = lista.filter((i) => i.total > 0 && i.correctas === i.total)
  const racha = lista.reduce((mayor, i) => Math.max(mayor, rachaMaxima(i)), 0)
  const dias = new Set(lista.map((i) => String(i.fecha || '').slice(0, 10)).filter(Boolean))
  const materias = new Set(lista.map((i) => i.materia).filter(Boolean))
  const buenas = (materia) =>
    lista.filter((i) => i.materia === materia && precisionDe(i) >= 0.8).length

  const marcar = (id, cumple, actual, meta) => {
    progreso[id] = { actual: Math.min(actual, meta), meta }
    if (cumple) obtenidos.add(id)
  }

  marcar('primer-paso', lista.length >= 1, lista.length, 1)
  marcar('perfecto', perfectas.length >= 1, perfectas.length, 1)
  marcar('perfecto-3', perfectas.length >= 3, perfectas.length, 3)
  marcar('racha-5', racha >= 5, racha, 5)
  marcar('racha-10', racha >= 10, racha, 10)
  marcar('constante', dias.size >= 3, dias.size, 3)
  marcar('explorador', materias.size >= 4, materias.size, 4)
  marcar('matematico', buenas('Matemáticas') >= 3, buenas('Matemáticas'), 3)
  marcar('cientifico', buenas('Ciencias Naturales') >= 3, buenas('Ciencias Naturales'), 3)
  marcar('lector', buenas('Lenguaje') >= 3, buenas('Lenguaje'), 3)
  marcar('poliglota', buenas('Inglés') >= 3, buenas('Inglés'), 3)
  marcar('diez-tareas', lista.length >= 10, lista.length, 10)

  const rapido = lista.some((i) => i.total >= 3 && i.segundos > 0 && i.segundos / i.total < 15)
  marcar('veloz', rapido, rapido ? 1 : 0, 1)

  return LOGROS.map((logro) => ({
    ...logro,
    obtenido: obtenidos.has(logro.id),
    progreso: progreso[logro.id] || { actual: 0, meta: 1 },
  }))
}

/** Resumen del estudiante para su perfil. */
export function resumenEstudiante(intentos) {
  const lista = Array.isArray(intentos) ? intentos : []
  if (lista.length === 0) {
    return { tareas: 0, precision: 0, puntaje: 0, segundos: 0, porMateria: [] }
  }

  const porMateria = new Map()
  for (const i of lista) {
    const clave = i.materia || 'Sin materia'
    const actual = porMateria.get(clave) || { nombre: clave, tareas: 0, sumaPrecision: 0, puntaje: 0 }
    actual.tareas += 1
    actual.sumaPrecision += precisionDe(i)
    actual.puntaje += Number(i.puntaje) || 0
    porMateria.set(clave, actual)
  }

  return {
    tareas: lista.length,
    precision: Math.round((lista.reduce((s, i) => s + precisionDe(i), 0) / lista.length) * 100),
    puntaje: lista.reduce((s, i) => s + (Number(i.puntaje) || 0), 0),
    segundos: lista.reduce((s, i) => s + (Number(i.segundos) || 0), 0),
    porMateria: [...porMateria.values()]
      .map((m) => ({
        nombre: m.nombre,
        tareas: m.tareas,
        puntaje: m.puntaje,
        precision: Math.round((m.sumaPrecision / m.tareas) * 100),
      }))
      .sort((a, b) => b.tareas - a.tareas),
  }
}
