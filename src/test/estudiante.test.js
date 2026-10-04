// @vitest-environment node
/**
 * Pruebas de las cuentas de estudiante, el historial con logros,
 * los reportes comparativos y el modo clase en vivo.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const ARCHIVO = path.join(
  os.tmpdir(),
  `dqa-est-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
)
process.env.DB_PATH = ARCHIVO
process.env.CLAVE_PROFESOR = 'clave-profesor'

const { app } = await import('../../server/index.js')

let servidor
let base
let tokenProfe
let tokenEstudiante
let codigo
let tareaId

const pedir = async (ruta, { metodo = 'GET', cuerpo, token, tokenEst } = {}) => {
  const cabeceras = { 'Content-Type': 'application/json' }
  if (token) cabeceras['x-token-profe'] = token
  if (tokenEst) cabeceras['x-token-estudiante'] = tokenEst

  const respuesta = await fetch(base + ruta, {
    method: metodo,
    headers: cabeceras,
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  })
  let datos = null
  try {
    datos = await respuesta.json()
  } catch {
    /* sin cuerpo */
  }
  return { status: respuesta.status, datos }
}

const TAREA = {
  titulo: 'Repaso de fracciones',
  grado: '6',
  materia: 'Matemáticas',
  tema: 'Fracciones',
  profesor: 'Profe Cuentas',
  config: { tiempoPorPregunta: 0, vidas: 3, mezclar: false, mostrarExplicacion: true },
  preguntas: Array.from({ length: 5 }, (_, i) => ({
    id: `q${i + 1}`,
    tipo: 'multiple',
    enunciado: `Pregunta número ${i + 1}`,
    opciones: ['Correcta', 'Mal 1', 'Mal 2', 'Mal 3'],
    correcta: 0,
    explicacion: 'Porque sí.',
    puntos: 10,
  })),
}

beforeAll(async () => {
  await new Promise((resolver) => {
    servidor = app.listen(0, () => {
      base = `http://127.0.0.1:${servidor.address().port}`
      resolver()
    })
  })
  await pedir('/api/profesor/entrar', { metodo: 'POST', cuerpo: { clave: 'clave-profesor' } }).then(
    (r) => (tokenProfe = r.datos.token)
  )
  const creada = await pedir('/api/tareas', { metodo: 'POST', cuerpo: TAREA, token: tokenProfe })
  codigo = creada.datos.codigo
  tareaId = creada.datos.id
})

afterAll(async () => {
  await new Promise((resolver) => servidor.close(resolver))
  try {
    fs.unlinkSync(ARCHIVO)
  } catch {
    /* ignore */
  }
})

describe('Registro de estudiante', () => {
  it('rechaza un usuario con formato inválido', async () => {
    const { status } = await pedir('/api/estudiante/registro', {
      metodo: 'POST',
      cuerpo: { usuario: 'ab', clave: 'clave123', nombre: 'Ana' },
    })
    expect(status).toBe(400)
  })

  it('rechaza una contraseña corta', async () => {
    const { status } = await pedir('/api/estudiante/registro', {
      metodo: 'POST',
      cuerpo: { usuario: 'ana.lopez', clave: '12', nombre: 'Ana' },
    })
    expect(status).toBe(400)
  })

  it('rechaza el registro sin nombre', async () => {
    const { status } = await pedir('/api/estudiante/registro', {
      metodo: 'POST',
      cuerpo: { usuario: 'ana.lopez', clave: 'clave123', nombre: '' },
    })
    expect(status).toBe(400)
  })

  it('registra al estudiante y devuelve su token', async () => {
    const { status, datos } = await pedir('/api/estudiante/registro', {
      metodo: 'POST',
      cuerpo: { usuario: 'ana.lopez', clave: 'clave123', nombre: 'Ana López', grado: '6', avatar: '🦊' },
    })
    expect(status).toBe(201)
    expect(datos.token).toBeTruthy()
    expect(datos.estudiante.usuario).toBe('ana.lopez')
    expect(datos.estudiante.claveHash).toBeUndefined() // nunca se expone la contraseña
    tokenEstudiante = datos.token
  })

  it('no permite repetir el usuario', async () => {
    const { status } = await pedir('/api/estudiante/registro', {
      metodo: 'POST',
      cuerpo: { usuario: 'ana.lopez', clave: 'otraclave', nombre: 'Otra Ana' },
    })
    expect(status).toBe(409)
  })

  it('rechaza credenciales incorrectas al entrar', async () => {
    const { status } = await pedir('/api/estudiante/entrar', {
      metodo: 'POST',
      cuerpo: { usuario: 'ana.lopez', clave: 'equivocada' },
    })
    expect(status).toBe(401)
  })

  it('permite entrar con las credenciales correctas', async () => {
    const { status, datos } = await pedir('/api/estudiante/entrar', {
      metodo: 'POST',
      cuerpo: { usuario: 'ANA.LOPEZ', clave: 'clave123' }, // el usuario no distingue mayúsculas
    })
    expect(status).toBe(200)
    expect(datos.token).toBeTruthy()
    tokenEstudiante = datos.token
  })
})

describe('Historial y logros', () => {
  it('exige sesión para ver el perfil', async () => {
    const { status } = await pedir('/api/estudiante/perfil')
    expect(status).toBe(401)
  })

  it('guarda el intento usando el nombre real de la cuenta, no el que manda el cliente', async () => {
    const { status } = await pedir('/api/intentos', {
      metodo: 'POST',
      tokenEst: tokenEstudiante,
      cuerpo: {
        codigo,
        estudiante: 'Nombre Falso',
        avatar: '👿',
        puntaje: 50,
        segundos: 50,
        respuestas: Array.from({ length: 5 }, (_, i) => ({
          preguntaId: `q${i + 1}`,
          correcta: true,
          intento: 'Correcta',
          ms: 1000,
        })),
      },
    })
    expect(status).toBe(201)

    const resultados = await pedir(`/api/tareas/${codigo}/resultados`, { token: tokenProfe })
    const intento = resultados.datos.intentos[0]
    expect(intento.estudiante).toBe('Ana López')
    expect(intento.avatar).toBe('🦊')
  })

  it('devuelve resumen y logros del estudiante', async () => {
    const { status, datos } = await pedir('/api/estudiante/perfil', { tokenEst: tokenEstudiante })
    expect(status).toBe(200)
    expect(datos.estudiante.nombre).toBe('Ana López')
    expect(datos.intentos).toHaveLength(1)

    // El intento fue perfecto y con 5 aciertos seguidos.
    const logros = datos.logros.filter((l) => l.obtenido).map((l) => l.id)
    expect(logros).toContain('primer-paso')
    expect(logros).toContain('perfecto')
    expect(logros).toContain('racha-5')

    expect(datos.resumen.tareas).toBe(1)
    expect(datos.resumen.precision).toBe(100)
  })

  it('el historial incluye la materia y el título de la tarea', async () => {
    const { datos } = await pedir('/api/estudiante/perfil', { tokenEst: tokenEstudiante })
    expect(datos.intentos[0].materia).toBe('Matemáticas')
    expect(datos.intentos[0].titulo).toBe(TAREA.titulo)
    expect(datos.intentos[0].precision).toBe(100)
  })

  it('permite jugar sin cuenta (modo anónimo)', async () => {
    const { status } = await pedir('/api/intentos', {
      metodo: 'POST',
      cuerpo: {
        codigo,
        estudiante: 'Anónimo',
        avatar: '🐼',
        puntaje: 10,
        segundos: 30,
        respuestas: [{ preguntaId: 'q1', correcta: false, intento: 'Mal 1', ms: 2000 }],
      },
    })
    expect(status).toBe(201)

    const resultados = await pedir(`/api/tareas/${codigo}/resultados`, { token: tokenProfe })
    expect(resultados.datos.intentos.some((i) => i.estudiante === 'Anónimo')).toBe(true)
  })
})

describe('Reportes comparativos', () => {
  it('exige sesión de profesor', async () => {
    const { status } = await pedir('/api/profesor/reportes')
    expect(status).toBe(401)
  })

  it('agrupa por materia, grado, combinación y semana', async () => {
    const { status, datos } = await pedir('/api/profesor/reportes', { token: tokenProfe })
    expect(status).toBe(200)

    expect(datos.totales.intentos).toBe(2)
    expect(datos.totales.estudiantes).toBe(2)
    expect(datos.totales.estudiantesConCuenta).toBe(1)

    expect(datos.porMateria[0].nombre).toBe('Matemáticas')
    expect(datos.porMateria[0].intentos).toBe(2)
    expect(datos.porMateria[0].estudiantes).toBe(2)

    expect(datos.porGrado[0].nombre).toBe('6')
    expect(datos.porCombinacion[0].nombre).toBe('6° · Matemáticas')
    expect(datos.porSemana).toHaveLength(1)
    expect(datos.porSemana[0].intentos).toBe(2)

    // La lista de tareas viene ordenada de la que más se falla a la que menos.
    expect(datos.tareas).toHaveLength(1)
    expect(datos.tareas[0].codigo).toBe(codigo)
    expect(datos.tareas[0].preguntas).toHaveLength(5)
  })
})

describe('Modo clase en vivo', () => {
  it('exige sesión de profesor', async () => {
    const { status } = await pedir(`/api/tareas/${codigo}/en-vivo`)
    expect(status).toBe(401)
  })

  it('devuelve ranking ordenado por puntaje', async () => {
    const { status, datos } = await pedir(`/api/tareas/${codigo}/en-vivo`, { token: tokenProfe })
    expect(status).toBe(200)
    expect(datos.total).toBe(2)
    expect(datos.estudiantes).toBe(2)
    expect(datos.ranking[0].estudiante).toBe('Ana López') // 50 puntos
    expect(datos.ranking[0].puntaje).toBe(50)
    expect(datos.ranking[1].puntaje).toBe(10)
    expect(typeof datos.ahora).toBe('string')
  })

  it('marca como "nuevos" solo los intentos posteriores a la marca de tiempo', async () => {
    const primera = await pedir(`/api/tareas/${codigo}/en-vivo`, { token: tokenProfe })
    const marca = primera.datos.ahora

    // Todavía no hay nada nuevo.
    const sinNuevos = await pedir(
      `/api/tareas/${codigo}/en-vivo?desde=${encodeURIComponent(marca)}`,
      { token: tokenProfe }
    )
    expect(sinNuevos.datos.nuevos).toHaveLength(0)

    // Juega alguien más.
    await pedir('/api/intentos', {
      metodo: 'POST',
      cuerpo: {
        codigo,
        estudiante: 'Sofía',
        avatar: '🦄',
        puntaje: 99,
        segundos: 20,
        respuestas: [{ preguntaId: 'q1', correcta: true, intento: 'Correcta', ms: 900 }],
      },
    })

    const conNuevos = await pedir(
      `/api/tareas/${codigo}/en-vivo?desde=${encodeURIComponent(marca)}`,
      { token: tokenProfe }
    )
    expect(conNuevos.datos.nuevos).toHaveLength(1)
    expect(conNuevos.datos.nuevos[0].estudiante).toBe('Sofía')
    expect(conNuevos.datos.ranking[0].estudiante).toBe('Sofía') // 99 puntos, primero
    expect(conNuevos.datos.total).toBe(3)
  })
})
