# Piano Colombia — Directorio de URLs de Demostración & Revisión con Cliente

> **Servidor local activo:** `http://localhost:3000`  
> **Fecha:** 2 de Septiembre, 2026  
> **Objetivo:** Guía de navegación para la revisión visual y flujo de pantallas con el cliente.

---

## 🛒 1. Storefront Público (Experiencia del Comprador)

| Nombre de la Vista | URL de Demostración | Descripción del Contenido |
|---|---|---|
| **Página de Inicio (Home)** | [http://localhost:3000](http://localhost:3000) | Hero slider, categorías, compositores y partituras destacadas, sección de noticias. |
| **Tienda / Catálogo General** | [http://localhost:3000/tienda](http://localhost:3000/tienda) | Filtros por nivel, categoría y rango de precio en COP/USD. |
| **Directorio de Compositores** | [http://localhost:3000/compositores](http://localhost:3000/compositores) | Grid de maestros con avatar, biografía resumida y región. |
| **Perfil de Compositor** | [http://localhost:3000/compositores/adolfo-mejia](http://localhost:3000/compositores/adolfo-mejia) | Vista individual con biografía extendida y sus partituras. |
| **Detalle de Partitura (Visor Protegido)** | [http://localhost:3000/partitura/score_1](http://localhost:3000/partitura/score_1) | **Visor con opacidad al 40%, blur progresivo y marca de agua diagonal `pianocolombia.com`**, selector de copias. |
| **Carrito de Compras** | [http://localhost:3000/carrito](http://localhost:3000/carrito) | Revisión de partituras agregadas, selección de licencias, cupones de descuento y desglose COP/USD. |
| **Checkout Dual (Wompi COP & PayPal USD)** | [http://localhost:3000/checkout](http://localhost:3000/checkout) | Selector de bancos PSE en vivo, Nequi, Daviplata, Tarjetas y PayPal USD. Comprobante de estampa legal. |
| **Área del Cliente (Descargas)** | [http://localhost:3000/mi-cuenta/descargas](http://localhost:3000/mi-cuenta/descargas) | Contador de descargas disponibles y botón de obtención de PDF estampado. |

---

## 🎵 2. Portal de Compositores

| Nombre de la Vista | URL de Demostración | Descripción del Contenido |
|---|---|---|
| **Registro de Compositor** | [http://localhost:3000/compositor/registro](http://localhost:3000/compositor/registro) | Formulario con selector de ubicación, ID y aviso de 🟡 **`Pendiente de Aprobación`**. |
| **Inicio de Sesión** | [http://localhost:3000/compositor/login](http://localhost:3000/compositor/login) | Formulario de acceso con credenciales demo precargadas. |
| **Tablero de Ventas & Ganancias** | [http://localhost:3000/compositor/dashboard](http://localhost:3000/compositor/dashboard) | Métricas de ganancia bruta, comisión PC 20% y neto 80% a cobrar. |
| **Subida de Partitura & Calculadora** | [http://localhost:3000/compositor/dashboard/partituras/nueva](http://localhost:3000/compositor/dashboard/partituras/nueva) | Zone Dropzone PDF y calculadora en tiempo real de comisiones. |
| **Historial de Liquidaciones (PayPal Payouts)** | [http://localhost:3000/compositor/dashboard/pagos](http://localhost:3000/compositor/dashboard/pagos) | Registro de lotes de transferencia quincenales depositados en PayPal. |

---

## 🏢 3. Panel Administrativo Piano Colombia

| Nombre de la Vista | URL de Demostración | Descripción del Contenido |
|---|---|---|
| **Login Admin (RBAC)** | [http://localhost:3000/admin/login](http://localhost:3000/admin/login) | Formulario de autenticación interna con conmutador demo por rol (Super Admin, CMS, Moderador, Tesorero). |
| **Dashboard Global Admin** | [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard) | Indicadores de ventas totales de plataforma, comisión acumulada PC y accesos rápidos a colas. |
| **Aprobación de Compositores** | [http://localhost:3000/admin/compositores](http://localhost:3000/admin/compositores) | Módulo para revisar datos y **Aprobar** (✅) o **Rechazar** (❌) con motivo. |
| **Aprobación de Partituras** | [http://localhost:3000/admin/partituras](http://localhost:3000/admin/partituras) | Inspección de PDFs y validación de opacidad de muestras antes de publicar en la tienda. |
| **Gestor CMS de Contenido** | [http://localhost:3000/admin/cms](http://localhost:3000/admin/cms) | Control de componentes Hero (H1, descripción, botones, leyenda) y Partitura Destacada con vista previa en vivo. |
| **Dispersión & Pagos (PayPal API)** | [http://localhost:3000/admin/pagos](http://localhost:3000/admin/pagos) | Ejecución masiva de lotes de pago PayPal API (80%), desglose de 20% PC y emisión de certificados fiscal. |
| **Usuarios & Roles (RBAC)** | [http://localhost:3000/admin/usuarios](http://localhost:3000/admin/usuarios) | Consola de administración de personal interno, asignación de permisos granulares y estado. |
| **Inspector de Plantillas de Email** | [http://localhost:3000/admin/emails](http://localhost:3000/admin/emails) | Visor de las plantillas transaccionales HTML de Resend (Comprador, Compositor, Admin). |

---

## 📰 4. Blog & Páginas Especiales

| Nombre de la Vista | URL de Demostración | Descripción del Contenido |
|---|---|---|
| **Blog / Actualidad Musical** | [http://localhost:3000/blog](http://localhost:3000/blog) | Bitácora pianística con filtros por categoría (*Pedagogía*, *Historia*, *Actualidad*). |
| **Lectura de Artículo** | [http://localhost:3000/blog/el-bambuco-en-el-piano-ritmica-y-articulacion](http://localhost:3000/blog/el-bambuco-en-el-piano-ritmica-y-articulacion) | Maquetación individual de lectura e investigación pianística. |
| **Página 404 Personalizada** | [http://localhost:3000/pagina-inexistente-demo](http://localhost:3000/pagina-inexistente-demo) | Error 404 *"Nota fuera de compás"* adaptado a la marca. |
| **Sitemap XML Dinámico** | [http://localhost:3000/sitemap.xml](http://localhost:3000/sitemap.xml) | Generador dinámico para motores de búsqueda. |
| **Robots.txt** | [http://localhost:3000/robots.txt](http://localhost:3000/robots.txt) | Reglas de rastreo e indexación. |
