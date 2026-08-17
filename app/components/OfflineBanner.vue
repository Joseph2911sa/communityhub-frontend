<script setup lang="ts">
// navigator.onLine solo existe en el navegador — arranca en `false`
// (no en `true`) para que el estado inicial sea idéntico en servidor y
// cliente y no dispare un hydration mismatch; se corrige apenas monta
// en el cliente, antes de que el usuario llegue a notarlo.
const isOffline = ref(false)

// Reacciona rápido a cambios en vivo (transición online<->offline con
// la página ya abierta). navigator.onLine SÍ es confiable para esto.
function updateOnlineStatus() {
  isOffline.value = !navigator.onLine
}

// Confirmado con evidencia: justo después de un F5 con DevTools en
// modo Offline, navigator.onLine puede devolver "true" incorrectamente,
// y el evento 'offline' que normalmente lo corrige no llega a
// disparar en ese escenario específico. Como respaldo del chequeo
// inicial, se intenta una petición real y rápida contra el propio
// origen (el manifest, que ya está cacheado) — si falla, es señal
// confiable de estar offline de verdad, sin importar lo que diga
// navigator.onLine.
async function checkRealConnectivity() {
  if (!navigator.onLine) {
    isOffline.value = true
    return
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    await fetch('/manifest.webmanifest', {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    isOffline.value = false
  } catch {
    isOffline.value = true
  }
}

onMounted(() => {
  updateOnlineStatus()
  checkRealConnectivity()
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})
</script>

<template>
  <div v-if="isOffline" class="offline-banner" role="status">
    Sin conexión — mostrando información guardada
  </div>
</template>

<style scoped>
.offline-banner {
  padding: 0.6rem 1rem;
  background-color: #b91c1c;
  color: #ffffff;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
}
</style>
