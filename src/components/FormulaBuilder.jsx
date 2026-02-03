import { useState, useEffect, useCallback } from 'react';
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
  Tab
} from '@mui/material';
import {
  Add,
  DeleteOutline,
  RemoveRounded,
  Search,
  TableChartOutlined,
  Done
} from '@mui/icons-material';

import FormulaDisplay from './FormulaDisplay';
import FormulaValidator from './FormulaValidator';
import FormulaPreviewSection from './FormulaPreviewSection';

const operators = [
  { value: '+', display: '+' },
  { value: '-', display: '-' },
  { value: '*', display:'*' },
  { value: '/', display: '/' },
  { value: '(', display: '(' },
  { value: ')', display: ')' },
];

const functionList = [
  { value: 'AVG', label: 'AVG' },
  { value: 'SUM', label: 'SUM' },
  { value: 'PRODUCT', label: 'PRODUCT' },
  { value: 'DIFF', label: 'DIFF' },
  { value: 'SCALED_SUM', label: 'SCALED SUM' },
  { value: 'WEIGHTED_AVG', label: 'WEIGHTED AVG' },
  { value: 'PERCENT', label: 'PERCENT' },
  { value: 'RATIO', label: 'RATIO' },
  { value: 'SQUARE', label: 'SQUARE' },
  { value: 'CUBE', label: 'CUBE' },
  { value: 'LINEAR_COMBO', label: 'LINEAR COMBO' },
];

function FormulaBuilder({ availableColumns, updatedColumns, onAddColumn, withoutProductData, withProductData }) {
  const [columnName, setColumnName] = useState('');
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
  const [offset, setOffset] = useState('0');

  const allAvailableColumns = [
    ...availableColumns.map(col => ({ value: col, type: 'column' })),
    ...updatedColumns.map(col => ({ value: col.name, type: 'column' }))
  ];

  useEffect(() => {
    setFormulaElements([]);
    setShowPreview(false);
  }, []);
  
  useEffect(() => {
  const syncColumnName = () => {
    const saved = localStorage.getItem('newColumnName');
    setColumnName(saved || '');
  };

  

  window.addEventListener('columnNameChanged', syncColumnName);
  
  return () => window.removeEventListener('columnNameChanged', syncColumnName);
}, []);

useEffect(() => {
  const syncSelectedColumnName = () => {
    const saved = localStorage.getItem('selectedColumnName');
    setSelectedColumn(saved || '');
    addColumnToFormula(saved);
  };

  

  window.addEventListener('selectedColumnNameChanged', syncSelectedColumnName);
  return () =>
    window.removeEventListener('selectedColumnNameChanged', syncSelectedColumnName);
}, []);

useEffect(()=> {
  const syncSelectedOperator = () => {
    const saved = localStorage.getItem('selectedOperator');
    setFormulaElements(prev => [...prev, { type: 'operator', value: saved, display: saved }]);
  }

  window.addEventListener('selectedOperatorChanged', syncSelectedOperator);
  return () => window.removeEventListener('selectedOperatorChanged', syncSelectedOperator);
},[])


  const addColumnToFormula = useCallback((column) => {
    if (column) {
      setFormulaElements(prev => [...prev, { type: 'column', value: column, display: column }]);
      setSelectedColumn(null);
      setShowPreview(false);
    }
  }, []);

  const addOperatorToFormula = useCallback((operator) => {
    setFormulaElements(prev => [...prev, { type: 'operator', value: operator.value, display: operator.display }]);
    setShowPreview(false);
  }, []);

  const addCustomValueToFormula = useCallback(() => {
    if (customValue.trim() !== '' && !isNaN(parseFloat(customValue))) {
      setFormulaElements(prev => [...prev, { type: 'number', value: customValue, display: customValue }]);
      setCustomValue('');
      setShowPreview(false);
    }
  }, [customValue]);

  const handleCustomValueKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && customValue.trim() !== '') {
      addCustomValueToFormula();
    }
  }, [addCustomValueToFormula, customValue]);

  const clearFormula = useCallback(() => {
    setFormulaElements([]);
    setShowPreview(false);
  }, []);

  const removeLastElement = useCallback(() => {
    setFormulaElements(prev => prev.slice(0, -1));
    setShowPreview(false);
  }, []);

  const getFormulaString = useCallback(() => {
    return formulaElements.map(el => el.value).join(' ');
  }, [formulaElements]);

  const handleGeneratePreview = useCallback(() => {
    if (formulaElements.length > 0 && isFormulaValid) {
      setShowPreview(true);
    }
  }, [formulaElements, isFormulaValid]);

  const handleSubmit = useCallback(() => {
    if (columnName.trim() === '') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      return;
    }

    if (!isFormulaValid) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      return;
    }

    const formulaString = getFormulaString();

    const newColumn = {
      name: columnName,
      formula: formulaString,
      formulaElements: [...formulaElements],
      status: 'pending'
    };

    onAddColumn(newColumn);

    setColumnName('');
    setFormulaElements([]);
    setShowPreview(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [columnName, isFormulaValid, getFormulaString, formulaElements, onAddColumn]);

  const canShowPreviewButton = columnName.trim() !== '' && formulaElements.length > 0 && isFormulaValid;

  const addFunctionToFormula = useCallback(() => {
    if (selectedFunction && selectedFunctionColumns.length > 0) {
      if (selectedFunction.value === 'SUM') {
        const sumElements = [];
        selectedFunctionColumns.forEach((col, idx) => {
          sumElements.push({ type: 'column', value: col, display: col });
          if (idx < selectedFunctionColumns.length - 1) {
            sumElements.push({ type: 'operator', value: '+', display: '+' });
          }
        });
        setFormulaElements(prev => [...prev, ...sumElements]);
      } else if (selectedFunction.value === 'AVG') {
        const n = selectedFunctionColumns.length;
        if (n === 1) {
          setFormulaElements(prev => [...prev, { type: 'column', value: selectedFunctionColumns[0], display: selectedFunctionColumns[0] }]);
        } else {
          const avgElements = [
            { type: 'operator', value: '(', display: '(' },
          ];
          selectedFunctionColumns.forEach((col, idx) => {
            avgElements.push({ type: 'column', value: col, display: col });
            if (idx < selectedFunctionColumns.length - 1) {
              avgElements.push({ type: 'operator', value: '+', display: '+' });
            }
          });
          avgElements.push({ type: 'operator', value: ')', display: ')' });
          avgElements.push({ type: 'operator', value: '/', display: '÷' });
          avgElements.push({ type: 'number', value: String(n), display: String(n) });
          setFormulaElements(prev => [...prev, ...avgElements]);
        }
      } else if (selectedFunction.value === 'PRODUCT') {
        const prodElements = [];
        selectedFunctionColumns.forEach((col, idx) => {
          prodElements.push({ type: 'column', value: col, display: col });
          if (idx < selectedFunctionColumns.length - 1) {
            prodElements.push({ type: 'operator', value: '*', display: '×' });
          }
        });
        setFormulaElements(prev => [...prev, ...prodElements]);
      } else if (selectedFunction.value === 'DIFF') {
        if (selectedFunctionColumns.length === 2) {
          setFormulaElements(prev => [
            ...prev,
            { type: 'column', value: selectedFunctionColumns[0], display: selectedFunctionColumns[0] },
            { type: 'operator', value: '-', display: '-' },
            { type: 'column', value: selectedFunctionColumns[1], display: selectedFunctionColumns[1] },
          ]);
        } else {
          alert('DIFF requires exactly 2 columns.');
        }
      } else if (selectedFunction.value === 'SCALED_SUM') {
        if (!scaleK || isNaN(Number(scaleK))) {
          alert('Please enter a valid scale factor k.');
        } else {
          const scaledSumElements = [
            { type: 'number', value: scaleK, display: scaleK },
            { type: 'operator', value: '*', display: '×' },
            { type: 'operator', value: '(', display: '(' },
          ];
          selectedFunctionColumns.forEach((col, idx) => {
            scaledSumElements.push({ type: 'column', value: col, display: col });
            if (idx < selectedFunctionColumns.length - 1) {
              scaledSumElements.push({ type: 'operator', value: '+', display: '+' });
            }
          });
          scaledSumElements.push({ type: 'operator', value: ')', display: ')' });
          setFormulaElements(prev => [...prev, ...scaledSumElements]);
        }
      } else if (selectedFunction.value === 'WEIGHTED_AVG') {
        if (selectedFunctionColumns.length !== weights.length || weights.some(w => !w || isNaN(Number(w)))) {
          alert('Please enter valid weights for each column.');
        } else {
          const weightedAvgElements = [
            { type: 'operator', value: '(', display: '(' },
          ];
          selectedFunctionColumns.forEach((col, idx) => {
            weightedAvgElements.push({ type: 'column', value: col, display: col });
            weightedAvgElements.push({ type: 'operator', value: '*', display: '×' });
            weightedAvgElements.push({ type: 'number', value: weights[idx], display: weights[idx] });
            if (idx < selectedFunctionColumns.length - 1) {
              weightedAvgElements.push({ type: 'operator', value: '+', display: '+' });
            }
          });
          weightedAvgElements.push({ type: 'operator', value: ')', display: ')' });
          weightedAvgElements.push({ type: 'operator', value: '/', display: '÷' });
          weightedAvgElements.push({ type: 'operator', value: '(', display: '(' });
          weights.forEach((w, idx) => {
            weightedAvgElements.push({ type: 'number', value: w, display: w });
            if (idx < weights.length - 1) {
              weightedAvgElements.push({ type: 'operator', value: '+', display: '+' });
            }
          });
          weightedAvgElements.push({ type: 'operator', value: ')', display: ')' });
          setFormulaElements(prev => [...prev, ...weightedAvgElements]);
        }
      } else if (selectedFunction.value === 'PERCENT') {
        if (selectedFunctionColumns.length === 2) {
          setFormulaElements(prev => [
            ...prev,
            { type: 'operator', value: '(', display: '(' },
            { type: 'column', value: selectedFunctionColumns[0], display: selectedFunctionColumns[0] },
            { type: 'operator', value: '/', display: '÷' },
            { type: 'column', value: selectedFunctionColumns[1], display: selectedFunctionColumns[1] },
            { type: 'operator', value: ')', display: ')' },
            { type: 'operator', value: '*', display: '×' },
            { type: 'number', value: '100', display: '100' },
          ]);
        } else {
          alert('PERCENT requires exactly 2 columns.');
        }
      } else if (selectedFunction.value === 'RATIO') {
        if (selectedFunctionColumns.length === 2) {
          setFormulaElements(prev => [
            ...prev,
            { type: 'column', value: selectedFunctionColumns[0], display: selectedFunctionColumns[0] },
            { type: 'operator', value: '/', display: '÷' },
            { type: 'column', value: selectedFunctionColumns[1], display: selectedFunctionColumns[1] },
          ]);
        } else {
          alert('RATIO requires exactly 2 columns.');
        }
      } else if (selectedFunction.value === 'SQUARE') {
        let col = selectedFunctionColumns;
        if (Array.isArray(selectedFunctionColumns)) {
          col = selectedFunctionColumns[0];
        }
        if (col && (!Array.isArray(selectedFunctionColumns) || selectedFunctionColumns.length === 1)) {
          setFormulaElements(prev => [
            ...prev,
            { type: 'column', value: col, display: col },
            { type: 'operator', value: '*', display: '×' },
            { type: 'column', value: col, display: col },
          ]);
        } else {
          alert('SQUARE requires exactly 1 column.');
        }
      } else if (selectedFunction.value === 'CUBE') {
        let col = selectedFunctionColumns;
        if (Array.isArray(selectedFunctionColumns)) {
          col = selectedFunctionColumns[0];
        }
        if (col && (!Array.isArray(selectedFunctionColumns) || selectedFunctionColumns.length === 1)) {
          setFormulaElements(prev => [
            ...prev,
            { type: 'column', value: col, display: col },
            { type: 'operator', value: '*', display: '×' },
            { type: 'column', value: col, display: col },
            { type: 'operator', value: '*', display: '×' },
            { type: 'column', value: col, display: col },
          ]);
        } else {
          alert('CUBE requires exactly 1 column.');
        }
      } else if (selectedFunction.value === 'LINEAR_COMBO') {
        if (selectedFunctionColumns.length !== coeffs.length - 1 || coeffs.some(c => !c || isNaN(Number(c)))) {
          alert('Please enter valid coefficients for each column and the offset.');
        } else {
          const linearComboElements = [];
          selectedFunctionColumns.forEach((col, idx) => {
            linearComboElements.push({ type: 'column', value: col, display: col });
            linearComboElements.push({ type: 'operator', value: '*', display: '×' });
            linearComboElements.push({ type: 'number', value: coeffs[idx], display: coeffs[idx] });
            if (idx < selectedFunctionColumns.length - 1) {
              linearComboElements.push({ type: 'operator', value: '+', display: '+' });
            }
          });
          
          linearComboElements.push({ type: 'operator', value: '+', display: '+' });
          linearComboElements.push({ type: 'number', value: coeffs[coeffs.length - 1], display: coeffs[coeffs.length - 1] });
          setFormulaElements(prev => [...prev, ...linearComboElements]);
        }
      } else {
        alert('This function is not yet supported as an arithmetic expression.');
      }
      setSelectedFunction(null);
      setSelectedFunctionColumns([]);
      setScaleK('1');
      setWeights([]);
      setCoeffs([]);
      setOffset('0');
      setShowPreview(false);
    }
  }, [selectedFunction, selectedFunctionColumns, scaleK, weights, coeffs]);

  return (
    <>
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
        <Typography variant="h6" color="primary" gutterBottom sx={{ mb: { xs: 2, sm: 3 } }}>
          Formula Builder
        </Typography>

        <Tabs
          value={builderMode}
          onChange={(_, v) => setBuilderMode(v)}
          sx={{ mb: { xs: 2, sm: 3 } }}
        >
          <Tab label="Expression Builder" value="expression" />
          <Tab label="Function Builder" value="function" />
        </Tabs>

        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Column Name"
              value={columnName}
              onChange={(e) => {
                setColumnName(e.target.value);
                setShowPreview(false);
                
              }}
              placeholder="Enter the name for your calculated column"
              margin="normal"
              variant="outlined"
              sx={{ mb: { xs: 1, sm: 2 } }}
            />
          </Grid>

          {builderMode === 'expression' && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Add Parameters
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" gutterBottom sx={{ mb: 1 }}>
                  Columns
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1}}>
                  <Autocomplete
                    fullWidth
                    options={allAvailableColumns.map(col => col.value)}
                    value={selectedColumn}
                    onChange={(event, newValue) => {
                      setSelectedColumn(newValue);
                      if (newValue) {
                        addColumnToFormula(newValue);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Search columns"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              <InputAdornment position="end">
                                <Search />
                              </InputAdornment>
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    freeSolo
                    clearOnBlur
                    selectOnFocus
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" gutterBottom>
                  Operators
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {operators.map((operator, index) => (
                    <Chip
                      key={index}
                      label={operator.display}
                      onClick={() => addOperatorToFormula(operator)}
                      color="secondary"
                      variant="outlined"
                      size="medium"
                      sx={{ borderRadius: 1 }}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom sx={{ mb: 1}}>
                  Custom Number
                </Typography>
                <TextField
                  label="Enter a number"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyPress={handleCustomValueKeyPress}
                  size="small"
                  variant="outlined"
                  type="number"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="add custom value"
                          onClick={addCustomValueToFormula}
                          edge="end"
                          disabled={customValue.trim() === '' || isNaN(parseFloat(customValue))}
                        >
                          <Add />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </>
          )}

          {builderMode === 'function' && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: { xs: 1, sm: 2 } }} />
                <Typography variant="subtitle2" gutterBottom sx={{ mb: { xs: 1, sm: 2 } }}>
                  Add Function
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: { xs: 2, sm: 3 }, justifyContent: { xs: 'flex-start', sm: 'center' } }}>
                  {functionList.map(fn => (
                    <Button
                      key={fn.value}
                      variant={selectedFunction?.value === fn.value ? 'contained' : 'outlined'}
                      color="secondary"
                      onClick={() => {
                        setSelectedFunction(fn);
                        setScaleK('1');
                        setWeights([]);
                        setCoeffs([]);
                        setOffset('0');
                      }}
                      sx={{ minWidth: 80, fontWeight: 500, fontSize: { xs: '0.8rem', sm: '0.95rem' }, py: 0.5, px: 1.5, borderRadius: 1 }}
                    >
                      {fn.label}
                    </Button>
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={8} lg={6} sx={{ mx: 'auto' }}>
                {selectedFunction && (
                  <Autocomplete
                    multiple={selectedFunction.value !== 'SQUARE' && selectedFunction.value !== 'CUBE' ? true : false}
                    fullWidth
                    options={allAvailableColumns.map(col => col.value)}
                    value={selectedFunctionColumns}
                    onChange={(_, newValue) => {
                      setSelectedFunctionColumns(newValue);
                      if (selectedFunction.value === 'WEIGHTED_AVG') {
                        setWeights(Array(newValue.length).fill('1'));
                      }
                      if (selectedFunction.value === 'LINEAR_COMBO') {
                        setCoeffs(Array(newValue.length + 1).fill('1'));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label={`Select columns for ${selectedFunction.label}`}
                        sx={{ mb: 1 }}
                      />
                    )}
                  />
                )}
              </Grid>
              {selectedFunction?.value === 'SCALED_SUM' && (
                <Grid item xs={12} md={6} lg={4} sx={{ mx: 'auto' }}>
                  <TextField
                    label="Scale Factor (k)"
                    value={scaleK}
                    onChange={e => setScaleK(e.target.value)}
                    size="small"
                    type="number"
                    sx={{ mt: 1, width: '100%' }}
                  />
                </Grid>
              )}
              {selectedFunction?.value === 'WEIGHTED_AVG' && selectedFunctionColumns.length > 0 && (
                <Grid item xs={12} md={8} lg={6} sx={{ mx: 'auto', display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedFunctionColumns.map((col, idx) => (
                    <TextField
                      key={col}
                      label={`Weight for ${col}`}
                      value={weights[idx] || ''}
                      onChange={e => {
                        const newWeights = [...weights];
                        newWeights[idx] = e.target.value;
                        setWeights(newWeights);
                      }}
                      size="small"
                      type="number"
                      sx={{ mt: 1, minWidth: 120, flex: 1 }}
                    />
                  ))}
                </Grid>
              )}
              {selectedFunction?.value === 'LINEAR_COMBO' && selectedFunctionColumns.length > 0 && (
                <Grid item xs={12} md={10} lg={8} sx={{ mx: 'auto', display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedFunctionColumns.map((col, idx) => (
                    <TextField
                      key={col}
                      label={`Coeff for ${col}`}
                      value={coeffs[idx] || ''}
                      onChange={e => {
                        const newCoeffs = [...coeffs];
                        newCoeffs[idx] = e.target.value;
                        setCoeffs(newCoeffs);
                      }}
                      size="small"
                      type="number"
                      sx={{ mt: 1, minWidth: 120, flex: 1 }}
                    />
                  ))}
                  <TextField
                    label={`Offset`}
                    value={coeffs[coeffs.length - 1] || ''}
                    onChange={e => {
                      const newCoeffs = [...coeffs];
                      newCoeffs[coeffs.length - 1] = e.target.value;
                      setCoeffs(newCoeffs);
                    }}
                    size="small"
                    type="number"
                    sx={{ mt: 1, minWidth: 120, flex: 1 }}
                  />
                </Grid>
              )}
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'center' }, mt: { xs: 2, sm: 3 } }}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!selectedFunction || selectedFunctionColumns.length === 0}
                  onClick={addFunctionToFormula}
                  sx={{ px: 4, py: 1.5, fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' }, borderRadius: 2 }}
                >
                  Add Function to Formula
                </Button>
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
              Formula
            </Typography>
            <FormulaDisplay formulaElements={formulaElements} />
            <FormulaValidator
              formulaElements={formulaElements}
              setIsValid={setIsFormulaValid}
            />

            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={clearFormula}
                startIcon={<DeleteOutline />}
                disabled={formulaElements.length === 0}
              >
                Clear All
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={removeLastElement}
                startIcon={<RemoveRounded />}
                disabled={formulaElements.length === 0}
              >
                Remove Last
              </Button>
              {canShowPreviewButton && (
                <Button
                  size="small"
                  variant="outlined"
                  color="info"
                  onClick={handleGeneratePreview}
                  startIcon={<TableChartOutlined />}
                >
                  Preview Results
                </Button>
              )}
            </Box>
          </Grid>

          {showPreview && (
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: { xs: 2, sm: 3 } }}>
              <Box sx={{ width: '100%', maxWidth: 900, px: { xs: 0, sm: 2 }, mx: 'auto' }}>
                <FormulaPreviewSection
                  formulaElements={formulaElements}
                  withoutProductData={withoutProductData}
                  withProductData={withProductData}
                  columnName={columnName}
                />
              </Box>
            </Box>
          )}

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                endIcon={<Done />}
                onClick={handleSubmit}
                disabled={columnName.trim() === '' || formulaElements.length === 0 || !isFormulaValid}
              >
                Add Column
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}

export default FormulaBuilder;