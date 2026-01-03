import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { PlayArrow, RestartAlt, Error } from '@mui/icons-material';

const ProcessFileButtons = React.memo(({
    errorType,
    files,
    isLoading,
    onProcessFiles,
    onRemoveColumns,
    onResetErrors
}) => {
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
            {!errorType && (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => onProcessFiles(files.withoutProduct, files.withProduct, false, false)}
                    disabled={!files.withoutProduct || !files.withProduct || isLoading}
                    sx={{ fontWeight: 500 }}
                    startIcon={isLoading ? <CircularProgress size={20} /> : <PlayArrow />}
                >
                    {isLoading ? 'Processing...' : 'Process Files'}
                </Button>
            )}

            {errorType === 'unnamed' && (
                <Button
                    variant="contained"
                    color="warning"
                    onClick={() => onRemoveColumns('unnamed')}
                    disabled={isLoading}
                    sx={{ fontWeight: 500 }}
                    startIcon={isLoading ? <CircularProgress size={20} /> : <Error />}
                >
                    {isLoading ? 'Processing...' : 'Process Files & Remove Unnamed Columns'}
                </Button>
            )}

            {errorType === 'mismatched' && (
                <Button
                    variant="contained"
                    color="warning"
                    onClick={() => onRemoveColumns('mismatched')}
                    disabled={isLoading}
                    sx={{ fontWeight: 500 }}
                    startIcon={isLoading ? <CircularProgress size={20} /> : <Error />}
                >
                    {isLoading ? 'Processing...' : 'Process Files & Remove Mismatched Columns'}
                </Button>
            )}

            {errorType && (
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={onResetErrors}
                    disabled={isLoading}
                    sx={{ fontWeight: 500 }}
                    startIcon={<RestartAlt />}
                >
                    Reset
                </Button>
            )}
        </Box>
    );
});

ProcessFileButtons.displayName = 'ProcessFileButtons';

export default ProcessFileButtons;