import { useConexion } from '../lib/conexion.js'
import { copiarTexto } from '../lib/util.js'
import Boton from '../components/Boton.jsx'
import CodigoQR from '../components/CodigoQR.jsx'

/** Página de conexión: cómo entran los estudiantes desde el celular. */
export default function Conexion() {
  const { info, base, elegir, local } = useConexion()
  const ips = info?.ips || []

  return (
    <div>
      <h2 style={{ marginBottom: 4 }}>📡 Conexión para los estudiantes</h2>
      <p className="ayuda" style={{ marginBottom: 18 }}>
        <strong>No necesitas internet ni hosting.</strong> El juego corre en este computador y los
        estudiantes entran por la red WiFi del colegio.
      </p>

      <div className="tarjeta caja-qr">
        <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Dirección que deben usar</h3>
        <div className="codigo-chip" style={{ fontSize: '1.15rem', letterSpacing: 0, padding: '10px 20px' }}>
          {base}
        </div>
        <CodigoQR texto={base} tamano={230} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Boton
            variante="fantasma"
            mini
            onClick={async () => {
              const ok = await copiarTexto(base)
              alert(ok ? 'Enlace copiado' : base)
            }}
          >
            📋 Copiar enlace
          </Boton>
          <Boton variante="fantasma" mini onClick={() => window.open(base, '_blank')}>
            👁️ Abrir en otra pestaña
          </Boton>
        </div>

        {local && (
          <div className="aviso" style={{ marginTop: 14, marginBottom: 0, textAlign: 'left' }}>
            Estás abriendo la app en <code>localhost</code>. Por eso los QR y los enlaces usan
            automáticamente la dirección de tu red. Funciona igual si abres la app desde otro
            computador con la misma WiFi.
          </div>
        )}
      </div>

      <div className="tarjeta">
        <h3 style={{ fontSize: '1.05rem' }}>Direcciones detectadas en este computador</h3>
        <p className="ayuda">
          Si aparece más de una (por WSL, una VPN o Bluetooth), elige la de tu WiFi.
        </p>

        {ips.length === 0 ? (
          <p className="ayuda">
            No se detectó ninguna red local. Conéctate al WiFi del colegio y reinicia el servidor.
          </p>
        ) : (
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Dirección</th>
                  <th>Interfaz</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ips.map((d) => (
                  <tr key={d.ip}>
                    <td>
                      <strong>{d.url}</strong>
                      {d.virtual && <span className="ayuda"> (virtual)</span>}
                    </td>
                    <td>{d.interfaz}</td>
                    <td>
                      {d.url === base ? (
                        <span className="exito" style={{ margin: 0, padding: '6px 12px' }}>
                          En uso
                        </span>
                      ) : (
                        <Boton variante="primario" mini onClick={() => elegir(d.url)}>
                          Usar esta
                        </Boton>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="tarjeta">
        <h3 style={{ fontSize: '1.05rem' }}>Si el celular no carga la página</h3>
        <ol className="lista-pasos">
          <li>
            <strong>Misma red WiFi.</strong> El celular debe estar en el WiFi del colegio, no en
            datos móviles. (El celular y el computador deben estar en la <em>misma</em> red.)
          </li>
          <li>
            <strong>Firewall de Windows.</strong> Es la causa más común. Abre una terminal{' '}
            <strong>como administrador</strong> y ejecuta:
            <div className="comando">npm run firewall</div>
          </li>
          <li>
            <strong>Redes de invitados.</strong> Muchos WiFi de visita bloquean la comunicación entre
            dispositivos. Usa el WiFi normal del colegio.
          </li>
          <li>
            <strong>VPN activa.</strong> Si el computador o el celular tienen una VPN encendida,
            desactívenla.
          </li>
          <li>
            <strong>Prueba rápida.</strong> Desde el celular abre el navegador y escribe la dirección
            de arriba. Si tampoco carga, es un tema de red o firewall, no del juego.
          </li>
        </ol>
      </div>
    </div>
  )
}
