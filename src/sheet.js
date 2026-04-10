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
    || event.command?.name === 'ia,'
    || event.command?.name === 'gpt'
    || event.command?.name === 'gpt,'
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

  // Countdown: !countdown [numero] o !countdown [numero]m (minutos)
  if (event.command.name === 'countdown') {
    const numStr = event.command.args[0];
    if (!numStr) {
      await event.send('Uso: !countdown <segundos> o !countdown <minutos>m');
      return;
    }

    let seconds;
    if (numStr.toLowerCase().endsWith('m')) {
      // Formato minutos: !countdown 5m
      const minStr = numStr.slice(0, -1);
      if (!/^\d+$/.test(minStr)) {
        await event.send('Uso: !countdown <segundos> o !countdown <minutos>m');
        return;
      }
      seconds = Math.min(Math.max(parseInt(minStr, 10), 1), 60) * 60; // max 60 minutos
    } else {
      // Formato segundos: !countdown 60
      if (!/^\d+$/.test(numStr)) {
        await event.send('Uso: !countdown <segundos> o !countdown <minutos>m');
        return;
      }
      seconds = Math.min(Math.max(parseInt(numStr, 10), 1), 3600); // max 1 hora
    }

    await event.send(`⏱️ Cuenta regresiva: ${seconds}s`);

    // Función para formatear segundos a HH:MM:SS
    const formatTime = (totalSeconds) => {
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = Math.floor(totalSeconds % 60);
      if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }
      return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Función para calcular intervalo según tiempo restante
    const getInterval = (remaining) => {
      if (remaining <= 5) return 1000;      // cada segundo
      if (remaining <= 10) return 5000;      // cada segundo
      if (remaining <= 30) return 10000;     // cada 10 segundos
      if (remaining <= 60) return 30000;     // cada 30 segundos
      if (remaining <= 600) return 60000;    // cada minuto
      if (remaining <= 1800) return 300000;  // cada 5 minutos
      return 600000;                         // cada 10 minutos
    };

    let remaining = seconds;
    const runCountdown = async () => {
      const interval = getInterval(remaining);
      remaining -= interval / 1000;
      if (remaining > 0) {
        await event.send(`⏱️ ${formatTime(remaining)}`);
        global._countdownTimeout = setTimeout(runCountdown, getInterval(remaining));
      } else {
        await event.send('¡Tiempo!');
      }
    };
    const countdownTimeout = setTimeout(runCountdown, getInterval(seconds));

    // Guardar intervalo para poder pararlo
    global._countdownInterval = countdownInterval;
    return;
  }

  // Interval: !interval [segundos] o [minutos]m [texto] - envía texto cada X tiempo
  if (event.command.name === 'interval') {
    const firstArg = event.command.args[0];
    const restArgs = event.command.args.slice(1);

    if (!firstArg || restArgs.length === 0) {
      await event.send('Uso: !timeout <segundos> <texto> o !timeout <minutos>m <texto>');
      return;
    }

    let intervalMs;
    if (firstArg.toLowerCase().endsWith('m')) {
      // Formato minutos: !timeout 5m texto
      const minStr = firstArg.slice(0, -1);
      if (!/^\d+$/.test(minStr)) {
        await event.send('Uso: !interval <segundos> <texto> o !timeout <minutos>m <texto>');
        return;
      }
      const minutes = Math.min(Math.max(parseInt(minStr, 10), 1), 60);
      intervalMs = minutes * 60 * 1000;
    } else {
      // Formato segundos: !interval 30 texto
      if (!/^\d+$/.test(firstArg)) {
        await event.send('Uso: !interval <segundos> <texto> o !interval <minutos>m <texto>');
        return;
      }
      const seconds = Math.min(Math.max(parseInt(firstArg, 10), 1), 3600);
      intervalMs = seconds * 1000;
    }

    const text = restArgs.join(' ');

    // Enviar primer mensaje
    await event.send(text);

    // Guardar el intervalo para poder pararlo
    global._timeoutInterval = setInterval(async () => {
      await event.send(text);
    }, intervalMs);

    await event.send(`⏱️ Intervalo iniciado: cada ${firstArg} - !stop para detener`);
    return;
  }

  // Stop: !stop (para la cuenta regresiva y el intervalo)
  if (event.command.name === 'stop') {
    let stopped = false;

    if (global._countdownInterval) {
      clearInterval(global._countdownInterval);
      global._countdownInterval = null;
      stopped = true;
    }

    if (global._timeoutInterval) {
      clearInterval(global._timeoutInterval);
      global._timeoutInterval = null;
      stopped = true;
    }

    if (stopped) {
      await event.send('⏹️ Proceso(s) detenido(s)');
    } else {
      await event.send('No hay proceso activo');
    }
    return;
  }

  //PREESCRITO
  if (event.command.name === 'elping') {
    await event.send('El ping es comando basico que me mandan para saber si respondo, y yo respondo "pong" cuando me etero o cuando me mandan el comando bien escrito \\(¬ - ¬)/');
    return;
  }
  if (event.command.name === 'donde') {
    await event.send('Nando nació en Argentina, pero estudio y vive en españa hace años');
    return;
  }

  // Comandos: !comandos (lista de comandos disponibles)
  if (event.command.name === 'comandos') {
    await event.send('📋 Comandos disponibles: !ping, !hola, !d[3-20], !coin, !countdown, !intervalo, !stop, !ia, !gpt, !elping, !donde');
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

