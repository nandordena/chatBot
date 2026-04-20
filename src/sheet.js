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

// Función helper para verificar si el usuario es el Admin
const isAdmin = (event) => {
  const username = event.user.username?.toLowerCase();
  const channelName = event.channel?.replace('#', '').toLowerCase();
  return username === process.env.ADMIN_USERNAME?.toLowerCase() || username === channelName;
};
const autocallback = async (text) => {
  e = {};
  if ("^!.*".test(text)) {
    e.command = {};
    e.command.name = text.split(" ")[0].substring(1);
    e.command.args = text.split(" ").slice(1);
  } else {
    e.text = text;
  }
  read(e);
};

// Variable y función de cooldown solicitada
global.couldown = global.couldown || {};
global.setCouldown = global.setCouldown || {};
// Configuramos el cooldown (usamos el nombre del comando sin "!", igual que al llamarlo)
global.setCouldown['patata'] = 1000 * 60 * 15;
global.setCouldown['saludolacueva'] = 1000 * 60 * 60 * 2;
global.setCouldown['saludogierem_17'] = 1000 * 60 * 60 * 12;
global.setCouldown['drop'] = 1000 * 20;
global.setCouldown['saludostd'] = 1000 * 60 * 60 * 12;


const checkCooldown = (command, ms = 5000) => {
  // Si hay un cooldown configurado, lo usamos; si no, usamos el ms por defecto
  const cooldownTime = global.setCouldown[command] !== undefined ? global.setCouldown[command] : ms;

  const now = Date.now();
  const lastTime = global.couldown[command] || 0;

  if (now - lastTime >= cooldownTime) {
    global.couldown[command] = now;
    return true;
  }
  return false;
};

const commandHelp = {
  ping: 'Responde pong.',
  hola: 'Saluda al autor del mensaje.',
  d: 'Tira un dado. Ej: !d20 o !d6 3.',
  coin: 'Lanza una moneda: cara o cruz.',
  countdown: 'Inicia una cuenta regresiva y muestra tiempos mientras avanza.',
  timeout: 'Escribe un mensaje después de un tiempo. Ej: !timeout 30 ¡Hola!',
  interval: 'Envía un mensaje repetido cada cierto tiempo hasta !stop.',
  stop: 'Detiene countdown, interval y timeout activos.',
  ia: 'Pregunta a la IA. Ej: !ia ¿...? (alias: !gpt)',
  gpt: 'Pregunta a la IA. Ej: !gpt ¿...? (alias: !ia)',
  elping: 'Explica qué hace el comando ping de forma graciosa.',
  dedondeesnando: 'Cuenta de dónde es Nando.',
  proyecto: 'Cuenta en qué proyecto estoy trabajando actualmente.',
  //cartas: 'Comando de canal',
  //patata: 'Comando de canal',
  //dorp: 'Comando de canal',
  //kingsbane: 'Comandos especiales para el canal buildingloud.',
  haz: 'Pide a la IA respuestas en formato JSON para uso en otros sistemas.',
  jointo: 'Hace que el bot se una a otro canal (solo admin).',
  leave: 'Hace que el bot salga de un canal o del canal actual (solo admin).',
  to: 'Ejecuta un comando y envía solo el resultado en otro canal conectado.',
  ytprint: 'Conecta o desconecta el bot al chat de YouTube (solo admin).',
  comandosnando: 'Muestra la lista de comandos disponibles.',
  help: 'Explica el uso de un comando específico. Ej: !help ping',
  playlist: 'Muestra la lista de TEMASOS!',
  cobblemon: 'Pregunta a la IA sobre Minecraft Cobblemon.'
};

export async function read(event) {
  const channelName = event.channel?.replace('#', '').toLowerCase();

  if (
    checkCooldown('saludostd')
    && !['buildingloud'].includes(channelName)
  ) {
    await event.send(`🤖 Hola, soy un bot si, pero NO vendo follows 😉, solo paso a lurkear y divertirme. @${channelName} puede hacer !leave para hecharme, para todo lo demas !comandosnando`);
  }

  // PING
  if (event.command.name === 'ping' && checkCooldown('ping')) {
    await event.send('pong');
    return;
  }

  // IA (Hypereal): ejemplo de uso
  // Escribe: !ai tu pregunta
  // Nota: la función se llama "pront" porque así la pediste.
  // eslint-disable-next-line no-use-before-define
  if (
    (event.command?.name === 'ia'
      || event.command?.name === 'ia,'
      || event.command?.name === 'gpt'
      || event.command?.name === 'gpt,')
    && checkCooldown('ia')
  ) {
    const question = event.command.args.join(' ').trim();
    if (!question) {
      await event.send(`Uso: ${event.command?.name} <pregunta>`);
      return;
    }
    const out = await pront(question);
    await event.send(out === 'FALSE' ? 'no se  ┑(o. o)┍' : out);
    return;
  }

  // HAZ
  if (event.command.name === 'haz' && checkCooldown('haz')) {
    if (!isAdmin(event)) {
      await event.send('No eres nando.');
      return;
    }
    const question = event.command.args.join(' ').trim();
    if (!question) {
      await event.send('Uso: !haz <orden>');
      return;
    }
    const out = await pront(question, {
      context: `
        eres un asistente de escritura en un chat de twitch / youtube / u otras plataformas,
        ayudas a escribir mensajes cortos y divertidos para responder a los usuarios, el tono es informal y gracioso,
        y a veces un poco irreverente.
        como respuesta devolveras un array en json sin comillas antes o despues del array
        para no interferir con comando JSON.parse de NODE; ejemplo [<message1>,<message2>].
        con cada uno de los chats que quieres que se publique y el para un softwar 
        conectado a la api que recorrera ese array y mandara cada uno de estos mensajes. 
        en el chat esto se activa con el comando !haz por lo que se espera que tu rellenes 
        este array con resultados de la orden a hacer.
        Si te piden que escibas comandos , no añadas comentarios despues de la ejecucion del comando,
        si quieres hacer comentarios hazlo en un linea nueva.
      `
      , max_output_tokens: 2000
    });
    let responses;
    try {
      responses = JSON.parse(out);
    } catch (e) {
      await event.send(out === 'FALSE' ? 'no se hacer esto (╯‵□′)╯︵┻━┻' : out);
      return;
    }

    if (Array.isArray(responses)) {
      for (const msg of responses) {
        // Enviar sin await para que se agreguen de golpe a la cola (y !stop pueda descartarlas luego)
        event.send(msg).catch(e => console.error(e));
      }
    } else {
      await event.send(out);
    }
    return;
  }

  // !cobblemon - Preguntar a la IA sobre Cobblemon (mod de Minecraft)
  if (event.command.name === 'cobblemon' && checkCooldown('cobblemon')) {
    const question = event.command.args.join(' ').trim();
    if (!question) {
      await event.send('Uso: !cobblemon <pregunta>');
      return;
    }
    const out = await pront(question, {
      context: `
        Eres un experto en Cobblemon, un mod de Minecraft que añade Pokémon al juego.
        Responde a las preguntas sobre este mod: características, Pokémon disponibles,
        recetas de creación, ubicaciones, estrategias, etc.
        El tono debe ser informativo pero informal y divertido.
        responderas en un chat de twitch, por lo que tus respuestas deben ser claras y concisas,
        ideales para ese formato y no mas de 450 caracteres.
      `
    });
    await event.send(out === 'FALSE' ? 'no se  ┑(o. o)┍' : out);
    return;
  }

  // HOLA
  if (event.command.name === 'hola' && checkCooldown('hola')) {
    const name = event.user.displayName ?? event.user.username ?? 'chat';
    await event.send(`Hola, @${name}`);
    return;
  }

  // Soporta dados d3, d4, ..., d10, ..., d20
  // d10 es el único que va de 0-9, los demás de 1-n
  var diceMatch = false;
  if (event?.command?.name) {
    diceMatch = event.command.name.match(/^d(3|4|6|8|10|12|20)$/);
  }
  if (diceMatch && checkCooldown('dice')) {
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

  // COIN
  if (event.command.name === 'coin' && checkCooldown('coin')) {
    const result = Math.random() < 0.5 ? 'cara' : 'cruz';
    const face = result === 'cara' ? '((ツ))' : '((✗))';
    //await event.send(`${face} ${result}`);
    await event.send(`${face}`);
    return;
  }

  //ruleta !ruleta <item1>,<item2>,...
  if (event.command.name === 'ruleta' && checkCooldown('ruleta')) {
    const items = event.command.args.join(' ').split(',');
    if (items.length < 2) {
      await event.send('Uso: !ruleta <item1>,<item2>,(...)');
      return;
    }
    const item = items[Math.floor(Math.random() * items.length)];
    await event.send(item);
    return;
  }

  //calc !calc <operacion>
  if (event.command.name === 'calc' && checkCooldown('calc')) {
    // Unimos los argumentos para soportar cálculos con o sin espacios
    const expression = event.command.args.join('');

    if (!expression) {
      await event.send('Uso: !calc <operacion> (Ej: 2+3*20+(10*3))');
      return;
    }

    // Validamos que solo contenga números y operadores matemáticos por seguridad
    if (!/^[\d+\-*/().%\s]+$/.test(expression)) {
      await event.send('Operación inválida. Solo números y operadores + - * / % ( )');
      return;
    }

    try {
      // Usamos Function para evaluar la expresión de forma más segura tras pasar el regex
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${expression}`)();

      // Asegurarse de no mandar mensajes vacíos si result es undefined
      if (result === undefined || Number.isNaN(result)) {
        await event.send('Operación no válida.');
      } else {
        await event.send(`Resultado: ${result}`);
      }
    } catch (e) {
      await event.send('Error en la operación. Revisa que esté bien escrita.');
    }
    return;
  }

  // Countdown: !countdown [numero] o !countdown [numero]m (minutos)
  if (event.command.name === 'countdown' && checkCooldown('countdown')) {
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
  if (event.command.name === 'interval' && checkCooldown('interval')) {
    if (!isAdmin(event)) {
      await event.send('No eres nando.');
      return;
    }
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

  // Stop: !stop (para la cuenta regresiva, intervalo y timeout)
  if (event.command.name === 'stop' && checkCooldown('stop')) {
    if (!isAdmin(event)) {
      await event.send('No eres nando.');
      return;
    }
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

    if (global._timeoutId) {
      clearTimeout(global._timeoutId);
      global._timeoutId = null;
      stopped = true;
    }

    if (global._ytLiveChat) {
      global._ytLiveChat.stop();
      global._ytLiveChat = null;
      stopped = true;
    }

    if (typeof global.clearSendQueue === 'function') {
      global.clearSendQueue();
      stopped = true;
    }

    if (stopped) {
      await event.send('⏹️ Proceso(s) detenido(s)');
    } else {
      await event.send('No hay proceso activo');
    }
    return;
  }

  // Timeout: !timeout <segundos> <mensaje> o !timeout <minutos>m <mensaje>
  if (event.command.name === 'timeout' && checkCooldown('timeout')) {
    const firstArg = event.command.args[0];
    const restArgs = event.command.args.slice(1);

    if (!firstArg || restArgs.length === 0) {
      await event.send('Uso: !timeout <segundos> <mensaje> o !timeout <minutos>m <mensaje>');
      return;
    }

    let timeoutMs;
    if (firstArg.toLowerCase().endsWith('m')) {
      // Formato minutos: !timeout 5m mensaje
      const minStr = firstArg.slice(0, -1);
      if (!/^\d+$/.test(minStr)) {
        await event.send('Uso: !timeout <segundos> <mensaje> o !timeout <minutos>m <mensaje>');
        return;
      }
      const minutes = Math.min(Math.max(parseInt(minStr, 10), 1), 60); // max 60 minutos
      timeoutMs = minutes * 60 * 1000;
    } else {
      // Formato segundos: !timeout 30 mensaje
      if (!/^\d+$/.test(firstArg)) {
        await event.send('Uso: !timeout <segundos> <mensaje> o !timeout <minutos>m <mensaje>');
        return;
      }
      const seconds = Math.min(Math.max(parseInt(firstArg, 10), 1), 3600); // max 1 hora
      timeoutMs = seconds * 1000;
    }

    const message = restArgs.join(' ');

    // Confirmar que se programó el timeout
    await event.send(`⏰ Mensaje programado para dentro de ${firstArg}`);

    // Programar el envío del mensaje después del tiempo especificado
    global._timeoutId = setTimeout(async () => {
      await event.send(message);
      global._timeoutId = null; // Limpiar cuando se ejecute
    }, timeoutMs);

    return;
  }

  // HELP
  if (event.command.name === 'help' && checkCooldown('help')) {
    var commandName = event.command.args[0]?.toLowerCase();
    commandName = commandName.replace("!", "");
    if (!commandName) {
      await event.send('Uso: !help <comando>');
      return;
    }

    let description = commandHelp[commandName];
    if (!description && /^d(3|4|6|8|10|12|20)$/.test(commandName)) {
      description = commandHelp.d;
    }
    if (!description && (commandName === 'ia' || commandName === 'gpt')) {
      description = commandHelp.ia;
    }

    await event.send(description || 'No tengo una descripción para ese comando.');
    return;
  }

  // Comandos: !nandocomandos (lista de comandos disponibles)
  if (event.command.name === 'comandosnando' && checkCooldown('comandosnando')) {
    const commandsList = Object.keys(commandHelp).map(cmd => `!${cmd}`).join(', ');
    await event.send(`Comandos disponibles: ${commandsList}`);
    return;
  }

  // REACCIONES (no comando)///////
  // Ojo: `event.message` y `event.text` son strings. No existe `event.message.content`.
  if (event.text.toLowerCase().includes('nandobot')) {
    await event.send('@' + event.user.displayName + ' Me has llamado? ¡Diga melon!');
    return;
  }
  if (event.text.toLowerCase().includes('[inserte aqui')) {
    const question = event.text;
    const out = await pront(question, {
      context: `
        Eres un asistente que detecta cuando alguien dice '[inserte aqui' en el chat,
        y respondes con el mensaje insertando etre los [] lo que pidan , de manera original y graciosa.
        El tono debe ser informativo pero informal y divertido.
        responderas en un chat de twitch, por lo que tus respuestas deben ser claras y concisas,
        ideales para ese formato y no mas de 450 caracteres.
      `
      , max_output_tokens: 2000
    });
    if (out === 'FALSE') return;
    await event.send(out);
  }
  ///////////////////////////////

  // !ytprint <liveid> - Conectarse a chat de youtube
  if (event.command.name === 'ytprint' && checkCooldown('ytprint')) {
    if (!isAdmin(event)) {
      await event.send('No eres nando.');
      return;
    }

    const arg = event.command.args[0];
    if (!arg) {
      await event.send('Uso: !ytprint <liveid> para conectar, o !ytprint stop para desconectar.');
      return;
    }

    if (arg === 'stop') {
      if (global._ytLiveChat) {
        global._ytLiveChat.stop();
        global._ytLiveChat = null;
        await event.send('Desconectado del chat de Youtube.');
      } else {
        await event.send('No hay chat de Youtube conectado actualmente.');
      }
      return;
    }

    // Desconectar el anterior si existe
    if (global._ytLiveChat) {
      global._ytLiveChat.stop();
      global._ytLiveChat = null;
    }

    try {
      // Import dinámico para que no bloquee arriba y se cargue solo si hace falta
      const { LiveChat } = await import('youtube-chat');
      const liveChat = new LiveChat({ liveId: arg });
      global._ytLiveChat = liveChat;
      const startTime = new Date(); // Guardar hora exacta para ignorar chats antiguos

      liveChat.on('start', (liveId) => {
        event.send(`[YT] Conectado al live: ${liveId}`);
      });

      liveChat.on('chat', (chatItem) => {
        // Ignorar mensajes enviados antes de la hora actual
        if (chatItem.timestamp && chatItem.timestamp < startTime) {
          return;
        }

        // chatItem.message es un array que puede tener string (text) o emojis.
        const text = chatItem.message.map(p => p.text || '').join('');
        const author = chatItem.author.name;
        event.send(`[YT] ${author}: ${text}`);
      });

      liveChat.on('error', (err) => {
        console.error('[YT Chat Error]', err);
      });

      const ok = await liveChat.start();
      if (!ok) {
        await event.send('[YT] Fallo al iniciar la conexión (¿liveId incorrecto?).');
        global._ytLiveChat = null;
      }
    } catch (e) {
      console.error(e);
      await event.send(`[YT] Error: ${e.message}`);
    }
    return;
  }

  // !jointo <nombrecanal> - Hacer que el bot cambie a otro canal (solo admin)
  if (event.command.name === 'jointo' && checkCooldown('jointo')) {
    if (!isAdmin(event)) {
      await event.send('No eres nando.');
      return;
    }
    const newChannel = event.command.args[0];
    if (!newChannel) {
      await event.send('Uso: !jointo <nombrecanal>');
      return;
    }
    const channelName = newChannel.startsWith('#') ? newChannel : `#${newChannel}`;
    try {
      await event.client.join(channelName);
    } catch (err) {
      console.info(`No pude unirme al canal: ${err.message}`);
    }
    return;
  }

  // !leave [canal] - Hacer que el bot abandone el canal actual o uno específico (solo admin)
  if (event.command.name === 'leave' && checkCooldown('leave')) {
    if (!isAdmin(event)) {
      await event.send('No eres nando.');
      return;
    }
    const targetChannel = event.command.args[0];
    let channelToLeave;

    if (!targetChannel) {
      // Si no se especifica canal, usar el actual
      channelToLeave = event.channel;
    } else {
      // Añadir # si no lo tiene
      channelToLeave = targetChannel.startsWith('#') ? targetChannel : `#${targetChannel}`;
    }

    try {
      await event.client.part(channelToLeave);
      await event.send(`nandobot ha salido de ${channelToLeave}...`);
    } catch (err) {
      console.info(`No pude salir del canal: ${err.message}`);
      await event.send(`No pude salir de ${channelToLeave}: ${err.message}`);
    }
    return;
  }

  // !to <canal> <comando> - Ejecutar un comando en otro canal conectado
  if (event.command.name === 'to' && checkCooldown('to')) {
    if (!isAdmin(event)) {
      await event.send('No eres nando.');
      return;
    }
    const targetChannel = event.command.args[0];
    const commandText = event.command.args.slice(1).join(' ').trim();

    if (!targetChannel || !commandText) {
      await event.send('Uso: !to <canal> <comando>');
      return;
    }

    channelName = targetChannel.startsWith('#') ? targetChannel : `#${targetChannel}`;

    try {
      // Parsear el comando para ejecutarlo internamente
      const isCommand = commandText.startsWith('!');
      const [rawName, ...args] = isCommand ? commandText.slice(1).split(/\s+/) : [];
      const name = isCommand && rawName ? rawName.toLowerCase() : null;

      // Función send personalizada para el canal destino
      const targetSend = async (outText, opts = {}) => {
        if (!outText || typeof outText !== 'string') return;

        const trimmed = outText.trim() + " [🤖]";
        if (!trimmed) return;

        // Usar enqueueSay para respetar rate limiting
        return enqueueSay(async () => {
          if (opts.reply && event.tags?.id) {
            try {
              await event.client.say(channelName, trimmed, { replyParentMsgId: event.tags.id });
              console.log(`[send] reply -> ${channelName}: ${trimmed}`);
              return;
            } catch {
              // ignore y fallback
            }
          }

          await event.client.say(channelName, trimmed);
          console.log(`[send] -> ${channelName}: ${trimmed}`);
        });
      };

      // Crear evento simulado para el canal destino
      const targetEvent = {
        ...event,
        channel: channelName,
        text: commandText,
        message: commandText,
        command: {
          isCommand,
          prefix: '!',
          name,
          args
        },
        send: targetSend
      };

      // Ejecutar el comando en el canal destino
      await read(targetEvent);
      await event.send(`✅ Comando ejecutado en ${channelName}`);
    } catch (err) {
      await event.send(`❌ Error al ejecutar comando en ${channelName}: ${err.message}`);
    }
    return;
  }

  //autocomander
  //////// kikeedev ///////////
  if (channelName === 'kikeedev') {
    // no esta funcionando no se porque
  }
  if (event.command.name === 'drop' && checkCooldown('drop')) {
    await event.send('!drop');
  }
  ///////////////////////////////

  // la cueva del artista //
  if (channelName == "lacuevadelartista") {

    if (event.command.name === 'cartas' && checkCooldown('cartas')) {
      await event.send('No es verdad , las cartas no existen... o sí? (¬ - ¬)');
      return;
    }

    if (event.command.name === 'patata' && checkCooldown('patata')) {
      await event.send('!patata dorada');
      await event.send('🥔  ');
      return;
    }

    if (checkCooldown('saludolacueva')) {
      const saludo = await pront("Eres un asistente para un bot de Twitch llamado NandoBot, saluda en el chat");
      await event.send(saludo);
      autocallback("!interval 20m !ia cuenta un chiste sobre artistas, hasta que halcon_13 deje el MOD (ModAbuse ⚔️ 🚫)");
    }
  }

  // gierem_17 //
  if (channelName == "gierem_17") {
    if (checkCooldown('saludogierem_17')) {
      await event.send('pa cuendo serie de cobblemon?');
    }
  }

  //////// kingsbane@buildingloud ///////////
  if (
    channelName == "buildingloud"
    || channelName == "nandordena"
  ) {
    // Guardar en variable global
    global.kingsbane = global.kingsbane || {};
    global.kingsbane = {
      "items": {},
      "used": {},
      "capacity": 0,
      "forja": [
        {
          "nombre": "Morral",
          "materiales": { "Cuero": 50, "Perla": 10, "Zurrón": 1, "Cuerda": 10 },
          "oro": 2500
        },
        {
          "nombre": "hacha_cobre",
          "materiales": { "cuerda": 10, "madera roble": 20, "lingote cobre": 5, "Hacha chatarra": 1 },
          "oro": 2500
        },
        {
          "nombre": "pico_cobre",
          "materiales": { "cuerda": 10, "madera roble": 20, "lingote cobre": 5, "pico chatarra": 1 },
          "oro": 2500
        },
        {
          "nombre": "caña_cobre",
          "materiales": { "cuerda": 10, "madera roble": 20, "lingote cobre": 5, "caña chatarra": 1 },
          "oro": 2500
        },
        {
          "nombre": "espada_hueso",
          "materiales": { "fibra": 10, "hueso": 25, "espada piedra": 1 },
          "oro": 2500
        },
        {
          "nombre": "espada_chatarra",
          "materiales": { "enredadera": 25, "hueso": 25, "espada piedra": 1 },
          "oro": 2500
        },
        {
          "nombre": "espada_cobre",
          "materiales": { "cuerda": 10, "madera roble": 20, "lingote cobre": 5, "espada chatarra": 1 },
          "oro": 2500
        },
        {
          "nombre": "Cuero",
          "cantidad": "todo",
          "materiales": { "piel": 5, },
          "oro": 0
        },
        {
          "nombre": "Cuerda",
          "cantidad": 10,
          "materiales": { "Fibra": 3, },
          "oro": 0
        },
        {
          "nombre": "lingote_cobre",
          "cantidad": "todo",
          "materiales": { "Cobre": 5, },
          "oro": 0
        },
        {
          "nombre": "aceite",
          "cantidad": "todo",
          "materiales": { "Grasa": 2, "Pescado": 5 },
          "oro": 0
        },
      ],
      "site": "ciudadela",
      "usables": ["almeja", "roca_misteriosa "],
    };

    if (event.command.name === 'kingsbane' && checkCooldown('kingsbane')) {
      if (!isAdmin(event)) {
        await event.send('No eres nando.');
        return;
      }
      await event.send('!interval 5m !anclar');
      await event.send('!mochila');
      await event.send('!almacen');
      await event.send('!donde');
    }
    if (event.text.includes('📦 @nandordena →')) {
      // Parsear inventario del mensaje de mochila
      const inventoryMatch = event.text.match(/.*@\w+ → \[(.*?)\] \|.*\s(\d+)\/(\d+)/);
      if (inventoryMatch) {
        const itemsStr = inventoryMatch[1];
        const used = parseInt(inventoryMatch[2], 10);
        const capacity = parseInt(inventoryMatch[3], 10);

        // Parsear items (formato: "Enredadera x2 · Madera x5")
        const items = {};
        const itemMatches = itemsStr.matchAll(/(\w+?\s?\w+)\s+x(\d+)/g);
        for (const match of itemMatches) {
          items[match[1]] = parseInt(match[2], 10);
        }
        global.kingsbane.items = items;
        global.kingsbane.used = used;
        global.kingsbane.capacity = capacity;
        console.log('Inventario actualizado:', global.kingsbane);
      }
      // Definimos grupos de materiales por bioma según las fuentes
      const stock = global.kingsbane.items;

      const materiales = {
        bosque: (stock["Madera"] || 0) + (stock["Madera roble"] || 0) + (stock["Enredadera"] || 0) + (stock["Resina"] || 0),
        mina: (stock["Piedra"] || 0) + (stock["Cobre"] || 0) + (stock["Hierro"] || 0) + (stock["Carbon"] || 0) + (stock["Plata"] || 0),
        caza: (stock["Hueso"] || 0) + (stock["Cuero"] || 0) + (stock["Grasa"] || 0) + (stock["Colmillo"] || 0),
        pesca: (stock["Pescado"] || 0) + (stock["Chatarra"] || 0) + (stock["Perla"] || 0) + (stock["Escama sirena"] || 0) + (stock["Marisco"] || 0)
      };

      // Regla de decisión
      if (global.kingsbane.used / global.kingsbane.capacity >= 0.8) {
        // Prioridad: Vaciar mochila para evitar la Ira de G.E.N.I.O. [4]
        if (global.kingsbane.site != "Ciudadela" & global.kingsbane.votar) await event.send('!votar ciudadela');
      } else {
        // Selecciona la zona con el valor numérico más bajo en el objeto 'materiales'
        const zonaDestino = Object.keys(materiales).reduce((a, b) => materiales[a] < materiales[b] ? a : b);

        if (global.kingsbane.site.toLowerCase != zonaDestino
          & global.kingsbane.votar) await event.send(`!votar ${zonaDestino}`);
      }

      switch (global.kingsbane.site.toLowerCase()) {
        case "ciudadela": {
          // decisiones en la ciudadela
          // Revisar forja y fabricar primer item posible
          const stock = global.kingsbane?.items || {};
          let itemForjado = false;

          // FORJA
          for (const item of global.kingsbane.forja) {
            let puedeFabricar = true;
            for (const [material, cantidad] of Object.entries(item.materiales)) {
              const materialLower = material.toLowerCase();
              const stockKey = Object.keys(stock).find(k => k.toLowerCase() === materialLower);
              if (!stockKey || (stock[stockKey] || 0) < cantidad) {
                puedeFabricar = false;
                break;
              }
            }
            if (puedeFabricar) {
              // Calcular cantidad máxima posible según recursos
              let maxPosible = Infinity;
              for (const [material, cantidad] of Object.entries(item.materiales)) {
                const materialLower = material.toLowerCase();
                const stockKey = Object.keys(stock).find(k => k.toLowerCase() === materialLower);
                const disponibles = stock[stockKey] || 0;
                const posible = Math.floor(disponibles / cantidad);
                maxPosible = Math.min(maxPosible, posible);
              }

              // Determinar cantidad a fabricar
              let cantidadFabricar = 1;
              if (item.cantidad) {
                if (item.cantidad.toLowerCase() === 'todo') {
                  // Fabricar el máximo posible
                  cantidadFabricar = maxPosible;
                } else {
                  // Usar la cantidad especificada, sin superar el máximo posible
                  cantidadFabricar = Math.min(item.cantidad, maxPosible);
                }
              }

              await event.send(`!forjar ${item.nombre} ${cantidadFabricar}`);

              // Eliminar el item forjado de la lista de forja solo si se fabricó todo lo posible o cantidad especificada
              if (cantidadFabricar === maxPosible || (item.cantidad && item.cantidad.toLowerCase() !== 'todo' && cantidadFabricar >= item.cantidad)) {
                const index = global.kingsbane.forja.indexOf(item);
                if (index > -1) {
                  global.kingsbane.forja.splice(index, 1);
                }
              }
              itemForjado = true;
              break;
            }
          }

          if (!itemForjado) {
            // await event.send(`Ahora mismo no puedo forjar nada, toy pobre`);
            // Si no puede forjar, pedir un chiste de pobres a la IA
            // const chiste = await pront("Dime un chiste corto y gracioso sobre ser pobre, en español, estilo informal de chat de Twitch");
            // await event.send(chiste);
          }

          // VENTA: vender todo lo que supere 50 unidades
          const LIMITE_ALMACEN = 50;

          for (const [item, cantidad] of Object.entries(stock)) {
            if (
              cantidad > LIMITE_ALMACEN
              && !["Enredadera", "Piel"].includes(item) //no vender
            ) {
              const cantidadVender = cantidad - LIMITE_ALMACEN;
              await event.send(`!vender ${item.replace(" ", "_")} ${cantidadVender}`);
            }
          }
          break;
        }
        default: {
          // decisiones fuera de la ciudadela
          global.kingsbane.usables.forEach(async (usable) => {
            if (global.kingsbane.items[usable.replace("_", " ")] > 0) {
              await event.send(`!usar ${usable} `);
            }
          });
        }
          break;
      }

    }
    if (
      event.command.name === 'ciudadela'
      && isAdmin(event)
    ) {
      global.kingsbane.site === "ciudadela";
      await event.send('!almacen');
    }
    if (
      (
        event.text.includes("La colmena se mueve a")
        && event.text.includes("[G.E.N.I.O.]")
      )
    ) {
      if (event.text.toLowerCase().includes("ciudadela")) global.kingsbane.site = "ciudadela";
      else if (event.text.toLowerCase().includes("bosque")) global.kingsbane.site = "bosque";
      else if (event.text.toLowerCase().includes("mina")) global.kingsbane.site = "mina";
      else if (event.text.toLowerCase().includes("caza")) global.kingsbane.site = "caza";
      else if (event.text.toLowerCase().includes("pesca")) global.kingsbane.site = "pesca";

      if (global.kingsbane.site === "ciudadela") {
        await event.send('!almacen');
      }
    }
    //if (event.text.includes("¡Votación ABIERTA!") && checkCooldown('¡Votación ABIERTA!')) {
    //  global.kingsbane.site = event.text.match(/(\w+).\s¿Cambio/g);
    // // if (global.kingsbane.site == "Ciudadela") await event.send('!almacen');
    // // else await event.send('!mochila');
    //}
  }
  var kingsbaneMatch = false;
  if (event?.command?.name) {
    kingsbaneMatch = event.command.name.match(/^kingsbane\.(\w+)$/);
  }
  if (kingsbaneMatch && checkCooldown('kingsbaneMatch')) {
    attrMatch = event.command.name.match(/^kingsbane\.\w+\s(\w+)$/);
    if (attrMatch) {
      if (attrMatch == "false") attrMatch = false;
      if (attrMatch == "true") attrMatch = true;
      global.kingsbane[kingsbaneMatch] = attrMatch;
    }
  }
  ///////////////////////////////

  /////////////// preescritos ////////////////
  //playlist
  if (event.command.name === 'playlist' && checkCooldown('playlist')) {
    await event.send('Aqui solo estan los temas que se lo merecen');
    await event.send('https://open.spotify.com/playlist/5eGpHUmr0MHOTmxR9QTo7G');
  }
  //proyecto
  if (event.command.name === 'proyecto' && checkCooldown('proyecto')) {
    await event.send(`Estoy desarrolando un controllroom de pantallas
        y proyectores, un anillo para controlarlas a todas`);
  }
  //dedondeesnando
  if (event.command.name === 'dedondeesnando' && checkCooldown('dedondeesnando')) {
    await event.send('Nando nació en Argentina, pero estudio y vive en españa hace años');
  }
  ////////////////////////////////////////////
}

// Import al final para que sea fácil “hojear” lógica arriba.
import { pront } from './ai/groq.js';

