
import { Application } from 'express';
import express from 'express';
import { ViteDevServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const setupViteMiddleware = async (app: Application, vite: ViteDevServer | null, isProduction: boolean) => {
  if (!isProduction && vite) {
    app.use(vite.middlewares);
  } else {
    app.use(
      express.static(path.resolve(__dirname, '../../dist/client'), {
        index: false,
      })
    );
  }
};
