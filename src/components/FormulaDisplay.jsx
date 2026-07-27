import React from 'react';

import {
    Box,
    Paper,
    Typography,
    Tooltip,
} from '@mui/material';

import {
    FunctionsRounded,
    ViewColumnRounded,
    NumbersRounded,
    CalculateRounded,
    AutoAwesomeRounded,
} from '@mui/icons-material';

/* ============================================================================
   FORMULA DISPLAY
============================================================================ */

function FormulaDisplay({
    formulaElements = [],
}) {

    /* ========================================================================
       ELEMENT CONFIGURATION
    ======================================================================== */

    const getElementConfig = (element) => {
        switch (element.type) {

            case 'column':
                return {
                    background: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '#BFDBFE',
                    icon: <ViewColumnRounded />,
                    label: 'Column',
                };

            case 'operator':
                return {
                    background: '#FFF7ED',
                    color: '#C2410C',
                    border: '#FED7AA',
                    icon: <CalculateRounded />,
                    label: 'Operator',
                };

            case 'number':
                return {
                    background: '#ECFDF5',
                    color: '#047857',
                    border: '#A7F3D0',
                    icon: <NumbersRounded />,
                    label: 'Number',
                };

            case 'function':
                return {
                    background: '#F5F3FF',
                    color: '#6D28D9',
                    border: '#DDD6FE',
                    icon: <AutoAwesomeRounded />,
                    label: 'Function',
                };

            default:
                return {
                    background: '#F8FAFC',
                    color: '#475569',
                    border: '#E2E8F0',
                    icon: <FunctionsRounded />,
                    label: 'Expression',
                };
        }
    };

    /* ========================================================================
       RENDER
    ======================================================================== */

    return (
        <Paper
            elevation={0}
            sx={{
                width: '100%',

                overflow: 'hidden',

                border: '1px solid #E2E8F0',

                borderRadius: 2,

                bgcolor: '#FFFFFF',
            }}
        >

            {/* ================================================================
                HEADER
            ================================================================= */}

            <Box
                sx={{
                    minHeight: 38,

                    px: 1.5,

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'space-between',

                    gap: 1,

                    borderBottom: '1px solid #EDF1F6',

                    bgcolor: '#FAFBFD',
                }}
            >

                <Box
                    sx={{
                        display: 'flex',

                        alignItems: 'center',

                        gap: 0.65,
                    }}
                >

                    <FunctionsRounded
                        sx={{
                            fontSize: 15,

                            color: '#64748B',
                        }}
                    />

                    <Typography
                        variant="caption"
                        sx={{
                            color: '#475569',

                            fontSize: '0.66rem',

                            fontWeight: 800,

                            letterSpacing: '0.01em',
                        }}
                    >
                        Expression
                    </Typography>

                </Box>


                {/* TOKEN COUNT */}

                {formulaElements.length > 0 && (

                    <Typography
                        variant="caption"
                        sx={{
                            color: '#94A3B8',

                            fontSize: '0.61rem',

                            fontWeight: 600,
                        }}
                    >
                        {formulaElements.length}{' '}
                        {formulaElements.length === 1
                            ? 'element'
                            : 'elements'}
                    </Typography>

                )}

            </Box>


            {/* ================================================================
                FORMULA CANVAS
            ================================================================= */}

            <Box
                sx={{
                    position: 'relative',

                    minHeight: 82,

                    p: {
                        xs: 1.25,
                        sm: 1.5,
                    },

                    display: 'flex',

                    flexWrap: 'wrap',

                    alignItems: 'center',

                    alignContent: 'center',

                    gap: 0.65,

                    bgcolor: '#FFFFFF',
                }}
            >

                {formulaElements.length > 0 ? (

                    formulaElements.map((element, index) => (

                        <FormulaToken
                            key={`${element.type}-${element.value}-${index}`}
                            element={element}
                            config={getElementConfig(element)}
                        />

                    ))

                ) : (

                    <EmptyFormula />

                )}

            </Box>


            {/* ================================================================
                LEGEND
            ================================================================= */}

            {formulaElements.length > 0 && (

                <Box
                    sx={{
                        px: 1.5,

                        py: 0.8,

                        display: 'flex',

                        alignItems: 'center',

                        flexWrap: 'wrap',

                        gap: {
                            xs: 1,
                            sm: 1.5,
                        },

                        borderTop: '1px solid #F1F5F9',

                        bgcolor: '#FCFDFE',
                    }}
                >

                    <LegendItem
                        color="#1D4ED8"
                        background="#EFF6FF"
                        label="Column"
                    />

                    <LegendItem
                        color="#C2410C"
                        background="#FFF7ED"
                        label="Operator"
                    />

                    <LegendItem
                        color="#047857"
                        background="#ECFDF5"
                        label="Number"
                    />

                    {formulaElements.some(
                        element => element.type === 'function'
                    ) && (

                        <LegendItem
                            color="#6D28D9"
                            background="#F5F3FF"
                            label="Function"
                        />

                    )}

                </Box>

            )}

        </Paper>
    );
}


/* ============================================================================
   FORMULA TOKEN
============================================================================ */

const FormulaToken = ({
    element,
    config,
}) => {

    const displayValue =
        element.display ||
        element.value;

    /*
     * Operators are intentionally smaller and simpler than columns/numbers.
     * This keeps the mathematical expression visually readable.
     */

    if (element.type === 'operator') {

        return (
            <Tooltip
                title={`${config.label}: ${displayValue}`}
                arrow
                placement="top"
            >

                <Box
                    component="span"
                    sx={{
                        minWidth: 30,

                        height: 30,

                        px: 0.75,

                        display: 'inline-flex',

                        alignItems: 'center',

                        justifyContent: 'center',

                        borderRadius: 1.25,

                        bgcolor: config.background,

                        color: config.color,

                        border: `1px solid ${config.border}`,

                        fontSize: '0.8rem',

                        fontWeight: 900,

                        lineHeight: 1,

                        cursor: 'default',

                        userSelect: 'none',

                        transition:
                            'transform 120ms ease, box-shadow 120ms ease',

                        '&:hover': {
                            transform: 'translateY(-1px)',

                            boxShadow:
                                '0 3px 7px rgba(15, 23, 42, 0.07)',
                        },
                    }}
                >
                    {displayValue}
                </Box>

            </Tooltip>
        );
    }


    /* ========================================================================
       COLUMN / NUMBER / FUNCTION TOKEN
    ======================================================================== */

    return (
        <Tooltip
            title={`${config.label}: ${displayValue}`}
            arrow
            placement="top"
        >

            <Box
                component="span"
                sx={{
                    maxWidth: {
                        xs: 190,
                        sm: 260,
                        md: 340,
                    },

                    minHeight: 30,

                    px: 1,

                    display: 'inline-flex',

                    alignItems: 'center',

                    gap: 0.5,

                    borderRadius: 1.25,

                    bgcolor: config.background,

                    color: config.color,

                    border: `1px solid ${config.border}`,

                    fontSize: '0.69rem',

                    fontWeight: 750,

                    lineHeight: 1.2,

                    cursor: 'default',

                    userSelect: 'none',

                    transition:
                        'transform 120ms ease, box-shadow 120ms ease',

                    '&:hover': {
                        transform: 'translateY(-1px)',

                        boxShadow:
                            '0 3px 8px rgba(15, 23, 42, 0.07)',
                    },

                    '& svg': {
                        flexShrink: 0,

                        fontSize: 14,
                    },
                }}
            >

                {/* ICON */}

                <Box
                    component="span"
                    sx={{
                        display: 'inline-flex',

                        alignItems: 'center',

                        opacity: 0.8,
                    }}
                >
                    {config.icon}
                </Box>


                {/* VALUE */}

                <Box
                    component="span"
                    sx={{
                        minWidth: 0,

                        overflow: 'hidden',

                        textOverflow: 'ellipsis',

                        whiteSpace: 'nowrap',
                    }}
                >
                    {displayValue}
                </Box>

            </Box>

        </Tooltip>
    );
};


/* ============================================================================
   EMPTY STATE
============================================================================ */

const EmptyFormula = () => {

    return (
        <Box
            sx={{
                width: '100%',

                minHeight: 56,

                display: 'flex',

                flexDirection: {
                    xs: 'column',
                    sm: 'row',
                },

                alignItems: 'center',

                justifyContent: 'center',

                gap: {
                    xs: 0.75,
                    sm: 1,
                },

                textAlign: 'center',
            }}
        >

            {/* ICON */}

            <Box
                sx={{
                    width: 34,

                    height: 34,

                    display: 'grid',

                    placeItems: 'center',

                    flexShrink: 0,

                    borderRadius: 1.5,

                    bgcolor: '#F1F5F9',

                    color: '#94A3B8',
                }}
            >
                <FunctionsRounded
                    sx={{
                        fontSize: 18,
                    }}
                />
            </Box>


            {/* TEXT */}

            <Box>

                <Typography
                    variant="body2"
                    sx={{
                        color: '#64748B',

                        fontSize: '0.72rem',

                        fontWeight: 700,

                        lineHeight: 1.4,
                    }}
                >
                    Your formula will appear here
                </Typography>

                <Typography
                    variant="caption"
                    sx={{
                        display: 'block',

                        mt: 0.15,

                        color: '#A0AEC0',

                        fontSize: '0.62rem',

                        lineHeight: 1.4,
                    }}
                >
                    Add columns, operators, functions, or numbers to begin.
                </Typography>

            </Box>

        </Box>
    );
};


/* ============================================================================
   LEGEND ITEM
============================================================================ */

const LegendItem = ({
    color,
    background,
    label,
}) => {

    return (
        <Box
            sx={{
                display: 'inline-flex',

                alignItems: 'center',

                gap: 0.45,
            }}
        >

            <Box
                sx={{
                    width: 8,

                    height: 8,

                    borderRadius: '50%',

                    bgcolor: color,

                    boxShadow: `0 0 0 3px ${background}`,
                }}
            />

            <Typography
                variant="caption"
                sx={{
                    color: '#94A3B8',

                    fontSize: '0.58rem',

                    fontWeight: 650,
                }}
            >
                {label}
            </Typography>

        </Box>
    );
};


/* ============================================================================
   EXPORT
============================================================================ */

export default FormulaDisplay;