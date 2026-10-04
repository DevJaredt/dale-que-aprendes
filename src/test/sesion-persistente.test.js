// @vitest-environment node
/**
 * Prueba de la sesión persistente del profesor.
 *
 * Levanta el servidor como un proceso real, inicia sesión, lo APAGA,
 * lo vuelve a encender con la misma base de datos y comprueba que el
 * profesor sigue dentro sin tener que escribir la clave otra vez.
 *
 * Este era el fallo reportado: al reiniciar el servidor se perdían
 * todas las sesiones y el profesor era devuelto al ingreso.
 */
import { afterAll, describe, expect, it } from 'vitest'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const ARCHIVO = path.join(os.tmpdir(), `dqa-sesion-${Date.now()}.json`)
const CLAVE = 'clave-de-sesion'
const PUERTO = 3900 + Math.floor(Math.random() * 90)
const BASE = `http://127.0.0.1:${PUERTO}`
const ESPERA = 40_000 // arrancar y apagar procesos reales toma su tiempo

let servidor = null
let salidaServidor = ''

function arrancar() {
  salidaServidor = ''
  const hijo = spawn(process.execPath, ['server/index.js'], {
    cwd: RAIZ,
    env: { ...process.env, PORT: String(PUERTO), DB_PATH: ARCHIVO, CLAVE_PROFESOR: CLAVE },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  hijo.stdout.on('data', (d) => (salidaServidor += d.toString()))
  hijo.stderr.on('data', (d) => (salidaServidor += d.toString()))
  return hijo
}

async function esperarListo(hijo) {
  for (let i = 0; i < 120; i++) {
    if (hijo.exitCode !== null) {
      throw new Error(`El servidor terminó (código ${hijo.exitCode}).\n${salidaServidor}`)
    }
    try {
      const r = await fetch(`${BASE}/api/salud`)
      if (r.ok) return
    } catch {
      /* todavía no responde */
    }
    await new Promise((r) => setTimeout(r, 150))
  }
  throw new Error(`El servidor no arrancó a tiempo.\n${salidaServidor}`)
}

async function asegurarServidor() {
  if (servidor && servidor.exitCode === null) return servidor
  servidor = arrancar()
  await esperarListo(servidor)
  return servidor
}

async function detener(hijo) {
  if (!hijo || hijo.exitCode !== null) return
  await new Promise((resolver) => {
    const limite = setTimeout(() => {
      try {
        hijo.kill('SIGKILL')
      } catch {
        /* ignore */
      }
      resolver()
    }, 3000)
    hijo.once('exit', () => {
      clearTimeout(limite)
      resolver()
    })
    hijo.kill()
  })
}

const pedir = (ruta, token) =>
  fetch(BASE + ruta, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'x-token-profe': token } : {}),
    },
  })

const entrar = async () => {
  const respuesta = await fetch(`${BASE}/api/profesor/entrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clave: CLAVE }),
  })
  return respuesta.json()
}

afterAll(async () => {
  await detener(servidor)
  try {
    fs.unlinkSync(ARCHIVO)
  } catch {
    /* ignore */
  }
})

describe('Sesión persistente del profesor', () => {
  it(
    'sigue siendo válida después de reiniciar el servidor',
    async () => {
      servidor = arrancar()
      await esperarListo(servidor)

      // 1) El profesor entra con su clave.
      const { token } = await entrar()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(20)

      // 2) La sesión funciona antes de reiniciar.
      expect((await pedir('/api/profesor/sesion', token)).status).toBe(200)

      // 3) Se APAGA el servidor por completo.
      const anterior = servidor
      await detener(anterior)
      expect(anterior.exitCode !== null || anterior.killed).toBe(true)

      // 4) Se enciende de nuevo con la misma base de datos.
      servidor = arrancar()
      await esperarListo(servidor)

      // 5) El profesor sigue dentro, sin volver a escribir la clave.
      expect((await pedir('/api/profesor/sesion', token)).status).toBe(200)
      expect((await pedir('/api/tareas', token)).status).toBe(200)
      expect((await pedir('/api/profesor/resumen', token)).status).toBe(200)

      // 6) Y guarda la sesión en el archivo de datos, no en memoria.
      const guardado = JSON.parse(fs.readFileSync(ARCHIVO, 'utf8'))
      expect(Object.keys(guardado.sesiones || {})).toContain(token)
    },
    ESPERA
  )

  it(
    'rechaza un token inventado',
    async () => {
      await asegurarServidor()
      const respuesta = await pedir('/api/profesor/sesion', 'token-falso-123')
      expect(respuesta.status).toBe(401)
    },
    ESPERA
  )

  it(
    'al salir, la sesión deja de ser válida',
    async () => {
      await asegurarServidor()

      const { token } = await entrar()
      expect((await pedir('/api/profesor/sesion', token)).status).toBe(200)

      const salida = await fetch(`${BASE}/api/profesor/salir`, {
        method: 'POST',
        headers: { 'x-token-profe': token },
      })
      expect(salida.status).toBe(200)

      expect((await pedir('/api/profesor/sesion', token)).status).toBe(401)
    },
    ESPERA
  )
})
