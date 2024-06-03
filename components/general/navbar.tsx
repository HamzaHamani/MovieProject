import React from "react";
import { Button } from "../ui/button";

type Props = {};

export default function Navbar({}: Props) {
  return (
    <nav className="flex bg-red-50 justify-around p-4">
      <div>Logo</div>
      <ul className="flex gap-7 items-center">
        <li>Home</li>
        <li>Explore</li>
        <li>Saved</li>
        <li>Search</li>
      </ul>
      <Button>Get Started</Button>
    </nav>
  );
}
