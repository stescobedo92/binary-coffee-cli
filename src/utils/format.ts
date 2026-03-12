export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'hoy';
  if (diffDays === 1) return 'ayer';
  if (diffDays < 7) return `hace ${diffDays} dias`;
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `hace ${Math.floor(diffDays / 30)} meses`;
  return `hace ${Math.floor(diffDays / 365)} anos`;
}

export function readingTimeLabel(minutes: number): string {
  if (minutes <= 1) return '1 min';
  return `${minutes} min`;
}
