import React from 'react';
import ReactDOM from 'react-dom/client';
import { getRouter } from './router';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';

// Create a single QueryClient instance for the app
const queryClient = new QueryClient();
const router = getRouter();

// Set the router's context to match the QueryClient
router.context = { queryClient };

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
