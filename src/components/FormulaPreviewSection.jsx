import React, { useMemo } from 'react';

import {
    Box,
    Typography,
    Paper,
    Chip,
    Alert,
    Divider,
} from '@mui/material';

import {
    PreviewRounded,
    ScienceRounded,
    TableRowsRounded,
    FunctionsRounded,
    InfoOutlined,
    CompareArrowsRounded,
    CheckCircleOutlineRounded,
} from '@mui/icons-material';

import EnhancedDataPreview from './EnhancedDataPreview';


/* ============================================================================
   SAFE FORMULA EVALUATOR
============================================================================ */

class SafeFormulaEvaluator {
    constructor() {
        this.operators = {
            '+': (a, b) => a + b,

            '-': (a, b) => a - b,

            '*': (a, b) => a * b,

            '/': (a, b) => {
                if (b === 0) {
                    throw new Error(
                        'Division by zero'
                    );
                }

                return a / b;
            },
        };
    }


    /* ========================================================================
       CONVERT INFIX EXPRESSION TO POSTFIX
    ======================================================================== */

    infixToPostfix(tokens) {
        const output = [];

        const operators = [];

        const precedence = {
            '+': 1,
            '-': 1,
            '*': 2,
            '/': 2,
        };


        for (const token of tokens) {

            if (typeof token === 'number') {

                output.push(token);

            } else if (token === '(') {

                operators.push(token);

            } else if (token === ')') {

                while (
                    operators.length > 0 &&
                    operators[
                        operators.length - 1
                    ] !== '('
                ) {
                    output.push(
                        operators.pop()
                    );
                }


                if (operators.length === 0) {
                    throw new Error(
                        'Mismatched parentheses'
                    );
                }


                operators.pop();

            } else if (this.operators[token]) {

                while (
                    operators.length > 0 &&
                    operators[
                        operators.length - 1
                    ] !== '(' &&
                    precedence[
                        operators[
                            operators.length - 1
                        ]
                    ] >= precedence[token]
                ) {
                    output.push(
                        operators.pop()
                    );
                }


                operators.push(token);

            } else {

                throw new Error(
                    `Unknown operator: ${token}`
                );
            }
        }


        while (operators.length > 0) {

            const operator =
                operators.pop();


            if (
                operator === '(' ||
                operator === ')'
            ) {
                throw new Error(
                    'Mismatched parentheses'
                );
            }


            output.push(operator);
        }


        return output;
    }


    /* ========================================================================
       EVALUATE POSTFIX
    ======================================================================== */

    evaluatePostfix(postfix) {
        const stack = [];


        for (const token of postfix) {

            if (typeof token === 'number') {

                stack.push(token);

            } else if (this.operators[token]) {

                if (stack.length < 2) {
                    throw new Error(
                        'Invalid expression'
                    );
                }


                const b = stack.pop();

                const a = stack.pop();


                stack.push(
                    this.operators[token](a, b)
                );
            }
        }


        if (stack.length !== 1) {
            throw new Error(
                'Invalid expression'
            );
        }


        return stack[0];
    }


    /* ========================================================================
       EVALUATE FORMULA
    ======================================================================== */

    evaluate(
        formulaElements,
        rowData = {},
        allRows = []
    ) {
        if (
            !formulaElements ||
            formulaElements.length === 0
        ) {
            throw new Error(
                'Empty formula'
            );
        }


        const tokens = formulaElements.map(
            (element) => {

                /* ------------------------------------------------------------
                   COLUMN
                ------------------------------------------------------------ */

                if (element.type === 'column') {

                    const value =
                        rowData[element.value];


                    if (
                        value === undefined ||
                        value === null
                    ) {
                        return 0;
                    }


                    const numericValue =
                        parseFloat(value);


                    if (
                        Number.isNaN(
                            numericValue
                        )
                    ) {
                        return 0;
                    }


                    return numericValue;
                }


                /* ------------------------------------------------------------
                   NUMBER
                ------------------------------------------------------------ */

                if (element.type === 'number') {

                    const numericValue =
                        parseFloat(
                            element.value
                        );


                    if (
                        Number.isNaN(
                            numericValue
                        )
                    ) {
                        throw new Error(
                            `Invalid number: ${element.value}`
                        );
                    }


                    return numericValue;
                }


                /* ------------------------------------------------------------
                   OPERATOR
                ------------------------------------------------------------ */

                if (element.type === 'operator') {

                    return element.value;
                }


                /* ------------------------------------------------------------
                   FUNCTION
                ------------------------------------------------------------ */

                if (element.type === 'function') {

                    const columns =
                        element.columns || [];


                    const values =
                        columns.map(
                            (column) => {

                                const value =
                                    rowData[column];

                                const numericValue =
                                    parseFloat(
                                        value
                                    );


                                return Number.isNaN(
                                    numericValue
                                )
                                    ? 0
                                    : numericValue;
                            }
                        );


                    switch (element.func) {

                        case 'AVG':

                            return values.length > 0
                                ? values.reduce(
                                      (a, b) =>
                                          a + b,
                                      0
                                  ) /
                                      values.length
                                : 0;


                        case 'SUM':

                            return values.reduce(
                                (a, b) =>
                                    a + b,
                                0
                            );


                        default:

                            return 0;
                    }
                }


                throw new Error(
                    `Unknown element type: ${element.type}`
                );
            }
        );


        const postfix =
            this.infixToPostfix(tokens);


        return this.evaluatePostfix(
            postfix
        );
    }
}


/* ============================================================================
   EVALUATOR INSTANCE
============================================================================ */

const formulaEvaluator =
    new SafeFormulaEvaluator();


/* ============================================================================
   FORMULA PREVIEW SECTION
============================================================================ */

const FormulaPreviewSection = React.memo(
    ({
        formulaElements = [],
        withoutProductData = [],
        withProductData = [],
        columnName = '',
    }) => {

        /* ====================================================================
           EVALUATE A SINGLE ROW
        ==================================================================== */

        const evaluateFormula = (
            row,
            elements,
            allRows
        ) => {
            if (
                !elements ||
                elements.length === 0
            ) {
                return null;
            }


            try {

                const result =
                    formulaEvaluator.evaluate(
                        elements,
                        row,
                        allRows
                    );


                if (
                    Number.isNaN(result) ||
                    !Number.isFinite(result)
                ) {
                    return 'Error';
                }


                return parseFloat(
                    result.toFixed(3)
                );

            } catch (error) {

                console.error(
                    'Error evaluating formula:',
                    error
                );


                return 'Error';
            }
        };


        /* ====================================================================
           COLUMNS USED IN FORMULA
        ==================================================================== */

        const relevantColumns =
            useMemo(() => {

                const columns =
                    formulaElements.flatMap(
                        (element) => {

                            if (
                                element.type ===
                                'column'
                            ) {
                                return [
                                    element.value,
                                ];
                            }


                            if (
                                element.type ===
                                    'function' &&
                                Array.isArray(
                                    element.columns
                                )
                            ) {
                                return element.columns;
                            }


                            return [];
                        }
                    );


                return [
                    ...new Set(columns),
                ];

            }, [formulaElements]);


        /* ====================================================================
           WITHOUT PRODUCT PREVIEW
        ==================================================================== */

        const previewWithoutProductData =
            useMemo(() => {

                if (
                    !withoutProductData ||
                    !formulaElements.length
                ) {
                    return [];
                }


                return withoutProductData
                    .slice(0, 10)
                    .map((row) => {

                        const filteredRow =
                            relevantColumns.reduce(
                                (
                                    accumulator,
                                    column
                                ) => {

                                    accumulator[
                                        column
                                    ] =
                                        row[column];

                                    return accumulator;
                                },
                                {}
                            );


                        return {
                            ...filteredRow,

                            [columnName]:
                                evaluateFormula(
                                    row,
                                    formulaElements,
                                    withoutProductData
                                ),
                        };
                    });

            }, [
                withoutProductData,
                formulaElements,
                columnName,
                relevantColumns,
            ]);


        /* ====================================================================
           WITH PRODUCT PREVIEW
        ==================================================================== */

        const previewWithProductData =
            useMemo(() => {

                if (
                    !withProductData ||
                    !formulaElements.length
                ) {
                    return [];
                }


                return withProductData
                    .slice(0, 10)
                    .map((row) => {

                        const filteredRow =
                            relevantColumns.reduce(
                                (
                                    accumulator,
                                    column
                                ) => {

                                    accumulator[
                                        column
                                    ] =
                                        row[column];

                                    return accumulator;
                                },
                                {}
                            );


                        return {
                            ...filteredRow,

                            [columnName]:
                                evaluateFormula(
                                    row,
                                    formulaElements,
                                    withProductData
                                ),
                        };
                    });

            }, [
                withProductData,
                formulaElements,
                columnName,
                relevantColumns,
            ]);


        /* ====================================================================
           DERIVED INFORMATION
        ==================================================================== */

        const hasValidData =
            formulaElements.length > 0 &&
            Boolean(columnName?.trim()) &&
            withoutProductData?.length > 0 &&
            withProductData?.length > 0;


        const withoutPreviewCount =
            previewWithoutProductData.length;


        const withPreviewCount =
            previewWithProductData.length;


        const totalPreviewRows =
            withoutPreviewCount +
            withPreviewCount;


        /* ====================================================================
           EMPTY
        ==================================================================== */

        if (!hasValidData) {
            return null;
        }


        /* ====================================================================
           RENDER
        ==================================================================== */

        return (
            <Box
                sx={{
                    width: '100%',
                }}
            >

                {/* ============================================================
                    PREVIEW HEADER
                ============================================================ */}

                <Paper
                    elevation={0}
                    sx={{
                        mb: 2,

                        overflow: 'hidden',

                        border:
                            '1px solid #E2E8F0',

                        borderRadius: 2.5,

                        bgcolor: '#FFFFFF',
                    }}
                >

                    <Box
                        sx={{
                            px: {
                                xs: 1.5,
                                sm: 2,
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

                            bgcolor: '#FAFBFD',
                        }}
                    >

                        {/* ====================================================
                            TITLE
                        ==================================================== */}

                        <Box
                            sx={{
                                display: 'flex',

                                alignItems:
                                    'center',

                                gap: 1,
                            }}
                        >

                            <Box
                                sx={{
                                    width: 38,

                                    height: 38,

                                    display: 'grid',

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
                                <PreviewRounded
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

                                        fontSize:
                                            '0.82rem',

                                        fontWeight:
                                            800,

                                        lineHeight:
                                            1.3,
                                    }}
                                >
                                    Formula Preview
                                </Typography>


                                <Typography
                                    variant="caption"
                                    sx={{
                                        display:
                                            'block',

                                        mt: 0.2,

                                        color:
                                            '#64748B',

                                        fontSize:
                                            '0.65rem',
                                    }}
                                >
                                    Review the calculated
                                    output before adding
                                    the new column.
                                </Typography>

                            </Box>

                        </Box>


                        {/* ====================================================
                            STATUS
                        ==================================================== */}

                        <Chip
                            size="small"
                            icon={
                                <CheckCircleOutlineRounded />
                            }
                            label="Preview generated"
                            sx={{
                                height: 27,

                                bgcolor:
                                    '#ECFDF5',

                                color:
                                    '#047857',

                                border:
                                    '1px solid #D1FAE5',

                                fontSize:
                                    '0.63rem',

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

                    </Box>


                    <Divider
                        sx={{
                            borderColor:
                                '#EDF1F6',
                        }}
                    />


                    {/* ========================================================
                        SUMMARY
                    ======================================================== */}

                    <Box
                        sx={{
                            px: {
                                xs: 1.5,
                                sm: 2,
                            },

                            py: 1.4,

                            display: 'flex',

                            flexWrap: 'wrap',

                            alignItems:
                                'center',

                            gap: 0.75,
                        }}
                    >

                        <SummaryChip
                            icon={
                                <FunctionsRounded />
                            }
                            label="Calculated column"
                            value={columnName}
                        />


                        <SummaryChip
                            icon={
                                <TableRowsRounded />
                            }
                            label="Preview rows"
                            value={
                                totalPreviewRows
                            }
                        />


                        <SummaryChip
                            icon={
                                <ScienceRounded />
                            }
                            label="Source columns"
                            value={
                                relevantColumns.length
                            }
                        />

                    </Box>

                </Paper>


                {/* ============================================================
                    INFORMATION
                ============================================================ */}

                <Alert
                    severity="info"
                    icon={
                        <InfoOutlined
                            fontSize="inherit"
                        />
                    }
                    sx={{
                        mb: 2,

                        py: 0.25,

                        alignItems:
                            'center',

                        border:
                            '1px solid #DBEAFE',

                        borderRadius: 2,

                        bgcolor: '#F8FBFF',

                        color: '#475569',

                        '& .MuiAlert-icon':
                            {
                                color:
                                    '#2563EB',
                            },

                        '& .MuiAlert-message':
                            {
                                fontSize:
                                    '0.69rem',

                                lineHeight:
                                    1.55,
                            },
                    }}
                >
                    This is a sample preview.
                    Up to the first{' '}
                    <strong>10 rows</strong>{' '}
                    from each dataset are shown.
                    Your original data is not modified
                    until the calculated column is
                    added.
                </Alert>


                {/* ============================================================
                    DATASET COMPARISON HEADER
                ============================================================ */}

                <Box
                    sx={{
                        mb: 1.5,

                        display: 'flex',

                        alignItems: 'center',

                        gap: 0.75,
                    }}
                >

                    <CompareArrowsRounded
                        sx={{
                            fontSize: 17,

                            color: '#64748B',
                        }}
                    />


                    <Typography
                        variant="body2"
                        sx={{
                            color: '#334155',

                            fontSize: '0.75rem',

                            fontWeight: 800,
                        }}
                    >
                        Dataset Comparison
                    </Typography>


                    <Box
                        sx={{
                            flex: 1,

                            height: '1px',

                            ml: 0.5,

                            bgcolor:
                                '#E2E8F0',
                        }}
                    />

                </Box>


                {/* ============================================================
                    WITHOUT PRODUCT
                ============================================================ */}

                <DatasetPreviewCard
                    title="Without Product"
                    subtitle="Baseline dataset with the calculated column applied"
                    rowCount={
                        withoutPreviewCount
                    }
                    badge="Baseline"
                >
                    <EnhancedDataPreview
                        title={`Without Product · ${columnName}`}
                        data={
                            previewWithoutProductData
                        }
                    />
                </DatasetPreviewCard>


                {/* ============================================================
                    COMPARISON CONNECTOR
                ============================================================ */}

                <Box
                    sx={{
                        height: 26,

                        display: 'flex',

                        alignItems:
                            'center',

                        justifyContent:
                            'center',
                    }}
                >

                    <Box
                        sx={{
                            width: 1,

                            height: '100%',

                            bgcolor:
                                '#E2E8F0',
                        }}
                    />

                </Box>


                {/* ============================================================
                    WITH PRODUCT
                ============================================================ */}

                <DatasetPreviewCard
                    title="With Product"
                    subtitle="Product dataset with the same calculated column applied"
                    rowCount={
                        withPreviewCount
                    }
                    badge="Product"
                >
                    <EnhancedDataPreview
                        title={`With Product · ${columnName}`}
                        data={
                            previewWithProductData
                        }
                    />
                </DatasetPreviewCard>

            </Box>
        );
    }
);


/* ============================================================================
   SUMMARY CHIP
============================================================================ */

const SummaryChip = ({
    icon,
    label,
    value,
}) => {

    return (
        <Box
            sx={{
                minHeight: 30,

                px: 1,

                display: 'inline-flex',

                alignItems: 'center',

                gap: 0.6,

                border:
                    '1px solid #E2E8F0',

                borderRadius: 1.5,

                bgcolor: '#FFFFFF',
            }}
        >

            <Box
                sx={{
                    display: 'inline-flex',

                    alignItems: 'center',

                    color: '#94A3B8',

                    '& svg': {
                        fontSize: 14,
                    },
                }}
            >
                {icon}
            </Box>


            <Typography
                variant="caption"
                sx={{
                    color: '#94A3B8',

                    fontSize: '0.59rem',

                    fontWeight: 650,
                }}
            >
                {label}
            </Typography>


            <Typography
                variant="caption"
                sx={{
                    maxWidth: {
                        xs: 130,
                        sm: 220,
                    },

                    overflow: 'hidden',

                    textOverflow:
                        'ellipsis',

                    whiteSpace: 'nowrap',

                    color: '#334155',

                    fontSize: '0.63rem',

                    fontWeight: 800,
                }}
            >
                {value}
            </Typography>

        </Box>
    );
};


/* ============================================================================
   DATASET PREVIEW CARD
============================================================================ */

const DatasetPreviewCard = ({
    title,
    subtitle,
    rowCount,
    badge,
    children,
}) => {

    return (
        <Paper
            elevation={0}
            sx={{
                overflow: 'hidden',

                border:
                    '1px solid #E2E8F0',

                borderRadius: 2.5,

                bgcolor: '#FFFFFF',

                transition:
                    'border-color 150ms ease, box-shadow 150ms ease',

                '&:hover': {
                    borderColor:
                        '#CBD5E1',

                    boxShadow:
                        '0 6px 18px rgba(15, 23, 42, 0.045)',
                },
            }}
        >

            {/* ================================================================
                CARD HEADER
            ================================================================= */}

            <Box
                sx={{
                    px: {
                        xs: 1.5,
                        sm: 2,
                    },

                    py: 1.35,

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

                    gap: 1,

                    borderBottom:
                        '1px solid #EDF1F6',

                    bgcolor: '#FCFDFE',
                }}
            >

                <Box
                    sx={{
                        display: 'flex',

                        alignItems:
                            'center',

                        gap: 0.85,
                    }}
                >

                    <Box
                        sx={{
                            width: 31,

                            height: 31,

                            display: 'grid',

                            placeItems:
                                'center',

                            flexShrink: 0,

                            borderRadius:
                                1.4,

                            bgcolor:
                                '#F1F5F9',

                            color:
                                '#64748B',
                        }}
                    >
                        <TableRowsRounded
                            sx={{
                                fontSize: 16,
                            }}
                        />
                    </Box>


                    <Box>

                        <Box
                            sx={{
                                display: 'flex',

                                alignItems:
                                    'center',

                                gap: 0.65,

                                flexWrap:
                                    'wrap',
                            }}
                        >

                            <Typography
                                variant="body2"
                                sx={{
                                    color:
                                        '#1E293B',

                                    fontSize:
                                        '0.76rem',

                                    fontWeight:
                                        800,
                                }}
                            >
                                {title}
                            </Typography>


                            <Chip
                                label={badge}
                                size="small"
                                sx={{
                                    height: 20,

                                    bgcolor:
                                        '#F1F5F9',

                                    color:
                                        '#64748B',

                                    border:
                                        '1px solid #E2E8F0',

                                    fontSize:
                                        '0.55rem',

                                    fontWeight:
                                        750,

                                    '& .MuiChip-label':
                                        {
                                            px: 0.75,
                                        },
                                }}
                            />

                        </Box>


                        <Typography
                            variant="caption"
                            sx={{
                                display:
                                    'block',

                                mt: 0.15,

                                color:
                                    '#94A3B8',

                                fontSize:
                                    '0.61rem',
                            }}
                        >
                            {subtitle}
                        </Typography>

                    </Box>

                </Box>


                <Chip
                    label={`${rowCount} ${
                        rowCount === 1
                            ? 'row'
                            : 'rows'
                    }`}
                    size="small"
                    sx={{
                        height: 23,

                        bgcolor:
                            '#FFFFFF',

                        color:
                            '#64748B',

                        border:
                            '1px solid #E2E8F0',

                        fontSize:
                            '0.59rem',

                        fontWeight:
                            700,
                    }}
                />

            </Box>


            {/* ================================================================
                DATA TABLE
            ================================================================= */}

            <Box
                sx={{
                    p: {
                        xs: 1,
                        sm: 1.5,
                    },

                    /*
                     * EnhancedDataPreview already has its own title.
                     * This container keeps it visually integrated with
                     * the dataset card.
                     */
                    '& > *': {
                        mb: '0 !important',
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

FormulaPreviewSection.displayName =
    'FormulaPreviewSection';


/* ============================================================================
   EXPORT
============================================================================ */

export default FormulaPreviewSection;