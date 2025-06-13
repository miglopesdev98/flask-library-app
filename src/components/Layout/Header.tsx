import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Material-UI Components
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const buttonSx = {
    color: 'white',
    borderColor: 'white',
    '&:hover': { borderColor: 'rgba(255, 255, 255, 0.7)' }
  };
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: 'calc(100% - 240px)' },
        ml: { sm: '240px' }
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Typography variant="h6" noWrap component="div">
            Book Management System
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isAuthenticated ? (
              <>
                <Typography variant="body1" component="span">
                  Welcome, {user?.name || 'User'}
                </Typography>
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  size="small"
                  variant="outlined"
                  sx={buttonSx}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                color="inherit"
                onClick={() => { navigate('/login'); }}
                size="small"
                variant="outlined"
                sx={buttonSx}
              >
                Login
              </Button>
            )}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
