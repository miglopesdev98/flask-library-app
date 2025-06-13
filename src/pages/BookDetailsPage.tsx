import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  DialogContentText,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  KeyboardReturn as ReturnIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { bookService, Book } from '../api/bookService';
import { useAuth } from '../contexts/AuthContext';

const BookDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState<boolean>(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState<boolean>(false);
  const { user } = useAuth();
  const userId = user?.id?.toString() || '';
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [isReturning, setIsReturning] = useState<boolean>(false);
  const [activeCheckoutId, setActiveCheckoutId] = useState<number | null>(null);

  const fetchBookDetails = async () => {
    if (!id) {
      console.error('No book ID provided in URL');
      setError('No book ID provided');
      return;
    }
    
    const bookId = parseInt(id, 10);
    if (Number.isNaN(bookId)) {
      console.error('Invalid book ID:', id);
      setError('Invalid book ID');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching book with ID:', bookId);
      const data = await bookService.getBook(bookId);
      console.log('Received book data:', data);
      setBook(data);
      setError(null);
    } catch (err: unknown) {
      let errorMessage = 'Failed to load book details';
      console.error('Error fetching book:', err);
      
      if (err && typeof err === 'object') {
        const errorObj = err as {
          response?: {
            data?: {
              message?: string;
            };
          };
          message?: string;
        };
        
        errorMessage = errorObj.response?.data?.message || 
                     errorObj.message || 
                     'Failed to load book details';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const handleCheckout = async () => {
    if (!book?.id) {
      console.error('No book ID available');
      setError('Book not found');
      return;
    }
    
    if (!userId) {
      console.error('User not authenticated');
      setError('Please log in to check out books');
      navigate('/login', { state: { from: `/books/${book.id}` } });
      return;
    }
    
    try {
      setIsCheckingOut(true);
      setError(null);
      
      console.log('Attempting to check out book:', { bookId: book.id, userId });
      const response = await bookService.checkoutBook(book.id, userId);
      console.log('Checkout response:', response);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Refresh book details to show updated status
      await fetchBookDetails();
      setCheckoutDialogOpen(false);
      
      console.log('Book checked out successfully');
    } catch (err: any) {
      console.error('Error checking out book:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to check out book. Please try again.';
      setError(errorMessage);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleReturn = async () => {
    if (!activeCheckoutId) return;
    
    try {
      setIsReturning(true);
      await bookService.returnBook(activeCheckoutId);
      await fetchBookDetails(); // Refresh book details
      setReturnDialogOpen(false);
      setActiveCheckoutId(null);
    } catch (err) {
      console.error('Error returning book:', err);
      setError('Failed to return book');
    } finally {
      setIsReturning(false);
    }
  };

  const getStatusChip = (status: string) => {
    const statusMap: Record<string, { label: string; color: 'success' | 'warning' | 'error' }> = {
      available: { label: 'Available', color: 'success' },
      checked_out: { label: 'Checked Out', color: 'warning' },
      lost: { label: 'Lost', color: 'error' },
    };

    const statusInfo = statusMap[status] || { label: status, color: 'default' };
    
    return (
      <Chip
        label={statusInfo.label}
        color={statusInfo.color}
        size="small"
        sx={{ textTransform: 'capitalize' }}
      />
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !book) {
    return (
      <Box p={3}>
        <Alert severity="error">{error || 'Book not found'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/books')}
          sx={{ mt: 2 }}
        >
          Back to Books
        </Button>
      </Box>
    );
  }

  const isCheckedOut = book.status === 'checked_out';
  const isAvailable = book.status === 'available';

  return (
    <Box p={3} maxWidth="md" mx="auto">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/books')}
        sx={{ mb: 2 }}
      >
        Back to Books
      </Button>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {book.title}
            </Typography>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              by {book.author}
            </Typography>
          </Box>
          <Box>
            {getStatusChip(book.status || 'available')}
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Book Details</Typography>
                <Divider sx={{ mb: 2 }} />
                <Box mb={2}>
                  <Typography variant="subtitle2" color="textSecondary">ISBN</Typography>
                  <Typography>{book.isbn}</Typography>
                </Box>
                <Box mb={2}>
                  <Typography variant="subtitle2" color="textSecondary">Published Date</Typography>
                  <Typography>
                    {book.published_date ? format(new Date(book.published_date), 'MMMM d, yyyy') : 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Added On</Typography>
                  <Typography>
                    {book.created_at ? format(new Date(book.created_at), 'MMMM d, yyyy') : 'N/A'}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/books/${book.id}/edit`)}
                  variant="outlined"
                  size="small"
                >
                  Edit Book
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Actions</Typography>
                <Divider sx={{ mb: 2 }} />
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => setCheckoutDialogOpen(true)}
                    disabled={!isAvailable || isCheckingOut}
                  >
                    {isCheckingOut ? 'Processing...' : 'Check Out Book'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<ReturnIcon />}
                    onClick={() => {
                      // In a real app, you would find the active checkout for this book
                      setActiveCheckoutId(1); // This should be the actual checkout ID
                      setReturnDialogOpen(true);
                    }}
                    disabled={!isCheckedOut || isReturning}
                  >
                    {isReturning ? 'Processing...' : 'Return Book'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Checkout Dialog */}
      <Dialog open={checkoutDialogOpen} onClose={() => setCheckoutDialogOpen(false)}>
        <DialogTitle>Check Out Book</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to check out "{book.title}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCheckout} 
            variant="contained"
            disabled={isCheckingOut}
            startIcon={isCheckingOut ? <CircularProgress size={20} /> : null}
          >
            {isCheckingOut ? 'Checking Out...' : 'Check Out'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Return Dialog */}
      <Dialog open={returnDialogOpen} onClose={() => setReturnDialogOpen(false)}>
        <DialogTitle>Return Book</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to return "{book.title}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReturnDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleReturn} 
            variant="contained" 
            color="primary"
            disabled={isReturning}
            startIcon={isReturning ? <CircularProgress size={20} /> : null}
          >
            {isReturning ? 'Returning...' : 'Return Book'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookDetailsPage;
