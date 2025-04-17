
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { renderApp } from '../utils/renderUtils';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

// Use explicit path parameter and handler function
router.get('*', async function(req: Request, res: Response, next: NextFunction) {
  const url = req.originalUrl;

  try {
    const isCrawler = req.get('User-Agent')?.toLowerCase().includes('bot') ||
                     req.get('User-Agent')?.toLowerCase().includes('crawler') ||
                     req.query.forceSSR === 'true';
    
    const isImportantRoute = 
      url.match(/^\/film\/\d+/) || 
      url.match(/^\/serie\/\d+/) || 
      url.match(/^\/liste\//) ||
      ['/', '/neue-trailer', '/kostenlose-filme', '/entdecken', '/filmlisten'].includes(url);

    if ((!isCrawler && !isImportantRoute) && !req.query.forceSSR) {
      const indexHtml = fs.readFileSync(
        path.resolve(__dirname, isProduction ? '../../../dist/client/index.html' : '../../../index.html'),
        'utf-8'
      );
      return res.status(200).set({ 'Content-Type': 'text/html' }).end(indexHtml);
    }

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
          next(error);
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
        next(error);
      }
    }
  } catch (error) {
    if (!isProduction && req.vite) {
      req.vite.ssrFixStacktrace(error);
    }
    console.error('Render error:', error);
    next(error);
  }
});

export default router;
