<script setup lang="ts">
definePageMeta({
  middleware: [
    () => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        return navigateTo('/login')
      }
      if (!authStore.isAdmin) {
        return navigateTo('/actividades')
      }
    }
  ]
})
</script>

<template>
  <div class="admin">
    <h1>Panel de administración</h1>

    <div class="admin-grid">
      <NuxtLink to="/admin/users" class="admin-card">
        <h2>Usuarios</h2>
        <p>Gestiona roles y el estado de las cuentas registradas.</p>
      </NuxtLink>
      <NuxtLink to="/admin/categories" class="admin-card">
        <h2>Categorías</h2>
        <p>Crea, edita y elimina las categorías de actividades.</p>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.admin {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.admin h1 {
  font-size: 1.75rem;
  color: #111827;
}

.admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}

.admin-card {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 1.25rem;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-decoration: none;
  transition: border-color 0.15s ease;
}

.admin-card:hover {
  border-color: #111827;
}

.admin-card h2 {
  font-size: 1.1rem;
  color: #111827;
}

.admin-card p {
  font-size: 0.9rem;
  color: #6b7280;
}
</style>
