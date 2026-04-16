export type SortDirection = 'asc' | 'desc';

export interface Cursor {
  id: string;
  createdAt: Date;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  cursor: Cursor | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
  timestamp: string;
}
