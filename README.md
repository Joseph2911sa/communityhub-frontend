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

La aplicación queda disponible en `http://localhost:3001` (o el puerto que indique Nuxt en consola).

> Nota: el backend corre por defecto en el puerto 3000, así que si levantas ambos a la vez, Nuxt tomará automáticamente otro puerto libre (usualmente 3001).

## ✅ Estado actual — Avance 1

- [x] Proyecto Nuxt 4 inicializado
- [ ] TypeScript + Pinia configurados
- [ ] Progressive Web App (manifest + service worker) — próximo avance
- [ ] Páginas (Inicio, Login, Registro, Actividades, etc.)
- [ ] Consumo de la API del backend

## 📂 Estructura

```
communityhub-frontend/
├── app/
│   └── app.vue
├── public/
├── nuxt.config.ts
├── tsconfig.json
├── package.json
└── README.md
```
