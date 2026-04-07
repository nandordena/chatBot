import 'dotenv/config';
import tmi from 'tmi.js';

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
const CHANNEL = process.env.TWITCH_CHANNEL;

const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: BOT_USERNAME,
    password: OAUTH_TOKEN
  },
  channels: [CHANNEL]
});

const commands = new Map();

commands.set('ping', async ({ channel }) => {
  await client.say(channel, 'pong');
});

commands.set('hola', async ({ channel, user }) => {
  await client.say(channel, `Hola, @${user} 👋`);
});

client.on('message', async (channel, tags, message, self) => {
  if (self) return;

  const text = message.trim();
  if (!text.startsWith('!')) return;

  const [rawCommand, ...args] = text.slice(1).split(/\s+/);
  const command = rawCommand.toLowerCase();

  const handler = commands.get(command);
  if (!handler) return;

  try {
    await handler({
      channel,
      user: tags['display-name'] ?? tags.username ?? 'chat',
      tags,
      args,
      message: text
    });
  } catch (err) {
    console.error(`Error ejecutando !${command}`, err);
  }
});

client.on('connected', (address, port) => {
  console.log(`Conectado a Twitch IRC: ${address}:${port}`);
});

await client.connect();
