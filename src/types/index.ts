export interface Book {
  id?: number;
  title: string;
  author: string;
  isbn: string;
  published_date: string;
  status?: 'available' | 'checked_out' | 'lost';
  created_at?: string;
  updated_at?: string;
}

export interface Checkout {
  id: number;
  book_id: number;
  user_id: string;
  checkout_date: string;
  due_date: string;
  return_date: string | null;
  book: Book;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export type ApiResponse<T> = {
  data: T;
  message?: string;
  success: boolean;
};

export type ApiError = {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};
