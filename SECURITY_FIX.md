# API Key Security Fix - Implementation Summary

## Overview

Fixed critical security vulnerability where TMDB API key was being exposed in server error messages, URLs, and error stacks across the application.

## Root Cause

The application had **27+ instances** where `process.env.TMDB_API_KEY` was directly interpolated into request URLs and error messages in:

- Server Actions (lib/actions.ts)
- API Routes (app/api/\*\*/route.ts)

When these requests failed, the full URL (containing the API key) could be part of error stacks serialized to React Server Components or returned in API responses, exposing sensitive credentials.

## Solutions Implemented

### 1. **Secure TMDB API Wrapper** (`lib/tmdb-api.ts`)

- Created `TMDBApiError` class that sanitizes error messages
- Exposes context-specific errors without revealing API keys or URLs
- Implements `tmdbFetch()` and `tmdbPost()` functions
- Uses axios with proper timeout configuration
- All errors are caught and wrapped to prevent sensitive data leakage

**Key Functions:**

- `tmdbFetch<T>(endpoint, params, context)` - Safe GET requests
- `tmdbPost<T>(endpoint, data, context)` - Safe POST requests
- `TMDBApiError` - Sanitized error class

### 2. **API Error Handler Middleware** (`lib/api-error-handler.ts`)

- Provides `createSafeErrorResponse()` to format error responses safely
- Distinguishes between development and production modes
- Validates environment variables without exposing their values
- Includes helper: `validateTMDBApiKey()`

**Usage:**

```typescript
return createSafeErrorResponse(error, {
  context: "MyRoute",
  statusCode: 500,
  userMessage: "User-friendly error message",
});
```

### 3. **Updated Server Actions** (`lib/actions.ts`)

All 17 API calls now use the secure wrapper:

- ✅ `getSpecifiedMovie()` - Movie details
- ✅ `getSpecifiedTV()` - TV show details
- ✅ `getSpecifiedTVMovieVideos()` - Videos
- ✅ `getCreditsTVMovie()` - Credits
- ✅ `getSearchMovie()` - Search
- ✅ `getSimilarByType()` - Similar items
- ✅ `getReviewsByType()` - Reviews
- ✅ `getCategorizedReviewsByType()` - Categorized reviews
- ✅ `getWatchProvidersByType()` - Watch providers
- ✅ `getImagesByType()` - Images
- ✅ `getTVSeasonDetails()` - Season details
- ✅ `getTVEpisodeDetails()` - Episode details
- ✅ `getPersonDetails()` - Person info
- ✅ `getPersonCombinedCredits()` - Combined credits
- ✅ `getPersonImages()` - Person images
- ✅ `getExploreList()` - Explore lists
- ✅ `getExploreMediaDetails()` - Media details

### 4. **Updated API Routes**

Secured the following routes:

- ✅ `/api/search/tmdb` - Search endpoint
- ✅ `/api/search/images` - Image search (HIGH RISK - had no env validation)
- ✅ `/api/upcoming` - Upcoming movies
- ✅ `/api/explore` - Explore lists
- ✅ `/api/explore/details` - Explore details

All routes now:

1. Use `tmdbFetch()` for API calls
2. Implement proper error handling with `createSafeErrorResponse()`
3. Validate environment variables
4. Don't expose API keys in error messages

### 5. **Validation and Startup Checks**

Added environment variable validation through `getEnvVariable()` in `lib/env.ts`:

- Throws controlled error if TMDB_API_KEY is missing
- Uses `unstable_noStore()` to prevent caching of env checks

## Security Improvements

| Before                           | After                                  |
| -------------------------------- | -------------------------------------- |
| API key in URL strings           | API key only in params, wrapped safely |
| Error stacks with full URLs      | Sanitized error messages               |
| No validation in some routes     | All routes validate env vars           |
| Raw axios errors exposed         | TMDBApiError wraps and sanitizes       |
| Database connection string risks | Unified error handling                 |

## Error Message Examples

**Before (Dangerous):**

```
Failed to fetch: https://api.themoviedb.org/3/movie/123?api_key=abc123def456&...
```

**After (Safe):**

```
TMDB API Error in getSpecifiedMovie(123)
// Only in development: debug info without sensitive data
```

## Environment Variables Required

```env
TMDB_API_KEY=your_api_key_here
DATABASE_URL=your_database_url
```

## Testing Recommendations

1. **Verify Error Handling:**

   - Test API calls with invalid IDs (should show sanitized errors)
   - Check server component errors only show safe messages
   - Inspect network requests - API key should not be in URLs during errors

2. **Check Production Build:**

   - Deploy to production environment
   - Try accessing movie/TV pages that trigger API calls
   - Verify error messages don't leak sensitive data
   - Check browser console - should show sanitized errors

3. **Monitor Logs:**
   - Server logs should show full debug info
   - Client should never see raw API keys or full URLs
   - Production builds should hide detailed debug info

## Files Modified

### New Files Created:

- `lib/tmdb-api.ts` - Secure TMDB API wrapper
- `lib/api-error-handler.ts` - API error handling utilities

### Modified Files:

- `lib/actions.ts` - Updated 17 API calls to use secure wrapper
- `app/api/search/tmdb/route.ts` - Secure API route
- `app/api/search/images/route.ts` - Secure API route (was HIGH RISK)
- `app/api/upcoming/route.ts` - Secure API route
- `app/api/explore/route.ts` - Secure API route
- `app/api/explore/details/route.ts` - Secure API route

## Next Steps

1. ✅ **Deploy the fix** to all environments
2. ✅ **Monitor error logs** for any new vulnerabilities
3. ⏳ **Review other sensitive operations** (database, auth tokens)
4. ⏳ **Consider adding error tracking service** (Sentry, LogRocket) for better monitoring

## References

- Next.js Server Component Security: https://nextjs.org/docs/app/building-your-application/rendering/server-components
- Error Boundary Documentation: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
- TMDB API: https://developer.themoviedb.org/docs
