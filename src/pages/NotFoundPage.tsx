import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  useTheme,
} from '@mui/material';
import { Home as HomeIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="80vh"
        textAlign="center"
        p={3}
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: '6rem', sm: '8rem', md: '10rem' },
            fontWeight: 700,
            lineHeight: 1,
            color: theme.palette.primary.main,
            mb: 2,
          }}
        >
          404
        </Typography>
        
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 2,
          }}
        >
          Oops! Page not found
        </Typography>
        
        <Typography
          variant="body1"
          color="textSecondary"
          paragraph
          sx={{
            maxWidth: '600px',
            mb: 4,
          }}
        >
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </Typography>
        
        <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{
              px: 4,
              py: 1.5,
            }}
          >
            Go to Homepage
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            size="large"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              px: 4,
              py: 1.5,
            }}
          >
            Go Back
          </Button>
        </Box>
        
        <Box mt={6} width="100%" maxWidth={600}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              backgroundColor: theme.palette.grey[50],
              border: `1px solid ${theme.palette.grey[200]}`,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Looking for something specific?
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Try using the search function or browse our sitemap to find what you're looking for.
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Button
                variant="text"
                color="primary"
                size="small"
                onClick={() => navigate('/books')}
              >
                Browse Books
              </Button>
              <Button
                variant="text"
                color="primary"
                size="small"
                onClick={() => navigate('/checkout')}
              >
                Check Out a Book
              </Button>
              <Button
                variant="text"
                color="primary"
                size="small"
                onClick={() => navigate('/checkouts')}
              >
                View Checkouts
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
