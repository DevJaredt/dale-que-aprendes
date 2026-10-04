/**
 * Prueba de humo: renderiza las páginas y los tipos de pregunta en el servidor
 * para detectar errores de ejecución que la compilación no alcanza a ver.
 *
 * Uso:  npm run test:render
 */
import { createServer } from 'vite'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server.js'

const RUTAS = [
  '/',
  '/entrar',
  '/entrar?codigo=ABC123',
  '/cuenta',
  '/cuenta?modo=crear',
  '/progreso',
  '/jugar/ABC123',
  '/resultado',
  '/profesor',
  '/profesor/crear',
  '/profesor/reportes',
  '/profesor/conexion',
  '/profesor/perfil',
  '/profesor/vivo/ABC123',
  '/profesor/tarea/ABC123',
  '/ruta-que-no-existe',
]

const PREGUNTAS = [
  {
    tipo: 'multiple', id: 'q1', enunciado: '¿Cuánto es 25% de 200?', puntos: 10,
    opciones: ['25', '50', '75', '100'], correcta: 1, explicacion: 'La cuarta parte.',
  },
  {
    tipo: 'boolean', id: 'q2', enunciado: 'El agua hierve a 100 °C.', puntos: 10,
    correcta: true, explicacion: 'A nivel del mar.',
  },
  {
    tipo: 'emparejar', id: 'q3', enunciado: 'Une cada fracción con su decimal.', puntos: 10,
    pares: [{ izq: '1/2', der: '0,5' }, { izq: '1/4', der: '0,25' }, { izq: '3/4', der: '0,75' }],
    explicacion: 'Se divide numerador entre denominador.',
  },
  {
    tipo: 'ordenar', id: 'q4', enunciado: 'Ordena de menor a mayor.', puntos: 10,
    secuencia: ['0,1', '0,25', '0,5', '0,75'], explicacion: 'Comparando cifra por cifra.',
  },
  {
    tipo: 'corta', id: 'q5', enunciado: '¿Cuánto es 2⁵?', puntos: 10,
    respuestas: ['32'], explicacion: '2×2×2×2×2 = 32.',
  },
]

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

let fallos = 0

function probar(nombre, elemento) {
  try {
    const html = renderToString(elemento)
    const ok = html.length > 20
    if (!ok) fallos++
    console.log(`${ok ? 'OK  ' : 'VACIO'}  ${nombre}  (${html.length} caracteres)`)
  } catch (err) {
    fallos++
    console.log(`FALLA ${nombre}\n      ${err.message}`)
  }
}

try {
  const { default: App } = await vite.ssrLoadModule('/src/App.jsx')
  const { default: PreguntaInteractiva } = await vite.ssrLoadModule('/src/preguntas/index.jsx')

  console.log('— Páginas —')
  for (const ruta of RUTAS) {
    probar(ruta, React.createElement(StaticRouter, { location: ruta }, React.createElement(App)))
  }

  console.log('\n— Tipos de pregunta —')
  for (const pregunta of PREGUNTAS) {
    probar(
      pregunta.tipo,
      React.createElement(PreguntaInteractiva, {
        pregunta,
        onResponder: () => {},
        bloqueado: false,
      })
    )
  }

  // Verifica la lógica de calificación de respuestas cortas.
  const { respuestaCortaCorrecta, normalizar, respuestaCorrectaTexto } = await vite.ssrLoadModule(
    '/src/lib/util.js'
  )
  console.log('\n— Lógica de respuestas —')
  const casos = [
    ['32', ['32'], true],
    ['  Treinta y dos ', ['treinta y dos'], true],
    ['5 m/s', ['5'], true],
    ['médico', ['medico'], true],
    ['xyz', ['32'], false],
  ]
  for (const [intento, aceptadas, esperado] of casos) {
    const obtenido = respuestaCortaCorrecta(intento, aceptadas)
    const ok = obtenido === esperado
    if (!ok) fallos++
    console.log(`${ok ? 'OK  ' : 'FALLA'}  "${intento}" vs [${aceptadas}] → ${obtenido}`)
  }
  const texto = respuestaCorrectaTexto(PREGUNTAS[2])
  const okTexto = texto.includes('1/2')
  if (!okTexto) fallos++
  console.log(`${okTexto ? 'OK  ' : 'FALLA'}  texto de respuesta correcta: ${texto}`)
  const norm = normalizar('  MÉDICO  ')
  const okNorm = norm === 'medico'
  if (!okNorm) fallos++
  console.log(`${okNorm ? 'OK  ' : 'FALLA'}  normalizar("  MÉDICO  ") → "${norm}"`)
} finally {
  await vite.close()
}

console.log(
  fallos === 0 ? '\n✅ Todo renderiza y califica correctamente.' : `\n❌ ${fallos} problema(s) encontrado(s).`
)
process.exit(fallos === 0 ? 0 : 1)
