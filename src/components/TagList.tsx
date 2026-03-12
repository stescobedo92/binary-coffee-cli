import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { getTags, type Tag } from '../services/tags.js';

interface TagListProps {
  onSelect: (tagName: string) => void;
  onBack: () => void;
}

export function TagList({ onSelect, onBack }: TagListProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const visibleCount = 15;

  useEffect(() => {
    loadTags();
  }, []);

  async function loadTags() {
    try {
      const result = await getTags();
      setTags(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  useInput((input, key) => {
    if (loading) return;

    if (key.upArrow || input === 'k') {
      setSelectedIndex((i) => {
        const next = Math.max(0, i - 1);
        if (next < scrollOffset) setScrollOffset(next);
        return next;
      });
    } else if (key.downArrow || input === 'j') {
      setSelectedIndex((i) => {
        const next = Math.min(tags.length - 1, i + 1);
        if (next >= scrollOffset + visibleCount) setScrollOffset(next - visibleCount + 1);
        return next;
      });
    } else if (key.return) {
      if (tags[selectedIndex]) {
        onSelect(tags[selectedIndex].attributes.name);
      }
    } else if (input === 'q' || key.escape) {
      onBack();
    }
  });

  if (loading) {
    return (
      <Box>
        <Text color="green">
          <Spinner type="dots" />
        </Text>
        <Text> Cargando tags...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">Error: {error}</Text>
        <Text color="gray">Presiona 'q' para volver</Text>
      </Box>
    );
  }

  const visibleTags = tags.slice(scrollOffset, scrollOffset + visibleCount);

  return (
    <Box flexDirection="column">
      <Text color="greenBright" bold>
        Tags ({tags.length})
      </Text>
      <Text color="gray">{'─'.repeat(40)}</Text>

      {visibleTags.map((tag, i) => {
        const realIndex = scrollOffset + i;
        const isSelected = realIndex === selectedIndex;
        return (
          <Box key={tag.id}>
            <Text color={isSelected ? 'green' : 'gray'}>{isSelected ? '>' : ' '} </Text>
            <Text color={isSelected ? 'greenBright' : 'white'} bold={isSelected}>
              #{tag.attributes.name}
            </Text>
          </Box>
        );
      })}

      <Box marginTop={1}>
        <Text color="gray">
          [j/k] navegar [Enter] ver posts [q] volver
        </Text>
      </Box>
    </Box>
  );
}
