import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { renderToPipeableStream } from 'react-dom/server';
import React from 'react';
import { HelmetProvider, HelmetServerState } from 'react-helmet-async';
import { StaticRouter } from 'react-router-dom/server';
import { generateSitemapXml } from './src/utils/generateSitemap.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

async function startServer() {
  const app = express();

  let vite;
  
  if (!isProduction) {
    // Entwicklungsmodus: Vite-Dev-Server für HMR
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    
    app.use(vite.middlewares);
  } else {
    // Produktionsmodus: Statische Assets ausliefern
    app.use(express.static(path.resolve(__dirname, 'dist/client')));
  }
  
  // Sitemap.xml Route - Strikt konfiguriert für korrekte XML-Ausgabe
  app.get('/sitemap.xml', async (req, res) => {
    try {
      // Entferne unnötige Header
      res.removeHeader('X-Powered-By');
      res.removeHeader('Connection');
      res.removeHeader('Keep-Alive');
      
      // Setze Content-Type und spezifische XML-Header
      res.set({
        'Content-Type': 'application/xml; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=86400'
      });
      
      let sitemap;
      try {
        // Versuche, die dynamische Sitemap zu generieren
        sitemap = await generateSitemapXml();
      } catch (sitemapError) {
        console.error('Error generating dynamic sitemap:', sitemapError);
        
        // Fallback zur statischen Sitemap, wenn die dynamische fehlschlägt
        try {
          sitemap = fs.readFileSync(
            path.resolve(__dirname, isProduction ? 'dist/client/sitemap.xml' : 'public/sitemap.xml'),
            'utf-8'
          );
        } catch (fallbackError) {
          console.error('Error reading static sitemap:', fallbackError);
          // Minimales gültiges XML als letzter Ausweg
          sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';
        }
      }
      
      // Sende die Sitemap ohne weitere Manipulation
      return res.send(sitemap);
    } catch (error) {
      console.error('Error serving sitemap:', error);
      return res.status(500).send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    }
  });

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Movie und TV Show Muster, die wir vorrendern wollen
      const isCrawler = req.get('User-Agent')?.toLowerCase().includes('bot') ||
                        req.get('User-Agent')?.toLowerCase().includes('crawler') ||
                        req.query.forceSSR === 'true';
      
      // Prüfen, ob es eine wichtige Route ist, die vorgerendert werden sollte
      const isImportantRoute = 
        url.match(/^\/film\/\d+/) || 
        url.match(/^\/serie\/\d+/) || 
        url.match(/^\/liste\//) ||
        url === '/' ||
        url === '/neue-trailer' ||
        url === '/kostenlose-filme' ||
        url === '/entdecken' ||
        url === '/filmlisten';

      // Der folgende Bereich wurde optimiert, um immer gültige Meta-Tags für wichtige Routen zu generieren
      // Bei Crawlern rendern wir immer, bei normalen Nutzern nur für wichtige Routen
      if ((!isCrawler && !isImportantRoute) && !req.query.forceSSR) {
        if (isProduction) {
          // In Produktion: Index-HTML direkt ausliefern
          const indexHtml = fs.readFileSync(
            path.resolve(__dirname, 'dist/client/index.html'),
            'utf-8'
          );
          return res.status(200).set({ 'Content-Type': 'text/html' }).end(indexHtml);
        } else {
          // In Entwicklung: Vite transformiert HTML
          let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          return res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        }
      }

      // Ab hier: SSR für wichtige Routen oder Crawler

      // Template laden
      let template;
      if (!isProduction) {
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
      } else {
        template = fs.readFileSync(
          path.resolve(__dirname, 'dist/client/index.html'),
          'utf-8'
        );
      }

      // App entrypoint laden
      let App;
      if (!isProduction) {
        const { default: entryServer } = await vite.ssrLoadModule('/src/App.tsx');
        App = entryServer;
      } else {
        // In Produktion: gebautes Modul aus dist/server importieren
        const { default: entryServer } = await import('./dist/server/App.js');
        App = entryServer;
      }

      // React-Router und Helmet-Kontext für SSR
      const helmetContext = {};

      // Render app to stream with Helmet context
      const { pipe } = renderToPipeableStream(
        React.createElement(
          HelmetProvider, 
          { context: helmetContext },
          React.createElement(
            StaticRouter,
            { location: url },
            React.createElement(App)
          )
        ),
        {
          onShellReady() {
            // Extract helmet data after rendering
            const { helmet } = helmetContext as HelmetServerState;
            
            // Update HTML template with helmet data
            const htmlWithHelmet = template
              .replace('<!--app-head-->', `
                ${helmet?.title?.toString() || ''}
                ${helmet?.meta?.toString() || ''}
                ${helmet?.link?.toString() || ''}
                ${helmet?.script?.toString() || ''}
              `);
            
            res.status(200).set({ 'Content-Type': 'text/html' });
            res.write(htmlWithHelmet.split('<!--app-html-->')[0]);
            pipe(res);
          },
          onError(error) {
            console.error('SSR error:', error);
            if (!isProduction && vite) {
              vite.ssrFixStacktrace(error);
            }
            next(error);
          }
        }
      );
    } catch (error) {
      if (!isProduction && vite) {
        vite.ssrFixStacktrace(error);
      }
      console.error('SSR error:', error);
      next(error);
    }
  });

  app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
  });
}

startServer();
