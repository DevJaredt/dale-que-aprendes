/**
 * Efectos de sonido generados con la Web Audio API.
 * No se necesitan archivos de audio: todo se sintetiza en el navegador.
 */

let contexto = null
let habilitado = true

try {
  const guardado = localStorage.getItem('dqa_sonido')
  if (guardado === 'off') habilitado = false
} catch {
  /* localStorage no disponible */
}

function ctx() {
  if (!habilitado) return null
  if (!contexto) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    contexto = new AC()
  }
  if (contexto.state === 'suspended') contexto.resume().catch(() => {})
  return contexto
}

function tono(frecuencia, inicio, duracion, tipo = 'sine', volumen = 0.15) {
  const c = ctx()
  if (!c) return
  const osc = c.createOscillator()
  const gan = c.createGain()
  osc.type = tipo
  osc.frequency.setValueAtTime(frecuencia, c.currentTime + inicio)
  gan.gain.setValueAtTime(0.0001, c.currentTime + inicio)
  gan.gain.exponentialRampToValueAtTime(volumen, c.currentTime + inicio + 0.02)
  gan.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + inicio + duracion)
  osc.connect(gan)
  gan.connect(c.destination)
  osc.start(c.currentTime + inicio)
  osc.stop(c.currentTime + inicio + duracion + 0.05)
}

export const sonidos = {
  get habilitado() {
    return habilitado
  },
  alternar() {
    habilitado = !habilitado
    try {
      localStorage.setItem('dqa_sonido', habilitado ? 'on' : 'off')
    } catch {
      /* ignore */
    }
    if (habilitado) this.clic()
    return habilitado
  },
  clic() {
    tono(520, 0, 0.06, 'triangle', 0.08)
  },
  correcto() {
    tono(660, 0, 0.12, 'sine', 0.16)
    tono(880, 0.1, 0.16, 'sine', 0.16)
  },
  incorrecto() {
    tono(300, 0, 0.16, 'sawtooth', 0.1)
    tono(200, 0.12, 0.22, 'sawtooth', 0.1)
  },
  tic() {
    tono(1000, 0, 0.03, 'square', 0.04)
  },
  victoria() {
    const notas = [523, 659, 784, 1047]
    notas.forEach((n, i) => tono(n, i * 0.13, 0.2, 'sine', 0.16))
  },
  /** Aviso corto cuando alguien termina una tarea (modo clase en vivo). */
  nuevo() {
    tono(784, 0, 0.12, 'sine', 0.14)
    tono(1047, 0.11, 0.18, 'sine', 0.14)
  },
  derrota() {
    const notas = [440, 392, 330, 262]
    notas.forEach((n, i) => tono(n, i * 0.15, 0.22, 'triangle', 0.13))
  },
}
