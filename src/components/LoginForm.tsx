import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { githubLoginFlow } from '../services/auth.js';
import { saveAuth, clearAuth, isLoggedIn, getStoredUser } from '../utils/store.js';

interface LoginFormProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function LoginForm({ onSuccess, onBack }: LoginFormProps) {
  const loggedIn = isLoggedIn();
  const user = getStoredUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLogout, setShowLogout] = useState(loggedIn);

  useInput((_input, key) => {
    if (key.escape) {
      onBack();
      return;
    }
    if (showLogout) {
      if (_input === 'l' || _input === 'L') {
        clearAuth();
        setShowLogout(false);
      }
      return;
    }
    if (!loading && (_input === 'g' || _input === 'G' || key.return)) {
      handleGitHubLogin();
    }
  });

  async function handleGitHubLogin() {
    setLoading(true);
    setError(null);
    try {
      const result = await githubLoginFlow();
      saveAuth(result.jwt, result.user);
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error de autenticacion';
      setError(message);
      setLoading(false);
    }
  }

  if (showLogout) {
    return (
      <Box flexDirection="column">
        <Text color="greenBright" bold>
          Sesion Activa
        </Text>
        <Text color="gray">{'─'.repeat(40)}</Text>
        <Box marginTop={1} flexDirection="column">
          <Text color="green">Conectado como: <Text bold>@{user?.username}</Text></Text>
          <Text color="gray">{user?.email}</Text>
        </Box>
        <Box marginTop={1}>
          <Text color="gray">[L] cerrar sesion  [Esc] volver</Text>
        </Box>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box flexDirection="column">
        <Text color="greenBright" bold>
          Autenticacion con GitHub
        </Text>
        <Text color="gray">{'─'.repeat(40)}</Text>
        <Box marginTop={1}>
          <Text color="green">
            <Spinner type="dots" />
          </Text>
          <Text> Esperando autenticacion en el navegador...</Text>
        </Box>
        <Box marginTop={1}>
          <Text color="gray">Se abrio tu navegador para iniciar sesion con GitHub.</Text>
        </Box>
        <Text color="gray">Completa el proceso alli y vuelve a la terminal.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text color="greenBright" bold>
        Iniciar Sesion
      </Text>
      <Text color="gray">{'─'.repeat(40)}</Text>

      {error && (
        <Box marginTop={1}>
          <Text color="red">Error: {error}</Text>
        </Box>
      )}

      <Box marginTop={1} flexDirection="column">
        <Text>Binary Coffee usa autenticacion con <Text color="cyan" bold>GitHub</Text>.</Text>
        <Text color="gray">Se abrira tu navegador para autorizar el acceso.</Text>
      </Box>

      <Box marginTop={1}>
        <Text color="gray">[Enter/G] continuar con GitHub  [Esc] volver</Text>
      </Box>
    </Box>
  );
}
