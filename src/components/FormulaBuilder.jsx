import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Chip,
  Divider,
  InputAdornment,
  IconButton,
  Autocomplete,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';

import {
  AddRounded,
  DeleteOutlineRounded,
  RemoveRounded,
  SearchRounded,
  TableChartOutlined,
  DoneRounded,
  FunctionsRounded,
  CalculateRounded,
  ViewColumnRounded,
  NumbersRounded,
  AutoAwesomeRounded,
  CheckCircleRounded,
  TuneRounded,
} from '@mui/icons-material';

import FormulaDisplay from './FormulaDisplay';
import FormulaValidator from './FormulaValidator';
import FormulaPreviewSection from './FormulaPreviewSection';

/* ============================================================================
   CONFIGURATION
============================================================================ */

const operators = [
  { value: '+', display: '+' },
  { value: '-', display: '−' },
  { value: '*', display: '×' },
  { value: '/', display: '÷' },
  { value: '(', display: '(' },
  { value: ')', display: ')' },
];

const functionList = [
  {
    value: 'AVG',
    label: 'Average',
    shortLabel: 'AVG',
    description: 'Average selected columns',
  },
  {
    value: 'SUM',
    label: 'Sum',
    shortLabel: 'SUM',
    description: 'Add selected columns',
  },
  {
    value: 'PRODUCT',
    label: 'Product',
    shortLabel: 'PRODUCT',
    description: 'Multiply selected columns',
  },
  {
    value: 'DIFF',
    label: 'Difference',
    shortLabel: 'DIFF',
    description: 'Subtract two columns',
  },
  {
    value: 'SCALED_SUM',
    label: 'Scaled Sum',
    shortLabel: 'SCALED SUM',
    description: 'Multiply a sum by a scale factor',
  },
  {
    value: 'WEIGHTED_AVG',
    label: 'Weighted Average',
    shortLabel: 'WEIGHTED AVG',
    description: 'Average using custom weights',
  },
  {
    value: 'PERCENT',
    label: 'Percentage',
    shortLabel: 'PERCENT',
    description: 'Calculate percentage between columns',
  },
  {
    value: 'RATIO',
    label: 'Ratio',
    shortLabel: 'RATIO',
    description: 'Divide one column by another',
  },
  {
    value: 'SQUARE',
    label: 'Square',
    shortLabel: 'SQUARE',
    description: 'Square a selected column',
  },
  {
    value: 'CUBE',
    label: 'Cube',
    shortLabel: 'CUBE',
    description: 'Cube a selected column',
  },
  {
    value: 'LINEAR_COMBO',
    label: 'Linear Combination',
    shortLabel: 'LINEAR COMBO',
    description: 'Combine columns using coefficients',
  },
];

/* ============================================================================
   FORMULA BUILDER
============================================================================ */

function FormulaBuilder({
  availableColumns = [],
  updatedColumns = [],
  onAddColumn,
  withoutProductData,
  withProductData,
  newColumnName = '',
}) {
  /* ==========================================================================
     STATE
  ========================================================================== */

  const [columnName, setColumnName] = useState(newColumnName || '');

  const [formulaElements, setFormulaElements] = useState([]);

  const [customValue, setCustomValue] = useState('');

  const [isFormulaValid, setIsFormulaValid] = useState(false);

  const [selectedColumn, setSelectedColumn] = useState(null);

  const [showPreview, setShowPreview] = useState(false);

  const [builderMode, setBuilderMode] = useState('expression');

  const [selectedFunction, setSelectedFunction] = useState(null);

  const [selectedFunctionColumns, setSelectedFunctionColumns] = useState([]);

  const [scaleK, setScaleK] = useState('1');

  const [weights, setWeights] = useState([]);

  const [coeffs, setCoeffs] = useState([]);

  /* ==========================================================================
     AVAILABLE COLUMNS
  ========================================================================== */

  const allAvailableColumns = useMemo(() => {
    const combined = [
      ...availableColumns.map((column) => ({
        value: column,
        type: 'column',
      })),

      ...updatedColumns.map((column) => ({
        value: column.name,
        type: 'calculated',
      })),
    ];

    /*
     * Prevent duplicate column names appearing in Autocomplete.
     */
    const seen = new Set();

    return combined.filter((column) => {
      if (!column.value || seen.has(column.value)) {
        return false;
      }

      seen.add(column.value);

      return true;
    });
  }, [availableColumns, updatedColumns]);

  const columnOptions = useMemo(
    () => allAvailableColumns.map((column) => column.value),
    [allAvailableColumns]
  );

  /* ==========================================================================
     FORMULA HELPERS
  ========================================================================== */

  const addColumnToFormula = useCallback((column) => {
    if (!column) return;

    setFormulaElements((previous) => [
      ...previous,
      {
        type: 'column',
        value: column,
        display: column,
      },
    ]);

    setSelectedColumn(null);

    setShowPreview(false);
  }, []);

  const addOperatorToFormula = useCallback((operator) => {
    if (!operator) return;

    setFormulaElements((previous) => [
      ...previous,
      {
        type: 'operator',
        value: operator.value,
        display: operator.display,
      },
    ]);

    setShowPreview(false);
  }, []);

  const addCustomValueToFormula = useCallback(() => {
    const value = customValue.trim();

    if (value === '' || Number.isNaN(Number(value))) {
      return;
    }

    setFormulaElements((previous) => [
      ...previous,
      {
        type: 'number',
        value,
        display: value,
      },
    ]);

    setCustomValue('');

    setShowPreview(false);
  }, [customValue]);

  const handleCustomValueKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();

        addCustomValueToFormula();
      }
    },
    [addCustomValueToFormula]
  );

  const clearFormula = useCallback(() => {
    setFormulaElements([]);

    setShowPreview(false);
  }, []);

  const removeLastElement = useCallback(() => {
    setFormulaElements((previous) =>
      previous.slice(0, -1)
    );

    setShowPreview(false);
  }, []);

  const getFormulaString = useCallback(() => {
    return formulaElements
      .map((element) => element.value)
      .join(' ');
  }, [formulaElements]);

  /* ==========================================================================
     INITIALIZATION
  ========================================================================== */

  useEffect(() => {
    setFormulaElements([]);

    setShowPreview(false);
  }, []);

  /* ==========================================================================
     EXTERNAL COLUMN NAME EVENT
  ========================================================================== */

  useEffect(() => {
    const syncColumnName = () => {
      const saved =
        localStorage.getItem('newColumnName');

      setColumnName(saved || '');

      setShowPreview(false);
    };

    window.addEventListener(
      'columnNameChanged',
      syncColumnName
    );

    return () => {
      window.removeEventListener(
        'columnNameChanged',
        syncColumnName
      );
    };
  }, []);

  /* ==========================================================================
     EXTERNAL COLUMN SELECTION EVENT
  ========================================================================== */

  useEffect(() => {
    const syncSelectedColumnName = () => {
      const saved =
        localStorage.getItem('selectedColumnName');

      if (!saved) return;

      setSelectedColumn(saved);

      addColumnToFormula(saved);
    };

    window.addEventListener(
      'selectedColumnNameChanged',
      syncSelectedColumnName
    );

    return () => {
      window.removeEventListener(
        'selectedColumnNameChanged',
        syncSelectedColumnName
      );
    };
  }, [addColumnToFormula]);

  /* ==========================================================================
     EXTERNAL OPERATOR EVENT
  ========================================================================== */

  useEffect(() => {
    const syncSelectedOperator = () => {
      const saved =
        localStorage.getItem('selectedOperator');

      if (!saved) return;

      setFormulaElements((previous) => [
        ...previous,
        {
          type: 'operator',
          value: saved,
          display:
            saved === '*'
              ? '×'
              : saved === '/'
              ? '÷'
              : saved,
        },
      ]);

      setShowPreview(false);
    };

    window.addEventListener(
      'selectedOperatorChanged',
      syncSelectedOperator
    );

    return () => {
      window.removeEventListener(
        'selectedOperatorChanged',
        syncSelectedOperator
      );
    };
  }, []);

  /* ==========================================================================
     PREVIEW
  ========================================================================== */

  const handleGeneratePreview = useCallback(() => {
    if (
      formulaElements.length > 0 &&
      isFormulaValid
    ) {
      setShowPreview(true);
    }
  }, [formulaElements, isFormulaValid]);

  /* ==========================================================================
     SUBMIT
  ========================================================================== */

  const handleSubmit = useCallback(() => {
    if (
      columnName.trim() === '' ||
      formulaElements.length === 0 ||
      !isFormulaValid
    ) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });

      return;
    }

    const formulaString =
      getFormulaString();

    const newColumn = {
      name: columnName.trim(),

      formula: formulaString,

      formulaElements: [
        ...formulaElements,
      ],

      status: 'pending',
    };

    if (typeof onAddColumn === 'function') {
      onAddColumn(newColumn);
    }

    setColumnName('');

    setFormulaElements([]);

    setShowPreview(false);

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, [
    columnName,
    formulaElements,
    isFormulaValid,
    getFormulaString,
    onAddColumn,
  ]);

  /* ==========================================================================
     EXTERNAL SUBMISSION
  ========================================================================== */

  useEffect(() => {
    const syncSubmission = () => {
      handleSubmit();
    };

    window.addEventListener(
      'submitFormula',
      syncSubmission
    );

    return () => {
      window.removeEventListener(
        'submitFormula',
        syncSubmission
      );
    };
  }, [handleSubmit]);

  /* ==========================================================================
     FUNCTION BUILDER
  ========================================================================== */

  const handleFunctionSelect = (fn) => {
    setSelectedFunction(fn);

    setSelectedFunctionColumns([]);

    setScaleK('1');

    setWeights([]);

    setCoeffs([]);

    setShowPreview(false);
  };

  const addFunctionToFormula = useCallback(() => {
    if (
      !selectedFunction ||
      selectedFunctionColumns.length === 0
    ) {
      return;
    }

    const columns = Array.isArray(
      selectedFunctionColumns
    )
      ? selectedFunctionColumns
      : [selectedFunctionColumns];

    let newElements = [];

    /* ------------------------------------------------------------------------
       SUM
    ------------------------------------------------------------------------ */

    if (selectedFunction.value === 'SUM') {
      columns.forEach((column, index) => {
        newElements.push({
          type: 'column',
          value: column,
          display: column,
        });

        if (index < columns.length - 1) {
          newElements.push({
            type: 'operator',
            value: '+',
            display: '+',
          });
        }
      });
    }

    /* ------------------------------------------------------------------------
       AVG
    ------------------------------------------------------------------------ */

    else if (selectedFunction.value === 'AVG') {
      if (columns.length === 1) {
        newElements.push({
          type: 'column',
          value: columns[0],
          display: columns[0],
        });
      } else {
        newElements.push({
          type: 'operator',
          value: '(',
          display: '(',
        });

        columns.forEach((column, index) => {
          newElements.push({
            type: 'column',
            value: column,
            display: column,
          });

          if (index < columns.length - 1) {
            newElements.push({
              type: 'operator',
              value: '+',
              display: '+',
            });
          }
        });

        newElements.push(
          {
            type: 'operator',
            value: ')',
            display: ')',
          },
          {
            type: 'operator',
            value: '/',
            display: '÷',
          },
          {
            type: 'number',
            value: String(columns.length),
            display: String(columns.length),
          }
        );
      }
    }

    /* ------------------------------------------------------------------------
       PRODUCT
    ------------------------------------------------------------------------ */

    else if (
      selectedFunction.value === 'PRODUCT'
    ) {
      columns.forEach((column, index) => {
        newElements.push({
          type: 'column',
          value: column,
          display: column,
        });

        if (index < columns.length - 1) {
          newElements.push({
            type: 'operator',
            value: '*',
            display: '×',
          });
        }
      });
    }

    /* ------------------------------------------------------------------------
       DIFF
    ------------------------------------------------------------------------ */

    else if (
      selectedFunction.value === 'DIFF'
    ) {
      if (columns.length !== 2) {
        window.alert(
          'DIFF requires exactly 2 columns.'
        );

        return;
      }

      newElements = [
        {
          type: 'column',
          value: columns[0],
          display: columns[0],
        },
        {
          type: 'operator',
          value: '-',
          display: '−',
        },
        {
          type: 'column',
          value: columns[1],
          display: columns[1],
        },
      ];
    }

    /* ------------------------------------------------------------------------
       SCALED SUM
    ------------------------------------------------------------------------ */

    else if (
      selectedFunction.value === 'SCALED_SUM'
    ) {
      if (
        scaleK === '' ||
        Number.isNaN(Number(scaleK))
      ) {
        window.alert(
          'Please enter a valid scale factor.'
        );

        return;
      }

      newElements = [
        {
          type: 'number',
          value: scaleK,
          display: scaleK,
        },
        {
          type: 'operator',
          value: '*',
          display: '×',
        },
        {
          type: 'operator',
          value: '(',
          display: '(',
        },
      ];

      columns.forEach((column, index) => {
        newElements.push({
          type: 'column',
          value: column,
          display: column,
        });

        if (index < columns.length - 1) {
          newElements.push({
            type: 'operator',
            value: '+',
            display: '+',
          });
        }
      });

      newElements.push({
        type: 'operator',
        value: ')',
        display: ')',
      });
    }

    /* ------------------------------------------------------------------------
       WEIGHTED AVERAGE
    ------------------------------------------------------------------------ */

    else if (
      selectedFunction.value ===
      'WEIGHTED_AVG'
    ) {
      const weightsValid =
        columns.length === weights.length &&
        weights.every(
          (weight) =>
            weight !== '' &&
            !Number.isNaN(Number(weight))
        );

      if (!weightsValid) {
        window.alert(
          'Please enter a valid weight for every selected column.'
        );

        return;
      }

      newElements.push({
        type: 'operator',
        value: '(',
        display: '(',
      });

      columns.forEach((column, index) => {
        newElements.push(
          {
            type: 'column',
            value: column,
            display: column,
          },
          {
            type: 'operator',
            value: '*',
            display: '×',
          },
          {
            type: 'number',
            value: weights[index],
            display: weights[index],
          }
        );

        if (index < columns.length - 1) {
          newElements.push({
            type: 'operator',
            value: '+',
            display: '+',
          });
        }
      });

      newElements.push(
        {
          type: 'operator',
          value: ')',
          display: ')',
        },
        {
          type: 'operator',
          value: '/',
          display: '÷',
        },
        {
          type: 'operator',
          value: '(',
          display: '(',
        }
      );

      weights.forEach((weight, index) => {
        newElements.push({
          type: 'number',
          value: weight,
          display: weight,
        });

        if (index < weights.length - 1) {
          newElements.push({
            type: 'operator',
            value: '+',
            display: '+',
          });
        }
      });

      newElements.push({
        type: 'operator',
        value: ')',
        display: ')',
      });
    }

    /* ------------------------------------------------------------------------
       PERCENT
    ------------------------------------------------------------------------ */

    else if (
      selectedFunction.value === 'PERCENT'
    ) {
      if (columns.length !== 2) {
        window.alert(
          'PERCENT requires exactly 2 columns.'
        );

        return;
      }

      newElements = [
        {
          type: 'operator',
          value: '(',
          display: '(',
        },
        {
          type: 'column',
          value: columns[0],
          display: columns[0],
        },
        {
          type: 'operator',
          value: '/',
          display: '÷',
        },
        {
          type: 'column',
          value: columns[1],
          display: columns[1],
        },
        {
          type: 'operator',
          value: ')',
          display: ')',
        },
        {
          type: 'operator',
          value: '*',
          display: '×',
        },
        {
          type: 'number',
          value: '100',
          display: '100',
        },
      ];
    }

    /* ------------------------------------------------------------------------
       RATIO
    ------------------------------------------------------------------------ */

    else if (
      selectedFunction.value === 'RATIO'
    ) {
      if (columns.length !== 2) {
        window.alert(
          'RATIO requires exactly 2 columns.'
        );

        return;
      }

      newElements = [
        {
          type: 'column',
          value: columns[0],
          display: columns[0],
        },
        {
          type: 'operator',
          value: '/',
          display: '÷',
        },
        {
          type: 'column',
          value: columns[1],
          display: columns[1],
        },
      ];
    }

    /* ------------------------------------------------------------------------
       SQUARE
    ------------------------------------------------------------------------ */

    else if (
      selectedFunction.value === 'SQUARE'
    ) {
      if (columns.length !== 1) {
        window.alert(
          'SQUARE requires exactly 1 column.'
        );

        return;
      }

      newElements = [
        {
          type: 'column',
          value: columns[0],
          display: columns[0],
        },
        {
          type: 'operator',
          value: '*',
          display: '×',
        },
        {
          type: 'column',
          value: columns[0],
          display: columns[0],
        },
      ];
    }

    /* ------------------------------------------------------------------------
       CUBE
    ------------------------------------------------------------------------ */

    else if (
      selectedFunction.value === 'CUBE'
    ) {
      if (columns.length !== 1) {
        window.alert(
          'CUBE requires exactly 1 column.'
        );

        return;
      }

      newElements = [
        {
          type: 'column',
          value: columns[0],
          display: columns[0],
        },
        {
          type: 'operator',
          value: '*',
          display: '×',
        },
        {
          type: 'column',
          value: columns[0],
          display: columns[0],
        },
        {
          type: 'operator',
          value: '*',
          display: '×',
        },
        {
          type: 'column',
          value: columns[0],
          display: columns[0],
        },
      ];
    }

    /* ------------------------------------------------------------------------
       LINEAR COMBINATION
    ------------------------------------------------------------------------ */

    else if (
      selectedFunction.value ===
      'LINEAR_COMBO'
    ) {
      const coefficientsValid =
        coeffs.length === columns.length + 1 &&
        coeffs.every(
          (coefficient) =>
            coefficient !== '' &&
            !Number.isNaN(
              Number(coefficient)
            )
        );

      if (!coefficientsValid) {
        window.alert(
          'Please enter valid coefficients and an offset.'
        );

        return;
      }

      columns.forEach((column, index) => {
        newElements.push(
          {
            type: 'column',
            value: column,
            display: column,
          },
          {
            type: 'operator',
            value: '*',
            display: '×',
          },
          {
            type: 'number',
            value: coeffs[index],
            display: coeffs[index],
          }
        );

        if (index < columns.length - 1) {
          newElements.push({
            type: 'operator',
            value: '+',
            display: '+',
          });
        }
      });

      newElements.push(
        {
          type: 'operator',
          value: '+',
          display: '+',
        },
        {
          type: 'number',
          value:
            coeffs[coeffs.length - 1],
          display:
            coeffs[coeffs.length - 1],
        }
      );
    }

    /* ------------------------------------------------------------------------
       APPLY
    ------------------------------------------------------------------------ */

    if (newElements.length > 0) {
      setFormulaElements((previous) => [
        ...previous,
        ...newElements,
      ]);
    }

    setSelectedFunction(null);

    setSelectedFunctionColumns([]);

    setScaleK('1');

    setWeights([]);

    setCoeffs([]);

    setShowPreview(false);
  }, [
    selectedFunction,
    selectedFunctionColumns,
    scaleK,
    weights,
    coeffs,
  ]);

  /* ==========================================================================
     DERIVED STATE
  ========================================================================== */

  const hasFormula =
    formulaElements.length > 0;

  const hasColumnName =
    columnName.trim() !== '';

  const canShowPreviewButton =
    hasColumnName &&
    hasFormula &&
    isFormulaValid;

  const canSubmit =
    hasColumnName &&
    hasFormula &&
    isFormulaValid;

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
          '1px solid #E2E8F0',

        borderRadius: 3,

        bgcolor: '#FFFFFF',

        boxShadow:
          '0 10px 32px rgba(15, 23, 42, 0.055)',
      }}
    >
      {/* ======================================================================
          HEADER
      ====================================================================== */}

      <Box
        sx={{
          px: {
            xs: 2,
            sm: 2.75,
          },

          py: 2.25,

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

          bgcolor: '#FCFDFE',
        }}
      >
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
                '0 6px 15px rgba(23, 43, 77, 0.16)',
            }}
          >
            <FunctionsRounded
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
              Formula Builder
            </Typography>

            <Typography
              variant="caption"
              sx={{
                display: 'block',

                mt: 0.25,

                color: '#64748B',

                fontSize: '0.7rem',
              }}
            >
              Create calculated columns
              using your dataset variables.
            </Typography>
          </Box>
        </Box>

        {/* STATUS */}

        <Box
          sx={{
            display: 'flex',
            gap: 0.75,
            flexWrap: 'wrap',
          }}
        >
          <StatusChip
            label={`${columnOptions.length} columns`}
            icon={
              <ViewColumnRounded />
            }
          />

          {hasFormula && (
            <StatusChip
              label={
                isFormulaValid
                  ? 'Formula valid'
                  : 'Check formula'
              }
              success={
                isFormulaValid
              }
              icon={
                isFormulaValid ? (
                  <CheckCircleRounded />
                ) : (
                  <FunctionsRounded />
                )
              }
            />
          )}
        </Box>
      </Box>

      {/* ======================================================================
          CONTENT
      ====================================================================== */}

      <Box
        sx={{
          p: {
            xs: 2,
            sm: 2.75,
          },
        }}
      >
        {/* ====================================================================
            STEP 1
        ==================================================================== */}

        <SectionCard
          number="1"
          title="Name your calculated column"
          description="Choose a clear name for the result of this formula."
        >
          <TextField
            fullWidth
            label="Column name"
            value={columnName}
            onChange={(event) => {
              setColumnName(
                event.target.value
              );

              setShowPreview(false);
            }}
            placeholder="e.g. Efficiency Ratio"
            size="small"
            sx={fieldSx}
          />
        </SectionCard>

        {/* ====================================================================
            STEP 2
        ==================================================================== */}

        <SectionCard
          number="2"
          title="Build the formula"
          description="Create an expression manually or use a predefined function."
          sx={{
            mt: 2,
          }}
        >
          {/* BUILDER MODE */}

          <Box
            sx={{
              p: 0.5,

              mb: 2.5,

              borderRadius: 2,

              bgcolor: '#F1F5F9',

              border:
                '1px solid #E2E8F0',
            }}
          >
            <Tabs
              value={builderMode}
              onChange={(_, value) => {
                setBuilderMode(value);

                setShowPreview(false);
              }}
              variant="fullWidth"
              TabIndicatorProps={{
                style: {
                  display: 'none',
                },
              }}
              sx={{
                minHeight: 40,

                '& .MuiTabs-flexContainer':
                  {
                    gap: 0.5,
                  },

                '& .MuiTab-root': {
                  minHeight: 40,

                  borderRadius: 1.5,

                  color: '#64748B',

                  textTransform: 'none',

                  fontSize: '0.76rem',

                  fontWeight: 700,

                  transition:
                    'all 150ms ease',
                },

                '& .Mui-selected': {
                  bgcolor: '#FFFFFF',

                  color:
                    '#2563EB !important',

                  boxShadow:
                    '0 2px 7px rgba(15, 23, 42, 0.08)',
                },
              }}
            >
              <Tab
                icon={
                  <CalculateRounded
                    sx={{
                      fontSize: 17,
                    }}
                  />
                }
                iconPosition="start"
                label="Expression Builder"
                value="expression"
              />

              <Tab
                icon={
                  <AutoAwesomeRounded
                    sx={{
                      fontSize: 17,
                    }}
                  />
                }
                iconPosition="start"
                label="Function Builder"
                value="function"
              />
            </Tabs>
          </Box>

          {/* ================================================================
              EXPRESSION BUILDER
          ================================================================= */}

          {builderMode ===
            'expression' && (
            <Grid
              container
              spacing={2}
            >
              {/* COLUMN SELECTOR */}

              <Grid
                item
                xs={12}
                md={6}
              >
                <BuilderBlock
                  icon={
                    <ViewColumnRounded />
                  }
                  title="Columns"
                  description="Search and add a dataset column."
                >
                  <Autocomplete
                    fullWidth
                    options={
                      columnOptions
                    }
                    value={
                      selectedColumn
                    }
                    onChange={(
                      _event,
                      newValue
                    ) => {
                      setSelectedColumn(
                        newValue
                      );

                      if (newValue) {
                        addColumnToFormula(
                          newValue
                        );
                      }
                    }}
                    freeSolo
                    clearOnBlur
                    selectOnFocus
                    renderInput={(
                      params
                    ) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder="Search columns..."
                        sx={fieldSx}
                        InputProps={{
                          ...params.InputProps,

                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <SearchRounded
                                  sx={{
                                    fontSize:
                                      18,

                                    color:
                                      '#94A3B8',
                                  }}
                                />
                              </InputAdornment>

                              {
                                params
                                  .InputProps
                                  .startAdornment
                              }
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </BuilderBlock>
              </Grid>

              {/* OPERATORS */}

              <Grid
                item
                xs={12}
                md={6}
              >
                <BuilderBlock
                  icon={
                    <CalculateRounded />
                  }
                  title="Operators"
                  description="Add arithmetic operators and brackets."
                >
                  <Box
                    sx={{
                      display: 'grid',

                      gridTemplateColumns:
                        'repeat(6, minmax(38px, 1fr))',

                      gap: 0.75,
                    }}
                  >
                    {operators.map(
                      (operator) => (
                        <Tooltip
                          key={
                            operator.value
                          }
                          title={`Add ${operator.display}`}
                          arrow
                        >
                          <Button
                            variant="outlined"
                            onClick={() =>
                              addOperatorToFormula(
                                operator
                              )
                            }
                            sx={{
                              minWidth: 0,

                              height: 40,

                              px: 0,

                              borderRadius:
                                1.5,

                              borderColor:
                                '#DCE3EC',

                              color:
                                '#334155',

                              bgcolor:
                                '#FFFFFF',

                              fontSize:
                                '1rem',

                              fontWeight:
                                800,

                              '&:hover':
                                {
                                  bgcolor:
                                    '#EFF6FF',

                                  borderColor:
                                    '#93C5FD',

                                  color:
                                    '#2563EB',
                                },
                            }}
                          >
                            {
                              operator.display
                            }
                          </Button>
                        </Tooltip>
                      )
                    )}
                  </Box>
                </BuilderBlock>
              </Grid>

              {/* CUSTOM NUMBER */}

              <Grid
                item
                xs={12}
              >
                <BuilderBlock
                  icon={
                    <NumbersRounded />
                  }
                  title="Custom number"
                  description="Insert a constant numeric value into the expression."
                >
                  <TextField
                    value={
                      customValue
                    }
                    onChange={(
                      event
                    ) =>
                      setCustomValue(
                        event.target
                          .value
                      )
                    }
                    onKeyDown={
                      handleCustomValueKeyDown
                    }
                    size="small"
                    type="number"
                    placeholder="Enter a number"
                    sx={{
                      ...fieldSx,
                      width: {
                        xs: '100%',
                        sm: 300,
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip
                            title="Add number"
                            arrow
                          >
                            <span>
                              <IconButton
                                size="small"
                                onClick={
                                  addCustomValueToFormula
                                }
                                disabled={
                                  customValue.trim() ===
                                    '' ||
                                  Number.isNaN(
                                    Number(
                                      customValue
                                    )
                                  )
                                }
                                sx={{
                                  color:
                                    '#2563EB',
                                }}
                              >
                                <AddRounded />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                </BuilderBlock>
              </Grid>
            </Grid>
          )}

          {/* ================================================================
              FUNCTION BUILDER
          ================================================================= */}

          {builderMode ===
            'function' && (
            <Box>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',

                  mb: 1,

                  color: '#64748B',

                  fontWeight: 700,
                }}
              >
                Select a function
              </Typography>

              {/* FUNCTION CARDS */}

              <Box
                sx={{
                  display: 'grid',

                  gridTemplateColumns: {
                    xs: 'repeat(2, minmax(0, 1fr))',
                    sm: 'repeat(3, minmax(0, 1fr))',
                    lg: 'repeat(4, minmax(0, 1fr))',
                  },

                  gap: 1,
                }}
              >
                {functionList.map(
                  (fn) => {
                    const selected =
                      selectedFunction?.value ===
                      fn.value;

                    return (
                      <Box
                        key={
                          fn.value
                        }
                        component="button"
                        type="button"
                        onClick={() =>
                          handleFunctionSelect(
                            fn
                          )
                        }
                        sx={{
                          minHeight: 72,

                          p: 1.25,

                          display:
                            'flex',

                          flexDirection:
                            'column',

                          alignItems:
                            'flex-start',

                          justifyContent:
                            'center',

                          textAlign:
                            'left',

                          fontFamily:
                            'inherit',

                          cursor:
                            'pointer',

                          border:
                            '1px solid',

                          borderColor:
                            selected
                              ? '#93C5FD'
                              : '#E2E8F0',

                          borderRadius: 2,

                          bgcolor:
                            selected
                              ? '#EFF6FF'
                              : '#FFFFFF',

                          transition:
                            'all 150ms ease',

                          '&:hover': {
                            borderColor:
                              '#93C5FD',

                            bgcolor:
                              '#F8FBFF',

                            transform:
                              'translateY(-1px)',

                            boxShadow:
                              '0 5px 12px rgba(15,23,42,0.05)',
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            color:
                              selected
                                ? '#1D4ED8'
                                : '#334155',

                            fontSize:
                              '0.72rem',

                            fontWeight:
                              800,
                          }}
                        >
                          {
                            fn.shortLabel
                          }
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            mt: 0.25,

                            color:
                              '#94A3B8',

                            fontSize:
                              '0.61rem',

                            lineHeight:
                              1.35,
                          }}
                        >
                          {
                            fn.description
                          }
                        </Typography>
                      </Box>
                    );
                  }
                )}
              </Box>

              {/* FUNCTION CONFIGURATION */}

              {selectedFunction && (
                <Paper
                  elevation={0}
                  sx={{
                    mt: 2,

                    p: {
                      xs: 1.5,
                      sm: 2,
                    },

                    border:
                      '1px solid #DBEAFE',

                    borderRadius: 2.5,

                    bgcolor:
                      '#F8FBFF',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems:
                        'center',
                      gap: 1,

                      mb: 1.75,
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,

                        display:
                          'grid',

                        placeItems:
                          'center',

                        borderRadius:
                          1.5,

                        bgcolor:
                          '#EFF6FF',

                        color:
                          '#2563EB',
                      }}
                    >
                      <TuneRounded
                        sx={{
                          fontSize:
                            17,
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
                        Configure{' '}
                        {
                          selectedFunction.label
                        }
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{
                          display:
                            'block',

                          color:
                            '#64748B',

                          fontSize:
                            '0.65rem',
                        }}
                      >
                        {
                          selectedFunction.description
                        }
                      </Typography>
                    </Box>
                  </Box>

                  <Grid
                    container
                    spacing={1.5}
                  >
                    {/* COLUMNS */}

                    <Grid
                      item
                      xs={12}
                    >
                      <Autocomplete
                        multiple={
                          selectedFunction.value !==
                            'SQUARE' &&
                          selectedFunction.value !==
                            'CUBE'
                        }
                        fullWidth
                        options={
                          columnOptions
                        }
                        value={
                          selectedFunctionColumns
                        }
                        onChange={(
                          _,
                          newValue
                        ) => {
                          setSelectedFunctionColumns(
                            newValue
                          );

                          const values =
                            Array.isArray(
                              newValue
                            )
                              ? newValue
                              : newValue
                              ? [
                                  newValue,
                                ]
                              : [];

                          if (
                            selectedFunction.value ===
                            'WEIGHTED_AVG'
                          ) {
                            setWeights(
                              Array(
                                values.length
                              ).fill(
                                '1'
                              )
                            );
                          }

                          if (
                            selectedFunction.value ===
                            'LINEAR_COMBO'
                          ) {
                            setCoeffs(
                              Array(
                                values.length +
                                  1
                              ).fill(
                                '1'
                              )
                            );
                          }
                        }}
                        renderInput={(
                          params
                        ) => (
                          <TextField
                            {...params}
                            size="small"
                            label="Select columns"
                            placeholder="Choose dataset columns"
                            sx={
                              fieldSx
                            }
                          />
                        )}
                      />
                    </Grid>

                    {/* SCALE */}

                    {selectedFunction.value ===
                      'SCALED_SUM' && (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                      >
                        <TextField
                          fullWidth
                          label="Scale factor (k)"
                          value={
                            scaleK
                          }
                          onChange={(
                            event
                          ) =>
                            setScaleK(
                              event
                                .target
                                .value
                            )
                          }
                          size="small"
                          type="number"
                          sx={
                            fieldSx
                          }
                        />
                      </Grid>
                    )}

                    {/* WEIGHTS */}

                    {selectedFunction.value ===
                      'WEIGHTED_AVG' &&
                      selectedFunctionColumns.length >
                        0 &&
                      selectedFunctionColumns.map(
                        (
                          column,
                          index
                        ) => (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            key={
                              column
                            }
                          >
                            <TextField
                              fullWidth
                              label={`Weight: ${column}`}
                              value={
                                weights[
                                  index
                                ] ||
                                ''
                              }
                              onChange={(
                                event
                              ) => {
                                const next =
                                  [
                                    ...weights,
                                  ];

                                next[
                                  index
                                ] =
                                  event.target.value;

                                setWeights(
                                  next
                                );
                              }}
                              size="small"
                              type="number"
                              sx={
                                fieldSx
                              }
                            />
                          </Grid>
                        )
                      )}

                    {/* LINEAR COEFFICIENTS */}

                    {selectedFunction.value ===
                      'LINEAR_COMBO' &&
                      selectedFunctionColumns.length >
                        0 && (
                        <>
                          {selectedFunctionColumns.map(
                            (
                              column,
                              index
                            ) => (
                              <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                key={
                                  column
                                }
                              >
                                <TextField
                                  fullWidth
                                  label={`Coefficient: ${column}`}
                                  value={
                                    coeffs[
                                      index
                                    ] ||
                                    ''
                                  }
                                  onChange={(
                                    event
                                  ) => {
                                    const next =
                                      [
                                        ...coeffs,
                                      ];

                                    next[
                                      index
                                    ] =
                                      event.target.value;

                                    setCoeffs(
                                      next
                                    );
                                  }}
                                  size="small"
                                  type="number"
                                  sx={
                                    fieldSx
                                  }
                                />
                              </Grid>
                            )
                          )}

                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                          >
                            <TextField
                              fullWidth
                              label="Offset"
                              value={
                                coeffs[
                                  coeffs.length -
                                    1
                                ] ||
                                ''
                              }
                              onChange={(
                                event
                              ) => {
                                const next =
                                  [
                                    ...coeffs,
                                  ];

                                next[
                                  next.length -
                                    1
                                ] =
                                  event.target.value;

                                setCoeffs(
                                  next
                                );
                              }}
                              size="small"
                              type="number"
                              sx={
                                fieldSx
                              }
                            />
                          </Grid>
                        </>
                      )}
                  </Grid>

                  <Box
                    sx={{
                      mt: 1.75,

                      display: 'flex',

                      justifyContent:
                        'flex-end',
                    }}
                  >
                    <Button
                      variant="contained"
                      startIcon={
                        <AddRounded />
                      }
                      disabled={
                        !selectedFunction ||
                        selectedFunctionColumns.length ===
                          0
                      }
                      onClick={
                        addFunctionToFormula
                      }
                      sx={{
                        px: 2,

                        borderRadius:
                          1.75,

                        bgcolor:
                          '#2563EB',

                        textTransform:
                          'none',

                        fontSize:
                          '0.74rem',

                        fontWeight:
                          750,

                        boxShadow:
                          '0 4px 10px rgba(37,99,235,0.18)',

                        '&:hover':
                          {
                            bgcolor:
                              '#1D4ED8',
                          },
                      }}
                    >
                      Add to formula
                    </Button>
                  </Box>
                </Paper>
              )}
            </Box>
          )}
        </SectionCard>

        {/* ====================================================================
            STEP 3 - FORMULA
        ==================================================================== */}

        <SectionCard
          number="3"
          title="Review your formula"
          description="Check the generated expression before previewing or adding the column."
          sx={{
            mt: 2,
          }}
        >
          <Box
            sx={{
              p: {
                xs: 1.25,
                sm: 1.5,
              },

              minHeight: 76,

              border:
                '1px solid',

              borderColor:
                !hasFormula
                  ? '#E2E8F0'
                  : isFormulaValid
                  ? '#BBF7D0'
                  : '#FDE68A',

              borderRadius: 2,

              bgcolor:
                !hasFormula
                  ? '#FAFBFD'
                  : isFormulaValid
                  ? '#F7FEF9'
                  : '#FFFCF2',
            }}
          >
            <FormulaDisplay
              formulaElements={
                formulaElements
              }
            />
          </Box>

          <Box
            sx={{
              mt: 1,
            }}
          >
            <FormulaValidator
              formulaElements={
                formulaElements
              }
              setIsValid={
                setIsFormulaValid
              }
            />
          </Box>

          {/* FORMULA ACTIONS */}

          <Box
            sx={{
              mt: 1.5,

              display: 'flex',

              flexWrap: 'wrap',

              alignItems: 'center',

              gap: 0.75,
            }}
          >
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={
                clearFormula
              }
              startIcon={
                <DeleteOutlineRounded />
              }
              disabled={!hasFormula}
              sx={secondaryButtonSx}
            >
              Clear
            </Button>

            <Button
              size="small"
              variant="outlined"
              onClick={
                removeLastElement
              }
              startIcon={
                <RemoveRounded />
              }
              disabled={!hasFormula}
              sx={{
                ...secondaryButtonSx,

                color: '#475569',

                borderColor:
                  '#DCE3EC',
              }}
            >
              Undo last
            </Button>

            {canShowPreviewButton && (
              <Button
                size="small"
                variant="outlined"
                onClick={
                  handleGeneratePreview
                }
                startIcon={
                  <TableChartOutlined />
                }
                sx={{
                  ...secondaryButtonSx,

                  ml: {
                    xs: 0,
                    sm: 'auto',
                  },

                  color: '#2563EB',

                  borderColor:
                    '#BFDBFE',

                  bgcolor:
                    '#F8FBFF',

                  '&:hover': {
                    borderColor:
                      '#93C5FD',

                    bgcolor:
                      '#EFF6FF',
                  },
                }}
              >
                Preview results
              </Button>
            )}
          </Box>
        </SectionCard>

        {/* ====================================================================
            PREVIEW
        ==================================================================== */}

        {showPreview && (
          <Paper
            elevation={0}
            sx={{
              mt: 2,

              p: {
                xs: 1.5,
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
                alignItems: 'center',
                gap: 1,

                mb: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,

                  display: 'grid',
                  placeItems: 'center',

                  borderRadius: 1.5,

                  bgcolor: '#EFF6FF',

                  color: '#2563EB',
                }}
              >
                <TableChartOutlined
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

                    fontSize:
                      '0.8rem',
                  }}
                >
                  Result Preview
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B',

                    fontSize:
                      '0.66rem',
                  }}
                >
                  Preview the calculated
                  values before adding the
                  column.
                </Typography>
              </Box>
            </Box>

            <FormulaPreviewSection
              formulaElements={
                formulaElements
              }
              withoutProductData={
                withoutProductData
              }
              withProductData={
                withProductData
              }
              columnName={
                columnName
              }
            />
          </Paper>
        )}

        {/* ====================================================================
            FINAL ACTION
        ==================================================================== */}

        <Box
          sx={{
            mt: 2.5,
            pt: 2,

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

            gap: 1.5,

            borderTop:
              '1px solid #EDF1F6',
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: 'block',

                color: canSubmit
                  ? '#047857'
                  : '#94A3B8',

                fontWeight: 700,

                fontSize: '0.68rem',
              }}
            >
              {canSubmit
                ? 'Everything looks good. Your column is ready to be added.'
                : 'Enter a column name and build a valid formula to continue.'}
            </Typography>
          </Box>

          <Button
            id="submit-column-btn"
            variant="contained"
            endIcon={
              <DoneRounded />
            }
            onClick={
              handleSubmit
            }
            disabled={!canSubmit}
            sx={{
              minWidth: {
                xs: '100%',
                sm: 160,
              },

              minHeight: 42,

              px: 2.5,

              borderRadius: 1.75,

              bgcolor: '#172B4D',

              textTransform: 'none',

              fontSize: '0.78rem',

              fontWeight: 800,

              boxShadow:
                '0 5px 12px rgba(23,43,77,0.17)',

              '&:hover': {
                bgcolor: '#223A61',

                boxShadow:
                  '0 7px 15px rgba(23,43,77,0.20)',
              },

              '&.Mui-disabled': {
                bgcolor: '#E2E8F0',

                color: '#94A3B8',

                boxShadow: 'none',
              },
            }}
          >
            Add Column
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

/* ============================================================================
   SECTION CARD
============================================================================ */

const SectionCard = ({
  number,
  title,
  description,
  children,
  sx,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: {
          xs: 1.5,
          sm: 2,
        },

        border:
          '1px solid #E5EAF2',

        borderRadius: 2.5,

        bgcolor: '#FFFFFF',

        ...sx,
      }}
    >
      <Box
        sx={{
          display: 'flex',

          alignItems: 'flex-start',

          gap: 1,

          mb: 1.75,
        }}
      >
        <Box
          sx={{
            width: 27,
            height: 27,

            display: 'grid',
            placeItems: 'center',

            flexShrink: 0,

            borderRadius: '50%',

            bgcolor: '#EFF6FF',

            color: '#2563EB',

            border:
              '1px solid #DBEAFE',

            fontSize: '0.7rem',

            fontWeight: 800,
          }}
        >
          {number}
        </Box>

        <Box>
          <Typography
            variant="body2"
            sx={{
              color: '#1E293B',

              fontWeight: 800,

              fontSize: '0.82rem',

              lineHeight: 1.3,
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

              fontSize: '0.66rem',

              lineHeight: 1.5,
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>

      {children}
    </Paper>
  );
};

/* ============================================================================
   BUILDER BLOCK
============================================================================ */

const BuilderBlock = ({
  icon,
  title,
  description,
  children,
}) => {
  return (
    <Box
      sx={{
        height: '100%',

        p: 1.5,

        border:
          '1px solid #EDF1F6',

        borderRadius: 2,

        bgcolor: '#FAFBFD',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',

          gap: 0.75,

          mb: 1.25,
        }}
      >
        <Box
          sx={{
            width: 29,
            height: 29,

            display: 'grid',
            placeItems: 'center',

            flexShrink: 0,

            borderRadius: 1.4,

            bgcolor: '#FFFFFF',

            color: '#64748B',

            border:
              '1px solid #E2E8F0',

            '& svg': {
              fontSize: 16,
            },
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography
            variant="body2"
            sx={{
              color: '#334155',

              fontSize: '0.74rem',

              fontWeight: 800,

              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              display: 'block',

              mt: 0.1,

              color: '#94A3B8',

              fontSize: '0.61rem',
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>

      {children}
    </Box>
  );
};

/* ============================================================================
   STATUS CHIP
============================================================================ */

const StatusChip = ({
  label,
  icon,
  success = false,
}) => {
  return (
    <Chip
      size="small"
      icon={icon}
      label={label}
      sx={{
        height: 27,

        bgcolor: success
          ? '#ECFDF5'
          : '#F1F5F9',

        color: success
          ? '#047857'
          : '#475569',

        border: '1px solid',

        borderColor: success
          ? '#D1FAE5'
          : '#E2E8F0',

        fontSize: '0.65rem',

        fontWeight: 750,

        '& .MuiChip-icon': {
          color: success
            ? '#059669'
            : '#64748B',

          fontSize:
            '14px !important',
        },
      }}
    />
  );
};

/* ============================================================================
   SHARED STYLES
============================================================================ */

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1.75,

    bgcolor: '#FFFFFF',

    fontSize: '0.78rem',

    transition:
      'box-shadow 150ms ease',

    '& fieldset': {
      borderColor: '#DCE3EC',
    },

    '&:hover fieldset': {
      borderColor: '#AEBACA',
    },

    '&.Mui-focused': {
      boxShadow:
        '0 0 0 3px rgba(37,99,235,0.07)',
    },

    '&.Mui-focused fieldset': {
      borderColor: '#2563EB',
    },
  },

  '& .MuiInputLabel-root': {
    fontSize: '0.78rem',
  },
};

const secondaryButtonSx = {
  minHeight: 34,

  borderRadius: 1.5,

  textTransform: 'none',

  fontSize: '0.7rem',

  fontWeight: 700,
};

/* ============================================================================
   EXPORT
============================================================================ */

export default FormulaBuilder;