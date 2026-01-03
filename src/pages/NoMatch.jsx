import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  ThemeProvider,
  Grid,
  Fade
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';

import customTheme from '../theme/customTheme';

const NoMatch = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    setVisible(true);
    return () => setVisible(false);
  }, []);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Container maxWidth="md" sx={{ py: 6 }}>
          <Fade in={visible} timeout={800}>
            <Paper
              elevation={2}
              sx={{
                borderRadius: 1,
                p: { xs: 3, sm: 5 },
                backgroundColor: 'background.paper',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                textAlign: 'center',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '4px', 
                  bgcolor: 'primary.main' 
                }} 
              />
              
              <Fade in={visible} timeout={1200} style={{ transitionDelay: '300ms' }}>
                <Box>
                  <Typography 
                    variant="h1" 
                    component="h1" 
                    color="primary.main"
                    sx={{ 
                      fontSize: { xs: '4rem', sm: '6rem' },
                      fontWeight: 700,
                      mb: 2,
                      letterSpacing: '-0.05em'
                    }}
                  >
                    404
                  </Typography>
                </Box>
              </Fade>

              <Fade in={visible} timeout={1200} style={{ transitionDelay: '500ms' }}>
                <Box>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    color="primary.main"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    Page Not Found
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ mb: 4, maxWidth: '80%', mx: 'auto' }}
                  >
                    The page you are looking for doesn't exist or has been moved.
                  </Typography>
                </Box>
              </Fade>

              <Fade in={visible} timeout={1200} style={{ transitionDelay: '700ms' }}>
                <Grid 
                  container 
                  spacing={2} 
                  justifyContent="center"
                  sx={{ mt: 3 }}
                >
                  <Grid item xs={12} sm="auto">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleGoHome}
                      startIcon={<HomeIcon />}
                      sx={{ 
                        fontWeight: 500, 
                        px: 3, 
                        py: 1,
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      Go to Homepage
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm="auto">
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleGoBack}
                      startIcon={<ArrowBackIcon />}
                      sx={{ 
                        fontWeight: 500, 
                        px: 3, 
                        py: 1,
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      Go Back
                    </Button>
                  </Grid>
                </Grid>
              </Fade>

              <Fade in={visible} timeout={1200} style={{ transitionDelay: '900ms' }}>
                <Box sx={{ mt: 5, pt: 3, borderTop: 1, borderColor: 'primary.light' }}>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary"
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
                  >
                    <SearchIcon fontSize="small" /> 
                    Need help finding something? Try searching or checking the navigation menu.
                  </Typography>
                </Box>
              </Fade>
            </Paper>
          </Fade>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default NoMatch;