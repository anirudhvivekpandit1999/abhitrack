import React from 'react';

import {
    Box,
    Typography,
    Tooltip,
} from '@mui/material';

import ViewColumnRoundedIcon from '@mui/icons-material/ViewColumnRounded';

/* ============================================================================
   DATA TABLE HEADER
============================================================================ */

const DataTableHeader = React.memo(({ column }) => {
    const columnName = column || 'Unnamed Column';

    return (
        <Tooltip
            title={columnName}
            placement="top"
            arrow
            enterDelay={600}
        >
            <Box
                sx={{
                    width: '100%',
                    minWidth: 0,

                    display: 'flex',
                    alignItems: 'center',

                    gap: 0.9,

                    py: 0.5,

                    cursor: 'default',

                    transition: 'opacity 150ms ease',

                    '&:hover': {
                        '& .column-header-icon': {
                            opacity: 1,
                            transform: 'translateY(0)',
                        },

                        '& .column-header-text': {
                            opacity: 1,
                        },
                    },
                }}
            >
                {/* ============================================================
                    COLUMN ICON
                ============================================================ */}

                <Box
                    className="column-header-icon"
                    sx={{
                        width: 24,
                        height: 24,

                        flexShrink: 0,

                        display: 'grid',
                        placeItems: 'center',

                        borderRadius: 1.25,

                        bgcolor: 'rgba(255, 255, 255, 0.12)',

                        border:
                            '1px solid rgba(255, 255, 255, 0.12)',

                        color: 'rgba(255, 255, 255, 0.88)',

                        opacity: 0.9,

                        transform: 'translateY(1px)',

                        transition:
                            'all 150ms ease',
                    }}
                >
                    <ViewColumnRoundedIcon
                        sx={{
                            fontSize: 14,
                        }}
                    />
                </Box>

                {/* ============================================================
                    COLUMN NAME
                ============================================================ */}

                <Box
                    sx={{
                        minWidth: 0,
                        flex: 1,
                    }}
                >
                    <Typography
                        className="column-header-text"
                        variant="caption"
                        sx={{
                            display: 'block',

                            width: '100%',

                            color: '#FFFFFF',

                            fontWeight: 750,

                            fontSize: {
                                xs: '0.7rem',
                                sm: '0.74rem',
                            },

                            lineHeight: 1.25,

                            letterSpacing: '0.015em',

                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',

                            opacity: 0.94,

                            transition:
                                'opacity 150ms ease',
                        }}
                    >
                        {columnName}
                    </Typography>
                </Box>
            </Box>
        </Tooltip>
    );
});

/* ============================================================================
   DISPLAY NAME
============================================================================ */

DataTableHeader.displayName = 'DataTableHeader';

export default DataTableHeader;