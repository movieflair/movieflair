
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { renderApp } from '../utils/renderUtils';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

// TypeScript fix: Use the correct method signature
router.get('*', async function renderHandler(req: Request, res: Response, next: NextFunction) {
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

    // Load and transform template
    let template;
    let App;
    
    if (!isProduction) {
      template = fs.readFileSync(path.resolve(__dirname, '../../../index.html'), 'utf-8');
      if (req.vite) {
        template = await req.vite.transformIndexHtml(url, template);
        const { default: entryServer } = await req.vite.ssrLoadModule('/src/App.tsx');
        App = entryServer;
      } else {
        throw new Error('Vite dev server not available');
      }
    } else {
      template = fs.readFileSync(path.resolve(__dirname, '../../../dist/client/index.html'), 'utf-8');
      // In production mode, handle the import differently to avoid TypeScript errors
      try {
        // Use a dynamic import approach that works with TypeScript
        const AppPath = '../../../dist/server/App.js';
        // Using Function constructor to avoid TypeScript static analysis issues
        const dynamicImport = new Function('path', 'return import(path)');
        const entryServer = await dynamicImport(AppPath);
        App = entryServer.default;
      } catch (err) {
        console.error('Failed to import server App:', err);
        return res.status(500).send('Server error: Failed to load server components');
      }
    }

    const helmetContext = {};
    await renderApp(url, template, App, helmetContext, res);
  } catch (error) {
    if (!isProduction && req.vite) {
      req.vite.ssrFixStacktrace(error);
    }
    console.error('Render error:', error);
    next(error);
  }
});

export default router;
