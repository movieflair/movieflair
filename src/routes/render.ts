
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { renderApp } from '../utils/renderUtils';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

// Using the correct handler pattern for Express 5
router.get('*', function(req: Request, res: Response, next: NextFunction) {
  handleRender(req, res, next).catch(next);
});

// Separate the async logic into its own function
async function handleRender(req: Request, res: Response, next: NextFunction) {
  const url = req.originalUrl;
  console.log(`Handling request for URL: ${url} - Version 2.0.4`);

  try {
    const isCrawler = req.get('User-Agent')?.toLowerCase().includes('bot') ||
                     req.get('User-Agent')?.toLowerCase().includes('crawler') ||
                     req.query.forceSSR === 'true';
    
    const isImportantRoute = 
      url.match(/^\/film\/\d+/) || 
      url.match(/^\/serie\/\d+/) || 
      url.match(/^\/liste\//) ||
      ['/', '/neue-trailer', '/kostenlose-filme', '/entdecken', '/filmlisten'].includes(url);

    console.log(`Route ${url} - isCrawler: ${isCrawler}, isImportantRoute: ${isImportantRoute}`);

    // ALWAYS force SSR for the trailers page to ensure changes are deployed
    const forcedSSRPaths = ['/neue-trailer'];
    const forceSSR = forcedSSRPaths.includes(url);
    
    if (forceSSR) {
      console.log(`FORCING server-side rendering for critical path: ${url}`);
    }
    
    if ((!isCrawler && !isImportantRoute && !forceSSR) && !req.query.forceSSR) {
      console.log(`Serving client-side rendering for ${url}`);
      const indexHtml = fs.readFileSync(
        path.resolve(__dirname, isProduction ? '../../../dist/client/index.html' : '../../../index.html'),
        'utf-8'
      );
      return res.status(200).set({ 'Content-Type': 'text/html' }).end(indexHtml);
    }

    console.log(`Performing server-side rendering for ${url}`);
    
    // Wrap template and App loading in an async context
    let template, App;
    
    if (!isProduction) {
      template = fs.readFileSync(path.resolve(__dirname, '../../../index.html'), 'utf-8');
      if (req.vite) {
        template = req.vite.transformIndexHtml(url, template);
        try {
          const { default: entryServer } = await req.vite.ssrLoadModule('/src/App.tsx');
          App = entryServer;
          renderApp(url, template, App, {}, res);
        } catch (error) {
          if (req.vite) {
            req.vite.ssrFixStacktrace(error);
          }
          console.error('Render error:', error);
          throw error;
        }
      } else {
        throw new Error('Vite dev server not available');
      }
    } else {
      template = fs.readFileSync(path.resolve(__dirname, '../../../dist/client/index.html'), 'utf-8');
      const AppPath = '../../../dist/server/App.js';
      const dynamicImport = new Function('path', 'return import(path)');
      
      try {
        const entryServer = await dynamicImport(AppPath);
        App = entryServer.default;
        renderApp(url, template, App, {}, res);
      } catch (error) {
        console.error('Render error:', error);
        throw error;
      }
    }
  } catch (error) {
    if (!isProduction && req.vite) {
      req.vite.ssrFixStacktrace(error);
    }
    console.error('Render error:', error);
    throw error;
  }
}

export default router;
