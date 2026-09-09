# Piano Colombia — Estado del Proyecto & Cronograma

> **Última actualización:** 5 de Septiembre, 2026  
> **Proyecto:** Reescritura integral de Piano Colombia (Medusa.js 2.x + Next.js 16)  
> **Estado:** 🚀 Backend Medusa 2.x + PostgreSQL 13 Conectado | 💳 Wompi Checkout & Dispersión 80/20 Activos | 📄 Motor de Estampado PDF con `pdf-lib` Operativo | 🔐 Sistema de Autenticación & Sesiones en 3 Roles Activo | 📦 28/28 Rutas Compiladas Limpiamente

---

## 📍 Estado Actual & Avances de Integración (5 Sept 2026)

- ✅ **Conexión Real Backend & Base de Datos:** PostgreSQL 13 (`piano_colombia_db`) y Medusa 2.18.0 configurados y migrados con 5 módulos DML personalizados (`composer`, `score`, `download`, `payout`, `cms`).
- ✅ **Estampado Dinámico de Licencias Legales:** Motor de PDF watermarking con `pdf-lib` operativo (`/store/downloads/:token`), agregando leyenda nominativa al pie de cada página.
- ✅ **Flujos de Autenticación y Formularios:** `AuthContext` unificado para Cliente (`/login`), Compositor (`/compositor/login` y `/compositor/registro`) y Administrador (`/admin/login`).
- ✅ **Dispersión Masiva Wompi 80/20:** Módulo de liquidación y pagos masivos a cuentas bancarias y Nequi (`/admin/pagos`) conectado a la API de Medusa (`POST /admin/payouts/execute`).
- ✅ **Subida de Obras:** Formulario de nuevas partituras (`/compositor/dashboard/partituras/nueva`) conectado con `POST /store/scores` en estado `IN_REVIEW`.
- ✅ **Cero Errores:** 28 rutas verificadas y compiladas exitosamente con `npm run build`.

---

## 📊 Vista General de Progreso Frontend & Backend

```
Fase 1: Fundación y Storefront Público  [██████████] 100%
Fase 2: Portal de Compositores         [██████████] 100%
Fase 3: Carrito & Checkout Wompi       [██████████] 100%
Fase 4: Consola Admin (RBAC, CMS, Wompi)[██████████] 100%
Fase 5: Seguridad, SEO y Polish        [██████████] 100%
Fase 6: Blog & Actualidad Musical      [██████████] 100%
Fase 7: Conexión Backend Medusa 2.x    [█████████░] 90%  (Base de Datos, APIs, Wompi, Dispersión, Estampado PDF y Auth Activos)
```

---

## 🗓️ Cronograma General de Trabajo

| Semanas | Fase / Hito | Objetivo Principal | Estado |
|---|---|---|---|
| **Sem 1 - 4** | **Fase 1: Fundación y Storefront** | Setup Medusa 2.x + Next.js, Design System Stitch, UI Páginas Públicas | ✅ Completado |
| **Sem 5 - 7** | **Fase 2: Portal Compositores** | Formulario registro con aprobación admin, Dashboard, Upload y datos bancarios Wompi | ✅ Completado |
| **Sem 8 - 10** | **Fase 3: Carrito & Checkout Wompi** | Carrito con `CartContext`, Checkout Widget Wompi (COP/USD), descargas estampadas | ✅ Completado |
| **Sem 11 - 13** | **Fase 4: Admin & Dispersión Wompi** | Login Admin (`/admin/login`), Roles RBAC (`/admin/usuarios`), Dispersión Wompi (`/admin/pagos`), CMS Hero y Plantillas Resend | ✅ Completado |
| **Sem 14 - 15** | **Fase 5: Seguridad & SEO** | Sitemap XML, Robots.txt, 404 personalizada, cabeceras HTTP y build verificado (27/27 rutas) | ✅ Completado |
| **Sem 16** | **Fase 6: Blog & GitHub Push** | Módulo Blog (`/blog`), artículo individual y sincronización con GitHub | ✅ Completado |
| **Sem 17+** | **Fase 7: Backend Real Medusa.js** | Conexión con PostgreSQL, Redis, Webhooks Wompi, Cloudflare R2 y Resend API | ⏳ Próximo Paso |

---

## 📝 Detalle de Componentes & Vistas Desarrolladas (27 Rutas)

### 🛒 1. Storefront Público & Cliente
- [x] **Home / Inicio (`/`)**: Hero banner administrable, partitura destacada, categorías, compositores y noticias.
- [x] **Tienda / Catálogo (`/tienda`)**: Filtros por nivel, categoría y rango de precio en COP/USD.
- [x] **Compositores (`/compositores` & `/compositores/[slug]`)**: Directorio y ficha pública con biografía bilingüe.
- [x] **Detalle Partitura (`/partitura/[slug]`)**: Visor protegido con opacidad al 40%, blur progresivo y marca de agua diagonal.
- [x] **Carrito de Compras (`/carrito`)**: Estado global `CartContext`, selector de licencias, cupones y contador badge en `Header.tsx`.
- [x] **Checkout Unificado Wompi (`/checkout`)**: Widget Wompi ES/EN para Tarjetas Internacionales (Visa/MC/Amex), PSE, Nequi, Daviplata y Bancolombia.
- [x] **Mi Cuenta / Descargas (`/mi-cuenta/descargas`)**: Panel de descargas del cliente con comprobante de estampa legal.

### 🎵 2. Portal de Compositores
- [x] **Registro de Compositor (`/compositor/registro`)**: Formulario con datos bancarios para dispersión Wompi y estado `Pendiente de Aprobación`.
- [x] **Inicio de Sesión (`/compositor/login`)**: Formulario de acceso con credenciales demo.
- [x] **Tablero de Ventas (`/compositor/dashboard`)**: Métricas de ganancia bruta, comisión 20% PC y 80% neto autor.
- [x] **Subida de Partitura (`/compositor/dashboard/partituras/nueva`)**: Dropzone PDF y calculadora en tiempo real.
- [x] **Historial de Liquidaciones Wompi (`/compositor/dashboard/pagos`)**: Registro de transferencias quincenales Wompi API a cuentas de ahorro/corriente o bolsillos Nequi/Daviplata.
- [x] **Perfil Bilingüe (`/compositor/dashboard/perfil`)**: Edición de ficha de autor, foto oficial y cuenta Wompi.

### 🏢 3. Consola Administrativa Piano Colombia
- [x] **Login Admin Standalone (`/admin/login`)**: Pantalla limpia independiente con selector de perfiles demo en 1-clic.
- [x] **Dashboard Global Admin (`/admin/dashboard`)**: Métricas de ventas de la plataforma y comisiones.
- [x] **Aprobación de Compositores (`/admin/compositores`)**: Módulo para revisar solicitudes y **Aprobar** (✅) o **Rechazar** (❌) con motivo.
- [x] **Aprobación de Partituras (`/admin/partituras`)**: Moderación técnica de PDFs antes de publicar en tienda.
- [x] **Gestor CMS del Hero (`/admin/cms`)**: Control de textos H1, descripción, botones 1 y 2, leyenda Urtext y partitura destacada con vista previa en vivo.
- [x] **Dispersión Masiva Wompi (`/admin/pagos`)**: Ejecución masiva de lotes de pago Wompi API (80%), desglose 20% PC y certificados fiscales.
- [x] **Usuarios & Roles RBAC (`/admin/usuarios`)**: Control de acceso para personal interno (*Super Admin*, *Editor CMS*, *Moderador*, *Tesorero Wompi*).
- [x] **Inspector de Plantillas Email (`/admin/emails`)**: Visor de las plantillas transaccionales HTML de Resend.

---

## ⏳ PENDIENTES CON RESPECTO AL PLAN DE TRABAJO ORIGINAL (Fase Backend Real)

Con la maquetación del frontend 100% terminada y verificada, los siguientes puntos corresponden al **desarrollo y conexión del Backend real con Medusa.js 2.x**:

### 1. 🗄️ Base de Datos PostgreSQL & Esquemas Medusa.js 2.x
- [ ] Configurar las entidades en PostgreSQL para **Compositores** (`Composer`), **Partituras/Scores** (`Product/Variant`), **Descargas de Clientes** (`CustomerDownload`) y **Lotes de Liquidación** (`PayoutBatch`).
- [ ] Implementar la persistencia de usuarios administrativos y tabla de **Roles y Permisos Granulares (RBAC)** en la base de datos.

### 2. 💳 Integración en Vivo con Wompi API (Producción & Sandbox)
- [ ] Configurar los **Webhooks de Wompi** (`transaction.updated`) en el backend de Medusa para cambiar automáticamente el estado del pedido a `paid` tras la aprobación del pago.
- [ ] Conectar la API de **Dispersión Masiva de Wompi** para procesar los lotes de transferencia directa a las cuentas bancarias/Nequi de los compositores desde `/admin/pagos`.

### 3. 🛡️ Servicio de Almacenamiento & Estampado PDF (Cloudflare R2 + Worker)
- [ ] Configurar el bucket privado en **Cloudflare R2** para almacenar los PDFs originales sin marca de agua.
- [ ] Desarrollar el microservicio/Worker de estampado dinámico de marca de agua en PDF (usando `pdf-lib` o servicio S3) que estampe el Nombre del Cliente + Email + ID de Transacción Wompi al confirmar la compra.
- [ ] Generación de enlaces de descarga firmados con expiración temporal (Presigned URLs R2).

### 4. 📧 Integración con el Servicio de Correos (Resend API)
- [ ] Conectar las plantillas HTML inspeccionadas en `/admin/emails` con los eventos del backend de Medusa.js 2.x mediante **Resend API** (envío de PDF comprado, confirmación de registro de compositor, notificación de pago transferido Wompi, etc.).

### 5. 🚀 Infraestructura & Despliegue Final
- [ ] Despliegue del Backend de Medusa.js 2.x + PostgreSQL + Redis en **Railway**.
- [ ] Despliegue del Frontend de Next.js en **Vercel**.
- [ ] Configuración del dominio oficial `pianocolombia.com` y certificados SSL.

---

## 📌 Decisiones de Arquitectura Registradas

1. **Stack Core:** Medusa.js 2.x (Backend), Next.js App Router (Frontend), PostgreSQL 16, Redis 7.
2. **Infraestructura Cloud:** Railway (Backend + DB + Redis), Vercel (Storefront), Cloudflare R2 (Storage PDFs sin costo de egress).
3. **Pasarela de Pago & Dispersión Unificada:** **Wompi API 100%** (Tarjetas Internacionales Visa/MC/Amex en USD/COP, PSE, Nequi, Daviplata y Bancolombia) para cobros en tienda y dispersión a cuentas bancarias nacionales/Nequi para compositores.
4. **Protección de Partituras:** Previews opacos/difuminados (blur progresivo + opacidad 40% + marca de agua diagonal `pianocolombia.com`).
5. **Aprobación de Compositores:** Flujo estricto con estado `Pendiente` hasta verificación manual por Admin.
6. **Administrabilidad Total del Contenido (CMS):** Hero Banners, Categorías, Menús de navegación, Compositores/Partituras destacadas, "Sobre Nosotros", T&C, Política de Datos administrable desde `/admin/cms`.

---

## 📜 Registro de Actividades / Log de Avances

| Fecha | Autor | Actividad / Cambio realizado |
|---|---|---|
| **2026-09-02** | Antigravity AI / Usuario | Definición del Plan de Implementación v3 y creación del documento `PROJECT_STATUS.md`. |
| **2026-09-02** | Antigravity AI | Setup inicial de Next.js Storefront (`/storefront`) y clonación de Medusa.js 2.x (`/backend`). Configuración del Design System con fuentes Galano/Adam, paleta Neomorphic/Concert Hall, creación de Mock Data, vista Principal y vista de Catálogo (`/tienda`). |
| **2026-09-02** | Antigravity AI | Implementación de vistas públicas de Compositores (`/compositores`, `/compositores/[slug]`), Detalle de Partitura con visor de preview opaco (`/partitura/[slug]`) y Checkout (`/checkout`). |
| **2026-09-02** | Antigravity AI | Implementación del Portal de Compositores (Fase 2): Formulario de registro con estado `Pendiente de Aprobación`, Login, Sidebar del Dashboard, Tablero financiero y Subida de partituras con calculadora de comisión en tiempo real. |
| **2026-09-02** | Antigravity AI | Implementación de Pagos y Dispersión (Fase 3): Checkout bilingüe Wompi COP con selector de bancos PSE, PayPal USD, Panel de liquidaciones (`/compositor/dashboard/pagos`) y Panel del Comprador (`/mi-cuenta/descargas`). |
| **2026-09-02** | Antigravity AI | Implementación del Panel Admin & Notificaciones (Fase 4): Consola `/admin/dashboard`, Aprobación/Rechazo de compositores y partituras, Gestor CMS (Banners, Categorías, Menús, Legales) e Inspector de Plantillas HTML de Email (Resend). |
| **2026-09-02** | Antigravity AI | Implementación de SEO & Seguridad (Fase 5): `/sitemap.xml`, `/robots.txt`, cabeceras HTTP de seguridad en `next.config.ts` y Página 404 personalizada (*"Nota fuera de compás"*). |
| **2026-09-02** | Antigravity AI | Finalización de la Fase 6: Módulo Blog (`/blog`), Lectura de artículo (`/blog/[slug]`), integración en la Homepage y compilación completa del proyecto (20 rutas verificadas). |
| **2026-09-04** | Antigravity AI | Implementación del Login Admin Standalone (`/admin/login`) con conmutador por roles demo en 1-clic. |
| **2026-09-04** | Antigravity AI | Creación de la Consola de Administración de Usuarios & Permisos RBAC (`/admin/usuarios`) con 4 perfiles internos (Super Admin, Editor CMS, Moderador de Partituras, Tesorero). |
| **2026-09-04** | Antigravity AI | Creación de la Consola de Dispersión Masiva de Pagos (`/admin/pagos`) para ejecución de transferencias masivas a compositores y certificados fiscales. |
| **2026-09-04** | Antigravity AI | Rediseño del Gestor CMS (`/admin/cms`) reemplazando sliders por componentes del Hero (H1, descripción, botones 1 y 2, leyenda Urtext) y partitura destacada con previsualización en vivo. |
| **2026-09-04** | Antigravity AI | Implementación del Módulo de Carrito de Compras Digital (`/carrito`) con `CartContext`, cupones de descuento y contador badge en el `Header.tsx`. |
| **2026-09-04** | Antigravity AI | Estandarización al 100% en **Wompi API** (eliminación total de PayPal). Checkout de tienda con Widget Wompi en ES/EN para Tarjetas Internacionales (Visa/MC/Amex USD/COP), PSE, Nequi, Daviplata y Bancolombia, y dispersión de regalías a cuentas bancarias nacionales o bolsillos Nequi/Daviplata. |
| **2026-09-04** | Antigravity AI | Sincronización del repositorio con GitHub (`https://github.com/edwinso1806/piano-colombia.git`) en la rama `main`. |
| **2026-09-04** | Antigravity AI | **Refinamiento Visual UI & Mobile UX:** Reestructuración de `Header.tsx` (agrupamiento de Logo + Nav desktop, eliminación de "Inicio" redundante y renombrado de "Compositores"), implementación de `MobileDrawer.tsx` con React Portal (`createPortal`) inmune al clipping de backdrop-filter, rediseño responsive del dashboard de compositor (`/compositor/dashboard`) con Segmented Control, erradicación total de scrolls horizontales y verificación de build (28/28 rutas Next.js limpias). Estado congelado y listo para Backend & Base de Datos. |
| **2026-09-05** | Antigravity AI | **Autenticación Real contra PostgreSQL & Medusa 2.x:** Creación del módulo `CustomerAccount` con migraciones MikroORM en PostgreSQL (`piano_colombia_db`), algoritmos criptográficos PBKDF2-SHA512 con salt único y tokens de sesión JWT. Corrección de la validación estricta de credenciales en `/login`, `/compositor/login` y `/admin/login`, eliminando fallbacks permisivos. Validación exitosa de 7/7 pruebas unitarias de autenticación y bloqueo de credenciales inválidas. |
| **2026-09-05** | Antigravity AI | **Estandarización de Redirecciones de Cierre de Sesión (Logout):** Validación y ajuste del flujo de salida según perfil: Cliente $\rightarrow$ Home de la tienda (`/`), Compositor $\rightarrow$ Login del Compositor (`/compositor/login`), y Administrador/CMS $\rightarrow$ Home de la tienda (`/`). Limpieza de datos de sesión en `localStorage` y compilación verificada. |
| **2026-09-05** | Antigravity AI | **Protección de Ruta `/mi-cuenta/descargas` & Aislamiento de Datos:** Implementación de Auth Guard en el panel del comprador. Si el usuario no tiene sesión activa, se bloquea la vista mostrando pantalla de acceso restringido y botón de login. Si está autenticado, consulta exclusivamente las partituras asociadas a su correo en PostgreSQL (`GET /store/downloads?email=...`) o muestra el estado vacío si no registra compras. |
