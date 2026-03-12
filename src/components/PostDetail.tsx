import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { type Post } from '../services/posts.js';
import { getComments, type Comment } from '../services/comments.js';
import { formatDate, stripHtml } from '../utils/format.js';
import { SITE_URL } from '../config.js';

interface PostDetailProps {
  post: Post;
  onBack: () => void;
  onOpenInBrowser: (url: string) => void;
}

export function PostDetail({ post, onBack, onOpenInBrowser }: PostDetailProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [showComments, setShowComments] = useState(false);

  const attrs = post.attributes;
  const author = attrs.author?.data?.attributes?.username || 'Anonimo';
  const tags = attrs.tags?.data?.map((t) => t.attributes.name) || [];

  const bodyLines = stripHtml(attrs.body || 'Sin contenido')
    .split('\n')
    .filter((l) => l.trim() !== '');

  const visibleLines = 20;

  useEffect(() => {
    loadComments();
  }, []);

  async function loadComments() {
    try {
      const result = await getComments(post.id);
      setComments(result.data);
    } catch {
      // Comments may not be available
    } finally {
      setLoadingComments(false);
    }
  }

  useInput((input, key) => {
    if (key.downArrow || input === 'j') {
      setScrollOffset((o) => Math.min(o + 1, Math.max(0, bodyLines.length - visibleLines)));
    } else if (key.upArrow || input === 'k') {
      setScrollOffset((o) => Math.max(0, o - 1));
    } else if (input === 'c') {
      setShowComments((s) => !s);
    } else if (input === 'o') {
      onOpenInBrowser(`${SITE_URL}/post/${post.id}`);
    } else if (input === 'q' || key.escape) {
      onBack();
    }
  });

  return (
    <Box flexDirection="column">
      {/* Title */}
      <Box marginBottom={1} flexDirection="column">
        <Text color="greenBright" bold>
          {attrs.title}
        </Text>
        <Box>
          <Text color="cyan">@{author}</Text>
          <Text color="gray"> | </Text>
          <Text color="yellow">{formatDate(attrs.publishedAt || attrs.createdAt)}</Text>
          <Text color="gray"> | </Text>
          <Text color="magenta">{attrs.readingTime || 0} min lectura</Text>
          <Text color="gray"> | </Text>
          <Text color="blue">{attrs.views || 0} vistas</Text>
        </Box>
        {tags.length > 0 && (
          <Text color="green">
            {tags.map((t) => `#${t}`).join(' ')}
          </Text>
        )}
        <Text color="gray">{'─'.repeat(60)}</Text>
      </Box>

      {/* Body */}
      {!showComments && (
        <Box flexDirection="column">
          {bodyLines.slice(scrollOffset, scrollOffset + visibleLines).map((line, i) => (
            <Text key={i} wrap="wrap">
              {line}
            </Text>
          ))}
          {bodyLines.length > visibleLines && (
            <Text color="gray">
              --- linea {scrollOffset + 1}-{Math.min(scrollOffset + visibleLines, bodyLines.length)} de {bodyLines.length} ---
            </Text>
          )}
        </Box>
      )}

      {/* Comments */}
      {showComments && (
        <Box flexDirection="column">
          <Text color="cyan" bold>
            Comentarios ({comments.length})
          </Text>
          <Text color="gray">{'─'.repeat(40)}</Text>
          {loadingComments ? (
            <Box>
              <Text color="green">
                <Spinner type="dots" />
              </Text>
              <Text> Cargando comentarios...</Text>
            </Box>
          ) : comments.length === 0 ? (
            <Text color="gray">No hay comentarios</Text>
          ) : (
            comments.map((comment) => (
              <Box key={comment.id} flexDirection="column" marginBottom={1}>
                <Box>
                  <Text color="cyan" bold>
                    {comment.attributes.user?.data?.attributes?.username || comment.attributes.name || 'Anonimo'}
                  </Text>
                  <Text color="gray"> - {formatDate(comment.attributes.createdAt)}</Text>
                </Box>
                <Text wrap="wrap">{stripHtml(comment.attributes.body)}</Text>
              </Box>
            ))
          )}
        </Box>
      )}

      {/* Controls */}
      <Box marginTop={1}>
        <Text color="gray">
          [j/k] scroll [c] comentarios [o] abrir en navegador [q] volver
        </Text>
      </Box>
    </Box>
  );
}
