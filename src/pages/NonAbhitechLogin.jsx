import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Grid, InputAdornment, IconButton, alpha } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import logo from '../assets/main-logo.png';
import logo2 from '../assets/login.png';
import { useAuth } from '../hooks/useAuth';
import { config } from '../../config';
import { storeAuthData, clearAuthData, isAuthenticated, USER_TYPES } from '../utils/authUtils';

const GOOGLE_CLIENT_ID = config.GoogleClientId;

const Login = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const mainBlue = '#0B3C5D';
  const darkBlue = '#1D2D50';

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/full-excel-file', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    clearAuthData();

    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('https://abhistat.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404 || (data.detail && data.detail.toLowerCase().includes('not found'))) {
          setError('User not found. Redirecting to signup...');
          setTimeout(() => {
            navigate('/non-abhitech-signup');
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
          }, 1500);
          return;
        }
        throw new Error(data.detail || data.message || 'Login failed');
      }

      const userData = data.user || { email: data.email, name: data.name };
      const success = storeAuthData(userData, data.access_token, USER_TYPES.EXTERNAL);

      if (!success) {
        throw new Error('Failed to store authentication data');
      }

      if (auth?.loginUser?.mutateAsync) {
        try {
          await auth.loginUser.mutateAsync({
            email: userData.email,
            token: data.access_token
          });
        } catch (authError) {
          console.warn('Auth context update failed:', authError);
        }
      }

      navigate('/data-file-checks', { replace: true });

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    console.log('Google Credential Response:', credentialResponse);

    try {
      const res = await fetch('https://abhistat.com/api/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });

      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 404 || (data.detail && data.detail.toLowerCase().includes('not found'))) {
          setError('Google account not found. Redirecting to signup...');
          setTimeout(() => {
            navigate('/non-abhitech-signup');
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
          }, 1500);
          return;
        }
        throw new Error(data.detail || data.message || 'Google login failed');
      }

      const userData = data.user || { email: data.email, name: data.name };
      const success = storeAuthData(userData, data.access_token, USER_TYPES.EXTERNAL);

      if (!success) {
        throw new Error('Failed to store authentication data');
      }
      
      navigate('/data-file-checks', { replace: true });

    } catch (err) {
      console.error('Google OAuth error:', err);
      setError(err.message);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
          p: { xs: 2, sm: 4, md: 6 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: '1200px',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            border: `1px solid ${alpha(mainBlue, 0.1)}`,
          }}
        >
          <Grid container>
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                background: 'linear-gradient(135deg, #0B3C5D 0%, #1D2D50 100%)',
                color: 'white',
                p: { xs: 4, md: 6 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    mb: 2,
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                  }}
                >
                  Welcome to <br />
                  Abhitech Statistical Tool
                </Typography>
              </Box>
              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  '& img': {
                    maxWidth: '100%',
                    height: 'auto',
                  },
                  mt: 6
                }}
              >
                <a href="https://abhitechenergycon.com/" target="_blank" rel="noreferrer">
                  <img src={logo2} alt="Illustration" />
                </a>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                p: { xs: 4, md: 6 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                bgcolor: 'white',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mb: 6,
                  '& img': {
                    maxWidth: '200px',
                    height: 'auto',
                  },
                }}
              >
                <a href="https://abhitechenergycon.com/" target="_blank" rel="noreferrer">
                  <img src={logo} alt="Abhitech Logo" />
                </a>
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  color: darkBlue,
                  mb: 2,
                  textAlign: 'center',
                }}
              >
                Log in to your account
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  color: alpha(darkBlue, 0.7),
                  mb: 4,
                  textAlign: 'center',
                }}
              >
                Access your data analysis tools and dashboards
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      '& fieldset': {
                        borderColor: alpha(darkBlue, 0.2),
                      },
                      '&:hover fieldset': {
                        borderColor: mainBlue,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: mainBlue,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: alpha(darkBlue, 0.7),
                      fontFamily: "'Inter', sans-serif",
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: mainBlue,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(v => !v)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      '& fieldset': {
                        borderColor: alpha(darkBlue, 0.2),
                      },
                      '&:hover fieldset': {
                        borderColor: mainBlue,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: mainBlue,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: alpha(darkBlue, 0.7),
                      fontFamily: "'Inter', sans-serif",
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: mainBlue,
                    },
                  }}
                />
                {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
                <Button
                  variant="contained"
                  fullWidth
                  type="submit"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: '30px',
                    background: loading
                      ? 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)'
                      : 'linear-gradient(135deg, #0B3C5D 0%, #3282B8 100%)',
                    textTransform: 'none',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    fontSize: '1rem',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                    '&:hover': {
                      boxShadow: '0 10px 25px rgba(0,0,0,0.18)',
                      transform: loading ? 'none' : 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
              <Box sx={{ textAlign: 'center', my: 3 }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Sign-In failed')}
                  width="100%"
                  useOneTap
                />
                <Button
                  fullWidth
                  onClick={() => { clearAuthData(); navigate('/login'); }}
                  startIcon={<img src={logo} alt="Abhitech" style={{ width: 22, height: 22 }} />}
                  sx={{
                    mt: 2,
                    background: '#fff',
                    color: darkBlue,
                    border: `1px solid ${alpha(mainBlue, 0.2)}`,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    borderRadius: '30px',
                    textTransform: 'none',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    fontSize: '1rem',
                    py: 1.5,
                    '&:hover': {
                      background: alpha(mainBlue, 0.08),
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Sign In as Abhitech Employee
                </Button>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  mt: 2,
                  textAlign: 'center',
                  color: alpha(darkBlue, 0.7),
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Don&apos;t have an account?{' '}
                <Button variant="text" onClick={() => navigate('/non-abhitech-signup')}>Sign Up</Button>
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </GoogleOAuthProvider>
  );
};

export default Login; 