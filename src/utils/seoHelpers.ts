
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

/**
 * Format movie or show title
 * Format: "[Title] (Year) Online Stream anschauen | MovieFlair"
 */
export const formatMediaTitle = (title: string, year?: string): string => {
  if (!title) return DEFAULT_SEO.title;
  
  const yearPart = year ? ` (${year})` : '';
  return `${title}${yearPart} Online Stream anschauen${DEFAULT_SEO.defaultPostfix}`;
};

/**
 * Format media description
 * Format: "Jetzt [Title] (Year) Online Stream anschauen - [Description]"
 * Limited to 140 characters
 */
export const formatMediaDescription = (title: string, year: string, description: string, maxLength: number = 140): string => {
  if (!title) return DEFAULT_SEO.description;
  
  const yearPart = year ? ` (${year})` : '';
  const baseDesc = `Jetzt ${title}${yearPart} Online Stream anschauen - ${description || 'Entdecke diesen Film auf MovieFlair.'}`;
  return truncateText(baseDesc, maxLength);
};

/**
 * Format list title
 * Format: "[List Title] Online anschauen | MovieFlair"
 */
export const formatListTitle = (title: string): string => {
  if (!title) return DEFAULT_SEO.title;
  return `${title} Online anschauen${DEFAULT_SEO.defaultPostfix}`;
};

/**
 * Format list description
 * Format: "[List Title] Online anschauen - [List Description]"
 * Limited to 140 characters
 */
export const formatListDescription = (title: string, description: string, maxLength: number = 140): string => {
  if (!title) return DEFAULT_SEO.description;
  const baseDesc = `${title} Online anschauen - ${description || 'Entdecke diese Filmauswahl auf MovieFlair.'}`;
  return truncateText(baseDesc, maxLength);
};

/**
 * Get absolute URL for SEO images
 */
export const getAbsoluteImageUrl = (imagePath: string): string => {
  if (!imagePath) return DEFAULT_SEO.ogImage;
  
  if (imagePath.startsWith('http')) return imagePath;
  
  // When running server-side (like in SSR), window is not available
  if (typeof window === 'undefined') {
    // Providing a fallback that will be replaced on client-side
    return `https://movieflair.lovable.app${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  }
  
  return imagePath.startsWith('/') 
    ? `${window.location.origin}${imagePath}`
    : imagePath;
};
