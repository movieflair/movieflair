
import { Router } from 'express';
import type { Request, Response } from 'express';
import { generateSitemapXml } from '../utils/generateSitemap';

const router = Router();

router.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    // Remove headers that could cause issues
    res.removeHeader('X-Powered-By');
    res.removeHeader('Connection');
    res.removeHeader('Keep-Alive');
    res.removeHeader('Transfer-Encoding');
    
    const sitemap = await generateSitemapXml();
    return res.send(sitemap);
  } catch (error) {
    console.error('Error serving sitemap:', error);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(500).send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
});

export default router;

