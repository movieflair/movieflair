
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import React from 'react';
import fs from 'fs';
import path from 'path';

export function renderApp(url: string, template: string, App: any, helmetContext: any, res: any) {
  console.log(`Rendering app for URL: ${url} in SSR mode`);
  
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
        
        // Add a comment to verify the version in the HTML output
        const versionedHtml = htmlWithHelmet.replace('</head>', `<!-- SSR Version: 2.0.4 --></head>`);
        
        res.status(200).set({ 'Content-Type': 'text/html' });
        res.write(versionedHtml.split('<!--app-html-->')[0]);
        pipe(res);
        
        console.log(`SSR complete for: ${url}`);
      },
      onError(error: Error) {
        console.error('Rendering error:', error);
        res.status(500).send('Internal Server Error');
      }
    }
  );
}
