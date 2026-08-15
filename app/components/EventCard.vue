<script setup lang="ts">
// Acepta tanto un Event completo (GET /events, /events/:id) como el
// evento parcial que vienen poblado dentro de una Registration o un
// Favorite (GET /users/me/registrations, /users/me/favorites) — esas
// respuestas no traen category/maxCapacity/organizer, así que esos
// campos son opcionales acá y sus filas se ocultan si no vienen.
interface EventCardData {
  _id: string
  title: string
  category?: { name: string }
  date: string
  time: string
  location: string
  maxCapacity?: number
  organizer?: { firstName: string; lastName: string }
}

defineProps<{
  event: EventCardData
}>()
</script>

<template>
  <article class="card">
    <h2 class="card__title">{{ event.title }}</h2>
    <p v-if="event.category" class="card__category">{{ event.category.name }}</p>

    <dl class="card__details">
      <div class="card__row">
        <dt>Fecha</dt>
        <dd>{{ formatEventDateTime(event.date, event.time) }}</dd>
      </div>
      <div class="card__row">
        <dt>Lugar</dt>
        <dd>{{ event.location }}</dd>
      </div>
      <div v-if="event.maxCapacity !== undefined" class="card__row">
        <dt>Capacidad</dt>
        <dd>{{ event.maxCapacity }} personas</dd>
      </div>
      <div v-if="event.organizer" class="card__row">
        <dt>Organiza</dt>
        <dd>{{ event.organizer.firstName }} {{ event.organizer.lastName }}</dd>
      </div>
    </dl>

    <NuxtLink :to="`/actividades/${event._id}`" class="card__link">Ver detalle</NuxtLink>

    <slot name="actions" />
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.card__title {
  font-size: 1.15rem;
  color: #111827;
}

.card__category {
  display: inline-block;
  align-self: flex-start;
  font-size: 0.8rem;
  font-weight: 600;
  color: #111827;
  background-color: #f3f4f6;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.card__details {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin: 0;
}

.card__row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.9rem;
}

.card__row dt {
  color: #6b7280;
}

.card__row dd {
  margin: 0;
  color: #1f2937;
  text-align: right;
}

.card__link {
  margin-top: auto;
  align-self: flex-start;
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  text-decoration: none;
  border-bottom: 1px solid #111827;
}

.card__link:hover {
  color: #1f2937;
}
</style>
