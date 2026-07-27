import React, { useMemo } from 'react';

import {
    Box,
    Typography,
    Grid,
    Paper,
    Chip,
    Tooltip,
} from '@mui/material';

import {
    DescriptionRounded,
    InsertDriveFileRounded,
    TableRowsRounded,
    ViewColumnRounded,
    CompareArrowsRounded,
    CheckCircleRounded,
} from '@mui/icons-material';

/* ============================================================================
   FILE INFO SUMMARY
============================================================================ */

const FileInfoSummary = React.memo(
    ({
        fileInfo = {},
        withoutProductData,
        withProductData,
    }) => {
        /* ====================================================================
           VALIDATION
        ==================================================================== */

        if (!withoutProductData || !withProductData) {
            return null;
        }

        /* ====================================================================
           FILE STATISTICS
        ==================================================================== */

        const withoutStats = useMemo(() => {
            const data = Array.isArray(withoutProductData)
                ? withoutProductData
                : [];

            const rows =
                fileInfo?.withoutProduct?.rows ??
                data.length;

            const columns =
                fileInfo?.withoutProduct?.columns?.length ??
                (data[0]
                    ? Object.keys(data[0]).length
                    : 0);

            return {
                name:
                    fileInfo?.withoutProduct?.name ||
                    'Without Product Dataset',
                rows,
                columns,
            };
        }, [
            fileInfo,
            withoutProductData,
        ]);

        const withStats = useMemo(() => {
            const data = Array.isArray(withProductData)
                ? withProductData
                : [];

            const rows =
                fileInfo?.withProduct?.rows ??
                data.length;

            const columns =
                fileInfo?.withProduct?.columns?.length ??
                (data[0]
                    ? Object.keys(data[0]).length
                    : 0);

            return {
                name:
                    fileInfo?.withProduct?.name ||
                    'With Product Dataset',
                rows,
                columns,
            };
        }, [
            fileInfo,
            withProductData,
        ]);

        const totalRows =
            Number(withoutStats.rows || 0) +
            Number(withStats.rows || 0);

        /* ====================================================================
           RENDER
        ==================================================================== */

        return (
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    mb: 4,

                    position: 'relative',
                    overflow: 'hidden',

                    border:
                        '1px solid #E5EAF2',

                    borderRadius: 3,

                    bgcolor: '#FFFFFF',

                    boxShadow:
                        '0 8px 28px rgba(15, 23, 42, 0.055)',
                }}
            >
                {/* ============================================================
                    DECORATIVE BACKGROUND
                ============================================================ */}

                <Box
                    sx={{
                        position: 'absolute',

                        width: 180,
                        height: 180,

                        borderRadius: '50%',

                        bgcolor: '#EFF6FF',

                        right: -90,
                        top: -110,

                        pointerEvents: 'none',
                    }}
                />

                {/* ============================================================
                    HEADER
                ============================================================ */}

                <Box
                    sx={{
                        position: 'relative',

                        px: {
                            xs: 2,
                            sm: 2.5,
                        },

                        py: 2,

                        display: 'flex',

                        flexDirection: {
                            xs: 'column',
                            sm: 'row',
                        },

                        alignItems: {
                            xs: 'flex-start',
                            sm: 'center',
                        },

                        justifyContent:
                            'space-between',

                        gap: 2,

                        borderBottom:
                            '1px solid #EDF1F6',
                    }}
                >
                    {/* ========================================================
                        TITLE
                    ======================================================== */}

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.25,
                        }}
                    >
                        <Box
                            sx={{
                                width: 42,
                                height: 42,

                                display: 'grid',
                                placeItems: 'center',

                                flexShrink: 0,

                                borderRadius: 2,

                                bgcolor: '#172B4D',
                                color: '#FFFFFF',

                                boxShadow:
                                    '0 6px 16px rgba(23, 43, 77, 0.16)',
                            }}
                        >
                            <DescriptionRounded
                                sx={{
                                    fontSize: 21,
                                }}
                            />
                        </Box>

                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#0F172A',

                                    fontSize: {
                                        xs: '1rem',
                                        sm: '1.08rem',
                                    },

                                    fontWeight: 800,

                                    lineHeight: 1.25,

                                    letterSpacing:
                                        '-0.015em',
                                }}
                            >
                                File Summary
                            </Typography>

                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'block',

                                    mt: 0.3,

                                    color: '#64748B',

                                    lineHeight: 1.4,
                                }}
                            >
                                Review the datasets
                                loaded for comparison.
                            </Typography>
                        </Box>
                    </Box>

                    {/* ========================================================
                        SUMMARY CHIPS
                    ======================================================== */}

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',

                            gap: 0.75,

                            flexWrap: 'wrap',
                        }}
                    >
                        <Chip
                            size="small"
                            icon={
                                <CompareArrowsRounded />
                            }
                            label="2 datasets"
                            sx={{
                                height: 28,

                                bgcolor: '#EFF6FF',
                                color: '#2563EB',

                                border:
                                    '1px solid #DBEAFE',

                                fontWeight: 750,
                                fontSize: '0.69rem',

                                '& .MuiChip-icon': {
                                    color: '#2563EB',

                                    fontSize:
                                        '15px !important',
                                },
                            }}
                        />

                        <Chip
                            size="small"
                            label={`${totalRows.toLocaleString()} total rows`}
                            sx={{
                                height: 28,

                                bgcolor: '#F1F5F9',
                                color: '#475569',

                                border:
                                    '1px solid #E2E8F0',

                                fontWeight: 750,
                                fontSize: '0.69rem',
                            }}
                        />
                    </Box>
                </Box>

                {/* ============================================================
                    DATASET CARDS
                ============================================================ */}

                <Box
                    sx={{
                        position: 'relative',

                        p: {
                            xs: 2,
                            sm: 2.5,
                        },

                        bgcolor: '#FCFDFE',
                    }}
                >
                    <Grid
                        container
                        spacing={2}
                    >
                        {/* ====================================================
                            WITHOUT PRODUCT
                        ==================================================== */}

                        <Grid
                            item
                            xs={12}
                            md={6}
                        >
                            <DatasetSummaryCard
                                title="Without Product"
                                subtitle="Baseline dataset"
                                filename={
                                    withoutStats.name
                                }
                                rows={
                                    withoutStats.rows
                                }
                                columns={
                                    withoutStats.columns
                                }
                                type="without"
                            />
                        </Grid>

                        {/* ====================================================
                            WITH PRODUCT
                        ==================================================== */}

                        <Grid
                            item
                            xs={12}
                            md={6}
                        >
                            <DatasetSummaryCard
                                title="With Product"
                                subtitle="Comparison dataset"
                                filename={
                                    withStats.name
                                }
                                rows={
                                    withStats.rows
                                }
                                columns={
                                    withStats.columns
                                }
                                type="with"
                            />
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        );
    }
);

/* ============================================================================
   DATASET SUMMARY CARD
============================================================================ */

const DatasetSummaryCard = ({
    title,
    subtitle,
    filename,
    rows,
    columns,
    type,
}) => {
    const isWithProduct =
        type === 'with';

    const theme = isWithProduct
        ? {
              background: '#ECFDF5',
              border: '#D1FAE5',
              color: '#047857',
              accent: '#059669',
          }
        : {
              background: '#FFF7ED',
              border: '#FFEDD5',
              color: '#C2410C',
              accent: '#EA580C',
          };

    return (
        <Paper
            elevation={0}
            sx={{
                height: '100%',

                position: 'relative',
                overflow: 'hidden',

                border:
                    '1px solid #E5EAF2',

                borderRadius: 2.5,

                bgcolor: '#FFFFFF',

                transition:
                    'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',

                '&:hover': {
                    borderColor:
                        theme.border,

                    boxShadow:
                        '0 10px 24px rgba(15, 23, 42, 0.07)',

                    transform:
                        'translateY(-1px)',
                },
            }}
        >
            {/* ================================================================
                ACCENT
            ================================================================= */}

            <Box
                sx={{
                    position: 'absolute',

                    top: 0,
                    left: 0,

                    width: 4,
                    height: '100%',

                    bgcolor: theme.accent,
                }}
            />

            {/* ================================================================
                CARD CONTENT
            ================================================================= */}

            <Box
                sx={{
                    p: 2,

                    pl: 2.25,
                }}
            >
                {/* ============================================================
                    DATASET TITLE
                ============================================================ */}

                <Box
                    sx={{
                        display: 'flex',

                        alignItems: 'flex-start',

                        justifyContent:
                            'space-between',

                        gap: 1.5,

                        mb: 1.75,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',

                            gap: 1,
                        }}
                    >
                        <Box
                            sx={{
                                width: 36,
                                height: 36,

                                display: 'grid',
                                placeItems: 'center',

                                flexShrink: 0,

                                borderRadius: 1.75,

                                bgcolor:
                                    theme.background,

                                color:
                                    theme.color,

                                border: `1px solid ${theme.border}`,
                            }}
                        >
                            <InsertDriveFileRounded
                                sx={{
                                    fontSize: 18,
                                }}
                            />
                        </Box>

                        <Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#1E293B',

                                    fontWeight: 800,

                                    lineHeight: 1.25,
                                }}
                            >
                                {title}
                            </Typography>

                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'block',

                                    mt: 0.2,

                                    color: '#94A3B8',

                                    fontSize:
                                        '0.67rem',
                                }}
                            >
                                {subtitle}
                            </Typography>
                        </Box>
                    </Box>

                    <Tooltip
                        title="Dataset loaded successfully"
                        arrow
                    >
                        <CheckCircleRounded
                            sx={{
                                mt: 0.4,

                                fontSize: 18,

                                color: '#10B981',
                            }}
                        />
                    </Tooltip>
                </Box>

                {/* ============================================================
                    FILE NAME
                ============================================================ */}

                <Box
                    sx={{
                        mb: 1.75,

                        px: 1.25,
                        py: 1.1,

                        display: 'flex',
                        alignItems: 'center',

                        gap: 1,

                        borderRadius: 1.75,

                        bgcolor: '#F8FAFC',

                        border:
                            '1px solid #EDF1F6',
                    }}
                >
                    <InsertDriveFileRounded
                        sx={{
                            flexShrink: 0,

                            fontSize: 17,

                            color: '#94A3B8',
                        }}
                    />

                    <Tooltip
                        title={filename}
                        placement="top"
                        arrow
                        enterDelay={600}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                minWidth: 0,

                                overflow:
                                    'hidden',

                                textOverflow:
                                    'ellipsis',

                                whiteSpace:
                                    'nowrap',

                                color: '#475569',

                                fontSize:
                                    '0.76rem',

                                fontWeight: 650,
                            }}
                        >
                            {filename}
                        </Typography>
                    </Tooltip>
                </Box>

                {/* ============================================================
                    STATISTICS
                ============================================================ */}

                <Grid
                    container
                    spacing={1}
                >
                    {/* ROWS */}

                    <Grid
                        item
                        xs={6}
                    >
                        <MetricCard
                            icon={
                                <TableRowsRounded />
                            }
                            label="Rows"
                            value={rows}
                        />
                    </Grid>

                    {/* COLUMNS */}

                    <Grid
                        item
                        xs={6}
                    >
                        <MetricCard
                            icon={
                                <ViewColumnRounded />
                            }
                            label="Columns"
                            value={columns}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
};

/* ============================================================================
   METRIC CARD
============================================================================ */

const MetricCard = ({
    icon,
    label,
    value,
}) => {
    const formattedValue =
        typeof value === 'number'
            ? value.toLocaleString()
            : value ?? 0;

    return (
        <Box
            sx={{
                height: '100%',

                display: 'flex',
                alignItems: 'center',

                gap: 1,

                px: 1.25,
                py: 1.1,

                border:
                    '1px solid #EDF1F6',

                borderRadius: 1.75,

                bgcolor: '#FFFFFF',

                transition:
                    'background-color 150ms ease, border-color 150ms ease',

                '&:hover': {
                    bgcolor: '#F8FAFC',

                    borderColor:
                        '#DCE3EC',
                },
            }}
        >
            {/* ================================================================
                ICON
            ================================================================= */}

            <Box
                sx={{
                    width: 30,
                    height: 30,

                    display: 'grid',
                    placeItems: 'center',

                    flexShrink: 0,

                    borderRadius: 1.4,

                    bgcolor: '#F1F5F9',

                    color: '#64748B',

                    '& svg': {
                        fontSize: 16,
                    },
                }}
            >
                {icon}
            </Box>

            {/* ================================================================
                VALUE
            ================================================================= */}

            <Box
                sx={{
                    minWidth: 0,
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        display: 'block',

                        color: '#94A3B8',

                        fontSize: '0.64rem',

                        fontWeight: 650,

                        lineHeight: 1.2,

                        textTransform:
                            'uppercase',

                        letterSpacing:
                            '0.04em',
                    }}
                >
                    {label}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        mt: 0.2,

                        color: '#1E293B',

                        fontSize: '0.84rem',

                        fontWeight: 800,

                        lineHeight: 1.2,
                    }}
                >
                    {formattedValue}
                </Typography>
            </Box>
        </Box>
    );
};

/* ============================================================================
   DISPLAY NAME
============================================================================ */

FileInfoSummary.displayName =
    'FileInfoSummary';

export default FileInfoSummary;