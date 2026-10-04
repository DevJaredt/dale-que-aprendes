/** Funciones auxiliares compartidas por la interfaz. */

/** Quita tildes, pasa a minúsculas y limpia espacios/signos para comparar respuestas. */
export function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,;:¡!¿?"'`´()]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** ¿La respuesta del estudiante coincide con alguna de las aceptadas? */
export function respuestaCortaCorrecta(intento, aceptadas = []) {
  const a = normalizar(intento)
  if (!a) return false
  return aceptadas.some((r) => {
    const b = normalizar(r)
    if (a === b) return true
    // Permite respuestas como "5 m/s" o "5m/s" cuando se acepta "5".
    return b.length <= 3 && /^\d+$/.test(b) && a.replace(/[^\d]/g, '') === b
  })
}

/** Baraja una copia del arreglo (Fisher–Yates). */
export function mezclar(arreglo) {
  const copia = [...arreglo]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

/** Formatea segundos como m:ss. */
export function formatearTiempo(segundos) {
  const s = Math.max(0, Math.round(segundos))
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

/** Une clases CSS ignorando valores falsy. */
export function cx(...clases) {
  return clases.filter(Boolean).join(' ')
}

/** Estrellas (1 a 3) según el porcentaje de acierto. */
export function estrellas(precision) {
  if (precision >= 90) return 3
  if (precision >= 60) return 2
  if (precision > 0) return 1
  return 0
}

/** Mensaje motivador según el resultado. */
export function mensajeFinal(precision) {
  if (precision >= 90) return '¡Excelente! Dominas el tema. 🌟'
  if (precision >= 70) return '¡Muy bien! Estás muy cerca de la perfección. 💪'
  if (precision >= 50) return '¡Buen trabajo! Repasa lo que falló y vuelve a intentarlo. 📚'
  if (precision > 0) return '¡No te rindas! Cada intento te hace aprender más. 🚀'
  return 'Vamos a repasar el tema y lo intentas de nuevo. ¡Tú puedes! 💛'
}

/** Genera un id único simple en el navegador. */
export function nuevoId(prefijo = 'id') {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

/** Texto legible con la respuesta correcta de una pregunta (para el repaso). */
export function respuestaCorrectaTexto(pregunta) {
  switch (pregunta.tipo) {
    case 'multiple':
      return pregunta.opciones[pregunta.correcta]
    case 'boolean':
      return pregunta.correcta ? 'Verdadero' : 'Falso'
    case 'emparejar':
      return pregunta.pares.map((p) => `${p.izq} → ${p.der}`).join(' · ')
    case 'ordenar':
      return pregunta.secuencia.join(' → ')
    case 'corta':
      return pregunta.respuestas.join(' o ')
    default:
      return ''
  }
}

/**
 * Copia texto al portapapeles.
 * Usa la API moderna y, si no está disponible (por ejemplo en HTTP por red local),
 * recurre al método clásico con un textarea temporal.
 */
export async function copiarTexto(texto) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto)
      return true
    }
  } catch {
    /* continúa con el método clásico */
  }
  try {
    const area = document.createElement('textarea')
    area.value = texto
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.top = '-1000px'
    document.body.appendChild(area)
    area.select()
    area.setSelectionRange(0, texto.length)
    const ok = document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}

/** Avatares disponibles para estudiantes y profesores. */
export const AVATARES = ['🐯', '🦊', '🐼', '🐨', '🦁', '🐸', '🐵', '🦄', '🐶', '🐱', '🐢', '🦉', '🐙', '🦖']

/** Etiqueta legible de un tipo de pregunta. */
export const ETIQUETA_TIPO = {
  multiple: 'Opción múltiple',
  boolean: 'Verdadero / Falso',
  emparejar: 'Emparejar',
  ordenar: 'Ordenar',
  corta: 'Respuesta corta',
}
