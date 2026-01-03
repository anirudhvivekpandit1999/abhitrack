import React from 'react';
import { Box, Typography } from '@mui/material';
import EnhancedDataPreview from './EnhancedDataPreview';

const DataPreviewSection = React.memo(({ withoutProductData, withProductData, hasErrors }) => {
    if (!withoutProductData || !withProductData || hasErrors) return null;

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
                Data Preview
            </Typography>

            <Box sx={{ mb: 4 }}>
                <EnhancedDataPreview
                    title="Without Product"
                    data={withoutProductData}
                />
            </Box>

            <Box>
                <EnhancedDataPreview
                    title="With Product"
                    data={withProductData}
                />
            </Box>
        </Box>
    );
});

DataPreviewSection.displayName = 'DataPreviewSection';

export default DataPreviewSection;