import { Marked } from 'marked';
import { markedTerminal } from 'marked-terminal';

export function renderMarkdown(md: string, termWidth?: number): string {
  const width = Math.min(termWidth || 80, 100);

  const marked = new Marked();
  marked.use(
    markedTerminal({
      width,
      reflowText: true,
      tab: 2,
      showSectionPrefix: false,
      emoji: false,
    }) as any
  );

  const rendered = marked.parse(md);
  if (typeof rendered !== 'string') return md;

  return rendered
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\u00a0/g, ' ')
    .trim();
}
