import { gql } from 'graphql-request';
import { SITE_URL } from '../config.js';
import { setAuthToken } from './graphql.js';
import { getConfig } from '../utils/store.js';

const DASHBOARD_LOGIN_URL = `${SITE_URL}/dashboard/login`;

interface MeResponse {
  me: {
    id: string;
    username: string;
    email: string;
    role: {
      name: string;
    };
  };
}

const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      role {
        name
      }
    }
  }
`;

export async function getMe() {
  const { getClient } = await import('./graphql.js');
  const data = await getClient().request<MeResponse>(ME_QUERY);
  return data.me;
}

export function restoreSession() {
  const config = getConfig();
  const token = config.get('auth.jwt') as string | undefined;
  if (token) {
    setAuthToken(token);
    return true;
  }
  return false;
}

export async function githubLoginFlow(): Promise<{ jwt: string; user: { id: string; username: string; email: string } }> {
  const http = await import('http');
  const open = (await import('open')).default;

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url || '/', `http://localhost`);
      const token = url.searchParams.get('token');

      if (!token) {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<html><body style="font-family:sans-serif;text-align:center;margin-top:60px"><h2>Error: no se recibio el token</h2><p>Intenta de nuevo.</p></body></html>');
        return;
      }

      try {
        setAuthToken(token);
        const user = await getMe();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<html><body style="font-family:sans-serif;text-align:center;margin-top:60px">
          <h2 style="color:#22c55e">Autenticacion exitosa!</h2>
          <p>Bienvenido, <strong>@${user.username}</strong></p>
          <p>Puedes cerrar esta ventana y volver a la terminal.</p>
        </body></html>`);

        server.close();
        resolve({ jwt: token, user });
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<html><body style="font-family:sans-serif;text-align:center;margin-top:60px"><h2>Error de autenticacion</h2><p>Intenta de nuevo.</p></body></html>');
        server.close();
        reject(err);
      }
    });

    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') {
        reject(new Error('No se pudo iniciar el servidor local'));
        return;
      }
      const port = addr.port;
      const callbackUrl = `http://127.0.0.1:${port}`;
      const loginUrl = `${DASHBOARD_LOGIN_URL}?redir=${encodeURIComponent(callbackUrl)}&tokenOn=true`;
      open(loginUrl).catch(() => {});
    });

    setTimeout(() => {
      server.close();
      reject(new Error('Timeout: la autenticacion tomo demasiado tiempo (2 minutos)'));
    }, 120000);
  });
}
