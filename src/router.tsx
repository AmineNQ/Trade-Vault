import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

let queryClientInstance: QueryClient | null = null;

export const getQueryClient = () => {
  if (!queryClientInstance) {
    queryClientInstance = new QueryClient();
  }
  return queryClientInstance;
};

export const getRouter = (queryClient?: QueryClient) => {
  const qc = queryClient || getQueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient: qc },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
