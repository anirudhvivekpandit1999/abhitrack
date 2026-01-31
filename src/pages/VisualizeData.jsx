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
    Divider,
    InputLabel,
    Select,
    MenuItem,
    FormControl
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
        excelData,
        preProductName,
        postProductName,
        sheetNames
    } = location.state || {};

    const [selectedPreSheet, setSelectedPreSheet] = useState(preProductName || '');
    const [selectedPostSheet, setSelectedPostSheet] = useState(postProductName || '');

    const excel_Data = excelData;
    const sheets = sheetNames;

    const getSheetData = (sheetName) =>
        excel_Data?.find(s => s.sheetName === sheetName)?.sheetData || [];

    const getSheetColumns = (sheetName) => {
        const data = getSheetData(sheetName);
        return data.length ? Object.keys(data[0]) : [];
    };

    const withProductData = selectedPreSheet
        ? getSheetData(selectedPreSheet)
        : preProductData;

    const withoutProductData = selectedPostSheet
        ? getSheetData(selectedPostSheet)
        : postProductData;

    const availableColumns =
        selectedPreSheet || selectedPostSheet
            ? Array.from(new Set([
                ...getSheetColumns(selectedPreSheet),
                ...getSheetColumns(selectedPostSheet)
            ]))
            : availableCols;

    const bootstrapAnalysis = bootstrap_analysis || {};

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
                <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4, md: 6 } }}>
                    <Paper elevation={2} sx={{ p: { xs: 2, md: 3 } }}>
                        <Typography variant="h5" color="primary.main" sx={{ mb: 2 }}>
                            Step 4: Visualize Data
                        </Typography>

                        <Typography variant="body2" sx={{ mb: 3 }}>
                            Explore visualizations of your data to identify patterns and relationships.
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                            <FormControl size="small" sx={{ minWidth: 220 }}>
                                <InputLabel>Pre Product Sheet</InputLabel>
                                <Select
                                    value={selectedPreSheet}
                                    label="Pre Product Sheet"
                                    onChange={(e) => setSelectedPreSheet(e.target.value)}
                                >
                                    {sheets?.map((name) => (
                                        <MenuItem key={name} value={name}>{name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl size="small" sx={{ minWidth: 220 }}>
                                <InputLabel>Post Product Sheet</InputLabel>
                                <Select
                                    value={selectedPostSheet}
                                    label="Post Product Sheet"
                                    onChange={(e) => setSelectedPostSheet(e.target.value)}
                                >
                                    {sheets?.map((name) => (
                                        <MenuItem key={name} value={name}>{name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <Paper sx={{ width: '100%', mb: 3 }}>
                            <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                                <Tab label="Distribution Curve" />
                                <Tab label="Scatter Plot" />
                                <Tab label="Multi-Variate Scatter" />
                                <Tab label="Bootstrapping" />
                                <Tab label="Correlation Analysis" />
                            </Tabs>

                            <Box sx={{ p: 3, minHeight: 400 }}>
                                {renderTabContent()}
                            </Box>
                        </Paper>

                        <Divider sx={{ my: 2 }} />

                        <NavigationButtons
                            onPrevious={handlePreviousStep}
                            isLoading={isLoading}
                            previousLabel="Back to Dependency Model"
                            hideNext={true}
                        />
                    </Paper>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default VisualizeData;
