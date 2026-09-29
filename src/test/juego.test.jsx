/**
 * Pruebas de integración: simulan a un estudiante jugando de principio a fin
 * y a un profesor entrando, viendo su dashboard y creando tareas.
 * Sirven para detectar pantallas en blanco, errores de render y fallos al avanzar.
 */
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App.jsx'
import { setTokenProfe } from '../lib/api.js'

const PREGUNTAS = [
  { id: 'q1', tipo: 'multiple', enunciado: 'PREGUNTA UNO suma basica', opciones: ['3', '4', '5', '6'], correcta: 1, explicacion: 'Dos mas dos es cuatro.', puntos: 10 },
  { id: 'q2', tipo: 'boolean', enunciado: 'PREGUNTA DOS el cielo es azul', correcta: true, explicacion: 'Si, por la dispersion de la luz.', puntos: 10 },
  { id: 'q3', tipo: 'corta', enunciado: 'PREGUNTA TRES potencia', respuestas: ['32'], explicacion: 'Dos a la quinta es 32.', puntos: 10 },
  { id: 'q4', tipo: 'ordenar', enunciado: 'PREGUNTA CUATRO ordena las letras', secuencia: ['Alfa', 'Beta', 'Gamma'], explicacion: 'Ese es el orden.', puntos: 10 },
  { id: 'q5', tipo: 'emparejar', enunciado: 'PREGUNTA CINCO une las parejas', pares: [{ izq: 'Mitad', der: '0,5' }, { izq: 'Cuarto', der: '0,25' }], explicacion: 'Fracciones y decimales.', puntos: 10 },
]

const TAREA = {
  id: 't1',
  codigo: 'ABC123',
  titulo: 'Prueba de juego',
  grado: '5',
  materia: 'Matemáticas',
  tema: 'Varios',
  profesor: 'Profe Test',
  fecha: new Date().toISOString(),
  config: { tiempoPorPregunta: 0, vidas: 3, mezclar: false, mostrarExplicacion: true },
  preguntas: PREGUNTAS,
}

const RESUMEN = {
  totalTareas: 2,
  totalIntentos: 3,
  estudiantesUnicos: 2,
  puntajePromedio: 40,
  precisionPromedio: 72,
  porMateria: [{ nombre: 'Matemáticas', intentos: 3, precision: 72, puntajePromedio: 40 }],
  porGrado: [{ nombre: '5', intentos: 3, precision: 72, puntajePromedio: 40 }],
  porDia: [],
  ultimos: [
    {
      id: 'u1',
      estudiante: 'Ana',
      avatar: '🦊',
      puntaje: 50,
      correctas: 4,
      total: 5,
      precision: 80,
      fecha: new Date().toISOString(),
      tarea: { codigo: 'ABC123', titulo: 'Prueba de juego', grado: '5', materia: 'Matemáticas' },
    },
  ],
}

const respuestaJson = (datos, status = 200) => ({ ok: status < 400, status, json: async () => datos })

function stubFetch({ tarea = TAREA, claveCorrecta = 'dale2026', resumen = RESUMEN } = {}) {
  global.fetch = vi.fn(async (url, opciones = {}) => {
    const u = String(url)
    const metodo = (opciones.method || 'GET').toUpperCase()
    let cuerpo = {}
    try {
      cuerpo = opciones.body ? JSON.parse(opciones.body) : {}
    } catch {
      cuerpo = {}
    }

    if (u.includes('/api/profesor/entrar')) {
      return cuerpo.clave === claveCorrecta
        ? respuestaJson({ token: 'token-test' })
        : respuestaJson({ error: 'Clave incorrecta. Vuelve a intentarlo.' }, 401)
    }
    if (u.includes('/api/profesor/sesion')) return respuestaJson({ ok: true })
    if (u.includes('/api/profesor/resumen')) return respuestaJson(resumen)
    if (u.includes('/api/intentos') && metodo === 'POST') return respuestaJson({ id: 'i1' }, 201)
    if (u.match(/\/api\/tareas\/[A-Z0-9]+\/resultados/)) {
      return respuestaJson({ tarea, intentos: [], porPregunta: [], resumen: {} })
    }
    if (u.match(/\/api\/tareas\/[A-Z0-9]+$/)) return respuestaJson({ tarea })
    if (u.match(/\/api\/tareas(\?|$)/)) return respuestaJson({ tareas: [tarea] })
    return respuestaJson({ ok: true })
  })
}

function montar(ruta, state) {
  return render(
    <MemoryRouter initialEntries={[state ? { pathname: ruta, state } : ruta]}>
      <App />
    </MemoryRouter>
  )
}

const opciones = () => Array.from(document.querySelectorAll('.opciones .opcion'))
const retro = () => document.querySelector('.retro')
const botonAvanzar = () =>
  Array.from(document.querySelectorAll('button')).find((b) => /Siguiente|Ver resultados/.test(b.textContent))

async function responderCorrectamente(pregunta) {
  if (pregunta.tipo === 'multiple') {
    fireEvent.click(opciones().find((b) => b.textContent.includes(pregunta.opciones[pregunta.correcta])))
  } else if (pregunta.tipo === 'boolean') {
    const texto = pregunta.correcta ? 'Verdadero' : 'Falso'
    fireEvent.click(opciones().find((b) => b.textContent.includes(texto)))
  } else if (pregunta.tipo === 'corta') {
    fireEvent.change(document.querySelector('.respuesta-corta input'), {
      target: { value: pregunta.respuestas[0] },
    })
    fireEvent.click(document.querySelector('.respuesta-corta button'))
  } else if (pregunta.tipo === 'ordenar') {
    fireEvent.click(
      Array.from(document.querySelectorAll('button')).find((b) => /Comprobar orden/.test(b.textContent))
    )
  } else if (pregunta.tipo === 'emparejar') {
    for (const par of pregunta.pares) {
      const fichas = Array.from(document.querySelectorAll('.emparejar .ficha'))
      fireEvent.click(fichas.find((f) => f.textContent === par.izq && !f.disabled))
      const derechas = Array.from(document.querySelectorAll('.emparejar .columna:nth-child(2) .ficha'))
      fireEvent.click(derechas.find((f) => f.textContent === par.der && !f.disabled))
    }
  }
}

/* ================================================================ */

describe('Juego del estudiante', () => {
  beforeEach(() => {
    cleanup()
    try {
      sessionStorage.clear()
    } catch {
      /* ignore */
    }
  })

  it('recorre los 5 tipos de pregunta sin quedarse en blanco', async () => {
    stubFetch()
    montar('/jugar/ABC123', { estudiante: 'Ana', avatar: '🦊', tarea: TAREA })

    await waitFor(() => expect(screen.getByText(/PREGUNTA UNO/)).toBeInTheDocument())

    for (let i = 0; i < PREGUNTAS.length; i++) {
      await responderCorrectamente(PREGUNTAS[i])
      await waitFor(() => expect(retro()).toBeTruthy())
      expect(document.querySelector('.tarjeta')).toBeTruthy()

      fireEvent.click(botonAvanzar())

      if (i < PREGUNTAS.length - 1) {
        const siguiente = PREGUNTAS[i + 1]
        await waitFor(() =>
          expect(screen.getByText(new RegExp(siguiente.enunciado.slice(0, 18)))).toBeInTheDocument()
        )
      }
    }

    await waitFor(() => expect(screen.getByText(/¡Buen trabajo/)).toBeInTheDocument())
    expect(document.querySelector('.puntaje-grande')).toBeTruthy()
  })

  it('muestra la explicación y avanza con una tarea de una sola pregunta', async () => {
    stubFetch()
    montar('/jugar/ABC123', { estudiante: 'Ana', avatar: '🦊', tarea: { ...TAREA, preguntas: [PREGUNTAS[0]] } })

    await waitFor(() => expect(screen.getByText(/PREGUNTA UNO/)).toBeInTheDocument())
    await responderCorrectamente(PREGUNTAS[0])

    await waitFor(() => expect(retro()).toBeInTheDocument())
    expect(screen.getByText(/Dos mas dos es cuatro/)).toBeInTheDocument()

    fireEvent.click(botonAvanzar())
    await waitFor(() => expect(screen.getByText(/¡Buen trabajo/)).toBeInTheDocument())
  })

  it('suma puntos al responder correctamente', async () => {
    stubFetch()
    montar('/jugar/ABC123', { estudiante: 'Ana', avatar: '🦊', tarea: { ...TAREA, preguntas: [PREGUNTAS[0]] } })
    await waitFor(() => expect(screen.getByText(/PREGUNTA UNO/)).toBeInTheDocument())

    await responderCorrectamente(PREGUNTAS[0])
    await waitFor(() => expect(retro()).toBeInTheDocument())

    expect(document.querySelector('.pildora.puntos').textContent).toMatch(/[1-9]\d* pts/)
  })

  it('redirige al ingreso si se entra al juego sin datos de sesión', async () => {
    stubFetch()
    montar('/jugar/ABC123')
    await waitFor(() => expect(screen.getByText(/Entrar a jugar/)).toBeInTheDocument())
  })
})

/* ================================================================ */

describe('Panel del profesor', () => {
  beforeEach(() => {
    cleanup()
    setTokenProfe(null)
  })

  it('pide la clave antes de mostrar el panel', async () => {
    stubFetch()
    montar('/profesor')
    await waitFor(() => expect(screen.getByText(/Ingreso de profesores/)).toBeInTheDocument())
    expect(screen.getByText(/Clave de profesor/)).toBeInTheDocument()
  })

  it('no deja entrar con una clave incorrecta', async () => {
    stubFetch()
    montar('/profesor')
    await waitFor(() => expect(screen.getByText(/Ingreso de profesores/)).toBeInTheDocument())

    fireEvent.change(document.querySelector('input[type="password"]'), { target: { value: 'mala' } })
    fireEvent.click(screen.getByText(/Entrar al panel/))

    await waitFor(() => expect(screen.getByText(/Clave incorrecta/)).toBeInTheDocument())
  })

  it('entra con la clave correcta y muestra el dashboard', async () => {
    stubFetch()
    montar('/profesor')
    await waitFor(() => expect(screen.getByText(/Ingreso de profesores/)).toBeInTheDocument())

    fireEvent.change(document.querySelector('input[type="password"]'), { target: { value: 'dale2026' } })
    fireEvent.click(screen.getByText(/Entrar al panel/))

    await waitFor(() => expect(screen.getByText(/Panel de/)).toBeInTheDocument())
    // Métricas del dashboard.
    expect(screen.getByText('Participaciones')).toBeInTheDocument()
    expect(screen.getByText('Estudiantes')).toBeInTheDocument()
    expect(screen.getByText('Precisión promedio')).toBeInTheDocument()
    // Desglose por materia y grado.
    expect(screen.getByText(/Por materia/)).toBeInTheDocument()
    expect(screen.getByText(/Por grado/)).toBeInTheDocument()
    // Última participación del estudiante.
    expect(screen.getByText(/Ana/)).toBeInTheDocument()
  })

  it('muestra el asistente de creación con el banco de preguntas', async () => {
    setTokenProfe('token-test')
    stubFetch()
    montar('/profesor/crear')

    await waitFor(() => expect(screen.getByText(/Datos de la tarea/)).toBeInTheDocument())
    expect(screen.getByText(/Título de la tarea/)).toBeInTheDocument()
  })

  it('no permite crear tareas sin sesión de profesor', async () => {
    stubFetch()
    montar('/profesor/crear')
    await waitFor(() => expect(screen.getByText(/Ingreso de profesores/)).toBeInTheDocument())
  })
})
