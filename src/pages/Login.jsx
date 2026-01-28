import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  InputAdornment,
  alpha,
} from "@mui/material";
import { Visibility, VisibilityOff, ArrowForward } from "@mui/icons-material";

import logo from "../assets/main-logo.png";
import logo2 from "../assets/login.png";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { clearAuthData, isAuthenticated } from "../utils/authUtils";

const Login = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const mainBlue = '#0B3C5D';
  const darkBlue = '#1D2D50';

  useEffect(() => {
    if (auth?.user || isAuthenticated()) {
      navigate("/full-excel-file", { replace: true });
    }
  }, [auth?.user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (auth?.loginUser?.mutate) {
        auth.loginUser.mutate({ email, password });
      } else {
        console.error('Auth context not available');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
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
                onChange={(e) => setEmail(e.target.value)}
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
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
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
              
              <Button
                variant="contained"
                fullWidth
                type="submit"
                disabled={loading}
                startIcon={<img src={logo} alt="Abhitech Employee" style={{ width: 22, height: 22 }} />}
                endIcon={!loading && <ArrowForward />}
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
                {loading ? 'Logging in...' : 'Log In As Abhitech Employee'}
              </Button>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 4, 
                  textAlign: 'center',
                  color: alpha(darkBlue, 0.7),
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Need assistance? Contact technical support
              </Typography>
            </form>
            <Button
              fullWidth
              onClick={() => {
                clearAuthData();
                navigate('/non-abhitech-login');
              }}
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
              Login as external user
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Login;