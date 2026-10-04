import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import QRCode from 'qrcode'
import { calcularLogros, resumenEstudiante } from './logros.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const RAIZ = path.resolve(__dirname, '..')
const DIR_DATOS = path.join(__dirname, 'data')
const ARCHIVO_DB = process.env.DB_PATH || path.join(DIR_DATOS, 'db.json')
const DIR_DIST = path.join(RAIZ, 'dist')
const PUERTO = Number(process.env.PORT || 3000)

/** Clave inicial de los profesores (se puede cambiar desde el panel o con CLAVE_PROFESOR). */
const CLAVE_INICIAL = process.env.CLAVE_PROFESOR || 'dale2026'
/** Duración de la sesión del profesor (por defecto 7 días). */
const HORAS_SESION = Number(process.env.SESION_HORAS) > 0 ? Number(process.env.SESION_HORAS) : 7 * 24
const DURACION_SESION = HORAS_SESION * 60 * 60 * 1000

/* ------------------------------------------------------------------ *
 *  Almacenamiento: un archivo JSON con escritura segura (cola + rename)
 * ------------------------------------------------------------------ */
const ESTADO_VACIO = {
  config: null,
  sesiones: {},
  sesionesEstudiante: {},
  estudiantes: [],
  tareas: [],
  intentos: [],
}

const hashClave = (clave) => crypto.createHash('sha256').update(String(clave)).digest('hex')

function leerDb() {
  try {
    if (!fs.existsSync(ARCHIVO_DB)) return structuredClone(ESTADO_VACIO)
    const crudo = fs.readFileSync(ARCHIVO_DB, 'utf8')
    const datos = JSON.parse(crudo)
    return {
      config: datos.config && typeof datos.config === 'object' ? datos.config : null,
      sesiones: datos.sesiones && typeof datos.sesiones === 'object' ? datos.sesiones : {},
      sesionesEstudiante:
        datos.sesionesEstudiante && typeof datos.sesionesEstudiante === 'object'
          ? datos.sesionesEstudiante
          : {},
      estudiantes: Array.isArray(datos.estudiantes) ? datos.estudiantes : [],
      tareas: Array.isArray(datos.tareas) ? datos.tareas : [],
      intentos: Array.isArray(datos.intentos) ? datos.intentos : [],
    }
  } catch (err) {
    console.error('[db] No se pudo leer la base de datos, se inicia vacía:', err.message)
    return structuredClone(ESTADO_VACIO)
  }
}

let db = leerDb()
let colaEscritura = Promise.resolve()

function guardarDb() {
  colaEscritura = colaEscritura
    .then(async () => {
      await fs.promises.mkdir(DIR_DATOS, { recursive: true })
      const temporal = `${ARCHIVO_DB}.tmp`
      await fs.promises.writeFile(temporal, JSON.stringify(db, null, 2), 'utf8')
      await fs.promises.rename(temporal, ARCHIVO_DB)
    })
    .catch((err) => {
      console.error('[db] Error al guardar:', err.message)
    })
  return colaEscritura
}

if (!db.config) {
  db.config = { claveHash: hashClave(CLAVE_INICIAL) }
  guardarDb()
}

// Se descartan las sesiones de profesor que ya vencieron.
limpiarSesionesVencidas()

/* ------------------------------------------------------------------ *
 *  Utilidades
 * ------------------------------------------------------------------ */
const ALFABETO_CODIGO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sin O/0/I/1

function generarCodigo() {
  let codigo = ''
  do {
    codigo = ''
    for (let i = 0; i < 6; i++) {
      codigo += ALFABETO_CODIGO[Math.floor(Math.random() * ALFABETO_CODIGO.length)]
    }
  } while (db.tareas.some((t) => t.codigo === codigo))
  return codigo
}

const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

const limpiarTexto = (v, max = 400) =>
  String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max)

function direccionLan() {
  const redes = os.networkInterfaces()
  for (const nombre of Object.keys(redes)) {
    for (const red of redes[nombre] || []) {
      if (red.family === 'IPv4' && !red.internal) return red.address
    }
  }
  return 'localhost'
}

/** Precisión promedio (0-100) de una lista de intentos. */
function precisionDe(lista) {
  if (!lista.length) return 0
  return Math.round(
    (lista.reduce((s, i) => s + (i.total ? i.correctas / i.total : 0), 0) / lista.length) * 100
  )
}

/** Lunes de la semana a la que pertenece una fecha (YYYY-MM-DD). */
function semanaDe(fecha) {
  const d = new Date(fecha)
  if (Number.isNaN(d.getTime())) return ''
  const dia = (d.getUTCDay() + 6) % 7 // lunes = 0
  d.setUTCDate(d.getUTCDate() - dia)
  return d.toISOString().slice(0, 10)
}

/* ------------------------------------------------------------------ *
 *  Sesiones de profesor
 *
 *  Se guardan en el archivo de datos (no en memoria) para que sigan
 *  siendo válidas cuando el servidor se reinicia. Así el profesor no
 *  pierde la sesión cada vez que se apaga y se enciende el servidor.
 * ------------------------------------------------------------------ */
function limpiarSesionesVencidas() {
  const ahora = Date.now()
  let cambio = false
  for (const [token, expira] of Object.entries(db.sesiones)) {
    if (!expira || expira <= ahora) {
      delete db.sesiones[token]
      cambio = true
    }
  }
  if (cambio) guardarDb()
}

function crearSesion() {
  const token = crypto.randomBytes(24).toString('hex')
  db.sesiones[token] = Date.now() + DURACION_SESION
  limpiarSesionesVencidas()
  return token
}

function sesionValida(token) {
  if (!token) return false
  const expira = db.sesiones[token]
  if (!expira) return false
  if (expira <= Date.now()) {
    delete db.sesiones[token]
    guardarDb()
    return false
  }
  return true
}

/** Middleware: solo profesores con sesión activa. */
function soloProfesor(req, res, next) {
  const token = req.get('x-token-profe') || ''
  if (!sesionValida(token)) {
    return res.status(401).json({ error: 'Tu sesión de profesor expiró. Vuelve a entrar.' })
  }
  req.tokenProfe = token
  next()
}

/* ------------------------------------------------------------------ *
 *  Sesiones de estudiante
 * ------------------------------------------------------------------ */
const MAX_SESIONES_POR_ESTUDIANTE = 8

const publicoEstudiante = (e) => ({
  id: e.id,
  usuario: e.usuario,
  nombre: e.nombre,
  grado: e.grado,
  avatar: e.avatar,
  fecha: e.fecha,
})

function limpiarSesionesEstudianteVencidas() {
  const ahora = Date.now()
  let cambio = false
  for (const [token, sesion] of Object.entries(db.sesionesEstudiante)) {
    if (!sesion || !sesion.expira || sesion.expira <= ahora) {
      delete db.sesionesEstudiante[token]
      cambio = true
    }
  }
  if (cambio) guardarDb()
}

function crearSesionEstudiante(estudianteId) {
  const token = crypto.randomBytes(24).toString('hex')
  db.sesionesEstudiante[token] = { expira: Date.now() + DURACION_SESION, estudianteId }
  limpiarSesionesEstudianteVencidas()

  // Se conservan solo las sesiones más recientes de cada estudiante.
  const mias = Object.entries(db.sesionesEstudiante).filter(([, s]) => s.estudianteId === estudianteId)
  if (mias.length > MAX_SESIONES_POR_ESTUDIANTE) {
    mias.sort((a, b) => a[1].expira - b[1].expira)
    for (const [tokenViejo] of mias.slice(0, mias.length - MAX_SESIONES_POR_ESTUDIANTE)) {
      delete db.sesionesEstudiante[tokenViejo]
    }
  }
  return token
}

/** Devuelve el estudiante de la petición, o null si no hay sesión válida. */
function estudianteDePeticion(req) {
  const token = req.get('x-token-estudiante') || ''
  if (!token) return null
  const sesion = db.sesionesEstudiante[token]
  if (!sesion) return null
  if (sesion.expira <= Date.now()) {
    delete db.sesionesEstudiante[token]
    guardarDb()
    return null
  }
  return db.estudiantes.find((e) => e.id === sesion.estudianteId) || null
}

/** Middleware: exige sesión de estudiante. */
function soloEstudiante(req, res, next) {
  const estudiante = estudianteDePeticion(req)
  if (!estudiante) {
    return res.status(401).json({ error: 'Tu sesión de estudiante expiró. Vuelve a entrar.' })
  }
  req.estudiante = estudiante
  next()
}

/** Historial de un estudiante, con la información de cada tarea. */
function intentosDeEstudiante(estudianteId) {
  return db.intentos
    .filter((i) => i.estudianteId === estudianteId)
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
    .map((i) => {
      const tarea = db.tareas.find((t) => t.id === i.tareaId)
      return {
        id: i.id,
        codigo: i.codigo,
        puntaje: i.puntaje,
        correctas: i.correctas,
        total: i.total,
        segundos: i.segundos,
        fecha: i.fecha,
        respuestas: i.respuestas,
        materia: tarea?.materia || '',
        grado: tarea?.grado || '',
        tema: tarea?.tema || '',
        titulo: tarea?.titulo || '(tarea borrada)',
        precision: i.total ? Math.round((i.correctas / i.total) * 100) : 0,
      }
    })
}

/* ------------------------------------------------------------------ *
 *  Servidor
 * ------------------------------------------------------------------ */
const app = express()
export { app }
app.use(express.json({ limit: '2mb' }))

app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store')
  next()
})

app.get('/api/salud', (_req, res) => {
  res.json({ ok: true, version: 3, hora: new Date().toISOString() })
})

/* ---------------- Sesión de profesor ---------------- */

app.get('/api/profesor/sesion', soloProfesor, (req, res) => {
  res.json({ ok: true, expira: db.sesiones[req.tokenProfe] || null })
})

app.post('/api/profesor/entrar', async (req, res) => {
  const clave = limpiarTexto(req.body?.clave, 100)
  if (!clave) return res.status(400).json({ error: 'Escribe la clave de profesor.' })

  if (hashClave(clave) !== db.config.claveHash) {
    return res.status(401).json({ error: 'Clave incorrecta. Vuelve a intentarlo.' })
  }

  const token = crearSesion()
  await guardarDb()
  res.json({ token, expira: db.sesiones[token] })
})

app.post('/api/profesor/salir', async (req, res) => {
  const token = req.get('x-token-profe') || ''
  delete db.sesiones[token]
  await guardarDb()
  res.json({ ok: true })
})

app.post('/api/profesor/clave', soloProfesor, async (req, res) => {
  const actual = limpiarTexto(req.body?.actual, 100)
  const nueva = limpiarTexto(req.body?.nueva, 100)

  if (hashClave(actual) !== db.config.claveHash) {
    return res.status(401).json({ error: 'La clave actual no es correcta.' })
  }
  if (nueva.length < 4) {
    return res.status(400).json({ error: 'La nueva clave debe tener al menos 4 caracteres.' })
  }

  db.config.claveHash = hashClave(nueva)
  // Se cierran las demás sesiones por seguridad (la actual se conserva).
  const tokenActual = req.tokenProfe
  for (const t of Object.keys(db.sesiones)) {
    if (t !== tokenActual) delete db.sesiones[t]
  }

  await guardarDb()
  res.json({ ok: true })
})

/* ---------------- Cuentas de estudiante ---------------- */

const USUARIO_VALIDO = /^[a-zA-Z0-9._-]{3,20}$/

app.post('/api/estudiante/registro', async (req, res) => {
  const b = req.body || {}
  const usuario = limpiarTexto(b.usuario, 20).toLowerCase()
  const clave = limpiarTexto(b.clave, 100)
  const nombre = limpiarTexto(b.nombre, 60)
  const grado = limpiarTexto(b.grado, 3)
  const avatar = limpiarTexto(b.avatar, 8) || '🐯'

  if (!nombre) return res.status(400).json({ error: 'Escribe tu nombre.' })
  if (!USUARIO_VALIDO.test(usuario)) {
    return res.status(400).json({
      error: 'El usuario debe tener entre 3 y 20 caracteres: letras, números, punto, guion o guion bajo.',
    })
  }
  if (clave.length < 4) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres.' })
  }
  if (db.estudiantes.some((e) => e.usuario === usuario)) {
    return res.status(409).json({ error: 'Ese usuario ya está en uso. Elige otro.' })
  }

  const estudiante = {
    id: id(),
    usuario,
    nombre,
    grado,
    avatar,
    claveHash: hashClave(clave),
    fecha: new Date().toISOString(),
  }
  db.estudiantes.push(estudiante)

  const token = crearSesionEstudiante(estudiante.id)
  await guardarDb()
  res.status(201).json({ token, estudiante: publicoEstudiante(estudiante) })
})

app.post('/api/estudiante/entrar', async (req, res) => {
  const b = req.body || {}
  const usuario = limpiarTexto(b.usuario, 20).toLowerCase()
  const clave = limpiarTexto(b.clave, 100)

  const estudiante = db.estudiantes.find((e) => e.usuario === usuario)
  if (!estudiante || hashClave(clave) !== estudiante.claveHash) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' })
  }

  const token = crearSesionEstudiante(estudiante.id)
  await guardarDb()
  res.json({ token, estudiante: publicoEstudiante(estudiante) })
})

app.post('/api/estudiante/salir', async (req, res) => {
  delete db.sesionesEstudiante[req.get('x-token-estudiante') || '']
  await guardarDb()
  res.json({ ok: true })
})

app.get('/api/estudiante/perfil', soloEstudiante, (req, res) => {
  const intentos = intentosDeEstudiante(req.estudiante.id)
  res.json({
    estudiante: publicoEstudiante(req.estudiante),
    resumen: resumenEstudiante(intentos),
    logros: calcularLogros(intentos),
    intentos,
  })
})

app.put('/api/estudiante/perfil', soloEstudiante, async (req, res) => {
  const b = req.body || {}
  const nombre = limpiarTexto(b.nombre, 60)
  const grado = limpiarTexto(b.grado, 3)
  const avatar = limpiarTexto(b.avatar, 8)

  if (nombre) req.estudiante.nombre = nombre
  if (grado) req.estudiante.grado = grado
  if (avatar) req.estudiante.avatar = avatar

  await guardarDb()
  res.json({ estudiante: publicoEstudiante(req.estudiante) })
})

/* ---------------- Tareas (profesor) ---------------- */

app.post('/api/tareas', soloProfesor, async (req, res) => {
  const b = req.body || {}
  const preguntas = Array.isArray(b.preguntas) ? b.preguntas : []

  if (!limpiarTexto(b.titulo, 120)) {
    return res.status(400).json({ error: 'La tarea necesita un título.' })
  }
  if (preguntas.length === 0) {
    return res.status(400).json({ error: 'Agrega al menos una pregunta.' })
  }
  if (preguntas.length > 60) {
    return res.status(400).json({ error: 'Máximo 60 preguntas por tarea.' })
  }

  const tarea = {
    id: id(),
    codigo: generarCodigo(),
    titulo: limpiarTexto(b.titulo, 120),
    grado: limpiarTexto(b.grado, 20),
    materia: limpiarTexto(b.materia, 40),
    tema: limpiarTexto(b.tema, 80),
    profesor: limpiarTexto(b.profesor, 60) || 'Profesor(a)',
    fecha: new Date().toISOString(),
    config: {
      tiempoPorPregunta: Math.min(180, Math.max(0, Number(b.config?.tiempoPorPregunta) || 30)),
      vidas: Math.min(9, Math.max(1, Number(b.config?.vidas) || 3)),
      mezclar: b.config?.mezclar !== false,
      mostrarExplicacion: b.config?.mostrarExplicacion !== false,
    },
    preguntas: preguntas.map(normalizarPregunta).filter(Boolean),
  }

  if (tarea.preguntas.length === 0) {
    return res.status(400).json({ error: 'Las preguntas no tienen un formato válido.' })
  }

  db.tareas.push(tarea)
  await guardarDb()
  res.status(201).json({ id: tarea.id, codigo: tarea.codigo, titulo: tarea.titulo })
})

app.get('/api/tareas', soloProfesor, (req, res) => {
  const profesor = limpiarTexto(req.query.profesor, 60).toLowerCase()
  const tareas = db.tareas
    .filter((t) => !profesor || String(t.profesor).toLowerCase() === profesor)
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
    .map((t) => ({
      id: t.id,
      codigo: t.codigo,
      titulo: t.titulo,
      grado: t.grado,
      materia: t.materia,
      tema: t.tema,
      profesor: t.profesor,
      fecha: t.fecha,
      totalPreguntas: t.preguntas.length,
      totalIntentos: db.intentos.filter((i) => i.tareaId === t.id).length,
    }))
  res.json({ tareas })
})

app.delete('/api/tareas/:id', soloProfesor, async (req, res) => {
  const antes = db.tareas.length
  db.tareas = db.tareas.filter((t) => t.id !== req.params.id)
  if (db.tareas.length === antes) {
    return res.status(404).json({ error: 'Tarea no encontrada.' })
  }
  db.intentos = db.intentos.filter((i) => i.tareaId !== req.params.id)
  await guardarDb()
  res.json({ ok: true })
})

/* ---------------- Tarea por código (público: estudiantes) ---------------- */

app.get('/api/tareas/:codigo', (req, res) => {
  const codigo = limpiarTexto(req.params.codigo, 12).toUpperCase()
  const tarea = db.tareas.find((t) => t.codigo === codigo)
  if (!tarea) return res.status(404).json({ error: 'No existe una tarea con ese código.' })
  res.json({ tarea })
})

/* ---------------- Intento (público: estudiantes) ---------------- */

app.post('/api/intentos', async (req, res) => {
  const b = req.body || {}
  const tarea = db.tareas.find((t) => t.codigo === limpiarTexto(b.codigo, 12).toUpperCase())
  if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada.' })

  const respuestas = Array.isArray(b.respuestas) ? b.respuestas.slice(0, 60) : []
  const correctas = respuestas.filter((r) => r && r.correcta).length

  // Si el estudiante tiene cuenta, se usa su identidad real (no la que mande el cliente).
  const cuenta = estudianteDePeticion(req)

  const intento = {
    id: id(),
    tareaId: tarea.id,
    codigo: tarea.codigo,
    estudianteId: cuenta?.id || null,
    estudiante: cuenta ? cuenta.nombre : limpiarTexto(b.estudiante, 60) || 'Estudiante',
    avatar: cuenta ? cuenta.avatar : limpiarTexto(b.avatar, 8) || '🐯',
    puntaje: Math.max(0, Math.min(100000, Number(b.puntaje) || 0)),
    correctas,
    total: tarea.preguntas.length,
    segundos: Math.max(0, Math.round(Number(b.segundos) || 0)),
    respuestas: respuestas.map((r) => ({
      preguntaId: limpiarTexto(r?.preguntaId, 40),
      correcta: !!r?.correcta,
      intento: limpiarTexto(r?.intento, 200),
      ms: Math.max(0, Math.round(Number(r?.ms) || 0)),
    })),
    fecha: new Date().toISOString(),
  }

  db.intentos.push(intento)
  await guardarDb()
  res.status(201).json({ id: intento.id, puntaje: intento.puntaje, correctas, total: intento.total })
})

/* ---------------- Panel del profesor ---------------- */

app.get('/api/tareas/:codigo/resultados', soloProfesor, (req, res) => {
  const codigo = limpiarTexto(req.params.codigo, 12).toUpperCase()
  const tarea = db.tareas.find((t) => t.codigo === codigo)
  if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada.' })

  const intentos = db.intentos
    .filter((i) => i.tareaId === tarea.id)
    .sort((a, b) => b.puntaje - a.puntaje)

  const porPregunta = tarea.preguntas.map((p) => {
    const rel = intentos.map((i) => i.respuestas.find((r) => r.preguntaId === p.id)).filter(Boolean)
    const aciertos = rel.filter((r) => r.correcta).length
    return {
      preguntaId: p.id,
      enunciado: p.enunciado,
      tipo: p.tipo,
      respondida: rel.length,
      aciertos,
      porcentaje: rel.length ? Math.round((aciertos / rel.length) * 100) : 0,
    }
  })

  const estudiantes = new Set(intentos.map((i) => i.estudiante.toLowerCase()))

  res.json({
    tarea: {
      id: tarea.id,
      codigo: tarea.codigo,
      titulo: tarea.titulo,
      grado: tarea.grado,
      materia: tarea.materia,
      tema: tarea.tema,
      totalPreguntas: tarea.preguntas.length,
    },
    intentos,
    porPregunta,
    resumen: {
      totalIntentos: intentos.length,
      estudiantesUnicos: estudiantes.size,
      puntajePromedio: intentos.length
        ? Math.round(intentos.reduce((s, i) => s + i.puntaje, 0) / intentos.length)
        : 0,
      mejorPuntaje: intentos.length ? intentos[0].puntaje : 0,
      precisionPromedio: intentos.length ? precisionDe(intentos) : 0,
    },
  })
})

app.get('/api/profesor/resumen', soloProfesor, (_req, res) => {
  const intentos = db.intentos
  const estudiantes = new Set(intentos.map((i) => i.estudiante.toLowerCase()))

  const porMateria = agrupar(intentos, (i) => tarea(t => t.id === i.tareaId)?.materia || 'Sin materia')
  const porGrado = agrupar(intentos, (i) => tarea(t => t.id === i.tareaId)?.grado || 'Sin grado')

  const ultimos = [...intentos]
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
    .slice(0, 12)
    .map((i) => {
      const t = tarea((x) => x.id === i.tareaId)
      return {
        id: i.id,
        estudiante: i.estudiante,
        avatar: i.avatar,
        puntaje: i.puntaje,
        correctas: i.correctas,
        total: i.total,
        precision: i.total ? Math.round((i.correctas / i.total) * 100) : 0,
        fecha: i.fecha,
        tarea: t ? { codigo: t.codigo, titulo: t.titulo, grado: t.grado, materia: t.materia } : null,
      }
    })

  // Intentos agrupados por día (últimos 7 días con actividad).
  const porDia = {}
  for (const i of intentos) {
    const dia = i.fecha.slice(0, 10)
    porDia[dia] = (porDia[dia] || 0) + 1
  }
  const dias = Object.entries(porDia)
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 7)
    .reverse()
    .map(([dia, total]) => ({ dia, total }))

  res.json({
    totalTareas: db.tareas.length,
    totalIntentos: intentos.length,
    estudiantesUnicos: estudiantes.size,
    puntajePromedio: intentos.length
      ? Math.round(intentos.reduce((s, i) => s + i.puntaje, 0) / intentos.length)
      : 0,
    precisionPromedio: intentos.length ? precisionDe(intentos) : 0,
    porMateria,
    porGrado,
    porDia: dias,
    ultimos,
  })

  function tarea(predicado) {
    return db.tareas.find(predicado)
  }

  function agrupar(lista, clave) {
    const mapa = new Map()
    for (const i of lista) {
      const k = String(clave(i))
      if (!mapa.has(k)) mapa.set(k, [])
      mapa.get(k).push(i)
    }
    return [...mapa.entries()]
      .map(([nombre, items]) => ({
        nombre,
        intentos: items.length,
        precision: precisionDe(items),
        puntajePromedio: Math.round(items.reduce((s, i) => s + i.puntaje, 0) / items.length),
      }))
      .sort((a, b) => b.intentos - a.intentos)
  }
})

/* ---------------- Reportes comparativos ---------------- */

app.get('/api/profesor/reportes', soloProfesor, (_req, res) => {
  const conTarea = db.intentos.map((i) => ({
    ...i,
    tarea: db.tareas.find((t) => t.id === i.tareaId) || null,
  }))

  const agrupar = (clave) => {
    const mapa = new Map()
    for (const i of conTarea) {
      const k = String(clave(i) || 'Sin dato')
      if (!mapa.has(k)) mapa.set(k, [])
      mapa.get(k).push(i)
    }
    return [...mapa.entries()]
      .map(([nombre, lista]) => ({
        nombre,
        intentos: lista.length,
        estudiantes: new Set(lista.map((i) => String(i.estudiante).toLowerCase())).size,
        precision: precisionDe(lista),
        puntajePromedio: Math.round(lista.reduce((s, i) => s + i.puntaje, 0) / lista.length),
      }))
      .sort((a, b) => b.intentos - a.intentos)
  }

  // Evolución por semana (las últimas 8 con actividad).
  const semanaMapa = new Map()
  for (const i of conTarea) {
    const semana = semanaDe(i.fecha)
    if (!semana) continue
    if (!semanaMapa.has(semana)) semanaMapa.set(semana, [])
    semanaMapa.get(semana).push(i)
  }
  const porSemana = [...semanaMapa.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(-8)
    .map(([semana, lista]) => ({
      semana,
      intentos: lista.length,
      precision: precisionDe(lista),
    }))

  // Detalle por tarea, para encontrar lo que más se falla.
  const tareas = db.tareas
    .map((t) => {
      const lista = conTarea.filter((i) => i.tareaId === t.id)
      const preguntas = t.preguntas.map((p) => {
        const rel = lista
          .map((i) => (i.respuestas || []).find((r) => r.preguntaId === p.id))
          .filter(Boolean)
        const aciertos = rel.filter((r) => r.correcta).length
        return {
          enunciado: p.enunciado,
          tipo: p.tipo,
          respondida: rel.length,
          porcentaje: rel.length ? Math.round((aciertos / rel.length) * 100) : 0,
        }
      })
      return {
        codigo: t.codigo,
        titulo: t.titulo,
        grado: t.grado,
        materia: t.materia,
        tema: t.tema,
        intentos: lista.length,
        estudiantes: new Set(lista.map((i) => String(i.estudiante).toLowerCase())).size,
        precision: lista.length ? precisionDe(lista) : 0,
        puntajePromedio: lista.length ? Math.round(lista.reduce((s, i) => s + i.puntaje, 0) / lista.length) : 0,
        preguntas,
      }
    })
    .filter((t) => t.intentos > 0)

  res.json({
    totales: {
      tareas: db.tareas.length,
      intentos: conTarea.length,
      estudiantes: new Set(conTarea.map((i) => String(i.estudiante).toLowerCase())).size,
      estudiantesConCuenta: new Set(conTarea.map((i) => i.estudianteId).filter(Boolean)).size,
      precision: precisionDe(conTarea),
      puntajePromedio: conTarea.length
        ? Math.round(conTarea.reduce((s, i) => s + i.puntaje, 0) / conTarea.length)
        : 0,
    },
    porMateria: agrupar((i) => i.tarea?.materia),
    porGrado: agrupar((i) => i.tarea?.grado),
    porCombinacion: agrupar((i) => (i.tarea ? `${i.tarea.grado}° · ${i.tarea.materia}` : null)),
    porSemana,
    tareas: tareas.sort((a, b) => a.precision - b.precision),
  })
})

/* ---------------- Modo clase en vivo ---------------- */

app.get('/api/tareas/:codigo/en-vivo', soloProfesor, (req, res) => {
  const codigo = limpiarTexto(req.params.codigo, 12).toUpperCase()
  const tarea = db.tareas.find((t) => t.codigo === codigo)
  if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada.' })

  const todos = db.intentos.filter((i) => i.tareaId === tarea.id)
  const desde = limpiarTexto(req.query.desde, 40)

  const resumir = (i) => ({
    id: i.id,
    estudiante: i.estudiante,
    avatar: i.avatar,
    puntaje: i.puntaje,
    correctas: i.correctas,
    total: i.total,
    segundos: i.segundos,
    precision: i.total ? Math.round((i.correctas / i.total) * 100) : 0,
    fecha: i.fecha,
  })

  res.json({
    tarea: {
      codigo: tarea.codigo,
      titulo: tarea.titulo,
      grado: tarea.grado,
      materia: tarea.materia,
      tema: tarea.tema,
      totalPreguntas: tarea.preguntas.length,
    },
    total: todos.length,
    estudiantes: new Set(todos.map((i) => String(i.estudiante).toLowerCase())).size,
    precision: precisionDe(todos),
    puntajePromedio: todos.length
      ? Math.round(todos.reduce((s, i) => s + i.puntaje, 0) / todos.length)
      : 0,
    ranking: [...todos]
      .sort((a, b) => b.puntaje - a.puntaje || (a.segundos || 0) - (b.segundos || 0))
      .slice(0, 30)
      .map(resumir),
    nuevos: (desde ? todos.filter((i) => i.fecha > desde) : []).map(resumir),
    ahora: new Date().toISOString(),
  })
})

/* ------------------------------------------------------------------ *
 *  Normalización de preguntas
 * ------------------------------------------------------------------ */
function normalizarPregunta(p) {
  if (!p || typeof p !== 'object') return null
  const enunciado = limpiarTexto(p.enunciado, 500)
  if (!enunciado) return null
  const base = {
    id: limpiarTexto(p.id, 40) || id(),
    tipo: p.tipo,
    enunciado,
    explicacion: limpiarTexto(p.explicacion, 600),
    puntos: Math.min(50, Math.max(1, Number(p.puntos) || 10)),
  }

  switch (p.tipo) {
    case 'multiple': {
      const opciones = (Array.isArray(p.opciones) ? p.opciones : []).map((o) => limpiarTexto(o, 200)).filter(Boolean)
      if (opciones.length < 2) return null
      const correcta = Number(p.correcta)
      if (!Number.isInteger(correcta) || correcta < 0 || correcta >= opciones.length) return null
      return { ...base, opciones, correcta }
    }
    case 'boolean': {
      if (typeof p.correcta !== 'boolean') return null
      return { ...base, correcta: p.correcta }
    }
    case 'emparejar': {
      const pares = (Array.isArray(p.pares) ? p.pares : [])
        .map((x) => ({ izq: limpiarTexto(x?.izq, 120), der: limpiarTexto(x?.der, 120) }))
        .filter((x) => x.izq && x.der)
      if (pares.length < 2 || pares.length > 6) return null
      return { ...base, pares }
    }
    case 'ordenar': {
      const secuencia = (Array.isArray(p.secuencia) ? p.secuencia : []).map((s) => limpiarTexto(s, 120)).filter(Boolean)
      if (secuencia.length < 3 || secuencia.length > 8) return null
      return { ...base, secuencia }
    }
    case 'corta': {
      const respuestas = (Array.isArray(p.respuestas) ? p.respuestas : [limpiarTexto(p.respuesta, 120)])
        .map((s) => limpiarTexto(s, 120))
        .filter(Boolean)
      if (respuestas.length === 0) return null
      return { ...base, respuestas }
    }
    default:
      return null
  }
}

/* ------------------------------------------------------------------ *
 *  Frontend compilado (modo aula) + fallback SPA
 * ------------------------------------------------------------------ */
if (fs.existsSync(DIR_DIST)) {
  app.use(express.static(DIR_DIST))
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(DIR_DIST, 'index.html'))
  })
} else {
  app.get('/', (_req, res) => {
    res
      .status(200)
      .type('html')
      .send(
        '<h1>¡Dale Que Aprendes!</h1><p>El frontend aún no está compilado. Ejecuta <code>npm run build</code> (modo aula) o <code>npm run dev</code> (desarrollo).</p>'
      )
  })
}

app.use((err, _req, res, _next) => {
  console.error('[api] Error:', err)
  res.status(500).json({ error: 'Error interno del servidor.' })
})

export function iniciar() {
  const servidor = app.listen(PUERTO, () => {
    const ip = direccionLan()
    const url = `http://${ip}:${PUERTO}`
    console.log('\n  ╔══════════════════════════════════════════════╗')
    console.log('  ║        ¡DALE QUE APRENDES!  🎈               ║')
    console.log('  ╚══════════════════════════════════════════════╝\n')
    console.log(`  Servidor listo en:  http://localhost:${PUERTO}`)
    console.log(`  En la red del colegio:  ${url}\n`)
    if (db.config.claveHash === hashClave(CLAVE_INICIAL)) {
      console.log(`  👩‍🏫 Clave de profesores:  ${CLAVE_INICIAL}`)
      console.log('     (cámbiala desde el panel del profesor)\n')
    } else {
      console.log('  👩‍🏫 Clave de profesores: la que definiste en el panel\n')
    }
    if (!fs.existsSync(DIR_DIST)) {
      console.log('  (Sin frontend compilado: usa "npm run dev" para desarrollo)\n')
    }
    QRCode.toString(url, { type: 'terminal', small: true }, (err, qr) => {
      if (!err) {
        console.log('  Escanea para entrar desde el celular:\n')
        console.log(qr)
      }
    })
  })

  // Mensaje amigable si el puerto ya está ocupado, en lugar de un volcado de error.
  servidor.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error('\n  ⚠️  El puerto ' + PUERTO + ' ya está ocupado.')
      console.error('     Seguramente el servidor ya está encendido en otra ventana.')
      console.error('     Si ya lo tenías abierto, solo entra a:  http://localhost:' + PUERTO)
      console.error('\n     Para encender otro en un puerto distinto:')
      console.error('        $env:PORT=3001; npm start\n')
      process.exit(1)
    }
    if (err.code === 'EACCES') {
      console.error('\n  ⚠️  No hay permiso para usar el puerto ' + PUERTO + '.')
      console.error('     Prueba con otro puerto:  $env:PORT=3001; npm start\n')
      process.exit(1)
    }
    throw err
  })

  return servidor
}

// Solo se enciende cuando se ejecuta directamente (node server/index.js),
// no cuando se importa desde las pruebas.
const ejecutadoDirectamente =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (ejecutadoDirectamente) iniciar()
