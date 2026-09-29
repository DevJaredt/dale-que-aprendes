/** Cliente de la API del servidor. */

const CLAVE_TOKEN = 'dqa_profe_token'

let tokenProfe = null

export function getTokenProfe() {
  if (tokenProfe) return tokenProfe
  try {
    tokenProfe = localStorage.getItem(CLAVE_TOKEN) || null
  } catch {
    tokenProfe = null
  }
  return tokenProfe
}

export function setTokenProfe(token) {
  tokenProfe = token || null
  try {
    if (token) localStorage.setItem(CLAVE_TOKEN, token)
    else localStorage.removeItem(CLAVE_TOKEN)
  } catch {
    /* localStorage no disponible */
  }
}

async function pedir(ruta, opciones = {}) {
  const cabeceras = { 'Content-Type': 'application/json', ...(opciones.headers || {}) }
  const token = getTokenProfe()
  if (token) cabeceras['x-token-profe'] = token

  const respuesta = await fetch(`/api${ruta}`, { ...opciones, headers: cabeceras })

  let datos = null
  try {
    datos = await respuesta.json()
  } catch {
    /* respuesta sin cuerpo */
  }

  if (!respuesta.ok) {
    // Si la sesión del profesor caducó, se limpia para que vuelva a entrar.
    if (respuesta.status === 401) setTokenProfe(null)
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
    pedir('/profesor/entrar', { method: 'POST', body: JSON.stringify({ clave }) }),

  validarSesion: () => pedir('/profesor/sesion'),

  salirProfesor: async () => {
    try {
      await pedir('/profesor/salir', { method: 'POST' })
    } catch {
      /* aunque falle, se cierra la sesión local */
    }
    setTokenProfe(null)
  },

  cambiarClave: (actual, nueva) =>
    pedir('/profesor/clave', { method: 'POST', body: JSON.stringify({ actual, nueva }) }),

  resumen: () => pedir('/profesor/resumen'),

  /* ---- Tareas ---- */
  crearTarea: (tarea) => pedir('/tareas', { method: 'POST', body: JSON.stringify(tarea) }),

  listarTareas: (profesor) => pedir(`/tareas?profesor=${encodeURIComponent(profesor || '')}`),

  borrarTarea: (id) => pedir(`/tareas/${id}`, { method: 'DELETE' }),

  resultados: (codigo) => pedir(`/tareas/${encodeURIComponent(codigo)}/resultados`),

  /* ---- Público (estudiantes) ---- */
  obtenerTarea: (codigo) => pedir(`/tareas/${encodeURIComponent(codigo)}`),

  guardarIntento: (intento) =>
    pedir('/intentos', { method: 'POST', body: JSON.stringify(intento) }),
}

export const esErrorDeSesion = (error) => error?.status === 401
