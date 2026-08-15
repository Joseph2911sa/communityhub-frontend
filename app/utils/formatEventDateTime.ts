// Fecha de un evento en español. Usa timeZone: 'UTC' porque el backend
// guarda `date` a medianoche UTC (la hora real vive por separado en el
// campo `time`), así que formatear en la zona local del
// navegador/servidor desplazaría el día mostrado.
const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC'
})

// La hora NO se lee del objeto Date (el backend no combina date+time al
// crear/editar vía la API, así que el time-of-day de `date` es siempre
// medianoche) — se formatea directo desde el string "HH:MM" del campo
// `time`, evitando por completo cualquier problema de timezone.
export function formatEventDateTime(dateIso: string, time: string): string {
  const date = new Date(dateIso)
  const dateFormatted = dateFormatter.format(date)

  const parts = time.split(':').map(Number)
  const hours = parts[0] ?? 0
  const minutes = parts[1] ?? 0
  const period = hours >= 12 ? 'p. m.' : 'a. m.'
  const hours12 = hours % 12 === 0 ? 12 : hours % 12
  const timeFormatted = `${hours12}:${String(minutes).padStart(2, '0')} ${period}`

  return `${dateFormatted}, ${timeFormatted}`
}
