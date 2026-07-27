import { useState, useEffect, useMemo, useRef } from 'react';

import {
    Box,
    Typography,
    TextField,
    List,
    ListItemButton,
    ListItemText,
    Paper,
    InputAdornment,
    Chip,
    IconButton,
    Tooltip,
} from '@mui/material';

import {
    SearchRounded,
    ClearRounded,
    ViewColumnRounded,
    NumbersRounded,
    TextFieldsRounded,
    CalendarMonthRounded,
    FunctionsRounded,
    AppsRounded,
    ArrowForwardRounded,
} from '@mui/icons-material';

/* ============================================================================
   COLUMN SELECTOR
============================================================================ */

function ColumnSelector({
    columns = [],
    onSelectColumn,
    searchTerm = '',
    setSearchTerm,
}) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const containerRef = useRef(null);

    /* ==========================================================================
       NORMALIZED COLUMNS
    ========================================================================== */

    const normalizedColumns = useMemo(() => {
        return Array.isArray(columns)
            ? columns.filter(
                  (column) =>
                      column !== null &&
                      column !== undefined &&
                      String(column).trim() !== ''
              )
            : [];
    }, [columns]);

    /* ==========================================================================
       COLUMN CATEGORIES
    ========================================================================== */

    const columnCategories = useMemo(() => {
        const matches = (column, keywords) => {
            const name = String(column).toLowerCase();

            return keywords.some((keyword) => name.includes(keyword));
        };

        return {
            all: normalizedColumns,

            numeric: normalizedColumns.filter((column) =>
                matches(column, [
                    'amount',
                    'price',
                    'qty',
                    'quantity',
                    'total',
                    'count',
                    'number',
                    'value',
                    'rate',
                    'ratio',
                    'percentage',
                    'percent',
                    'temp',
                    'temperature',
                    'pressure',
                    'flow',
                    'weight',
                    'volume',
                    'speed',
                ])
            ),

            text: normalizedColumns.filter((column) =>
                matches(column, [
                    'name',
                    'description',
                    'id',
                    'code',
                    'type',
                    'category',
                    'status',
                    'label',
                ])
            ),

            date: normalizedColumns.filter((column) =>
                matches(column, [
                    'date',
                    'time',
                    'timestamp',
                    'created',
                    'updated',
                    'year',
                    'month',
                    'day',
                ])
            ),

            calculated: normalizedColumns.filter((column) =>
                matches(column, [
                    'calc_',
                    'computed_',
                    'calculated_',
                    'formula_',
                    'derived_',
                ])
            ),
        };
    }, [normalizedColumns]);

    /* ==========================================================================
       CATEGORY CONFIGURATION
    ========================================================================== */

    const categories = useMemo(
        () => [
            {
                key: 'all',
                label: 'All',
                icon: <AppsRounded sx={{ fontSize: 15 }} />,
                count: columnCategories.all.length,
            },
            {
                key: 'numeric',
                label: 'Numeric',
                icon: <NumbersRounded sx={{ fontSize: 15 }} />,
                count: columnCategories.numeric.length,
            },
            {
                key: 'text',
                label: 'Text',
                icon: <TextFieldsRounded sx={{ fontSize: 15 }} />,
                count: columnCategories.text.length,
            },
            {
                key: 'date',
                label: 'Date',
                icon: <CalendarMonthRounded sx={{ fontSize: 15 }} />,
                count: columnCategories.date.length,
            },
            {
                key: 'calculated',
                label: 'Calculated',
                icon: <FunctionsRounded sx={{ fontSize: 15 }} />,
                count: columnCategories.calculated.length,
            },
        ],
        [columnCategories]
    );

    /* ==========================================================================
       FILTERING
    ========================================================================== */

    const filteredColumns = useMemo(() => {
        const categoryColumns =
            columnCategories[selectedCategory] || normalizedColumns;

        const query = String(searchTerm || '')
            .trim()
            .toLowerCase();

        if (!query) {
            return categoryColumns;
        }

        return categoryColumns.filter((column) =>
            String(column).toLowerCase().includes(query)
        );
    }, [
        normalizedColumns,
        searchTerm,
        selectedCategory,
        columnCategories,
    ]);

    /* ==========================================================================
       OUTSIDE CLICK
    ========================================================================== */

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );
        };
    }, []);

    /* ==========================================================================
       HANDLERS
    ========================================================================== */

    const handleSelectColumn = (column) => {
        if (typeof onSelectColumn === 'function') {
            onSelectColumn(column);
        }

        setIsDropdownOpen(false);

        if (typeof setSearchTerm === 'function') {
            setSearchTerm('');
        }
    };

    const handleSearchChange = (event) => {
        if (typeof setSearchTerm === 'function') {
            setSearchTerm(event.target.value);
        }

        setIsDropdownOpen(true);
    };

    const handleClearSearch = (event) => {
        event.stopPropagation();

        if (typeof setSearchTerm === 'function') {
            setSearchTerm('');
        }

        setIsDropdownOpen(true);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setIsDropdownOpen(true);
    };

    /* ==========================================================================
       COLUMN TYPE
    ========================================================================== */

    const getColumnType = (column) => {
        if (columnCategories.calculated.includes(column)) {
            return {
                label: 'Calculated',
                icon: <FunctionsRounded sx={{ fontSize: 15 }} />,
                bgcolor: '#F5F3FF',
                color: '#7C3AED',
            };
        }

        if (columnCategories.date.includes(column)) {
            return {
                label: 'Date',
                icon: <CalendarMonthRounded sx={{ fontSize: 15 }} />,
                bgcolor: '#FFF7ED',
                color: '#C2410C',
            };
        }

        if (columnCategories.numeric.includes(column)) {
            return {
                label: 'Numeric',
                icon: <NumbersRounded sx={{ fontSize: 15 }} />,
                bgcolor: '#EFF6FF',
                color: '#2563EB',
            };
        }

        if (columnCategories.text.includes(column)) {
            return {
                label: 'Text',
                icon: <TextFieldsRounded sx={{ fontSize: 15 }} />,
                bgcolor: '#ECFDF5',
                color: '#047857',
            };
        }

        return {
            label: 'Column',
            icon: <ViewColumnRounded sx={{ fontSize: 15 }} />,
            bgcolor: '#F1F5F9',
            color: '#64748B',
        };
    };

    /* ==========================================================================
       RENDER
    ========================================================================== */

    return (
        <Box
            ref={containerRef}
            id="column-selector"
            sx={{
                width: '100%',
                mb: 4,
                position: 'relative',
            }}
        >
            {/* ================================================================
                MAIN CARD
            ================================================================= */}

            <Paper
                elevation={0}
                sx={{
                    position: 'relative',
                    overflow: 'visible',

                    p: {
                        xs: 2,
                        sm: 2.5,
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

                        width: 140,
                        height: 140,

                        borderRadius: '50%',

                        bgcolor: '#EFF6FF',

                        right: -65,
                        top: -90,

                        pointerEvents: 'none',

                        overflow: 'hidden',
                    }}
                />

                {/* ============================================================
                    HEADER
                ============================================================ */}

                <Box
                    sx={{
                        position: 'relative',

                        display: 'flex',
                        alignItems: {
                            xs: 'flex-start',
                            sm: 'center',
                        },
                        justifyContent: 'space-between',

                        flexDirection: {
                            xs: 'column',
                            sm: 'row',
                        },

                        gap: 1.5,

                        mb: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.25,
                        }}
                    >
                        {/* Icon */}

                        <Box
                            sx={{
                                width: 40,
                                height: 40,

                                display: 'grid',
                                placeItems: 'center',

                                borderRadius: 2,

                                bgcolor: '#172B4D',
                                color: '#FFFFFF',

                                flexShrink: 0,

                                boxShadow:
                                    '0 6px 16px rgba(23, 43, 77, 0.16)',
                            }}
                        >
                            <ViewColumnRounded
                                sx={{
                                    fontSize: 20,
                                }}
                            />
                        </Box>

                        {/* Title */}

                        <Box>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    color: '#0F172A',

                                    fontWeight: 800,

                                    lineHeight: 1.25,

                                    letterSpacing:
                                        '-0.015em',
                                }}
                            >
                                Select Column
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
                                Search or browse available
                                dataset variables.
                            </Typography>
                        </Box>
                    </Box>

                    {/* Available count */}

                    <Chip
                        size="small"
                        label={`${normalizedColumns.length} ${
                            normalizedColumns.length === 1
                                ? 'column'
                                : 'columns'
                        }`}
                        sx={{
                            height: 27,

                            bgcolor: '#F1F5F9',
                            color: '#475569',

                            fontSize: '0.7rem',
                            fontWeight: 750,

                            '& .MuiChip-label': {
                                px: 1.15,
                            },
                        }}
                    />
                </Box>

                {/* ============================================================
                    SEARCH
                ============================================================ */}

                <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    placeholder="Search columns..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => setIsDropdownOpen(true)}
                    onClick={() => setIsDropdownOpen(true)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchRounded
                                    sx={{
                                        color: '#94A3B8',
                                        fontSize: 20,
                                    }}
                                />
                            </InputAdornment>
                        ),

                        endAdornment: searchTerm ? (
                            <InputAdornment position="end">
                                <MuiClearButton
                                    onClick={
                                        handleClearSearch
                                    }
                                />
                            </InputAdornment>
                        ) : null,
                    }}
                    sx={{
                        position: 'relative',

                        '& .MuiOutlinedInput-root': {
                            minHeight: 46,

                            borderRadius: 2.25,

                            bgcolor: '#FAFBFD',

                            transition:
                                'all 160ms ease',

                            '& fieldset': {
                                borderColor:
                                    '#D8E0EA',
                            },

                            '&:hover fieldset': {
                                borderColor:
                                    '#AEBACA',
                            },

                            '&.Mui-focused': {
                                bgcolor: '#FFFFFF',

                                boxShadow:
                                    '0 0 0 4px rgba(37, 99, 235, 0.07)',
                            },

                            '&.Mui-focused fieldset': {
                                borderColor:
                                    '#2563EB',

                                borderWidth:
                                    '1.5px',
                            },
                        },

                        '& input': {
                            color: '#334155',

                            fontSize: '0.86rem',

                            '&::placeholder': {
                                color: '#94A3B8',
                                opacity: 1,
                            },
                        },
                    }}
                />

                {/* ============================================================
                    CATEGORY FILTERS
                ============================================================ */}

                <Box
                    sx={{
                        display: 'flex',

                        gap: 0.75,

                        mt: 1.5,
                        pb: 0.25,

                        overflowX: 'auto',

                        scrollbarWidth: 'none',

                        '&::-webkit-scrollbar': {
                            display: 'none',
                        },
                    }}
                >
                    {categories.map((category) => {
                        const active =
                            selectedCategory ===
                            category.key;

                        return (
                            <Chip
                                key={category.key}
                                icon={category.icon}
                                label={`${category.label} · ${category.count}`}
                                size="small"
                                clickable
                                onClick={() =>
                                    handleCategoryChange(
                                        category.key
                                    )
                                }
                                sx={{
                                    height: 30,

                                    flexShrink: 0,

                                    borderRadius: 1.75,

                                    border: '1px solid',

                                    borderColor: active
                                        ? '#BFDBFE'
                                        : '#E2E8F0',

                                    bgcolor: active
                                        ? '#EFF6FF'
                                        : '#FFFFFF',

                                    color: active
                                        ? '#1D4ED8'
                                        : '#64748B',

                                    fontWeight: active
                                        ? 750
                                        : 600,

                                    fontSize:
                                        '0.69rem',

                                    transition:
                                        'all 150ms ease',

                                    '& .MuiChip-icon': {
                                        color: active
                                            ? '#2563EB'
                                            : '#94A3B8',
                                    },

                                    '&:hover': {
                                        bgcolor: active
                                            ? '#DBEAFE'
                                            : '#F8FAFC',
                                    },
                                }}
                            />
                        );
                    })}
                </Box>

                {/* ============================================================
                    RESULTS SUMMARY
                ============================================================ */}

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                            'space-between',

                        gap: 1,

                        mt: 1.4,

                        px: 0.25,
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#94A3B8',
                            fontSize: '0.68rem',
                        }}
                    >
                        {searchTerm
                            ? `${filteredColumns.length} result${
                                  filteredColumns.length ===
                                  1
                                      ? ''
                                      : 's'
                              } for "${searchTerm}"`
                            : `${filteredColumns.length} column${
                                  filteredColumns.length ===
                                  1
                                      ? ''
                                      : 's'
                              } in ${
                                  categories.find(
                                      (category) =>
                                          category.key ===
                                          selectedCategory
                                  )?.label ||
                                  'All'
                              }`}
                    </Typography>

                    {selectedCategory !== 'all' && (
                        <Typography
                            component="button"
                            type="button"
                            onClick={() =>
                                handleCategoryChange(
                                    'all'
                                )
                            }
                            sx={{
                                p: 0,

                                border: 0,

                                bgcolor:
                                    'transparent',

                                color: '#2563EB',

                                fontFamily:
                                    'inherit',

                                fontSize:
                                    '0.68rem',

                                fontWeight: 700,

                                cursor: 'pointer',

                                '&:hover': {
                                    textDecoration:
                                        'underline',
                                },
                            }}
                        >
                            Show all
                        </Typography>
                    )}
                </Box>

                {/* ============================================================
                    DROPDOWN
                ============================================================ */}

                {isDropdownOpen && (
                    <Paper
                        elevation={0}
                        sx={{
                            position: 'absolute',

                            zIndex: 1300,

                            top: 'calc(100% - 14px)',
                            left: {
                                xs: 16,
                                sm: 20,
                            },
                            right: {
                                xs: 16,
                                sm: 20,
                            },

                            overflow: 'hidden',

                            border:
                                '1px solid #DCE3EC',

                            borderRadius: 2.5,

                            bgcolor: '#FFFFFF',

                            boxShadow:
                                '0 18px 45px rgba(15, 23, 42, 0.16)',
                        }}
                    >
                        {filteredColumns.length >
                        0 ? (
                            <>
                                {/* Dropdown header */}

                                <Box
                                    sx={{
                                        display:
                                            'flex',

                                        alignItems:
                                            'center',

                                        justifyContent:
                                            'space-between',

                                        px: 1.5,
                                        py: 1.15,

                                        bgcolor:
                                            '#FAFBFD',

                                        borderBottom:
                                            '1px solid #EDF1F6',
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color:
                                                '#64748B',

                                            fontWeight:
                                                700,

                                            fontSize:
                                                '0.68rem',
                                        }}
                                    >
                                        Available
                                        columns
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color:
                                                '#94A3B8',

                                            fontSize:
                                                '0.67rem',
                                        }}
                                    >
                                        {
                                            filteredColumns.length
                                        }{' '}
                                        found
                                    </Typography>
                                </Box>

                                {/* Results */}

                                <List
                                    disablePadding
                                    sx={{
                                        maxHeight: 300,

                                        overflowY:
                                            'auto',

                                        p: 0.75,

                                        scrollbarWidth:
                                            'thin',

                                        scrollbarColor:
                                            '#CBD5E1 transparent',

                                        '&::-webkit-scrollbar':
                                            {
                                                width: 6,
                                            },

                                        '&::-webkit-scrollbar-thumb':
                                            {
                                                bgcolor:
                                                    '#CBD5E1',

                                                borderRadius: 10,
                                            },
                                    }}
                                >
                                    {filteredColumns.map(
                                        (
                                            column,
                                            index
                                        ) => {
                                            const type =
                                                getColumnType(
                                                    column
                                                );

                                            return (
                                                <ListItemButton
                                                    key={`${column}-${index}`}
                                                    onClick={() =>
                                                        handleSelectColumn(
                                                            column
                                                        )
                                                    }
                                                    sx={{
                                                        minHeight: 48,

                                                        px: 1.25,
                                                        py: 0.75,

                                                        mb:
                                                            index ===
                                                            filteredColumns.length -
                                                                1
                                                                ? 0
                                                                : 0.25,

                                                        borderRadius: 1.75,

                                                        transition:
                                                            'all 140ms ease',

                                                        '&:hover':
                                                            {
                                                                bgcolor:
                                                                    '#F8FAFC',

                                                                '& .column-arrow':
                                                                    {
                                                                        opacity: 1,

                                                                        transform:
                                                                            'translateX(0)',
                                                                    },
                                                            },
                                                    }}
                                                >
                                                    {/* Type icon */}

                                                    <Box
                                                        sx={{
                                                            width: 32,
                                                            height: 32,

                                                            display:
                                                                'grid',

                                                            placeItems:
                                                                'center',

                                                            mr: 1.2,

                                                            flexShrink: 0,

                                                            borderRadius: 1.5,

                                                            bgcolor:
                                                                type.bgcolor,

                                                            color:
                                                                type.color,
                                                        }}
                                                    >
                                                        {
                                                            type.icon
                                                        }
                                                    </Box>

                                                    {/* Name */}

                                                    <ListItemText
                                                        sx={{
                                                            my: 0,

                                                            minWidth: 0,
                                                        }}
                                                        primary={
                                                            column
                                                        }
                                                        secondary={
                                                            type.label
                                                        }
                                                        primaryTypographyProps={{
                                                            sx: {
                                                                color:
                                                                    '#334155',

                                                                fontSize:
                                                                    '0.82rem',

                                                                fontWeight: 650,

                                                                overflow:
                                                                    'hidden',

                                                                textOverflow:
                                                                    'ellipsis',

                                                                whiteSpace:
                                                                    'nowrap',
                                                            },
                                                        }}
                                                        secondaryTypographyProps={{
                                                            sx: {
                                                                color:
                                                                    '#94A3B8',

                                                                fontSize:
                                                                    '0.65rem',

                                                                mt: 0.1,
                                                            },
                                                        }}
                                                    />

                                                    <ArrowForwardRounded
                                                        className="column-arrow"
                                                        sx={{
                                                            ml: 1,

                                                            color:
                                                                '#94A3B8',

                                                            fontSize: 17,

                                                            opacity: 0,

                                                            transform:
                                                                'translateX(-4px)',

                                                            transition:
                                                                'all 150ms ease',
                                                        }}
                                                    />
                                                </ListItemButton>
                                            );
                                        }
                                    )}
                                </List>
                            </>
                        ) : (
                            /* ====================================================
                               EMPTY STATE
                            ==================================================== */

                            <Box
                                sx={{
                                    px: 3,
                                    py: 4,

                                    display: 'flex',
                                    flexDirection:
                                        'column',

                                    alignItems:
                                        'center',

                                    justifyContent:
                                        'center',

                                    textAlign:
                                        'center',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,

                                        display:
                                            'grid',

                                        placeItems:
                                            'center',

                                        mb: 1.3,

                                        borderRadius: 2,

                                        bgcolor:
                                            '#F1F5F9',

                                        color:
                                            '#94A3B8',
                                    }}
                                >
                                    <SearchRounded
                                        sx={{
                                            fontSize: 24,
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
                                    No columns found
                                </Typography>

                                <Typography
                                    variant="caption"
                                    sx={{
                                        mt: 0.5,

                                        maxWidth: 300,

                                        color:
                                            '#94A3B8',

                                        lineHeight: 1.5,
                                    }}
                                >
                                    {searchTerm
                                        ? `No columns matching "${searchTerm}" were found in this category.`
                                        : 'There are no columns available in this category.'}
                                </Typography>

                                {(searchTerm ||
                                    selectedCategory !==
                                        'all') && (
                                    <Box
                                        component="button"
                                        type="button"
                                        onClick={() => {
                                            if (
                                                typeof setSearchTerm ===
                                                'function'
                                            ) {
                                                setSearchTerm(
                                                    ''
                                                );
                                            }

                                            setSelectedCategory(
                                                'all'
                                            );
                                        }}
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

                                            cursor: 'pointer',

                                            '&:hover': {
                                                bgcolor:
                                                    '#F8FAFC',

                                                borderColor:
                                                    '#B8C4D4',
                                            },
                                        }}
                                    >
                                        Clear filters
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Paper>
                )}
            </Paper>
        </Box>
    );
}

/* ============================================================================
   CLEAR SEARCH BUTTON
============================================================================ */

const MuiClearButton = ({ onClick }) => {
    return (
        <Tooltip
            title="Clear search"
            arrow
        >
            <IconButton
                size="small"
                onClick={onClick}
                aria-label="Clear column search"
                sx={{
                    width: 28,
                    height: 28,

                    color: '#94A3B8',

                    '&:hover': {
                        bgcolor: '#F1F5F9',
                        color: '#475569',
                    },
                }}
            >
                <ClearRounded
                    sx={{
                        fontSize: 17,
                    }}
                />
            </IconButton>
        </Tooltip>
    );
};

export default ColumnSelector;