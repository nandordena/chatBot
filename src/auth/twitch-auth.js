import 'dotenv/config';
import http from 'node:http';
import { URL } from 'node:url';

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const REDIRECT_URI = process.env.TWITCH_REDIRECT_URI ?? 'http://localhost:5179/callback';

const missing = ['TWITCH_CLIENT_ID', 'TWITCH_CLIENT_SECRET'].filter((k) => !process.env[k]);
if (missing.length) {
  console.error(
    `Faltan variables de entorno: ${missing.join(
      ', '
    )}\nAñádelas a tu .env para poder generar el token.`
  );
  process.exit(1);
}

const scopes = [
  'chat:read',
  'chat:edit'
  // añade más scopes aquí si los necesitas (moderación, puntos de canal, etc.)
];

function openUrl(url) {
  console.log('\nAbre este link y autoriza la app:\n');
  console.log(url);
  console.log('\nLuego vuelve aquí; capturaré el code en el redirect.\n');
}

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url ?? '/', REDIRECT_URI);
    if (reqUrl.pathname !== new URL(REDIRECT_URI).pathname) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const code = reqUrl.searchParams.get('code');
    const error = reqUrl.searchParams.get('error');

    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`OAuth error: ${error}`);
      console.error('OAuth error:', error, reqUrl.searchParams.get('error_description'));
      return;
    }

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Falta el parámetro "code".');
      return;
    }

    const tokenRes = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI
      })
    });

    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(tokenJson, null, 2));
      console.error('Error token endpoint:', tokenJson);
      return;
    }

    const accessToken = tokenJson.access_token;
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(
      `OK. Copia esto a tu .env:\n\nTWITCH_OAUTH_TOKEN=oauth:${accessToken}\n\nYa puedes cerrar esta pestaña.`
    );

    console.log('\nToken obtenido. Pega esto en tu .env:\n');
    console.log(`TWITCH_OAUTH_TOKEN=oauth:${accessToken}\n`);
    console.log('Luego ejecuta: npm run dev\n');
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Error interno generando token.');
    console.error(e);
  } finally {
    setTimeout(() => server.close(), 250);
  }
});

const redirect = new URL(REDIRECT_URI);
const port = Number(redirect.port || 80);
const host = redirect.hostname || 'localhost';

server.listen(port, host, () => {
  const authorizeUrl = new URL('https://id.twitch.tv/oauth2/authorize');
  authorizeUrl.searchParams.set('client_id', CLIENT_ID);
  authorizeUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('scope', scopes.join(' '));

  console.log(`Escuchando redirect en ${REDIRECT_URI}`);
  openUrl(authorizeUrl.toString());
});

