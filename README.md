# izinvoice - Plataforma de Facturación Electrónica

**izinvoice** es una plataforma moderna y escalable (SaaS) desarrollada para gestionar la facturación electrónica corporativa, conectada directamente con los sistemas OSE/PSE autorizados por la SUNAT en Perú.

## 🚀 Tecnologías Core

El proyecto ha sido desarrollado utilizando las herramientas más modernas del ecosistema de React, buscando máximo rendimiento y una experiencia de usuario (UX/UI) fluida y premium:

- **Framework:** [Next.js 14+ (App Router)](https://nextjs.org/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Animaciones:** [Framer Motion](https://www.framer.com/motion/)
- **Iconos:** [Lucide React](https://lucide.dev/)
- **Gestión de Estado:** [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) (Para manejo de sesión, temas y estado global)

## 📁 Estructura del Proyecto

La estructura sigue la arquitectura recomendada por Next.js App Router:

```text
src/
├── app/
│   ├── layout.tsx         # Layout principal global (fuentes, metadata)
│   ├── page.tsx           # Landing Page interactiva y promocional
│   ├── login/             # Pantalla de Autenticación (Split UI Premium)
│   └── dashboard/         # Sistema privado (CRM y Emisión)
│       ├── layout.tsx     # Layout privado con Sidebar y Ctrl+K
│       ├── page.tsx       # Panel de control / Resumen
│       ├── boletas/       # Emisión de Boletas/Facturas
│       ├── inovoices/     # Historial de comprobantes
│       ├── products/      # Catálogo de ítems
│       ├── customers/     # Base de datos de clientes
│       └── settings/      # Configuración de empresa / local
├── components/
│   └── shared/            # Componentes reutilizables (Sidebar, CMD Palette)
├── store/                 # Almacenamiento global Zustand (auth, app)
├── services/              # Cliente API y conexión externa
└── lib/                   # Utilidades y funciones de soporte
```

## ⚙️ Características Principales (Frontend)

1. **Diseño Premium e Intuitivo:** Interfaces estilo "Glassmorphism", animaciones suaves y componentes altamente interactivos.
2. **Landing Page Optimizada:** Optimizada para conversión con llamados a la acción claros y demostraciones visuales simuladas.
3. **Multi-Sucursal Dinámico:** Capacidad para alternar rápidamente entre puntos de venta sin recargar.
4. **Respuesta Inmediata:** Gracias a la persistencia del estado global con Zustand y Next.js.
5. **Comandos Globales (Ctrl+K):** Paleta de búsqueda rápida accesible desde cualquier parte del dashboard.

## 💻 Desarrollo Local

Para ejecutar este proyecto en tu entorno local:

1. Asegúrate de tener instalado [Node.js](https://nodejs.org/es/) (v18 o superior) y **pnpm** o npm.
2. Clona el repositorio e instala las dependencias:
   ```bash
   pnpm install
   ```
3. Ejecuta el servidor de desarrollo:
   ```bash
   pnpm dev
   ```
4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

## 📦 Despliegue (Deploy)

El proyecto está optimizado de manera nativa para desplegarse fácilmente en plataformas como **Vercel** o **AWS Amplify**. Simplemente enlaza este repositorio a Vercel y este detectará automáticamente la configuración de Next.js.

## 🤝 Soporte y Contacto

Para incidencias técnicas del frontend o integraciones de API, por favor comunícate con el equipo de infraestructura de izinvoice.
