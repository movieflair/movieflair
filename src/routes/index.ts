
import { Router } from 'express';
import sitemapRouter from './sitemap';
import renderRouter from './render';

const router = Router();

router.use('/', sitemapRouter);
router.use('*', renderRouter);

export default router;
