import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  TablePagination,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Book as BookIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { format, parseISO, isAfter } from 'date-fns';
import { bookService, Checkout } from '../api/bookService';
import { useAuth } from '../contexts/AuthContext';

const CheckoutsPage: React.FC = () => {
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [returningId, setReturningId] = useState<number | null>(null);
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuth();
  const userId = user?.id;

  const fetchCheckouts = async () => {
    if (!isAuthenticated || !userId) {
      setError('Please log in to view your checkouts');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await bookService.getUserCheckouts(userId.toString(), true);
      setCheckouts(Array.isArray(data) ? data : []);
      setTotal(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      console.error('Error fetching checkouts:', err);
      setError('Failed to load checkouts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckouts();
  }, [userId]);

  const handleReturnBook = async (checkoutId: number) => {
    try {
      setReturningId(checkoutId);
      await bookService.returnBook(checkoutId);
      // Refresh the list after successful return
      await fetchCheckouts();
    } catch (err) {
      console.error('Error returning book:', err);
      setError('Failed to return book');
    } finally {
      setReturningId(null);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isOverdue = (dueDate: string) => {
    return isAfter(new Date(), parseISO(dueDate));
  };

  const getStatusChip = (checkout: Checkout) => {
    if (checkout.return_date) {
      return (
        <Chip
          icon={<CheckIcon />}
          label="Returned"
          color="success"
          size="small"
          variant="outlined"
        />
      );
    } else if (isOverdue(checkout.due_date)) {
      return (
        <Chip
          icon={<WarningIcon />}
          label="Overdue"
          color="error"
          size="small"
        />
      );
    } else {
      return (
        <Chip
          label="Checked Out"
          color="primary"
          size="small"
          variant="outlined"
        />
      );
    }
  };

  // Pagination
  const paginatedCheckouts = checkouts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading && checkouts.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          My Checked Out Books
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Current Checkouts</Typography>
          <Button
            variant="outlined"
            startIcon={<BookIcon />}
            onClick={() => navigate('/checkout')}
          >
            Check Out Another Book
          </Button>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {checkouts.length === 0 ? (
          <Box textAlign="center" py={4}>
            <BookIcon color="action" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No books checked out
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              You don't have any books checked out at the moment.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/checkout')}
            >
              Find a Book to Check Out
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Book</TableCell>
                    <TableCell>Author</TableCell>
                    <TableCell>Checked Out</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedCheckouts.map((checkout) => (
                    <TableRow key={checkout.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {checkout.book?.title || 'Unknown Book'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          ISBN: {checkout.book?.isbn || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>{checkout.book?.author || 'N/A'}</TableCell>
                      <TableCell>
                        {format(parseISO(checkout.checkout_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {format(parseISO(checkout.due_date), 'MMM d, yyyy')}
                          {isOverdue(checkout.due_date) && (
                            <Tooltip title="Overdue">
                              <WarningIcon color="error" fontSize="small" sx={{ ml: 1 }} />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{getStatusChip(checkout)}</TableCell>
                      <TableCell align="right">
                        {!checkout.return_date && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleReturnBook(checkout.id)}
                            disabled={returningId === checkout.id}
                            startIcon={
                              returningId === checkout.id ? (
                                <CircularProgress size={16} />
                              ) : null
                            }
                          >
                            {returningId === checkout.id ? 'Returning...' : 'Return'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Need Help?
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          If you have any questions about your checkouts or need assistance, please contact our support team.
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/contact')}>
          Contact Support
        </Button>
      </Paper>
    </Box>
  );
};

export default CheckoutsPage;
