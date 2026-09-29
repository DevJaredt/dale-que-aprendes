import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

/** Genera un código QR (en el navegador) para un enlace o texto. */
export default function CodigoQR({ texto, tamano = 200 }) {
  const [imagen, setImagen] = useState('')

  useEffect(() => {
    if (!texto) return
    let vigente = true
    QRCode.toDataURL(texto, {
      width: tamano,
      margin: 1,
      color: { dark: '#17233d', light: '#ffffff' },
    })
      .then((url) => {
        if (vigente) setImagen(url)
      })
      .catch(() => {})
    return () => {
      vigente = false
    }
  }, [texto, tamano])

  if (!imagen) return null
  return <img src={imagen} alt="Código QR para entrar a la tarea" width={tamano} height={tamano} />
}
