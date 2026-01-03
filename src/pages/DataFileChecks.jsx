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
import { formatFileSize, saveToSessionStorage, getFromSessionStorage } from '../utils/fileUtils';

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

    useEffect(() => {
        if (withoutProductData && withProductData) {
            saveToSessionStorage('withoutProductData', withoutProductData);
            saveToSessionStorage('withProductData', withProductData);

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

        const allowedTypes = ['csv', 'xlsx', 'xls', 'parquet'];
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
            const response = await fetch('https://abhistat.com/api/process-files', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.session_id) {
                localStorage.setItem('session_id', result.session_id);

                const file1Data = result.file1_info.data || result.file1_info.preview || [];
                const file2Data = result.file2_info.data || result.file2_info.preview || [];

                setWithoutProductData(file1Data);
                setWithProductData(file2Data);
                
                localStorage.removeItem('dependency-model-columns');

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
                }
            ));
            } else {
                const errorMessage = result.error || 'An error occurred processing the files';
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
            }
        } catch (error) {
            setDataErrors({
                withoutProduct: 'Server error. Please try again.',
                withProduct: 'Server error. Please try again.'
            });
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

    const handleResetErrors = useCallback(() => {
        setErrorType(null);
        setDataErrors({ withoutProduct: null, withProduct: null });
        sessionStorage.removeItem('withoutProductData');
        sessionStorage.removeItem('withProductData');
        sessionStorage.removeItem('fileInfo');
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

        window.location.reload();
    }, []);

    const clearCache = useCallback(() => {
        sessionStorage.removeItem('withoutProductData');
        sessionStorage.removeItem('withProductData');
        sessionStorage.removeItem('fileInfo');
        sessionStorage.removeItem('clientName');
        sessionStorage.removeItem('plantName');
        sessionStorage.removeItem('productName');
        localStorage.removeItem('session_id');
        localStorage.removeItem('withoutProductData');
        localStorage.removeItem('withProductData');
        localStorage.removeItem('fileInfo');
        localStorage.removeItem('dependency-model-columns');
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
        window.location.reload();
    }, []);

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