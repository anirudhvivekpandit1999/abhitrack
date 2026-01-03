import React from 'react';
import {
    Box,
    Typography,
} from '@mui/material';

const DataTableHeader = React.memo(({
    column,
}) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" fontWeight="bold" sx={{ color: 'white' }}>
                    {column}
                </Typography>
            </Box>
        </Box>
    );
});

DataTableHeader.displayName = 'DataTableHeader';

export default DataTableHeader;