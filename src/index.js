import 'dotenv/config';
import tmi from 'tmi.js';
import { read } from './sheet.js';

const requiredEnv = ['TWITCH_BOT_USERNAME', 'TWITCH_OAUTH_TOKEN', 'TWITCH_CHANNEL'];
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(
    `Faltan variables de entorno: ${missing.join(
      ', '
    )}\nCopia .env.example a .env y completa los valores.`
  );
  process.exit(1);
}

const BOT_USERNAME = process.env.TWITCH_BOT_USERNAME;
const OAUTH_TOKEN = process.env.TWITCH_OAUTH_TOKEN;
const CHANNEL_NAME = String(process.env.TWITCH_CHANNEL).replace(/^#/, '');

const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: BOT_USERNAME,
    password: OAUTH_TOKEN
  },
  channels: [CHANNEL_NAME]
});

const COMMAND_PREFIX = '!';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Rate limiting simple para evitar msg_ratelimit.
// Twitch (cuentas normales) limita aprox. 20 mensajes / 30s (~1.5s por mensaje).
// Aquí serializamos envíos y respetamos un mínimo entre mensajes.
let sendQueue = Promise.resolve();
const MIN_SEND_INTERVAL_MS = Number(process.env.TWITCH_MIN_SEND_INTERVAL_MS ?? 2000);
let nextAllowedAt = 0; // timestamp ms: no enviar antes de esto

function enqueueSay(fn) {
  sendQueue = sendQueue
    .then(async () => {
      const now = Date.now();
      const waitMs = Math.max(0, nextAllowedAt - now);
      if (waitMs) await sleep(waitMs);
      await fn();
      nextAllowedAt = Date.now() + MIN_SEND_INTERVAL_MS;
    })
    .catch((e) => {
      // No romper la cola por un error puntual
      console.error('[sendQueue] error', e);
      nextAllowedAt = Date.now() + MIN_SEND_INTERVAL_MS;
    });

  return sendQueue;
}

client.on('message', async (channel, tags, message, self) => {
  // Si el comando lo escribe la MISMA cuenta del bot manualmente, Twitch puede contar ese
  // mensaje en el rate limit. Entonces forzamos a que el primer `send()` espere el intervalo.
  const botUser = String(BOT_USERNAME).toLowerCase();
  const msgUser = String(tags?.username ?? '').toLowerCase();
  if (msgUser && msgUser === botUser) {
    nextAllowedAt = Math.max(nextAllowedAt, Date.now() + MIN_SEND_INTERVAL_MS);
  }

  const text = message.trim();

  const isCommand = text.startsWith(COMMAND_PREFIX);
  const [rawName, ...args] = isCommand ? text.slice(COMMAND_PREFIX.length).split(/\s+/) : [];
  const name = isCommand && rawName ? rawName.toLowerCase() : null;

  const send = async (outText, opts = {}) => {
    if (!outText || typeof outText !== 'string') return;

    const trimmed = outText.trim();
    if (!trimmed) return;

    // tmi.js soporta `client.say(channel, text)`.
    // Reply nativo depende de capacidades/estado; hacemos fallback a mensaje normal.
    return enqueueSay(async () => {
      if (opts.reply && tags?.id) {
        try {
          await client.say(channel, trimmed, { replyParentMsgId: tags.id });
          console.log(`[send] reply -> ${channel}: ${trimmed}`);
          return;
        } catch {
          // ignore y fallback
        }
      }

      await client.say(channel, trimmed);
      console.log(`[send] -> ${channel}: ${trimmed}`);
    });
  };

  /** @type {import('./sheet.js').ChatEvent} */
  const event = {
    platform: 'twitch',
    client,
    channel,
    tags,
    message,
    text,
    self,
    command: {
      isCommand,
      prefix: COMMAND_PREFIX,
      name,
      args
    },
    user: {
      username: tags?.username ?? null,
      displayName: tags?.['display-name'] ?? null
    },
    send
  };

  // Evita loops si el bot se responde a sí mismo, pero aun así deja la info disponible.
  if (self) return;

  try {
    await read(event);
  } catch (err) {
    console.error('Error en sheet.read(event)', err);
  }
});

client.on('connected', (address, port) => {
  console.log(`Conectado a Twitch IRC: ${address}:${port}`);
  console.log(`Bot: ${BOT_USERNAME} | Canal: ${CHANNEL_NAME}`);
});

client.on('join', (channel, username, self) => {
  if (!self) return;
  console.log(`Join OK: ${channel} como ${username}`);
});

client.on('notice', (channel, msgid, message) => {
  // Twitch envía "notice" cuando bloquea algo (rate limit, duplicados, permisos, etc.)
  console.log(`[notice] ${channel} ${msgid}: ${message}`);
});

client.on('messagedeleted', (channel, username, deletedMessage, userstate) => {
  console.log(
    `[messagedeleted] ${channel} user=${username} id=${userstate?.['target-msg-id'] ?? 'n/a'} msg=${deletedMessage}`
  );
});

client.on('timeout', (channel, username, reason, duration, userstate) => {
  console.log(
    `[timeout] ${channel} user=${username} duration=${duration}s reason=${reason ?? ''} id=${
      userstate?.['target-msg-id'] ?? 'n/a'
    }`
  );
});

client.on('ban', (channel, username, reason, userstate) => {
  console.log(
    `[ban] ${channel} user=${username} reason=${reason ?? ''} id=${userstate?.['target-msg-id'] ?? 'n/a'}`
  );
});

client.on('disconnected', (reason) => {
  console.log('Desconectado:', reason);
});

await client.connect();
