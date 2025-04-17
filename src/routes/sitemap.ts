
import { Router } from 'express';
import type { Request, Response } from 'express';
import { generateSitemapXml } from '../utils/generateSitemap';

const router = Router();

// Fix the route handler signature
router.get('/sitemap.xml', (req: Request, res: Response) => {
  try {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    // Remove headers that could cause issues
    res.removeHeader('X-Powered-By');
    res.removeHeader('Connection');
    res.removeHeader('Keep-Alive');
    res.removeHeader('Transfer-Encoding');
    
    generateSitemapXml()
      .then(sitemap => {
        res.send(sitemap);
      })
      .catch(error => {
        console.error('Error serving sitemap:', error);
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.status(500).send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
      });
  } catch (error) {
    console.error('Error serving sitemap:', error);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
});

export default router;
