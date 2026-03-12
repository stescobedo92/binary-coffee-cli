import React, { useState } from 'react';
import { Box, useApp } from 'ink';
import { type Post } from '../services/posts.js';
import { Header } from './Header.js';
import { StatusBar } from './StatusBar.js';
import { MainMenu } from './MainMenu.js';
import { PostList } from './PostList.js';
import { PostDetail } from './PostDetail.js';
import { TagList } from './TagList.js';
import { SearchInput } from './SearchInput.js';
import { LoginForm } from './LoginForm.js';
import { restoreSession } from '../services/auth.js';

type View =
  | { type: 'menu' }
  | { type: 'posts' }
  | { type: 'post-detail'; post: Post }
  | { type: 'tags' }
  | { type: 'posts-by-tag'; tag: string }
  | { type: 'search' }
  | { type: 'search-results'; query: string }
  | { type: 'login' };

export function App() {
  const { exit } = useApp();
  const [view, setView] = useState<View>({ type: 'menu' });

  // Restore session on mount
  React.useEffect(() => {
    restoreSession();
  }, []);

  function handleOpenInBrowser(url: string) {
    import('open').then((mod) => mod.default(url)).catch(() => {});
  }

  function getViewName(): string {
    switch (view.type) {
      case 'menu': return 'Menu';
      case 'posts': return 'Posts';
      case 'post-detail': return 'Detalle';
      case 'tags': return 'Tags';
      case 'posts-by-tag': return `Tag: #${view.tag}`;
      case 'search': return 'Buscar';
      case 'search-results': return 'Resultados';
      case 'login': return 'Login';
    }
  }

  return (
    <Box flexDirection="column">
      <Header />

      {view.type === 'menu' && (
        <MainMenu
          onSelect={(action) => {
            switch (action) {
              case 'posts':
                setView({ type: 'posts' });
                break;
              case 'tags':
                setView({ type: 'tags' });
                break;
              case 'search':
                setView({ type: 'search' });
                break;
              case 'login':
                setView({ type: 'login' });
                break;
              case 'quit':
                exit();
                break;
            }
          }}
        />
      )}

      {view.type === 'posts' && (
        <PostList
          onSelect={(post) => setView({ type: 'post-detail', post })}
          onBack={() => setView({ type: 'menu' })}
        />
      )}

      {view.type === 'post-detail' && (
        <PostDetail
          post={view.post}
          onBack={() => setView({ type: 'posts' })}
          onOpenInBrowser={handleOpenInBrowser}
        />
      )}

      {view.type === 'tags' && (
        <TagList
          onSelect={(tag) => setView({ type: 'posts-by-tag', tag })}
          onBack={() => setView({ type: 'menu' })}
        />
      )}

      {view.type === 'posts-by-tag' && (
        <PostList
          tagFilter={view.tag}
          onSelect={(post) => setView({ type: 'post-detail', post })}
          onBack={() => setView({ type: 'tags' })}
        />
      )}

      {view.type === 'search' && (
        <SearchInput
          onSearch={(query) => setView({ type: 'search-results', query })}
          onBack={() => setView({ type: 'menu' })}
        />
      )}

      {view.type === 'search-results' && (
        <PostList
          searchQuery={view.query}
          onSelect={(post) => setView({ type: 'post-detail', post })}
          onBack={() => setView({ type: 'search' })}
        />
      )}

      {view.type === 'login' && (
        <LoginForm
          onSuccess={() => setView({ type: 'menu' })}
          onBack={() => setView({ type: 'menu' })}
        />
      )}

      <StatusBar currentView={getViewName()} />
    </Box>
  );
}
