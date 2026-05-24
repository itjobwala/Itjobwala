import type { QueryClient } from '@tanstack/react-query';

let _client: QueryClient | null = null;

export function setQueryClient(client: QueryClient): void {
  _client = client;
}

export function clearQueryCache(): void {
  _client?.clear();
}

export function getQueryClient(): QueryClient | null {
  return _client;
}
