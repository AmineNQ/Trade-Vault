import React from 'react';
import ReactDOM from 'react-dom/client';
import { getRouter, getQueryClient } from './router';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';

// Get the single QueryClient instance
const queryClient = getQueryClient();

// Create router with the same QueryClient
const router = getRouter(queryClient);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
