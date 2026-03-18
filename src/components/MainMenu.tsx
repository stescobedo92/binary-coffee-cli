import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { isLoggedIn, getStoredUser } from '../utils/store.js';

type MenuAction = 'posts' | 'tags' | 'search' | 'login' | 'quit';

interface MainMenuProps {
  onSelect: (action: MenuAction) => void;
}

interface MenuItem {
  label: string;
  value: MenuAction;
}

export function MainMenu({ onSelect }: MainMenuProps) {
  const loggedIn = isLoggedIn();
  const user = getStoredUser();

  const items: MenuItem[] = [
    { label: 'Ultimos Posts', value: 'posts' },
    { label: 'Explorar por Tags', value: 'tags' },
    { label: 'Buscar Posts', value: 'search' },
    { label: loggedIn ? `Sesion (@${user?.username})` : 'Login con GitHub', value: 'login' },
    { label: 'Salir', value: 'quit' },
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.upArrow || input === 'k') {
      setSelectedIndex((i) => Math.max(0, i - 1));
    } else if (key.downArrow || input === 'j') {
      setSelectedIndex((i) => Math.min(items.length - 1, i + 1));
    } else if (key.return) {
      onSelect(items[selectedIndex].value);
    }
  });

  return (
    <Box flexDirection="column">
      <Text color="greenBright" bold>
        Menu Principal
      </Text>
      <Text color="gray">{'─'.repeat(40)}</Text>
      <Box marginTop={1} flexDirection="column">
        {items.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <Box key={item.value}>
              <Text color={isSelected ? 'green' : 'gray'}>{isSelected ? '>' : ' '} </Text>
              <Text color={isSelected ? 'greenBright' : 'white'} bold={isSelected}>
                {item.label}
              </Text>
            </Box>
          );
        })}
      </Box>
      <Box marginTop={1}>
        <Text color="gray">[j/k] navegar [Enter] seleccionar</Text>
      </Box>
    </Box>
  );
}
