import { Marked } from 'marked';
import { markedTerminal } from 'marked-terminal';

const marked = new Marked();
marked.use(
  markedTerminal({
    width: 80,
    reflowText: true,
    tab: 2,
  }) as any
);

export function renderMarkdown(md: string): string {
  const rendered = marked.parse(md);
  if (typeof rendered !== 'string') return md;
  // Clean up excessive blank lines
  return rendered.replace(/\n{3,}/g, '\n\n').trim();
}
