# Especificaciones de Diseño - Onboarding LANA

Esta guía contiene todas las especificaciones de diseño del flujo de onboarding para que puedas iterarlo en Figma.

## 🎨 Tokens de Material 3

### Colores Primarios
- **Primary 50**: `#e8f5e9`
- **Primary 100**: `#c8e6c9`
- **Primary 200**: `#a5d6a7`
- **Primary 300**: `#81c784`
- **Primary 400**: `#66bb6a`
- **Primary 500**: `#4caf50` ⭐ Principal
- **Primary 600**: `#43a047`
- **Primary 700**: `#388e3c`
- **Primary 800**: `#2e7d32`
- **Primary 900**: `#1b5e20`

### Colores de Superficie (Surface)
- **Surface**: `#1e1e1e` (Fondo principal)
- **Surface Variant**: `#2c2c2c` (Bordes, inputs)
- **Surface Container**: `#2c2c2c` (Tarjetas, inputs)
- **Surface Container High**: `#363636` (Hover states)
- **Surface Container Highest**: `#404040` (Elevación máxima)

### Colores de Error
- **Error 400**: `#ef5350` (Texto de error)
- **Error 500**: `#f44336` (Bordes de error)
- **Error 600**: `#e53935`

### Texto
- **Texto Principal**: `#FFFFFF`
- **Texto Secundario**: `#E0E0E0` (Surface-300)
- **Texto Terciario**: `#BDBDBD` (Surface-400)
- **Placeholder**: `#9E9E9E` (Surface-500)

## 📐 Espaciado y Layout

### Contenedor Principal
- **Ancho máximo**: `672px` (max-w-2xl)
- **Padding**: `32px` (p-8)
- **Border radius**: `24px` (rounded-3xl)
- **Background**: Surface Container (`#2c2c2c`)
- **Border**: `1px solid Surface Variant` (`#2c2c2c`)

### Espaciado (Tailwind)
- **xs**: `4px` (gap-1)
- **sm**: `8px` (gap-2)
- **md**: `16px` (gap-4)
- **lg**: `24px` (gap-6)
- **xl**: `32px` (gap-8)

## 🎯 Sistema de Elevación (Material 3)

### Elevation 0
- Sin sombra

### Elevation 1
```
box-shadow: 
  0px 1px 2px 0px rgba(0, 0, 0, 0.3),
  0px 1px 3px 1px rgba(0, 0, 0, 0.15)
```

### Elevation 2
```
box-shadow: 
  0px 1px 2px 0px rgba(0, 0, 0, 0.3),
  0px 2px 6px 2px rgba(0, 0, 0, 0.15)
```

### Elevation 3 ⭐ Usado en tarjeta principal
```
box-shadow: 
  0px 1px 3px 0px rgba(0, 0, 0, 0.3),
  0px 4px 8px 3px rgba(0, 0, 0, 0.15)
```

### Elevation 4
```
box-shadow: 
  0px 2px 3px 0px rgba(0, 0, 0, 0.3),
  0px 6px 10px 4px rgba(0, 0, 0, 0.15)
```

### Elevation 5
```
box-shadow: 
  0px 4px 4px 0px rgba(0, 0, 0, 0.3),
  0px 8px 12px 6px rgba(0, 0, 0, 0.15)
```

## 📝 Tipografía

### Familia
- **Font Family**: `Roboto` (Google Fonts)
- **Weights**: 300, 400, 500, 700

### Escalas
- **H1 (Título principal)**: `32px` (text-3xl), Weight: 700, Line-height: 1.2
- **H2 (Título de paso)**: `24px` (text-2xl), Weight: 700, Line-height: 1.3
- **H3 (Subtítulo)**: `18px` (text-lg), Weight: 400, Line-height: 1.5
- **Body**: `16px` (text-base), Weight: 400, Line-height: 1.5
- **Label**: `14px` (text-sm), Weight: 500, Line-height: 1.4
- **Small**: `12px` (text-xs), Weight: 400, Line-height: 1.4

## 🔘 Componentes

### Input Field (Material 3)
- **Altura**: `48px` (py-3)
- **Padding horizontal**: `16px` (px-4)
- **Border radius**: `12px` (rounded-xl)
- **Border**: `2px solid`
  - Default: Surface Variant (`#2c2c2c`)
  - Focus: Primary 500 (`#4caf50`)
  - Error: Error 500 (`#f44336`)
- **Background**: Surface Container (`#2c2c2c`)
- **Texto**: `16px`, Weight: 400
- **Placeholder**: Surface 500 (`#9E9E9E`)
- **Focus ring**: `2px solid Primary 500/20` (opacity 20%)

### Botón Primario
- **Padding**: `12px 24px` (px-6 py-3)
- **Border radius**: `12px` (rounded-xl)
- **Background**: Primary 500 (`#4caf50`)
- **Hover**: Primary 600 (`#43a047`)
- **Texto**: `16px`, Weight: 500, Color: White
- **Elevation**: Elevation 2 (hover: Elevation 3)
- **Altura mínima**: `48px`

### Botón Secundario
- **Padding**: `12px 24px` (px-6 py-3)
- **Border radius**: `12px` (rounded-xl)
- **Background**: Surface Container High (`#363636`)
- **Hover**: Surface Container Highest (`#404040`)
- **Texto**: `16px`, Weight: 500, Color: Surface 200 (`#E0E0E0`)
- **Disabled**: Opacity 50%, Background: Surface Variant

### Botón de Opción (Goals Step)
- **Padding**: `16px` (p-4)
- **Border radius**: `12px` (rounded-xl)
- **Border**: `2px solid`
  - Default: Surface Variant
  - Selected: Primary 500
- **Background**:
  - Default: Surface Container
  - Selected: Primary 500/20 (20% opacity)
  - Hover: Surface Container High
- **Elevation**: Elevation 2 cuando está seleccionado

## 📊 Estructura de los 5 Pasos

### Paso 1: Bienvenida
- **Icono**: Sparkles, tamaño `64px`, dentro de círculo `80px`
- **Título**: "¡Bienvenido a LANA!"
- **Subtítulo**: "Tu asistente financiero inteligente"
- **Lista de características** (3 items):
  - Icono: `20px` en círculo `32px` con Primary 500/20
  - Título: `16px`, Weight: 600
  - Descripción: `14px`, Weight: 400, Color: Surface 400

### Paso 2: Información Personal
- **Campos**:
  1. Nombre completo (text input)
  2. Correo electrónico (email input)
  3. Teléfono (tel input)
- **Validación**: Mensaje de error debajo con icono AlertCircle `16px`

### Paso 3: Situación Financiera
- **Campos**:
  1. Ingresos mensuales (currency input con prefijo $)
  2. Gastos mensuales (currency input con prefijo $)
- **Feedback**: Cálculo de ahorro potencial debajo del campo de gastos
  - Verde si positivo, Rojo si negativo

### Paso 4: Objetivos
- **Selección de objetivo**: Grid 2 columnas, 5 opciones
  - Fondo de emergencia (Shield icon)
  - Vacaciones (Sparkles icon)
  - Compra de casa (Target icon)
  - Educación (TrendingUp icon)
  - Otro (DollarSign icon)
- **Campo de monto objetivo**: Currency input
- **Selector de plazo**: Dropdown con opciones (3, 6, 12, 24, 36 meses)

### Paso 5: Completado
- **Icono**: CheckCircle, tamaño `64px`
- **Resumen**: Tarjeta con información ingresada
  - Background: Surface Container
  - Padding: `24px`
  - Border radius: `12px`
  - Lista de items con label y valor

## 🔄 Barra de Progreso

### Indicadores de Paso
- **Tamaño**: `40px` (w-10 h-10)
- **Border radius**: `50%` (circular)
- **Estados**:
  - **Completado**: Background Primary 500, Icono CheckCircle blanco `20px`
  - **Actual**: Background Primary 500, Número blanco `16px`, Weight: 600
  - **Pendiente**: Background Surface Container, Border Surface Variant `2px`, Número Surface 500
- **Línea conectora**: `4px` altura, `8px` margen horizontal
  - Completado: Primary 500
  - Pendiente: Surface Variant

## ⚠️ Estados de Error

### Mensaje de Error
- **Container**: Flex row, gap `8px`
- **Icono**: AlertCircle `16px`, Color: Error 400
- **Texto**: `14px`, Weight: 400, Color: Error 400
- **Espaciado**: `8px` arriba del campo (mt-2)

### Input con Error
- **Border**: Error 500 (`#f44336`)
- **Focus border**: Error 400 (`#ef5350`)

## 🎭 Animaciones y Transiciones

### Transiciones
- **Duración**: `200ms` (transition-all duration-200)
- **Easing**: `ease-in-out`

### Estados Hover
- **Botones**: Elevación aumenta de 2 a 3
- **Opciones**: Background cambia a Surface Container High
- **Inputs**: Border cambia a Primary 500

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
  - Padding container: `16px` (p-4)
  - Grid de opciones: 1 columna
- **Tablet**: 640px - 1024px
  - Grid de opciones: 2 columnas
- **Desktop**: > 1024px
  - Ancho máximo: `672px`

## 🔗 Sincronización Figma → Código

### Opciones para iterar:

1. **Figma Dev Mode**: Si tienes acceso a Figma Dev Mode
   - Selecciona los componentes en Figma
   - Copia los tokens de color y espaciado
   - Actualiza los valores en `tailwind.config.js`

2. **Exportar como código**: 
   - Usa plugins de Figma como "Figma to React" o "Anima"
   - Compara con el código actual en `OnboardingScreen.jsx`

3. **Manual**:
   - Documenta cambios en este archivo
   - Actualiza tokens en `tailwind.config.js`
   - Ajusta componentes en `OnboardingScreen.jsx`

## 📋 Checklist para Iteración

- [ ] Definir nuevos tokens de color en Figma
- [ ] Actualizar componentes visuales
- [ ] Documentar cambios de espaciado
- [ ] Probar en diferentes tamaños de pantalla
- [ ] Exportar assets (iconos, imágenes)
- [ ] Actualizar `tailwind.config.js` con nuevos tokens
- [ ] Actualizar `OnboardingScreen.jsx` con nuevos componentes
- [ ] Probar validaciones y estados
- [ ] Verificar accesibilidad (contraste, focus states)

---

**Última actualización**: Basado en la implementación actual del onboarding

