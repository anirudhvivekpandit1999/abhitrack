import React from 'react';

import {
    Box,
    Typography,
    Chip,
    Paper,
    Divider,
} from '@mui/material';

import {
    TableChartRounded,
    RemoveCircleOutlineRounded,
    AddCircleOutlineRounded,
    CompareArrowsRounded,
} from '@mui/icons-material';

import EnhancedDataPreview from './EnhancedDataPreview';

/* ============================================================================
   DATA PREVIEW SECTION
============================================================================ */

const DataPreviewSection = React.memo(
    ({
        withoutProductData,
        withProductData,
        hasErrors,
    }) => {
        /* ====================================================================
           VALIDATION
        ==================================================================== */

        if (
            !withoutProductData ||
            !withProductData ||
            hasErrors
        ) {
            return null;
        }

        /* ====================================================================
           DATA SUMMARY
        ==================================================================== */

        const withoutCount = Array.isArray(withoutProductData)
            ? withoutProductData.length
            : 0;

        const withCount = Array.isArray(withProductData)
            ? withProductData.length
            : 0;

        const totalRows = withoutCount + withCount;

        /* ====================================================================
           RENDER
        ==================================================================== */

        return (
            <Box
                sx={{
                    width: '100%',
                    mb: 4,
                }}
            >
                {/* ============================================================
                    SECTION HEADER
                ============================================================ */}

                <Paper
                    elevation={0}
                    sx={{
                        position: 'relative',
                        overflow: 'hidden',

                        mb: 2.5,

                        px: {
                            xs: 2,
                            sm: 2.5,
                        },

                        py: {
                            xs: 2,
                            sm: 2.25,
                        },

                        border: '1px solid #E5EAF2',
                        borderRadius: 3,

                        bgcolor: '#FFFFFF',

                        boxShadow:
                            '0 8px 28px rgba(15, 23, 42, 0.055)',
                    }}
                >
                    {/* Decorative background */}

                    <Box
                        sx={{
                            position: 'absolute',

                            width: 160,
                            height: 160,

                            borderRadius: '50%',

                            bgcolor: '#EFF6FF',

                            right: -70,
                            top: -100,

                            pointerEvents: 'none',
                        }}
                    />

                    <Box
                        sx={{
                            position: 'absolute',

                            width: 80,
                            height: 80,

                            borderRadius: '50%',

                            bgcolor: '#F5F3FF',

                            right: 95,
                            bottom: -60,

                            pointerEvents: 'none',
                        }}
                    />

                    <Box
                        sx={{
                            position: 'relative',

                            display: 'flex',

                            flexDirection: {
                                xs: 'column',
                                sm: 'row',
                            },

                            alignItems: {
                                xs: 'flex-start',
                                sm: 'center',
                            },

                            justifyContent: 'space-between',

                            gap: 2,
                        }}
                    >
                        {/* ====================================================
                            TITLE
                        ==================================================== */}

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.4,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 44,
                                    height: 44,

                                    display: 'grid',
                                    placeItems: 'center',

                                    flexShrink: 0,

                                    borderRadius: 2.25,

                                    bgcolor: '#172B4D',
                                    color: '#FFFFFF',

                                    boxShadow:
                                        '0 7px 18px rgba(23, 43, 77, 0.17)',
                                }}
                            >
                                <TableChartRounded
                                    sx={{
                                        fontSize: 22,
                                    }}
                                />
                            </Box>

                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: '#0F172A',

                                        fontWeight: 800,

                                        fontSize: {
                                            xs: '1rem',
                                            sm: '1.1rem',
                                        },

                                        lineHeight: 1.25,

                                        letterSpacing:
                                            '-0.015em',
                                    }}
                                >
                                    Data Preview
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        mt: 0.35,

                                        color: '#64748B',

                                        fontSize: {
                                            xs: '0.75rem',
                                            sm: '0.8rem',
                                        },
                                    }}
                                >
                                    Review and compare your
                                    datasets before continuing
                                    with the analysis.
                                </Typography>
                            </Box>
                        </Box>

                        {/* ====================================================
                            SUMMARY CHIPS
                        ==================================================== */}

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
                                label={`${totalRows.toLocaleString()} total rows`}
                                sx={{
                                    height: 28,

                                    bgcolor: '#F1F5F9',
                                    color: '#475569',

                                    fontWeight: 750,
                                    fontSize: '0.7rem',

                                    '& .MuiChip-label': {
                                        px: 1.2,
                                    },
                                }}
                            />

                            <Chip
                                size="small"
                                icon={
                                    <CompareArrowsRounded
                                        sx={{
                                            fontSize:
                                                '15px !important',
                                        }}
                                    />
                                }
                                label="2 datasets"
                                sx={{
                                    height: 28,

                                    bgcolor: '#EFF6FF',
                                    color: '#2563EB',

                                    fontWeight: 750,
                                    fontSize: '0.7rem',

                                    '& .MuiChip-icon': {
                                        color: '#2563EB',
                                    },

                                    '& .MuiChip-label': {
                                        px: 1,
                                    },
                                }}
                            />
                        </Box>
                    </Box>
                </Paper>

                {/* ============================================================
                    DATASETS
                ============================================================ */}

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2.5,
                    }}
                >
                    {/* ========================================================
                        WITHOUT PRODUCT
                    ======================================================== */}

                    <DatasetPreviewCard
                        title="Without Product"
                        description="Baseline dataset used for comparison"
                        count={withoutCount}
                        type="without"
                    >
                        <EnhancedDataPreview
                            title="Without Product"
                            data={withoutProductData}
                        />
                    </DatasetPreviewCard>

                    {/* ========================================================
                        COMPARISON DIVIDER
                    ======================================================== */}

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,

                            px: {
                                xs: 1,
                                sm: 3,
                            },
                        }}
                    >
                        <Divider
                            sx={{
                                flex: 1,
                                borderColor: '#E5EAF2',
                            }}
                        />

                        <Chip
                            size="small"
                            icon={
                                <CompareArrowsRounded
                                    sx={{
                                        fontSize:
                                            '14px !important',
                                    }}
                                />
                            }
                            label="Compare"
                            sx={{
                                height: 26,

                                bgcolor: '#FFFFFF',

                                border:
                                    '1px solid #E2E8F0',

                                color: '#64748B',

                                fontWeight: 700,
                                fontSize: '0.68rem',

                                '& .MuiChip-icon': {
                                    color: '#94A3B8',
                                },
                            }}
                        />

                        <Divider
                            sx={{
                                flex: 1,
                                borderColor: '#E5EAF2',
                            }}
                        />
                    </Box>

                    {/* ========================================================
                        WITH PRODUCT
                    ======================================================== */}

                    <DatasetPreviewCard
                        title="With Product"
                        description="Product dataset used for comparison"
                        count={withCount}
                        type="with"
                    >
                        <EnhancedDataPreview
                            title="With Product"
                            data={withProductData}
                        />
                    </DatasetPreviewCard>
                </Box>
            </Box>
        );
    }
);

/* ============================================================================
   DATASET PREVIEW CARD
============================================================================ */

const DatasetPreviewCard = ({
    title,
    description,
    count,
    type,
    children,
}) => {
    const isWithProduct = type === 'with';

    const accent = isWithProduct
        ? {
              background: '#ECFDF5',
              color: '#047857',
              border: '#D1FAE5',
              icon: (
                  <AddCircleOutlineRounded
                      sx={{
                          fontSize: 19,
                      }}
                  />
              ),
          }
        : {
              background: '#FFF7ED',
              color: '#C2410C',
              border: '#FFEDD5',
              icon: (
                  <RemoveCircleOutlineRounded
                      sx={{
                          fontSize: 19,
                      }}
                  />
              ),
          };

    return (
        <Paper
            elevation={0}
            sx={{
                overflow: 'hidden',

                border: '1px solid #E5EAF2',
                borderRadius: 3,

                bgcolor: '#FFFFFF',

                boxShadow:
                    '0 8px 24px rgba(15, 23, 42, 0.045)',
            }}
        >
            {/* ================================================================
                DATASET HEADER
            ================================================================= */}

            <Box
                sx={{
                    display: 'flex',

                    flexDirection: {
                        xs: 'column',
                        sm: 'row',
                    },

                    alignItems: {
                        xs: 'flex-start',
                        sm: 'center',
                    },

                    justifyContent: 'space-between',

                    gap: 1.5,

                    px: {
                        xs: 2,
                        sm: 2.5,
                    },

                    py: 1.75,

                    borderBottom: '1px solid #EDF1F6',

                    bgcolor: '#FCFDFE',
                }}
            >
                {/* Dataset information */}

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.1,
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

                            bgcolor: accent.background,
                            color: accent.color,

                            border: `1px solid ${accent.border}`,
                        }}
                    >
                        {accent.icon}
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

                                fontSize: '0.68rem',
                            }}
                        >
                            {description}
                        </Typography>
                    </Box>
                </Box>

                {/* Row count */}

                <Chip
                    size="small"
                    label={`${count.toLocaleString()} ${
                        count === 1 ? 'row' : 'rows'
                    }`}
                    sx={{
                        height: 26,

                        bgcolor: accent.background,
                        color: accent.color,

                        border: `1px solid ${accent.border}`,

                        fontWeight: 750,
                        fontSize: '0.68rem',

                        '& .MuiChip-label': {
                            px: 1.1,
                        },
                    }}
                />
            </Box>

            {/* ================================================================
                EXISTING DATA PREVIEW
            ================================================================= */}

            <Box
                sx={{
                    p: {
                        xs: 1.5,
                        sm: 2,
                    },

                    /*
                     * EnhancedDataPreview is intentionally left untouched.
                     * This wrapper gives it consistent spacing while allowing
                     * the existing component to control its table UI.
                     */

                    '& > *': {
                        width: '100%',
                    },
                }}
            >
                {children}
            </Box>
        </Paper>
    );
};

/* ============================================================================
   DISPLAY NAME
============================================================================ */

DataPreviewSection.displayName = 'DataPreviewSection';

export default DataPreviewSection;