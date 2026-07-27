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
    Snackbar,
    Chip,
    Stack,
    Divider,
    alpha
} from '@mui/material';

import FunctionsIcon from '@mui/icons-material/Functions';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';

import customTheme from '../theme/customTheme';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useSessionStorage } from '../hooks/useSessionStorage';

import CalculatedColumnsList from '../components/CalculatedColumnsList';
import FormulaBuilder from '../components/FormulaBuilder';
import NavigationButtons from '../components/NavigationButtons';


/* =========================================================
   SMALL STAT CARD
========================================================= */

const StatCard = ({
    icon,
    label,
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
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
                    borderColor: alpha(color, 0.25)
                }
            }}
        >
            <Stack
                direction="row"
                spacing={1.5}
                alignItems="flex-start"
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
                        color,
                        flexShrink: 0
                    }}
                >
                    {icon}
                </Box>

                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            display: 'block',
                            color: 'text.secondary',
                            fontWeight: 600,
                            mb: 0.3
                        }}
                    >
                        {label}
                    </Typography>

                    <Typography
                        sx={{
                            color: '#172B4D',
                            fontWeight: 750,
                            fontSize: '1.25rem',
                            lineHeight: 1.25
                        }}
                    >
                        {value}
                    </Typography>

                    {helper && (
                        <Typography
                            variant="caption"
                            sx={{
                                display: 'block',
                                color: 'text.disabled',
                                mt: 0.3
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
   MAIN COMPONENT
========================================================= */

function CalculatedColumnsBuilder() {
    const location = useLocation();
    const navigate = useNavigate();

    /* =====================================================
       DATA
    ===================================================== */

    const [
        withoutProductData,
        setWithoutProductData
    ] = useSessionStorage(
        'withoutProductData',
        []
    );

    const [
        withProductData,
        setWithProductData
    ] = useSessionStorage(
        'withProductData',
        []
    );

    const [
        availableColumns,
        setAvailableColumns
    ] = useSessionStorage(
        'availableColumns',
        []
    );

    const [
        pendingColumns,
        setPendingColumns
    ] = useLocalStorage(
        'pendingColumns',
        []
    );

    const [
        updatedColumns,
        setUpdatedColumns
    ] = useLocalStorage(
        'updatedColumns',
        []
    );

    const [
        sessionId,
        setSessionId
    ] = useLocalStorage(
        'session_id',
        null
    );


    /* =====================================================
       UI STATE
    ===================================================== */

    const [isLoading, setIsLoading] = useState(false);

    const [isSaving, setIsSaving] = useState(false);

    const [backendErrors, setBackendErrors] = useState([]);

    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const [
        nextButtonDisabled,
        setNextButtonDisabled
    ] = useState(false);


    /* =====================================================
       DERIVED VALUES
    ===================================================== */

    const calculatedColumns = useMemo(() => {
        return [
            ...pendingColumns,
            ...updatedColumns
        ];
    }, [
        pendingColumns,
        updatedColumns
    ]);

    const totalRows = useMemo(() => {
        return (
            (withoutProductData?.length || 0) +
            (withProductData?.length || 0)
        );
    }, [
        withoutProductData,
        withProductData
    ]);


    /* =====================================================
       LOAD ROUTE DATA
    ===================================================== */

    useEffect(() => {
        if (!location.state) return;

        const {
            withoutProductData: wpd,
            withProductData: wprd
        } = location.state;

        if (!wpd || !wprd) return;

        if (
            JSON.stringify(wpd) !==
            JSON.stringify(withoutProductData)
        ) {
            setWithoutProductData(wpd);
        }

        if (
            JSON.stringify(wprd) !==
            JSON.stringify(withProductData)
        ) {
            setWithProductData(wprd);
        }

        if (
            wpd.length > 0 &&
            wprd.length > 0
        ) {
            const withoutProductColumns =
                Object.keys(wpd[0]);

            const withProductColumns =
                Object.keys(wprd[0]);

            const allColumns = [
                ...new Set([
                    ...withoutProductColumns,
                    ...withProductColumns
                ])
            ];

            if (
                JSON.stringify(allColumns) !==
                JSON.stringify(availableColumns)
            ) {
                setAvailableColumns(
                    allColumns
                );
            }
        }
    }, [
        location.state,
        withoutProductData,
        withProductData,
        availableColumns,
        setWithoutProductData,
        setWithProductData,
        setAvailableColumns
    ]);


    /* =====================================================
       SESSION
    ===================================================== */

    useEffect(() => {
        if (location.state?.sessionId) {
            setSessionId(
                location.state.sessionId
            );
        }
    }, [
        location.state,
        setSessionId
    ]);


    /* =====================================================
       SCROLL TO TOP
    ===================================================== */

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }, []);


    /* =====================================================
       ADD COLUMN
    ===================================================== */

    const handleAddColumn = useCallback(
        (newColumn) => {
            const existingColumn =
                calculatedColumns.find(
                    col =>
                        col.name ===
                        newColumn.name
                );

            if (existingColumn) {
                setNotification({
                    open: true,
                    message:
                        `Column '${newColumn.name}' already exists. ` +
                        'Please choose a different name.',
                    severity: 'error'
                });

                return;
            }

            setPendingColumns(prev => [
                ...prev,
                newColumn
            ]);

            setNotification({
                open: true,
                message:
                    `Column '${newColumn.name}' added successfully!`,
                severity: 'success'
            });

            setBackendErrors([]);
        },
        [
            calculatedColumns,
            setPendingColumns
        ]
    );


    /* =====================================================
       REMOVE COLUMN
    ===================================================== */

    const handleRemoveColumn = useCallback(
        (columnName, status) => {
            if (status === 'pending') {
                setPendingColumns(prev =>
                    prev.filter(
                        col =>
                            col.name !==
                            columnName
                    )
                );
            }

            if (status === 'updated') {
                setUpdatedColumns(prev =>
                    prev.filter(
                        col =>
                            col.name !==
                            columnName
                    )
                );
            }

            setNotification({
                open: true,
                message:
                    `Column '${columnName}' removed successfully!`,
                severity: 'info'
            });

            setBackendErrors([]);

            if (
                pendingColumns.length +
                    updatedColumns.length <=
                1
            ) {
                setNextButtonDisabled(
                    false
                );
            }
        },
        [
            setPendingColumns,
            setUpdatedColumns,
            pendingColumns.length,
            updatedColumns.length
        ]
    );


    /* =====================================================
       NOTIFICATION
    ===================================================== */

    const handleCloseNotification = (
        event,
        reason
    ) => {
        if (reason === 'clickaway') {
            return;
        }

        setNotification(prev => ({
            ...prev,
            open: false
        }));
    };


    /* =====================================================
       SAVE + APPLY COLUMNS
    ===================================================== */

    const handleSaveAndApplyColumns =
        async () => {
            if (
                calculatedColumns.length ===
                0
            ) {
                setNotification({
                    open: true,
                    message:
                        'No calculated columns to save. Please create at least one column.',
                    severity: 'warning'
                });

                return;
            }

            setIsSaving(true);
            setBackendErrors([]);

            try {
                const storedSessionId =
                    sessionId ||
                    localStorage.getItem(
                        'session_id'
                    );

                const columnsToProcess =
                    calculatedColumns.map(
                        col => ({
                            column_name:
                                col.name,

                            formula:
                                col.formula,

                            formula_elements:
                                col.formulaElements
                        })
                    );

                const response =
                    await fetch(
                        'https://abhistat.com/api/save-calculated-columns',
                        {
                            method: 'POST',

                            headers: {
                                'Content-Type':
                                    'application/json',

                                'X-Session-ID':
                                    storedSessionId ||
                                    ''
                            },

                            credentials:
                                'include',

                            body: JSON.stringify(
                                {
                                    columns:
                                        columnsToProcess,

                                    session_id:
                                        storedSessionId
                                }
                            )
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {
                    if (
                        data.detail &&
                        typeof data.detail ===
                            'object' &&
                        data.detail
                            .debug_info
                    ) {
                        console.error(
                            'Session debug info:',
                            data.detail
                                .debug_info
                        );
                    }

                    if (
                        data.errors &&
                        Array.isArray(
                            data.errors
                        )
                    ) {
                        setBackendErrors(
                            data.errors
                        );

                        setNextButtonDisabled(
                            true
                        );

                        setNotification({
                            open: true,
                            message:
                                'Failed to apply columns. Please fix the errors and try again.',
                            severity:
                                'error'
                        });
                    } else {
                        throw new Error(
                            data.error ||
                                data.detail
                                    ?.error ||
                                'Unknown error occurred'
                        );
                    }
                } else {
                    const newColumns =
                        data.new_columns ||
                        [];

                    setAvailableColumns(
                        prev => [
                            ...new Set([
                                ...prev,
                                ...newColumns
                            ])
                        ]
                    );

                    setPendingColumns([]);
                    setUpdatedColumns([]);

                    setNextButtonDisabled(
                        false
                    );

                    setBackendErrors([]);

                    setNotification({
                        open: true,
                        message:
                            'All calculated columns were successfully applied to the data files!',
                        severity:
                            'success'
                    });
                }
            } catch (error) {
                console.error(
                    'Error saving calculated columns:',
                    error
                );

                setNotification({
                    open: true,
                    message:
                        `Error: ${error.message}`,
                    severity: 'error'
                });

                setNextButtonDisabled(
                    true
                );
            } finally {
                setIsSaving(false);
            }
        };


    /* =====================================================
       RESET ERROR STATE
    ===================================================== */

    useEffect(() => {
        if (
            calculatedColumns.length === 0
        ) {
            setBackendErrors([]);
            setNextButtonDisabled(false);
        }
    }, [calculatedColumns]);


    /* =====================================================
       CONTINUE
    ===================================================== */

    const processCalculatedColumns =
        useCallback(() => {
            setIsLoading(true);

            if (
                backendErrors.length > 0 ||
                calculatedColumns.length > 0
            ) {
                setNotification({
                    open: true,
                    message:
                        'Please save and apply all columns before proceeding.',
                    severity:
                        'warning'
                });

                setIsLoading(false);
                return;
            }

            setTimeout(() => {
                setIsLoading(false);

                navigate(
                    '/dependency-model',
                    {
                        state: {
                            availableColumns,

                            clientName:
                                location.state
                                    ?.clientName ||
                                '',

                            plantName:
                                location.state
                                    ?.plantName ||
                                '',

                            productName:
                                location.state
                                    ?.productName ||
                                ''
                        }
                    }
                );
            }, 1000);
        }, [
            navigate,
            availableColumns,
            calculatedColumns,
            backendErrors,
            location.state
        ]);


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
                        inset: 0,
                        height: 300,
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
                        px: {
                            xs: 2,
                            sm: 3,
                            lg: 4
                        },
                        py: {
                            xs: 3,
                            sm: 4,
                            md: 5
                        }
                    }}
                >

                    {/* =====================================
                        HEADER
                    ====================================== */}

                    <Box
                        sx={{
                            mb: {
                                xs: 3,
                                md: 4
                            }
                        }}
                    >
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
                                            <AutoAwesomeRoundedIcon
                                                sx={{
                                                    fontSize:
                                                        '16px !important'
                                                }}
                                            />
                                        }
                                        label="STEP 2"
                                        size="small"
                                        sx={{
                                            height: 27,
                                            borderRadius:
                                                '7px',
                                            bgcolor:
                                                alpha(
                                                    '#2563EB',
                                                    0.08
                                                ),
                                            color:
                                                '#2563EB',
                                            fontWeight:
                                                750,
                                            fontSize:
                                                '0.7rem',
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
                                            fontWeight:
                                                600
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
                                    Create Customized
                                    Parameters
                                </Typography>

                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        mt: 1,
                                        maxWidth: 700,
                                        lineHeight: 1.65,

                                        fontSize: {
                                            xs: '0.88rem',
                                            sm: '0.95rem'
                                        }
                                    }}
                                >
                                    Build calculated
                                    parameters from your
                                    existing dataset using
                                    custom formulas. Review
                                    and apply your changes
                                    before continuing to
                                    dependency modelling.
                                </Typography>
                            </Box>

                            <Chip
                                icon={
                                    <StorageRoundedIcon />
                                }
                                label={
                                    sessionId
                                        ? 'Session Active'
                                        : 'Local Session'
                                }
                                variant="outlined"
                                sx={{
                                    bgcolor: '#FFFFFF',
                                    borderColor:
                                        '#E2E8F0',
                                    color: '#475569',
                                    fontWeight: 600,

                                    '& .MuiChip-icon': {
                                        color: sessionId
                                            ? '#16A34A'
                                            : '#64748B'
                                    }
                                }}
                            />
                        </Stack>
                    </Box>


                    {/* =====================================
                        DATA SUMMARY
                    ====================================== */}

                    <Grid
                        container
                        spacing={2}
                        sx={{
                            mb: {
                                xs: 3,
                                md: 4
                            }
                        }}
                    >
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            lg={3}
                        >
                            <StatCard
                                label="Available Parameters"
                                value={
                                    availableColumns.length
                                }
                                helper="Dataset columns"
                                color="#2563EB"
                                icon={
                                    <DataObjectRoundedIcon
                                        fontSize="small"
                                    />
                                }
                            />
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            sm={6}
                            lg={3}
                        >
                            <StatCard
                                label="Pending Columns"
                                value={
                                    pendingColumns.length
                                }
                                helper="Waiting to be applied"
                                color="#D97706"
                                icon={
                                    <ScheduleRoundedIcon
                                        fontSize="small"
                                    />
                                }
                            />
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            sm={6}
                            lg={3}
                        >
                            <StatCard
                                label="Updated Columns"
                                value={
                                    updatedColumns.length
                                }
                                helper="Previously modified"
                                color="#7C3AED"
                                icon={
                                    <CheckCircleRoundedIcon
                                        fontSize="small"
                                    />
                                }
                            />
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            sm={6}
                            lg={3}
                        >
                            <StatCard
                                label="Dataset Rows"
                                value={totalRows.toLocaleString()}
                                helper="Across both datasets"
                                color="#059669"
                                icon={
                                    <StorageRoundedIcon
                                        fontSize="small"
                                    />
                                }
                            />
                        </Grid>
                    </Grid>


                    {/* =====================================
                        STATUS MESSAGE
                    ====================================== */}

                    {calculatedColumns.length >
                        0 && (
                        <Alert
                            severity="info"
                            icon={
                                <FunctionsIcon />
                            }
                            sx={{
                                mb: 3,
                                borderRadius:
                                    '12px',
                                border:
                                    '1px solid #BFDBFE',
                                bgcolor:
                                    '#EFF6FF',
                                color:
                                    '#1E3A8A',

                                '& .MuiAlert-icon':
                                    {
                                        color:
                                            '#2563EB'
                                    }
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize:
                                        '0.88rem',
                                    fontWeight: 600
                                }}
                            >
                                You currently
                                have{' '}
                                <strong>
                                    {
                                        calculatedColumns.length
                                    }
                                </strong>{' '}
                                calculated{' '}
                                {calculatedColumns.length ===
                                1
                                    ? 'column'
                                    : 'columns'}{' '}
                                waiting in your
                                workspace.
                            </Typography>

                            <Typography
                                variant="caption"
                                sx={{
                                    display:
                                        'block',
                                    mt: 0.3,
                                    color:
                                        '#475569'
                                }}
                            >
                                {
                                    updatedColumns.length
                                }{' '}
                                updated ·{' '}
                                {
                                    pendingColumns.length
                                }{' '}
                                pending. Save and
                                apply all changes
                                before continuing.
                            </Typography>
                        </Alert>
                    )}


                    {/* =====================================
                        BACKEND ERRORS
                    ====================================== */}

                    {backendErrors.length >
                        0 && (
                        <Alert
                            severity="error"
                            icon={
                                <ErrorOutlineRoundedIcon />
                            }
                            sx={{
                                mb: 3,
                                borderRadius:
                                    '12px',
                                border:
                                    '1px solid #FECACA',
                                bgcolor:
                                    '#FEF2F2',

                                '& .MuiAlert-icon':
                                    {
                                        color:
                                            '#DC2626'
                                    }
                            }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    fontSize:
                                        '0.9rem',
                                    mb: 0.5
                                }}
                            >
                                Some calculated
                                columns could not
                                be applied
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mb: 1
                                }}
                            >
                                Review the
                                following issues
                                and update the
                                affected formulas.
                            </Typography>

                            <Box
                                component="ul"
                                sx={{
                                    mt: 1,
                                    mb: 0,
                                    pl: 2.5,

                                    '& li': {
                                        mb: 0.5,
                                        fontSize:
                                            '0.85rem'
                                    },

                                    '& li:last-child':
                                        {
                                            mb: 0
                                        }
                                }}
                            >
                                {backendErrors.map(
                                    (
                                        error,
                                        index
                                    ) => (
                                        <li
                                            key={
                                                index
                                            }
                                        >
                                            {error}
                                        </li>
                                    )
                                )}
                            </Box>
                        </Alert>
                    )}


                    {/* =====================================
                        MAIN WORKSPACE
                    ====================================== */}

                    <Grid
                        container
                        spacing={{
                            xs: 2,
                            md: 3
                        }}
                        alignItems="stretch"
                    >

                        {/* ===============================
                            COLUMN QUEUE
                        ================================ */}

                        <Grid
                            item
                            xs={12}
                            lg={4}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    height:
                                        '100%',
                                    overflow:
                                        'hidden',
                                    border:
                                        '1px solid',
                                    borderColor:
                                        'divider',
                                    borderRadius:
                                        '16px',
                                    bgcolor:
                                        '#FFFFFF',
                                    boxShadow:
                                        '0 4px 18px rgba(15, 23, 42, 0.035)'
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
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        spacing={2}
                                    >
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing={1.2}
                                        >
                                            <Box
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius:
                                                        '9px',
                                                    display:
                                                        'flex',
                                                    alignItems:
                                                        'center',
                                                    justifyContent:
                                                        'center',
                                                    bgcolor:
                                                        alpha(
                                                            '#2563EB',
                                                            0.08
                                                        ),
                                                    color:
                                                        '#2563EB'
                                                }}
                                            >
                                                <DataObjectRoundedIcon
                                                    fontSize="small"
                                                />
                                            </Box>

                                            <Box>
                                                <Typography
                                                    sx={{
                                                        fontWeight:
                                                            700,
                                                        color:
                                                            '#1E293B',
                                                        fontSize:
                                                            '0.92rem'
                                                    }}
                                                >
                                                    Calculated
                                                    Parameters
                                                </Typography>

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    Review
                                                    and apply
                                                    your
                                                    formulas
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Chip
                                            label={
                                                calculatedColumns.length
                                            }
                                            size="small"
                                            sx={{
                                                minWidth:
                                                    32,
                                                height:
                                                    25,
                                                bgcolor:
                                                    calculatedColumns.length >
                                                    0
                                                        ? alpha(
                                                              '#2563EB',
                                                              0.09
                                                          )
                                                        : '#F1F5F9',
                                                color:
                                                    calculatedColumns.length >
                                                    0
                                                        ? '#2563EB'
                                                        : '#64748B',
                                                fontWeight:
                                                    700
                                            }}
                                        />
                                    </Stack>
                                </Box>

                                <Box
                                    sx={{
                                        p: {
                                            xs: 2,
                                            sm: 2.5
                                        }
                                    }}
                                >
                                    <CalculatedColumnsList
                                        updatedColumns={
                                            updatedColumns
                                        }
                                        pendingColumns={
                                            pendingColumns
                                        }
                                        onRemoveColumn={
                                            handleRemoveColumn
                                        }
                                        onSaveAndApply={
                                            handleSaveAndApplyColumns
                                        }
                                        isSaving={
                                            isSaving
                                        }
                                        calculatedColumns={
                                            calculatedColumns
                                        }
                                    />
                                </Box>
                            </Paper>
                        </Grid>


                        {/* ===============================
                            FORMULA WORKSPACE
                        ================================ */}

                        <Grid
                            item
                            xs={12}
                            lg={8}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    height:
                                        '100%',
                                    overflow:
                                        'hidden',
                                    border:
                                        '1px solid',
                                    borderColor:
                                        'divider',
                                    borderRadius:
                                        '16px',
                                    bgcolor:
                                        '#FFFFFF',
                                    boxShadow:
                                        '0 4px 18px rgba(15, 23, 42, 0.035)'
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
                                        spacing={1.5}
                                    >
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing={1.2}
                                        >
                                            <Box
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius:
                                                        '9px',
                                                    display:
                                                        'flex',
                                                    alignItems:
                                                        'center',
                                                    justifyContent:
                                                        'center',
                                                    bgcolor:
                                                        alpha(
                                                            '#7C3AED',
                                                            0.08
                                                        ),
                                                    color:
                                                        '#7C3AED'
                                                }}
                                            >
                                                <FunctionsIcon
                                                    fontSize="small"
                                                />
                                            </Box>

                                            <Box>
                                                <Typography
                                                    sx={{
                                                        fontWeight:
                                                            700,
                                                        color:
                                                            '#1E293B',
                                                        fontSize:
                                                            '0.92rem'
                                                    }}
                                                >
                                                    Formula
                                                    Workspace
                                                </Typography>

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    Build a
                                                    new
                                                    calculated
                                                    parameter
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Chip
                                            label={`${availableColumns.length} source parameters`}
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
                                                    '0.72rem'
                                            }}
                                        />
                                    </Stack>
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
                                    <FormulaBuilder
                                        availableColumns={
                                            availableColumns
                                        }
                                        updatedColumns={
                                            updatedColumns
                                        }
                                        onAddColumn={
                                            handleAddColumn
                                        }
                                        withProductData={
                                            withProductData
                                        }
                                        withoutProductData={
                                            withoutProductData
                                        }
                                    />
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>


                    {/* =====================================
                        WORKFLOW FOOTER
                    ====================================== */}

                    <Paper
                        elevation={0}
                        sx={{
                            mt: {
                                xs: 3,
                                md: 4
                            },
                            border:
                                '1px solid',
                            borderColor:
                                'divider',
                            borderRadius:
                                '16px',
                            bgcolor:
                                '#FFFFFF',
                            overflow:
                                'hidden',
                            boxShadow:
                                '0 4px 18px rgba(15, 23, 42, 0.03)'
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
                                justifyContent="space-between"
                                alignItems={{
                                    xs: 'flex-start',
                                    sm: 'center'
                                }}
                                spacing={1}
                            >
                                <Box>
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
                                        Ready for
                                        dependency
                                        modelling?
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        All pending
                                        calculated
                                        parameters must
                                        be saved and
                                        applied before
                                        continuing.
                                    </Typography>
                                </Box>

                                {calculatedColumns.length >
                                0 ? (
                                    <Chip
                                        icon={
                                            <ScheduleRoundedIcon />
                                        }
                                        label={`${calculatedColumns.length} unsaved`}
                                        size="small"
                                        sx={{
                                            bgcolor:
                                                '#FFF7ED',
                                            color:
                                                '#C2410C',
                                            fontWeight:
                                                650,

                                            '& .MuiChip-icon':
                                                {
                                                    color:
                                                        '#EA580C'
                                                }
                                        }}
                                    />
                                ) : (
                                    <Chip
                                        icon={
                                            <CheckCircleRoundedIcon />
                                        }
                                        label="Ready to continue"
                                        size="small"
                                        sx={{
                                            bgcolor:
                                                '#ECFDF3',
                                            color:
                                                '#067647',
                                            fontWeight:
                                                650,

                                            '& .MuiChip-icon':
                                                {
                                                    color:
                                                        '#12B76A'
                                                }
                                        }}
                                    />
                                )}
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
                                onPrevious={() =>
                                    navigate(
                                        '/data-file-checks'
                                    )
                                }
                                previousLabel="Back to Data File Checks"
                                onNext={
                                    processCalculatedColumns
                                }
                                isLoading={
                                    isLoading
                                }
                                nextLabel="Process & Continue"
                                disableNext={
                                    nextButtonDisabled ||
                                    calculatedColumns.length >
                                        0
                                }
                            />
                        </Box>
                    </Paper>


                    {/* =====================================
                        NOTIFICATION
                    ====================================== */}

                    <Snackbar
                        open={
                            notification.open
                        }
                        autoHideDuration={
                            4000
                        }
                        onClose={
                            handleCloseNotification
                        }
                        anchorOrigin={{
                            vertical:
                                'bottom',
                            horizontal:
                                'center'
                        }}
                    >
                        <Alert
                            onClose={
                                handleCloseNotification
                            }
                            severity={
                                notification.severity
                            }
                            variant="filled"
                            sx={{
                                width: '100%',
                                minWidth: {
                                    sm: 360
                                },
                                borderRadius:
                                    '10px',
                                boxShadow:
                                    '0 10px 30px rgba(15,23,42,0.18)',
                                fontSize:
                                    '0.875rem',
                                alignItems:
                                    'center'
                            }}
                        >
                            {
                                notification.message
                            }
                        </Alert>
                    </Snackbar>
                </Container>
            </Box>
        </ThemeProvider>
    );
}

export default CalculatedColumnsBuilder;