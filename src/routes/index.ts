
import { Router } from 'express';
import sitemapRouter from './sitemap';
import renderRouter from './render';

const router = Router();

// Mount sitemap router first to handle /sitemap.xml
router.use(sitemapRouter);

// Mount render router to handle all other paths
router.use(renderRouter);

export default router;
