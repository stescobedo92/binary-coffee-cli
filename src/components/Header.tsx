import React from 'react';
import { Box, Text } from 'ink';
import figlet from 'figlet';

export function Header() {
  const banner = figlet.textSync('BC', { font: 'ANSI Shadow' });
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color="green">{banner}</Text>
      <Text color="greenBright" bold>
        Binary Coffee CLI
      </Text>
      <Text color="gray">Tu blog de tecnologia desde la terminal</Text>
      <Text color="gray">{'─'.repeat(60)}</Text>
    </Box>
  );
}
