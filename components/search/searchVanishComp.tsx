"use client";

import { useRouter } from "next/navigation";
import { PlaceholdersAndVanishInput } from "../ui/PlaceholdersAndVanishInput";
import { useEffect, useState } from "react";
import usePage from "@/hooks/usePage";

export function SearchVanishComp({ className }: { className?: string }) {
  const router = useRouter();
  const { setPage } = usePage();
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
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get("search");
    setPage(1);

    //TODO add loading indicator between routes, if loading appear while searching movies tryn adding back ?page=1
    if (searchValue) {
      router.push(`${originUrl}/search/${searchValue}`);
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
