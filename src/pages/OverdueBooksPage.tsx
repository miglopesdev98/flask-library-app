import React, { useState, useEffect } from 'react';
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
  TablePagination,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { format, parseISO, isAfter } from 'date-fns';
import { bookService, Checkout } from '../api/bookService';

const OverdueBooksPage: React.FC = () => {
  const [overdueCheckouts, setOverdueCheckouts] = useState<Checkout[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [sendingReminders, setSendingReminders] = useState<number[]>([]);
  const navigate = useNavigate();

  const fetchOverdueBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, you would fetch overdue books from the API
      // This is a simplified version that fetches all checkouts and filters them
      const data = await bookService.getOverdueBooks();
      
      // Filter for overdue books (in a real app, the API would handle this)
      const now = new Date();
      const overdue = data.filter(
        (checkout: Checkout) => 
          !checkout.return_date && 
          isAfter(now, parseISO(checkout.due_date))
      );
      
      setOverdueCheckouts(overdue);
      setTotal(overdue.length);
    } catch (err) {
      console.error('Error fetching overdue books:', err);
      setError('Failed to load overdue books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdueBooks();
  }, []);

  const handleSendReminder = async (checkoutId: number) => {
    try {
      setSendingReminders((prevReminders) => [...prevReminders, checkoutId]);
      
      // In a real app, you would call an API endpoint to send a reminder
      // await bookService.sendReminder(checkoutId);
      
      // For demo purposes, we'll just show a success message
      // In a real app, you might want to update the UI to show the reminder was sent
      console.log(`Reminder sent for checkout ${checkoutId}`);
    } catch (err) {
      console.error('Error sending reminder:', err);
      setError('Failed to send reminder');
    } finally {
      setSendingReminders((prevReminders) => prevReminders.filter((id) => id !== checkoutId));
    }
  };

  const handleSendAllReminders = async () => {
    // In a real app, you would implement this to send reminders for all overdue books
    alert('This would send reminders for all overdue books in a real implementation');
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = parseISO(dueDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - due.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Pagination
  const paginatedCheckouts = overdueCheckouts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading && overdueCheckouts.length === 0) {
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
          Overdue Books
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            {overdueCheckouts.length} Overdue Book{overdueCheckouts.length !== 1 ? 's' : ''}
          </Typography>
          <Button
            variant="contained"
            color="warning"
            startIcon={<EmailIcon />}
            onClick={handleSendAllReminders}
            disabled={overdueCheckouts.length === 0}
          >
            Send Reminders to All
          </Button>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {overdueCheckouts.length === 0 ? (
          <Box textAlign="center" py={4}>
            <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Overdue Books
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Great news! There are currently no overdue books in the system.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Book</TableCell>
                    <TableCell>Borrower</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Days Overdue</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedCheckouts.map((checkout) => (
                    <TableRow 
                      key={checkout.id} 
                      hover
                      sx={{
                        backgroundColor: isAfter(new Date(), parseISO(checkout.due_date)) 
                          ? 'rgba(255, 0, 0, 0.02)' 
                          : 'inherit'
                      }}
                    >
                      <TableCell>
                        <Typography variant="subtitle2">
                          {checkout.book?.title || 'Unknown Book'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          by {checkout.book?.author || 'Unknown Author'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <PersonIcon color="action" sx={{ mr: 1 }} />
                          <Box>
                            <Typography variant="body2">
                              {checkout.user_id || 'Unknown User'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              ID: {checkout.user_id?.substring(0, 8)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {format(parseISO(checkout.due_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<WarningIcon />}
                          label={`${getDaysOverdue(checkout.due_date)} days`}
                          color="error"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Send Email">
                            <IconButton size="small" color="primary">
                              <EmailIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Call">
                            <IconButton size="small" color="primary">
                              <PhoneIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleSendReminder(checkout.id)}
                          disabled={sendingReminders.includes(checkout.id)}
                          startIcon={
                            sendingReminders.includes(checkout.id) ? (
                              <CircularProgress size={16} />
                            ) : (
                              <EmailIcon />
                            )
                          }
                        >
                          {sendingReminders.includes(checkout.id) ? 'Sending...' : 'Remind'}
                        </Button>
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
          Overdue Books Report
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          This report shows all books that are currently overdue. You can send reminders to users 
          who have not returned their books by the due date.
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={() => window.print()}
          >
            Print Report
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              // In a real app, this would export to CSV or PDF
              alert('This would export the report in a real implementation');
            }}
          >
            Export
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OverdueBooksPage;
