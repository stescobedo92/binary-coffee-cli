import React from 'react';
import { Box, Text } from 'ink';
import { getStoredUser, isLoggedIn } from '../utils/store.js';

interface StatusBarProps {
  currentView: string;
  extra?: string;
}

export function StatusBar({ currentView, extra }: StatusBarProps) {
  const loggedIn = isLoggedIn();
  const user = getStoredUser();

  return (
    <Box marginTop={1}>
      <Text color="gray">{'─'.repeat(60)}</Text>
      <Box>
        <Text color="cyan"> [{currentView}] </Text>
        {extra && <Text color="yellow"> {extra} </Text>}
        <Text color="gray"> | </Text>
        {loggedIn && user ? (
          <Text color="green"> @{user.username} </Text>
        ) : (
          <Text color="gray"> No autenticado </Text>
        )}
      </Box>
    </Box>
  );
}
