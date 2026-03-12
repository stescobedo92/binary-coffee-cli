import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
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
    { label: '  Ultimos Posts', value: 'posts' },
    { label: '  Explorar por Tags', value: 'tags' },
    { label: '  Buscar Posts', value: 'search' },
    { label: loggedIn ? `  Sesion (@${user?.username})` : '  Iniciar Sesion', value: 'login' },
    { label: '  Salir', value: 'quit' },
  ];

  return (
    <Box flexDirection="column">
      <Text color="greenBright" bold>
        Menu Principal
      </Text>
      <Text color="gray">{'─'.repeat(40)}</Text>
      <Box marginTop={1}>
        <SelectInput
          items={items}
          onSelect={(item) => onSelect(item.value)}
          indicatorComponent={({ isSelected }) => (
            <Text color="green">{isSelected ? '>' : ' '} </Text>
          )}
          itemComponent={({ isSelected, label }) => (
            <Text color={isSelected ? 'greenBright' : 'white'} bold={isSelected}>
              {label}
            </Text>
          )}
        />
      </Box>
    </Box>
  );
}
