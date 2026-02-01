---
description: Estándar de desarrollo para proyectos React Native y Expo - Lecciones aprendidas del proyecto Kambio
---

# 🛡️ Estándar de Desarrollo React Native + Expo

Este workflow contiene las lecciones aprendidas y mejores prácticas para proyectos de React Native con Expo.

---

## 1. Regla de Oro de Versiones (Estabilidad ante Novedad)

**Nunca usar versiones BETA o experimentales** de Expo (como SDK 54) o React Native (como 0.81) para proyectos de producción.

### Estándar:

- Apegarse estrictamente a la **última versión Estable** (actualmente SDK 52)
- Verificar siempre la matriz de compatibilidad entre: `expo`, `react-native` y `react-native-reanimated`

### Comando para verificar compatibilidad:

```powershell
npx expo install --check
```

> ⚠️ **Lección**: El error de versiones mezcladas costó horas de depuración.

---

## 2. Gestión de Assets (Iconos y Logos)

Si el build falla con `AAPT: error: file failed to compile`, el culpable es el **formato de la imagen del icono** (probablemente entrelazado o 16-bit), no el código.

### Solución Inmediata:

1. Probar con un icono default de Expo antes de perder tiempo depurando código
2. Descargar iconos válidos:
   ```powershell
   # Copiar splash-icon.png como base (siempre funciona)
   Copy-Item -Path "assets/splash-icon.png" -Destination "assets/icon.png" -Force
   Copy-Item -Path "assets/splash-icon.png" -Destination "assets/adaptive-icon.png" -Force
   ```

### Higiene:

// turbo

```powershell
Remove-Item -Recurse -Force android
```

Siempre eliminar la carpeta `android/` local antes de mandar un build a EAS si hemos usado `npx expo prebuild` localmente.

### Formato correcto para iconos:

- PNG **no entrelazado** (non-interlaced)
- **8-bit** de profundidad de color
- Dimensiones: 1024x1024 para `icon.png`, mínimo 108x108 para adaptive-icon

---

## 3. Arquitectura Backend (Render + Cron)

Para Backends gratuitos en Render:

1. **Implementar siempre un endpoint ligero**:
   - `/api/health` o `/api/rates`
2. **Configurar Cron-job externo** (cada 10-14 minutos) desde el día 1 para evitar el Cold Start (latencia de 50s)
   - Usar: cron-job.org, UptimeRobot, o similar

3. **Separación**: El Backend y el Frontend deben vivir en **repositorios de GitHub separados** desde el inicio.

---

## 4. Manejo de Monedas (Inputs)

**No reinventar la rueda** con RegEx manuales para miles y decimales.

### Estándar:

```javascript
// Para VISUALIZACIÓN
const formatted = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(value);

// Para CÁLCULOS: mantener el valor crudo (raw value)
const rawValue = parseFloat(inputValue.replace(/\./g, "").replace(",", "."));
```

---

## 5. Comandos de Rescate

### Protocolo de Limpieza Nuclear

Si el build falla misteriosamente, ejecutar esto ANTES de nada:

// turbo-all

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npx expo install --fix
```

### Build limpio en la nube:

```powershell
eas build -p android --profile preview --clear-cache
```

---

## 6. Actualizaciones OTA (Over-the-Air)

Para distribución personal sin Play Store:

### Configuración en app.json:

```json
{
  "expo": {
    "updates": {
      "enabled": true,
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/[PROJECT_ID]"
    },
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }
}
```

### Publicar actualización:

```powershell
eas update --branch preview --message "Descripción del cambio"
```

Los usuarios recibirán la actualización automáticamente al abrir la app.

---

## 7. Perfiles de Build (eas.json)

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "distribution": "store"
    }
  }
}
```

---

✅ **Este estándar debe aplicarse a TODOS los proyectos futuros de React Native + Expo.**
