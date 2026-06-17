# 📅 Mi Calendario Escolar — PWA

App instalable para celular con calendario de clases, materias, objetivos y tiempo de juego.

---

## 🚀 Subir a Vercel (gratis, ~5 minutos)

### Paso 1 — Sube el proyecto a GitHub
1. Ve a [github.com](https://github.com) y crea una cuenta si no tienes
2. Crea un repositorio nuevo llamado `calendario-escolar` (público)
3. Sube todos los archivos de esta carpeta

   Si tienes Git instalado:
   ```bash
   git init
   git add .
   git commit -m "primer commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/calendario-escolar.git
   git push -u origin main
   ```

   O arrastra la carpeta desde la web de GitHub → "uploading an existing file"

### Paso 2 — Conecta con Vercel
1. Ve a [vercel.com](https://vercel.com) y crea cuenta con tu GitHub
2. Clic en **"Add New Project"**
3. Selecciona el repositorio `calendario-escolar`
4. Vercel detecta Vite automáticamente → clic en **Deploy**
5. En ~1 minuto tendrás una URL tipo: `calendario-escolar.vercel.app`

---

## 📱 Instalar en el celular

### Android (Chrome)
1. Abre la URL en Chrome
2. Toca el menú ⋮ → **"Agregar a pantalla de inicio"**
3. ¡Listo! Aparece como app en tu pantalla

### iPhone (Safari)
1. Abre la URL en Safari (no Chrome)
2. Toca el ícono compartir □↑ → **"Agregar a pantalla de inicio"**
3. ¡Listo!

---

## 🛠 Personalizar datos

Edita el archivo `src/App.jsx`:

- **Materias** → array `SUBJECTS` (línea ~14)
- **Horario** → objeto `SCHEDULE` (línea ~33)
- **Objetivos** → array `INITIAL_GOALS` (línea ~62)

Cada vez que guardes cambios y los subas a GitHub, Vercel actualiza la app automáticamente.

---

## 📦 Estructura del proyecto

```
calendario-pwa/
├── public/
│   ├── icon-192.png     # Ícono de la app
│   └── icon-512.png
├── src/
│   ├── App.jsx          # Toda la app (aquí editas los datos)
│   ├── main.jsx         # Punto de entrada
│   └── index.css        # Estilos base
├── index.html
├── vite.config.js       # Config PWA
└── package.json
```
