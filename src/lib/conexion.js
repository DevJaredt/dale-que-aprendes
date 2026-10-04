/**
 * Conexión para los estudiantes.
 *
 * Problema que resuelve: si el profesor abre la app en
 * http://localhost:3000, los QR y los enlaces quedarían apuntando a
 * "localhost", que en el celular significa el propio celular.
 *
 * Aquí se pide al servidor las direcciones de la red local y se elige
 * una para armar los enlaces que sí funcionan desde el celular.
 */
import { useCallback, useEffect, useState } from 'react'

const CLAVE = 'dqa_url_base'

let infoCache = null

/** ¿La app se está abriendo desde el mismo computador del servidor? */
export function esAccesoLocal() {
  if (typeof window === 'undefined') return true
  const host = window.location.hostname
  return !host || host === 'localhost' || host === '127.0.0.1' || host === '::1'
}

/** URL base para armar enlaces de estudiantes (versión sin hooks). */
export function urlBaseEstudiantes() {
  if (!esAccesoLocal()) return window.location.origin
  try {
    return localStorage.getItem(CLAVE) || window.location.origin
  } catch {
    return window.location.origin
  }
}

/** Enlace para que un estudiante entre directo a una tarea. */
export function enlaceTarea(codigo) {
  return `${urlBaseEstudiantes()}/entrar?codigo=${codigo}`
}

/**
 * Hook con la información del servidor y la URL base elegida.
 * Devuelve: { info, base, elegir, local }
 */
export function useConexion() {
  const [info, setInfo] = useState(infoCache)
  const [base, setBase] = useState(urlBaseEstudiantes())

  useEffect(() => {
    let vigente = true
    fetch('/api/servidor/info')
      .then((r) => r.json())
      .then((datos) => {
        if (!vigente || !datos?.ips) return
        infoCache = datos
        setInfo(datos)

        // Si ya se entró por la IP de la red, no hay nada que corregir.
        if (!esAccesoLocal()) {
          setBase(window.location.origin)
          return
        }

        let guardada = null
        try {
          guardada = localStorage.getItem(CLAVE)
        } catch {
          guardada = null
        }
        const sigueSirviendo = guardada && datos.ips.some((d) => d.url === guardada)
        const elegida = sigueSirviendo ? guardada : datos.urlSugerida
        try {
          localStorage.setItem(CLAVE, elegida)
        } catch {
          /* ignore */
        }
        setBase(elegida)
      })
      .catch(() => {
        /* si falla, se queda con window.location.origin */
      })
    return () => {
      vigente = false
    }
  }, [])

  const elegir = useCallback((url) => {
    try {
      localStorage.setItem(CLAVE, url)
    } catch {
      /* ignore */
    }
    setBase(url)
  }, [])

  return { info, base, elegir, local: esAccesoLocal() }
}
