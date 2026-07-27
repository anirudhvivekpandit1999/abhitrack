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
    Chip,
    Stack,
    Divider,
    Alert,
    alpha,
    InputAdornment
} from '@mui/material';

import {
    DeleteOutline,
    BusinessRounded,
    FactoryRounded,
    Inventory2Rounded,
    CloudUploadRounded,
    CheckCircleRounded,
    StorageRounded,
    InfoOutlined,
    ScienceRounded,
    ArrowForwardRounded
} from '@mui/icons-material';

import customTheme from '../theme/customTheme';

import FileUploader from '../components/FileUploader';
import FileInfoSummary from '../components/FileInfoSummary';
import ProcessFileButtons from '../components/ProcessFileButtons';
import DataPreviewSection from '../components/DataPreviewSection';
import NavigationButtons from '../components/NavigationButtons';
import WelcomeModal from '../components/WelcomeModal';

import {
    formatFileSize,
    saveToSessionStorage,
    getFromSessionStorage
} from '../utils/fileUtils';


/* =========================================================
   SMALL STATUS CARD
========================================================= */

const StatusCard = ({
    icon,
    title,
    value,
    helper,
    color = '#2563EB'
}) => {
    return (
        <Paper
            elevation={0}
            sx={{
                height: '100%',
                p: 2,
                borderRadius: '14px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: '#FFFFFF',
                transition: 'all 0.2s ease',

                '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: alpha(color, 0.25),
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)'
                }
            }}
        >
            <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
            >
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '10px',
                        bgcolor: alpha(color, 0.08),
                        color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}
                >
                    {icon}
                </Box>

                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'text.secondary',
                            fontWeight: 600,
                            display: 'block'
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        sx={{
                            color: '#172B4D',
                            fontWeight: 750,
                            fontSize: '1.15rem',
                            lineHeight: 1.25,
                            mt: 0.2
                        }}
                    >
                        {value}
                    </Typography>

                    {helper && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'text.disabled',
                                display: 'block',
                                mt: 0.2
                            }}
                        >
                            {helper}
                        </Typography>
                    )}
                </Box>
            </Stack>
        </Paper>
    );
};


/* =========================================================
   SECTION HEADER
========================================================= */

const SectionHeader = ({
    icon,
    title,
    description,
    color = '#2563EB',
    action = null
}) => {
    return (
        <Stack
            direction={{
                xs: 'column',
                sm: 'row'
            }}
            justifyContent="space-between"
            alignItems={{
                xs: 'flex-start',
                sm: 'center'
            }}
            spacing={2}
        >
            <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
            >
                <Box
                    sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(color, 0.08),
                        color
                    }}
                >
                    {icon}
                </Box>

                <Box>
                    <Typography
                        sx={{
                            fontWeight: 700,
                            color: '#1E293B',
                            fontSize: '0.95rem'
                        }}
                    >
                        {title}
                    </Typography>

                    {description && (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {description}
                        </Typography>
                    )}
                </Box>
            </Stack>

            {action}
        </Stack>
    );
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

const DataFileChecks = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    const [withoutProductData, setWithoutProductData] = useState(() =>
        getFromSessionStorage(
            'withoutProductData',
            location.state?.withoutProductData || null
        )
    );

    const [withProductData, setWithProductData] = useState(() =>
        getFromSessionStorage(
            'withProductData',
            location.state?.withProductData || null
        )
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

    const [
        canProceedToNextStep,
        setCanProceedToNextStep
    ] = useState(false);

    const [
        pendingWithoutProduct,
        setPendingWithoutProduct
    ] = useState(null);

    const [
        pendingWithProduct,
        setPendingWithProduct
    ] = useState(null);

    const [
        pendingWithoutProductSheet,
        setPendingWithoutProductSheet
    ] = useState(null);

    const [
        pendingWithProductSheet,
        setPendingWithProductSheet
    ] = useState(null);

    const [clientName, setClientName] = useState(() =>
        getFromSessionStorage('clientName', '')
    );

    const [plantName, setPlantName] = useState(() =>
        getFromSessionStorage('plantName', '')
    );

    const [productName, setProductName] = useState(() =>
        getFromSessionStorage('productName', '')
    );


    /* =====================================================
       SAVE DATA TO SESSION
    ===================================================== */

    useEffect(() => {
        if (
            withoutProductData &&
            withProductData
        ) {
            saveToSessionStorage(
                'withoutProductData',
                withoutProductData
            );

            saveToSessionStorage(
                'withProductData',
                withProductData
            );

            if (
                !dataErrors.withoutProduct &&
                !dataErrors.withProduct
            ) {
                setCanProceedToNextStep(true);
            } else {
                setCanProceedToNextStep(false);
            }
        } else {
            setCanProceedToNextStep(false);
        }
    }, [
        withoutProductData,
        withProductData,
        dataErrors
    ]);


    useEffect(() => {
        if (
            fileInfo.withoutProduct ||
            fileInfo.withProduct
        ) {
            saveToSessionStorage(
                'fileInfo',
                fileInfo
            );
        }
    }, [fileInfo]);


    useEffect(() => {
        saveToSessionStorage(
            'clientName',
            clientName
        );

        saveToSessionStorage(
            'plantName',
            plantName
        );

        saveToSessionStorage(
            'productName',
            productName
        );
    }, [
        clientName,
        plantName,
        productName
    ]);


    /* =====================================================
       PAGE LOAD
    ===================================================== */

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });

        if (location.state?.showWelcome) {
            setShowWelcomeModal(true);
        }
    }, [location.state]);


    /* =====================================================
       FILE SELECTION
    ===================================================== */

    const handleFileSelection = useCallback(
        (fileOrObj, fileType) => {
            let file = fileOrObj;
            let sheetName = null;

            if (
                fileOrObj &&
                typeof fileOrObj === 'object' &&
                fileOrObj.file
            ) {
                file = fileOrObj.file;
                sheetName = fileOrObj.sheetName;
            }

            if (!file) return;

            const allowedTypes = [
                'csv',
                'xlsx',
                'xls',
                'parquet'
            ];

            const fileExtension = file.name
                .split('.')
                .pop()
                .toLowerCase();

            if (!allowedTypes.includes(fileExtension)) {
                setDataErrors(prev => ({
                    ...prev,
                    [fileType]:
                        'Invalid file type. Please upload a CSV, Excel, or Parquet file.'
                }));

                setFiles(prev => ({
                    ...prev,
                    [fileType]: null
                }));

                setFileInfo(prev => ({
                    ...prev,
                    [fileType]: null
                }));

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
                    lastModified:
                        new Date(
                            file.lastModified
                        ).toLocaleString()
                }
            }));

            if (fileType === 'withoutProduct') {
                setPendingWithoutProduct(file);
                setPendingWithoutProductSheet(
                    sheetName
                );
            } else {
                setPendingWithProduct(file);
                setPendingWithProductSheet(
                    sheetName
                );
            }
        },
        []
    );


    /* =====================================================
       AUTO PROCESS WHEN BOTH FILES EXIST
    ===================================================== */

    useEffect(() => {
        if (
            pendingWithoutProduct &&
            pendingWithProduct
        ) {
            processFiles(
                pendingWithoutProduct,
                pendingWithProduct,
                pendingWithoutProductSheet,
                pendingWithProductSheet
            );
        }
    }, [
        pendingWithoutProduct,
        pendingWithProduct,
        pendingWithoutProductSheet,
        pendingWithProductSheet
    ]);


    /* =====================================================
       PROCESS FILES
    ===================================================== */

    const processFiles = useCallback(
        async (
            withoutProductFile,
            withProductFile,
            withoutSheet,
            withSheet
        ) => {
            if (
                !withoutProductFile ||
                !withProductFile
            ) {
                return;
            }

            setIsLoading(true);

            setDataErrors({
                withoutProduct: null,
                withProduct: null
            });

            setErrorType(null);

            const formData = new FormData();

            formData.append(
                'file1',
                withoutProductFile
            );

            formData.append(
                'file2',
                withProductFile
            );

            if (withoutSheet) {
                formData.append(
                    'sheet1',
                    withoutSheet
                );
            }

            if (withSheet) {
                formData.append(
                    'sheet2',
                    withSheet
                );
            }

            try {
                const response = await fetch(
                    'https://abhistat.com/api/process-files',
                    {
                        method: 'POST',
                        credentials: 'include',
                        body: formData
                    }
                );

                const result =
                    await response.json();

                if (
                    response.ok &&
                    result.session_id
                ) {
                    localStorage.setItem(
                        'session_id',
                        result.session_id
                    );

                    const file1Data =
                        result.file1_info.data ||
                        result.file1_info.preview ||
                        [];

                    const file2Data =
                        result.file2_info.data ||
                        result.file2_info.preview ||
                        [];

                    setWithoutProductData(
                        file1Data
                    );

                    setWithProductData(
                        file2Data
                    );

                    localStorage.removeItem(
                        'dependency-model-columns'
                    );

                    setFileInfo(prev => ({
                        withoutProduct: {
                            ...prev.withoutProduct,

                            rows:
                                result.file1_info
                                    .shape?.[0] ||
                                file1Data.length,

                            columns:
                                result.file1_info
                                    .columns ||
                                Object.keys(
                                    file1Data[0] ||
                                        {}
                                )
                        },

                        withProduct: {
                            ...prev.withProduct,

                            rows:
                                result.file2_info
                                    .shape?.[0] ||
                                file2Data.length,

                            columns:
                                result.file2_info
                                    .columns ||
                                Object.keys(
                                    file2Data[0] ||
                                        {}
                                )
                        }
                    }));
                } else {
                    const errorMessage =
                        result.error ||
                        'An error occurred processing the files';

                    if (
                        errorMessage
                            .toLowerCase()
                            .includes('file1') ||
                        errorMessage
                            .toLowerCase()
                            .includes(
                                'withoutproduct'
                            )
                    ) {
                        setDataErrors(prev => ({
                            ...prev,
                            withoutProduct:
                                errorMessage
                        }));
                    } else if (
                        errorMessage
                            .toLowerCase()
                            .includes('file2') ||
                        errorMessage
                            .toLowerCase()
                            .includes(
                                'withproduct'
                            )
                    ) {
                        setDataErrors(prev => ({
                            ...prev,
                            withProduct:
                                errorMessage
                        }));
                    } else {
                        setDataErrors({
                            withoutProduct:
                                errorMessage,
                            withProduct:
                                errorMessage
                        });
                    }
                }
            } catch (error) {
                console.error(
                    'File processing error:',
                    error
                );

                setDataErrors({
                    withoutProduct:
                        'Server error. Please try again.',
                    withProduct:
                        'Server error. Please try again.'
                });
            } finally {
                setIsLoading(false);
            }
        },
        []
    );


    /* =====================================================
       REMOVE PROBLEM COLUMNS
    ===================================================== */

    const handleRemoveColumns = useCallback(
        async issue => {
            if (
                !files.withoutProduct ||
                !files.withProduct
            ) {
                return;
            }

            await processFiles(
                files.withoutProduct,
                files.withProduct,
                issue === 'unnamed',
                issue === 'mismatched'
            );
        },
        [files, processFiles]
    );


    /* =====================================================
       NEXT STEP
    ===================================================== */

    const handleNextStep = useCallback(() => {
        if (!canProceedToNextStep) return;

        navigate(
            '/calculated-columns-builder',
            {
                state: {
                    withoutProductData,
                    withProductData,
                    clientName,
                    plantName,
                    productName
                }
            }
        );
    }, [
        canProceedToNextStep,
        navigate,
        withoutProductData,
        withProductData,
        clientName,
        plantName,
        productName
    ]);


    /* =====================================================
       RESET ERRORS
    ===================================================== */

    const handleResetErrors = useCallback(() => {
        setErrorType(null);

        setDataErrors({
            withoutProduct: null,
            withProduct: null
        });

        sessionStorage.removeItem(
            'withoutProductData'
        );

        sessionStorage.removeItem(
            'withProductData'
        );

        sessionStorage.removeItem(
            'fileInfo'
        );

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

        setPendingWithoutProduct(null);
        setPendingWithProduct(null);

        setPendingWithoutProductSheet(null);
        setPendingWithProductSheet(null);

        setIsLoading(false);
        setCanProceedToNextStep(false);

        window.location.reload();
    }, []);


    /* =====================================================
       CLEAR ALL DATA
    ===================================================== */

    const clearCache = useCallback(() => {
        sessionStorage.removeItem(
            'withoutProductData'
        );

        sessionStorage.removeItem(
            'withProductData'
        );

        sessionStorage.removeItem(
            'fileInfo'
        );

        sessionStorage.removeItem(
            'clientName'
        );

        sessionStorage.removeItem(
            'plantName'
        );

        sessionStorage.removeItem(
            'productName'
        );

        localStorage.removeItem(
            'session_id'
        );

        localStorage.removeItem(
            'withoutProductData'
        );

        localStorage.removeItem(
            'withProductData'
        );

        localStorage.removeItem(
            'fileInfo'
        );

        localStorage.removeItem(
            'dependency-model-columns'
        );

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

        setPendingWithoutProduct(null);
        setPendingWithProduct(null);

        setPendingWithoutProductSheet(null);
        setPendingWithProductSheet(null);

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


    /* =====================================================
       DERIVED VALUES
    ===================================================== */

    const hasErrors = Boolean(
        dataErrors.withoutProduct ||
        dataErrors.withProduct
    );

    const withoutRows =
        fileInfo.withoutProduct?.rows ||
        withoutProductData?.length ||
        0;

    const withRows =
        fileInfo.withProduct?.rows ||
        withProductData?.length ||
        0;

    const totalRows =
        Number(withoutRows) +
        Number(withRows);

    const filesReady =
        Boolean(
            withoutProductData &&
            withProductData &&
            !hasErrors
        );


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <ThemeProvider theme={customTheme}>
            <Box
                sx={{
                    minHeight: '100vh',
                    bgcolor: '#F6F8FB',
                    position: 'relative',

                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 320,
                        background:
                            'linear-gradient(180deg, rgba(37,99,235,0.045) 0%, rgba(246,248,251,0) 100%)',
                        pointerEvents: 'none'
                    }
                }}
            >
                <Container
                    maxWidth="xl"
                    sx={{
                        position: 'relative',
                        zIndex: 1,
                        py: {
                            xs: 3,
                            sm: 4,
                            md: 5
                        },
                        px: {
                            xs: 2,
                            sm: 3,
                            lg: 4
                        }
                    }}
                >

                    {/* =====================================
                        PAGE HEADER
                    ====================================== */}

                    <Box sx={{ mb: 4 }}>
                        <Stack
                            direction={{
                                xs: 'column',
                                md: 'row'
                            }}
                            justifyContent="space-between"
                            alignItems={{
                                xs: 'flex-start',
                                md: 'center'
                            }}
                            spacing={2}
                        >
                            <Box>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                    sx={{ mb: 1 }}
                                >
                                    <Chip
                                        icon={
                                            <CloudUploadRounded
                                                sx={{
                                                    fontSize:
                                                        '16px !important'
                                                }}
                                            />
                                        }
                                        label="STEP 1"
                                        size="small"
                                        sx={{
                                            height: 27,
                                            borderRadius: '7px',
                                            bgcolor: alpha(
                                                '#2563EB',
                                                0.08
                                            ),
                                            color: '#2563EB',
                                            fontWeight: 750,
                                            fontSize: '0.7rem',
                                            letterSpacing:
                                                '0.06em',

                                            '& .MuiChip-icon':
                                                {
                                                    color:
                                                        '#2563EB'
                                                }
                                        }}
                                    />

                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color:
                                                'text.secondary',
                                            fontWeight: 600
                                        }}
                                    >
                                        Data Preparation
                                    </Typography>
                                </Stack>

                                <Typography
                                    component="h1"
                                    sx={{
                                        color: '#172B4D',
                                        fontWeight: 780,
                                        letterSpacing:
                                            '-0.035em',
                                        lineHeight: 1.15,

                                        fontSize: {
                                            xs: '1.7rem',
                                            sm: '2rem',
                                            md: '2.25rem'
                                        }
                                    }}
                                >
                                    Data Upload & Preparation
                                </Typography>

                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        mt: 1,
                                        maxWidth: 720,
                                        lineHeight: 1.65,
                                        fontSize: {
                                            xs: '0.88rem',
                                            sm: '0.95rem'
                                        }
                                    }}
                                >
                                    Upload your baseline
                                    and product datasets.
                                    AbhiStat will validate
                                    the files, compare their
                                    structure and prepare
                                    them for statistical
                                    analysis.
                                </Typography>
                            </Box>

                            {(withoutProductData ||
                                withProductData ||
                                files.withoutProduct ||
                                files.withProduct) && (
                                <Button
                                    variant="outlined"
                                    onClick={clearCache}
                                    startIcon={
                                        <DeleteOutline />
                                    }
                                    sx={{
                                        color: '#B42318',
                                        borderColor:
                                            '#FDA29B',
                                        bgcolor:
                                            '#FFFFFF',
                                        textTransform:
                                            'none',
                                        fontWeight: 650,
                                        borderRadius:
                                            '9px',
                                        px: 2,

                                        '&:hover': {
                                            borderColor:
                                                '#F04438',
                                            bgcolor:
                                                '#FEF3F2'
                                        }
                                    }}
                                >
                                    Clear Data
                                </Button>
                            )}
                        </Stack>
                    </Box>


                    {/* =====================================
                        STATUS CARDS
                    ====================================== */}

                    <Grid
                        container
                        spacing={2}
                        sx={{ mb: 3 }}
                    >
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            lg={3}
                        >
                            <StatusCard
                                title="Baseline Dataset"
                                value={
                                    withoutProductData
                                        ? 'Ready'
                                        : 'Not uploaded'
                                }
                                helper={
                                    withoutRows
                                        ? `${Number(
                                              withoutRows
                                          ).toLocaleString()} rows`
                                        : 'Without product'
                                }
                                color={
                                    withoutProductData
                                        ? '#059669'
                                        : '#64748B'
                                }
                                icon={
                                    withoutProductData ? (
                                        <CheckCircleRounded fontSize="small" />
                                    ) : (
                                        <StorageRounded fontSize="small" />
                                    )
                                }
                            />
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            sm={6}
                            lg={3}
                        >
                            <StatusCard
                                title="Product Dataset"
                                value={
                                    withProductData
                                        ? 'Ready'
                                        : 'Not uploaded'
                                }
                                helper={
                                    withRows
                                        ? `${Number(
                                              withRows
                                          ).toLocaleString()} rows`
                                        : 'With product'
                                }
                                color={
                                    withProductData
                                        ? '#2563EB'
                                        : '#64748B'
                                }
                                icon={
                                    withProductData ? (
                                        <CheckCircleRounded fontSize="small" />
                                    ) : (
                                        <StorageRounded fontSize="small" />
                                    )
                                }
                            />
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            sm={6}
                            lg={3}
                        >
                            <StatusCard
                                title="Total Rows"
                                value={totalRows.toLocaleString()}
                                helper="Across both datasets"
                                color="#7C3AED"
                                icon={
                                    <StorageRounded fontSize="small" />
                                }
                            />
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            sm={6}
                            lg={3}
                        >
                            <StatusCard
                                title="Validation"
                                value={
                                    isLoading
                                        ? 'Processing'
                                        : hasErrors
                                          ? 'Needs attention'
                                          : filesReady
                                            ? 'Passed'
                                            : 'Waiting'
                                }
                                helper={
                                    filesReady
                                        ? 'Ready for next step'
                                        : 'Upload both datasets'
                                }
                                color={
                                    hasErrors
                                        ? '#DC2626'
                                        : filesReady
                                          ? '#059669'
                                          : '#D97706'
                                }
                                icon={
                                    filesReady ? (
                                        <CheckCircleRounded fontSize="small" />
                                    ) : (
                                        <ScienceRounded fontSize="small" />
                                    )
                                }
                            />
                        </Grid>
                    </Grid>


                    {/* =====================================
                        PROJECT INFORMATION
                    ====================================== */}

                    <Paper
                        elevation={0}
                        sx={{
                            mb: 3,
                            borderRadius: '16px',
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: '#FFFFFF',
                            overflow: 'hidden',
                            boxShadow:
                                '0 4px 18px rgba(15,23,42,0.035)'
                        }}
                    >
                        <Box
                            sx={{
                                px: {
                                    xs: 2,
                                    sm: 2.5
                                },
                                py: 2,
                                borderBottom:
                                    '1px solid',
                                borderColor:
                                    'divider',
                                bgcolor: '#FBFCFE'
                            }}
                        >
                            <SectionHeader
                                icon={
                                    <BusinessRounded fontSize="small" />
                                }
                                title="Project Information"
                                description="Optional details used to identify this analysis"
                                color="#2563EB"
                                action={
                                    <Chip
                                        label="Optional"
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                            borderColor:
                                                '#E2E8F0',
                                            color:
                                                '#64748B',
                                            bgcolor:
                                                '#FFFFFF',
                                            fontSize:
                                                '0.7rem'
                                        }}
                                    />
                                }
                            />
                        </Box>

                        <Box
                            sx={{
                                p: {
                                    xs: 2,
                                    sm: 2.5,
                                    md: 3
                                }
                            }}
                        >
                            <Grid
                                container
                                spacing={2.5}
                            >
                                <Grid
                                    item
                                    xs={12}
                                    md={4}
                                >
                                    <TextField
                                        fullWidth
                                        label="Client Name"
                                        value={
                                            clientName
                                        }
                                        onChange={e =>
                                            setClientName(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="e.g. ABC Industries"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <BusinessRounded
                                                        sx={{
                                                            fontSize:
                                                                19,
                                                            color:
                                                                '#94A3B8'
                                                        }}
                                                    />
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root':
                                                {
                                                    borderRadius:
                                                        '10px',
                                                    bgcolor:
                                                        '#FFFFFF'
                                                }
                                        }}
                                    />
                                </Grid>

                                <Grid
                                    item
                                    xs={12}
                                    md={4}
                                >
                                    <TextField
                                        fullWidth
                                        label="Plant Name"
                                        value={
                                            plantName
                                        }
                                        onChange={e =>
                                            setPlantName(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="e.g. Mumbai Plant"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FactoryRounded
                                                        sx={{
                                                            fontSize:
                                                                19,
                                                            color:
                                                                '#94A3B8'
                                                        }}
                                                    />
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root':
                                                {
                                                    borderRadius:
                                                        '10px'
                                                }
                                        }}
                                    />
                                </Grid>

                                <Grid
                                    item
                                    xs={12}
                                    md={4}
                                >
                                    <TextField
                                        fullWidth
                                        label="Product Name"
                                        value={
                                            productName
                                        }
                                        onChange={e =>
                                            setProductName(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="e.g. OB Product"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Inventory2Rounded
                                                        sx={{
                                                            fontSize:
                                                                19,
                                                            color:
                                                                '#94A3B8'
                                                        }}
                                                    />
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root':
                                                {
                                                    borderRadius:
                                                        '10px'
                                                }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>


                    {/* =====================================
                        FILE UPLOAD AREA
                    ====================================== */}

                    <Paper
                        elevation={0}
                        sx={{
                            mb: 3,
                            borderRadius: '16px',
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: '#FFFFFF',
                            overflow: 'hidden',
                            boxShadow:
                                '0 4px 18px rgba(15,23,42,0.035)'
                        }}
                    >
                        <Box
                            sx={{
                                px: {
                                    xs: 2,
                                    sm: 2.5
                                },
                                py: 2,
                                borderBottom:
                                    '1px solid',
                                borderColor:
                                    'divider',
                                bgcolor: '#FBFCFE'
                            }}
                        >
                            <SectionHeader
                                icon={
                                    <CloudUploadRounded fontSize="small" />
                                }
                                title="Upload Datasets"
                                description="Upload the baseline and product datasets you want to compare"
                                color="#7C3AED"
                                action={
                                    <Chip
                                        label="CSV · XLSX · XLS · PARQUET"
                                        size="small"
                                        sx={{
                                            bgcolor:
                                                '#F8FAFC',
                                            color:
                                                '#64748B',
                                            fontWeight:
                                                650,
                                            fontSize:
                                                '0.66rem'
                                        }}
                                    />
                                }
                            />
                        </Box>

                        <Box
                            sx={{
                                p: {
                                    xs: 2,
                                    sm: 2.5,
                                    md: 3
                                }
                            }}
                        >
                            <Grid
                                container
                                spacing={2.5}
                            >
                                <Grid
                                    item
                                    xs={12}
                                    md={6}
                                >
                                    <Box
                                        sx={{
                                            height:
                                                '100%',
                                            p: {
                                                xs: 1.5,
                                                sm: 2
                                            },
                                            borderRadius:
                                                '14px',
                                            bgcolor:
                                                '#FAFBFC',
                                            border:
                                                '1px solid #E8EDF3'
                                        }}
                                    >
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing={1}
                                            sx={{
                                                mb: 1.5
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width:
                                                        8,
                                                    height:
                                                        8,
                                                    borderRadius:
                                                        '50%',
                                                    bgcolor:
                                                        withoutProductData
                                                            ? '#10B981'
                                                            : '#94A3B8'
                                                }}
                                            />

                                            <Typography
                                                sx={{
                                                    fontWeight:
                                                        700,
                                                    color:
                                                        '#334155',
                                                    fontSize:
                                                        '0.85rem'
                                                }}
                                            >
                                                Baseline
                                                Dataset
                                            </Typography>

                                            <Chip
                                                label="Without Product"
                                                size="small"
                                                sx={{
                                                    height:
                                                        22,
                                                    fontSize:
                                                        '0.64rem',
                                                    bgcolor:
                                                        '#F1F5F9',
                                                    color:
                                                        '#64748B'
                                                }}
                                            />
                                        </Stack>

                                        <FileUploader
                                            id="withoutProductFile"
                                            label="Upload file for without product"
                                            onFileUpload={fileOrObj =>
                                                handleFileSelection(
                                                    fileOrObj,
                                                    'withoutProduct'
                                                )
                                            }
                                            error={
                                                dataErrors.withoutProduct
                                            }
                                            isLoading={
                                                isLoading
                                            }
                                        />
                                    </Box>
                                </Grid>

                                <Grid
                                    item
                                    xs={12}
                                    md={6}
                                >
                                    <Box
                                        sx={{
                                            height:
                                                '100%',
                                            p: {
                                                xs: 1.5,
                                                sm: 2
                                            },
                                            borderRadius:
                                                '14px',
                                            bgcolor:
                                                '#FAFBFC',
                                            border:
                                                '1px solid #E8EDF3'
                                        }}
                                    >
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing={1}
                                            sx={{
                                                mb: 1.5
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width:
                                                        8,
                                                    height:
                                                        8,
                                                    borderRadius:
                                                        '50%',
                                                    bgcolor:
                                                        withProductData
                                                            ? '#2563EB'
                                                            : '#94A3B8'
                                                }}
                                            />

                                            <Typography
                                                sx={{
                                                    fontWeight:
                                                        700,
                                                    color:
                                                        '#334155',
                                                    fontSize:
                                                        '0.85rem'
                                                }}
                                            >
                                                Product
                                                Dataset
                                            </Typography>

                                            <Chip
                                                label="With Product"
                                                size="small"
                                                sx={{
                                                    height:
                                                        22,
                                                    fontSize:
                                                        '0.64rem',
                                                    bgcolor:
                                                        '#EFF6FF',
                                                    color:
                                                        '#2563EB'
                                                }}
                                            />
                                        </Stack>

                                        <FileUploader
                                            id="withProductFile"
                                            label="Upload file for with product"
                                            onFileUpload={fileOrObj =>
                                                handleFileSelection(
                                                    fileOrObj,
                                                    'withProduct'
                                                )
                                            }
                                            error={
                                                dataErrors.withProduct
                                            }
                                            isLoading={
                                                isLoading
                                            }
                                        />
                                    </Box>
                                </Grid>
                            </Grid>


                            {/* =================================
                                PROCESS BUTTONS
                            ================================== */}

                            <Box
                                sx={{
                                    mt: 2.5,
                                    pt: 2.5,
                                    borderTop:
                                        '1px solid #EEF2F6'
                                }}
                            >
                                <ProcessFileButtons
                                    errorType={
                                        errorType
                                    }
                                    files={files}
                                    isLoading={
                                        isLoading
                                    }
                                    onProcessFiles={
                                        processFiles
                                    }
                                    onRemoveColumns={
                                        handleRemoveColumns
                                    }
                                    onResetErrors={
                                        handleResetErrors
                                    }
                                />
                            </Box>
                        </Box>
                    </Paper>


                    {/* =====================================
                        ERROR SUMMARY
                    ====================================== */}

                    {hasErrors && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                borderRadius:
                                    '12px',
                                border:
                                    '1px solid #FECACA',
                                bgcolor:
                                    '#FEF2F2'
                            }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    fontSize:
                                        '0.88rem',
                                    mb: 0.4
                                }}
                            >
                                We found an
                                issue while
                                validating your
                                datasets
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Review the upload
                                messages above,
                                correct the
                                affected file and
                                try processing
                                again.
                            </Typography>
                        </Alert>
                    )}


                    {/* =====================================
                        SUCCESS STATUS
                    ====================================== */}

                    {filesReady && (
                        <Alert
                            icon={
                                <CheckCircleRounded />
                            }
                            severity="success"
                            sx={{
                                mb: 3,
                                borderRadius:
                                    '12px',
                                border:
                                    '1px solid #A7F3D0',
                                bgcolor:
                                    '#ECFDF5',

                                '& .MuiAlert-icon':
                                    {
                                        color:
                                            '#059669'
                                    }
                            }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    fontSize:
                                        '0.88rem'
                                }}
                            >
                                Both datasets
                                have been
                                processed
                                successfully.
                            </Typography>

                            <Typography
                                variant="caption"
                                sx={{
                                    color:
                                        '#475569'
                                }}
                            >
                                Review the file
                                summary and data
                                preview below,
                                then continue to
                                customized
                                parameters.
                            </Typography>
                        </Alert>
                    )}


                    {/* =====================================
                        FILE SUMMARY
                    ====================================== */}

                    {withoutProductData &&
                        withProductData &&
                        !hasErrors && (
                            <Paper
                                elevation={0}
                                sx={{
                                    mb: 3,
                                    borderRadius:
                                        '16px',
                                    border:
                                        '1px solid',
                                    borderColor:
                                        'divider',
                                    bgcolor:
                                        '#FFFFFF',
                                    overflow:
                                        'hidden',
                                    boxShadow:
                                        '0 4px 18px rgba(15,23,42,0.035)'
                                }}
                            >
                                <Box
                                    sx={{
                                        px: {
                                            xs: 2,
                                            sm: 2.5
                                        },
                                        py: 2,
                                        borderBottom:
                                            '1px solid',
                                        borderColor:
                                            'divider',
                                        bgcolor:
                                            '#FBFCFE'
                                    }}
                                >
                                    <SectionHeader
                                        icon={
                                            <InfoOutlined fontSize="small" />
                                        }
                                        title="Dataset Summary"
                                        description="Processed file information and dataset dimensions"
                                        color="#059669"
                                    />
                                </Box>

                                <Box
                                    sx={{
                                        p: {
                                            xs: 2,
                                            sm: 2.5
                                        }
                                    }}
                                >
                                    <FileInfoSummary
                                        fileInfo={
                                            fileInfo
                                        }
                                        withoutProductData={
                                            withoutProductData
                                        }
                                        withProductData={
                                            withProductData
                                        }
                                    />
                                </Box>
                            </Paper>
                        )}


                    {/* =====================================
                        DATA PREVIEW
                    ====================================== */}

                    {withoutProductData &&
                        withProductData &&
                        !hasErrors && (
                            <Paper
                                elevation={0}
                                sx={{
                                    mb: 3,
                                    borderRadius:
                                        '16px',
                                    border:
                                        '1px solid',
                                    borderColor:
                                        'divider',
                                    bgcolor:
                                        '#FFFFFF',
                                    overflow:
                                        'hidden',
                                    boxShadow:
                                        '0 4px 18px rgba(15,23,42,0.035)'
                                }}
                            >
                                <Box
                                    sx={{
                                        px: {
                                            xs: 2,
                                            sm: 2.5
                                        },
                                        py: 2,
                                        borderBottom:
                                            '1px solid',
                                        borderColor:
                                            'divider',
                                        bgcolor:
                                            '#FBFCFE'
                                    }}
                                >
                                    <SectionHeader
                                        icon={
                                            <StorageRounded fontSize="small" />
                                        }
                                        title="Data Preview"
                                        description="Inspect the processed datasets before continuing"
                                        color="#2563EB"
                                    />
                                </Box>

                                <Box
                                    sx={{
                                        p: {
                                            xs: 2,
                                            sm: 2.5,
                                            md: 3
                                        }
                                    }}
                                >
                                    <DataPreviewSection
                                        withoutProductData={
                                            withoutProductData
                                        }
                                        withProductData={
                                            withProductData
                                        }
                                        hasErrors={
                                            hasErrors
                                        }
                                    />
                                </Box>
                            </Paper>
                        )}


                    {/* =====================================
                        NAVIGATION
                    ====================================== */}

                    <Paper
                        elevation={0}
                        sx={{
                            mt: 3,
                            borderRadius: '16px',
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: '#FFFFFF',
                            overflow: 'hidden',
                            boxShadow:
                                '0 4px 18px rgba(15,23,42,0.03)'
                        }}
                    >
                        <Box
                            sx={{
                                px: {
                                    xs: 2,
                                    sm: 3
                                },
                                py: 2
                            }}
                        >
                            <Stack
                                direction={{
                                    xs: 'column',
                                    sm: 'row'
                                }}
                                alignItems={{
                                    xs: 'flex-start',
                                    sm: 'center'
                                }}
                                justifyContent="space-between"
                                spacing={1.5}
                            >
                                <Box>
                                    <Typography
                                        sx={{
                                            fontWeight:
                                                700,
                                            color:
                                                '#334155',
                                            fontSize:
                                                '0.86rem'
                                        }}
                                    >
                                        {canProceedToNextStep
                                            ? 'Your data is ready'
                                            : 'Complete data preparation'}
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {canProceedToNextStep
                                            ? 'Continue to create customized parameters for your analysis.'
                                            : 'Upload and successfully process both datasets to continue.'}
                                    </Typography>
                                </Box>

                                <Chip
                                    icon={
                                        canProceedToNextStep ? (
                                            <CheckCircleRounded />
                                        ) : (
                                            <ArrowForwardRounded />
                                        )
                                    }
                                    label={
                                        canProceedToNextStep
                                            ? 'Ready for Step 2'
                                            : 'Step 2 Locked'
                                    }
                                    size="small"
                                    sx={{
                                        bgcolor:
                                            canProceedToNextStep
                                                ? '#ECFDF3'
                                                : '#F8FAFC',

                                        color:
                                            canProceedToNextStep
                                                ? '#067647'
                                                : '#64748B',

                                        fontWeight:
                                            650,

                                        '& .MuiChip-icon':
                                            {
                                                color:
                                                    canProceedToNextStep
                                                        ? '#12B76A'
                                                        : '#94A3B8'
                                            }
                                    }}
                                />
                            </Stack>
                        </Box>

                        <Divider />

                        <Box
                            sx={{
                                px: {
                                    xs: 2,
                                    sm: 3
                                },
                                pb: {
                                    xs: 1,
                                    sm: 1.5
                                }
                            }}
                        >
                            <NavigationButtons
                                onPrevious={() => {}}
                                onNext={
                                    handleNextStep
                                }
                                isLoading={
                                    isLoading
                                }
                                disableNext={
                                    !canProceedToNextStep
                                }
                                hidePrevious
                                nextLabel="Continue to Step 2"
                            />
                        </Box>
                    </Paper>
                </Container>


                {/* =========================================
                    WELCOME MODAL
                ========================================== */}

                <WelcomeModal
                    open={showWelcomeModal}
                    onClose={() =>
                        setShowWelcomeModal(
                            false
                        )
                    }
                />
            </Box>
        </ThemeProvider>
    );
};

export default DataFileChecks;