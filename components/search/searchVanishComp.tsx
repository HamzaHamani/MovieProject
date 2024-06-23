"use client";

import { useRouter } from "next/navigation";
import { PlaceholdersAndVanishInput } from "../ui/PlaceholdersAndVanishInput";
import { useEffect, useState } from "react";

export function SearchVanishComp() {
  const router = useRouter();

  const [originUrl, setOriginUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOriginUrl(window.location.origin);
    }
  }, []);
  const placeholders = [
    "Search for a movie...",
    "Find your favorite TV show...",
    "Discover new releases...",
    "What's trending now?",
    "Explore top-rated films...",
    "Find a classic movie...",
    "Search for a TV series...",
    "What's popular this week?",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {};
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    //TODO add search functionality with the TMDB api, push user to movie with its own id
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get("search");

    if (searchValue) {
      router.push(`${originUrl}/search/${searchValue}?page=1`);
    }
  };
  return (
    <PlaceholdersAndVanishInput
      placeholders={placeholders}
      onChange={handleChange}
      onSubmit={onSubmit}
    />
  );
}
