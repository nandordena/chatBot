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

  // IA (Hypereal): ejemplo de uso
  // Escribe: !ai tu pregunta
  // Nota: la función se llama "pront" porque así la pediste.
  // eslint-disable-next-line no-use-before-define
  if (
    event.command?.name === 'ia'
    || event.command?.name === 'gpt'
  ) {
    const question = event.command.args.join(' ').trim();
    if (!question) {
      await event.send('Uso: !ai <pregunta>');
      return;
    }
    const out = await pront(question);
    await event.send(out === 'FALSE' ? 'no se  ┑(o. o)┍' : out);
    return;
  }

  // Comandos con prefijo "!"
  if (!event.command.isCommand) return;

  if (event.command.name === 'ping') {
    await event.send('pong');
    return;
  }

  if (event.command.name === 'hola') {
    const name = event.user.displayName ?? event.user.username ?? 'chat';
    await event.send(`Hola, @${name}`);
    return;
  }

  // Soporta dados d3, d4, ..., d10, ..., d20
  // d10 es el único que va de 0-9, los demás de 1-n
  const diceMatch = event.command.name.match(/^d(3|4|6|8|10|12|20)$/);
  if (diceMatch) {
    const type = parseInt(diceMatch[1], 10);

    // Determinar número de dados (1 a 5)
    let numDice = 1;
    if (
      event.command.args.length > 0 &&
      /^\d+$/.test(event.command.args[0])
    ) {
      numDice = Math.min(Math.max(parseInt(event.command.args[0], 10), 1), 5);
    }

    // Calcular resultado
    const rolls = [];
    for (let i = 0; i < numDice; i++) {
      if (type === 10) {
        // d10 (0-9)
        rolls.push(`<${Math.floor(Math.random() * 10)}>`);
      } else {
        // dN (1-N)
        rolls.push(`<${Math.floor(Math.random() * type) + 1}>`);
      }
    }
    await event.send(rolls.join(' '));
    return;
  }

  if (event.command.name === 'coin') {
    const result = Math.random() < 0.5 ? 'cara' : 'cruz';
    const face = result === 'cara' ? '((ツ))' : '((✗))';
    //await event.send(`${face} ${result}`);
    await event.send(`${face}`);
    return;
  }

  // Countdown: !countdown [numero]
  if (event.command.name === 'countdown') {
    const numStr = event.command.args[0];
    if (!numStr || !/^\d+$/.test(numStr)) {
      await event.send('Uso: !countdown <segundos>');
      return;
    }
    const seconds = Math.min(Math.max(parseInt(numStr, 10), 1), 3600); // max 1 hora
    await event.send(`⏱️ Cuenta regresiva: ${seconds}s`);

    // Calcular intervalo según tiempo total
    let interval;
    if (seconds <= 10) {
      interval = 1000; // cada segundo
    } else if (seconds <= 60) {
      interval = 10000; // cada 10 segundos
    } else if (seconds <= 120) {
      interval = 30000; // cada 30 segundos
    } else if (seconds <= 600) {
      interval = 60000; // cada minuto
    } else if (seconds <= 1800) {
      interval = 300000; // cada 5 minutos
    } else {
      interval = 600000; // cada 10 minutos
    }

    let remaining = seconds;
    const countdownInterval = setInterval(async () => {
      remaining -= interval / 1000;
      if (remaining > 0) {
        await event.send(`⏱️ ${remaining}s`);
      } else {
        clearInterval(countdownInterval);
        await event.send('¡Tiempo!');
      }
    }, interval);

    // Guardar intervalo para poder pararlo
    global._countdownInterval = countdownInterval;
    return;
  }

  // Stop: !stop (para la cuenta regresiva)
  if (event.command.name === 'stop') {
    if (global._countdownInterval) {
      clearInterval(global._countdownInterval);
      global._countdownInterval = null;
      await event.send('⏹️ Cuenta regresiva detenida');
    } else {
      await event.send('No hay cuenta regresiva activa');
    }
    return;
  }

  //PREESCRITO
  if (event.command.name === 'elpinges') {
    await event.send('Un comando que le mando a mi bot privado para probar si esta funcionando o no, si funciona deberia responder pong... sin más');
    return;
  }

  // REACCIONES (no comando)
  // Ojo: `event.message` y `event.text` son strings. No existe `event.message.content`.
  if (event.text.toLowerCase().includes('nandobot')) {
    await event.send('@' + event.user.displayName + ' Me has llamado? ¡Diga melon!');
    return;
  }

}

// Import al final para que sea fácil “hojear” lógica arriba.
import { pront } from './ai/groq.js';

