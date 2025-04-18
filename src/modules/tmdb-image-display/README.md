
# TMDB Image Display Module

A standalone module for fetching and displaying TMDB (The Movie Database) images in any web application.

## Features

- Completely independent of any website's codebase
- Handles various image sizes and aspect ratios
- Built-in error handling and fallbacks for missing or inaccessible images
- Loading states with skeletons
- Responsive design support
- Efficient resource management with retry logic
- CORS support
- Image preloading for critical content

## Installation

Simply copy the `tmdb-image-display` directory into your project.

## Configuration

To use this module, you'll need a TMDB API key. You can get one by signing up at [https://www.themoviedb.org/signup](https://www.themoviedb.org/signup).

## Usage

### Basic Example

```jsx
import React from 'react';
import { TMDBImageDisplay } from './path/to/modules/tmdb-image-display';

const MoviePoster = () => {
  return (
    <TMDBImageDisplay
      path="/path/to/poster.jpg" // Path from TMDB API
      size="w500"                // Size of the image
      alt="Movie Title"          // Alt text for accessibility
      apiKey="your_api_key"      // Your TMDB API key
    />
  );
};

export default MoviePoster;
```

### Advanced Example

```jsx
import React, { useState } from 'react';
import { TMDBImageDisplay, tmdbImageService } from './path/to/modules/tmdb-image-display';

// Initialize the service once in your app
tmdbImageService.initialize('your_api_key');

const DetailedMoviePoster = () => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="movie-card">
      <TMDBImageDisplay
        path="/path/to/poster.jpg"
        size="w780"
        type="poster"
        alt="Inception Movie Poster"
        className="rounded-lg shadow-lg w-full h-auto"
        fallbackClassName="rounded-lg bg-gray-100 w-full h-64 flex items-center justify-center"
        priority={true}
        onLoad={() => setImageLoaded(true)}
        onError={() => console.log('Image failed to load')}
      />
      {imageLoaded && <div className="mt-2">Image loaded successfully!</div>}
    </div>
  );
};

export default DetailedMoviePoster;
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `path` | `string \| null` | - | Image path from TMDB API |
| `size` | `TMDBImageSize` | `'w500'` | Size of the image |
| `type` | `'poster' \| 'backdrop' \| 'profile' \| 'logo' \| 'still'` | `'poster'` | Type of image |
| `alt` | `string` | - | Alt text for the image |
| `className` | `string` | `''` | CSS class for the image |
| `fallbackClassName` | `string` | `''` | CSS class for the fallback element |
| `priority` | `boolean` | `false` | Whether to prioritize loading this image |
| `apiKey` | `string` | - | TMDB API key |
| `configUrl` | `string` | - | Optional custom configuration URL |
| `onLoad` | `() => void` | - | Callback when image loads successfully |
| `onError` | `() => void` | - | Callback when image fails to load |

## CSS Integration

The component accepts custom CSS classes, making it easy to integrate with your existing styling system (CSS, Tailwind, styled-components, etc).

## Browser Support

This module works in all modern browsers. For older browsers, you may need to add polyfills for features like fetch, Promise, etc.
