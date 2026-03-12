import { GraphQLClient, gql } from 'graphql-request';
import { GRAPHQL_URL } from '../config.js';
import { setAuthToken } from './graphql.js';
import { getConfig } from '../utils/store.js';

const GITHUB_CLIENT_ID = 'c37fad75ee13b3261065';
const GITHUB_SCOPES = 'read:user read:email';

interface LoginWithProviderResponse {
  loginWithProvider: string;
}

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

const LOGIN_WITH_PROVIDER_MUTATION = gql`
  mutation LoginWithProvider($provider: String!, $code: String!) {
    loginWithProvider(provider: $provider, code: $code)
  }
`;

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

export function getGitHubAuthUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    scope: GITHUB_SCOPES,
    redirect_uri: redirectUri,
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function loginWithProvider(provider: string, code: string) {
  const tempClient = new GraphQLClient(GRAPHQL_URL);
  const data = await tempClient.request<LoginWithProviderResponse>(LOGIN_WITH_PROVIDER_MUTATION, {
    provider,
    code,
  });
  const jwt = data.loginWithProvider;
  setAuthToken(jwt);
  return jwt;
}

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
      const code = url.searchParams.get('code');

      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<html><body><h2>Error: no se recibio el codigo de autorizacion</h2></body></html>');
        return;
      }

      try {
        const jwt = await loginWithProvider('github', code);
        setAuthToken(jwt);
        const user = await getMe();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<html><body style="font-family:sans-serif;text-align:center;margin-top:60px">
          <h2 style="color:#22c55e">Autenticacion exitosa!</h2>
          <p>Bienvenido, <strong>@${user.username}</strong></p>
          <p>Puedes cerrar esta ventana y volver a la terminal.</p>
        </body></html>`);

        server.close();
        resolve({ jwt, user });
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<html><body><h2>Error de autenticacion</h2><p>Intenta de nuevo.</p></body></html>');
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
      const redirectUri = `http://127.0.0.1:${port}`;
      const authUrl = getGitHubAuthUrl(redirectUri);
      open(authUrl).catch(() => {});
    });

    setTimeout(() => {
      server.close();
      reject(new Error('Timeout: la autenticacion tomo demasiado tiempo (2 minutos)'));
    }, 120000);
  });
}
