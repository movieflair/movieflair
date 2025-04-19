
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { renderApp } from '../utils/renderUtils';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

// Define route handler
router.get('*', (req: Request, res: Response, next: NextFunction) => {
  handleRender(req, res, next).catch(next);
});

// Separate the async logic into its own function
async function handleRender(req: Request, res: Response, next: NextFunction) {
  const url = req.originalUrl;
  console.log(`Handling request for URL: ${url} - Version 2.0.9 EMERGENCY`);

  try {
    // CRITICAL: Always force server rendering for important routes
    const criticalRoutes = ['/neue-trailer', '/', '/kostenlose-filme', '/entdecken'];
    if (criticalRoutes.includes(url)) {
      console.log(`🚨 EMERGENCY RENDERING PATH ACTIVATED FOR: ${url}`);
      req.query.forceSSR = 'true';
      req.query.forceUpdate = 'true';
    }
    
    const isCrawler = req.get('User-Agent')?.toLowerCase().includes('bot') ||
                     req.get('User-Agent')?.toLowerCase().includes('crawler') ||
                     req.query.forceSSR === 'true';
    
    const isImportantRoute = 
      url.match(/^\/film\/\d+/) || 
      url.match(/^\/serie\/\d+/) || 
      url.match(/^\/liste\//) ||
      criticalRoutes.includes(url);

    console.log(`Route ${url} - isCrawler: ${isCrawler}, isImportantRoute: ${isImportantRoute}`);

    // For testing purposes, force SSR for all pages if the specific query param is present
    if (req.query.forceUpdate === 'true' || criticalRoutes.includes(url)) {
      console.log(`!!! EMERGENCY FORCE UPDATE REQUESTED FOR: ${url} !!!`);
      
      // Apply server-side rendering regardless of other conditions
      let template, App;
      
      if (!isProduction) {
        template = fs.readFileSync(path.resolve(__dirname, '../../../index.html'), 'utf-8');
        template = req.vite ? await req.vite.transformIndexHtml(url, template) : template;
        
        try {
          const { default: entryServer } = await req.vite.ssrLoadModule('/src/App.tsx');
          App = entryServer;
          return renderApp(url, template, App, {}, res);
        } catch (error) {
          if (req.vite) req.vite.ssrFixStacktrace(error as Error);
          throw error;
        }
      } else {
        template = fs.readFileSync(path.resolve(__dirname, '../../../dist/client/index.html'), 'utf-8');
        
        try {
          const AppPath = '../../../dist/server/App.js';
          const dynamicImport = new Function('path', 'return import(path)');
          const entryServer = await dynamicImport(AppPath);
          App = entryServer.default;
          return renderApp(url, template, App, {}, res);
        } catch (error) {
          throw error;
        }
      }
    }
    
    if ((!isCrawler && !isImportantRoute) && !req.query.forceSSR) {
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
        template = await req.vite.transformIndexHtml(url, template);
        const { default: entryServer } = await req.vite.ssrLoadModule('/src/App.tsx');
        App = entryServer;
        return renderApp(url, template, App, {}, res);
      }
    } else {
      template = fs.readFileSync(path.resolve(__dirname, '../../../dist/client/index.html'), 'utf-8');
      const AppPath = '../../../dist/server/App.js';
      const dynamicImport = new Function('path', 'return import(path)');
      
      const entryServer = await dynamicImport(AppPath);
      App = entryServer.default;
      return renderApp(url, template, App, {}, res);
    }
  } catch (error) {
    if (!isProduction && req.vite) {
      req.vite.ssrFixStacktrace(error as Error);
    }
    console.error('Render error:', error);
    next(error);
  }
}

export default router;
