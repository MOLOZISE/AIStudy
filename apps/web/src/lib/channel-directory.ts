export const CHANNEL_LIST_QUERY = {
  // Keep this within the server-side zod max(100).
  limit: 100,
  offset: 0,
} as const;
