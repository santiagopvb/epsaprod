# EPSA — Gestión de Nuevos Productos Alimentarios

Webapp completa para gestionar el flujo de solicitudes de nuevos productos alimentarios, con roles, wizard multi-paso, tablas de alérgenos y decisiones GO/NO GO.

---

## 🚀 Arranque rápido

```
Abre index.html en cualquier navegador moderno (Chrome, Firefox, Edge, Safari).
No requiere servidor ni instalación.
```

También funciona desplegando la carpeta en **GitHub Pages**, **Netlify** o cualquier hosting estático.

---

## 📁 Estructura de archivos

```
├── index.html          → Página principal (toda la UI)
├── css/
│   └── styles.css      → Sistema de diseño completo
├── js/
│   ├── data.js         → Constantes, datos demo, capa de persistencia (localStorage)
│   └── app.js          → Lógica completa de la aplicación
└── README.md           → Este archivo
```

---

## 👤 Usuarios de demostración

| Usuario | Rol | Pasos del wizard | Contraseña |
|---|---|---|---|
| Ana García | Comercial | 1, 2, 3 | cualquiera |
| Carlos Martínez | Director/a UN | 1, 2, 3, 4 | cualquiera |
| Laura Sánchez | Directora I+D | 1, 2, 3, 4, 5 | cualquiera |
| Admin EPSA | Administrador | 1, 2, 3, 4, 5 | cualquiera |

---

## 📊 Datos de demo incluidos

| ID | Estado | Descripción |
|---|---|---|
| PRY-001 | ✅ Aprobado | Proteína vegana en polvo — ciclo completo |
| PRY-002 | 🔵 Pendiente I+D | Vinagreta premium — falta evaluación técnica |
| PRY-003 | 🟡 Pendiente UN | Galleta chocolate — falta viabilidad comercial |
| PRY-004 | 🟢 Pendiente Comercial | Extracto aloe vera — borrador inicial |

---

## 🔄 Flujo del proceso

```
Comercial (pasos 1-3)
    ↓
Director/a UN (paso 4 — GO/NO GO Comercial)
    ↓
Directora I+D (paso 5 — GO/NO GO Técnico + Decisión Final)
    ↓
APROBADO / RECHAZADO
```

### Estados y colores
- 🟢 **Pendiente Comercial** — Verde #548235
- 🟡 **Pendiente UN** — Naranja/Amarillo #BF8F00
- 🔵 **Pendiente I+D** — Azul #2F5496
- ✅ **Aprobado** — Verde oscuro #006100
- ❌ **Rechazado** — Rojo #9C0006

---

## 🧩 Funcionalidades

- **Login por rol** con acceso controlado a pasos del wizard
- **Dashboard** con 6 contadores, gráfico de dona y gráfico de barras mensual
- **Wizard 5 pasos** con navegación libre entre pasos permitidos
- **Pasos bloqueados** visualmente para roles sin acceso
- **14 alérgenos** (Reglamento UE 1169/2011) en dos tablas separadas (Cliente e I+D)
- **Estándares** IFS (obligatorio) + Halal, Kosher, Bio, Feed, Técnico
- **GO / NO GO** comercial y técnico con botones visuales
- **Decisión Final** destacada en púrpura
- **Lista de proyectos** con filtro y búsqueda
- **Modal de detalle** de solo lectura con todas las secciones
- **Historial de actividad** cronológico
- **Persistencia** en localStorage
- **Responsive** — funciona en desktop, tablet y móvil

---

## 🛠 Tecnología

- HTML5 + CSS3 + JavaScript Vanilla (sin frameworks)
- [Chart.js 4.4](https://www.chartjs.org/) vía CDN para gráficos
- [DM Sans + DM Mono](https://fonts.google.com/) vía Google Fonts
- `localStorage` para persistencia local

---

## 🌐 Despliegue en GitHub Pages

1. Sube la carpeta a un repositorio GitHub
2. Ve a **Settings → Pages → Source: main / root**
3. Accede en `https://<usuario>.github.io/<repo>/`

---

## 🔄 Restaurar datos demo

En el Dashboard, botón **🔄 Restaurar demo** — restablece los 4 proyectos y el historial originales.

---

*EPSA · Sector Alimentario · IFS · Halal · Kosher · Bio · Feed · Técnico*
