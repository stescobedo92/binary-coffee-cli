#!/usr/bin/env node

import { Command } from 'commander';
import { APP_NAME, APP_VERSION } from './config.js';

const program = new Command();

program
  .name('bncf')
  .description(APP_NAME + ' - Tu blog de tecnologia desde la terminal')
  .version(APP_VERSION);

program
  .command('tui')
  .description('Abrir la interfaz de terminal interactiva (TUI)')
  .action(async () => {
    const { render } = await import('ink');
    const React = await import('react');
    const { App } = await import('./components/App.js');
    render(React.createElement(App));
  });

program
  .command('posts')
  .description('Listar los ultimos posts')
  .option('-p, --page <number>', 'Numero de pagina', '1')
  .option('-s, --size <number>', 'Posts por pagina', '10')
  .action(async (opts) => {
    const { getPosts } = await import('./services/posts.js');
    const { restoreSession } = await import('./services/auth.js');
    const chalk = (await import('chalk')).default;

    restoreSession();

    try {
      const result = await getPosts(parseInt(opts.page), parseInt(opts.size));
      console.log(chalk.green.bold(`\n  Binary Coffee - Posts (pagina ${opts.page})\n`));
      console.log(chalk.gray('─'.repeat(60)));

      for (const post of result.data) {
        const attrs = post.attributes;
        const author = attrs.author?.data?.attributes?.username || 'Anonimo';
        console.log(chalk.greenBright.bold(`  ${attrs.title}`));
        console.log(chalk.gray(`  @${author} | ${new Date(attrs.publishedAt || attrs.createdAt).toLocaleDateString()}`));
        console.log(chalk.gray('─'.repeat(60)));
      }

      const { total, pageCount } = result.meta.pagination;
      console.log(chalk.gray(`\n  ${total} posts totales | pagina ${opts.page}/${pageCount}`));
    } catch (err: unknown) {
      console.error(chalk.red('Error:'), err instanceof Error ? err.message : err);
    }
  });

program
  .command('search <query>')
  .description('Buscar posts por titulo')
  .action(async (query) => {
    const { searchPosts } = await import('./services/posts.js');
    const { restoreSession } = await import('./services/auth.js');
    const chalk = (await import('chalk')).default;

    restoreSession();

    try {
      const result = await searchPosts(query);
      console.log(chalk.green.bold(`\n  Resultados para: "${query}" (${result.meta.pagination.total})\n`));
      console.log(chalk.gray('─'.repeat(60)));

      for (const post of result.data) {
        const attrs = post.attributes;
        console.log(chalk.greenBright.bold(`  ${attrs.title}`));
        console.log(chalk.gray(`  ${new Date(attrs.publishedAt || attrs.createdAt).toLocaleDateString()}`));
        console.log(chalk.gray('─'.repeat(60)));
      }
    } catch (err: unknown) {
      console.error(chalk.red('Error:'), err instanceof Error ? err.message : err);
    }
  });

program
  .command('tags')
  .description('Listar todos los tags disponibles')
  .action(async () => {
    const { getTags } = await import('./services/tags.js');
    const { restoreSession } = await import('./services/auth.js');
    const chalk = (await import('chalk')).default;

    restoreSession();

    try {
      const tags = await getTags();
      console.log(chalk.green.bold('\n  Binary Coffee - Tags\n'));
      const tagNames = tags.map((t) => `#${t.attributes.name}`);
      console.log(chalk.greenBright(`  ${tagNames.join('  ')}`));
      console.log(chalk.gray(`\n  ${tags.length} tags totales`));
    } catch (err: unknown) {
      console.error(chalk.red('Error:'), err instanceof Error ? err.message : err);
    }
  });

program
  .command('login')
  .description('Iniciar sesion en Binary Coffee')
  .action(async () => {
    const { createInterface } = await import('readline');
    const { login } = await import('./services/auth.js');
    const { saveAuth } = await import('./utils/store.js');
    const chalk = (await import('chalk')).default;

    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const ask = (q: string): Promise<string> =>
      new Promise((resolve) => rl.question(q, resolve));

    try {
      console.log(chalk.green.bold('\n  Binary Coffee - Login\n'));
      const identifier = await ask(chalk.cyan('  Usuario o email: '));
      const password = await ask(chalk.cyan('  Contrasena: '));

      const result = await login(identifier, password);
      saveAuth(result.jwt, result.user);
      console.log(chalk.green(`\n  Bienvenido, @${result.user.username}!`));
    } catch (err: unknown) {
      console.error(chalk.red('\n  Error de autenticacion:'), err instanceof Error ? err.message : err);
    } finally {
      rl.close();
    }
  });

program
  .command('logout')
  .description('Cerrar sesion')
  .action(async () => {
    const { clearAuth } = await import('./utils/store.js');
    const chalk = (await import('chalk')).default;
    clearAuth();
    console.log(chalk.green('  Sesion cerrada.'));
  });

program
  .command('whoami')
  .description('Mostrar usuario actual')
  .action(async () => {
    const { isLoggedIn, getStoredUser } = await import('./utils/store.js');
    const chalk = (await import('chalk')).default;

    if (isLoggedIn()) {
      const user = getStoredUser();
      console.log(chalk.green(`  @${user?.username} (${user?.email})`));
    } else {
      console.log(chalk.gray('  No has iniciado sesion. Usa: bncf login'));
    }
  });

// Default command: launch TUI
if (process.argv.length <= 2) {
  process.argv.push('tui');
}

program.parse();
