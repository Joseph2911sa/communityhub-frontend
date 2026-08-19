<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    profilePicture: string | null
    fullName: string
    size?: number
  }>(),
  { size: 32 }
)

// Mismo criterio que ya existía en perfil.vue (firstName.charAt(0) +
// lastName.charAt(0)): iniciales en mayúscula, máximo 2 letras. Acá se
// deriva de fullName en vez de firstName/lastName sueltos porque el
// componente solo recibe el nombre ya compuesto -- para un nombre de
// dos palabras el resultado es idéntico.
const initials = computed(() => {
  return props.fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
})

const sizeStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  fontSize: `${props.size * 0.4}px`
}))
</script>

<template>
  <img
    v-if="profilePicture"
    :src="profilePicture"
    :alt="fullName"
    class="user-avatar"
    :style="sizeStyle"
  />
  <div v-else class="user-avatar user-avatar--placeholder" :style="sizeStyle">
    {{ initials }}
  </div>
</template>

<style scoped>
.user-avatar {
  flex-shrink: 0;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e5e7eb;
}

.user-avatar--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e5e7eb;
  color: #4b5563;
  font-weight: 700;
}
</style>
