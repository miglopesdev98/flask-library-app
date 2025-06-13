import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  CardActions,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { bookService, Book } from '../api/bookService';

const CheckoutPage: React.FC = () => {
  const [isbn, setIsbn] = useState<string>('');
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const navigate = useNavigate();

  // In a real app, you'd get the user ID from auth context
  useEffect(() => {
    setUserId('current-user-id'); // Replace with actual user ID from auth context
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isbn.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Search for the book by ISBN
      const data = await bookService.getBooks(1, 1, isbn);
      
      if (data.books.length === 0) {
        setError('No book found with this ISBN');
        setBook(null);
        return;
      }
      
      const foundBook = data.books[0];
      setBook(foundBook);
      
      if (foundBook.status !== 'available') {
        setError('This book is not available for checkout');
      }
    } catch (err) {
      console.error('Error searching for book:', err);
      setError('Failed to search for book');
      setBook(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!book?.id || !userId) return;
    
    try {
      setIsCheckingOut(true);
      setError(null);
      
      await bookService.checkoutBook(book.id, userId);
      
      setSuccess(`Successfully checked out "${book.title}"`);
      setBook(null);
      setIsbn('');
    } catch (err) {
      console.error('Error checking out book:', err);
      setError('Failed to check out book. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <Box p={3} maxWidth="md" mx="auto">
      <Typography variant="h4" component="h1" gutterBottom>
        Check Out a Book
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Find a Book by ISBN
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
          <Box display="flex" gap={2} alignItems="flex-start">
            <TextField
              fullWidth
              variant="outlined"
              label="Enter ISBN"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="e.g., 978-3-16-148410-0"
              disabled={loading || isCheckingOut}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!isbn.trim() || loading || isCheckingOut}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{ minWidth: '120px', height: '56px' }}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {book && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {book.title}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                by {book.author}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                ISBN: {book.isbn}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Published: {book.published_date ? new Date(book.published_date).toLocaleDateString() : 'N/A'}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                color="primary"
                onClick={() => navigate(`/books/${book.id}`)}
              >
                View Details
              </Button>
            </CardActions>
          </Card>
        )}

        {book && book.status === 'available' && (
          <Box mt={3} pt={2} borderTop={1} borderColor="divider">
            <Typography variant="subtitle1" gutterBottom>
              Ready to check out this book?
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                label="Your User ID"
                variant="outlined"
                size="small"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={isCheckingOut}
                sx={{ flexGrow: 1, maxWidth: '300px' }}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={
                  isCheckingOut ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <CheckCircleIcon />
                  )
                }
                onClick={handleCheckout}
                disabled={!userId.trim() || isCheckingOut}
              >
                {isCheckingOut ? 'Processing...' : 'Check Out'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              My Checkouts
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              View and manage your currently checked out books.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate('/checkouts')}
              fullWidth
            >
              View My Checkouts
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Book Catalog
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Browse our collection of available books.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate('/books')}
              fullWidth
            >
              View All Books
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CheckoutPage;
