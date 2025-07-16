# 📋 Instrucciones para Subir a GitHub y Configurar GitHub Pages

## 🚀 Paso 1: Crear el Repositorio en GitHub

1. **Ir a GitHub**: Visita [github.com](https://github.com) y asegúrate de estar logueado
2. **Crear nuevo repositorio**: 
   - Haz clic en el botón "+" en la esquina superior derecha
   - Selecciona "New repository"
3. **Configurar el repositorio**:
   - **Repository name**: `adelanto-dinero-prototipos` (o el nombre que prefieras)
   - **Description**: `Prototipos interactivos para aumentar adopción de Adelanto de Dinero del 20% al 80%+`
   - **Visibility**: Público (para usar GitHub Pages gratis)
   - **NO marques** "Add a README file" (ya tenemos uno)
   - **NO marques** "Add .gitignore" (ya tenemos uno)
4. **Crear el repositorio**: Haz clic en "Create repository"

## 📤 Paso 2: Subir los Archivos a GitHub

Copia y pega estos comandos en tu terminal (ya estamos en el directorio correcto):

```bash
# Agregar el repositorio remoto (reemplaza 'tu-usuario' con tu username de GitHub)
git remote add origin https://github.com/tu-usuario/adelanto-dinero-prototipos.git

# Verificar que se agregó correctamente
git remote -v

# Subir los archivos al repositorio
git push -u origin main
```

## 🌐 Paso 3: Activar GitHub Pages

1. **Ir a Settings**: En tu repositorio en GitHub, haz clic en "Settings"
2. **Buscar Pages**: En el menú lateral izquierdo, busca y haz clic en "Pages"
3. **Configurar source**:
   - En "Build and deployment" → "Source", selecciona "Deploy from a branch"
   - En "Branch", selecciona "main"
   - En "Folder", deja "/ (root)"
4. **Guardar**: Haz clic en "Save"

## ✅ Paso 4: Acceder a tu Página

Después de unos minutos (puede tomar 5-10 minutos), tu página estará disponible en:

```
https://tu-usuario.github.io/adelanto-dinero-prototipos/
```

La página principal será `index_prototipos.html` que enlaza a todos los prototipos.

## 🔧 Comandos Útiles para Futuras Actualizaciones

Si necesitas hacer cambios en el futuro:

```bash
# Agregar cambios
git add .

# Hacer commit
git commit -m "Descripción de los cambios"

# Subir cambios
git push origin main
```

## 📋 Verificación de Configuración Actual

Tu repositorio local ya tiene:
- ✅ Repositorio git inicializado
- ✅ Todos los archivos agregados
- ✅ Commit inicial realizado
- ✅ README.md profesional
- ✅ .gitignore configurado

**Solo necesitas**:
1. Crear el repositorio en GitHub
2. Agregar el remote origin
3. Hacer push
4. Activar GitHub Pages

## 🎯 Resultado Final

Una vez completado, tendrás:
- **Repositorio público** en GitHub con todos los prototipos
- **GitHub Page** accesible mundialmente
- **URL compartible** para stakeholders y testing
- **Documentación completa** visible en GitHub

### URLs que funcionarán:
- Página principal: `https://tu-usuario.github.io/adelanto-dinero-prototipos/`
- Concepto 1: `https://tu-usuario.github.io/adelanto-dinero-prototipos/concepto1_asistente_ia.html`
- Concepto 2: `https://tu-usuario.github.io/adelanto-dinero-prototipos/concepto2_escenarios.html`
- Concepto 3: `https://tu-usuario.github.io/adelanto-dinero-prototipos/concepto3_comunidad.html`
- Concepto 4: `https://tu-usuario.github.io/adelanto-dinero-prototipos/concepto4_planificador.html`

---

*¡Listo para compartir y probar con usuarios reales!* 🚀 