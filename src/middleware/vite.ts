
import { ViteDevServer } from 'vite';
import fs from 'fs';
import path from 'path';

export const setupViteMiddleware = async (app: any, vite: ViteDevServer, isProduction: boolean) => {
  if (!isProduction) {
    app.use(vite.middlewares);
  } else {
    app.use(
      express.static(path.resolve(__dirname, '../dist/client'), {
        index: false,
      })
    );
  }
};
