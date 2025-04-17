
import { Router } from 'express';
import sitemapRouter from './sitemap';
import renderRouter from './render';

const router = Router();

// Mount sitemap router first so it handles /sitemap.xml before the catch-all route
router.use(sitemapRouter);

// Mount render router for all paths (catch-all)
router.use(renderRouter);

export default router;
