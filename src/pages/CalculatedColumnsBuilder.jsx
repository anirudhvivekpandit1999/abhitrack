import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Container,
    Grid,
    ThemeProvider,
    Alert,
    Snackbar
} from '@mui/material';

import customTheme from '../theme/customTheme';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useSessionStorage } from '../hooks/useSessionStorage';
import CalculatedColumnsList from '../components/CalculatedColumnsList';
import FormulaBuilder from '../components/FormulaBuilder';
import NavigationButtons from '../components/NavigationButtons';

function CalculatedColumnsBuilder() {
    const location = useLocation();
    const navigate = useNavigate();

    const [withoutProductData, setWithoutProductData] = useSessionStorage('withoutProductData', []);
    const [withProductData, setWithProductData] = useSessionStorage('withProductData', []);
    const [availableColumns, setAvailableColumns] = useSessionStorage('availableColumns', []);
    const [pendingColumns, setPendingColumns] = useLocalStorage('pendingColumns', []);
    const [updatedColumns, setUpdatedColumns] = useLocalStorage('updatedColumns', []);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [backendErrors, setBackendErrors] = useState([]);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [nextButtonDisabled, setNextButtonDisabled] = useState(false);

    const calculatedColumns = useMemo(() => {
        return [...pendingColumns, ...updatedColumns];
    }, [pendingColumns, updatedColumns]);

    useEffect(() => {
        if (location.state) {
            const { withoutProductData: wpd, withProductData: wprd, clientName, plantName, productName } = location.state;

            if (wpd && wprd) {
                if (JSON.stringify(wpd) !== JSON.stringify(withoutProductData)) {
                    setWithoutProductData(wpd);
                }
                if (JSON.stringify(wprd) !== JSON.stringify(withProductData)) {
                    setWithProductData(wprd);
                }

                if (wpd.length > 0 && wprd.length > 0) {
                    const withoutProductColumns = Object.keys(wpd[0]);
                    const withProductColumns = Object.keys(wprd[0]);
                    const allColumns = [...new Set([...withoutProductColumns, ...withProductColumns])];
                    
                    if (JSON.stringify(allColumns) !== JSON.stringify(availableColumns)) {
                        setAvailableColumns(allColumns);
                    }
                }
            }
        }
    }, [location.state]);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, []);

    const handleAddColumn = useCallback((newColumn) => {
        const existingColumn = calculatedColumns.find(
            col => col.name === newColumn.name
        );

        if (existingColumn) {
            setNotification({
                open: true,
                message: `Column '${newColumn.name}' already exists. Please choose a different name.`,
                severity: 'error'
            });
            return;
        }

        setPendingColumns(prev => [...prev, newColumn]);

        setNotification({
            open: true,
            message: `Column '${newColumn.name}' added successfully!`,
            severity: 'success'
        });

        setBackendErrors([]);
    }, [calculatedColumns, setPendingColumns]);
    
    const handleRemoveColumn = useCallback((columnName, status) => {
        if (status === 'pending') {
            setPendingColumns(prev => prev.filter(col => col.name !== columnName));
        } else if (status === 'updated') {
            setUpdatedColumns(prev => prev.filter(col => col.name !== columnName));
        }

        setNotification({
            open: true,
            message: `Column '${columnName}' removed successfully!`,
            severity: 'info'
        });
        
        setBackendErrors([]);
        
        if (pendingColumns.length + updatedColumns.length <= 1) {
            setNextButtonDisabled(false);
        }
    }, [setPendingColumns, setUpdatedColumns, pendingColumns.length, updatedColumns.length]);

    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotification(prev => ({ ...prev, open: false }));
    };

    const [sessionId, setSessionId] = useLocalStorage('session_id', null);

    const handleSaveAndApplyColumns = async () => {
        if (calculatedColumns.length === 0) {
            setNotification({
                open: true,
                message: 'No calculated columns to save. Please create at least one column.',
                severity: 'warning'
            });
            return;
        }
    
        setIsSaving(true);
        setBackendErrors([]);
    
        try {
            const storedSessionId = sessionId || localStorage.getItem('session_id');
            
            const columnsToProcess = calculatedColumns.map(col => ({
                column_name: col.name,
                formula: col.formula,
                formula_elements: col.formulaElements
            }));
    
            const response = await fetch('https://abhistat.com/api/save-calculated-columns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': storedSessionId || ''
                },
                credentials: 'include',
                body: JSON.stringify({ 
                    columns: columnsToProcess,
                    session_id: storedSessionId
                })
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                if (data.detail && typeof data.detail === 'object' && data.detail.debug_info) {
                    console.error('Session debug info:', data.detail.debug_info);
                }
                
                if (data.errors && Array.isArray(data.errors)) {
                    setBackendErrors(data.errors);
                    setNextButtonDisabled(true);
                    setNotification({
                        open: true,
                        message: 'Failed to apply columns. Please fix the errors and try again.',
                        severity: 'error'
                    });
                } else {
                    throw new Error(data.error || data.detail?.error || 'Unknown error occurred');
                }
            } else {
                const newColumns = data.new_columns || [];
                setAvailableColumns(prev => [...new Set([...prev, ...newColumns])]);
                setPendingColumns([]);
                setUpdatedColumns([]);
                setNextButtonDisabled(false);
                setBackendErrors([]);
                
                setNotification({
                    open: true,
                    message: 'All calculated columns were successfully applied to the data files!',
                    severity: 'success'
                });
            }
        } catch (error) {
            console.error('Error saving calculated columns:', error);
            setNotification({
                open: true,
                message: `Error: ${error.message}`,
                severity: 'error'
            });
            setNextButtonDisabled(true);
        } finally {
            setIsSaving(false);
        }
    };
    
    useEffect(() => {
        if (location.state?.sessionId) {
            setSessionId(location.state.sessionId);
        }
    }, [location.state, setSessionId]);

    useEffect(() => {
        if (calculatedColumns.length === 0) {
            setBackendErrors([]);
            setNextButtonDisabled(false);
        }
    }, [calculatedColumns]);

    const processCalculatedColumns = useCallback(() => {
        setIsLoading(true);

        if (backendErrors.length > 0 || calculatedColumns.length > 0) {
            setNotification({
                open: true,
                message: 'Please save and apply all columns before proceeding.',
                severity: 'warning'
            });
            setIsLoading(false);
            return;
        }

        setTimeout(() => {
            setIsLoading(false);
            navigate('/dependency-model', {
                state: {
                    availableColumns: availableColumns,
                    clientName: location.state?.clientName || '',
                    plantName: location.state?.plantName || '',
                    productName: location.state?.productName || ''
                }
            });
        }, 1000);
    }, [navigate, availableColumns, calculatedColumns, backendErrors]);

    return (
        <ThemeProvider theme={customTheme}>
            <Box sx={{ 
                minHeight: '100vh', 
                bgcolor: 'background.default',
                py: { xs: 2, sm: 3, md: 4 }
            }}>
                <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
                    <Paper
                        elevation={2}
                        sx={{
                            borderRadius: { xs: 2, sm: 3 },
                            p: { xs: 2, sm: 3, md: 4 },
                            backgroundColor: 'background.paper',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            minHeight: { xs: 'auto', md: '600px' }
                        }}
                    >
                        <Box sx={{ 
                            mb: { xs: 3, sm: 4 },
                            textAlign: { xs: 'center', sm: 'left' }
                        }}>
                            <Typography 
                                variant="h4" 
                                component="h2" 
                                color="primary.main"
                                sx={{
                                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                                    fontWeight: 700,
                                    mb: 1
                                }}
                            >
                                Step 2: Create Customized Parameters
                            </Typography>
                            <Typography 
                                variant="body1" 
                                color="text.secondary"
                                sx={{
                                    fontSize: { xs: '0.9rem', sm: '1rem' },
                                    maxWidth: '600px'
                                }}
                            >
                                Build custom calculated columns using formulas to enhance your data analysis.
                            </Typography>
                        </Box>

                        {calculatedColumns.length > 0 && (
                            <Alert 
                                severity="info" 
                                sx={{ 
                                    mb: { xs: 2, sm: 3 },
                                    borderRadius: 1,
                                    fontSize: { xs: '0.875rem', sm: '0.9rem' }
                                }}
                            >
                                You have {calculatedColumns.length} calculated columns ({updatedColumns.length} updated, {pendingColumns.length} pending)
                            </Alert>
                        )}

                        {backendErrors.length > 0 && (
                            <Alert 
                                severity="error" 
                                sx={{ 
                                    mb: { xs: 2, sm: 3 },
                                    borderRadius: 1
                                }}
                            >
                                <Typography 
                                    variant="subtitle1" 
                                    fontWeight="bold"
                                    sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                                >
                                    Please fix the following errors:
                                </Typography>
                                <Box component="ul" sx={{ 
                                    mt: 1, 
                                    pl: 2, 
                                    mb: 0,
                                    '& li': {
                                        fontSize: { xs: '0.875rem', sm: '0.9rem' },
                                        mb: 0.5
                                    }
                                }}>
                                    {backendErrors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </Box>
                            </Alert>
                        )}

                        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: { xs: 3, sm: 4 } }}>
                            <Grid item xs={12} lg={4}>
                                <CalculatedColumnsList
                                    updatedColumns={updatedColumns}
                                    pendingColumns={pendingColumns}
                                    onRemoveColumn={handleRemoveColumn}
                                    onSaveAndApply={handleSaveAndApplyColumns}
                                    isSaving={isSaving}
                                    calculatedColumns={calculatedColumns}
                                />
                            </Grid>

                            <Grid item xs={12} lg={8}>
                                <FormulaBuilder
                                    availableColumns={availableColumns}
                                    updatedColumns={updatedColumns}
                                    onAddColumn={handleAddColumn}
                                    withProductData={withProductData}
                                    withoutProductData={withoutProductData}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ 
                            mt: { xs: 3, sm: 4 },
                            pt: { xs: 2, sm: 3 },
                            borderTop: '1px solid',
                            borderColor: 'divider'
                        }}>
                            <NavigationButtons
                                onPrevious={() => navigate('/data-file-checks')}
                                previousLabel='Back to Data File Checks'
                                onNext={processCalculatedColumns}
                                isLoading={isLoading}
                                nextButtonText="Process & Continue"
                                nextButtonDisabled={nextButtonDisabled || calculatedColumns.length > 0}
                            />
                        </Box>

                        <Snackbar
                            open={notification.open}
                            autoHideDuration={4000}
                            onClose={handleCloseNotification}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                            sx={{
                                '& .MuiSnackbar-root': {
                                    bottom: { xs: 20, sm: 24 }
                                }
                            }}
                        >
                            <Alert
                                onClose={handleCloseNotification}
                                severity={notification.severity}
                                variant="filled"
                                sx={{ 
                                    width: '100%',
                                    borderRadius: 1,
                                    fontSize: { xs: '0.875rem', sm: '0.9rem' }
                                }}
                            >
                                {notification.message}
                            </Alert>
                        </Snackbar>
                    </Paper>
                </Container>
            </Box>
        </ThemeProvider>
    );
}

export default CalculatedColumnsBuilder;