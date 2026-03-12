import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';

interface SearchInputProps {
  onSearch: (query: string) => void;
  onBack: () => void;
}

export function SearchInput({ onSearch, onBack }: SearchInputProps) {
  const [query, setQuery] = useState('');

  useInput((_input, key) => {
    if (key.escape) {
      onBack();
    }
  });

  return (
    <Box flexDirection="column">
      <Text color="greenBright" bold>
        Buscar Posts
      </Text>
      <Text color="gray">{'─'.repeat(40)}</Text>
      <Box marginTop={1}>
        <Text color="cyan">Buscar: </Text>
        <TextInput
          value={query}
          onChange={setQuery}
          onSubmit={(val) => {
            if (val.trim()) onSearch(val.trim());
          }}
          placeholder="escribe tu busqueda..."
        />
      </Box>
      <Box marginTop={1}>
        <Text color="gray">[Enter] buscar [Esc] volver</Text>
      </Box>
    </Box>
  );
}
