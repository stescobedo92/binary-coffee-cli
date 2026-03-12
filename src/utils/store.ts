import Conf from 'conf';

let store: Conf | null = null;

export function getConfig(): Conf {
  if (!store) {
    store = new Conf({ projectName: 'binary-coffee-cli' });
  }
  return store;
}

export function saveAuth(jwt: string, user: { id: string; username: string; email: string }) {
  const config = getConfig();
  config.set('auth', { jwt, user });
}

export function clearAuth() {
  const config = getConfig();
  config.delete('auth');
}

export function getStoredUser(): { id: string; username: string; email: string } | null {
  const config = getConfig();
  return (config.get('auth.user') as { id: string; username: string; email: string }) || null;
}

export function isLoggedIn(): boolean {
  const config = getConfig();
  return !!config.get('auth.jwt');
}
