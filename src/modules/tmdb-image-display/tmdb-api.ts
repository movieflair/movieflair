
import { TMDBImageConfig } from './types';

/**
 * Service to fetch TMDB configuration and handle image URLs
 */
export class TMDBImageService {
  private static instance: TMDBImageService;
  private apiKey: string | null = null;
  private configUrl: string = 'https://api.themoviedb.org/3/configuration';
  private imageConfig: TMDBImageConfig | null = null;
  private configPromise: Promise<TMDBImageConfig> | null = null;
  private fallbackBaseUrl: string = 'https://image.tmdb.org/t/p/';
  private alternateBaseUrl: string = 'https://img.tmdb.org/t/p/';

  private constructor() {}

  /**
   * Get singleton instance of the service
   */
  public static getInstance(): TMDBImageService {
    if (!TMDBImageService.instance) {
      TMDBImageService.instance = new TMDBImageService();
    }
    return TMDBImageService.instance;
  }

  /**
   * Initialize the service with API key and optional config URL
   */
  public initialize(apiKey: string, configUrl?: string): void {
    this.apiKey = apiKey;
    if (configUrl) {
      this.configUrl = configUrl;
    }
  }

  /**
   * Fetch the image configuration from TMDB API
   */
  public async getImageConfig(): Promise<TMDBImageConfig> {
    // Return cached config if available
    if (this.imageConfig) {
      return this.imageConfig;
    }

    // Return existing promise if already fetching
    if (this.configPromise) {
      return this.configPromise;
    }

    // Fetch configuration if API key is provided
    if (this.apiKey) {
      try {
        this.configPromise = this.fetchImageConfig();
        this.imageConfig = await this.configPromise;
        this.configPromise = null;
        return this.imageConfig;
      } catch (error) {
        console.error('Failed to fetch TMDB configuration:', error);
        this.configPromise = null;
        // Fall back to default configuration
        return this.getFallbackConfig();
      }
    } else {
      // Use fallback configuration if no API key
      return this.getFallbackConfig();
    }
  }

  /**
   * Get the base URL for images
   */
  public async getBaseUrl(): Promise<string> {
    try {
      const config = await this.getImageConfig();
      return config.secure_base_url || this.fallbackBaseUrl;
    } catch (error) {
      return this.fallbackBaseUrl;
    }
  }

  /**
   * Get an alternate base URL (for retries)
   */
  public getAlternateBaseUrl(): string {
    return this.alternateBaseUrl;
  }

  /**
   * Build complete image URL
   */
  public async buildImageUrl(path: string, size: string): Promise<string> {
    if (!path) return '';
    
    // Normalize path (remove leading slash if present)
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    
    const baseUrl = await this.getBaseUrl();
    return `${baseUrl}${size}/${normalizedPath}`;
  }

  /**
   * Get fallback image configuration
   */
  private getFallbackConfig(): TMDBImageConfig {
    return {
      base_url: 'http://image.tmdb.org/t/p/',
      secure_base_url: 'https://image.tmdb.org/t/p/',
      backdrop_sizes: ['w300', 'w780', 'w1280', 'original'],
      logo_sizes: ['w45', 'w92', 'w154', 'w185', 'w300', 'w500', 'original'],
      poster_sizes: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'],
      profile_sizes: ['w45', 'w185', 'h632', 'original'],
      still_sizes: ['w92', 'w185', 'w300', 'original']
    };
  }

  /**
   * Fetch image configuration from TMDB API
   */
  private async fetchImageConfig(): Promise<TMDBImageConfig> {
    const response = await fetch(`${this.configUrl}?api_key=${this.apiKey}`);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.images as TMDBImageConfig;
  }
}

export const tmdbImageService = TMDBImageService.getInstance();
