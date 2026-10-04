// @vitest-environment node
/** Pruebas de la lógica de logros e insignias. */
import { describe, expect, it } from 'vitest'
import { calcularLogros, rachaMaxima, resumenEstudiante, LOGROS } from '../../server/logros.js'

const intento = (opciones = {}) => ({
  total: 4,
  correctas: 2,
  puntaje: 20,
  segundos: 60,
  fecha: '2026-01-01T10:00:00.000Z',
  respuestas: [],
  materia: 'Matemáticas',
  ...opciones,
})

const conRespuestas = (correctas) => correctas.map((c) => ({ correcta: c }))

const obtenidos = (intentos) =>
  calcularLogros(intentos)
    .filter((l) => l.obtenido)
    .map((l) => l.id)

describe('rachaMaxima', () => {
  it('cuenta la mayor cantidad de aciertos seguidos', () => {
    expect(rachaMaxima({ respuestas: conRespuestas([true, true, false, true, true, true]) })).toBe(3)
    expect(rachaMaxima({ respuestas: conRespuestas([false, true, false]) })).toBe(1)
    expect(rachaMaxima({ respuestas: [] })).toBe(0)
    expect(rachaMaxima(null)).toBe(0)
  })
})

describe('calcularLogros', () => {
  it('devuelve todos los logros sin obtener cuando no hay intentos', () => {
    const logros = calcularLogros([])
    expect(logros).toHaveLength(LOGROS.length)
    expect(logros.every((l) => l.obtenido === false)).toBe(true)
    expect(logros.find((l) => l.id === 'primer-paso').progreso).toEqual({ actual: 0, meta: 1 })
  })

  it('da "Primer paso" con un solo intento', () => {
    expect(obtenidos([intento()])).toContain('primer-paso')
  })

  it('da "Puntaje perfecto" al acertar todo', () => {
    expect(obtenidos([intento({ correctas: 4, total: 4 })])).toContain('perfecto')
    expect(obtenidos([intento({ correctas: 3, total: 4 })])).not.toContain('perfecto')
  })

  it('da "Tres perfectas" con tres tareas perfectas', () => {
    const perfecta = () => intento({ correctas: 5, total: 5 })
    expect(obtenidos([perfecta(), perfecta()])).not.toContain('perfecto-3')
    expect(obtenidos([perfecta(), perfecta(), perfecta()])).toContain('perfecto-3')
  })

  it('da "En racha" e "Imparable" según los aciertos seguidos', () => {
    const cinco = intento({ respuestas: conRespuestas([true, true, true, true, true]) })
    expect(obtenidos([cinco])).toContain('racha-5')
    expect(obtenidos([cinco])).not.toContain('racha-10')

    const diez = intento({ respuestas: conRespuestas(Array(10).fill(true)) })
    expect(obtenidos([diez])).toContain('racha-10')
  })

  it('da "Constante" al jugar en 3 días distintos', () => {
    const dias = ['2026-03-01T10:00:00.000Z', '2026-03-02T10:00:00.000Z', '2026-03-03T10:00:00.000Z']
    expect(obtenidos(dias.map((fecha) => intento({ fecha })))).toContain('constante')
    expect(obtenidos([intento({ fecha: dias[0] }), intento({ fecha: dias[0] })])).not.toContain('constante')
  })

  it('da "Explorador" al jugar 4 materias diferentes', () => {
    const materias = ['Matemáticas', 'Lenguaje', 'Inglés', 'Ciencias Sociales']
    expect(obtenidos(materias.map((materia) => intento({ materia })))).toContain('explorador')
    expect(obtenidos(['Matemáticas', 'Lenguaje'].map((materia) => intento({ materia })))).not.toContain(
      'explorador'
    )
  })

  it('da "Matemático" con 3 tareas de matemáticas al 80 % o más', () => {
    const buena = intento({ materia: 'Matemáticas', correctas: 4, total: 5 })
    const mala = intento({ materia: 'Matemáticas', correctas: 2, total: 5 })
    expect(obtenidos([buena, buena, buena])).toContain('matematico')
    expect(obtenidos([buena, buena, mala])).not.toContain('matematico')
    expect(obtenidos([buena, mala, mala])).not.toContain('matematico')
  })

  it('da "Veterano" con 10 tareas', () => {
    const lista = Array.from({ length: 10 }, () => intento())
    expect(obtenidos(lista)).toContain('diez-tareas')
  })

  it('da "Mente rápida" solo con tareas de 3 o más preguntas', () => {
    const rapida = intento({ total: 4, correctas: 2, segundos: 40 }) // 10 s por pregunta
    expect(obtenidos([rapida])).toContain('veloz')

    const pocas = intento({ total: 1, correctas: 1, segundos: 3 }) // 3 s, pero 1 pregunta
    expect(obtenidos([pocas])).not.toContain('veloz')

    const lenta = intento({ total: 4, correctas: 2, segundos: 200 })
    expect(obtenidos([lenta])).not.toContain('veloz')
  })
})

describe('resumenEstudiante', () => {
  it('resume sin datos', () => {
    expect(resumenEstudiante([])).toEqual({ tareas: 0, precision: 0, puntaje: 0, segundos: 0, porMateria: [] })
  })

  it('agrupa por materia con precisión y puntaje', () => {
    const resumen = resumenEstudiante([
      intento({ materia: 'Matemáticas', correctas: 4, total: 4, puntaje: 40 }),
      intento({ materia: 'Matemáticas', correctas: 0, total: 4, puntaje: 0 }),
      intento({ materia: 'Lenguaje', correctas: 2, total: 4, puntaje: 20 }),
    ])

    expect(resumen.tareas).toBe(3)
    expect(resumen.puntaje).toBe(60)
    expect(resumen.precision).toBe(50) // (100 + 0 + 50) / 3
    expect(resumen.porMateria).toHaveLength(2)

    const matematicas = resumen.porMateria.find((m) => m.nombre === 'Matemáticas')
    expect(matematicas.tareas).toBe(2)
    expect(matematicas.precision).toBe(50)
    expect(matematicas.puntaje).toBe(40)
  })
})
