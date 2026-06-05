# ⚽ World Cup Collector — UES
**Universidad de El Salvador · Proyecto Web Interactivo**
**Versión 2.0**

---

## 📁 Estructura del Proyecto

```
worldcup-ues/
│
├── index.html                  # Entrada principal
│
├── css/
│   └── main.css                # Estilos (estética FIFA/EA Sports oscura)
│
├── js/
│   ├── app.js                  # Controlador principal + arranque
│   │
│   ├── utils/
│   │   ├── db.js               # IndexedDB wrapper v2 (CRUD + actividad + equipo ideal)
│   │   ├── auth.js             # Registro, login, logout, sesión (SHA-256)
│   │   ├── toast.js            # Notificaciones toast + objeto Modal
│   │   └── modal.js            # (stub, Modal definido en toast.js)
│   │
│   └── modules/
│       ├── api.js              # APIs deportivas v2 (football-data + api-football + sportsdb + mock)
│       ├── gacha.js            # Sistema gacha v2 (40 figuritas, pity, monedas, compra)
│       ├── album.js            # Álbum virtual + Equipo Ideal
│       ├── predictions.js      # Sistema de predicciones v2 (evaluación automática)
│       ├── profile.js          # Perfil v2 (stats, monedas, actividad, export/import)
│       ├── stats.js            # Tablas equipos/jugadores/goleadores
│       └── dashboard.js        # Panel principal v2 (venue, DG, clasificación)
│
└── data/                       # (Reservado para JSONs estáticos extras)
```

---

## ⚙️ Configuración de APIs

Abre **`js/modules/api.js`** y busca `API_CONFIG`:

```js
const API_CONFIG = {
  footballData: {
    base:    'https://api.football-data.org/v4',
    key:     'TU_KEY_AQUI',   // ← football-data.org
    enabled: true             // ← cambia a true
  },
  apiFootball: {
    base:    'https://v3.football.api-sports.io',
    key:     'TU_KEY_AQUI',   // ← api-football (RapidAPI)
    enabled: false
  },
  sportsDB: {
    base:    'https://www.thesportsdb.com/api/v1/json/3',
    enabled: true             // ya funciona sin key
  }
};
```

**Sin API keys:** la app funciona con datos simulados (mock) del Mundial 2026.

---

## 🚀 Cómo ejecutar

### Opción A – Servidor local simple
```bash
# Con Python
python -m http.server 8080

# Con Node.js
npx serve .
```
Luego abre: `http://localhost:8080`

### Opción B – Live Server (VS Code)
Instala la extensión **Live Server** y clic en "Open with Live Server" en `index.html`.

> ⚠️ **IndexedDB no funciona con `file://`** — necesitas un servidor HTTP local.

---

## 🎮 Funcionalidades

| Módulo                | Estado   | Novedades v2 |
|-----------------------|----------|--------------|
| Registro / Login      | ✅        | Enter en campos |
| Perfil de usuario     | ✅        | Monedas, stats correctas |
| Sistema Gacha         | ✅        | Pity system (garantía x50), pool 40 figuritas, ratings |
| Monedas virtuales     | ✅ **NUEVO** | Convertir duplicados, comprar tiradas |
| Álbum Virtual         | ✅        | Glow por rareza |
| Equipo Ideal          | ✅        | Store separado en DB |
| Dashboard             | ✅        | Venue, DG, clasificación visual |
| Estadísticas          | ✅        | 16 equipos, 16 jugadores |
| Seguimiento Favs      | ✅        | Verificación de tipo correcta |
| Predicciones          | ✅        | Validación marcador, evaluación automática al actualizar |
| Recompensas           | ✅        | Evaluación con partidos terminados reales |
| Exportar JSON         | ✅        | v2.0 con monedas, pity, lastDailyPull |
| Importar JSON         | ✅        | Validación mejorada, compatible v1 y v2 |
| APIs deportivas       | ✅        | football-data + api-football + sportsdb + mock |
| Log de actividad      | ✅ **NUEVO** | Historial interno IndexedDB |
| Diseño responsive     | ✅        | Grid 2col tablet, max-width desktop |

---

## 💎 Sistema de Monedas (nuevo en v2)

| Rareza    | Valor por duplicado |
|-----------|-------------------|
| Común     | 1 moneda          |
| Rara      | 3 monedas         |
| Épica     | 10 monedas        |
| Legendaria| 50 monedas        |

**10 monedas = 1 tirada adicional** (botón en sección Datos del perfil)

---

## 🎰 Sistema Pity (garantía legendaria)

Cada 50 tiradas sin obtener una figurita legendaria, la siguiente tirada **garantiza** una legendaria. El contador se muestra en la sección Gacha con una barra de progreso.

---

## 🔑 APIs deportivas — Guía rápida

### 1. football-data.org (Recomendada)
- Registro: https://www.football-data.org/client/register
- Plan gratis: 10 llamadas/min
- Copa del Mundo ID: `2000`

### 2. api-football (RapidAPI)
- Registro: https://www.api-football.com/
- Plan gratis: 100 llamadas/día
- Más datos en tiempo real

### 3. thesportsdb
- Sin key para datos públicos
- Útil para imágenes de equipos

---

## 🗄️ Almacenamiento local (IndexedDB v2)

| Store          | Datos                               |
|----------------|-------------------------------------|
| `users`        | Cuentas de usuario                  |
| `session`      | Sesión activa                       |
| `figuritas`    | Colección del usuario               |
| `predicciones` | Historial de apuestas               |
| `favoritos`    | Equipos y jugadores favoritos       |
| `stats_cache`  | Caché de APIs (5 min TTL)           |
| `equipo_ideal` | Alineación guardada (nuevo v2)      |
| `activity_log` | Log de acciones del usuario (v2)    |

---

## 📱 Compatibilidad

- Chrome ✅
- Firefox ✅
- Edge ✅
- Safari iOS ✅
- Android Chrome ✅

---

## 📝 Notas de desarrollo

- Las **estadísticas** se actualizan solo al presionar "Actualizar stats"
- Al actualizar stats se **evalúan predicciones pendientes** automáticamente
- El **pity counter** garantiza legendaria cada 50 tiradas consecutivas sin una
- Las contraseñas usan **SHA-256** (Web Crypto API, sin librerías externas)
- **Sin dependencias externas** — vanilla JS puro
- El formato de exportación v2.0 incluye monedas, pity y lastDailyPull
- Los archivos v1.0 exportados son **compatibles** con la importación v2

---

## 🛠️ Cambios v2 vs v1

### Bug fixes
- ✅ Tirada diaria ya no se reclamaba doble al iniciar sesión
- ✅ Estadística de figuritas mostraba contador incorrecto
- ✅ Favoritos: verificación de tipo (team/player) correcta al eliminar
- ✅ Input de importar archivo no se reseteaba (no permitía reimportar)
- ✅ Botones de gacha no se bloqueaban durante el pull

### Mejoras
- ✅ Pool de figuritas: 28 → 40 cartas con campo `rating`
- ✅ Sistema pity con barra visual
- ✅ Monedas: convertir duplicados y comprar tiradas
- ✅ Predicciones: validación de formato marcador exacto
- ✅ Predicciones: evaluación automática al actualizar stats
- ✅ Dashboard: venue, diferencia de goles, filas clasificación
- ✅ API: soporte api-football como segunda fuente + `getFinishedMatches()`
- ✅ DB: store `equipo_ideal` separado + `activity_log`
- ✅ Exportación v2.0 con más campos
- ✅ CSS: animaciones figuritas, glow por rareza, tablet/desktop grid

---

*World Cup Collector UES — Proyecto académico*
*Universidad de El Salvador · v2.0*
