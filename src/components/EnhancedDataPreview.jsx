import React, {
    useState,
    useEffect,
    useMemo,
} from 'react';

import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Chip,
    Tooltip,
} from '@mui/material';

import {
    TableChartRounded,
    ViewColumnRounded,
    FilterAltRounded,
    SearchOffRounded,
    StorageRounded,
} from '@mui/icons-material';

import TableToolbar from './TableToolbar';
import DataTableHeader from './DataTableHeader';

/* ============================================================================
   ENHANCED DATA PREVIEW
============================================================================ */

const EnhancedDataPreview = React.memo(({
    title,
    data,
}) => {
    /* ==========================================================================
       CONFIGURATION
    ========================================================================== */

    const rowsPerPage = 5;

    /* ==========================================================================
       STATE
    ========================================================================== */

    const [page, setPage] = useState(0);

    const [columnFilters, setColumnFilters] = useState({});

    const [columnWidths, setColumnWidths] = useState({});

    const [visibleColumns, setVisibleColumns] = useState([]);

    /* ==========================================================================
       COLUMNS
    ========================================================================== */

    const columns = useMemo(() => {
        if (
            !Array.isArray(data) ||
            data.length === 0
        ) {
            return [];
        }

        /*
         * Use every key appearing in the dataset rather than only
         * Object.keys(data[0]). This prevents columns from disappearing
         * when later rows contain fields that the first row does not.
         */
        const keys = new Set();

        data.forEach((row) => {
            if (
                row &&
                typeof row === 'object' &&
                !Array.isArray(row)
            ) {
                Object.keys(row).forEach((key) => {
                    keys.add(key);
                });
            }
        });

        return Array.from(keys);
    }, [data]);

    /* ==========================================================================
       INITIALIZE COLUMNS
    ========================================================================== */

    useEffect(() => {
        if (columns.length === 0) {
            setColumnWidths({});
            setVisibleColumns([]);
            return;
        }

        const initialWidths = {};

        columns.forEach((column) => {
            /*
             * Give longer industrial/database column names a little more
             * breathing room while preventing absurdly wide headers.
             */
            initialWidths[column] = Math.min(
                280,
                Math.max(
                    130,
                    String(column).length * 9
                )
            );
        });

        setColumnWidths(initialWidths);

        /*
         * Keep existing visibility preferences where possible.
         * New columns are automatically made visible.
         */
        setVisibleColumns((previous) => {
            if (previous.length === 0) {
                return [...columns];
            }

            const stillAvailable =
                previous.filter((column) =>
                    columns.includes(column)
                );

            const newColumns =
                columns.filter(
                    (column) =>
                        !previous.includes(column)
                );

            return [
                ...stillAvailable,
                ...newColumns,
            ];
        });
    }, [columns]);

    /* ==========================================================================
       FILTER INFORMATION
    ========================================================================== */

    const activeFilters = useMemo(() => {
        return Object.entries(columnFilters)
            .filter(
                ([, value]) =>
                    value !== null &&
                    value !== undefined &&
                    String(value).trim() !== ''
            );
    }, [columnFilters]);

    const activeFilterCount =
        activeFilters.length;

    /* ==========================================================================
       FILTER DATA
    ========================================================================== */

    const filteredData = useMemo(() => {
        if (!Array.isArray(data)) {
            return [];
        }

        if (activeFilters.length === 0) {
            return data;
        }

        return data.filter((row) => {
            return activeFilters.every(
                ([column, filterValue]) => {
                    const cellValue =
                        row?.[column];

                    /*
                     * Null and undefined are handled explicitly.
                     * This also means numeric zero and boolean false
                     * remain searchable.
                     */
                    if (
                        cellValue === null ||
                        cellValue === undefined
                    ) {
                        return false;
                    }

                    return String(cellValue)
                        .toLowerCase()
                        .includes(
                            String(filterValue)
                                .toLowerCase()
                        );
                }
            );
        });
    }, [data, activeFilters]);

    /* ==========================================================================
       PAGINATION
    ========================================================================== */

    const pageCount = Math.max(
        1,
        Math.ceil(
            filteredData.length /
                rowsPerPage
        )
    );

    /*
     * If filtering reduces the number of pages while the user is on
     * a later page, bring the table back to a valid page.
     */
    useEffect(() => {
        if (page >= pageCount) {
            setPage(
                Math.max(
                    0,
                    pageCount - 1
                )
            );
        }
    }, [page, pageCount]);

    const displayData = useMemo(() => {
        const start =
            page * rowsPerPage;

        return filteredData.slice(
            start,
            start + rowsPerPage
        );
    }, [
        filteredData,
        page,
        rowsPerPage,
    ]);

    /* ==========================================================================
       HANDLERS
    ========================================================================== */

    const handleChangePage = (
        _event,
        newPage
    ) => {
        setPage(newPage);
    };

    const handleColumnFilterChange = (
        column,
        value
    ) => {
        setColumnFilters((previous) => ({
            ...previous,
            [column]: value,
        }));

        setPage(0);
    };

    const clearFilters = () => {
        setColumnFilters({});
        setPage(0);
    };

    const handleColumnVisibilityChange = (
        column
    ) => {
        if (column === 'all') {
            setVisibleColumns([
                ...columns,
            ]);

            return;
        }

        if (column === 'none') {
            setVisibleColumns([]);

            return;
        }

        setVisibleColumns((previous) => {
            if (
                previous.includes(column)
            ) {
                return previous.filter(
                    (item) =>
                        item !== column
                );
            }

            /*
             * Preserve the original dataset column order.
             */
            return columns.filter(
                (item) =>
                    previous.includes(item) ||
                    item === column
            );
        });
    };

    /* ==========================================================================
       CELL VALUE
    ========================================================================== */

    const formatCellValue = (value) => {
        if (
            value === undefined ||
            value === null
        ) {
            return '';
        }

        if (
            typeof value === 'object'
        ) {
            try {
                return JSON.stringify(value);
            } catch {
                return String(value);
            }
        }

        return String(value);
    };

    /* ==========================================================================
       DATASET INFORMATION
    ========================================================================== */

    const totalRows =
        Array.isArray(data)
            ? data.length
            : 0;

    const visibleColumnCount =
        visibleColumns.length;

    const isFiltered =
        activeFilterCount > 0;

    /* ==========================================================================
       RENDER
    ========================================================================== */

    return (
        <Paper
            elevation={0}
            sx={{
                width: '100%',

                overflow: 'hidden',

                border:
                    '1px solid #E5EAF2',

                borderRadius: 3,

                bgcolor: '#FFFFFF',

                backgroundImage: 'none',

                boxShadow:
                    '0 8px 26px rgba(15, 23, 42, 0.05)',
            }}
        >
            {/* ================================================================
                HEADER
            ================================================================= */}

            <Box
                sx={{
                    px: {
                        xs: 2,
                        sm: 2.5,
                    },

                    py: 1.75,

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

                    gap: 1.5,

                    borderBottom:
                        '1px solid #EDF1F6',

                    bgcolor: '#FCFDFE',
                }}
            >
                {/* ============================================================
                    TITLE
                ============================================================ */}

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.1,

                        minWidth: 0,
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

                            bgcolor: '#EFF6FF',
                            color: '#2563EB',

                            border:
                                '1px solid #DBEAFE',
                        }}
                    >
                        <TableChartRounded
                            sx={{
                                fontSize: 19,
                            }}
                        />
                    </Box>

                    <Box
                        sx={{
                            minWidth: 0,
                        }}
                    >
                        <Typography
                            variant="body2"
                            title={title}
                            sx={{
                                color:
                                    '#1E293B',

                                fontWeight: 800,

                                lineHeight: 1.25,

                                overflow:
                                    'hidden',

                                textOverflow:
                                    'ellipsis',

                                whiteSpace:
                                    'nowrap',
                            }}
                        >
                            {title}
                        </Typography>

                        <Typography
                            variant="caption"
                            sx={{
                                display:
                                    'block',

                                mt: 0.2,

                                color:
                                    '#94A3B8',

                                fontSize:
                                    '0.68rem',
                            }}
                        >
                            Dataset preview
                            and column
                            inspection
                        </Typography>
                    </Box>
                </Box>

                {/* ============================================================
                    DATASET METRICS
                ============================================================ */}

                <Box
                    sx={{
                        display: 'flex',

                        alignItems: 'center',

                        gap: 0.7,

                        flexWrap: 'wrap',
                    }}
                >
                    <Chip
                        size="small"
                        icon={
                            <StorageRounded />
                        }
                        label={`${totalRows.toLocaleString()} ${
                            totalRows === 1
                                ? 'row'
                                : 'rows'
                        }`}
                        sx={{
                            height: 27,

                            bgcolor:
                                '#F1F5F9',

                            color:
                                '#475569',

                            fontSize:
                                '0.68rem',

                            fontWeight: 750,

                            '& .MuiChip-icon':
                                {
                                    color:
                                        '#64748B',

                                    fontSize:
                                        '15px !important',
                                },
                        }}
                    />

                    <Chip
                        size="small"
                        icon={
                            <ViewColumnRounded />
                        }
                        label={`${visibleColumnCount}/${columns.length} columns`}
                        sx={{
                            height: 27,

                            bgcolor:
                                '#F5F3FF',

                            color:
                                '#6D28D9',

                            fontSize:
                                '0.68rem',

                            fontWeight: 750,

                            '& .MuiChip-icon':
                                {
                                    color:
                                        '#7C3AED',

                                    fontSize:
                                        '15px !important',
                                },
                        }}
                    />

                    {isFiltered && (
                        <Chip
                            size="small"
                            icon={
                                <FilterAltRounded />
                            }
                            label={`${activeFilterCount} ${
                                activeFilterCount ===
                                1
                                    ? 'filter'
                                    : 'filters'
                            }`}
                            sx={{
                                height: 27,

                                bgcolor:
                                    '#FFF7ED',

                                color:
                                    '#C2410C',

                                fontSize:
                                    '0.68rem',

                                fontWeight: 750,

                                '& .MuiChip-icon':
                                    {
                                        color:
                                            '#EA580C',

                                        fontSize:
                                            '15px !important',
                                    },
                            }}
                        />
                    )}
                </Box>
            </Box>

            {/* ================================================================
                TOOLBAR
            ================================================================= */}

            <Box
                sx={{
                    px: {
                        xs: 1.5,
                        sm: 2,
                    },

                    py: 1.5,

                    borderBottom:
                        '1px solid #EDF1F6',

                    bgcolor: '#FFFFFF',
                }}
            >
                <TableToolbar
                    columnFilters={
                        columnFilters
                    }
                    onClearFilters={
                        clearFilters
                    }
                    columns={columns}
                    visibleColumns={
                        visibleColumns
                    }
                    onColumnVisibilityChange={
                        handleColumnVisibilityChange
                    }
                />
            </Box>

            {/* ================================================================
                RESULT INFORMATION
            ================================================================= */}

            {isFiltered && (
                <Box
                    sx={{
                        px: {
                            xs: 2,
                            sm: 2.5,
                        },

                        py: 1,

                        display: 'flex',

                        alignItems:
                            'center',

                        justifyContent:
                            'space-between',

                        gap: 1,

                        bgcolor:
                            '#FFFBF5',

                        borderBottom:
                            '1px solid #FEF3E2',
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            color:
                                '#9A5B13',

                            fontSize:
                                '0.69rem',

                            fontWeight: 600,
                        }}
                    >
                        Showing{' '}
                        <Box
                            component="span"
                            sx={{
                                fontWeight:
                                    800,
                            }}
                        >
                            {filteredData.length.toLocaleString()}
                        </Box>{' '}
                        of{' '}
                        {totalRows.toLocaleString()}{' '}
                        rows
                    </Typography>

                    <Box
                        component="button"
                        type="button"
                        onClick={
                            clearFilters
                        }
                        sx={{
                            p: 0,

                            border: 0,

                            bgcolor:
                                'transparent',

                            color:
                                '#C2410C',

                            fontFamily:
                                'inherit',

                            fontSize:
                                '0.68rem',

                            fontWeight: 750,

                            cursor:
                                'pointer',

                            '&:hover': {
                                textDecoration:
                                    'underline',
                            },
                        }}
                    >
                        Clear filters
                    </Box>
                </Box>
            )}

            {/* ================================================================
                TABLE
            ================================================================= */}

            {visibleColumns.length >
            0 ? (
                <TableContainer
                    sx={{
                        maxHeight: 410,

                        overflow: 'auto',

                        scrollbarWidth:
                            'thin',

                        scrollbarColor:
                            '#CBD5E1 #F8FAFC',

                        '&::-webkit-scrollbar':
                            {
                                width: 8,
                                height: 8,
                            },

                        '&::-webkit-scrollbar-track':
                            {
                                bgcolor:
                                    '#F8FAFC',
                            },

                        '&::-webkit-scrollbar-thumb':
                            {
                                bgcolor:
                                    '#CBD5E1',

                                borderRadius: 10,

                                border:
                                    '2px solid #F8FAFC',
                            },

                        '&::-webkit-scrollbar-thumb:hover':
                            {
                                bgcolor:
                                    '#94A3B8',
                            },
                    }}
                >
                    <Table
                        stickyHeader
                        size="small"
                        aria-label={`${title} data table`}
                        sx={{
                            minWidth:
                                'max-content',

                            borderCollapse:
                                'separate',

                            borderSpacing: 0,
                        }}
                    >
                        {/* ====================================================
                            TABLE HEADER
                        ==================================================== */}

                        <TableHead>
                            <TableRow>
                                {columns
                                    .filter(
                                        (
                                            column
                                        ) =>
                                            visibleColumns.includes(
                                                column
                                            )
                                    )
                                    .map(
                                        (
                                            column
                                        ) => (
                                            <TableCell
                                                key={
                                                    column
                                                }
                                                sx={{
                                                    minWidth:
                                                        columnWidths[
                                                            column
                                                        ] ||
                                                        130,

                                                    maxWidth:
                                                        300,

                                                    px: 1.5,
                                                    py: 1.15,

                                                    whiteSpace:
                                                        'nowrap',

                                                    bgcolor:
                                                        '#172B4D',

                                                    color:
                                                        '#FFFFFF',

                                                    borderBottom:
                                                        '1px solid #243C61',

                                                    borderRight:
                                                        '1px solid rgba(255,255,255,0.07)',

                                                    /*
                                                     * Required because
                                                     * sticky MUI table
                                                     * headers receive
                                                     * their own background.
                                                     */
                                                    '&.MuiTableCell-stickyHeader':
                                                        {
                                                            bgcolor:
                                                                '#172B4D',
                                                        },

                                                    '&:last-of-type':
                                                        {
                                                            borderRight:
                                                                0,
                                                        },
                                                }}
                                            >
                                                <DataTableHeader
                                                    column={
                                                        column
                                                    }
                                                    columnFilters={
                                                        columnFilters
                                                    }
                                                    onColumnFilterChange={
                                                        handleColumnFilterChange
                                                    }
                                                />
                                            </TableCell>
                                        )
                                    )}
                            </TableRow>
                        </TableHead>

                        {/* ====================================================
                            TABLE BODY
                        ==================================================== */}

                        <TableBody>
                            {displayData.length >
                            0 ? (
                                displayData.map(
                                    (
                                        row,
                                        rowIndex
                                    ) => (
                                        <TableRow
                                            key={`${page}-${rowIndex}`}
                                            hover
                                            sx={{
                                                bgcolor:
                                                    rowIndex %
                                                        2 ===
                                                    0
                                                        ? '#FFFFFF'
                                                        : '#FAFBFD',

                                                transition:
                                                    'background-color 120ms ease',

                                                '&:hover':
                                                    {
                                                        bgcolor:
                                                            '#F4F8FD !important',
                                                    },

                                                '&:last-child td':
                                                    {
                                                        borderBottom:
                                                            0,
                                                    },
                                            }}
                                        >
                                            {columns
                                                .filter(
                                                    (
                                                        column
                                                    ) =>
                                                        visibleColumns.includes(
                                                            column
                                                        )
                                                )
                                                .map(
                                                    (
                                                        column
                                                    ) => {
                                                        const value =
                                                            formatCellValue(
                                                                row?.[
                                                                    column
                                                                ]
                                                            );

                                                        return (
                                                            <TableCell
                                                                key={
                                                                    column
                                                                }
                                                                sx={{
                                                                    maxWidth:
                                                                        300,

                                                                    px: 1.5,
                                                                    py: 1.2,

                                                                    color:
                                                                        '#475569',

                                                                    fontSize:
                                                                        '0.79rem',

                                                                    lineHeight: 1.45,

                                                                    borderBottom:
                                                                        '1px solid #EDF1F6',

                                                                    borderRight:
                                                                        '1px solid #F1F4F8',

                                                                    '&:last-of-type':
                                                                        {
                                                                            borderRight:
                                                                                0,
                                                                        },
                                                                }}
                                                            >
                                                                <Tooltip
                                                                    title={
                                                                        value
                                                                    }
                                                                    placement="top"
                                                                    arrow
                                                                    enterDelay={
                                                                        700
                                                                    }
                                                                    disableHoverListener={
                                                                        value.length <
                                                                        35
                                                                    }
                                                                >
                                                                    <Box
                                                                        component="span"
                                                                        sx={{
                                                                            display:
                                                                                'block',

                                                                            maxWidth:
                                                                                280,

                                                                            overflow:
                                                                                'hidden',

                                                                            textOverflow:
                                                                                'ellipsis',

                                                                            whiteSpace:
                                                                                'nowrap',
                                                                        }}
                                                                    >
                                                                        {value ||
                                                                            (
                                                                                <Box
                                                                                    component="span"
                                                                                    sx={{
                                                                                        color:
                                                                                            '#CBD5E1',
                                                                                    }}
                                                                                >
                                                                                    —
                                                                                </Box>
                                                                            )}
                                                                    </Box>
                                                                </Tooltip>
                                                            </TableCell>
                                                        );
                                                    }
                                                )}
                                        </TableRow>
                                    )
                                )
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={
                                            visibleColumns.length
                                        }
                                        sx={{
                                            border: 0,
                                            p: 0,
                                        }}
                                    >
                                        <EmptyTableState
                                            filtered={
                                                isFiltered
                                            }
                                            onClearFilters={
                                                clearFilters
                                            }
                                        />
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                /* ============================================================
                   NO VISIBLE COLUMNS
                ============================================================ */

                <Box
                    sx={{
                        minHeight: 260,

                        display: 'flex',

                        flexDirection:
                            'column',

                        alignItems:
                            'center',

                        justifyContent:
                            'center',

                        textAlign:
                            'center',

                        px: 3,
                        py: 4,

                        bgcolor:
                            '#FAFBFD',
                    }}
                >
                    <Box
                        sx={{
                            width: 52,
                            height: 52,

                            display: 'grid',
                            placeItems:
                                'center',

                            mb: 1.4,

                            borderRadius: 2.5,

                            bgcolor:
                                '#F1F5F9',

                            color:
                                '#94A3B8',
                        }}
                    >
                        <ViewColumnRounded
                            sx={{
                                fontSize: 26,
                            }}
                        />
                    </Box>

                    <Typography
                        variant="body2"
                        sx={{
                            color:
                                '#334155',

                            fontWeight: 750,
                        }}
                    >
                        No columns visible
                    </Typography>

                    <Typography
                        variant="caption"
                        sx={{
                            mt: 0.5,

                            maxWidth: 330,

                            color:
                                '#94A3B8',

                            lineHeight: 1.6,
                        }}
                    >
                        Use the column
                        visibility controls
                        above to select the
                        columns you want to
                        preview.
                    </Typography>

                    {columns.length >
                        0 && (
                        <Box
                            component="button"
                            type="button"
                            onClick={() =>
                                handleColumnVisibilityChange(
                                    'all'
                                )
                            }
                            sx={{
                                mt: 1.5,

                                px: 1.5,
                                py: 0.75,

                                border:
                                    '1px solid #D8E0EA',

                                borderRadius: 1.75,

                                bgcolor:
                                    '#FFFFFF',

                                color:
                                    '#475569',

                                fontFamily:
                                    'inherit',

                                fontSize:
                                    '0.72rem',

                                fontWeight: 700,

                                cursor:
                                    'pointer',

                                '&:hover': {
                                    bgcolor:
                                        '#F8FAFC',

                                    borderColor:
                                        '#B8C4D4',
                                },
                            }}
                        >
                            Show all columns
                        </Box>
                    )}
                </Box>
            )}

            {/* ================================================================
                FOOTER / PAGINATION
            ================================================================= */}

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

                    justifyContent:
                        'space-between',

                    gap: 1,

                    px: {
                        xs: 1.5,
                        sm: 2,
                    },

                    borderTop:
                        '1px solid #EDF1F6',

                    bgcolor: '#FCFDFE',
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        display: {
                            xs: 'none',
                            md: 'block',
                        },

                        color: '#94A3B8',

                        fontSize:
                            '0.67rem',

                        whiteSpace:
                            'nowrap',
                    }}
                >
                    Previewing up to{' '}
                    {rowsPerPage} rows per
                    page
                </Typography>

                <TablePagination
                    component="div"

                    count={
                        filteredData.length
                    }

                    rowsPerPage={
                        rowsPerPage
                    }

                    page={page}

                    onPageChange={
                        handleChangePage
                    }

                    labelDisplayedRows={({
                        from,
                        to,
                        count,
                    }) =>
                        count === 0
                            ? '0 rows'
                            : `${from}–${to} of ${count.toLocaleString()}`
                    }

                    rowsPerPageOptions={[]}

                    sx={{
                        ml: 'auto',

                        color: '#64748B',

                        border: 0,

                        '& .MuiTablePagination-toolbar':
                            {
                                minHeight: 52,

                                px: {
                                    xs: 0,
                                    sm: 1,
                                },
                            },

                        '& .MuiTablePagination-displayedRows':
                            {
                                fontSize:
                                    '0.72rem',

                                fontWeight: 650,

                                color:
                                    '#64748B',
                            },

                        '& .MuiTablePagination-actions':
                            {
                                ml: 1,
                            },

                        '& .MuiIconButton-root':
                            {
                                width: 32,
                                height: 32,

                                borderRadius: 1.5,

                                color:
                                    '#64748B',

                                '&:hover': {
                                    bgcolor:
                                        '#F1F5F9',

                                    color:
                                        '#1E293B',
                                },

                                '&.Mui-disabled':
                                    {
                                        color:
                                            '#CBD5E1',
                                    },
                            },
                    }}
                />
            </Box>
        </Paper>
    );
});

/* ============================================================================
   EMPTY TABLE STATE
============================================================================ */

const EmptyTableState = ({
    filtered,
    onClearFilters,
}) => {
    return (
        <Box
            sx={{
                minHeight: 260,

                display: 'flex',

                flexDirection:
                    'column',

                alignItems:
                    'center',

                justifyContent:
                    'center',

                textAlign:
                    'center',

                px: 3,
                py: 4,

                bgcolor:
                    '#FAFBFD',
            }}
        >
            <Box
                sx={{
                    width: 52,
                    height: 52,

                    display: 'grid',
                    placeItems: 'center',

                    mb: 1.4,

                    borderRadius: 2.5,

                    bgcolor: filtered
                        ? '#FFF7ED'
                        : '#F1F5F9',

                    color: filtered
                        ? '#C2410C'
                        : '#94A3B8',
                }}
            >
                {filtered ? (
                    <SearchOffRounded
                        sx={{
                            fontSize: 26,
                        }}
                    />
                ) : (
                    <StorageRounded
                        sx={{
                            fontSize: 25,
                        }}
                    />
                )}
            </Box>

            <Typography
                variant="body2"
                sx={{
                    color: '#334155',

                    fontWeight: 750,
                }}
            >
                {filtered
                    ? 'No matching rows found'
                    : 'No data available'}
            </Typography>

            <Typography
                variant="caption"
                sx={{
                    mt: 0.5,

                    maxWidth: 330,

                    color: '#94A3B8',

                    lineHeight: 1.6,
                }}
            >
                {filtered
                    ? 'The current filters do not match any rows in this dataset. Try adjusting or clearing them.'
                    : 'There are no rows available to preview in this dataset.'}
            </Typography>

            {filtered && (
                <Box
                    component="button"
                    type="button"
                    onClick={
                        onClearFilters
                    }
                    sx={{
                        mt: 1.5,

                        px: 1.5,
                        py: 0.75,

                        border:
                            '1px solid #FED7AA',

                        borderRadius: 1.75,

                        bgcolor:
                            '#FFFFFF',

                        color:
                            '#C2410C',

                        fontFamily:
                            'inherit',

                        fontSize:
                            '0.72rem',

                        fontWeight: 700,

                        cursor: 'pointer',

                        '&:hover': {
                            bgcolor:
                                '#FFF7ED',
                        },
                    }}
                >
                    Clear filters
                </Box>
            )}
        </Box>
    );
};

/* ============================================================================
   DISPLAY NAME
============================================================================ */

EnhancedDataPreview.displayName =
    'EnhancedDataPreview';

export default EnhancedDataPreview;