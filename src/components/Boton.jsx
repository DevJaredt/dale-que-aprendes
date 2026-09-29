import { cx } from '../lib/util.js'
import { sonidos } from '../lib/sonidos.js'

/**
 * Botón con variantes de color y tamaño.
 * variante: 'primario' | 'amarillo' | 'verde' | 'rojo' | 'fantasma'
 */
export default function Boton({
  children,
  variante = 'primario',
  tamano,
  bloque,
  mini,
  icono,
  className,
  onClick,
  sonido = true,
  ...resto
}) {
  const clases = cx(
    'boton',
    `boton-${variante}`,
    tamano === 'grande' && 'boton-grande',
    bloque && 'boton-bloque',
    mini && 'boton-mini',
    icono && 'boton-icono',
    className
  )

  return (
    <button
      type="button"
      className={clases}
      onClick={(e) => {
        if (sonido && !resto.disabled) sonidos.clic()
        onClick?.(e)
      }}
      {...resto}
    >
      {children}
    </button>
  )
}
