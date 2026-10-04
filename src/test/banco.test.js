// @vitest-environment node
/**
 * Valida la integridad del banco de preguntas:
 * que todas tengan los campos correctos según su tipo y que los
 * grados, materias y temas coincidan con el currículo.
 */
import { describe, expect, it } from 'vitest'
import { BANCO, filtrarBanco } from '../data/bancoPreguntas.js'
import { CURRICULO, GRADOS } from '../data/curriculo.js'

const TIPOS = ['multiple', 'boolean', 'emparejar', 'ordenar', 'corta']
const esTexto = (v) => typeof v === 'string' && v.trim().length > 0

describe('Banco de preguntas', () => {
  it('tiene una buena cantidad de preguntas', () => {
    expect(BANCO.length).toBeGreaterThanOrEqual(250)
  })

  it('no tiene identificadores repetidos', () => {
    const ids = BANCO.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('todas tienen enunciado, tipo, dificultad y explicación', () => {
    const problemas = []
    for (const p of BANCO) {
      if (!esTexto(p.enunciado)) problemas.push(`${p.id}: enunciado vacío`)
      if (!esTexto(p.explicacion)) problemas.push(`${p.id}: falta la explicación`)
      if (!TIPOS.includes(p.tipo)) problemas.push(`${p.id}: tipo inválido (${p.tipo})`)
      if (![1, 2, 3].includes(p.dificultad)) problemas.push(`${p.id}: dificultad inválida (${p.dificultad})`)
      if (p.puntos !== undefined) problemas.push(`${p.id}: no debe traer "puntos"`)
    }
    expect(problemas).toEqual([])
  })

  it('el grado, la materia y el tema coinciden con el currículo', () => {
    const problemas = []
    for (const p of BANCO) {
      if (!GRADOS.includes(String(p.grado))) {
        problemas.push(`${p.id}: grado inválido (${p.grado})`)
        continue
      }
      const temas = CURRICULO[String(p.grado)]?.[p.materia]
      if (!temas) {
        problemas.push(`${p.id}: la materia "${p.materia}" no existe en ${p.grado}°`)
      } else if (!temas.includes(p.tema)) {
        problemas.push(`${p.id}: el tema "${p.tema}" no existe en ${p.grado}° ${p.materia}`)
      }
    }
    expect(problemas).toEqual([])
  })

  it('los campos de cada tipo son coherentes', () => {
    const problemas = []
    for (const p of BANCO) {
      if (p.tipo === 'multiple') {
        if (!Array.isArray(p.opciones) || p.opciones.length < 2) {
          problemas.push(`${p.id}: opciones inválidas`)
        } else if (p.opciones.some((o) => !esTexto(o))) {
          problemas.push(`${p.id}: hay una opción vacía`)
        } else if (new Set(p.opciones.map((o) => o.trim())).size !== p.opciones.length) {
          problemas.push(`${p.id}: opciones repetidas`)
        } else if (!Number.isInteger(p.correcta) || p.correcta < 0 || p.correcta >= p.opciones.length) {
          problemas.push(`${p.id}: el índice de la respuesta correcta está fuera de rango`)
        }
      } else if (p.tipo === 'boolean') {
        if (typeof p.correcta !== 'boolean') problemas.push(`${p.id}: "correcta" debe ser true o false`)
      } else if (p.tipo === 'emparejar') {
        if (!Array.isArray(p.pares) || p.pares.length < 2) {
          problemas.push(`${p.id}: se necesitan al menos 2 parejas`)
        } else if (p.pares.length > 6) {
          problemas.push(`${p.id}: demasiadas parejas (${p.pares.length})`)
        } else if (p.pares.some((x) => !esTexto(x?.izq) || !esTexto(x?.der))) {
          problemas.push(`${p.id}: hay una pareja incompleta`)
        }
      } else if (p.tipo === 'ordenar') {
        if (!Array.isArray(p.secuencia) || p.secuencia.length < 3) {
          problemas.push(`${p.id}: la secuencia necesita al menos 3 elementos`)
        } else if (p.secuencia.length > 8) {
          problemas.push(`${p.id}: la secuencia tiene demasiados elementos`)
        } else if (p.secuencia.some((s) => !esTexto(s))) {
          problemas.push(`${p.id}: hay un elemento vacío en la secuencia`)
        } else if (new Set(p.secuencia.map((s) => s.trim())).size !== p.secuencia.length) {
          problemas.push(`${p.id}: la secuencia tiene elementos repetidos`)
        }
      } else if (p.tipo === 'corta') {
        if (!Array.isArray(p.respuestas) || p.respuestas.length === 0) {
          problemas.push(`${p.id}: faltan las respuestas aceptadas`)
        } else if (p.respuestas.some((r) => !esTexto(r))) {
          problemas.push(`${p.id}: hay una respuesta aceptada vacía`)
        }
      }
    }
    expect(problemas).toEqual([])
  })

  it('hay al menos 2 preguntas por cada combinación de grado y materia', () => {
    const faltantes = []
    for (const grado of GRADOS) {
      for (const materia of Object.keys(CURRICULO[grado] || {})) {
        const cuantas = BANCO.filter(
          (p) => String(p.grado) === grado && p.materia === materia
        ).length
        if (cuantas < 2) faltantes.push(`${grado}° ${materia}: ${cuantas} pregunta(s)`)
      }
    }
    expect(faltantes).toEqual([])
  })

  it('usa los cinco tipos de pregunta con una distribución razonable', () => {
    for (const tipo of TIPOS) {
      const cuantas = BANCO.filter((p) => p.tipo === tipo).length
      expect(cuantas).toBeGreaterThanOrEqual(5)
    }
    const opcionMultiple = BANCO.filter((p) => p.tipo === 'multiple').length
    expect(opcionMultiple / BANCO.length).toBeGreaterThan(0.4)
  })

  it('filtrarBanco devuelve las preguntas del grado y la materia pedidos', () => {
    const resultados = filtrarBanco({ grado: '5', materia: 'Matemáticas' })
    expect(resultados.length).toBeGreaterThan(0)
    for (const p of resultados) {
      expect(String(p.grado)).toBe('5')
      expect(p.materia).toBe('Matemáticas')
    }
    const conTema = filtrarBanco({ grado: '5', materia: 'Matemáticas', tema: 'Porcentajes' })
    expect(conTema.length).toBeGreaterThan(0)
    for (const p of conTema) expect(p.tema).toBe('Porcentajes')
  })
})
