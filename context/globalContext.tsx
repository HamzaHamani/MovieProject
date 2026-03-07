"use client";
import React, { useState } from "react";

interface IGlobalContextProps {
  page: number;
  setPage: (page: number) => void;
}

export const GlobalContext = React.createContext<IGlobalContextProps>({
  page: 1, // Initial page state
  setPage: () => {},
});

export const GlobalContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentPage, setCurrentPage] = useState(1); // Initial page state

  return (
    <GlobalContext.Provider
      value={{
        page: currentPage,
        setPage: setCurrentPage,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
