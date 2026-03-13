import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    Button,
    Container,
    Paper,
    ThemeProvider,
    TextField,
    Card,
    CardContent,
} from '@mui/material';
import {
    DeleteOutline
} from '@mui/icons-material';
import customTheme from '../theme/customTheme';
import FileUploader from '../components/FileUploader';
import FileInfoSummary from '../components/FileInfoSummary';
import ProcessFileButtons from '../components/ProcessFileButtons';
import DataPreviewSection from '../components/DataPreviewSection';
import NavigationButtons from '../components/NavigationButtons';
import WelcomeModal from '../components/WelcomeModal';
import { formatFileSize, saveToSessionStorage, getFromSessionStorage, removeFromSessionStorage } from '../utils/fileUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import apiClient from '../utils/apiClient';

const DataFileChecks = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    const [withoutProductData, setWithoutProductData] = useState(() =>
        getFromSessionStorage('withoutProductData', location.state?.withoutProductData || null)
    );

    const [withProductData, setWithProductData] = useState(() =>
        getFromSessionStorage('withProductData', location.state?.withProductData || null)
    );

    const [dataErrors, setDataErrors] = useState({
        withoutProduct: null,
        withProduct: null
    });

    const [errorType, setErrorType] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [files, setFiles] = useState({
        withoutProduct: null,
        withProduct: null
    });

    const [fileInfo, setFileInfo] = useState(() =>
        getFromSessionStorage('fileInfo', {
            withoutProduct: null,
            withProduct: null
        })
    );

    const [canProceedToNextStep, setCanProceedToNextStep] = useState(false);

    const [pendingWithoutProduct, setPendingWithoutProduct] = useState(null);
    const [pendingWithProduct, setPendingWithProduct] = useState(null);
    const [pendingWithoutProductSheet, setPendingWithoutProductSheet] = useState(null);
    const [pendingWithProductSheet, setPendingWithProductSheet] = useState(null);

    const [clientName, setClientName] = useState(() =>
        getFromSessionStorage('clientName', '')
    );
    const [plantName, setPlantName] = useState(() =>
        getFromSessionStorage('plantName', '')
    );
    const [productName, setProductName] = useState(() =>
        getFromSessionStorage('productName', '')
    );

    const [sessionId, setSessionId] = useLocalStorage('session_id', null);

    useEffect(() => {
        if (withoutProductData && withProductData) {
            (async () => {
                try {
                    const dataSize1 = new Blob([JSON.stringify(withoutProductData)]).size;
                    const dataSize2 = new Blob([JSON.stringify(withProductData)]).size;
                    
                    if (dataSize1 > 2 * 1024 * 1024 || dataSize2 > 2 * 1024 * 1024) {
                        try {
                            await removeFromSessionStorage('availableColumns');
                            await removeFromSessionStorage('fileInfo');
                        } catch (e) {
                        }
                    }
                    
                    await saveToSessionStorage('withoutProductData', withoutProductData);
                    await saveToSessionStorage('withProductData', withProductData);
                } catch (e) {
                }
            })();

            if (!dataErrors.withoutProduct && !dataErrors.withProduct) {
                setCanProceedToNextStep(true);
            }
        } else {
            setCanProceedToNextStep(false);
        }
    }, [withoutProductData, withProductData, dataErrors]);

    useEffect(() => {
        if (fileInfo.withoutProduct || fileInfo.withProduct) {
            saveToSessionStorage('fileInfo', fileInfo);
        }
    }, [fileInfo]);
    
    useEffect(() => {
        saveToSessionStorage('clientName', clientName);
        saveToSessionStorage('plantName', plantName);
        saveToSessionStorage('productName', productName);
    }, [clientName, plantName, productName]);

    useEffect(() => {
        const loadFromIndexedDB = async () => {
            if (!withoutProductData && !location.state?.withoutProductData) {
                const data = await getFromSessionStorage('withoutProductData', null, false);
                if (data) {
                    setWithoutProductData(data);
                }
            }
            if (!withProductData && !location.state?.withProductData) {
                const data = await getFromSessionStorage('withProductData', null, false);
                if (data) {
                    setWithProductData(data);
                }
            }
            if (!fileInfo.withoutProduct && !fileInfo.withProduct) {
                const data = await getFromSessionStorage('fileInfo', { withoutProduct: null, withProduct: null }, false);
                if (data && (data.withoutProduct || data.withProduct)) {
                    setFileInfo(data);
                }
            }
        };
        loadFromIndexedDB();
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        
        if (location.state?.showWelcome) {
            setShowWelcomeModal(true);
        }
    }, [location.state]);

    const handleFileSelection = useCallback((fileOrObj, fileType) => {
        let file = fileOrObj;
        let sheetName = null;
        if (fileOrObj && typeof fileOrObj === 'object' && fileOrObj.file) {
            file = fileOrObj.file;
            sheetName = fileOrObj.sheetName;
        }
        if (!file) return;

        const allowedTypes = ['csv', 'xlsx', 'xls', 'xlsm', 'parquet'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(fileExtension)) {
            setDataErrors(prev => ({
                ...prev,
                [fileType]: 'Invalid file type. Please upload a CSV, Excel, or Parquet file.'
            }));
            setFiles(prev => ({ ...prev, [fileType]: null }));
            setFileInfo(prev => ({ ...prev, [fileType]: null }));
            return;
        }

        setFiles(prev => ({
            ...prev,
            [fileType]: file
        }));

        setDataErrors(prev => ({
            ...prev,
            [fileType]: null
        }));

        setErrorType(null);

        setFileInfo(prev => ({
            ...prev,
            [fileType]: {
                name: file.name,
                size: formatFileSize(file.size),
                type: file.type,
                lastModified: new Date(file.lastModified).toLocaleString()
            }
        }));

        if (fileType === 'withoutProduct') {
            setPendingWithoutProduct(file);
            setPendingWithoutProductSheet(sheetName);
        } else {
            setPendingWithProduct(file);
            setPendingWithProductSheet(sheetName);
        }
    }, []);

    useEffect(() => {
        if (pendingWithoutProduct && pendingWithProduct) {
            processFiles(pendingWithoutProduct, pendingWithProduct, pendingWithoutProductSheet, pendingWithProductSheet);
        }
    }, [pendingWithoutProduct, pendingWithProduct, pendingWithoutProductSheet, pendingWithProductSheet]);

    const processFiles = useCallback(async (withoutProductFile, withProductFile, withoutSheet, withSheet) => {
        if (!withoutProductFile || !withProductFile) return;
        setIsLoading(true);
        setDataErrors({
            withoutProduct: null,
            withProduct: null
        });
        setErrorType(null);

        const formData = new FormData();
        formData.append('file1', withoutProductFile);
        formData.append('file2', withProductFile);
        if (withoutSheet) formData.append('sheet1', withoutSheet);
        if (withSheet) formData.append('sheet2', withSheet);

        try {
            const result = await apiClient.post('/process-files', formData, { isFormData: true });

            if (result.session_id) {
                await new Promise(resolve => setTimeout(resolve, 50));
                
                try {
                    setSessionId(result.session_id);
                } catch (e) {
                    try {
                        localStorage.removeItem('dependency-model-columns');
                        setSessionId(result.session_id);
                    } catch (e2) {
                    }
                }
                
                await new Promise(resolve => setTimeout(resolve, 50));

                const file1Data = result.file1_info.data || result.file1_info.preview || [];
                const file2Data = result.file2_info.data || result.file2_info.preview || [];

                const dataSize1 = new Blob([JSON.stringify(file1Data)]).size;
                const dataSize2 = new Blob([JSON.stringify(file2Data)]).size;
                
                if (dataSize1 > 2 * 1024 * 1024 || dataSize2 > 2 * 1024 * 1024) {
                    try {
                        await removeFromSessionStorage('withoutProductData');
                        await removeFromSessionStorage('withProductData');
                    } catch (e) {
                    }
                }

                setWithoutProductData(file1Data);
                setWithProductData(file2Data);
                
                try {
                    localStorage.removeItem('dependency-model-columns');
                } catch (e) {
                }

                setFileInfo(prev => ({
                    withoutProduct: {
                        ...prev.withoutProduct,
                        rows: result.file1_info.shape?.[0] || file1Data.length,
                        columns: result.file1_info.columns || Object.keys(file1Data[0] || {})
                    },
                    withProduct: {
                        ...prev.withProduct,
                        rows: result.file2_info.shape?.[0] || file2Data.length,
                        columns: result.file2_info.columns || Object.keys(file2Data[0] || {})
                    }
                }));
            }
        } catch (error) {
            const errorMessage = error.message || 'Server error. Please try again.';
            if (errorMessage.toLowerCase().includes('file1') || errorMessage.toLowerCase().includes('withoutproduct')) {
                setDataErrors(prev => ({ ...prev, withoutProduct: errorMessage }));
            } else if (errorMessage.toLowerCase().includes('file2') || errorMessage.toLowerCase().includes('withproduct')) {
                setDataErrors(prev => ({ ...prev, withProduct: errorMessage }));
            } else {
                setDataErrors({
                    withoutProduct: errorMessage,
                    withProduct: errorMessage
                });
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleRemoveColumns = useCallback(async (issue) => {
        if (!files.withoutProduct || !files.withProduct) {
            return;
        }

        await processFiles(
            files.withoutProduct,
            files.withProduct,
            issue === 'unnamed',
            issue === 'mismatched'
        );
    }, [files, processFiles]);

    const handleNextStep = useCallback(() => {
        if (canProceedToNextStep) {
            navigate('/calculated-columns-builder', {
                state: {
                    withoutProductData,
                    withProductData,
                    clientName,
                    plantName,
                    productName
                }
            });
        }
    }, [canProceedToNextStep, navigate, withoutProductData, withProductData, clientName, plantName, productName]);

    const handleResetErrors = useCallback(async () => {
        setErrorType(null);
        setDataErrors({ withoutProduct: null, withProduct: null });
        
        try {
            await removeFromSessionStorage('withoutProductData');
        } catch (e) {
        }
        try {
            await removeFromSessionStorage('withProductData');
        } catch (e) {
        }
        try {
            await removeFromSessionStorage('fileInfo');
        } catch (e) {
        }
        
        setWithoutProductData(null);
        setWithProductData(null);
        setFileInfo({
            withoutProduct: null,
            withProduct: null
        });
        setFiles({
            withoutProduct: null,
            withProduct: null
        });
        setDataErrors({
            withoutProduct: null,
            withProduct: null
        });
        setIsLoading(false);
        setCanProceedToNextStep(false);

        await new Promise(resolve => setTimeout(resolve, 150));
        window.location.reload();
    }, []);

    const clearCache = useCallback(async () => {
        try {
            await removeFromSessionStorage('withoutProductData');
        } catch (e) {
        }
        try {
            await removeFromSessionStorage('withProductData');
        } catch (e) {
        }
        try {
            await removeFromSessionStorage('fileInfo');
        } catch (e) {
        }
        try {
            await removeFromSessionStorage('clientName');
        } catch (e) {
        }
        try {
            await removeFromSessionStorage('plantName');
        } catch (e) {
        }
        try {
            await removeFromSessionStorage('productName');
        } catch (e) {
        }
        
        try {
            setSessionId(null);
        } catch (e) {
        }
        
        try {
            localStorage.removeItem('withoutProductData');
        } catch (e) {
        }
        try {
            localStorage.removeItem('withProductData');
        } catch (e) {
        }
        try {
            localStorage.removeItem('fileInfo');
        } catch (e) {
        }
        try {
            localStorage.removeItem('dependency-model-columns');
        } catch (e) {
        }
        
        setWithoutProductData(null);
        setWithProductData(null);
        setFileInfo({
            withoutProduct: null,
            withProduct: null
        });
        setFiles({
            withoutProduct: null,
            withProduct: null
        });
        setDataErrors({
            withoutProduct: null,
            withProduct: null
        });
        setErrorType(null);
        setClientName('');
        setPlantName('');
        setProductName('');
        
        await new Promise(resolve => setTimeout(resolve, 150));
        window.location.reload();
    }, [setSessionId]);

    const hasErrors = dataErrors.withoutProduct || dataErrors.withProduct;

    return (
        <ThemeProvider theme={customTheme}>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                <Container maxWidth="xl">
                    <Paper
                        elevation={2}
                        sx={{
                            borderRadius: 1,
                            p: { xs: 2, sm: 3 },
                            backgroundColor: 'background.paper',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" component="h2" color="primary.main">
                                Step 1: Data Upload and Preparation
                            </Typography>

                            {(withoutProductData || withProductData) && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={clearCache}
                                    size="medium"
                                    startIcon={<DeleteOutline />}
                                >
                                    Clear Data
                                </Button>
                            )}
                        </Box>

                        {/* Project Information */}
                        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 1 }}>
                            <CardContent>
                                <Typography variant="h6" component="h3" color="primary.main" sx={{ mb: 2 }}>
                                    Project Information (Optional)
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            label="Client Name"
                                            value={clientName}
                                            onChange={(e) => setClientName(e.target.value)}
                                            variant="outlined"
                                            size="medium"
                                            placeholder="Enter client name"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            label="Plant Name"
                                            value={plantName}
                                            onChange={(e) => setPlantName(e.target.value)}
                                            variant="outlined"
                                            size="medium"
                                            placeholder="Enter plant name"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            label="Product Name"
                                            value={productName}
                                            onChange={(e) => setProductName(e.target.value)}
                                            variant="outlined"
                                            size="medium"
                                            placeholder="Enter product name"
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* File uploaders */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={6}>
                                <FileUploader
                                    id="withoutProductFile"
                                    label="Upload file for without product"
                                    onFileUpload={(fileOrObj) => handleFileSelection(fileOrObj, 'withoutProduct')}
                                    error={dataErrors.withoutProduct}
                                    isLoading={isLoading}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FileUploader
                                    id="withProductFile"
                                    label="Upload file for with product"
                                    onFileUpload={(fileOrObj) => handleFileSelection(fileOrObj, 'withProduct')}
                                    error={dataErrors.withProduct}
                                    isLoading={isLoading}
                                />
                            </Grid>
                        </Grid>

                        <ProcessFileButtons
                            errorType={errorType}
                            files={files}
                            isLoading={isLoading}
                            onProcessFiles={processFiles}
                            onRemoveColumns={handleRemoveColumns}
                            onResetErrors={handleResetErrors}
                        />

                        <FileInfoSummary
                            fileInfo={fileInfo}
                            withoutProductData={withoutProductData}
                            withProductData={withProductData}
                        />

                        <DataPreviewSection
                            withoutProductData={withoutProductData}
                            withProductData={withProductData}
                            hasErrors={hasErrors}
                        />

                        <NavigationButtons
                            onPrevious={() => {}}
                            onNext={handleNextStep}
                            isLoading={isLoading}
                            disableNext={!canProceedToNextStep}
                            hidePrevious={true} 
                            nextLabel="Next Step"
                        />
                    </Paper>
                </Container>
                
                {/* Welcome Modal */}
                <WelcomeModal 
                    open={showWelcomeModal} 
                    onClose={() => setShowWelcomeModal(false)} 
                />
            </Box>
        </ThemeProvider>
    );
};

export default DataFileChecks;