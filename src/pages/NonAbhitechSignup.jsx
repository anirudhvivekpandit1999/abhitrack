import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Grid, InputAdornment, IconButton, alpha } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import logo from '../assets/main-logo.png';
import logo2 from '../assets/login.png';
import { config } from '../../config';
import { storeAuthData, clearAuthData, isAuthenticated, USER_TYPES } from '../utils/authUtils';

const GOOGLE_CLIENT_ID = config.GoogleClientId;

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const mainBlue = '#0B3C5D';
  const darkBlue = '#1D2D50';

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/data-file-checks', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!form.name || !form.email || !form.phone || !form.password || !form.confirmPassword) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('https://abhistat.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          confirm_password: form.confirmPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && (data.detail && data.detail.toLowerCase().includes('already registered'))) {
          setError('Email already registered. Redirecting to login...');
          setTimeout(() => {
            navigate('/non-abhitech-login');
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
          }, 1500);
          return;
        }
        throw new Error(data.detail || data.message || 'Signup failed');
      }

      const userData = data.user || { email: form.email, name: form.name };
      const success = storeAuthData(userData, data.access_token, USER_TYPES.EXTERNAL);

      if (!success) {
        throw new Error('Failed to store authentication data');
      }

      navigate('/data-file-checks', {
        replace: true,
        state: { showWelcome: true }
      });

    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('https://abhistat.com/api/google-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });

      const data = await res.json();
      console.log('Google signup response:', data);

      if (!res.ok) {
        if (res.status === 400 && (data.detail && data.detail.toLowerCase().includes('already registered'))) {
          setError('Google account already registered. Redirecting to login...');
          setTimeout(() => {
            navigate('/non-abhitech-login');
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
          }, 1500);
          return;
        }
        throw new Error(data.detail || data.message || 'Google signup failed');
      }

      const userData = data.user || { email: data.email, name: data.name };
      const success = storeAuthData(userData, data.access_token, USER_TYPES.EXTERNAL);

      if (!success) {
        throw new Error('Failed to store authentication data');
      }

      console.log('Google signup successful, navigating to data file checks with welcome modal');
      navigate('/data-file-checks', {
        replace: true,
        state: { showWelcome: true }
      });

    } catch (err) {
      console.error('Google OAuth error:', err);
      setError(err.message);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  if (!GOOGLE_CLIENT_ID) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading Google OAuth configuration...</Typography>
      </Box>
    );
  }

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
                Sign up for your account
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
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(v => !v)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirm(v => !v)} edge="end">
                          {showConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
                <Button
                  fullWidth
                  variant="contained"
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
                  {loading ? 'Creating Account...' : 'Sign Up'}
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
                  onClick={() => navigate('/login')}
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
                Already have an account?{' '}
                <Button variant="text" onClick={() => navigate('/non-abhitech-login')}>Log In</Button>
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </GoogleOAuthProvider>
  );
};

export default Signup; 