
import { ViteDevServer } from 'vite';

declare global {
  namespace Express {
    interface Request {
      vite?: ViteDevServer | null;
    }
  }
}

export {};
