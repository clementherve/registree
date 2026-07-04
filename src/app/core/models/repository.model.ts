export interface Repository {
  name: string;
}

export interface PaginatedResult<T> {
  items: T[];
  next: string | null;
}
