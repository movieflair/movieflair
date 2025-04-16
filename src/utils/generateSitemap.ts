
import { supabase } from '@/integrations/supabase/client';

// Base URL of your website
const BASE_URL = 'https://movieflair.lovable.app'; // Replace with your actual domain

// Static routes
const routes = [
  '/',
  '/neue-trailer',
  '/kostenlose-filme',
  '/genres',
  '/quick-tipp',
  '/entdecken',
  '/ueber-uns',
  '/filmlisten',
  '/datenschutz',
  '/nutzungsbedingungen',
];

// Routes to exclude
const excludedRoutes = [
  '/admin',
  '/auth',
  '/profil',
  '/merkliste',
];

// Function to fetch all movies from the database
async function fetchAllMovies() {
  try {
    const { data, error } = await supabase
      .from('admin_movies')
      .select('id, title, updated_at')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching movies for sitemap:', error);
      return [];
    }
    
    return data || [];
  } catch (e) {
    console.error('Exception fetching movies for sitemap:', e);
    return [];
  }
}

// Function to fetch all TV shows from the database
async function fetchAllTvShows() {
  try {
    const { data, error } = await supabase
      .from('admin_shows')
      .select('id, name, updated_at')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching TV shows for sitemap:', error);
      return [];
    }
    
    return data || [];
  } catch (e) {
    console.error('Exception fetching TV shows for sitemap:', e);
    return [];
  }
}

// Function to fetch all custom lists from the database
async function fetchAllCustomLists() {
  try {
    const { data, error } = await supabase
      .from('custom_lists')
      .select('id, title, updated_at')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching custom lists for sitemap:', error);
      return [];
    }
    
    return data || [];
  } catch (e) {
    console.error('Exception fetching custom lists for sitemap:', e);
    return [];
  }
}

// Function to generate sitemap XML content
export async function generateSitemapXml() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add static routes
  routes.forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${route}</loc>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  });
  
  // Add movies from the database
  const movies = await fetchAllMovies();
  movies.forEach(movie => {
    const slug = movie.title ? encodeURIComponent(movie.title.toLowerCase().replace(/\s+/g, '-')) : '';
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/film/${movie.id}${slug ? `/${slug}` : ''}</loc>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    if (movie.updated_at) {
      xml += `    <lastmod>${new Date(movie.updated_at).toISOString()}</lastmod>\n`;
    }
    xml += '  </url>\n';
  });
  
  // Add TV shows from the database
  const tvShows = await fetchAllTvShows();
  tvShows.forEach(show => {
    const slug = show.name ? encodeURIComponent(show.name.toLowerCase().replace(/\s+/g, '-')) : '';
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/serie/${show.id}${slug ? `/${slug}` : ''}</loc>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    if (show.updated_at) {
      xml += `    <lastmod>${new Date(show.updated_at).toISOString()}</lastmod>\n`;
    }
    xml += '  </url>\n';
  });
  
  // Add custom lists from the database
  const customLists = await fetchAllCustomLists();
  customLists.forEach(list => {
    const slug = list.title ? encodeURIComponent(list.title.toLowerCase().replace(/\s+/g, '-')) : '';
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/liste/${slug}</loc>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.6</priority>\n';
    if (list.updated_at) {
      xml += `    <lastmod>${new Date(list.updated_at).toISOString()}</lastmod>\n`;
    }
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  return xml;
}

// Synchronous version for use in development
export function generateSitemapXmlSync() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add static routes
  routes.forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${route}</loc>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  return xml;
}

// Function to write sitemap to a file
export function writeSitemapToFile() {
  const fs = require('fs');
  const path = require('path');
  
  const sitemap = generateSitemapXmlSync();
  const outputPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');
  
  fs.writeFileSync(outputPath, sitemap);
  console.log(`Sitemap written to ${outputPath}`);
}

// Only execute if this file is run directly (not imported)
if (typeof require !== 'undefined' && require.main === module) {
  writeSitemapToFile();
}
