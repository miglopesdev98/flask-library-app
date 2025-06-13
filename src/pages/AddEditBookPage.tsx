import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { bookService, Book } from '../api/bookService';
import BookForm from '../components/BookForm';

const AddEditBookPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Fetch book data if in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchBook = async () => {
      try {
        setLoading(true);
        if (id) {
          const data = await bookService.getBook(parseInt(id));
          setBook(data);
        }
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Failed to load book data');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, isEditMode]);

  const handleSubmit = async (values: Omit<Book, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setSubmitting(true);
      setError(null);
      
      console.log('Submitting form with values:', values);
      
      // Format data to match backend schema
      const bookData: Omit<Book, 'id' | 'created_at' | 'updated_at' | 'status'> = {
        title: values.title.trim(),
        author: values.author.trim(),
        isbn: values.isbn.trim(),
        // Only include published_date if it has a value
        ...(values.published_date && { published_date: values.published_date }),
        // Default values for required fields not in the form
        total_copies: 1
      };
      
      console.log('Sending to backend:', bookData);
      
      if (isEditMode && id) {
        // Update existing book
        console.log('Updating book with ID:', id);
        await bookService.updateBook(parseInt(id, 10), bookData);
      } else {
        // Create new book
        console.log('Creating new book');
        await bookService.createBook(bookData);
      }
      
      // Redirect to book list on success
      navigate('/books');
    } catch (err: unknown) {
      console.error('Error saving book:', err);
      let errorMessage = 'Failed to save book. Please try again.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = String(err.message);
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  // If in edit mode but couldn't load the book
  if (isEditMode && !book && !loading) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Book not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton 
          onClick={() => navigate(-1)}
          sx={{ mr: 1 }}
          aria-label="go back"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Book' : 'Add New Book'}
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <BookForm
          initialValues={book || undefined}
          onSubmit={handleSubmit}
          isSubmitting={submitting}
          title={isEditMode ? 'Edit Book Details' : 'Add New Book'}
          submitButtonText={isEditMode ? 'Update Book' : 'Add Book'}
        />
      </Paper>
    </Box>
  );
};

export default AddEditBookPage;
