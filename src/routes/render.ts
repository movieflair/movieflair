
import { Router } from 'express';
import { renderApp } from '../utils/renderUtils';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

router.use(async (req, res, next) => {
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

    const isProduction = process.env.NODE_ENV === 'production';

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
      template = await req.vite.transformIndexHtml(url, template);
      const { default: entryServer } = await req.vite.ssrLoadModule('/src/App.tsx');
      App = entryServer;
    } else {
      template = fs.readFileSync(path.resolve(__dirname, '../../../dist/client/index.html'), 'utf-8');
      const { default: entryServer } = await import('../../../dist/server/App.js');
      App = entryServer;
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
