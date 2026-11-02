# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Despliegue

El proyecto puede desplegarse tanto en Netlify como en Vercel. En ambos servicios, usa el comando `npm run build` y la carpeta de salida `dist`.

- **Netlify:** la configuración de `netlify.toml` y `public/_redirects` mantiene las rutas de React disponibles al abrir o recargar una URL directamente.
- **Vercel:** `vercel.json` configura el build y redirige las rutas de la aplicación a `index.html`, necesario para React Router.

## Imágenes de productos

Las imágenes nuevas se suben a ImgBB y se guarda la URL directa del archivo. Configurá `VITE_IMGBB_API_KEY` en el entorno local y en el servicio de despliegue. Los enlaces a páginas de visualización de ImgBB usan las copias locales de `public/img` cuando están disponibles; los enlaces directos de imagen permanecen alojados en ImgBB.
