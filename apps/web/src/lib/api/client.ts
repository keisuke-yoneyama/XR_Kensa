export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

// For now, API modules return local mock data.
// When apps/api is ready, each module can swap its handler implementation.
export async function apiClient<T>(
  handler: () => Promise<T> | T,
  _options: ApiRequestOptions = {},
): Promise<T> {
  return await handler();
}