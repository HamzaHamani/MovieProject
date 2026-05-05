#!/usr/bin/env python3
"""Fix auth image showing on home page"""

file_path = "components/landing/landingBackdropCarouselClient.tsx"

with open(file_path, 'r') as f:
    content = f.read()

# Replace the code section
old_code = """  const currentMovie = movies[currentIndex];
  const backdropSrc = currentMovie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}`
    : "/authBG.webp";

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Carousel */}
      <div className="relative h-full min-h-screen w-full">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <Image
            src={backdropSrc}
            alt={currentMovie.title || currentMovie.name || "Movie backdrop"}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </motion.div>"""

new_code = """  const currentMovie = movies[currentIndex];
  const hasBackdrop = !!currentMovie.backdrop_path;

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Carousel */}
      <div className="relative h-full min-h-screen w-full">
        {hasBackdrop && (
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <Image
              src={`https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}`}
              alt={currentMovie.title || currentMovie.name || "Movie backdrop"}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </motion.div>
        )}"""

if old_code in content:
    content = content.replace(old_code, new_code)
    with open(file_path, 'w') as f:
        f.write(content)
    print("✓ File updated successfully!")
else:
    print("✗ Old code pattern not found in file")
