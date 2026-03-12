import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { getPosts, searchPosts, getPostsByTag, type Post } from '../services/posts.js';
import { truncate, stripHtml, formatRelativeDate, readingTimeLabel } from '../utils/format.js';

interface PostListProps {
  onSelect: (post: Post) => void;
  onBack: () => void;
  searchQuery?: string;
  tagFilter?: string;
}

export function PostList({ onSelect, onBack, searchQuery, tagFilter }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadPosts();
  }, [page, searchQuery, tagFilter]);

  async function loadPosts() {
    setLoading(true);
    setError(null);
    try {
      let result;
      if (searchQuery) {
        result = await searchPosts(searchQuery, page, pageSize);
      } else if (tagFilter) {
        result = await getPostsByTag(tagFilter, page, pageSize);
      } else {
        result = await getPosts(page, pageSize);
      }
      setPosts(result.data);
      setTotalPages(result.meta.pagination.pageCount);
      setTotal(result.meta.pagination.total);
      setSelectedIndex(0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useInput((input, key) => {
    if (loading) return;

    if (key.upArrow || input === 'k') {
      setSelectedIndex((i) => Math.max(0, i - 1));
    } else if (key.downArrow || input === 'j') {
      setSelectedIndex((i) => Math.min(posts.length - 1, i + 1));
    } else if (key.return) {
      if (posts[selectedIndex]) {
        onSelect(posts[selectedIndex]);
      }
    } else if (input === 'n' && page < totalPages) {
      setPage((p) => p + 1);
    } else if (input === 'p' && page > 1) {
      setPage((p) => p - 1);
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
        <Text> Cargando posts...</Text>
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

  if (posts.length === 0) {
    return (
      <Box flexDirection="column">
        <Text color="yellow">No se encontraron posts.</Text>
        <Text color="gray">Presiona 'q' para volver</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {searchQuery && (
        <Text color="cyan" bold>
          Resultados para: &quot;{searchQuery}&quot; ({total} encontrados)
        </Text>
      )}
      {tagFilter && (
        <Text color="cyan" bold>
          Tag: #{tagFilter} ({total} posts)
        </Text>
      )}
      <Box marginBottom={1}>
        <Text color="gray">
          Pagina {page}/{totalPages} - {total} posts totales
        </Text>
      </Box>

      {posts.map((post, index) => {
        const isSelected = index === selectedIndex;
        const attrs = post.attributes;
        const author = attrs.author?.data?.attributes?.username || 'Anonimo';
        const tags = attrs.tags?.data?.map((t) => t.attributes.name).join(', ') || '';

        return (
          <Box key={post.id} flexDirection="column" marginBottom={0}>
            <Box>
              <Text color={isSelected ? 'green' : 'gray'}>{isSelected ? '>' : ' '} </Text>
              <Text color={isSelected ? 'greenBright' : 'white'} bold={isSelected}>
                {truncate(attrs.title, 55)}
              </Text>
            </Box>
            {isSelected && (
              <Box marginLeft={3} flexDirection="column">
                <Text color="gray">
                  {stripHtml(truncate(attrs.body || '', 80))}
                </Text>
                <Box>
                  <Text color="cyan">@{author}</Text>
                  <Text color="gray"> | </Text>
                  <Text color="yellow">{formatRelativeDate(attrs.publishedAt || attrs.createdAt)}</Text>
                  <Text color="gray"> | </Text>
                  <Text color="magenta">{readingTimeLabel(attrs.readingTime || 0)} lectura</Text>
                  {attrs.views > 0 && (
                    <>
                      <Text color="gray"> | </Text>
                      <Text color="blue">{attrs.views} vistas</Text>
                    </>
                  )}
                </Box>
                {tags && <Text color="green">#{tags.replace(/, /g, ' #')}</Text>}
              </Box>
            )}
          </Box>
        );
      })}

      <Box marginTop={1}>
        <Text color="gray">
          [j/k] navegar [Enter] ver post [n/p] paginas [q] volver
        </Text>
      </Box>
    </Box>
  );
}
