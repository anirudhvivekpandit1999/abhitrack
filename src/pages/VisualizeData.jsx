import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    ThemeProvider,
    Tabs,
    Tab,
    Divider
} from '@mui/material';
import customTheme from '../theme/customTheme';
import NavigationButtons from '../components/NavigationButtons';
import DistributionCurveTab from '../components/visualize/DistributionCurveTab';
import ScatterPlotTab from '../components/visualize/ScatterPlotTab';
import BootstrappingTab from '../components/visualize/BootstrappingTab';
import MultiVariateScatterPlotTab from '../components/visualize/MultiVariateScatterPlotTab';
import CorrelationAnalysisTab from '../components/visualize/CorrelationAnalysisTab';

const VisualizeData = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const {
        dependentVariables,
        independentVariables,
        data_info,
        bootstrap_analysis,
        sessionId,
        clientName = '',
        plantName = '',
        productName = '',
        availableCols,
        preProductData,
        postProductData,
    } = location.state || {};

    const availableColumns = availableCols;
    console.log('Available Columns:', availableCols);
    const withProductData = preProductData;
    console.log('preProductData: ',preProductData);
    console.log('postProductData: ',postProductData);
    
    const withoutProductData = postProductData;
    const bootstrapAnalysis = bootstrap_analysis || {};
    console.log('VisualizeData received data_info:', data_info);
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handlePreviousStep = () => {
        navigate('/dependency-model', {
            state: {
                dependentVariables,
                independentVariables,
                sessionId,
                availableColumns
            }
        });
    };

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, []);

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <DistributionCurveTab 
                        availableColumns={availableColumns}
                        withProductData={withProductData}
                        withoutProductData={withoutProductData}
                        clientName={clientName}
                        plantName={plantName}
                        productName={productName}
                    />
                );
            case 1:
                return (
                    <ScatterPlotTab 
                        withProductData={withProductData}
                        withoutProductData={withoutProductData}
                        clientName={clientName}
                        plantName={plantName}
                        productName={productName}
                    />
                );
            case 2:
                return (
                    <MultiVariateScatterPlotTab
                        availableColumns={availableColumns}
                        withProductData={withProductData}
                        withoutProductData={withoutProductData}
                        clientName={clientName}
                        plantName={plantName}
                        productName={productName}
                    />
                );
            case 3:
                return (
                    <BootstrappingTab 
                        availableColumns={availableColumns}
                        bootstrapAnalysis={bootstrapAnalysis}
                        clientName={clientName}
                        plantName={plantName}
                        productName={productName}
                    />
                );
            case 4:
                return (
                    <CorrelationAnalysisTab 
                        availableColumns={availableColumns}
                        withProductData={withProductData}
                        withoutProductData={withoutProductData}
                        clientName={clientName}
                        plantName={plantName}
                        productName={productName}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <ThemeProvider theme={customTheme}>
            <Box sx={{ 
                minHeight: '100vh', 
                bgcolor: 'background.default',
                px: { xs: 1, sm: 2 },
                py: { xs: 2, sm: 3, md: 4 }
            }}>
                <Container 
                    maxWidth="xl" 
                    sx={{ 
                        py: { xs: 2, sm: 4, md: 6 },
                        px: { xs: 1, sm: 2, md: 3 }
                    }}
                >
                    <Paper
                        elevation={2}
                        sx={{
                            borderRadius: { xs: 1, sm: 2 },
                            p: { xs: 1.5, sm: 2, md: 3 },
                            backgroundColor: 'background.paper',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            width: '100%',
                            overflow: 'hidden'
                        }}
                    >
                        <Typography 
                            variant="h5" 
                            component="h2" 
                            color="primary.main" 
                            sx={{ 
                                mb: { xs: 1.5, sm: 2 },
                                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                                fontWeight: { xs: 600, sm: 500 }
                            }}
                        >
                            Step 4: Visualize Data
                        </Typography>

                        <Typography 
                            variant="body2" 
                            sx={{ 
                                mb: { xs: 2, sm: 3 },
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                lineHeight: { xs: 1.4, sm: 1.5 }
                            }}
                        >
                            Explore visualizations of your data to identify patterns and relationships.
                        </Typography>

                        <Paper sx={{ 
                            width: '100%', 
                            mb: { xs: 2, sm: 3, md: 4 },
                            overflow: 'hidden'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs
                                    value={activeTab}
                                    onChange={handleTabChange}
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    allowScrollButtonsMobile
                                    indicatorColor="primary"
                                    textColor="primary"
                                    sx={{ 
                                        minHeight: { xs: 40, sm: 48 },
                                        '& .MuiTab-root': {
                                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                            minHeight: { xs: 40, sm: 48 },
                                            padding: { xs: '6px 12px', sm: '12px 16px' },
                                            minWidth: { xs: 80, sm: 120 }
                                        }
                                    }}
                                >
                                    <Tab label="Distribution Curve" />
                                    <Tab label="Scatter Plot" />
                                    <Tab label="Multi-Variate Scatter" />
                                    <Tab label="Bootstrapping" />
                                    <Tab label="Correlation Analysis" />
                                </Tabs>
                            </Box>
                            
                            <Box id="visualization-content" sx={{ 
                                p: { xs: 1.5, sm: 2, md: 3 },
                                minHeight: { xs: '300px', sm: '400px', md: '500px' },
                                bgcolor: '#ffffff'
                            }}>
                                {renderTabContent()}
                            </Box>
                        </Paper>

                        <Divider sx={{ 
                            my: { xs: 2, sm: 3 }, 
                            borderColor: 'primary.light' 
                        }} />
                        
                        <Box sx={{
                            mt: { xs: 2, sm: 3 },
                            display: 'flex',
                            justifyContent: { xs: 'center', sm: 'flex-start' }
                        }}>
                            <NavigationButtons
                                onPrevious={handlePreviousStep}
                                isLoading={isLoading}
                                previousLabel="Back to Dependency Model"
                                hideNext={true}
                            />
                        </Box>
                    </Paper>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default VisualizeData;