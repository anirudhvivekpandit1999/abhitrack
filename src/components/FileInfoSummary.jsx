import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';

const FileInfoSummary = React.memo(({ fileInfo, withoutProductData, withProductData }) => {
    if (!withoutProductData || !withProductData) return null;

    return (
        <Paper
            elevation={0}
            sx={{
                mb: 4,
                p: 2,
                backgroundColor: 'primary.light',
                borderRadius: 1.5
            }}
        >
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                File Summary
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                        Without Product
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', mb: 0.5 }}>
                        <Box component="span" sx={{ fontWeight: 500, width: 80 }}>File:</Box>
                        {fileInfo.withoutProduct?.name}
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', mb: 0.5 }}>
                        <Box component="span" sx={{ fontWeight: 500, width: 80 }}>Rows:</Box>
                        {fileInfo.withoutProduct?.rows || withoutProductData.length}
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', mb: 0.5 }}>
                        <Box component="span" sx={{ fontWeight: 500, width: 80 }}>Columns:</Box>
                        {fileInfo.withoutProduct?.columns?.length ||
                            (withoutProductData[0] ? Object.keys(withoutProductData[0]).length : 0)}
                    </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                        With Product
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', mb: 0.5 }}>
                        <Box component="span" sx={{ fontWeight: 500, width: 80 }}>File:</Box>
                        {fileInfo.withProduct?.name}
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', mb: 0.5 }}>
                        <Box component="span" sx={{ fontWeight: 500, width: 80 }}>Rows:</Box>
                        {fileInfo.withProduct?.rows || withProductData.length}
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', mb: 0.5 }}>
                        <Box component="span" sx={{ fontWeight: 500, width: 80 }}>Columns:</Box>
                        {fileInfo.withProduct?.columns?.length ||
                            (withProductData[0] ? Object.keys(withProductData[0]).length : 0)}
                    </Typography>
                </Grid>
            </Grid>
        </Paper>
    );
});

FileInfoSummary.displayName = 'FileInfoSummary';

export default FileInfoSummary;