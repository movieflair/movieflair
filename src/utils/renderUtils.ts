
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import React from 'react';

export function renderApp(url: string, template: string, App: any, helmetContext: any, res: any) {
  console.log(`🚨 EMERGENCY RENDERING: App for URL: ${url} in SSR mode - Version 2.0.9 EMERGENCY`);
  
  // For the trailers page, inject emergency notification directly into HTML
  if (url === '/neue-trailer' || url === '/' || url === '/kostenlose-filme') {
    console.log('🚨 EMERGENCY OVERRIDE: Injecting special content for page');
    template = template.replace('</head>', `
      <style>
        .emergency-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background: #ff0000;
          color: white;
          text-align: center;
          padding: 8px;
          font-size: 16px;
          font-weight: bold;
        }
      </style>
      <script>
        window.onload = function() {
          if (!document.querySelector('.emergency-banner')) {
            const banner = document.createElement('div');
            banner.className = 'emergency-banner';
            banner.innerHTML = '🚨 EMERGENCY UPDATE v2.0.9 🚨';
            document.body.prepend(banner);
            
            // Auto-remove banner after 5 seconds
            setTimeout(function() {
              if (banner && banner.parentNode) {
                banner.parentNode.removeChild(banner);
              }
            }, 5000);
          }
        }
      </script>
    </head>`);
  }
  
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
        
        // Add very visible comments to verify the version in the HTML output
        const versionedHtml = htmlWithHelmet
          .replace('</head>', `
            <!-- 🚨 EMERGENCY SSR Version: 2.0.9 -->
            <!-- 🚨 EMERGENCY DEPLOYMENT TIMESTAMP: ${new Date().toISOString()} -->
            <!-- 🚨 FORCED UPDATE APPLIED -->
          </head>`);
        
        res.status(200).set({ 'Content-Type': 'text/html' });
        res.write(versionedHtml.split('<!--app-html-->')[0]);
        pipe(res);
        
        console.log(`🚨 EMERGENCY SSR complete for: ${url} - Version 2.0.9 rendered successfully`);
      },
      onError(error: Error) {
        console.error('Rendering error:', error);
        res.status(500).send('Internal Server Error');
      }
    }
  );
}
