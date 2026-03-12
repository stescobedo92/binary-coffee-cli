import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput, useStdout } from 'ink';
import Spinner from 'ink-spinner';
import { type Post } from '../services/posts.js';
import { getComments, type Comment } from '../services/comments.js';
import { formatDate, stripHtml } from '../utils/format.js';
import { renderMarkdown } from '../utils/markdown.js';
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
  const { stdout } = useStdout();

  const attrs = post.attributes;
  const author = attrs.author?.data?.attributes?.username || 'Anonimo';
  const tags = attrs.tags?.data?.map((t) => t.attributes.name) || [];

  const termHeight = stdout?.rows ? stdout.rows - 12 : 20;
  const visibleLines = Math.max(5, termHeight);

  const renderedBody = useMemo(() => {
    const body = attrs.body || 'Sin contenido';
    return renderMarkdown(body);
  }, [attrs.body]);

  const bodyLines = useMemo(() => renderedBody.split('\n'), [renderedBody]);

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
      setScrollOffset((o) => Math.min(o + 3, Math.max(0, bodyLines.length - visibleLines)));
    } else if (key.upArrow || input === 'k') {
      setScrollOffset((o) => Math.max(0, o - 3));
    } else if (input === 'd') {
      setScrollOffset((o) => Math.min(o + visibleLines, Math.max(0, bodyLines.length - visibleLines)));
    } else if (input === 'u') {
      setScrollOffset((o) => Math.max(0, o - visibleLines));
    } else if (input === 'c') {
      setShowComments((s) => !s);
      setScrollOffset(0);
    } else if (input === 'o') {
      onOpenInBrowser(`${SITE_URL}/post/${post.id}`);
    } else if (input === 'q' || key.escape) {
      onBack();
    }
  });

  const scrollPercent = bodyLines.length <= visibleLines
    ? 100
    : Math.round((scrollOffset / (bodyLines.length - visibleLines)) * 100);

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
          <Text>
            {bodyLines.slice(scrollOffset, scrollOffset + visibleLines).join('\n')}
          </Text>
          {bodyLines.length > visibleLines && (
            <Box marginTop={1}>
              <Text color="gray">
                {'─'.repeat(40)} {scrollPercent}% {'─'.repeat(15)}
              </Text>
            </Box>
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
          [j/k] scroll [d/u] pagina [c] comentarios [o] navegador [q] volver
        </Text>
      </Box>
    </Box>
  );
}
