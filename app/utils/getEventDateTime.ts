// Mismo criterio que el backend (src/utils/getEventDateTime.js en
// communityhub-backend) para combinar `date` (ancla a medianoche UTC
// del día calendario) + `time` ("HH:mm") en el instante real en que
// ocurre la actividad.
//
// OJO: a diferencia del backend (que compara contra su propia hora de
// servidor, America/Costa_Rica), esto se evalúa con la hora LOCAL del
// navegador de quien lo mira — si el usuario está en otra zona horaria
// puede haber una pequeña discrepancia entre lo que ve acá y lo que el
// backend efectivamente permite. Caso límite aceptado, no se resuelve
// acá.
export function getEventDateTime(dateIso: string, time: string): Date {
  const date = new Date(dateIso)
  const [hours, minutes] = time.split(':').map(Number)
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    hours,
    minutes,
    0,
    0
  )
}

export function isEventFinished(dateIso: string, time: string): boolean {
  return getEventDateTime(dateIso, time) < new Date()
}
