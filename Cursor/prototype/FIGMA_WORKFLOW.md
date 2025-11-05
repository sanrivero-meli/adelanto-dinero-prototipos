# Workflow: Iterar Onboarding en Figma

Guía paso a paso para iterar el diseño del onboarding en Figma y sincronizarlo con el código.

## 🎯 Opción 1: Usar Figma Dev Mode (Recomendado)

### Paso 1: Configurar Variables en Figma
1. Abre Figma Desktop
2. Ve a **Design** → **Variables** (o presiona `Shift + I`)
3. Crea variables basadas en `figma-tokens.json`:
   - **Colores**: Importa los colores de primary, surface, error, text
   - **Espaciado**: Crea variables de spacing (xs, sm, md, lg, xl)
   - **Border Radius**: Crea variables de radius (sm, md, lg, xl, full)
   - **Tipografía**: Configura Roboto con los weights y sizes

### Paso 2: Crear Componentes Base
Crea componentes reutilizables en Figma:

#### Input Field Component
- **Variants**:
  - State: Default, Focus, Error, Disabled
  - Type: Text, Email, Tel, Currency
- **Properties**:
  - Background: Surface Container
  - Border: 2px Solid Surface Variant
  - Border Radius: 12px
  - Padding: 16px horizontal, 12px vertical
  - Height: 48px

#### Button Component
- **Variants**:
  - Type: Primary, Secondary, Tertiary
  - State: Default, Hover, Disabled
- **Properties**:
  - Border Radius: 12px
  - Padding: 12px 24px
  - Height: 48px

#### Step Indicator Component
- **Variants**:
  - State: Completed, Current, Pending
- **Properties**:
  - Size: 40px × 40px
  - Border Radius: 50%

### Paso 3: Diseñar los 5 Pasos

#### Frame Structure
- **Ancho**: 672px (máximo)
- **Background**: Surface (#1e1e1e)
- **Padding**: 32px

#### Paso 1: Bienvenida
- Icono centrado: 64px dentro de círculo 80px
- Título: 32px, Bold
- Subtítulo: 18px, Regular
- Lista de características con iconos

#### Paso 2-4: Formularios
- Título del paso: 24px, Bold
- Subtítulo: 16px, Regular, Surface 400
- Campos con labels arriba
- Mensajes de error debajo (cuando aplica)

#### Paso 5: Completado
- Icono de éxito
- Tarjeta de resumen con información

### Paso 4: Exportar Especificaciones
1. Selecciona cada componente
2. Usa **Dev Mode** para ver:
   - Espaciado exacto
   - Colores con códigos hex
   - Tipografía
   - Shadows/Elevation

## 🎨 Opción 2: Usar Plugins de Figma

### Plugin: "Figma Tokens"
1. Instala el plugin "Figma Tokens" desde la comunidad
2. Importa `figma-tokens.json`
3. Los tokens estarán disponibles en Variables

### Plugin: "Figma to React"
1. Diseña tus componentes en Figma
2. Selecciona el componente
3. Ejecuta "Figma to React"
4. Compara el código generado con `OnboardingScreen.jsx`
5. Extrae los valores específicos (colores, espaciado, etc.)

### Plugin: "Anima"
1. Diseña en Figma
2. Usa Anima para generar código React
3. Copia los estilos específicos
4. Actualiza `OnboardingScreen.jsx` con los nuevos valores

## 📋 Checklist de Sincronización

Cuando hagas cambios en Figma, documenta:

### Colores
- [ ] Nuevos colores → Actualizar `tailwind.config.js` → `colors`
- [ ] Cambios en primary/surface/error → Actualizar tokens

### Espaciado
- [ ] Nuevos valores de padding/margin → Actualizar clases en `OnboardingScreen.jsx`
- [ ] Cambios en gaps → Actualizar `gap-*` classes

### Tipografía
- [ ] Nuevos tamaños → Actualizar `text-*` classes
- [ ] Cambios en weights → Actualizar `font-*` classes

### Componentes
- [ ] Cambios en inputs → Actualizar estilos en `renderStepContent()`
- [ ] Cambios en botones → Actualizar `className` de botones
- [ ] Cambios en tarjetas → Actualizar contenedores principales

### Elevación
- [ ] Nuevas sombras → Actualizar `tailwind.config.js` → `boxShadow`
- [ ] Cambios en elevation → Actualizar `shadow-elevation-*` classes

## 🔄 Proceso de Iteración Recomendado

### 1. Diseñar en Figma
```
Figma → Crear/Modificar componentes → Documentar cambios
```

### 2. Extraer Valores
```
Figma Dev Mode → Copiar valores específicos → Anotar en documento
```

### 3. Actualizar Código
```
tailwind.config.js → Actualizar tokens
OnboardingScreen.jsx → Actualizar componentes
```

### 4. Probar
```
npm run dev → Verificar cambios → Ajustar si es necesario
```

### 5. Commit
```
git add → git commit → git push
```

## 📝 Ejemplo de Cambio

### Escenario: Cambiar el color primario a azul

**En Figma:**
1. Actualiza la variable `primary.500` a `#2196F3` (azul Material)
2. Guarda los cambios

**En Código:**
1. Abre `tailwind.config.js`
2. Cambia `primary.500: '#4caf50'` → `primary.500: '#2196F3'`
3. Guarda y verifica en `npm run dev`

## 🛠️ Herramientas Útiles

### Figma Plugins Recomendados:
- **Figma Tokens**: Gestión de design tokens
- **Figma to React**: Generar código React
- **Anima**: Exportar a código
- **Contrast Checker**: Verificar accesibilidad de colores
- **Stark**: Verificar accesibilidad completa

### Extensiones de VSCode:
- **Tailwind CSS IntelliSense**: Autocompletado de clases
- **Color Highlight**: Ver colores en código

## 📞 Flujo de Trabajo Colaborativo

### Si trabajas con un diseñador:
1. **Diseñador** crea/itera en Figma
2. **Diseñador** comparte link de Figma con comentarios
3. **Desarrollador** revisa en Dev Mode
4. **Desarrollador** actualiza código basado en especificaciones
5. **Ambos** revisan en staging/producción

### Si eres diseñador y desarrollador:
1. Diseña en Figma primero
2. Usa Dev Mode para extraer valores exactos
3. Implementa en código
4. Itera rápidamente entre ambos

## 🎯 Tips Pro

1. **Nombra bien tus layers en Figma**: Usa nombres consistentes que coincidan con las clases de Tailwind
2. **Usa Auto Layout**: Facilita el responsive y espaciado consistente
3. **Crea componentes**: Facilita iteración y mantenimiento
4. **Documenta decisiones**: Usa comentarios en Figma para explicar por qué
5. **Versiona en Figma**: Usa branches para experimentar sin perder trabajo

---

**Recuerda**: Los cambios en Figma son diseño, los cambios en código son implementación. Mantén ambos sincronizados para evitar problemas.

