/**
 * SEO Utilities for Consistent Metadata Generation
 */

import { Metadata } from 'next'
import { SITE_URL, SITE_NAME } from '@/config/site'

interface PageMetadataProps {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'profile'
  publishedTime?: string
  authors?: string[]
}

interface MovieMetadataProps {
  title: string
  releaseYear?: number
  overview?: string
  posterPath?: string
  rating?: number
  genres?: string[]
}

interface ReviewMetadataProps {
  movieTitle: string
  movieImage?: string
  reviewTitle?: string
  reviewExcerpt?: string
  authorName?: string
  rating?: number
}

interface ProfileMetadataProps {
  username: string
  bio?: string
  profileImage?: string
  followerCount?: number
}

export function generatePageMetadata({
  title,
  description,
  canonical,
  ogImage = `${SITE_URL}/og-image.jpg`,
  ogType = 'website',
  publishedTime,
  authors,
}: PageMetadataProps): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`
  const url = canonical || SITE_URL

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      title,
      description,
      type: ogType as any,
      url,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: SITE_NAME,
      locale: 'en_US',
      ...(publishedTime && { publishedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
    ...(authors && { authors: authors.map(name => ({ name })) }),
  }
}

export function generateMovieMetadata({
  title,
  releaseYear,
  overview,
  posterPath,
  rating,
  genres,
}: MovieMetadataProps): Metadata {
  const fullTitle = releaseYear ? `${title} (${releaseYear})` : title
  const description = overview || `Watch ${title} on ${SITE_NAME}`
  const ogImage = posterPath 
    ? `https://image.tmdb.org/t/p/w1280${posterPath}`
    : `${SITE_URL}/og-image.jpg`

  return generatePageMetadata({
    title: fullTitle,
    description,
    ogImage,
    ogType: 'website',
  })
}

export function generateReviewMetadata({
  movieTitle,
  movieImage,
  reviewTitle,
  reviewExcerpt,
  authorName,
  rating,
}: ReviewMetadataProps): Metadata {
  const title = reviewTitle || `Review: ${movieTitle}`
  const description = reviewExcerpt || `Read the review for ${movieTitle} on ${SITE_NAME}`
  const ogImage = movieImage
    ? `https://image.tmdb.org/t/p/w1280${movieImage}`
    : `${SITE_URL}/og-image.jpg`

  return generatePageMetadata({
    title,
    description,
    ogImage,
    ogType: 'article',
    authors: authorName ? [authorName] : undefined,
  })
}

export function generateProfileMetadata({
  username,
  bio,
  profileImage,
}: ProfileMetadataProps): Metadata {
  const title = `@${username}`
  const description = bio || `${username}'s profile on ${SITE_NAME}`
  const ogImage = profileImage || `${SITE_URL}/og-image.jpg`

  return generatePageMetadata({
    title,
    description,
    ogImage,
    ogType: 'profile',
  })
}

/**
 * Movie JSON-LD Schema
 */
export function movieSchema({
  id,
  title,
  releaseYear,
  overview,
  posterPath,
  rating,
  genres,
}: MovieMetadataProps & { id: string | number }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    '@id': `${SITE_URL}/movie/${id}#movie`,
    name: title,
    image: posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : undefined,
    datePublished: releaseYear ? `${releaseYear}-01-01` : undefined,
    description: overview,
    aggregateRating: rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: (rating / 2).toFixed(1), // Convert out of 10 to out of 5
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    genre: genres || [],
    url: `${SITE_URL}/movie/${id}`,
  }
}

/**
 * Review JSON-LD Schema
 */
export function reviewSchema({
  movieTitle,
  movieId,
  reviewTitle,
  reviewExcerpt,
  authorName,
  rating,
  reviewId,
}: {
  movieTitle: string
  movieId?: string | number
  reviewTitle?: string
  reviewExcerpt?: string
  authorName?: string
  rating?: number
  reviewId?: string | number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    '@id': `${SITE_URL}/review/${reviewId}#review`,
    name: reviewTitle || `Review of ${movieTitle}`,
    description: reviewExcerpt,
    author: authorName
      ? {
          '@type': 'Person',
          name: authorName,
        }
      : undefined,
    reviewRating: rating
      ? {
          '@type': 'Rating',
          ratingValue: rating,
          bestRating: 10,
          worstRating: 1,
        }
      : undefined,
    itemReviewed: {
      '@type': 'Movie',
      name: movieTitle,
      ...(movieId && { url: `${SITE_URL}/movie/${movieId}` }),
    },
  }
}

/**
 * Person JSON-LD Schema (for profiles)
 */
export function personSchema({
  id,
  name,
  username,
  bio,
  profileImage,
}: {
  id?: string | number
  name: string
  username: string
  bio?: string
  profileImage?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/profile/${username}#person`,
    name,
    description: bio,
    image: profileImage,
    url: `${SITE_URL}/profile/${username}`,
  }
}
