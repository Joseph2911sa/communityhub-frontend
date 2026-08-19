# CommunityHub — Frontend

Aplicación web construida con **Nuxt 4 / Vue 3**, consumidora de la API REST del backend de CommunityHub.

## 📦 Requisitos

- Node.js 18+
- El [backend de CommunityHub](https://github.com/TU-USUARIO/communityhub-backend) corriendo (para consumir la API)

## ⚙️ Instalación

```bash
npm install
```

## ▶️ Ejecución

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:3001`.

> Nota: el puerto 3001 queda fijo por configuración (`devServer.port` en `nuxt.config.ts`), independiente de qué puerto use el backend.

## ✅ Estado actual

- [x] Proyecto Nuxt 4 inicializado
- [x] TypeScript + Pinia configurados
- [x] Progressive Web App (manifest + service worker + funcionalidad offline)
- [x] Páginas: Inicio, Login, Registro, Actividades, Actividad/:id, Favoritos, Mis actividades, Mis inscripciones, Perfil, Dashboard, Notificaciones, /admin (con sus 4 secciones: Usuarios, Categorías, Actividades, Estadísticas)
- [x] Consumo de la API del backend

## 📂 Estructura

```
communityhub-frontend/
├── app/
│   ├── components/     # EventCard, ActivityForm, UserAvatar, OfflineBanner
│   ├── composables/    # useApi
│   ├── layouts/        # default.vue (navbar + layout base)
│   ├── pages/           # Rutas de la app (ver lista de páginas arriba)
│   ├── plugins/         # auth.ts (hidrata la sesión al arrancar la app)
│   ├── stores/           # Pinia: auth, notifications
│   ├── types/             # Interfaces TypeScript (User, Event, Category, Registration, Favorite, Notification)
│   ├── utils/              # Funciones puras auto-importadas (fechas, validación de foto, base64)
│   └── app.vue
├── public/
│   ├── icons/               # Íconos de la PWA
│   ├── favicon.ico
│   └── robots.txt
├── nuxt.config.ts
├── tsconfig.json
├── package.json
└── README.md
```
