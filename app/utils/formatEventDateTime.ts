// Fecha/hora de un evento en español. Usa timeZone: 'UTC' porque el
// backend guarda la hora del evento como si fuera UTC (coincide con el
// campo `time` tal cual), así que formatear en la zona local del
// navegador/servidor desplazaría la hora mostrada.
const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC'
})
const timeFormatter = new Intl.DateTimeFormat('es-ES', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'UTC'
})

export function formatEventDateTime(dateIso: string): string {
  const date = new Date(dateIso)
  return `${dateFormatter.format(date)}, ${timeFormatter.format(date)}`
}
