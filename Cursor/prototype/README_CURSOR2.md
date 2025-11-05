# Prototipos Material 3 - Simulador de Crédito

Este repositorio contiene los prototipos de simulación de crédito diseñados con Material Design 3.

## 🚀 Demo en Vivo

Una vez configurado el deploy, estará disponible en:
- GitHub Pages: `https://sanrivero-meli.github.io/cursor-2/`
- O en Vercel/Netlify si prefieres esas plataformas

## 📁 Estructura del Proyecto

```
prototype/
├── src/
│   ├── screens/
│   │   ├── SimulatorScreenM3.jsx          # Prototipo Híbrido (Recomendado)
│   │   └── SimulatorScreenM3Simple.jsx   # Prototipo Minimalista
│   └── App.jsx                           # Rutas configuradas
├── UX_IDEATION_CREDIT_SIMULATOR.md       # 6 variantes de UX
├── PROTOTIPOS_MATERIAL3.md               # Guía de prototipos
└── DEPLOY.md                             # Instrucciones de deploy
```

## 🎯 Rutas Disponibles

- `/simulator-m3` - Prototipo Híbrido Material 3 (Vista unificada + panel lateral)
- `/simulator-m3-simple` - Prototipo Simple Material 3 (Centrado en resultados)
- `/simulator` - Prototipo original

## 🛠️ Desarrollo Local

```bash
cd prototype
npm install
npm run dev
```

Luego abre: `http://localhost:5173/simulator-m3`

## 📦 Deploy

### Opción 1: Vercel (Recomendado)

1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu cuenta de GitHub
3. Importa el repositorio `cursor-2`
4. Configuración:
   - **Root Directory**: `prototype`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Deploy automático ✅

### Opción 2: GitHub Pages

1. Ve a Settings → Pages
2. Source: **GitHub Actions**
3. El workflow ya está configurado en `.github/workflows/deploy.yml`

## ✨ Características

- ✅ Material Design 3 completo
- ✅ Microinteracciones elegantes
- ✅ Animaciones suaves
- ✅ Diseño responsive
- ✅ Enfoque en seguridad y confianza

## 📚 Documentación

- [UX Ideación Completa](./UX_IDEATION_CREDIT_SIMULATOR.md)
- [Guía de Prototipos](./PROTOTIPOS_MATERIAL3.md)
- [Instrucciones de Deploy](./DEPLOY.md)

