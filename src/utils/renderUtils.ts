
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import React from 'react';
import fs from 'fs';
import path from 'path';

export function renderApp(url: string, template: string, App: any, helmetContext: any, res: any) {
  console.log(`[RenderUtils] Starting SSR for URL: ${url}`);
  
  const { pipe } = renderToPipeableStream(
    React.createElement(
      HelmetProvider,
      { context: helmetContext },
      React.createElement(
        StaticRouter,
        { location: url },
        React.createElement(App)
      )
    ),
    {
      onShellReady() {
        const { helmet } = helmetContext;
        
        const htmlWithHelmet = template.replace('<!--app-head-->', `
          ${helmet?.title?.toString() || ''}
          ${helmet?.meta?.toString() || ''}
          ${helmet?.link?.toString() || ''}
          ${helmet?.script?.toString() || ''}
        `);
        
        console.log(`[RenderUtils] Shell ready for URL: ${url}, sending response`);
        res.status(200).set({ 'Content-Type': 'text/html' });
        res.write(htmlWithHelmet.split('<!--app-html-->')[0]);
        pipe(res);
      },
      onError(error: Error) {
        console.error('[RenderUtils] Rendering error:', error);
        res.status(500).send('Internal Server Error');
      }
    }
  );
}
