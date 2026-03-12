import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { login } from '../services/auth.js';
import { saveAuth } from '../utils/store.js';

interface LoginFormProps {
  onSuccess: () => void;
  onBack: () => void;
}

type Field = 'username' | 'password';

export function LoginForm({ onSuccess, onBack }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeField, setActiveField] = useState<Field>('username');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useInput((_input, key) => {
    if (key.escape) {
      onBack();
    }
  });

  async function handleSubmit() {
    if (!username || !password) {
      setError('Username y password son requeridos');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await login(username, password);
      saveAuth(result.jwt, result.user);
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error de autenticacion';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Box>
        <Text color="green">
          <Spinner type="dots" />
        </Text>
        <Text> Autenticando...</Text>
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
        <Text color="red">Error: {error}</Text>
      )}

      <Box marginTop={1}>
        <Text color={activeField === 'username' ? 'cyan' : 'gray'}>Usuario: </Text>
        {activeField === 'username' ? (
          <TextInput
            value={username}
            onChange={setUsername}
            onSubmit={() => setActiveField('password')}
            placeholder="tu_usuario"
          />
        ) : (
          <Text>{username}</Text>
        )}
      </Box>

      <Box>
        <Text color={activeField === 'password' ? 'cyan' : 'gray'}>Contrasena: </Text>
        {activeField === 'password' ? (
          <TextInput
            value={password}
            onChange={setPassword}
            onSubmit={handleSubmit}
            mask="*"
            placeholder="********"
          />
        ) : (
          <Text>{'*'.repeat(password.length) || '________'}</Text>
        )}
      </Box>

      <Box marginTop={1}>
        <Text color="gray">
          [Tab] cambiar campo [Enter] confirmar [Esc] volver
        </Text>
      </Box>
    </Box>
  );
}
