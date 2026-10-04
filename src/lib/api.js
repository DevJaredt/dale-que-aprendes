/** Cliente de la API del servidor. */

const CLAVE_TOKEN_PROFE = 'dqa_profe_token'
const CLAVE_TOKEN_EST = 'dqa_estudiante_token'

let tokenProfe = null
let tokenEstudiante = null
let cacheEstudiante = null

function leerStorage(clave) {
  try {
    return localStorage.getItem(clave) || null
  } catch {
    return null
  }
}

function escribirStorage(clave, valor) {
  try {
    if (valor) localStorage.setItem(clave, valor)
    else localStorage.removeItem(clave)
  } catch {
    /* localStorage no disponible */
  }
}

/* -------------------- Sesión de profesor -------------------- */

export function getTokenProfe() {
  if (!tokenProfe) tokenProfe = leerStorage(CLAVE_TOKEN_PROFE)
  return tokenProfe
}

export function setTokenProfe(token) {
  tokenProfe = token || null
  escribirStorage(CLAVE_TOKEN_PROFE, tokenProfe)
}

/* -------------------- Sesión de estudiante -------------------- */

export function getTokenEstudiante() {
  if (!tokenEstudiante) tokenEstudiante = leerStorage(CLAVE_TOKEN_EST)
  return tokenEstudiante
}

export function setTokenEstudiante(token) {
  tokenEstudiante = token || null
  escribirStorage(CLAVE_TOKEN_EST, tokenEstudiante)
  if (!token) cacheEstudiante = null
}

/** Datos básicos del estudiante guardados localmente (para pintar sin pedir al servidor). */
export function getEstudianteLocal() {
  if (cacheEstudiante) return cacheEstudiante
  try {
    cacheEstudiante = JSON.parse(localStorage.getItem('dqa_estudiante') || 'null')
  } catch {
    cacheEstudiante = null
  }
  return cacheEstudiante
}

export function setEstudianteLocal(estudiante) {
  cacheEstudiante = estudiante || null
  try {
    if (estudiante) localStorage.setItem('dqa_estudiante', JSON.stringify(estudiante))
    else localStorage.removeItem('dqa_estudiante')
  } catch {
    /* ignore */
  }
}

/* -------------------- Peticiones -------------------- */

async function pedir(ruta, { rol, ...opciones } = {}) {
  const cabeceras = { 'Content-Type': 'application/json', ...(opciones.headers || {}) }
  const profe = getTokenProfe()
  const estudiante = getTokenEstudiante()
  if (profe) cabeceras['x-token-profe'] = profe
  if (estudiante) cabeceras['x-token-estudiante'] = estudiante

  const respuesta = await fetch(`/api${ruta}`, { ...opciones, headers: cabeceras })

  let datos = null
  try {
    datos = await respuesta.json()
  } catch {
    /* respuesta sin cuerpo */
  }

  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      // Solo se cierra la sesión que corresponde.
      if (rol === 'estudiante') {
        setTokenEstudiante(null)
        setEstudianteLocal(null)
      } else if (rol !== null) {
        setTokenProfe(null)
      }
    }
    const error = new Error(datos?.error || `Error del servidor (${respuesta.status})`)
    error.status = respuesta.status
    throw error
  }
  return datos
}

export const api = {
  salud: () => pedir('/salud'),

  /* ---- Sesión de profesor ---- */
  entrarProfesor: (clave) =>
    pedir('/profesor/entrar', { method: 'POST', rol: null, body: JSON.stringify({ clave }) }),

  validarSesion: () => pedir('/profesor/sesion', { rol: 'profe' }),

  salirProfesor: async () => {
    try {
      await pedir('/profesor/salir', { method: 'POST', rol: 'profe' })
    } catch {
      /* aunque falle, se cierra la sesión local */
    }
    setTokenProfe(null)
  },

  cambiarClave: (actual, nueva) =>
    pedir('/profesor/clave', { method: 'POST', rol: 'profe', body: JSON.stringify({ actual, nueva }) }),

  resumen: () => pedir('/profesor/resumen', { rol: 'profe' }),

  reportes: () => pedir('/profesor/reportes', { rol: 'profe' }),

  /* ---- Cuentas de estudiante ---- */
  registrarEstudiante: (datos) =>
    pedir('/estudiante/registro', { method: 'POST', rol: 'estudiante', body: JSON.stringify(datos) }),

  entrarEstudiante: (usuario, clave) =>
    pedir('/estudiante/entrar', {
      method: 'POST',
      rol: 'estudiante',
      body: JSON.stringify({ usuario, clave }),
    }),

  salirEstudiante: async () => {
    try {
      await pedir('/estudiante/salir', { method: 'POST', rol: 'estudiante' })
    } catch {
      /* ignore */
    }
    setTokenEstudiante(null)
    setEstudianteLocal(null)
  },

  perfilEstudiante: () => pedir('/estudiante/perfil', { rol: 'estudiante' }),

  actualizarPerfilEstudiante: (datos) =>
    pedir('/estudiante/perfil', { method: 'PUT', rol: 'estudiante', body: JSON.stringify(datos) }),

  /* ---- Tareas ---- */
  crearTarea: (tarea) =>
    pedir('/tareas', { method: 'POST', rol: 'profe', body: JSON.stringify(tarea) }),

  listarTareas: (profesor) =>
    pedir(`/tareas?profesor=${encodeURIComponent(profesor || '')}`, { rol: 'profe' }),

  borrarTarea: (id) => pedir(`/tareas/${id}`, { method: 'DELETE', rol: 'profe' }),

  resultados: (codigo) => pedir(`/tareas/${encodeURIComponent(codigo)}/resultados`, { rol: 'profe' }),

  enVivo: (codigo, desde) =>
    pedir(
      `/tareas/${encodeURIComponent(codigo)}/en-vivo${desde ? `?desde=${encodeURIComponent(desde)}` : ''}`,
      { rol: 'profe' }
    ),

  /* ---- Público (estudiantes) ---- */
  obtenerTarea: (codigo) => pedir(`/tareas/${encodeURIComponent(codigo)}`, { rol: null }),

  guardarIntento: (intento) =>
    pedir('/intentos', { method: 'POST', rol: null, body: JSON.stringify(intento) }),
}

export const esErrorDeSesion = (error) => error?.status === 401
