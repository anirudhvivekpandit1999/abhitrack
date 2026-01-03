import React from 'react';
import { Box, Button, Typography, Container, alpha } from '@mui/material';
import { Home as HomeIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/main-logo.png';

const NotFound = () => {
  const navigate = useNavigate();
  const mainBlue = '#0B3C5D';
  const darkBlue = '#1D2D50';

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
        p: { xs: 2, sm: 4 },
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: 'center',
            background: 'white',
            borderRadius: '20px',
            p: { xs: 4, sm: 6, md: 8 },
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            border: `1px solid ${alpha(mainBlue, 0.1)}`,
          }}
        >
          {/* Logo */}
          <Box sx={{ mb: 4 }}>
            <img 
              src={logo} 
              alt="Abhitech Logo" 
              style={{ 
                maxWidth: '200px', 
                height: 'auto',
                marginBottom: '24px'
              }} 
            />
          </Box>

          {/* 404 Number */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '6rem', sm: '8rem', md: '10rem' },
              fontWeight: 900,
              background: `linear-gradient(135deg, ${mainBlue} 0%, #3282B8 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 8px rgba(0,0,0,0.1)',
              mb: 2,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            404
          </Typography>

          {/* Main Message */}
          <Typography
            variant="h3"
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              color: darkBlue,
              mb: 2,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            }}
          >
            Page Not Found
          </Typography>

          {/* Description */}
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Inter', sans-serif",
              color: alpha(darkBlue, 0.7),
              mb: 4,
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </Typography>

          {/* Action Buttons */}
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
              maxWidth: '400px',
              mx: 'auto'
            }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '30px',
                background: `linear-gradient(135deg, ${mainBlue} 0%, #3282B8 100%)`,
                textTransform: 'none',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                '&:hover': {
                  boxShadow: '0 10px 25px rgba(0,0,0,0.18)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Go to Homepage
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<ArrowBackIcon />}
              onClick={handleGoBack}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '30px',
                color: mainBlue,
                borderColor: mainBlue,
                textTransform: 'none',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: alpha(mainBlue, 0.08),
                  borderColor: mainBlue,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Go Back
            </Button>
          </Box>

          {/* Additional Help Text */}
          <Box
            sx={{
              mt: 6,
              p: 3,
              backgroundColor: alpha(mainBlue, 0.05),
              borderRadius: '12px',
              border: `1px solid ${alpha(mainBlue, 0.1)}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontFamily: "'Inter', sans-serif",
                color: alpha(darkBlue, 0.8),
                mb: 1,
                fontWeight: 600,
              }}
            >
              Need help?
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "'Inter', sans-serif",
                color: alpha(darkBlue, 0.7),
              }}
            >
              Visit our{' '}
              <Button
                variant="text"
                onClick={() => navigate('/manual')}
                sx={{
                  textTransform: 'none',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  color: mainBlue,
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline',
                  },
                }}
              >
                User Manual
              </Button>
              {' '}or return to the{' '}
              <Button
                variant="text"
                onClick={handleGoHome}
                sx={{
                  textTransform: 'none',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  color: mainBlue,
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline',
                  },
                }}
              >
                homepage
              </Button>
              {' '}to get started.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default NotFound;