import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  MenuBook as BookIcon,
  CheckCircle as CheckoutIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { bookService } from '../api/bookService';

const HomePage: React.FC = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    checkedOutBooks: 0,
    overdueBooks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would have an API endpoint for these stats
        // For now, we'll simulate it with multiple API calls
        const [booksData, overdueData] = await Promise.all([
          bookService.getBooks(1, 1, ''), // Just to get total count
          bookService.getOverdueBooks(),
        ]);
        
        // This is a simplified version - in a real app, the API would provide these numbers
        setStats({
          totalBooks: booksData.total || 0,
          availableBooks: Math.floor(booksData.total * 0.7), // Simulated
          checkedOutBooks: Math.floor(booksData.total * 0.25), // Simulated
          overdueBooks: overdueData.length || 0,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color,
    action,
    actionText 
  }: { 
    title: string; 
    value: number | string; 
    icon: React.ReactNode;
    color: string;
    action?: () => void;
    actionText?: string;
  }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {loading ? <CircularProgress size={24} /> : value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}1a`, // Add opacity to the color
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
            }}
          >
            {React.cloneElement(icon as React.ReactElement, { fontSize: 'large' })}
          </Box>
        </Box>
      </CardContent>
      {action && actionText && (
        <CardActions>
          <Button 
            size="small" 
            onClick={action}
            startIcon={React.cloneElement(icon as React.ReactElement, { fontSize: 'small' })}
            sx={{ color }}
          >
            {actionText}
          </Button>
        </CardActions>
      )}
    </Card>
  );

  const QuickAction = ({ 
    icon, 
    title, 
    description, 
    buttonText, 
    onClick,
    color = 'primary' 
  }: { 
    icon: React.ReactNode; 
    title: string; 
    description: string; 
    buttonText: string; 
    onClick: () => void;
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  }) => (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      }}
    >
      <Box 
        sx={{
          backgroundColor: `${color}.light`,
          color: `${color}.contrastText`,
          borderRadius: '50%',
          width: 56,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        {React.cloneElement(icon as React.ReactElement, { fontSize: 'large' })}
      </Box>
      <Typography variant="h6" component="h3" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph sx={{ flexGrow: 1 }}>
        {description}
      </Typography>
      <Box>
        <Button 
          variant="outlined" 
          color={color}
          onClick={onClick}
          fullWidth
        >
          {buttonText}
        </Button>
      </Box>
    </Paper>
  );

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {error && (
        <Box mb={3}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* Stats Cards */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          Library Overview
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Total Books" 
              value={stats.totalBooks} 
              icon={<BookIcon />} 
              color="#3f51b5"
              action={() => navigate('/books')}
              actionText="View All Books"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Available" 
              value={stats.availableBooks} 
              icon={<CheckCircleIcon />} 
              color="#4caf50"
              action={() => navigate('/checkout')}
              actionText="Check Out"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Checked Out" 
              value={stats.checkedOutBooks} 
              icon={<HistoryIcon />} 
              color="#ff9800"
              action={() => navigate('/checkouts')}
              actionText="View Checkouts"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Overdue" 
              value={stats.overdueBooks} 
              icon={<WarningIcon />} 
              color="#f44336"
              action={() => navigate('/overdue')}
              actionText="View Overdue"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Quick Actions */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <QuickAction
              icon={<AddIcon />}
              title="Add New Book"
              description="Add a new book to the library collection"
              buttonText="Add Book"
              onClick={() => navigate('/books/new')}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <QuickAction
              icon={<SearchIcon />}
              title="Find a Book"
              description="Search our collection for available books"
              buttonText="Search Books"
              onClick={() => navigate('/books')}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <QuickAction
              icon={<CheckoutIcon />}
              title="Check Out a Book"
              description="Check out a book for a library member"
              buttonText="Check Out"
              onClick={() => navigate('/checkout')}
              color="success"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Recent Activity */}
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Recent Activity
          </Typography>
          <Button
            size="small"
            onClick={() => navigate('/checkouts')}
          >
            View All
          </Button>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="body1" color="textSecondary" align="center">
            Recent checkouts and returns will appear here
          </Typography>
          <Box display="flex" justifyContent="center" mt={2}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/checkouts')}
              startIcon={<HistoryIcon />}
            >
              View All Checkouts
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default HomePage;
