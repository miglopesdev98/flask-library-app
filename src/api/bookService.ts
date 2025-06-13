import { api } from './config';

export interface Checkout {
  id: number;
  book_id: number;
  user_id: string;
  checkout_date: string;
  due_date: string;
  return_date: string | null;
  book: Book;
}

export interface Book {
  id?: number;
  title: string;
  author: string;
  isbn: string;
  published_date?: string | null;
  status?: 'available' | 'checked_out' | 'lost';
  created_at?: string;
  updated_at?: string;
  total_copies?: number;
}

export interface PaginatedBooks {
  books: Book[];
  total: number;
  page: number;
  per_page: number;
}

export const bookService = {
  // Get all books with pagination and search
  getBooks: async (page = 1, perPage = 10, search = ''): Promise<PaginatedBooks> => {
    try {
      console.log(`Fetching books - Page: ${page}, Per Page: ${perPage}, Search: "${search}"`);
      
      const response = await api.get<{ 
        items: Book[]; 
        books?: Book[]; 
        total: number; 
        current_page?: number;
        page?: number;
        per_page?: number;
        pages?: number 
      }>('/books', {
        params: { page, per_page: perPage, search },
      });
      
      console.log('Books API Response:', response.data);
      
      // Handle both response formats (items or books array)
      const books = response.data.items || response.data.books || [];
      const total = response.data.total || 0;
      const currentPage = response.data.current_page || response.data.page || page;
      const responsePerPage = response.data.per_page || perPage;
      
      return {
        books,
        total,
        page: currentPage,
        per_page: responsePerPage,
      };
      
    } catch (error) {
      console.error('Error in getBooks:', error);
      // Return a properly structured response even on error
      return {
        books: [],
        total: 0,
        page,
        per_page: perPage,
      };
    }
  },

  // Get a single book by ID
  getBook: async (id: number): Promise<Book> => {
    try {
      console.log(`Fetching book with ID: ${id}`);
      const response = await api.get<Book>(`/books/${id}`);
      console.log('Book API Response:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error(`Error fetching book with ID ${id}:`, error);
      
      if (error && typeof error === 'object') {
        const axiosError = error as {
          response?: {
            data?: unknown;
            status?: number;
            headers?: unknown;
          };
          request?: unknown;
          message?: string;
        };
        
        if (axiosError.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Response data:', axiosError.response.data);
          console.error('Response status:', axiosError.response.status);
          console.error('Response headers:', axiosError.response.headers);
        } else if (axiosError.request) {
          // The request was made but no response was received
          console.error('No response received:', axiosError.request);
        } 
        // Log any error message
        if (axiosError.message) {
          console.error('Error message:', axiosError.message);
        }
      }
      
      throw error; // Re-throw the error to be handled by the component
    }
  },

  // Create a new book
  createBook: async (book: Omit<Book, 'id'>): Promise<Book> => {
    try {
      console.log('Creating book with data:', book);
      const response = await api.post('/books', book);
      console.log('Book created successfully:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('Error creating book:', error);
      
      if (error && typeof error === 'object') {
        const axiosError = error as {
          response?: {
            data?: unknown;
            status?: number;
            statusText?: string;
            headers?: unknown;
          };
          request?: unknown;
          message?: string;
        };
        
        // Handle response errors
        if (axiosError.response) {
          console.error('Response status:', axiosError.response.status);
          console.error('Response status text:', axiosError.response.statusText);
          console.error('Response data:', axiosError.response.data);
          
          // Handle validation errors
          if (axiosError.response.data && typeof axiosError.response.data === 'object') {
            const errorData = axiosError.response.data as Record<string, unknown>;
            if (errorData.message) {
              throw new Error(`Failed to create book: ${errorData.message}`);
            } 
            if (errorData.errors) {
              const errorMessages = Object.entries(errorData.errors as Record<string, string[]>)
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('; ');
              throw new Error(`Validation failed: ${errorMessages}`);
            }
          }
          
          // Handle specific HTTP status codes
          if (axiosError.response.status === 400) {
            throw new Error('Invalid book data. Please check your input.');
          }
          if (axiosError.response.status === 401) {
            throw new Error('Authentication required. Please log in.');
          }
          if (axiosError.response.status === 403) {
            throw new Error('You do not have permission to create books.');
          }
          if (axiosError.response.status === 409) {
            throw new Error('A book with this ISBN already exists.');
          }
        }
        
        // Handle request errors (no response received)
        if (axiosError.request) {
          console.error('No response received:', axiosError.request);
          throw new Error('No response received from server. Please check your connection.');
        }
        
        // Handle other errors
        if (axiosError.message) {
          console.error('Error message:', axiosError.message);
          throw new Error(`Failed to create book: ${axiosError.message}`);
        }
      }
      
      throw new Error('An unexpected error occurred while creating the book.');
    }
  },

  // Update an existing book
  updateBook: async (id: number, book: Partial<Book>): Promise<Book> => {
    const response = await api.put(`/books/${id}`, book);
    return response.data;
  },

  // Delete a book
  deleteBook: async (id: number): Promise<void> => {
    await api.delete(`/books/${id}`);
  },

  // Check out a book
  checkoutBook: async (bookId: number, userId: string) => {
    try {
      const response = await api.post('/library/checkout', { 
        book_id: bookId, 
        user_id: userId 
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Error in checkoutBook:', error);
      
      // Handle Axios errors
      if (typeof error === 'object' && error !== null) {
        const axiosError = error as {
          response?: {
            data?: unknown;
            status?: number;
          };
          request?: unknown;
          message?: string;
        };

        if (axiosError.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Response data:', axiosError.response.data);
          console.error('Response status:', axiosError.response.status);
          
          // Safely access error message from response data
          const responseData = axiosError.response.data as { message?: string; error?: string };
          const errorMessage = responseData?.message || responseData?.error || 'Checkout failed';
          throw new Error(errorMessage);
        }
        
        if (axiosError.request) {
          // The request was made but no response was received
          console.error('No response received:', axiosError.request);
          throw new Error('No response from server. Please check your connection.');
        }
      }
      
      // Handle other types of errors
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Request error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Return a book
  returnBook: async (checkoutId: number) => {
    const response = await api.post(`/library/return/${checkoutId}`);
    return response.data;
  },

  // Get user's checkouts
  getUserCheckouts: async (userId: string, active = true): Promise<Checkout[]> => {
    try {
      const response = await api.get<Checkout[]>(`/library/user/${userId}`, {
        params: { active },
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching user checkouts:', error);
      return [];
    }
  },

  // Get overdue books
  getOverdueBooks: async () => {
    const response = await api.get('/library/overdue');
    return response.data;
  },
};
