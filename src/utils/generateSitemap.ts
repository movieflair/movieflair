
/**
 * This utility generates a sitemap.xml file based on the routes in your application.
 * You can run this script periodically to update the sitemap.
 */

import fs from 'fs';
import path from 'path';

// Base URL of your website
const BASE_URL = 'https://screenspick.com'; // Replace with your actual domain

// Routes that should be included in the sitemap
const routes = [
  '/',
  '/trailers',
  '/free-movies',
  '/genres',
  '/quick-tipp',
  '/about',
  '/privacy',
  '/terms',
  // Dynamic routes like /movie/:id and /tv/:id are handled separately
];

// Routes that should be excluded from the sitemap
const excludedRoutes = [
  '/admin',
  '/auth',
  '/profile',
  '/watchlist',
];

// Function to generate sitemap XML content
export function generateSitemapXml() {
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
  
  // Here you would normally add dynamic routes from your database
  // For example, fetching all movie IDs and adding /movie/:id routes
  
  xml += '</urlset>';
  
  return xml;
}

// Function to write sitemap to file
export function writeSitemapToFile() {
  const sitemap = generateSitemapXml();
  const outputPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');
  
  fs.writeFileSync(outputPath, sitemap);
  console.log(`Sitemap written to ${outputPath}`);
}

// Only run this if this file is executed directly (not imported)
if (require.main === module) {
  writeSitemapToFile();
}
