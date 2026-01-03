import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function NavigationButtons({
    onPrevious,
    onNext,
    isLoading = false,
    previousLabel = "Previous Step",
    nextLabel = "Next Step",
    disableNext = false,
    hidePrevious = false,
    hideNext = false
}) {
    return (
        <Box
            sx={{
                mt: 5,
                pt: 2,
                borderTop: 1,
                borderColor: 'primary.light',
                display: 'flex',
                justifyContent: 'space-between'
            }}
        >
            {!hidePrevious && (
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={onPrevious}
                    disabled={isLoading}
                    startIcon={<ArrowBackIcon />}
                    sx={{ fontWeight: 500, px: 3, py: 1 }}
                >
                    {previousLabel}
                </Button>
            )}

            <Box sx={{ flexGrow: 1 }} />

            {!hideNext && (<Button
                variant="contained"
                color="primary"
                onClick={onNext}
                disabled={isLoading || disableNext}
                endIcon={isLoading ?
                    <CircularProgress size={18} color="inherit" /> :
                    <ArrowForwardIcon />
                }
                sx={{ fontWeight: 500, px: 3, py: 1 }}
            >
                {nextLabel}
            </Button>
            )}
        </Box>
    );
}

export default NavigationButtons;