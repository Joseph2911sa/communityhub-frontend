<script setup lang="ts">
const authStore = useAuthStore()
</script>

<template>
  <div class="home">
    <h1 v-if="authStore.isAuthenticated">
      Hola, {{ authStore.user?.firstName }} 👋
    </h1>
    <h1 v-else>Bienvenido a CommunityHub</h1>

    <p>
      CommunityHub es el lugar donde vas a encontrar y organizar actividades
      de tu comunidad. Muy pronto vas a poder explorar, inscribirte y
      gestionar tus propias actividades desde acá.
    </p>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.home h1 {
  font-size: 1.75rem;
  color: #111827;
}

.home p {
  color: #4b5563;
  line-height: 1.6;
  max-width: 60ch;
}
</style>
