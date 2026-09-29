/** Pequeños componentes de interfaz reutilizables. */

export function Cargando({ texto = 'Cargando…' }) {
  return (
    <div className="cargando">
      <div className="girador" />
      <span>{texto}</span>
    </div>
  )
}

export function Vacio({ emoji = '🔍', titulo, texto, children }) {
  return (
    <div className="vacio">
      <span className="emoji">{emoji}</span>
      {titulo && <h3>{titulo}</h3>}
      {texto && <p>{texto}</p>}
      {children}
    </div>
  )
}

export function EtiquetaGrado({ grado }) {
  const g = Number(grado)
  const nivel = g <= 5 ? 'Primaria' : 'Secundaria'
  return <span className="etiqueta-grado">{g}° · {nivel}</span>
}

export function Campo({ etiqueta, ayuda, children }) {
  return (
    <div className="campo">
      {etiqueta && <label>{etiqueta}</label>}
      {children}
      {ayuda && <div className="ayuda">{ayuda}</div>}
    </div>
  )
}
