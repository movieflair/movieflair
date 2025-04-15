
export function createUrlSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD') // Normalize umlauts and special characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Replace multiple hyphens with single hyphen
    .trim();
}

export function getMediaTypeInGerman(type: 'movie' | 'tv'): string {
  return type === 'movie' ? 'film' : 'serie';
}

export function parseUrlSlug(slug: string): { id: number | null, originalSlug: string } {
  // In case the URL contains multiple hyphens, extract the last part as the ID
  const parts = slug.split('-');
  const potentialId = parseInt(parts[parts.length - 1]);
  
  // Check if the last part is a valid number
  if (!isNaN(potentialId)) {
    // Remove the ID from the slug
    const originalSlug = parts.slice(0, -1).join('-');
    return { id: potentialId, originalSlug };
  }
  
  // If no ID found, return null
  return { id: null, originalSlug: slug };
}
