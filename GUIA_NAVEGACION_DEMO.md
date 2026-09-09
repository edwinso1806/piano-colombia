# 🎹 Guía Maestra para la Demostración del Mock Navegable con el Cliente
## Proyecto: Piano Colombia (Storefront, Portal Compositores & Consola Admin)

> **Copia de Respaldo Independiente (Mock Cliente):** `c:\Proyectos\piano-colombia\mock-navegable-cliente\` -> **Puerto `http://localhost:3001`** (Incluye distintivo visual *"🎭 Mock Navegable Cliente"*)  
> **Proyecto Principal en Desarrollo (Futuro Backend):** `c:\Proyectos\piano-colombia\storefront\` -> **Puerto `http://localhost:3000`**

---

## 🚀 1. Cómo Iniciar y Diferenciar Ambos Entornos

| Entorno | Puerto Local | ¿Para qué sirve? | ¿Cómo se identifica? |
|---|---|---|---|
| **🎭 Mock Navegable Cliente** | **`http://localhost:3001`** | Presentaciones y demos con el cliente sin riesgo de que cambios en el backend rompan la navegación. | Tiene un **distintivo flotante dorado en la esquina inferior derecha** (*"🎭 Mock Navegable Cliente · Puerto 3001"*). |
| **⚙️ Proyecto Real / Backend** | **`http://localhost:3000`** | Donde estaremos programando las conexiones con Medusa.js 2.x, PostgreSQL y Wompi API. | No tiene distintivo demo, corre en el puerto estándar 3000. |

### Cómo levantar el Mock de Demostración (Puerto 3001):
1. Ve a la carpeta `c:\Proyectos\piano-colombia\mock-navegable-cliente\`.
2. Haz doble clic en **`iniciar_demo.bat`** (o ejecuta `npm run dev` en esa carpeta).
3. Abre tu navegador en: **[http://localhost:3001](http://localhost:3001)**.

---

## 🎬 2. Guion de Demostración Recomendado (Storytelling en 4 Actos)

Para impresionar al cliente, te recomendamos seguir este flujo estructurado que cuenta la historia completa del producto desde los 3 perfiles de usuario: **Comprador**, **Compositor** y **Administrador**.

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   ACTO 1        │       │   ACTO 2        │       │   ACTO 3        │
│   Comprador     │ ───>  │   Compositor    │ ───>  │   Administrador │
│ (Storefront UI) │       │ (Portal Autores)│       │ (Control Total) │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

---

### 🛍️ ACTO 1: La Experiencia del Comprador (Músicos & Estudiantes)

1. **Página de Inicio (Home) — [http://localhost:3000](http://localhost:3000)**
   - **Qué destacar:** Diseño visual Stitch con paleta Concert Hall / Ivory, Hero Banner con partitura del mes (*"Adolfo Mejía - Pasillo Colombiano"*), grid de compositores destacados y carrusel de novedades.
   - **Interacción:** Muestra la navegación fluida y cómo el logo centralizado organiza el header.

2. **Catálogo de Partituras — [http://localhost:3000/tienda](http://localhost:3000/tienda)**
   - **Qué destacar:** Barra de filtros interactiva por **Nivel** (*Principiante*, *Intermedio*, *Avanzado*), **Género** (*Bambuco*, *Pasillo*, *Danza*, *Clásico*) y selector de moneda **COP ($) / USD ($)**.
   - **Interacción:** Haz clic en una categoría para filtrar el catálogo al instante.

3. **Directorio y Ficha del Maestro — [http://localhost:3000/compositores](http://localhost:3000/compositores)**
   - **Qué destacar:** Grid de maestros colombianos con biografía resumida.
   - **Entra a:** [http://localhost:3000/compositores/adolfo-mejia](http://localhost:3000/compositores/adolfo-mejia) para mostrar su biografía completa y catálogo individual.

4. **Visor Seguro Anti-Copia — [http://localhost:3000/partitura/score_1](http://localhost:3000/partitura/score_1) ⭐ *(Punto Clave)*:**
   - **Qué destacar:** Sistema de protección con **opacidad al 40%, blur progresivo y marca de agua diagonal `pianocolombia.com`**, impidiendo capturas de pantalla o impresiones no autorizadas.
   - **Interacción:** Selecciona el tipo de licencia (*Personal / Institucional*) y haz clic en **"Agregar al Carrito"**.

5. **Carrito de Compras — [http://localhost:3000/carrito](http://localhost:3000/carrito)**
   - **Qué destacar:** Resumen de compra, cálculo automático de impuestos, selector de cupón de descuento (`PIANO2026`) y botón de proceder al pago.

6. **Checkout Unificado Wompi — [http://localhost:3000/checkout](http://localhost:3000/checkout)**
   - **Qué destacar:** Pasarela Wompi integrada con soporte para **Tarjetas Internacionales (Visa/Mastercard/Amex en USD/COP), PSE, Nequi, Daviplata y Bancolombia**.
   - **Interacción:** Completa el formulario de prueba y haz clic en **"Confirmar y Pagar"**.

7. **Panel de Descargas del Cliente — [http://localhost:3000/mi-cuenta/descargas](http://localhost:3000/mi-cuenta/descargas)**
   - **Qué destacar:** La pantalla final donde el comprador ve sus partituras listas para descarga con **estampa legal personalizada** (Nombre, Cédula/NIT y Ref Wompi).

---

### 🎼 ACTO 2: El Portal de Compositores (Creadores de Contenido)

1. **Registro de Compositor — [http://localhost:3000/compositor/registro](http://localhost:3000/compositor/registro)**
   - **Qué destacar:** Formulario de postulación donde el autor ingresa sus datos artísticos y sus datos bancarios para transferencias Wompi. Al enviar, queda en estado 🟡 **`Pendiente de Aprobación`** por seguridad.

2. **Ingreso al Portal — [http://localhost:3000/compositor/login](http://localhost:3000/compositor/login)**
   - **Qué destacar:** Formulario de acceso con credenciales demo pre-cargadas.

3. **Dashboard del Compositor — [http://localhost:3000/compositor/dashboard](http://localhost:3000/compositor/dashboard)**
   - **Qué destacar:** Segmented control adaptable, métricas claras de **Ventas Brutas**, **Comisión Piano Colombia (20%)** y **Ganancia Neta del Autor (80%)**.

4. **Subida de Nueva Partitura — [http://localhost:3000/compositor/dashboard/partituras/nueva](http://localhost:3000/compositor/dashboard/partituras/nueva)**
   - **Qué destacar:** Dropzone para cargar el PDF original y **Calculadora de Ganancias en Tiempo Real** (si fija un precio de $50.000 COP, ve inmediatamente que recibirá $40.000 COP netos).

5. **Historial de Liquidaciones Wompi — [http://localhost:3000/compositor/dashboard/pagos](http://localhost:3000/compositor/dashboard/pagos)**
   - **Qué destacar:** Registro transparente de todas las transferencias quincenales realizadas vía Wompi API con comprobante descargable.

---

### 🛡️ ACTO 3: Consola de Administración (Control Total de la Plataforma)

1. **Login Administrativo Standalone — [http://localhost:3000/admin/login](http://localhost:3000/admin/login)**
   - **Qué destacar:** Acceso aislado con selector de **4 roles demo en 1-clic** (*Super Admin*, *Editor CMS*, *Moderador de Partituras*, *Tesorero Wompi*).

2. **Dashboard Global — [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)**
   - **Qué destacar:** Visión gerencial de ingresos globales, desglose de comisiones de la plataforma y accesos directos a las colas de aprobación.

3. **Aprobación de Compositores — [http://localhost:3000/admin/compositores](http://localhost:3000/admin/compositores)**
   - **Qué destacar:** Módulo de moderación donde el administrador evalúa solicitudes y puede **Aprobar (✅)** o **Rechazar con motivo (❌)**.

4. **Moderación de Partituras — [http://localhost:3000/admin/partituras](http://localhost:3000/admin/partituras)**
   - **Qué destacar:** Revisión del archivo PDF y validación del preview antes de publicarlo en el catálogo general.

5. **Gestor de Contenido CMS — [http://localhost:3000/admin/cms](http://localhost:3000/admin/cms)**
   - **Qué destacar:** Personalización en vivo de los textos del Hero (H1, descripción, botones, leyenda Urtext) y selección de la Partitura Destacada del mes con previsualización en tiempo real.

6. **Dispersión Masiva de Pagos Wompi — [http://localhost:3000/admin/pagos](http://localhost:3000/admin/pagos) ⭐ *(Punto Clave)*:**
   - **Qué destacar:** Botón de **"Ejecutar Lote de Pagos Wompi"** para transferir automáticamente el 80% de regalías a todos los compositores habilitados y generar certificados de retención fiscal.

7. **Gestión de Usuarios y Roles RBAC — [http://localhost:3000/admin/usuarios](http://localhost:3000/admin/usuarios)**
   - **Qué destacar:** Creación y asignación de permisos específicos para el personal interno.

8. **Inspector de Plantillas de Email — [http://localhost:3000/admin/emails](http://localhost:3000/admin/emails)**
   - **Qué destacar:** Visualizador interactivo de los correos automáticos diseñados en HTML para Resend (Confirmación de compra, Aprobación de compositor, Aviso de pago dispersado).

---

### 📱 ACTO 4: Experiencia Móvil (Responsive & Mobile Drawer)

1. Abre las **Herramientas de Desarrollador del Navegador** (`F12` o `Ctrl + Shift + M`) y activa la vista de teléfono móvil (iPhone / Pixel).
2. Toca el botón de **Menú Hamburguesa (`≡`)**:
   - **Qué destacar:** El nuevo **`MobileDrawer`** se abre con animación suave, ocupando el 85% de la pantalla, con acceso directo al catálogo, a la cuenta del usuario, al carrito de compras y con una tarjeta destacada para el **"Portal de Compositores"**.

---

## 📑 Tabla Rápida de URLs para el Presentador

| Módulo | URL Directa |
|---|---|
| **Inicio (Home)** | [http://localhost:3000](http://localhost:3000) |
| **Catálogo Tienda** | [http://localhost:3000/tienda](http://localhost:3000/tienda) |
| **Visor de Partitura** | [http://localhost:3000/partitura/score_1](http://localhost:3000/partitura/score_1) |
| **Carrito** | [http://localhost:3000/carrito](http://localhost:3000/carrito) |
| **Checkout Wompi** | [http://localhost:3000/checkout](http://localhost:3000/checkout) |
| **Descargas del Cliente** | [http://localhost:3000/mi-cuenta/descargas](http://localhost:3000/mi-cuenta/descargas) |
| **Registro Compositor** | [http://localhost:3000/compositor/registro](http://localhost:3000/compositor/registro) |
| **Dashboard Compositor** | [http://localhost:3000/compositor/dashboard](http://localhost:3000/compositor/dashboard) |
| **Subir Partitura** | [http://localhost:3000/compositor/dashboard/partituras/nueva](http://localhost:3000/compositor/dashboard/partituras/nueva) |
| **Login Admin** | [http://localhost:3000/admin/login](http://localhost:3000/admin/login) |
| **Admin Dashboard** | [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard) |
| **Admin CMS Hero** | [http://localhost:3000/admin/cms](http://localhost:3000/admin/cms) |
| **Admin Pagos Wompi** | [http://localhost:3000/admin/pagos](http://localhost:3000/admin/pagos) |
| **Admin RBAC Usuarios** | [http://localhost:3000/admin/usuarios](http://localhost:3000/admin/usuarios) |
| **Admin Emails** | [http://localhost:3000/admin/emails](http://localhost:3000/admin/emails) |
| **Blog** | [http://localhost:3000/blog](http://localhost:3000/blog) |
