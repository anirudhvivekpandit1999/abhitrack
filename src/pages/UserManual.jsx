import React from 'react';
import { Box, Container, Typography } from '@mui/material';

function UserManual() {
  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          AbhiStat User Manual
        </Typography>
        <Box sx={{ height: '75vh', border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <iframe
            title="AbhiStat User Manual"
            src="/manual/index.html"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </Box>
      </Container>
    </Box>
  );
}

export default UserManual;


