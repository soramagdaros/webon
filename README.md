# Thumbnail AI Studio

Aplicación web local para crear portadas de YouTube 1920x1080 como generador de prompts y editor visual. Opera sin backend, sin APIs externas, sin captura de credenciales, sin automatización de login y sin scraping de ChatGPT, Gemini ni DeepSeek.

## Uso local

```bash
npm run dev
```

Abre `http://localhost:5173` y trabaja con archivos locales en tu navegador.

## Flujo

1. Escribe título, categoría, estilo visual y descripción breve.
2. Copia prompts para ChatGPT, Gemini, DeepSeek o prompt visual.
3. Abre cada plataforma con los botones externos e inicia sesión manualmente allí.
4. Descarga la imagen generada y súbela como fondo en esta app.
5. Añade personaje y logo, edita texto, fusiona automáticamente y exporta PNG/JPG 1920x1080.

## Privacidad

El historial usa `LocalStorage` del navegador. No existe backend ni envío de imágenes a servidores desde la app.
