import React, { useRef, useState } from 'react';

import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Collapse,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Tooltip,
    Typography,
} from '@mui/material';

import {
    CloudUploadRounded,
    DescriptionRounded,
    CheckCircleRounded,
    TableChartRounded,
    SwapHorizRounded,
    ErrorOutlineRounded,
    InsertDriveFileRounded,
} from '@mui/icons-material';

import * as XLSX from 'xlsx';

/* ============================================================================
   FILE UPLOADER
============================================================================ */

function FileUploader({
    id,
    label,
    onFileUpload,
    error,
    isLoading,
}) {
    /* ==========================================================================
       STATE
    ========================================================================== */

    const [fileName, setFileName] = useState('');

    const [dragOver, setDragOver] = useState(false);

    const [sheetNames, setSheetNames] = useState([]);

    const [selectedSheet, setSelectedSheet] = useState('');

    const [sheetSelectPending, setSheetSelectPending] = useState(false);

    /*
     * Keep the actual file in state.
     *
     * This is important for drag-and-drop because dropped files are not
     * automatically placed inside fileInputRef.current.files.
     */
    const [pendingFile, setPendingFile] = useState(null);

    const fileInputRef = useRef(null);

    /* ==========================================================================
       CONSTANTS
    ========================================================================== */

    const acceptedExtensions = [
        'csv',
        'xlsx',
        'xls',
        'parquet',
    ];

    const acceptedInputTypes =
        '.csv,.xlsx,.xls,.parquet';

    /* ==========================================================================
       HELPERS
    ========================================================================== */

    const getFileExtension = (file) => {
        if (!file?.name) return '';

        return (
            file.name
                .split('.')
                .pop()
                ?.toLowerCase() || ''
        );
    };

    const isValidFile = (file) => {
        const extension =
            getFileExtension(file);

        return acceptedExtensions.includes(
            extension
        );
    };

    /* ==========================================================================
       EXCEL SHEET HANDLING
    ========================================================================== */

    const handleExcelSheetSelection = (
        file,
        sheets
    ) => {
        setPendingFile(file);

        setSheetNames(sheets);

        setSelectedSheet(
            sheets?.[0] || ''
        );

        setSheetSelectPending(true);
    };

    const handleSheetChange = (event) => {
        setSelectedSheet(
            event.target.value
        );
    };

    const handleSheetConfirm = () => {
        if (
            !pendingFile ||
            !selectedSheet
        ) {
            return;
        }

        setSheetSelectPending(false);

        onFileUpload({
            file: pendingFile,
            sheetName: selectedSheet,
        });
    };

    /* ==========================================================================
       PROCESS FILE
    ========================================================================== */

    const processFile = (file) => {
        if (!file) return;

        if (!isValidFile(file)) {
            return;
        }

        const extension =
            getFileExtension(file);

        setFileName(file.name);

        setPendingFile(file);

        /*
         * Excel files may contain multiple sheets.
         */
        if (
            extension === 'xlsx' ||
            extension === 'xls'
        ) {
            const reader =
                new FileReader();

            reader.onload = (event) => {
                try {
                    const binaryData =
                        event.target.result;

                    const workbook =
                        XLSX.read(
                            binaryData,
                            {
                                type: 'binary',
                            }
                        );

                    const sheets =
                        workbook.SheetNames ||
                        [];

                    if (
                        sheets.length > 1
                    ) {
                        handleExcelSheetSelection(
                            file,
                            sheets
                        );
                    } else {
                        setSheetSelectPending(
                            false
                        );

                        onFileUpload({
                            file,
                            sheetName:
                                sheets[0] ||
                                '',
                        });
                    }
                } catch (readError) {
                    console.error(
                        'Unable to read Excel file:',
                        readError
                    );
                }
            };

            reader.onerror = (
                readError
            ) => {
                console.error(
                    'Unable to read file:',
                    readError
                );
            };

            reader.readAsBinaryString(
                file
            );

            return;
        }

        /*
         * CSV / Parquet
         */
        setSheetSelectPending(false);

        setSheetNames([]);

        setSelectedSheet('');

        onFileUpload(file);
    };

    /* ==========================================================================
       FILE INPUT
    ========================================================================== */

    const handleFileChange = (
        event
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) return;

        processFile(file);
    };

    /* ==========================================================================
       OPEN FILE PICKER
    ========================================================================== */

    const openFilePicker = () => {
        if (isLoading) return;

        fileInputRef.current?.click();
    };

    /* ==========================================================================
       DRAG AND DROP
    ========================================================================== */

    const handleDragOver = (
        event
    ) => {
        event.preventDefault();

        if (isLoading) return;

        setDragOver(true);
    };

    const handleDragLeave = (
        event
    ) => {
        event.preventDefault();

        setDragOver(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();

        setDragOver(false);

        if (isLoading) return;

        const file =
            event.dataTransfer
                ?.files?.[0];

        if (!file) return;

        if (!isValidFile(file)) {
            /*
             * Keeping the same behavior as your original component.
             * You can later replace this with local validation state if desired.
             */
            window.alert(
                'Please upload only CSV, Excel, or Parquet files.'
            );

            return;
        }

        processFile(file);
    };

    /* ==========================================================================
       KEYBOARD ACCESSIBILITY
    ========================================================================== */

    const handleDropzoneKeyDown = (
        event
    ) => {
        if (
            event.key === 'Enter' ||
            event.key === ' '
        ) {
            event.preventDefault();

            openFilePicker();
        }
    };

    /* ==========================================================================
       DISPLAY VALUES
    ========================================================================== */

    const hasFile =
        Boolean(fileName);

    const extension =
        fileName
            ? getFileExtension({
                  name: fileName,
              }).toUpperCase()
            : '';

    /* ==========================================================================
       RENDER
    ========================================================================== */

    return (
        <Box
            sx={{
                width: '100%',
            }}
        >
            {/* ================================================================
                LABEL
            ================================================================= */}

            {label && (
                <Box
                    sx={{
                        mb: 1.25,

                        display: 'flex',

                        alignItems:
                            'center',

                        justifyContent:
                            'space-between',

                        gap: 1,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems:
                                'center',
                            gap: 0.75,
                        }}
                    >
                        <InsertDriveFileRounded
                            sx={{
                                fontSize: 17,
                                color: '#64748B',
                            }}
                        />

                        <Typography
                            component="label"
                            htmlFor={id}
                            variant="body2"
                            sx={{
                                color:
                                    '#334155',

                                fontWeight:
                                    750,

                                fontSize:
                                    '0.82rem',
                            }}
                        >
                            {label}
                        </Typography>
                    </Box>

                    {hasFile &&
                        !isLoading && (
                            <Chip
                                size="small"
                                icon={
                                    <CheckCircleRounded />
                                }
                                label="File selected"
                                sx={{
                                    height: 25,

                                    bgcolor:
                                        '#ECFDF5',

                                    color:
                                        '#047857',

                                    border:
                                        '1px solid #D1FAE5',

                                    fontSize:
                                        '0.65rem',

                                    fontWeight:
                                        750,

                                    '& .MuiChip-icon':
                                        {
                                            color:
                                                '#059669',

                                            fontSize:
                                                '14px !important',
                                        },
                                }}
                            />
                        )}
                </Box>
            )}

            {/* ================================================================
                DROP ZONE
            ================================================================= */}

            <Paper
                elevation={0}
                role="button"
                tabIndex={
                    isLoading ? -1 : 0
                }
                aria-label={
                    hasFile
                        ? 'Change uploaded file'
                        : 'Upload data file'
                }
                onClick={
                    openFilePicker
                }
                onKeyDown={
                    handleDropzoneKeyDown
                }
                onDragOver={
                    handleDragOver
                }
                onDragLeave={
                    handleDragLeave
                }
                onDrop={handleDrop}
                sx={{
                    position: 'relative',

                    overflow: 'hidden',

                    px: {
                        xs: 2,
                        sm: 3,
                    },

                    py: {
                        xs: 3,
                        sm: 3.5,
                    },

                    border:
                        '1.5px dashed',

                    borderColor: error
                        ? '#FCA5A5'
                        : dragOver
                        ? '#2563EB'
                        : hasFile
                        ? '#BFDBFE'
                        : '#CBD5E1',

                    borderRadius: 3,

                    bgcolor: error
                        ? '#FFFBFB'
                        : dragOver
                        ? '#F0F7FF'
                        : hasFile
                        ? '#F8FBFF'
                        : '#FCFDFE',

                    cursor: isLoading
                        ? 'wait'
                        : 'pointer',

                    outline: 'none',

                    transition:
                        'border-color 160ms ease, background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',

                    '&:hover':
                        !isLoading
                            ? {
                                  borderColor:
                                      error
                                          ? '#F87171'
                                          : '#60A5FA',

                                  bgcolor:
                                      error
                                          ? '#FFF7F7'
                                          : '#F8FBFF',

                                  boxShadow:
                                      '0 8px 24px rgba(15, 23, 42, 0.055)',
                              }
                            : {},

                    '&:focus-visible': {
                        borderColor:
                            '#2563EB',

                        boxShadow:
                            '0 0 0 4px rgba(37, 99, 235, 0.10)',
                    },

                    ...(dragOver && {
                        transform:
                            'translateY(-1px)',

                        boxShadow:
                            '0 12px 28px rgba(37, 99, 235, 0.10)',
                    }),
                }}
            >
                {/* ============================================================
                    SUBTLE BACKGROUND DECORATION
                ============================================================ */}

                <Box
                    sx={{
                        position:
                            'absolute',

                        width: 150,
                        height: 150,

                        borderRadius:
                            '50%',

                        right: -70,
                        top: -90,

                        bgcolor:
                            dragOver
                                ? 'rgba(37, 99, 235, 0.08)'
                                : 'rgba(148, 163, 184, 0.05)',

                        pointerEvents:
                            'none',
                    }}
                />

                {/* ============================================================
                    HIDDEN FILE INPUT
                ============================================================ */}

                <input
                    id={id}
                    name={id}
                    type="file"
                    ref={fileInputRef}
                    accept={
                        acceptedInputTypes
                    }
                    onChange={
                        handleFileChange
                    }
                    disabled={
                        isLoading
                    }
                    style={{
                        display: 'none',
                    }}
                />

                {/* ============================================================
                    CONTENT
                ============================================================ */}

                <Box
                    sx={{
                        position:
                            'relative',

                        display: 'flex',

                        flexDirection:
                            'column',

                        alignItems:
                            'center',

                        textAlign:
                            'center',
                    }}
                >
                    {/* ========================================================
                        ICON
                    ======================================================== */}

                    <Box
                        sx={{
                            width: 58,
                            height: 58,

                            display:
                                'grid',

                            placeItems:
                                'center',

                            mb: 1.5,

                            borderRadius:
                                2.5,

                            bgcolor: error
                                ? '#FEF2F2'
                                : dragOver
                                ? '#DBEAFE'
                                : hasFile
                                ? '#EFF6FF'
                                : '#F1F5F9',

                            color: error
                                ? '#DC2626'
                                : dragOver
                                ? '#2563EB'
                                : hasFile
                                ? '#2563EB'
                                : '#64748B',

                            border:
                                '1px solid',

                            borderColor:
                                error
                                    ? '#FEE2E2'
                                    : dragOver
                                    ? '#BFDBFE'
                                    : hasFile
                                    ? '#DBEAFE'
                                    : '#E2E8F0',

                            transition:
                                'all 160ms ease',
                        }}
                    >
                        {isLoading ? (
                            <CircularProgress
                                size={25}
                                thickness={
                                    4
                                }
                                sx={{
                                    color:
                                        '#2563EB',
                                }}
                            />
                        ) : hasFile ? (
                            <DescriptionRounded
                                sx={{
                                    fontSize:
                                        27,
                                }}
                            />
                        ) : (
                            <CloudUploadRounded
                                sx={{
                                    fontSize:
                                        28,
                                }}
                            />
                        )}
                    </Box>

                    {/* ========================================================
                        TITLE
                    ======================================================== */}

                    <Typography
                        variant="body2"
                        sx={{
                            color:
                                '#1E293B',

                            fontSize:
                                '0.88rem',

                            fontWeight: 800,

                            lineHeight: 1.4,
                        }}
                    >
                        {isLoading
                            ? 'Processing file...'
                            : dragOver
                            ? 'Drop your file here'
                            : hasFile
                            ? 'File ready'
                            : 'Drop your data file here'}
                    </Typography>

                    {/* ========================================================
                        DESCRIPTION
                    ======================================================== */}

                    {!isLoading && (
                        <Typography
                            variant="caption"
                            sx={{
                                mt: 0.45,

                                color:
                                    '#64748B',

                                fontSize:
                                    '0.72rem',

                                lineHeight:
                                    1.55,
                            }}
                        >
                            {hasFile
                                ? 'Click anywhere to choose a different file'
                                : 'Drag and drop or choose a file from your computer'}
                        </Typography>
                    )}

                    {/* ========================================================
                        SELECTED FILE
                    ======================================================== */}

                    {hasFile &&
                        !isLoading && (
                            <Tooltip
                                title={
                                    fileName
                                }
                                arrow
                                placement="top"
                            >
                                <Box
                                    sx={{
                                        mt: 1.5,

                                        maxWidth:
                                            '100%',

                                        display:
                                            'flex',

                                        alignItems:
                                            'center',

                                        gap: 0.75,

                                        px: 1.25,
                                        py: 0.75,

                                        border:
                                            '1px solid #DBEAFE',

                                        borderRadius:
                                            1.75,

                                        bgcolor:
                                            '#FFFFFF',

                                        boxShadow:
                                            '0 2px 6px rgba(15, 23, 42, 0.035)',
                                    }}
                                >
                                    <DescriptionRounded
                                        sx={{
                                            flexShrink: 0,

                                            fontSize:
                                                16,

                                            color:
                                                '#2563EB',
                                        }}
                                    />

                                    <Typography
                                        variant="caption"
                                        sx={{
                                            maxWidth: {
                                                xs: 190,
                                                sm: 360,
                                            },

                                            overflow:
                                                'hidden',

                                            textOverflow:
                                                'ellipsis',

                                            whiteSpace:
                                                'nowrap',

                                            color:
                                                '#334155',

                                            fontSize:
                                                '0.7rem',

                                            fontWeight:
                                                700,
                                        }}
                                    >
                                        {
                                            fileName
                                        }
                                    </Typography>

                                    {extension && (
                                        <Chip
                                            label={
                                                extension
                                            }
                                            size="small"
                                            sx={{
                                                height: 20,

                                                flexShrink: 0,

                                                bgcolor:
                                                    '#EFF6FF',

                                                color:
                                                    '#2563EB',

                                                fontSize:
                                                    '0.58rem',

                                                fontWeight:
                                                    800,

                                                '& .MuiChip-label':
                                                    {
                                                        px: 0.75,
                                                    },
                                            }}
                                        />
                                    )}
                                </Box>
                            </Tooltip>
                        )}

                    {/* ========================================================
                        BUTTON
                    ======================================================== */}

                    {!isLoading && (
                        <Button
                            component="span"
                            variant={
                                hasFile
                                    ? 'outlined'
                                    : 'contained'
                            }
                            startIcon={
                                hasFile ? (
                                    <SwapHorizRounded />
                                ) : (
                                    <CloudUploadRounded />
                                )
                            }
                            sx={{
                                mt: 1.75,

                                minWidth: 150,

                                px: 2,
                                py: 0.8,

                                borderRadius:
                                    1.75,

                                textTransform:
                                    'none',

                                fontSize:
                                    '0.75rem',

                                fontWeight:
                                    750,

                                boxShadow:
                                    hasFile
                                        ? 'none'
                                        : '0 5px 12px rgba(37, 99, 235, 0.18)',

                                ...(hasFile
                                    ? {
                                          color:
                                              '#2563EB',

                                          borderColor:
                                              '#BFDBFE',

                                          bgcolor:
                                              '#FFFFFF',

                                          '&:hover':
                                              {
                                                  bgcolor:
                                                      '#EFF6FF',

                                                  borderColor:
                                                      '#93C5FD',
                                              },
                                      }
                                    : {
                                          bgcolor:
                                              '#2563EB',

                                          '&:hover':
                                              {
                                                  bgcolor:
                                                      '#1D4ED8',

                                                  boxShadow:
                                                      '0 6px 15px rgba(37, 99, 235, 0.22)',
                                              },
                                      }),
                            }}
                        >
                            {hasFile
                                ? 'Change file'
                                : 'Browse files'}
                        </Button>
                    )}

                    {/* ========================================================
                        SUPPORTED FORMATS
                    ======================================================== */}

                    {!hasFile &&
                        !isLoading && (
                            <Box
                                sx={{
                                    mt: 1.75,

                                    display:
                                        'flex',

                                    alignItems:
                                        'center',

                                    justifyContent:
                                        'center',

                                    gap: 0.5,

                                    flexWrap:
                                        'wrap',
                                }}
                            >
                                {[
                                    'CSV',
                                    'XLSX',
                                    'XLS',
                                    'PARQUET',
                                ].map(
                                    (
                                        format
                                    ) => (
                                        <Chip
                                            key={
                                                format
                                            }
                                            label={
                                                format
                                            }
                                            size="small"
                                            sx={{
                                                height: 22,

                                                bgcolor:
                                                    '#F8FAFC',

                                                color:
                                                    '#64748B',

                                                border:
                                                    '1px solid #E2E8F0',

                                                fontSize:
                                                    '0.58rem',

                                                fontWeight:
                                                    750,

                                                '& .MuiChip-label':
                                                    {
                                                        px: 0.8,
                                                    },
                                            }}
                                        />
                                    )
                                )}
                            </Box>
                        )}
                </Box>
            </Paper>

            {/* ================================================================
                EXCEL SHEET SELECTION
            ================================================================= */}

            <Collapse
                in={sheetSelectPending}
                timeout={250}
                unmountOnExit
            >
                <Paper
                    elevation={0}
                    sx={{
                        mt: 1.5,

                        p: {
                            xs: 1.75,
                            sm: 2,
                        },

                        border:
                            '1px solid #DBEAFE',

                        borderRadius: 2.5,

                        bgcolor: '#F8FBFF',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',

                            flexDirection: {
                                xs: 'column',
                                sm: 'row',
                            },

                            alignItems: {
                                xs: 'stretch',
                                sm: 'center',
                            },

                            gap: 1.5,
                        }}
                    >
                        {/* ====================================================
                            ICON + TEXT
                        ==================================================== */}

                        <Box
                            sx={{
                                display:
                                    'flex',

                                alignItems:
                                    'center',

                                gap: 1,

                                flex: {
                                    sm: 1,
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 38,
                                    height: 38,

                                    display:
                                        'grid',

                                    placeItems:
                                        'center',

                                    flexShrink: 0,

                                    borderRadius:
                                        1.75,

                                    bgcolor:
                                        '#EFF6FF',

                                    color:
                                        '#2563EB',

                                    border:
                                        '1px solid #DBEAFE',
                                }}
                            >
                                <TableChartRounded
                                    sx={{
                                        fontSize:
                                            19,
                                    }}
                                />
                            </Box>

                            <Box>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color:
                                            '#1E293B',

                                        fontWeight:
                                            800,

                                        fontSize:
                                            '0.78rem',
                                    }}
                                >
                                    Select an
                                    Excel sheet
                                </Typography>

                                <Typography
                                    variant="caption"
                                    sx={{
                                        display:
                                            'block',

                                        mt: 0.15,

                                        color:
                                            '#64748B',

                                        fontSize:
                                            '0.66rem',
                                    }}
                                >
                                    This workbook
                                    contains{' '}
                                    {
                                        sheetNames.length
                                    }{' '}
                                    sheets.
                                </Typography>
                            </Box>
                        </Box>

                        {/* ====================================================
                            SELECT
                        ==================================================== */}

                        <FormControl
                            size="small"
                            sx={{
                                minWidth: {
                                    xs: '100%',
                                    sm: 210,
                                },
                            }}
                        >
                            <InputLabel
                                id={`${id}-sheet-select-label`}
                            >
                                Sheet
                            </InputLabel>

                            <Select
                                labelId={`${id}-sheet-select-label`}
                                id={`${id}-sheet-select`}
                                value={
                                    selectedSheet
                                }
                                label="Sheet"
                                onChange={
                                    handleSheetChange
                                }
                                sx={{
                                    bgcolor:
                                        '#FFFFFF',

                                    borderRadius:
                                        1.75,

                                    fontSize:
                                        '0.78rem',
                                }}
                            >
                                {sheetNames.map(
                                    (
                                        sheet,
                                        index
                                    ) => (
                                        <MenuItem
                                            key={
                                                sheet
                                            }
                                            value={
                                                sheet
                                            }
                                            sx={{
                                                fontSize:
                                                    '0.78rem',
                                            }}
                                        >
                                            {
                                                sheet
                                            }

                                            {index ===
                                                0 &&
                                                ' (default)'}
                                        </MenuItem>
                                    )
                                )}
                            </Select>
                        </FormControl>

                        {/* ====================================================
                            CONFIRM
                        ==================================================== */}

                        <Button
                            variant="contained"
                            onClick={
                                handleSheetConfirm
                            }
                            disabled={
                                !selectedSheet ||
                                isLoading
                            }
                            sx={{
                                minHeight: 40,

                                px: 2,

                                borderRadius:
                                    1.75,

                                bgcolor:
                                    '#172B4D',

                                textTransform:
                                    'none',

                                whiteSpace:
                                    'nowrap',

                                fontSize:
                                    '0.75rem',

                                fontWeight:
                                    750,

                                boxShadow:
                                    '0 4px 10px rgba(23, 43, 77, 0.14)',

                                '&:hover':
                                    {
                                        bgcolor:
                                            '#223A61',
                                    },
                            }}
                        >
                            Use this sheet
                        </Button>
                    </Box>
                </Paper>
            </Collapse>

            {/* ================================================================
                ERROR MESSAGE
            ================================================================= */}

            <Collapse
                in={Boolean(error)}
                timeout={200}
            >
                <Alert
                    severity="error"
                    icon={
                        <ErrorOutlineRounded fontSize="inherit" />
                    }
                    sx={{
                        mt: 1.5,

                        alignItems:
                            'center',

                        border:
                            '1px solid #FECACA',

                        borderRadius: 2,

                        bgcolor: '#FEF2F2',

                        color: '#991B1B',

                        '& .MuiAlert-icon':
                            {
                                color:
                                    '#DC2626',
                            },

                        '& .MuiAlert-message':
                            {
                                py: 0.25,

                                fontSize:
                                    '0.75rem',

                                fontWeight:
                                    600,
                            },
                    }}
                >
                    {error}
                </Alert>
            </Collapse>
        </Box>
    );
}

export default FileUploader;