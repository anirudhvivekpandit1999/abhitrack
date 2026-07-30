import React from 'react';

import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Chip,
} from '@mui/material';

import FunctionsRoundedIcon from '@mui/icons-material/FunctionsRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

const ColumnSelectionForm = ({
    columns = [],
    selectedColumn = '',
    secondaryColumn = '',
    onColumnChange,
    onSecondaryColumnChange,
    disabled = false,
}) => {
    const hasColumns = columns.length > 0;

    const selectStyles = {
        borderRadius: 2,
        bgcolor: '#FFFFFF',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#334155',

        '& .MuiSelect-select': {
            py: 1.4,
        },

        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D8E0EA',
        },

        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#94A3B8',
        },

        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2563EB',
            borderWidth: '1.5px',
        },

        '&.Mui-disabled': {
            bgcolor: '#F8FAFC',
        },
    };

    return (
        <Box
            sx={{
                width: '100%',
                mb: 4,
                p: {
                    xs: 2,
                    sm: 2.5,
                },
                boxSizing: 'border-box',

                bgcolor: '#FFFFFF',

                border: '1px solid #E5EAF2',
                borderRadius: 3,

                boxShadow: '0 8px 28px rgba(15, 23, 42, 0.055)',

                position: 'relative',
                overflow: 'hidden',
            }}
        >
            

            <Box
                sx={{
                    position: 'absolute',
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    bgcolor: '#EFF6FF',
                    right: -70,
                    top: -95,
                    pointerEvents: 'none',
                }}
            />

            

            <Box
                sx={{
                    position: 'relative',

                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: {
                        xs: 'flex-start',
                        sm: 'center',
                    },

                    flexDirection: {
                        xs: 'column',
                        sm: 'row',
                    },

                    gap: 1.5,
                    mb: 2.5,
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
                        <TuneRoundedIcon
                            sx={{
                                fontSize: 20,
                            }}
                        />
                    </Box>


                    <Box>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                color: '#0F172A',
                                fontWeight: 800,
                                lineHeight: 1.25,
                                letterSpacing: '-0.015em',
                            }}
                        >
                            Variable Selection
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
                            Choose the variables used for your analysis.
                        </Typography>
                    </Box>
                </Box>


                <Chip
                    size="small"
                    label={`${columns.length} ${
                        columns.length === 1
                            ? 'variable'
                            : 'variables'
                    } available`}
                    sx={{
                        height: 27,

                        bgcolor: '#F1F5F9',
                        color: '#475569',

                        fontSize: '0.7rem',
                        fontWeight: 700,

                        '& .MuiChip-label': {
                            px: 1.2,
                        },
                    }}
                />
            </Box>

            

            <Box
                sx={{
                    position: 'relative',

                    display: 'grid',

                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'minmax(0, 1fr) 46px minmax(0, 1fr)',
                    },

                    gap: {
                        xs: 1.5,
                        md: 2,
                    },

                    alignItems: 'center',
                }}
            >
                

                <Box
                    sx={{
                        p: 2,

                        border: '1px solid #E7ECF3',
                        borderRadius: 2.5,

                        bgcolor: '#FAFBFD',

                        transition: 'all 160ms ease',

                        '&:hover': {
                            borderColor:
                                disabled || !hasColumns
                                    ? '#E7ECF3'
                                    : '#BFDBFE',

                            bgcolor:
                                disabled || !hasColumns
                                    ? '#FAFBFD'
                                    : '#FBFDFF',
                        },
                    }}
                >

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                            mb: 1.5,
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.8,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 27,
                                    height: 27,

                                    display: 'grid',
                                    placeItems: 'center',

                                    borderRadius: 1.5,

                                    bgcolor: '#EFF6FF',
                                    color: '#2563EB',
                                }}
                            >
                                <FunctionsRoundedIcon
                                    sx={{
                                        fontSize: 15,
                                    }}
                                />
                            </Box>

                            <Box>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: 'block',

                                        color: '#334155',

                                        fontWeight: 750,
                                        lineHeight: 1.2,
                                    }}
                                >
                                    Dependent Variable
                                </Typography>

                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: '#94A3B8',
                                        fontSize: '0.67rem',
                                    }}
                                >
                                    Y-axis / outcome
                                </Typography>
                            </Box>
                        </Box>

                        <Chip
                            label="Y"
                            size="small"
                            sx={{
                                minWidth: 28,
                                height: 23,

                                bgcolor: '#DBEAFE',
                                color: '#1D4ED8',

                                fontWeight: 800,
                                fontSize: '0.68rem',

                                '& .MuiChip-label': {
                                    px: 0.8,
                                },
                            }}
                        />
                    </Box>


                    <FormControl
                        fullWidth
                        size="small"
                        disabled={disabled || !hasColumns}
                    >
                        <InputLabel id="dependant-column-select-label">
                            Dependent Column
                        </InputLabel>

                        <Select
                            labelId="dependant-column-select-label"
                            id="dependant-column-select"
                            value={selectedColumn}
                            label="Dependent Column"
                            onChange={onColumnChange}
                            sx={selectStyles}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        mt: 0.7,
                                        maxHeight: 320,

                                        borderRadius: 2,
                                        border:
                                            '1px solid #E2E8F0',

                                        boxShadow:
                                            '0 14px 36px rgba(15, 23, 42, 0.14)',

                                        '& .MuiMenuItem-root': {
                                            mx: 0.7,
                                            my: 0.3,

                                            borderRadius: 1.5,

                                            fontSize:
                                                '0.84rem',

                                            '&.Mui-selected': {
                                                bgcolor:
                                                    '#EFF6FF',
                                                color:
                                                    '#1D4ED8',
                                                fontWeight: 700,
                                            },

                                            '&.Mui-selected:hover':
                                                {
                                                    bgcolor:
                                                        '#DBEAFE',
                                                },
                                        },
                                    },
                                },
                            }}
                        >
                            {!hasColumns && (
                                <MenuItem disabled>
                                    No columns available
                                </MenuItem>
                            )}

                            {columns.map((column) => (
                                <MenuItem
                                    key={column}
                                    value={column}
                                >
                                    {column}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                

                <Box
                    sx={{
                        display: {
                            xs: 'none',
                            md: 'flex',
                        },

                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <MuiRelationshipArrow />
                </Box>

                

                <Box
                    sx={{
                        p: 2,

                        border: '1px solid #E7ECF3',
                        borderRadius: 2.5,

                        bgcolor: '#FAFBFD',

                        transition: 'all 160ms ease',

                        '&:hover': {
                            borderColor:
                                disabled || !hasColumns
                                    ? '#E7ECF3'
                                    : '#DDD6FE',

                            bgcolor:
                                disabled || !hasColumns
                                    ? '#FAFBFD'
                                    : '#FDFCFF',
                        },
                    }}
                >

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                            mb: 1.5,
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.8,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 27,
                                    height: 27,

                                    display: 'grid',
                                    placeItems: 'center',

                                    borderRadius: 1.5,

                                    bgcolor: '#F5F3FF',
                                    color: '#7C3AED',
                                }}
                            >
                                <FunctionsRoundedIcon
                                    sx={{
                                        fontSize: 15,
                                    }}
                                />
                            </Box>

                            <Box>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: 'block',

                                        color: '#334155',

                                        fontWeight: 750,
                                        lineHeight: 1.2,
                                    }}
                                >
                                    Independent Variable
                                </Typography>

                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: '#94A3B8',
                                        fontSize: '0.67rem',
                                    }}
                                >
                                    X-axis / predictor
                                </Typography>
                            </Box>
                        </Box>

                        <Chip
                            label="X"
                            size="small"
                            sx={{
                                minWidth: 28,
                                height: 23,

                                bgcolor: '#EDE9FE',
                                color: '#6D28D9',

                                fontWeight: 800,
                                fontSize: '0.68rem',

                                '& .MuiChip-label': {
                                    px: 0.8,
                                },
                            }}
                        />
                    </Box>


                    <FormControl
                        fullWidth
                        size="small"
                        disabled={disabled || !hasColumns}
                    >
                        <InputLabel id="independent-column-select-label">
                            Independent Column
                        </InputLabel>

                        <Select
                            labelId="independent-column-select-label"
                            id="independent-column-select"
                            value={secondaryColumn}
                            label="Independent Column"
                            onChange={onSecondaryColumnChange}
                            sx={selectStyles}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        mt: 0.7,
                                        maxHeight: 320,

                                        borderRadius: 2,
                                        border:
                                            '1px solid #E2E8F0',

                                        boxShadow:
                                            '0 14px 36px rgba(15, 23, 42, 0.14)',

                                        '& .MuiMenuItem-root': {
                                            mx: 0.7,
                                            my: 0.3,

                                            borderRadius: 1.5,

                                            fontSize:
                                                '0.84rem',

                                            '&.Mui-selected': {
                                                bgcolor:
                                                    '#F5F3FF',
                                                color:
                                                    '#6D28D9',
                                                fontWeight: 700,
                                            },

                                            '&.Mui-selected:hover':
                                                {
                                                    bgcolor:
                                                        '#EDE9FE',
                                                },
                                        },
                                    },
                                },
                            }}
                        >
                            {!hasColumns && (
                                <MenuItem disabled>
                                    No columns available
                                </MenuItem>
                            )}

                            {columns.map((column) => (
                                <MenuItem
                                    key={column}
                                    value={column}
                                >
                                    {column}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            

            {selectedColumn && secondaryColumn && (
                <Box
                    sx={{
                        position: 'relative',

                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',

                        mt: 2,
                        pt: 1.75,

                        borderTop: '1px solid #EDF1F6',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            justifyContent: 'center',

                            gap: 0.75,

                            px: 1.5,
                            py: 0.75,

                            borderRadius: 10,

                            bgcolor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                color: '#64748B',
                                fontWeight: 600,
                            }}
                        >
                            Analyzing
                        </Typography>

                        <Typography
                            variant="caption"
                            sx={{
                                color: '#6D28D9',
                                fontWeight: 800,
                            }}
                        >
                            {secondaryColumn}
                        </Typography>

                        <ArrowForwardRoundedIcon
                            sx={{
                                fontSize: 14,
                                color: '#94A3B8',
                            }}
                        />

                        <Typography
                            variant="caption"
                            sx={{
                                color: '#2563EB',
                                fontWeight: 800,
                            }}
                        >
                            {selectedColumn}
                        </Typography>
                    </Box>
                </Box>
            )}
        </Box>
    );
};



const MuiRelationshipArrow = () => {
    return (
        <Box
            sx={{
                width: 36,
                height: 36,

                display: 'grid',
                placeItems: 'center',

                borderRadius: '50%',

                bgcolor: '#FFFFFF',

                border: '1px solid #E2E8F0',

                color: '#94A3B8',

                boxShadow:
                    '0 3px 9px rgba(15, 23, 42, 0.05)',
            }}
        >
            <ArrowForwardRoundedIcon
                sx={{
                    fontSize: 18,
                }}
            />
        </Box>
    );
};

export default ColumnSelectionForm;