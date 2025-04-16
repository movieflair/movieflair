
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
    // Development mode: Use Vite dev server for HMR
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve static assets
    app.use(express.static(path.resolve(__dirname, 'dist/client')));
  }
  
  // Sitemap.xml Route - now async to fetch all data from DB
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const sitemap = await generateSitemapXml();
      res.header('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Patterns for routes we want to pre-render
      const isCrawler = req.get('User-Agent')?.toLowerCase().includes('bot') ||
                        req.get('User-Agent')?.toLowerCase().includes('crawler') ||
                        req.query.forceSSR === 'true';
      
      // Check if it's an important route that should be pre-rendered
      const isImportantRoute = 
        url.match(/^\/film\/\d+/) || 
        url.match(/^\/serie\/\d+/) || 
        url.match(/^\/liste\//) ||
        url === '/' ||
        url === '/neue-trailer' ||
        url === '/kostenlose-filme' ||
        url === '/entdecken' ||
        url === '/filmlisten';

      // This section has been optimized to always generate valid meta tags for important routes
      // For crawlers we always render, for normal users only for important routes
      if ((!isCrawler && !isImportantRoute) && !req.query.forceSSR) {
        if (isProduction) {
          // In production: Serve index.html directly
          const indexHtml = fs.readFileSync(
            path.resolve(__dirname, 'dist/client/index.html'),
            'utf-8'
          );
          return res.status(200).set({ 'Content-Type': 'text/html' }).end(indexHtml);
        } else {
          // In development: Vite transforms HTML
          let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          return res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        }
      }

      // From here: SSR for important routes or crawlers

      // Load template
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

      // Load app entry point
      let App;
      if (!isProduction) {
        const { default: entryServer } = await vite.ssrLoadModule('/src/App.tsx');
        App = entryServer;
      } else {
        // In production: Import built module from dist/server
        const { default: entryServer } = await import('./dist/server/App.js');
        App = entryServer;
      }

      // React Router and Helmet context for SSR
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
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
