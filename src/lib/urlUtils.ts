
export function createUrlSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Replace multiple hyphens with single hyphen
    .trim();
}

export function getMediaTypeInGerman(type: 'movie' | 'tv'): string {
  return type === 'movie' ? 'film' : 'serie';
}
