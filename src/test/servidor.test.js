// @vitest-environment node
/**
 * Pruebas de la API del servidor.
 * Verifican el control de acceso de profesores, la creación de tareas,
 * el flujo público del estudiante y el dashboard de resultados.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// Se usa una base de datos temporal para no tocar la del colegio.
const ARCHIVO = path.join(
  os.tmpdir(),
  `dqa-prueba-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
)
process.env.DB_PATH = ARCHIVO
process.env.CLAVE_PROFESOR = 'clave-de-prueba'

const { app } = await import('../../server/index.js')

let servidor
let base
let token
let codigo

const pedir = async (ruta, opciones = {}) => {
  const respuesta = await fetch(base + ruta, {
    ...opciones,
    headers: { 'Content-Type': 'application/json', ...(opciones.headers || {}) },
  })
  let datos = null
  try {
    datos = await respuesta.json()
  } catch {
    /* sin cuerpo */
  }
  return { status: respuesta.status, datos }
}

const conToken = () => ({ 'x-token-profe': token })

const TAREA_EJEMPLO = {
  titulo: 'Repaso de proporciones',
  grado: '7',
  materia: 'Matemáticas',
  tema: 'Proporciones',
  profesor: 'Profe Prueba',
  config: { tiempoPorPregunta: 0, vidas: 3, mezclar: false, mostrarExplicacion: true },
  preguntas: [
    { id: 'a1', tipo: 'multiple', enunciado: '¿Cuál es el MCD de 12 y 18?', opciones: ['2', '3', '6', '36'], correcta: 2, explicacion: 'El 6.', puntos: 10 },
    { id: 'a2', tipo: 'boolean', enunciado: '1/2 es mayor que 2/3.', correcta: false, explicacion: 'Es menor.', puntos: 10 },
  ],
}

beforeAll(async () => {
  await new Promise((resolver) => {
    servidor = app.listen(0, () => {
      base = `http://127.0.0.1:${servidor.address().port}`
      resolver()
    })
  })
})

afterAll(async () => {
  await new Promise((resolver) => servidor.close(resolver))
  try {
    fs.unlinkSync(ARCHIVO)
  } catch {
    /* ignore */
  }
})

describe('Salud y control de acceso', () => {
  it('responde el estado del servidor', async () => {
    const { status, datos } = await pedir('/api/salud')
    expect(status).toBe(200)
    expect(datos.ok).toBe(true)
  })

  it('rechaza crear tareas sin sesión de profesor', async () => {
    const { status } = await pedir('/api/tareas', {
      method: 'POST',
      body: JSON.stringify(TAREA_EJEMPLO),
    })
    expect(status).toBe(401)
  })

  it('rechaza listar tareas sin sesión de profesor', async () => {
    const { status } = await pedir('/api/tareas')
    expect(status).toBe(401)
  })

  it('rechaza una clave incorrecta', async () => {
    const { status } = await pedir('/api/profesor/entrar', {
      method: 'POST',
      body: JSON.stringify({ clave: 'no-es-la-clave' }),
    })
    expect(status).toBe(401)
  })

  it('acepta la clave correcta y devuelve un token', async () => {
    const { status, datos } = await pedir('/api/profesor/entrar', {
      method: 'POST',
      body: JSON.stringify({ clave: 'clave-de-prueba' }),
    })
    expect(status).toBe(200)
    expect(typeof datos.token).toBe('string')
    expect(datos.token.length).toBeGreaterThan(20)
    token = datos.token
  })

  it('valida la sesión con el token', async () => {
    const { status } = await pedir('/api/profesor/sesion', { headers: conToken() })
    expect(status).toBe(200)
  })
})

describe('Tareas y flujo del estudiante', () => {
  it('rechaza una tarea sin preguntas', async () => {
    const { status } = await pedir('/api/tareas', {
      method: 'POST',
      headers: conToken(),
      body: JSON.stringify({ ...TAREA_EJEMPLO, preguntas: [] }),
    })
    expect(status).toBe(400)
  })

  it('crea una tarea con el profesor autenticado', async () => {
    const { status, datos } = await pedir('/api/tareas', {
      method: 'POST',
      headers: conToken(),
      body: JSON.stringify(TAREA_EJEMPLO),
    })
    expect(status).toBe(201)
    expect(datos.codigo).toMatch(/^[A-Z0-9]{6}$/)
    codigo = datos.codigo
  })

  it('permite al estudiante obtener la tarea por código (sin sesión)', async () => {
    const { status, datos } = await pedir(`/api/tareas/${codigo}`)
    expect(status).toBe(200)
    expect(datos.tarea.titulo).toBe(TAREA_EJEMPLO.titulo)
    expect(datos.tarea.preguntas).toHaveLength(2)
  })

  it('devuelve 404 con un código inexistente', async () => {
    const { status } = await pedir('/api/tareas/ZZZZZZ')
    expect(status).toBe(404)
  })

  it('guarda el intento del estudiante (sin sesión)', async () => {
    const { status } = await pedir('/api/intentos', {
      method: 'POST',
      body: JSON.stringify({
        codigo,
        estudiante: 'Ana',
        avatar: '🦊',
        puntaje: 30,
        segundos: 40,
        respuestas: [
          { preguntaId: 'a1', correcta: true, intento: '6', ms: 5000 },
          { preguntaId: 'a2', correcta: false, intento: 'Verdadero', ms: 7000 },
        ],
      }),
    })
    expect(status).toBe(201)
  })
})

describe('Dashboard del profesor', () => {
  it('protege los resultados de la tarea', async () => {
    const { status } = await pedir(`/api/tareas/${codigo}/resultados`)
    expect(status).toBe(401)
  })

  it('devuelve los resultados con resumen y porcentajes', async () => {
    const { status, datos } = await pedir(`/api/tareas/${codigo}/resultados`, { headers: conToken() })
    expect(status).toBe(200)
    expect(datos.resumen.totalIntentos).toBe(1)
    expect(datos.resumen.estudiantesUnicos).toBe(1)
    expect(datos.resumen.precisionPromedio).toBe(50)
    expect(datos.porPregunta).toHaveLength(2)
    expect(datos.porPregunta[0].porcentaje).toBe(100)
    expect(datos.porPregunta[1].porcentaje).toBe(0)
  })

  it('devuelve el resumen general con desglose por materia y grado', async () => {
    const { status, datos } = await pedir('/api/profesor/resumen', { headers: conToken() })
    expect(status).toBe(200)
    expect(datos.totalTareas).toBe(1)
    expect(datos.totalIntentos).toBe(1)
    expect(datos.estudiantesUnicos).toBe(1)
    expect(datos.porMateria[0].nombre).toBe('Matemáticas')
    expect(datos.porGrado[0].nombre).toBe('7')
    expect(datos.ultimos[0].estudiante).toBe('Ana')
  })

  it('lista las tareas creadas', async () => {
    const { status, datos } = await pedir('/api/tareas', { headers: conToken() })
    expect(status).toBe(200)
    expect(datos.tareas).toHaveLength(1)
    expect(datos.tareas[0].totalIntentos).toBe(1)
  })
})

describe('Información del servidor', () => {
  it('informa las direcciones de la red para los estudiantes', async () => {
    const { status, datos } = await pedir('/api/servidor/info')
    expect(status).toBe(200)
    expect(typeof datos.urlSugerida).toBe('string')
    expect(datos.urlSugerida).toMatch(/^http:\/\//)
    expect(Array.isArray(datos.ips)).toBe(true)
    // Nunca debe ofrecer direcciones sin conexión (169.254.x.x).
    expect(datos.ips.every((i) => !i.ip.startsWith('169.254.'))).toBe(true)
    expect(datos.ips.every((i) => !i.ip.startsWith('127.'))).toBe(true)
    // Cada dirección trae su enlace listo y su interfaz.
    for (const ip of datos.ips) {
      expect(ip.url).toBe(`http://${ip.ip}:${datos.puerto}`)
      expect(typeof ip.interfaz).toBe('string')
      expect(typeof ip.virtual).toBe('boolean')
    }
  })
})

describe('Perfil del profesor', () => {
  it('exige sesión de profesor', async () => {
    const { status } = await pedir('/api/profesor/perfil')
    expect(status).toBe(401)
  })

  it('devuelve el perfil con estadísticas', async () => {
    const { status, datos } = await pedir('/api/profesor/perfil', { headers: conToken() })
    expect(status).toBe(200)
    expect(datos.profesor.nombre).toBe('Profesor(a)')
    expect(datos.profesor.avatar).toBeTruthy()
    expect(datos.estadisticas.tareas).toBe(1)
    expect(datos.estadisticas.intentos).toBe(1)
  })

  it('guarda el nombre y el avatar', async () => {
    const { status, datos } = await pedir('/api/profesor/perfil', {
      method: 'PUT',
      headers: conToken(),
      body: JSON.stringify({ nombre: 'Profe Álvaro', avatar: '👨‍🏫' }),
    })
    expect(status).toBe(200)
    expect(datos.profesor.nombre).toBe('Profe Álvaro')
    expect(datos.profesor.avatar).toBe('👨‍🏫')

    const despues = await pedir('/api/profesor/perfil', { headers: conToken() })
    expect(despues.datos.profesor.nombre).toBe('Profe Álvaro')
  })

  it('usa el nombre del perfil cuando la tarea no lo especifica', async () => {
    const sinProfesor = { ...TAREA_EJEMPLO, titulo: 'Tarea sin autor explícito' }
    delete sinProfesor.profesor

    const { status, datos } = await pedir('/api/tareas', {
      method: 'POST',
      headers: conToken(),
      body: JSON.stringify(sinProfesor),
    })
    expect(status).toBe(201)

    const lista = await pedir('/api/tareas', { headers: conToken() })
    const creada = lista.datos.tareas.find((t) => t.codigo === datos.codigo)
    expect(creada.profesor).toBe('Profe Álvaro')
  })
})

describe('Cambio de clave y borrado', () => {
  it('rechaza el cambio si la clave actual no coincide', async () => {
    const { status } = await pedir('/api/profesor/clave', {
      method: 'POST',
      headers: conToken(),
      body: JSON.stringify({ actual: 'mala', nueva: 'nueva-clave' }),
    })
    expect(status).toBe(401)
  })

  it('cambia la clave y deja de aceptar la anterior', async () => {
    const cambio = await pedir('/api/profesor/clave', {
      method: 'POST',
      headers: conToken(),
      body: JSON.stringify({ actual: 'clave-de-prueba', nueva: 'nueva-clave' }),
    })
    expect(cambio.status).toBe(200)

    const vieja = await pedir('/api/profesor/entrar', {
      method: 'POST',
      body: JSON.stringify({ clave: 'clave-de-prueba' }),
    })
    expect(vieja.status).toBe(401)

    const nueva = await pedir('/api/profesor/entrar', {
      method: 'POST',
      body: JSON.stringify({ clave: 'nueva-clave' }),
    })
    expect(nueva.status).toBe(200)
    token = nueva.datos.token
  })

  it('borra las tareas y sus resultados', async () => {
    const lista = await pedir('/api/tareas', { headers: conToken() })
    expect(lista.datos.tareas.length).toBeGreaterThan(0)

    for (const t of lista.datos.tareas) {
      const borrado = await pedir(`/api/tareas/${t.id}`, { method: 'DELETE', headers: conToken() })
      expect(borrado.status).toBe(200)
    }

    const despues = await pedir('/api/profesor/resumen', { headers: conToken() })
    expect(despues.datos.totalTareas).toBe(0)
    expect(despues.datos.totalIntentos).toBe(0)
  })
})
