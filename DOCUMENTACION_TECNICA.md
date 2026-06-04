# Documentación Técnica Detallada - izinvoice Frontend

Este documento está dirigido a desarrolladores e ingenieros de software. Describe a nivel de código cómo funciona la arquitectura interna de la aplicación, el manejo de estado, las llamadas a la API y la estructura de autenticación.

---

## 1. Gestión de Estado Global (Zustand)

El proyecto utiliza **Zustand** para la gestión de estados globales, dividiéndolo en *stores* modulares para mantener un código limpio y predecible.

### `useAuthStore` (`src/store/auth.ts`)
Encargado de manejar todo el ciclo de vida de la sesión del usuario y la compañía (Tenant).
- **Variables de estado:**
  - `accessToken` (string | null): JWT Bearer token devuelto por la API.
  - `user` (UserSession | null): Perfil normalizado del usuario (id, username, fullName, role).
  - `company` (CompanySession | null): Entorno de trabajo actual (RUC, nombre, credenciales).
  - `isAuthenticated` (boolean): Bandera de conveniencia para protección de rutas.
- **Acciones principales:**
  - `setSession`: Guarda la sesión en memoria y sincroniza un fallback en cookies (`document.cookie = token=...`) para la capa de Next.js SSR.
  - `clearSession`: Limpia el store local y elimina las cookies.
  - `updateCompanyEnv`: Permite alternar el entorno SUNAT (Beta / Homologación / Producción) en caliente.
- **Persistencia:** Utiliza el middleware `persist` de Zustand, guardando los datos serializados en `localStorage` bajo la key `invoiceflow-auth`.

### `useAppStore` (`src/store/app.ts`)
Encargado de manejar el estado de la UI global.
- Variables como `theme` (light/dark), control del `mobileSidebarOpen` y control de la paleta de comandos (Command Palette / Ctrl+K).

---

## 2. Capa de Servicios y API Client

Toda la comunicación externa con el backend se realiza a través de un Singleton / Wrapper centralizado en `src/services/api-client.ts`.

### `BillingApiClient`
Clase estática que estandariza todas las peticiones `fetch`. 
- **URL Base:** Definida por `process.env.NEXT_PUBLIC_API_URL` con un fallback por defecto a la URL de producción.
- **Intercepción y Cabeceras (Headers):**
  - Automáticamente inyecta `Content-Type: application/json` (o multipart para FormData).
  - **Resolución de Token JWT:** Busca primero en las Cookies (`document.cookie`) y como fallback lee directamente el estado persistido de Zustand en `localStorage` (`invoiceflow-auth`).
  - **Inyección de API Key (SaaS):** Si el contexto actual es un "Tenant", inyecta `X-Api-Key` sacada del store de la compañía.
- **Manejo de Errores:** Centraliza el parseo de la respuesta HTTP, lanzando Excepciones estructuradas si `res.ok` es `false`.

### Endpoints Mapeados Principales
El `BillingApiClient` expone métodos fuertemente tipados que devuelven Promesas para cada módulo:
1. **Autenticación:** `login()`, `me()`
2. **Emisión de Comprobantes:** `createInvoice()`, `createBoleta()`
3. **Notas y Bajas:** `createCreditNote()`, `createDebitNote()`, `cancelDocuments()`
4. **Resúmenes Diarios:** Módulo complejo para agrupar boletas (`previewDailySummary`, `closeDailySummary`, `voidDailySummary`, `pollDailySummaryStatus`).
5. **Catálogos (CRUD):** `listCustomers`, `createCustomer`, `listProducts`, etc.
6. **SaaS Admin:** Endpoints para gestión multi-tenant (`listSaasCompanies`, `createSaasCompany`).

---

## 3. Flujo de Autenticación y Protección de Rutas

La protección de rutas no se maneja únicamente a nivel de Middleware, sino que tiene una capa muy robusta a nivel de `Layout` en el App Router.

### Ciclo de vida en `src/app/dashboard/layout.tsx`
Cada vez que el usuario ingresa al `/dashboard`, el `layout.tsx` ejecuta un flujo estricto:

1. **Espera de Hidratación:** El layout observa `useAuthStore.persist.onFinishHydration()` para garantizar que los datos del localStorage han sido cargados a memoria antes de renderizar la UI.
2. **Redirección No Autenticada:** Si `isAuthenticated` es falso, empuja al usuario de vuelta a `/login`.
3. **Re-validación Silenciosa (Session Refresh):**
   - Dispara `BillingApiClient.me()` en background cada vez que se monta el Dashboard.
   - Si la API responde con la data del usuario, actualiza silenciosamente el `AuthStore` para asegurar que permisos, nombres o roles no hayan cambiado externamente.
   - Si la API devuelve `401 Unauthorized` (Token expirado/inválido), intercepta el error, ejecuta `clearSession()` y expulsa al usuario al Login.
4. **Restricción de Rutas por Rol (RBAC):**
   - Si el rol detectado es `super_admin` (Admin Global SaaS), se bloquea la navegación a rutas de operaciones comerciales locales (como `/dashboard/boletas`) y restringe la vista únicamente a `/dashboard/companies` y reportes globales.

---

## 4. UI Component Architecture

La UI del dashboard está diseñada en base a un layout persistente:
- **`Sidebar` (`src/components/shared/Sidebar.tsx`):** Renderiza dinámicamente los enlaces basados en el Rol del usuario (Muestra links SaaS vs links de Empresa regular).
- **`SearchCommand`:** Un componente global montado a nivel de Layout que captura eventos de teclado globales (ej. `Ctrl+K` o `Cmd+K`) para ofrecer búsqueda omnicanal o atajos a la creación de documentos sin usar el ratón.

## Notas Adicionales para Desarrollo
- **Next.js Caching:** Dado el uso extensivo de `'use client'` en las vistas del dashboard y la dependencia de Zustand (localStorage), la renderización es predominantemente de lado del cliente (CSR) en el dashboard, mientras que la Landing Page es Estática (SSG/ISR).
- **Manejo de CORS:** Para desarrollo local, asegúrate de que el Backend de Mind-Billing tenga el dominio de localhost o el dominio de Vercel en la whitelist de CORS.
