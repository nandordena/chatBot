# streaming-chatbot (local)

Chatbot base para **Twitch** en Node.js, ejecutable en local.

## Requisitos

- Node.js 20+ recomendado

## Setup

1) Instala dependencias:

```bash
npm install
```

2) Crea tu archivo `.env`:

```bash
copy .env.example .env
```

3) Rellena `.env`:

- `TWITCH_BOT_USERNAME`: usuario de tu bot
- `TWITCH_OAUTH_TOKEN`: token en formato `oauth:...`
- `TWITCH_CHANNEL`: tu canal (sin #)

## Ejecutar

```bash
npm run dev
```

En el chat de tu canal prueba:

- `!ping` → `pong`
- `!hola` → saludo

## Estructura

- `src/index.js`: conexión a Twitch + router de comandos

