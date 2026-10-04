# Abre el puerto del juego en el firewall de Windows.
#
# Sin esto, el celular puede estar en la misma WiFi y aun así no cargar
# la página, porque Windows bloquea las conexiones entrantes.
#
# Se debe ejecutar como ADMINISTRADOR:   npm run firewall

$ErrorActionPreference = 'Stop'

$puerto = if ($args.Count -ge 1 -and $args[0]) { $args[0] } else { '3000' }
$nombre = "Dale Que Aprendes (puerto $puerto)"

$esAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
  [Security.Principal.WindowsBuiltInRole]::Administrator
)

if (-not $esAdmin) {
  Write-Host ''
  Write-Host '  X  Este comando necesita permisos de administrador.' -ForegroundColor Yellow
  Write-Host '     Cierra esta ventana, abre PowerShell como administrador'
  Write-Host '     (clic derecho en Inicio -> Terminal (administrador))'
  Write-Host '     y vuelve a ejecutar:  npm run firewall'
  Write-Host ''
  exit 1
}

$regla = Get-NetFirewallRule -DisplayName $nombre -ErrorAction SilentlyContinue
if ($regla) {
  Write-Host ''
  Write-Host "  La regla '$nombre' ya existe. No se cambió nada." -ForegroundColor Cyan
  Write-Host ''
  exit 0
}

New-NetFirewallRule `
  -DisplayName $nombre `
  -Description 'Permite que los estudiantes entren al juego desde sus celulares en la red del colegio.' `
  -Direction Inbound `
  -Action Allow `
  -Protocol TCP `
  -LocalPort $puerto `
  -Profile Private | Out-Null

Write-Host ''
Write-Host "  OK  Se abrió el puerto $puerto para redes privadas." -ForegroundColor Green
Write-Host '      Los estudiantes ya pueden entrar desde sus celulares.'
Write-Host ''
Write-Host '      Para quitarla algún día:' -ForegroundColor DarkGray
Write-Host "        Remove-NetFirewallRule -DisplayName '$nombre'" -ForegroundColor DarkGray
Write-Host ''
