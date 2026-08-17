<template>
  <div>
    <!-- @vite-pwa/nuxt no inyecta el <link rel="manifest"> por su
    cuenta: hay que renderizar este componente explícitamente. -->
    <VitePwaManifest />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
