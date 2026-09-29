import { useEffect, useRef } from 'react'

const COLORES = ['#ffd21e', '#e63946', '#1f3b8b', '#17a673', '#7b5ce0', '#ff8a3d']

/**
 * Lluvia de confeti dibujada en canvas.
 * Se activa con la prop `activo` durante `duracion` milisegundos.
 */
export default function Confeti({ activo, duracion = 3200 }) {
  const lienzo = useRef(null)
  const animacion = useRef(null)

  useEffect(() => {
    if (!activo) return
    const canvas = lienzo.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let ancho = (canvas.width = window.innerWidth)
    let alto = (canvas.height = window.innerHeight)

    const piezas = Array.from({ length: 130 }, () => ({
      x: Math.random() * ancho,
      y: Math.random() * -alto,
      w: 6 + Math.random() * 8,
      h: 8 + Math.random() * 10,
      color: COLORES[Math.floor(Math.random() * COLORES.length)],
      vel: 2 + Math.random() * 3.5,
      giro: Math.random() * Math.PI,
      giroVel: (Math.random() - 0.5) * 0.2,
      balanceo: Math.random() * 2,
    }))

    const redimensionar = () => {
      ancho = canvas.width = window.innerWidth
      alto = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', redimensionar)

    const inicio = performance.now()

    const dibujar = (ahora) => {
      const transcurrido = ahora - inicio
      ctx.clearRect(0, 0, ancho, alto)

      for (const p of piezas) {
        p.y += p.vel
        p.giro += p.giroVel
        p.x += Math.sin(p.y / 28) * p.balanceo

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.giro)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()

        if (p.y > alto + 20) {
          p.y = -20
          p.x = Math.random() * ancho
        }
      }

      // Se desvanece al final.
      const restante = duracion - transcurrido
      if (restante < 700) ctx.globalAlpha = Math.max(0, restante / 700)

      if (transcurrido < duracion) {
        animacion.current = requestAnimationFrame(dibujar)
      } else {
        ctx.clearRect(0, 0, ancho, alto)
      }
    }

    animacion.current = requestAnimationFrame(dibujar)

    return () => {
      window.removeEventListener('resize', redimensionar)
      if (animacion.current) cancelAnimationFrame(animacion.current)
    }
  }, [activo, duracion])

  if (!activo) return null
  return <canvas ref={lienzo} className="confeti" />
}
