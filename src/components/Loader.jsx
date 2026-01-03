import React from 'react';
import { Box, CircularProgress, Typography, Tooltip } from '@mui/material';

const Loader = ({ size = 40, text = 'Loading...' }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
    <Tooltip title="Platform engineering by Ekalon Solutions" arrow placement="top">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CircularProgress size={size} sx={{ color: '#1976d2' }} />
        <Typography variant="caption" sx={{ color: '#90caf9', fontSize: '0.75em', mt: 1, letterSpacing: 1 }}>
          by Ekalon
        </Typography>
      </Box>
    </Tooltip>
    {text && (
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontSize: '0.95em' }}>
        {text}
      </Typography>
    )}
  </Box>
);

export default Loader;