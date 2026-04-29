/**
 * Secure TMDB API wrapper that prevents API key leakage in error messages
 * and error stacks. All API calls should go through these utilities.
 */

import axios, { AxiosError } from "axios";
import { getEnvVariable } from "./env";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

/**
 * Custom error class that sanitizes error messages to prevent
 * accidental exposure of API keys or sensitive data
 */
export class TMDBApiError extends Error {
  constructor(originalError: unknown, context: string) {
    let message = `TMDB API Error in ${context}`;

    // Extract user-friendly error info without exposing sensitive URLs/keys
    if (axios.isAxiosError(originalError)) {
      const status = originalError.response?.status;
      const data = originalError.response?.data as any;

      if (status === 401) {
        message = "TMDB authentication failed";
      } else if (status === 404) {
        message = "Resource not found on TMDB";
      } else if (status === 429) {
        message = "TMDB rate limit exceeded";
      } else if (data?.status_message) {
        message = `TMDB Error: ${data.status_message}`;
      } else if (originalError.message) {
        // Only use axio message if it doesn't contain URLs
        if (
          !originalError.message.includes("http") &&
          !originalError.message.includes("api_key")
        ) {
          message = originalError.message;
        }
      }
    } else if (originalError instanceof Error) {
      // For non-axios errors, only use message if safe
      if (
        !originalError.message.includes("http") &&
        !originalError.message.includes("api_key") &&
        !originalError.message.includes("DATABASE")
      ) {
        message = originalError.message;
      }
    }

    super(message);
    this.name = "TMDBApiError";
  }
}

interface TMDBRequestOptions {
  timeout?: number;
  retries?: number;
}

/**
 * Make a secure TMDB API GET request
 * @param endpoint - API endpoint path (e.g., '/movie/123')
 * @param params - Query parameters
 * @param context - Context string for error messages
 * @param opts - Request options
 */
export async function tmdbFetch<T>(
  endpoint: string,
  params: Record<string, any> = {},
  context: string = "TMDB Request",
  opts: TMDBRequestOptions = {},
): Promise<T> {
  try {
    const apiKey = getEnvVariable("TMDB_API_KEY");

    // Use headers instead of URL params for sensitive data
    const response = await axios.get<T>(`${TMDB_BASE_URL}${endpoint}`, {
      params: {
        ...params,
        api_key: apiKey, // Keep in params for TMDB compatibility
      },
      timeout: opts.timeout || 10000,
    });

    return response.data;
  } catch (error) {
    throw new TMDBApiError(error, context);
  }
}

/**
 * Make a secure TMDB API POST request
 * @param endpoint - API endpoint path
 * @param data - Request body
 * @param context - Context string for error messages
 * @param opts - Request options
 */
export async function tmdbPost<T>(
  endpoint: string,
  data: any = {},
  context: string = "TMDB POST Request",
  opts: TMDBRequestOptions = {},
): Promise<T> {
  try {
    const apiKey = getEnvVariable("TMDB_API_KEY");

    const response = await axios.post<T>(`${TMDB_BASE_URL}${endpoint}`, data, {
      params: { api_key: apiKey },
      timeout: opts.timeout || 10000,
    });

    return response.data;
  } catch (error) {
    throw new TMDBApiError(error, context);
  }
}
