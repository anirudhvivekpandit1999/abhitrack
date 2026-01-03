import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  alpha
} from '@mui/material';
import { Close as CloseIcon, Celebration as CelebrationIcon } from '@mui/icons-material';
import logo from '../assets/main-logo.png';

const WelcomeModal = ({ open, onClose }) => {
  const mainBlue = '#0B3C5D';
  const darkBlue = '#1D2D50';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        }
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${mainBlue} 0%, ${darkBlue} 100%)`,
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          py: 3,
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
            '&:hover': {
              backgroundColor: alpha('#ffffff', 0.1),
            }
          }}
        >
          <CloseIcon />
        </IconButton>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CelebrationIcon sx={{ fontSize: 48, color: 'white' }} />
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: { xs: '1.5rem', sm: '2rem' },
            }}
          >
            Welcome to AbhiStat Beta!
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', py: 4, px: 3 }}>        
        <Typography
          variant="h6"
          sx={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            color: darkBlue,
            mb: 2,
          }}
        >
          Welcome to the Beta Program!
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            fontFamily: "'Inter', sans-serif",
            color: alpha(darkBlue, 0.8),
            mb: 3,
            lineHeight: 1.6,
          }}
        >
          Thank you for joining the AbhiStat beta program! You're among the first users to experience our cutting-edge statistical analysis platform. Your feedback will help us shape the future of data analysis tools.
        </Typography>

        <Box
          sx={{
            backgroundColor: alpha(mainBlue, 0.05),
            borderRadius: '12px',
            p: 3,
            border: `1px solid ${alpha(mainBlue, 0.1)}`,
            mb: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontFamily: "'Inter', sans-serif",
              color: alpha(darkBlue, 0.8),
              fontWeight: 600,
              mb: 1,
            }}
          >
            🚀 As a Beta User, you get:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: "'Inter', sans-serif",
              color: alpha(darkBlue, 0.7),
              lineHeight: 1.5,
            }}
          >
            • Early access to new features<br/>
            • Direct feedback channel to our development team<br/>
            • Priority support and assistance<br/>
            • Influence on future tool development
          </Typography>
        </Box>

        <Box
          sx={{
            backgroundColor: alpha('#10B981', 0.05),
            borderRadius: '12px',
            p: 2,
            border: `1px solid ${alpha('#10B981', 0.2)}`,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontFamily: "'Inter', sans-serif",
              color: alpha(darkBlue, 0.7),
              fontStyle: 'italic',
            }}
          >
            💡 Ready to start? Upload your data files in the next step to begin your statistical analysis journey!
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
        <Button
          onClick={onClose}
          variant="contained"
          size="large"
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
          Start Beta Testing
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WelcomeModal;