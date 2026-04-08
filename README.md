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
- `TWITCH_OAUTH_TOKEN`: access token en formato `oauth:...` (NO es el client secret)
- `TWITCH_CHANNEL`: tu canal (sin #)

## Generar el token OAuth (recomendado)

Tu `client_id` y `client_secret` **no** se pegan como `TWITCH_OAUTH_TOKEN`. Ese valor tiene que ser un **access token**.

1) En `.env` añade:

- `TWITCH_CLIENT_ID`
- `TWITCH_CLIENT_SECRET`
- `TWITCH_REDIRECT_URI` (por defecto `http://localhost:5179/callback`)

2) Genera el token:

```bash
npm run auth:twitch
```

3) Copia la línea que te imprime (`TWITCH_OAUTH_TOKEN=oauth:...`) a tu `.env`.

## Ejecutar

```bash
npm run dev
```

Puedes sobreescribir el canal por parámetro:

```bash
npm run dev -- nombrecanal
```

En el chat de tu canal prueba:

- `!ping` → `pong`
- `!hola` → saludo

## Estructura

- `src/index.js`: conexión a Twitch + router de comandos

