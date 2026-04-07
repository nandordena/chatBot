/**
 * Hoja de programación del bot.
 *
 * Este archivo es tu “panel” para controlar comandos/acciones sin tocar `src/index.js`.
 * Se ejecuta en caliente con `npm run dev` (Node watch), así que cada guardado recarga el proceso.
 */

/**
 * @typedef {Object} ChatEvent
 *
 * @property {'twitch'} platform
 * Plataforma origen del evento.
 *
 * @property {import('tmi.js').Client} client
 * Cliente conectado (por si necesitas APIs avanzadas).
 *
 * @property {string} channel
 * Canal destino (ej: "#muntidev"). Es el canal al que normalmente responderás.
 *
 * @property {import('tmi.js').ChatUserstate} tags
 * Metadatos del autor y del mensaje. Incluye campos útiles como:
 * - `tags.username`: login en minúsculas
 * - `tags['display-name']`: nombre mostrado
 * - `tags.mod`: si es mod
 * - `tags.badges`: badges (broadcaster/sub/etc.)
 * - `tags.id`: id del mensaje
 *
 * @property {string} message
 * Mensaje original tal como llegó (sin modificar).
 *
 * @property {string} text
 * Mensaje recortado (`message.trim()`), útil para parseo.
 *
 * @property {boolean} self
 * `true` si el mensaje lo envió el propio bot.
 *
 * @property {{ isCommand: boolean, prefix: string, name: string|null, args: string[] }} command
 * Resultado del parseo de comando.
 * - `isCommand`: si comienza con `prefix` (por defecto "!")
 * - `name`: nombre del comando sin prefijo (ej: "ping") o `null` si no aplica
 * - `args`: argumentos separados por espacios
 *
 * @property {{ username: string|null, displayName: string|null }} user
 * Autor del mensaje en dos formatos comunes.
 *
 * @property {(text: string, opts?: { reply?: boolean }) => Promise<void>} send
 * Función para responder en el mismo canal.
 * - `send("hola")`: envía al chat del canal
 * - `send("...", { reply: true })`: intenta responder como reply si hay soporte (si no, manda normal)
 */

/**
 * Función principal para procesar cada mensaje entrante.
 * Edita libremente esta función: aquí va tu lógica de comandos y acciones.
 *
 * @param {ChatEvent} event
 */
export async function read(event) {
  // Ejemplo mínimo: comandos con prefijo "!"
  if (!event.command.isCommand) return;

  if (event.command.name === 'ping') {
    await event.send('pong');
    return;
  }

  if (event.command.name === 'hola') {
    const name = event.user.displayName ?? event.user.username ?? 'chat';
    await event.send(`Hola, @${name}`);
  }
}

