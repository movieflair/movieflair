
/**
 * Helper functions for SEO metadata across the site
 */

// Truncate text to a specified length and add ellipsis if needed
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

// Default SEO values for the application
export const DEFAULT_SEO = {
  siteName: 'MovieFlair',
  title: 'MovieFlair – Finde den perfekten Film für deine Stimmung',
  description: 'Jeder Moment hat seinen Film. MovieFlair zeigt dir Filme, die zu deiner Stimmung passen – persönlich, emotional und genau im richtigen Moment.',
  keywords: 'filme, serien, streaming, filmempfehlungen, filmtipps',
  ogImage: '/movieflair-logo.png',
  defaultPostfix: ' | MovieFlair'
};

// Format movie or show title with year
export const formatMediaTitle = (title: string, year?: string): string => {
  if (!title) return DEFAULT_SEO.title;
  const yearPart = year ? ` (${year})` : '';
  return `${title}${yearPart} Online Stream anschauen${DEFAULT_SEO.defaultPostfix}`;
};

// Format movie or show description
export const formatMediaDescription = (title: string, year: string, description: string, maxLength: number = 140): string => {
  if (!title) return DEFAULT_SEO.description;
  const yearPart = year ? ` (${year})` : '';
  const baseDesc = `Jetzt ${title}${yearPart} Online Stream anschauen - ${description}`;
  return truncateText(baseDesc, maxLength);
};

// Format list title
export const formatListTitle = (title: string): string => {
  if (!title) return DEFAULT_SEO.title;
  return `${title} Online anschauen${DEFAULT_SEO.defaultPostfix}`;
};

// Format list description
export const formatListDescription = (title: string, description: string, maxLength: number = 140): string => {
  if (!title) return DEFAULT_SEO.description;
  const baseDesc = `${title} Online anschauen - ${description}`;
  return truncateText(baseDesc, maxLength);
};
