"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10000, // Specifies how long data is considered fresh in the background. when data gonna become stale
        refetchOnMount: true, // Determines if a query should be refetched when the component mounts.
        refetchOnReconnect: true, // Defines if a query should be refetched when the network reconnects.
        refetchOnWindowFocus: true, // Determines if a query should be refetched on window focus.
        refetchInterval: 0, // Sets the interval for background refetching of queries.
        retry: true, // Configures automatic retries when a query encounters an error.
      },
      mutations: {
        //mutation = updating
        //mutations refer to operations that modify data on a server. These operations could include creating, updating, or deleting resources on a backend server or any other action that changes data.
        retry: true, // Configures automatic retries when a mutation encounters an error.
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children} <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default ReactQueryProvider;
