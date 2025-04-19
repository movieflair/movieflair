import { supabase } from '@/integrations/supabase/client';

const BASE_URL = 'https://movieflair.co';

const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/entdecken', priority: '1.0', changefreq: 'daily' },
  { path: '/neue-trailer', priority: '1.0', changefreq: 'daily' },
  { path: '/kostenlose-filme', priority: '1.0', changefreq: 'daily' },
  { path: '/quick-tipp', priority: '1.0', changefreq: 'daily' },
  { path: '/ueber-uns', priority: '1.0', changefreq: 'monthly' },
  { path: '/datenschutz', priority: '0.5', changefreq: 'monthly' },
  { path: '/nutzungsbedingungen', priority: '0.5', changefreq: 'monthly' },
  { path: '/filmlisten', priority: '1.0', changefreq: 'daily' },
  { path: '/suche', priority: '1.0', changefreq: 'daily' },
  { path: '/genres', priority: '1.0', changefreq: 'daily' },
];

const excludedRoutes = [
  '/admin',
  '/auth',
  '/profil',
  '/merkliste',
  '/search',
  '/listen',
  '/discover',
  '/about',
];

async function fetchAllMovies() {
  try {
    const { data, error } = await supabase
      .from('admin_movies')
      .select('id, title, updated_at')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Error fetching movies for sitemap:', e);
    return [];
  }
}

async function fetchAllTvShows() {
  try {
    const { data, error } = await supabase
      .from('admin_shows')
      .select('id, name, updated_at')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Error fetching TV shows for sitemap:', e);
    return [];
  }
}

async function fetchAllCustomLists() {
  try {
    const { data, error } = await supabase
      .from('custom_lists')
      .select('id, title, updated_at')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Error fetching custom lists for sitemap:', e);
    return [];
  }
}

function createUrlEntry(loc: string, lastmod: string, changefreq: string, priority: string) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export async function generateSitemapXml() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const urls: string[] = [];

    // Add static routes
    staticRoutes.forEach(route => {
      urls.push(createUrlEntry(
        `${BASE_URL}${route.path}`,
        today,
        route.changefreq,
        route.priority
      ));
    });

    // Add movies
    const movies = await fetchAllMovies();
    movies.forEach(movie => {
      const slug = movie.title ? encodeURIComponent(movie.title.toLowerCase().replace(/\s+/g, '-')) : '';
      const lastmod = movie.updated_at ? new Date(movie.updated_at).toISOString().split('T')[0] : today;
      urls.push(createUrlEntry(
        `${BASE_URL}/film/${movie.id}${slug ? '/' + slug : ''}`,
        lastmod,
        'monthly',
        '0.7'
      ));
    });

    // Add TV shows
    const tvShows = await fetchAllTvShows();
    tvShows.forEach(show => {
      const slug = show.name ? encodeURIComponent(show.name.toLowerCase().replace(/\s+/g, '-')) : '';
      const lastmod = show.updated_at ? new Date(show.updated_at).toISOString().split('T')[0] : today;
      urls.push(createUrlEntry(
        `${BASE_URL}/serie/${show.id}${slug ? '/' + slug : ''}`,
        lastmod,
        'monthly',
        '0.7'
      ));
    });

    // Add custom lists
    const customLists = await fetchAllCustomLists();
    customLists.forEach(list => {
      const slug = list.title ? encodeURIComponent(list.title.toLowerCase().replace(/\s+/g, '-')) : '';
      const lastmod = list.updated_at ? new Date(list.updated_at).toISOString().split('T')[0] : today;
      urls.push(createUrlEntry(
        `${BASE_URL}/liste/${list.id}/${slug}`,
        lastmod,
        'weekly',
        '0.6'
      ));
    });

    // Generate final XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    return xml;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';
  }
}

// Function to write sitemap to file (for development/testing)
export function writeSitemapToFile() {
  const fs = require('fs');
  const path = require('path');
  
  generateSitemapXml().then(sitemap => {
    const outputPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(outputPath, sitemap, { encoding: 'utf8' });
    console.log(`Sitemap written to ${outputPath}`);
  }).catch(error => {
    console.error('Error writing sitemap to file:', error);
  });
}
