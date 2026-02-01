# 💱 Kambio

Aplicación móvil para consultar tasas de cambio del Bolívar venezolano en tiempo real. Compara automáticamente BCV (Banco Central de Venezuela) con Binance P2P.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Actualizaciones OTA](#actualizaciones-ota)
- [API Endpoints](#api-endpoints)
- [Comandos Útiles](#comandos-útiles)
- [Distribución](#distribución)

---

## ✨ Características

### 📊 Pantalla de Tasas

- Tasa BCV Dólar y Euro en tiempo real
- Tasa Binance P2P
- Indicador de mejor opción
- Comparación porcentual entre tasas
- Pull-to-refresh para actualizar

### 🧮 Calculadora

- Conversión bidireccional USD ↔ Bs
- Formato automático con separadores de miles (3.500,00)
- Botón copiar para Pago Móvil
- Feedback háptico en interacciones

### 📈 Historial

- Gráfico SVG de evolución de tasas
- Selector de período (7, 30, 90 días)
- Estadísticas: mínimo, máximo, promedio
- Tendencia con porcentaje de cambio

### 🔔 Alertas

- Crear alertas personalizadas
- Tipos: "Si sube a X" o "Si baja a X"
- Persistencia local con AsyncStorage
- Verificación automática al actualizar tasas

---

## 🛠️ Tecnologías

### Frontend (App Móvil)

| Tecnología       | Uso                 |
| ---------------- | ------------------- |
| Expo SDK 52      | Framework base      |
| React Navigation | Navegación por tabs |
| TanStack Query   | Cache y fetching    |
| react-native-svg | Iconos y gráficos   |
| expo-haptics     | Feedback táctil     |
| expo-clipboard   | Copiar resultados   |
| expo-updates     | Actualizaciones OTA |
| AsyncStorage     | Persistencia local  |

### Backend (Servidor)

| Tecnología        | Uso                 |
| ----------------- | ------------------- |
| Node.js + Express | Servidor HTTP       |
| Cheerio           | Web scraping BCV    |
| Axios             | Peticiones HTTP     |
| CORS              | Seguridad de origen |

---

## 📁 Estructura del Proyecto

```
kambio/
├── App.tsx                     # Entry point con navegación
├── app.json                    # Configuración Expo + OTA
├── eas.json                    # Configuración EAS Build
├── package.json                # Dependencias
│
├── src/                        # Código fuente frontend
│   ├── screens/
│   │   ├── DashboardScreen.tsx     # Tasas actuales
│   │   ├── CalculatorScreen.tsx    # Conversor USD/Bs
│   │   ├── HistoryScreen.tsx       # Gráficos históricos
│   │   └── AlertsScreen.tsx        # Sistema de alertas
│   │
│   ├── components/
│   │   ├── Icon.tsx                # Iconos SVG
│   │   ├── SplashScreen.tsx        # Pantalla de inicio
│   │   ├── AnimatedComponents.tsx  # Animaciones
│   │   └── SkeletonLoader.tsx      # Loading premium
│   │
│   ├── hooks/
│   │   ├── useRates.ts             # Hook para tasas
│   │   └── useHistory.ts           # Hook para historial
│   │
│   └── services/
│       └── api.ts                  # Cliente HTTP
│
├── server/                     # Backend Node.js
│   ├── index.js                    # Servidor Express
│   ├── data/
│   │   └── history.json            # Historial guardado
│   └── services/
│       ├── bcv.js                  # Scraper BCV
│       ├── binance.js              # API Binance P2P
│       └── history.js              # Gestión de historial
│
├── assets/                     # Recursos estáticos
│   ├── icon.png                    # Logo de la app
│   ├── adaptive-icon.png           # Icono adaptativo Android
│   ├── splash-icon.png             # Pantalla de carga
│   └── icons/                      # SVGs personalizados
│
└── .agent/workflows/           # Estándares de desarrollo
    └── react-native-expo-standard.md
```

---

## 🚀 Instalación

### Requisitos

- Node.js 18+
- npm
- Expo Go (en dispositivo móvil) o emulador

### Backend Local

```bash
cd server
npm install
node index.js
# Servidor en http://localhost:3000
```

### Frontend Local

```bash
npm install
npx expo start
# Escanear QR con Expo Go
```

---

## 📲 Actualizaciones OTA (Over-the-Air)

### ⚡ ¿Qué se actualiza automáticamente?

| Tipo de Cambio              | Actualización Automática | Requiere Nuevo APK |
| --------------------------- | ------------------------ | ------------------ |
| Colores, estilos, textos    | ✅ SÍ                    | ❌ NO              |
| Nuevas pantallas            | ✅ SÍ                    | ❌ NO              |
| Lógica de negocio (JS)      | ✅ SÍ                    | ❌ NO              |
| Corrección de bugs          | ✅ SÍ                    | ❌ NO              |
| Nuevas dependencias nativas | ❌ NO                    | ✅ SÍ              |
| Cámara, mapas, sensores     | ❌ NO                    | ✅ SÍ              |
| Cambios en app.json         | ❌ NO                    | ✅ SÍ              |

### 🔄 Cómo publicar una actualización OTA

Después de hacer cambios en el código:

```bash
# Publicar actualización al branch preview
eas update --branch preview --message "Descripción de los cambios"
```

**¿Qué pasa después?**

1. La actualización se sube a los servidores de Expo
2. Cuando los usuarios abran la app, se descarga automáticamente
3. Al reiniciar la app, ven la nueva versión

### 📦 Cuándo generar nuevo APK

Solo cuando:

- Agregues librerías nativas (cámara, mapas, etc.)
- Cambies la versión en `app.json`
- Modifiques configuraciones de Android

```bash
eas build -p android --profile preview --clear-cache
```

---

## 🌐 API Endpoints

| Endpoint              | Método | Descripción                |
| --------------------- | ------ | -------------------------- |
| `/api/rates`          | GET    | Tasas actuales             |
| `/api/history?days=7` | GET    | Historial (7, 30, 90 días) |
| `/api/trend?days=7`   | GET    | Solo tendencia             |
| `/api/health`         | GET    | Estado del servidor        |

### Ejemplo de Respuesta `/api/rates`

```json
{
  "bcv": {
    "usd": 370.25,
    "eur": 440.48
  },
  "binance": 497.12,
  "bestOption": "bcv",
  "lastUpdated": "2024-01-31T20:00:00Z"
}
```

---

## ⚙️ Comandos Útiles

### 🧹 Limpieza Nuclear (Si algo falla)

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npx expo install --fix
```

### 🏗️ Build APK

```bash
# Build limpio con cache vacío
eas build -p android --profile preview --clear-cache
```

### 🔄 Publicar Actualización OTA

```bash
eas update --branch preview --message "Descripción del cambio"
```

### 🧪 Desarrollo Local

```bash
# Terminal 1: Backend
cd server && node index.js

# Terminal 2: Frontend
npx expo start
```

---

## 📤 Distribución

### Configuración Actual

| Campo        | Valor                                                   |
| ------------ | ------------------------------------------------------- |
| Nombre       | Kambio                                                  |
| Package      | com.giudpc.kambio                                       |
| Proyecto EAS | v-rate                                                  |
| OTA URL      | https://u.expo.dev/03bd6ce6-53aa-4206-95cb-4b5bd86f52ba |

### Backend en Producción

El servidor está desplegado en Render.com. Para evitar cold starts:

- Configurar un cron-job externo cada 10-14 minutos
- Usar UptimeRobot o cron-job.org para ping automático

### Flujo de Trabajo

1. **Desarrollo**: Hacer cambios localmente
2. **Testing**: Probar con `npx expo start`
3. **Actualización JS**: `eas update --branch preview`
4. **Actualización Nativa**: `eas build -p android --profile preview`

---

## 📜 Licencia

Proyecto privado para uso personal y familiar.

---

**Desarrollado con ❤️ usando Expo y React Native**
