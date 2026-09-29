import { Component } from 'react'

/**
 * Barrera de errores: si algo falla al dibujar una pantalla, muestra un mensaje
 * amigable en lugar de dejar la página completamente en blanco.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[DaleQueAprendes] Error de interfaz:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="contenedor-angosto">
          <div className="tarjeta vacio">
            <span className="emoji">😵</span>
            <h3>Ups, algo salió mal</h3>
            <p>La pantalla se detuvo, pero no se perdió nada. Intenta de nuevo.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="boton boton-primario"
                onClick={() => this.setState({ error: null })}
              >
                🔄 Reintentar
              </button>
              <button
                className="boton boton-fantasma"
                onClick={() => {
                  window.location.href = '/'
                }}
              >
                🏠 Ir al inicio
              </button>
            </div>
            <p className="ayuda" style={{ marginTop: 14 }}>
              Detalle técnico: {String(this.state.error?.message || this.state.error)}
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
