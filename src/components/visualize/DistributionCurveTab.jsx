import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
    Box, Typography, Card, CardContent, Grid, Alert, TextField, Autocomplete,
    IconButton, Tooltip as MuiTooltip, ToggleButton, ToggleButtonGroup,
    useTheme, useMediaQuery, Button, Switch, FormControlLabel, Collapse,
    List, ListItem, ListItemText, ListItemIcon, Slider, Divider, Chip
} from '@mui/material';
import DebouncedTextField from '../DebouncedTextField';
import {
    ResponsiveContainer, ComposedChart, Area, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, Line
} from 'recharts';
import DownloadIcon from '@mui/icons-material/Download';
import PanToolIcon from '@mui/icons-material/PanTool';
import SettingsIcon from '@mui/icons-material/Settings';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BarChartIcon from '@mui/icons-material/BarChart';
import * as d3 from 'd3';
import logo from "../../assets/abhitech-logo.png";
import html2canvas from "html2canvas";
import ChartSettingsModal from '../ChartSettingsModal';
import SaveVisualizationButton from '../SaveVisualizationButton';

// ============================================================================
// Color system: each column index gets a pair [with=deep, without=light]
// Both are solid fills — no dashes, visually distinct by hue + lightness
// ============================================================================
const COLOR_PAIRS = [
    { with: '#2563EB', without: '#93C5FD' },  // Blue deep / Blue light
    { with: '#DC2626', without: '#FCA5A5' },  // Red deep / Red light
    { with: '#059669', without: '#6EE7B7' },  // Green deep / Green light
    { with: '#D97706', without: '#FCD34D' },  // Amber deep / Amber light
    { with: '#7C3AED', without: '#C4B5FD' },  // Purple deep / Purple light
    { with: '#DB2777', without: '#F9A8D4' },  // Pink deep / Pink light
    { with: '#0891B2', without: '#67E8F9' },  // Cyan deep / Cyan light
    { with: '#EA580C', without: '#FDBA74' },  // Orange deep / Orange light
    { with: '#4338CA', without: '#A5B4FC' },  // Indigo deep / Indigo light
    { with: '#0D9488', without: '#5EEAD4' },  // Teal deep / Teal light
];

// Fixed colors for single/separate views
const SINGLE_COLORS = {
    withProduct:    { area: '#2563EB', bar: '#93C5FD' },   // Blue family
    withoutProduct: { area: '#DC2626', bar: '#FCA5A5' },   // Red family
};
const DATASET_COLORS = [
    { area: '#2563EB', bar: '#93C5FD' },  // Blue
    { area: '#DC2626', bar: '#FCA5A5' },  // Red
    { area: '#059669', bar: '#6EE7B7' },  // Green
    { area: '#D97706', bar: '#FCD34D' },  // Amber
    { area: '#7C3AED', bar: '#C4B5FD' },  // Purple
    { area: '#DB2777', bar: '#F9A8D4' },  // Pink
    { area: '#0891B2', bar: '#67E8F9' },  // Cyan
    { area: '#EA580C', bar: '#FDBA74' },  // Orange
    { area: '#065F46', bar: '#6EE7B7' },  // Dark Green
    { area: '#7C2D12', bar: '#FDBA74' },  // Dark Orange
    { area: '#1E1B4B', bar: '#A5B4FC' },  // Dark Indigo
    { area: '#134E4A', bar: '#5EEAD4' },  // Dark Teal
    { area: '#4A1D96', bar: '#DDD6FE' },  // Dark Purple
    { area: '#831843', bar: '#FBCFE8' },  // Dark Pink
    { area: '#713F12', bar: '#FDE68A' },  // Dark Amber
    { area: '#1C1917', bar: '#D6D3D1' },  // Dark Grey
];

const DEFAULT_COMBINED_COLOR_OPTIONS = [
    '#2563EB', '#DC2626', '#059669', '#D97706', '#7C3AED', '#DB2777', '#0891B2', '#EA580C', '#4338CA', '#0D9488'
];

const AxisControlPanel = ({
    title,
    columnName,
    xLabel,
    setXLabel,
    yLabel,
    setYLabel,
    xMin,
    setXMin,
    xMax,
    setXMax,
    yMin,
    setYMin,
    yMax,
    setYMax,
    dataMin,
    dataMax,
}) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [localXLabel, setLocalXLabel] = useState(xLabel || '');
    const [localYLabel, setLocalYLabel] = useState(yLabel || '');

    useEffect(() => {
        setLocalXLabel(xLabel || '');
    }, [xLabel]);

    useEffect(() => {
        setLocalYLabel(yLabel || '');
    }, [yLabel]);

    const handleXLabelChange = (event) => {
        const nextValue = event.target.value;
        setLocalXLabel(nextValue);
        setXLabel(nextValue);
    };

    const handleYLabelChange = (event) => {
        const nextValue = event.target.value;
        setLocalYLabel(nextValue);
        setYLabel(nextValue);
    };

    return (
        <Card sx={{ mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
            <Box sx={{ p: 1.5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => setShowAdvanced(!showAdvanced)}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><SettingsIcon fontSize="small" color="primary" /><Typography variant="subtitle2" sx={{ fontWeight: 500 }}>{title} Axis Settings</Typography></Box>
                <IconButton size="small" sx={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}><ExpandMoreIcon /></IconButton>
            </Box>
            <Collapse in={showAdvanced}><Divider />
                <CardContent sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                        {/* X-Axis Label */}
                        <Grid item xs={12} sm={6}>
                            <TextField label="X-Axis Label" value={localXLabel} onChange={handleXLabelChange} fullWidth size="small" placeholder={`e.g., ${columnName || 'Variable'}`} />
                        </Grid>
                        {/* Y-Axis Label */}
                        <Grid item xs={12} sm={6}>
                            <TextField label="Y-Axis Label" value={localYLabel} onChange={handleYLabelChange} fullWidth size="small" placeholder="e.g., Mean of Parameter" />
                        </Grid>
                        {/* X-Axis Range */}
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>X-Axis Range (Optional)</Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField label={`Min (Data: ${dataMin?.toFixed(2) || 'N/A'})`} type="number" value={xMin} onChange={(e) => setXMin(e.target.value)} size="small" placeholder="Auto" sx={{ flex: 1 }} />
                                <TextField label={`Max (Data: ${dataMax?.toFixed(2) || 'N/A'})`} type="number" value={xMax} onChange={(e) => setXMax(e.target.value)} size="small" placeholder="Auto" sx={{ flex: 1 }} />
                            </Box>
                        </Grid>
                        {/* Y-Axis Range */}
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Y-Axis Range (Optional)</Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField label="Y-Axis Min" type="number" value={yMin} onChange={(e) => setYMin(e.target.value)} size="small" placeholder="Auto" sx={{ flex: 1 }} />
                                <TextField label="Y-Axis Max" type="number" value={yMax} onChange={(e) => setYMax(e.target.value)} size="small" placeholder="Auto" sx={{ flex: 1 }} />
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Collapse>
        </Card>
    );
};

const DistributionCurveTab = ({
    availableColumns, withProductData, withoutProductData,
    datasets = [],
    clientName = '', plantName = '', productName = ''
}) => {
    // ========================================================================
    // State
    // ========================================================================
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [viewMode, setViewMode] = useState('combined');
    const [singleViewType, setSingleViewType] = useState('withProduct');

    // Y-axis column selection
    const [yAxisColumn, setYAxisColumn] = useState('');
    const [singleYAxisColumn, setSingleYAxisColumn] = useState('');
    const [separateYAxisColumn, setSeparateYAxisColumn] = useState('');
    const [yAggregation, setYAggregation] = useState('mean');

    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [showInsights, setShowInsights] = useState(false);
    const [showSummaryCards, setShowSummaryCards] = useState(false);

    // Combined View Settings
    const [combinedLegendLabels, setCombinedLegendLabels] = useState({});
    const [combinedXAxisLabel, setCombinedXAxisLabel] = useState('');
    const [combinedYAxisLabel, setCombinedYAxisLabel] = useState('');
    const [combinedXAxisMin, setCombinedXAxisMin] = useState('');
    const [combinedXAxisMax, setCombinedXAxisMax] = useState('');
    const [combinedYAxisMin, setCombinedYAxisMin] = useState('');
    const [combinedYAxisMax, setCombinedYAxisMax] = useState('');
    const [combinedDatasetColors, setCombinedDatasetColors] = useState({});

    const [columnColorMap, setColumnColorMap] = useState({});

    // Single View Settings
    const [singleColumn, setSingleColumn] = useState('');
    const [singleLegendLabel, setSingleLegendLabel] = useState('Value');
    const [singleXAxisLabel, setSingleXAxisLabel] = useState('');
    const [singleYAxisLabel, setSingleYAxisLabel] = useState('');
    const [singleXAxisMin, setSingleXAxisMin] = useState('');
    const [singleXAxisMax, setSingleXAxisMax] = useState('');
    const [singleYAxisMin, setSingleYAxisMin] = useState('');
    const [singleYAxisMax, setSingleYAxisMax] = useState('');

    // Separate View Settings
    const [separateColumn, setSeparateColumn] = useState('');
    const [separateLegendLabels, setSeparateLegendLabels] = useState({
        withProduct: 'With Product', withoutProduct: 'Without Product',
    });
    const [separateXAxisLabel, setSeparateXAxisLabel] = useState('');
    const [separateYAxisLabel, setSeparateYAxisLabel] = useState('');
    const [separateXAxisMin, setSeparateXAxisMin] = useState('');
    const [separateXAxisMax, setSeparateXAxisMax] = useState('');
    const [separateYAxisMin, setSeparateYAxisMin] = useState('');
    const [separateYAxisMax, setSeparateYAxisMax] = useState('');

    // Chart Feature Settings
    const [showGrid, setShowGrid] = useState(true);
    const [showDataPoints, setShowDataPoints] = useState(false);
    const [showNumberOfPoints, setShowNumberOfPoints] = useState(true);
    const [showAreaChart, setShowAreaChart] = useState(true);
    const [areaOpacity, setAreaOpacity] = useState(0.75);
    const [binCount, setBinCount] = useState(20);
    const [showStatistics, setShowStatistics] = useState(false);
    const [showOutliers, setShowOutliers] = useState(false);

    // Filter Settings
    const [filterColumn, setFilterColumn] = useState('');
    const [filterMin, setFilterMin] = useState('');
    const [filterMax, setFilterMax] = useState('');

    // Refs
    const combinedChartRef = useRef(null);
    const withoutProductChartRef = useRef(null);
    const withProductChartRef = useRef(null);
    const pageRef = useRef(null);

    const isValidDateValue = (value) => {
        if (value instanceof Date && !isNaN(value.getTime())) return true;
        if (typeof value === 'number') {
            if (value > 1e11) return true;
            if (Number.isInteger(value) && value >= 25000 && value <= 50000) {
                const date = new Date((value - 25569) * 86400 * 1000);
                return !isNaN(date.getTime()) && date.getFullYear() >= 1900 && date.getFullYear() <= 2100;
            }
            return false;
        }
        if (typeof value === 'string') {
            const str = value.trim();
            if (!str) return false;
            const date = new Date(str);
            if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                return year >= 1900 && year <= 2100;
            }
        }
        return false;
    };

    const parseDateTimeFromInput = (inputValue) => {
        if (!inputValue) return null;
        if (typeof inputValue === 'number') {
            return inputValue;
        }
        const date = new Date(inputValue);
        return isNaN(date.getTime()) ? null : date.getTime();
    };

    const parseValue = (value, treatAsDateTime) => {
        if (treatAsDateTime) {
            if (value instanceof Date && !isNaN(value.getTime())) {
                return value.getTime();
            }
            if (typeof value === 'number') {
                if (value > 1e11) {
                    return value;
                }
                if (Number.isInteger(value) && value >= 25000 && value <= 50000) {
                    const date = new Date((value - 25569) * 86400 * 1000);
                    return isNaN(date.getTime()) ? null : date.getTime();
                }
                return null;
            }
            if (typeof value === 'string') {
                const date = new Date(value.trim());
                return isNaN(date.getTime()) ? null : date.getTime();
            }
            return null;
        }
        const num = Number(value);
        return isNaN(num) ? null : num;
    };

    const isDateTimeColumn = (allRows, columnName) => {
        if (!allRows || allRows.length === 0 || !columnName) return false;
        const sampleValues = allRows.slice(0, 10).map(row => row?.[columnName]).filter(val => val != null);
        if (sampleValues.length === 0) return false;

        let dateCount = 0;
        for (const val of sampleValues) {
            if (isValidDateValue(val)) {
                dateCount++;
            }
        }

        return dateCount >= Math.ceil(sampleValues.length * 0.7);
    };

    const columnIsDateTime = useMemo(() => {
        const all = [...(withProductData || []), ...(withoutProductData || [])];
        return isDateTimeColumn(all, filterColumn);
    }, [withProductData, withoutProductData, filterColumn]);

    // Build unified datasets array
    // If new "datasets" prop is passed, use it
    // Otherwise fall back to old withProductData/withoutProductData
    const allDatasets = useMemo(() => {
        const applyFilter = (data) => {
            if (!filterColumn || !data) return data || [];
            const minVal = columnIsDateTime
                ? (filterMin ? parseDateTimeFromInput(filterMin) : null)
                : (filterMin !== '' ? Number.parseFloat(filterMin) : null);
            const maxVal = columnIsDateTime
                ? (filterMax ? parseDateTimeFromInput(filterMax) : null)
                : (filterMax !== '' ? Number.parseFloat(filterMax) : null);
            if (minVal == null && maxVal == null) return data;
            return data.filter(row => {
                const raw = row?.[filterColumn];
                if (raw == null) return false;
                const v = parseValue(raw, columnIsDateTime);
                if (v == null) return false;
                if (minVal != null && v < minVal) return false;
                if (maxVal != null && v > maxVal) return false;
                return true;
            });
        };

        const sourceDatasets = datasets.length > 0
            ? datasets
            : [
                { name: 'Data 1', data: withProductData || [] },
                { name: 'Data 2', data: withoutProductData || [] },
            ].filter(d => d.data.length > 0);

        return sourceDatasets.map(d => ({
            ...d,
            data: applyFilter(d.data)
        }));
    }, [datasets, withProductData, withoutProductData, filterColumn, filterMin, filterMax, columnIsDateTime]);

    useEffect(() => {
        if (!allDatasets.length) return;
        setCombinedDatasetColors(prev => {
            const next = { ...prev };
            allDatasets.forEach((dataset, index) => {
                const key = dataset.name || `dataset${index}`;
                if (!next[key]) {
                    next[key] = DATASET_COLORS[index % DATASET_COLORS.length].area;
                }
            });
            return next;
        });
    }, [allDatasets]);

    const getDatasetColor = (dataset, datasetIndex) => {
        const key = dataset.name || `dataset${datasetIndex}`;
        return combinedDatasetColors[key] || DATASET_COLORS[datasetIndex % DATASET_COLORS.length].area;
    };

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // ========================================================================
    // Helpers
    // ========================================================================
    const generateFileName = (visualizationName) => {
        const parts = [];
        if (clientName) parts.push(clientName.replace(/\s+/g, '_'));
        if (plantName) parts.push(plantName.replace(/\s+/g, '_'));
        if (productName) parts.push(productName.replace(/\s+/g, '_'));
        parts.push(visualizationName.replace(/\s+/g, '_'));
        return parts.join('-');
    };

    // Assign color pairs to columns as they are added
    useEffect(() => {
        const newMap = { ...columnColorMap };
        let idx = Object.keys(columnColorMap).length;
        selectedColumns.forEach(col => {
            if (!newMap[col]) {
                newMap[col] = COLOR_PAIRS[idx % COLOR_PAIRS.length];
                idx++;
            }
        });
        setColumnColorMap(newMap);
    }, [selectedColumns]);

    // Initialize single/separate columns
    useEffect(() => {
        if (availableColumns.length > 0 && !singleColumn) setSingleColumn(availableColumns[0]);
        if (availableColumns.length > 0 && !separateColumn) setSeparateColumn(availableColumns[0]);
    }, [availableColumns, singleColumn, separateColumn]);

    const columnDateTimeMap = useMemo(() => {
        const all = [...(withProductData || []), ...(withoutProductData || [])];
        const map = {};
        (availableColumns || []).forEach(col => {
            map[col] = isDateTimeColumn(all, col);
        });
        return map;
    }, [availableColumns, withProductData, withoutProductData]);

    const parseRowValue = useCallback((row, column) => {
        if (!row || !column) return null;
        const raw = row[column];
        if (raw == null) return null;
        return parseValue(raw, columnDateTimeMap[column]);
    }, [columnDateTimeMap, parseValue]);

    const filteredWithProductData = useMemo(() => {
        if (!filterColumn) return withProductData || [];
        const minVal = columnIsDateTime ? (filterMin ? parseDateTimeFromInput(filterMin) : null) : (filterMin !== '' ? Number.parseFloat(filterMin) : null);
        const maxVal = columnIsDateTime ? (filterMax ? parseDateTimeFromInput(filterMax) : null) : (filterMax !== '' ? Number.parseFloat(filterMax) : null);
        if (minVal == null && maxVal == null) return withProductData || [];
        return (withProductData || []).filter(row => {
            const raw = row?.[filterColumn];
            if (raw == null) return false;
            const v = parseValue(raw, columnIsDateTime);
            if (v == null) return false;
            if (minVal != null && v < minVal) return false;
            if (maxVal != null && v > maxVal) return false;
            return true;
        });
    }, [withProductData, filterColumn, filterMin, filterMax, columnIsDateTime]);

    const filteredWithoutProductData = useMemo(() => {
        if (!filterColumn) return withoutProductData || [];
        const minVal = columnIsDateTime ? (filterMin ? parseDateTimeFromInput(filterMin) : null) : (filterMin !== '' ? Number.parseFloat(filterMin) : null);
        const maxVal = columnIsDateTime ? (filterMax ? parseDateTimeFromInput(filterMax) : null) : (filterMax !== '' ? Number.parseFloat(filterMax) : null);
        if (minVal == null && maxVal == null) return withoutProductData || [];
        return (withoutProductData || []).filter(row => {
            const raw = row?.[filterColumn];
            if (raw == null) return false;
            const v = parseValue(raw, columnIsDateTime);
            if (v == null) return false;
            if (minVal != null && v < minVal) return false;
            if (maxVal != null && v > maxVal) return false;
            return true;
        });
    }, [withoutProductData, filterColumn, filterMin, filterMax, columnIsDateTime]);

    const resetLocalFilter = () => { setFilterColumn(''); setFilterMin(''); setFilterMax(''); };

    // ========================================================================
    // Core aggregation helper
    // ========================================================================
    const buildBinnedData = (rows, xCol, yCol, globalMin, globalMax, nBins, aggregation) => {
        if (!rows.length || !xCol) return new Array(nBins).fill(null);
        const binWidth = (globalMax - globalMin) / nBins;
        const buckets = Array.from({ length: nBins }, () => []);
        rows.forEach(row => {
            const xVal = parseRowValue(row, xCol);
            if (xVal == null) return;
            let idx = Math.floor((xVal - globalMin) / binWidth);
            if (idx >= nBins) idx = nBins - 1;
            if (idx < 0) return;
            if (yCol) {
                const yVal = parseRowValue(row, yCol);
                if (yVal != null) buckets[idx].push(yVal);
            } else {
                buckets[idx].push(1);
            }
        });
        return buckets.map(vals => {
            if (!vals.length) return null;
            if (!yCol || aggregation === 'frequency') return vals.length;
            if (aggregation === 'sum') return vals.reduce((a, b) => a + b, 0);
            return vals.reduce((a, b) => a + b, 0) / vals.length;
        });
    };

    // ========================================================================
    // Statistics functions
    // ========================================================================
    const calculateDistributionStats = (data, column) => {
        if (!data || data.length === 0) return null;
        const values = data.map(row => parseRowValue(row, column)).filter(val => val != null);
        if (values.length === 0) return null;
        return {
            count: values.length,
            mean: d3.mean(values).toFixed(2),
            median: d3.median(values).toFixed(2),
            std: d3.deviation(values).toFixed(2),
            min: d3.min(values).toFixed(2),
            max: d3.max(values).toFixed(2),
            q1: d3.quantile(values, 0.25).toFixed(2),
            q3: d3.quantile(values, 0.75).toFixed(2),
            iqr: (d3.quantile(values, 0.75) - d3.quantile(values, 0.25)).toFixed(2),
            range: (d3.max(values) - d3.min(values)).toFixed(2)
        };
    };

    const calculateSkewness = (data, column) => {
        if (!data || data.length === 0) return null;
        const values = data.map(row => parseRowValue(row, column)).filter(val => val != null);
        if (values.length < 3) return null;
        const mean = d3.mean(values);
        const std = d3.deviation(values);
        const skewness = values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 3), 0) / values.length;
        return {
            value: skewness.toFixed(3),
            interpretation: Math.abs(skewness) < 0.5 ? 'Symmetric' : skewness > 0 ? 'Right-skewed' : 'Left-skewed'
        };
    };

    const detectOutliers = (data, column, threshold = 1.5) => {
        if (!data || data.length === 0) return [];
        const values = data.map(row => parseRowValue(row, column)).filter(v => v != null);
        if (values.length < 4) return [];
        const q1 = d3.quantile(values, 0.25);
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1;
        return values.filter(v => v < q1 - threshold * iqr || v > q3 + threshold * iqr);
    };

    const assessDataQuality = (data, column) => {
        if (!data || data.length === 0) return null;
        const values = data.map(row => parseRowValue(row, column)).filter(v => v != null);
        const completeness = (values.length / data.length) * 100;
        const outliers = detectOutliers(data, column);
        const outlierPct = (outliers.length / values.length) * 100;
        let quality = 'Excellent'; let score = 100;
        if (completeness < 80) { quality = 'Poor'; score -= 40; }
        else if (completeness < 95) { quality = 'Fair'; score -= 20; }
        if (outlierPct > 10) { quality = 'Poor'; score -= 30; }
        else if (outlierPct > 5) { quality = 'Fair'; score -= 15; }
        return { quality, score: Math.max(0, score), completeness: completeness.toFixed(1), outlierPercentage: outlierPct.toFixed(1) };
    };

    // ========================================================================
    // Combined chart data
    // ========================================================================
    const combinedChartData = useMemo(() => {
        if (selectedColumns.length === 0) return [];
        let allXValues = [];
        selectedColumns.forEach(column => {
            allDatasets.forEach(dataset => {
                (dataset.data || []).map(row => parseRowValue(row, column))
                    .filter(v => v != null)
                    .forEach(v => allXValues.push(v));
            });
        });
        if (allXValues.length === 0) return [];
        const globalMin = Math.min(...allXValues);
        const globalMax = Math.max(...allXValues);
        if (globalMin === globalMax) return [];
        const binWidth = (globalMax - globalMin) / binCount;
        const bins = Array.from({ length: binCount }, (_, i) => {
            const start = globalMin + i * binWidth;
            const end = i === binCount - 1 ? globalMax : globalMin + (i + 1) * binWidth;
            return { binStart: start, binEnd: end, binMiddle: parseFloat(((start + end) / 2).toFixed(4)), data: {} };
        });
        selectedColumns.forEach(column => {
            allDatasets.forEach((dataset, datasetIndex) => {
                const vals = buildBinnedData(dataset.data || [], column, yAxisColumn, globalMin, globalMax, binCount, yAggregation);
                const counts = buildBinnedData(dataset.data || [], column, null, globalMin, globalMax, binCount, 'frequency');
                const key = `${column}_dataset${datasetIndex}`;
                bins.forEach((bin, idx) => {
                    bin.data[`${key}`] = vals[idx];
                    bin.data[`${key}_count`] = counts[idx] ?? 0;
                });
            });
        });
        return bins;
    }, [selectedColumns, filteredWithProductData, filteredWithoutProductData, binCount, yAxisColumn, yAggregation]);

    // ========================================================================
    // Single / Separate view bins
    // ========================================================================
    const buildViewBins = (rows, xCol, yCol, aggregation, nBins) => {
        if (!rows.length || !xCol) return [];
        const xValues = rows.map(row => parseRowValue(row, xCol)).filter(v => v != null);
        if (!xValues.length) return [];
        const globalMin = Math.min(...xValues);
        const globalMax = Math.max(...xValues);
        if (globalMin === globalMax) return [];
        const binWidth = (globalMax - globalMin) / nBins;
        const bins = Array.from({ length: nBins }, (_, i) => {
            const start = globalMin + i * binWidth;
            const end = i === nBins - 1 ? globalMax : globalMin + (i + 1) * binWidth;
            return { binStart: start, binEnd: end, binMiddle: parseFloat(((start + end) / 2).toFixed(4)), yVals: [], count: 0 };
        });
        rows.forEach(row => {
            const xVal = parseRowValue(row, xCol);
            if (xVal == null) return;
            let idx = Math.floor((xVal - globalMin) / binWidth);
            if (idx >= nBins) idx = nBins - 1;
            if (idx < 0) return;
            bins[idx].count++;
            if (yCol) {
                const yVal = parseRowValue(row, yCol);
                if (yVal != null) bins[idx].yVals.push(yVal);
            }
        });
        return bins.map(bin => {
            let yValue;
            if (!yCol || aggregation === 'frequency') yValue = bin.count;
            else if (aggregation === 'sum') yValue = bin.yVals.length ? bin.yVals.reduce((a, b) => a + b, 0) : null;
            else yValue = bin.yVals.length ? bin.yVals.reduce((a, b) => a + b, 0) / bin.yVals.length : null;
            return { binStart: bin.binStart, binEnd: bin.binEnd, binMiddle: bin.binMiddle, value: yValue, count: bin.count };
        });
    };

    const withProductDistribution = useMemo(() =>
        buildViewBins(filteredWithProductData, separateColumn, separateYAxisColumn, yAggregation, binCount),
        [filteredWithProductData, separateColumn, separateYAxisColumn, yAggregation, binCount]);

    const withoutProductDistribution = useMemo(() =>
        buildViewBins(filteredWithoutProductData, separateColumn, separateYAxisColumn, yAggregation, binCount),
        [filteredWithoutProductData, separateColumn, separateYAxisColumn, yAggregation, binCount]);

    const singleDistribution = useMemo(() => {
        const data = singleViewType === 'withProduct' ? filteredWithProductData : filteredWithoutProductData;
        return buildViewBins(data, singleColumn, singleYAxisColumn, yAggregation, binCount);
    }, [filteredWithProductData, filteredWithoutProductData, singleColumn, singleYAxisColumn, singleViewType, yAggregation, binCount]);

    // const withProductStats = useMemo(() => calculateDistributionStats(filteredWithProductData, separateColumn), [filteredWithProductData, separateColumn]);
    // const withoutProductStats = useMemo(() => calculateDistributionStats(filteredWithoutProductData, separateColumn), [filteredWithoutProductData, separateColumn]);
    // const withProductSkewness = useMemo(() => calculateSkewness(filteredWithProductData, separateColumn), [filteredWithProductData, separateColumn]);
    // const withoutProductSkewness = useMemo(() => calculateSkewness(filteredWithoutProductData, separateColumn), [filteredWithoutProductData, separateColumn]);
    // const withProductQuality = useMemo(() => assessDataQuality(filteredWithProductData, separateColumn), [filteredWithProductData, separateColumn]);
    // const withoutProductQuality = useMemo(() => assessDataQuality(filteredWithoutProductData, separateColumn), [filteredWithoutProductData, separateColumn]);

    const getDefaultYLabel = (yCol, agg) => {
        if (!yCol) return 'Frequency (count)';
        if (agg === 'frequency') return 'Frequency (count)';
        if (agg === 'sum') return `Sum of ${yCol}`;
        return `Mean of ${yCol}`;
    };

    const formatDateValue = (value, includeTime = false) => {
        if (value == null || value === '' || Number.isNaN(value)) return value;
        const date = new Date(value);
        if (isNaN(date.getTime())) return value;
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        if (includeTime && (date.getHours() || date.getMinutes() || date.getSeconds())) {
            options.hour = '2-digit';
            options.minute = '2-digit';
            options.second = '2-digit';
        }
        return date.toLocaleString('en-US', options);
    };

    const isDateChartValue = (column) => Boolean(column && columnDateTimeMap?.[column]);

    // ========================================================================
    // Watermark
    // ========================================================================
    const WatermarkContent = () => (
        <div style={{
            position: 'absolute', top: isMobile ? '5px' : '0px', right: isMobile ? '10px' : '50px',
            display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px',
            background: 'rgba(255,255,255,0.95)', padding: isMobile ? '4px 8px' : '6px 14px',
            borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)',
            fontSize: isMobile ? '8px' : '10px', color: '#666', fontFamily: 'Arial, sans-serif',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 1000, pointerEvents: 'none'
        }}>
            <div style={{ width: isMobile ? '24px' : '34px', height: isMobile ? '24px' : '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src={logo} alt="Abhitech Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
            </div>
            <div>
                <div style={{ fontSize: isMobile ? '7px' : '10px', lineHeight: '1' }}>Powered by</div>
                <div style={{ fontSize: isMobile ? '8px' : '12px', fontWeight: 'bold', color: '#1976d2', lineHeight: '1.1' }}>Abhitech's AbhiStat</div>
            </div>
        </div>
    );

    // ========================================================================
    // Download functions
    // ========================================================================
    const downloadChartAsPNG = (chartRef, title) => {
        if (!chartRef?.current) return;
        const svgElement = chartRef.current.querySelector('svg');
        if (!svgElement) return;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svgRect = svgElement.getBoundingClientRect();
        const scaleFactor = 2;
        canvas.width = svgRect.width * scaleFactor;
        canvas.height = (svgRect.height + 50) * scaleFactor;
        const convertImageToDataURL = (imgSrc) => new Promise(resolve => {
            const img = new Image(); img.crossOrigin = 'anonymous';
            img.onload = () => { const c = document.createElement('canvas'); const cx = c.getContext('2d'); c.width = img.width; c.height = img.height; cx.drawImage(img, 0, 0); resolve(c.toDataURL('image/png')); };
            img.onerror = () => resolve(null); img.src = imgSrc;
        });
        convertImageToDataURL(logo).then(logoDataURL => {
            const svgClone = svgElement.cloneNode(true);
            if (logoDataURL) {
                const wg = document.createElementNS("http://www.w3.org/2000/svg", "g");
                wg.setAttribute("transform", `translate(${svgRect.width - 170}, 10)`);
                const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                bg.setAttribute("x", "0"); bg.setAttribute("y", "0"); bg.setAttribute("width", "160"); bg.setAttribute("height", "36");
                bg.setAttribute("fill", "rgba(255,255,255,0.95)"); bg.setAttribute("stroke", "rgba(0,0,0,0.1)"); bg.setAttribute("stroke-width", "1"); bg.setAttribute("rx", "4");
                const li = document.createElementNS("http://www.w3.org/2000/svg", "image");
                li.setAttributeNS('http://www.w3.org/1999/xlink', 'href', logoDataURL);
                li.setAttribute("x", "8"); li.setAttribute("y", "6"); li.setAttribute("width", "24"); li.setAttribute("height", "24"); li.setAttribute("preserveAspectRatio", "xMidYMid meet");
                const t1 = document.createElementNS("http://www.w3.org/2000/svg", "text");
                t1.setAttribute("x", "40"); t1.setAttribute("y", "18"); t1.setAttribute("fill", "#666"); t1.setAttribute("font-size", "10"); t1.setAttribute("font-family", "Arial, sans-serif"); t1.textContent = "Powered by";
                const t2 = document.createElementNS("http://www.w3.org/2000/svg", "text");
                t2.setAttribute("x", "40"); t2.setAttribute("y", "30"); t2.setAttribute("fill", "#1976d2"); t2.setAttribute("font-size", "11"); t2.setAttribute("font-weight", "bold"); t2.setAttribute("font-family", "Arial, sans-serif"); t2.textContent = "Abhitech's AbhiStat";
                wg.appendChild(bg); wg.appendChild(li); wg.appendChild(t1); wg.appendChild(t2); svgClone.appendChild(wg);
            }
            const svgData = new XMLSerializer().serializeToString(svgClone);
            const img = new Image();
            img.onload = () => {
                ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'black'; ctx.font = `${16 * scaleFactor}px Arial`; ctx.textAlign = 'center';
                ctx.fillText(title, canvas.width / 2, 30 * scaleFactor);
                ctx.drawImage(img, 0, 50 * scaleFactor, svgRect.width * scaleFactor, svgRect.height * scaleFactor);
                const dl = document.createElement('a'); dl.download = `${generateFileName(title)}.png`; dl.href = canvas.toDataURL('image/png'); dl.click();
            };
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        });
    };

    const downloadPageAsPNG = async () => {
        if (!pageRef.current) return;
        const o1 = showSummaryCards; const o2 = showInsights;
        setShowSummaryCards(true); setShowInsights(true);
        await new Promise(r => setTimeout(r, 400));
        const canvas = await html2canvas(pageRef.current, { useCORS: true, backgroundColor: '#fff', scale: 2, logging: false, windowWidth: pageRef.current.scrollWidth, windowHeight: pageRef.current.scrollHeight });
        setShowSummaryCards(o1); setShowInsights(o2);
        const link = document.createElement('a'); link.download = `${generateFileName('DistributionCurve_Page')}.png`; link.href = canvas.toDataURL('image/png'); link.click();
    };

    // ========================================================================
    // Summary Cards
    // ========================================================================
    const combinedStats = useMemo(() => {
        if (selectedColumns.length === 0) return null;
        const firstColumn = selectedColumns[0];
        if (columnDateTimeMap[firstColumn]) return null;
        const allData = allDatasets.flatMap(d => d.data || []);
        const values = allData
            .map(row => parseRowValue(row, firstColumn))
            .filter(v => v != null && !isNaN(v));
        if (values.length === 0) return null;
        return {
            count: values.length,
            mean: d3.mean(values).toFixed(2),
            std: d3.deviation(values).toFixed(2),
            skewness: (() => {
                if (values.length < 3) return null;
                const m = d3.mean(values); const s = d3.deviation(values);
                const sk = values.reduce((sum, val) => sum + Math.pow((val - m) / s, 3), 0) / values.length;
                return { value: sk.toFixed(3), interpretation: Math.abs(sk) < 0.5 ? 'Symmetric' : sk > 0 ? 'Right-skewed' : 'Left-skewed' };
            })(),
            kurtosis: (() => {
                if (values.length < 4) return null;
                const m = d3.mean(values); const s = d3.deviation(values);
                const ku = values.reduce((sum, val) => sum + Math.pow((val - m) / s, 4), 0) / values.length - 3;
                return { value: ku.toFixed(3), interpretation: Math.abs(ku) < 0.5 ? 'Normal' : ku > 0 ? 'Heavy-tailed' : 'Light-tailed' };
            })(),
            outliers: (() => {
                if (values.length < 4) return [];
                const q1 = d3.quantile(values, 0.25); const q3 = d3.quantile(values, 0.75);
                const iqr = q3 - q1;
                return values.filter(v => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr);
            })(),
            quality: assessDataQuality(allData, firstColumn),
        };
    }, [selectedColumns, filteredWithProductData, filteredWithoutProductData]);

    const SummaryCards = () => (
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            <Box sx={{ p: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: showSummaryCards ? '1px solid' : 'none', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => setShowSummaryCards(!showSummaryCards)}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><AnalyticsIcon color="primary" /><Typography variant="h6" sx={{ fontWeight: 500, color: 'primary.main' }}>Distribution Summary</Typography></Box>
                <IconButton size="small" sx={{ transform: showSummaryCards ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}><ExpandMoreIcon /></IconButton>
            </Box>
            <Collapse in={showSummaryCards} timeout={300}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        {[
                            { label: 'Total Data Points', value: combinedStats?.count || 0, sub: allDatasets.map((d, i) => `${d.name}: ${d.data?.length || 0} rows`).join(' | '), icon: <AnalyticsIcon sx={{ mr: 1, fontSize: 20 }} />, bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                            { label: 'Distribution Shape', value: combinedStats?.skewness?.interpretation?.split('-')[0] || 'N/A', sub: `${combinedStats?.skewness?.value || 'N/A'} skewness`, icon: <TrendingUpIcon sx={{ mr: 1, fontSize: 20 }} />, bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
                            { label: 'Tail Behavior', value: combinedStats?.kurtosis?.interpretation?.split('-')[0] || 'N/A', sub: `${combinedStats?.kurtosis?.value || 'N/A'} kurtosis`, icon: <BarChartIcon sx={{ mr: 1, fontSize: 20 }} />, bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
                            { label: 'Data Quality', value: combinedStats?.quality?.score || 'N/A', sub: `${combinedStats?.quality?.quality || 'N/A'} quality score`, icon: <InfoIcon sx={{ mr: 1, fontSize: 20 }} />, bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
                        ].map((card, i) => (
                            <Grid item xs={12} sm={6} md={3} key={i}>
                                <Card sx={{ height: '100%', background: card.bg, color: 'white' }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>{card.icon}<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{card.label}</Typography></Box>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>{card.value}</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.8 }}>{card.sub}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Collapse>
        </Card>
    );

    const InsightsPanel = () => {
        const allOutliers = detectOutliers(
            allDatasets.flatMap(d => d.data || []),
            separateColumn
        );

        return (
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2, border: '1px solid', borderColor: 'primary.light' }}>
                <Box sx={{
                    p: 2, cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: showInsights ? '1px solid' : 'none',
                    borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' }
                }} onClick={() => setShowInsights(!showInsights)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AnalyticsIcon color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 500, color: 'primary.main' }}>
                            Distribution Analysis
                        </Typography>
                    </Box>
                    <IconButton size="small" sx={{
                        transform: showInsights ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                    }}>
                        <ExpandMoreIcon />
                    </IconButton>
                </Box>

                <Collapse in={showInsights} timeout={300}>
                    <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            {allDatasets.map((dataset, index) => {
                                const color = DATASET_COLORS[index % DATASET_COLORS.length];
                                const stats = calculateDistributionStats(dataset.data || [], separateColumn);
                                const skewness = calculateSkewness(dataset.data || [], separateColumn);
                                const quality = assessDataQuality(dataset.data || [], separateColumn);

                                return (
                                    <Grid item xs={12} md={6} key={index}>
                                        <Typography variant="subtitle2" sx={{
                                            fontWeight: 600, mb: 2,
                                            color: color.area
                                        }}>
                                            {dataset.name} Analysis
                                        </Typography>
                                        <List dense>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <TrendingUpIcon sx={{ color: color.area }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Mean"
                                                    secondary={stats?.mean || 'N/A'}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <BarChartIcon sx={{ color: color.area }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Standard Deviation"
                                                    secondary={stats?.std || 'N/A'}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <InfoIcon sx={{ color: color.area }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Skewness"
                                                    secondary={skewness
                                                        ? `${skewness.value} (${skewness.interpretation})`
                                                        : 'N/A'}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <AnalyticsIcon sx={{ color: color.area }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Data Quality"
                                                    secondary={quality
                                                        ? `${quality.quality} (${quality.score}/100)`
                                                        : 'N/A'}
                                                />
                                            </ListItem>
                                        </List>
                                    </Grid>
                                );
                            })}
                        </Grid>

                        {allOutliers.length > 0 && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'warning.dark' }}>
                                    ⚠️ Outlier Detection
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'warning.dark' }}>
                                    {allOutliers.length} outliers detected using IQR method (1.5 × IQR threshold)
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                </Collapse>
            </Card>
        );
    };

    // ========================================================================
    // Settings Modal
    // ========================================================================
    const [draftSettings, setDraftSettings] = useState(null);
    const resetSettingsDraft = () => {
        setDraftSettings({
            showGrid, showStatistics, showOutliers, showDataPoints, areaOpacity, binCount,
            combinedLegendLabels: { ...combinedLegendLabels }, combinedXAxisLabel, combinedYAxisLabel,
            combinedXAxisMin, combinedXAxisMax, combinedYAxisMin, combinedYAxisMax,
            combinedDatasetColors: { ...combinedDatasetColors },
            singleLegendLabel, singleXAxisLabel, singleYAxisLabel, singleXAxisMin, singleXAxisMax, singleYAxisMin, singleYAxisMax,
            separateLegendLabels: { ...separateLegendLabels }, separateXAxisLabel, separateYAxisLabel,
            separateXAxisMin, separateXAxisMax, separateYAxisMin, separateYAxisMax,
        });
    };

    const openSettingsModal = () => {
        resetSettingsDraft();
        setSettingsModalOpen(true);
    };
    const handleSettingsModalClose = () => { setSettingsModalOpen(false); setDraftSettings(null); };
    const handleSettingsSave = () => {
        if (!draftSettings) return;
        setShowGrid(draftSettings.showGrid); setShowDataPoints(draftSettings.showDataPoints);
        setAreaOpacity(draftSettings.areaOpacity); setBinCount(draftSettings.binCount);
        setCombinedLegendLabels({ ...draftSettings.combinedLegendLabels });
        setCombinedXAxisLabel(draftSettings.combinedXAxisLabel); setCombinedYAxisLabel(draftSettings.combinedYAxisLabel);
        setCombinedXAxisMin(draftSettings.combinedXAxisMin); setCombinedXAxisMax(draftSettings.combinedXAxisMax);
        setCombinedYAxisMin(draftSettings.combinedYAxisMin); setCombinedYAxisMax(draftSettings.combinedYAxisMax);
        setCombinedDatasetColors({ ...draftSettings.combinedDatasetColors });
        setSingleLegendLabel(draftSettings.singleLegendLabel);
        setSingleXAxisLabel(draftSettings.singleXAxisLabel); setSingleYAxisLabel(draftSettings.singleYAxisLabel);
        setSingleXAxisMin(draftSettings.singleXAxisMin); setSingleXAxisMax(draftSettings.singleXAxisMax);
        setSingleYAxisMin(draftSettings.singleYAxisMin); setSingleYAxisMax(draftSettings.singleYAxisMax);
        setSeparateLegendLabels({ ...draftSettings.separateLegendLabels });
        setSeparateXAxisLabel(draftSettings.separateXAxisLabel); setSeparateYAxisLabel(draftSettings.separateYAxisLabel);
        setSeparateXAxisMin(draftSettings.separateXAxisMin); setSeparateXAxisMax(draftSettings.separateXAxisMax);
        setSeparateYAxisMin(draftSettings.separateYAxisMin); setSeparateYAxisMax(draftSettings.separateYAxisMax);
        setSettingsModalOpen(false); setDraftSettings(null);
    };

    // ========================================================================
    // Combined X & Y Selection Card (side by side)
    // ========================================================================
    const CombinedAxisSelectionCard = () => {
            const yCol = viewMode === 'combined' ? yAxisColumn : separateYAxisColumn;
            const setYCol = viewMode === 'combined' ? setYAxisColumn : setSeparateYAxisColumn;
        
        return (
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1, border: '1px solid', borderColor: 'primary.light' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>Axis Configuration</Typography>
                    
                    <Grid container spacing={3}>
                        {/* X-Axis Selection Section */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'secondary.main' }}>X-Axis (Independent Variable)</Typography>
                            
                            {viewMode === 'combined' && (
                                <Autocomplete
                                    multiple
                                    options={availableColumns}
                                    value={selectedColumns}
                                    onChange={(event, newValue) => setSelectedColumns(newValue)}
                                    renderInput={(params) => <TextField {...params} label="Select X-axis columns to compare" placeholder="Select columns..." size="small" />}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip 
                                                key={option}
                                                label={option} 
                                                {...getTagProps({ index })} 
                                                size="small"
                                                sx={{ bgcolor: columnColorMap[option]?.with || '#2563EB', color: 'white', fontWeight: 'bold' }} 
                                            />
                                        ))
                                    }
                                    size="small"
                                />
                            )}
                            
                            
                            
                            {viewMode === 'separate' && (
                                <Autocomplete 
                                    options={availableColumns} 
                                    value={separateColumn} 
                                    onChange={(e, v) => setSeparateColumn(v || '')} 
                                    renderInput={(params) => <TextField {...params} label="X-Axis Column" size="small" />} 
                                />
                            )}
                        </Grid>
                        
                        {/* Y-Axis Selection Section */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'secondary.main' }}>Y-Axis (Dependent Variable / Aggregation)</Typography>
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Autocomplete
                                        options={['', ...availableColumns]}
                                        value={yCol}
                                        onChange={(e, v) => setYCol(v || '')}
                                        renderInput={(params) => <TextField {...params} label="Select Y-axis column" placeholder="Default: Frequency count" size="small" />}
                                        getOptionLabel={(o) => o === '' ? 'Frequency (count)' : o}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <ToggleButtonGroup 
                                        value={yAggregation} 
                                        exclusive 
                                        onChange={(e, v) => v && setYAggregation(v)} 
                                        fullWidth 
                                        size="small"
                                        disabled={!yCol}
                                    >
                                        <ToggleButton value="mean">Mean</ToggleButton>
                                        <ToggleButton value="sum">Sum</ToggleButton>
                                        <ToggleButton value="frequency">Count</ToggleButton>
                                    </ToggleButtonGroup>
                                </Grid>
                            </Grid>
                            
                            {yCol && (
                                <Alert severity="success" sx={{ mt: 1, py: 0.5 }}>
                                    <Typography variant="caption">Plotting <strong>{yAggregation}</strong> of <strong>{yCol}</strong> per X bin</Typography>
                                </Alert>
                            )}
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        );
    };

    // ========================================================================
    // Color Legend Block — shown above combined chart
    // ========================================================================
    const ColorLegendBlock = ({ columns }) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
            {columns.map(col => (
                <Box key={col} sx={{ mb: 1, width: '100%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                        {col}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {allDatasets.map((dataset, index) => {
                            const colorValue = getDatasetColor(dataset, index);
                            return (
                                <Box key={index} sx={{
                                    display: 'flex', alignItems: 'center', gap: 0.75,
                                    bgcolor: 'grey.100', px: 1.5, py: 0.75, borderRadius: 2,
                                    border: '1px solid', borderColor: 'grey.300'
                                }}>
                                    <Box sx={{ width: 13, height: 13, borderRadius: '50%', bgcolor: colorValue, flexShrink: 0 }} />
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: colorValue }}>
                                        {dataset.name}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            ))}
        </Box>
    );

    // ========================================================================
    // Combined Chart Render
    // ========================================================================
    const renderCombinedChart = () => {
        if (!combinedChartData.length || selectedColumns.length === 0) {
            return <Alert severity="info" sx={{ width: '100%' }}>Please select at least one column to display the combined chart.</Alert>;
        }
        const xDomain = combinedXAxisMin !== '' || combinedXAxisMax !== ''
            ? [parseFloat(combinedXAxisMin) || 'auto', parseFloat(combinedXAxisMax) || 'auto'] : ['auto', 'auto'];
        const yDomain = combinedYAxisMin !== '' || combinedYAxisMax !== ''
            ? [parseFloat(combinedYAxisMin) || 'auto', parseFloat(combinedYAxisMax) || 'auto'] : ['auto', 'auto'];
        const defaultYLabel = getDefaultYLabel(yAxisColumn, yAggregation);
        const combinedXAxisIsDate = selectedColumns.some(col => columnDateTimeMap[col]);
        const combinedYAxisIsDate = isDateChartValue(yAxisColumn);
        const areas = [];
        const bars = [];

        selectedColumns.forEach(column => {
            allDatasets.forEach((dataset, datasetIndex) => {
                const colorValue = getDatasetColor(dataset, datasetIndex);
                const key = `${column}_dataset${datasetIndex}`;
                areas.push(
                    <Area
                        key={key}
                        yAxisId="left"
                        type="monotone"
                        dataKey={`data.${key}`}
                        stroke={colorValue}
                        strokeWidth={2.5}
                        fill={colorValue}
                        fillOpacity={areaOpacity}
                        name={`${column} — ${dataset.name}`}
                        dot={showDataPoints ? { r: 3, fill: colorValue, stroke: '#fff', strokeWidth: 1 } : false}
                        hide={!showAreaChart}
                        connectNulls
                    />
                );
                if (showNumberOfPoints) {
                    bars.push(
                        <Bar
                            key={`${key}_count`}
                            yAxisId="right"
                            dataKey={`data.${key}_count`}
                            fill={colorValue}
                            fillOpacity={0.65}
                            name={`Count — ${column} ${dataset.name}`}
                            barSize={6}
                            radius={[2, 2, 0, 0]}
                        />
                    );
                }
            });
        });

        return (
            <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 2 }}>
                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                    <Box sx={{ mb: 2 }}>
                        <Alert severity="info" sx={{ display: "flex", alignItems: "center", gap: 1, borderRadius: 2 }}>
                            <PanToolIcon fontSize="small" />
                            <Typography variant="body2">
                                Each dataset is shown with its own unique color.
                                {yAxisColumn ? ` Y-axis: ${defaultYLabel}.` : ' Y-axis: frequency count.'}
                                {` Showing ${allDatasets.length} dataset${allDatasets.length > 1 ? 's' : ''}: ${allDatasets.map(d => d.name).join(', ')}.`}
                            </Typography>
                        </Alert>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1, flexWrap: 'wrap' }}>
                        <MuiTooltip title="Chart Settings">
                            <Button variant="outlined" color="primary" onClick={openSettingsModal} startIcon={<SettingsIcon />} size="small" sx={{ textTransform: 'none', height: 32 }}>Settings</Button>
                        </MuiTooltip>
                        <SaveVisualizationButton elementId="visualization-content" fileNamePrefix="distribution_curve" />
                        <MuiTooltip title="Download as PNG">
                            <Button variant="outlined" color="primary" onClick={() => downloadChartAsPNG(combinedChartRef, 'Combined Distribution')} startIcon={<DownloadIcon />} size="small" sx={{ textTransform: 'none', height: 32 }}>Download PNG</Button>
                        </MuiTooltip>
                    </Box>

                    <ColorLegendBlock columns={selectedColumns} />

                    <div ref={combinedChartRef} className="abhitech-plot-area" style={{ width: '100%', height: isMobile ? 340 : isTablet ? 390 : 460, position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={combinedChartData} margin={{ top: 10, right: 70, left: 20, bottom: 70 }}>
                                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
                                <XAxis dataKey="binMiddle"
                                    label={{ value: combinedXAxisLabel || 'X Value', position: 'insideBottom', offset: -10, style: { fontSize: '13px', fill: '#555' } }}
                                    domain={xDomain} type="number" tick={{ fontSize: isMobile ? 10 : 12 }} tickFormatter={combinedXAxisIsDate ? formatDateValue : undefined} />
                                <YAxis yAxisId="left"
                                    label={{ value: combinedYAxisLabel || defaultYLabel, angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: '13px', fill: '#555' } }}
                                    domain={yDomain} tick={{ fontSize: isMobile ? 10 : 12 }} tickFormatter={combinedYAxisIsDate ? formatDateValue : undefined} />
                                <YAxis yAxisId="right" orientation="right"
                                    label={{ value: 'Count', angle: 90, position: 'insideRight', offset: -5, style: { fontSize: '13px', fill: '#555' } }}
                                    tick={{ fontSize: isMobile ? 10 : 12 }} />
                                <Tooltip formatter={(value, name) => {
                                    if (combinedYAxisIsDate && typeof value === 'number') return [formatDateValue(value, true), name];
                                    return [typeof value === 'number' ? value.toFixed(3) : value, name];
                                }}
                                    labelFormatter={(label) => combinedXAxisIsDate ? formatDateValue(label, true) : label}
                                />
                                <Legend wrapperStyle={{ fontSize: isMobile ? '10px' : '12px', paddingTop: '28px' }} />
                                {areas}
                                {bars}
                            </ComposedChart>
                        </ResponsiveContainer>
                        <WatermarkContent />
                    </div>
                </CardContent>
            </Card>
        );
    };

    // ========================================================================
    // Single / Separate distribution chart — solid fills, no dashes
    // ========================================================================
    const renderDistributionChart = (
        data, title, areaColor, barColor, chartRef,
        legendLabel = 'Value', xAxisLabel = null, yAxisLabel = '',
        xMin = '', xMax = '', yMin = '', yMax = '', activeYCol = '', activeXCol = ''
    ) => {
        if (!data || data.length === 0) {
            return <Alert severity="info" sx={{ width: '100%', mx: { xs: 1, sm: 0 } }}>No data available for visualization</Alert>;
        }
        const effectiveXAxisLabel = xAxisLabel || (viewMode === 'separate' ? separateColumn : singleColumn);
        const effectiveYAxisLabel = yAxisLabel || getDefaultYLabel(activeYCol, yAggregation);
        const xAxisDomain = xMin !== '' || xMax !== '' ? [parseFloat(xMin) || 'auto', parseFloat(xMax) || 'auto'] : ['auto', 'auto'];
        const yAxisDomain = yMin !== '' || yMax !== '' ? [parseFloat(yMin) || 'auto', parseFloat(yMax) || 'auto'] : ['auto', 'auto'];
        const activeXAxisIsDate = Boolean(activeXCol && columnDateTimeMap[activeXCol]);
        const activeYAxisIsDate = Boolean(activeYCol && columnDateTimeMap[activeYCol]);

        return (
            <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 2 }}>
                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {/* Colored swatch next to title for instant recognition */}
                            <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: areaColor, flexShrink: 0, boxShadow: `0 0 0 3px ${areaColor}33` }} />
                            <Typography variant="h6" sx={{ fontWeight: 700, color: areaColor, fontSize: { xs: "1rem", md: "1.2rem" } }}>{title}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                            <SaveVisualizationButton elementId="visualization-content" fileNamePrefix="distribution_curve" />
                            <MuiTooltip title="Download as PNG">
                                <Button variant="outlined" color="primary" onClick={() => downloadChartAsPNG(chartRef, title)} startIcon={<DownloadIcon />} size="small" sx={{ textTransform: 'none', height: 32 }}>Download PNG</Button>
                            </MuiTooltip>
                        </Box>
                    </Box>

                    <div ref={chartRef} className="abhitech-plot-area" style={{ width: '100%', height: isMobile ? 280 : isTablet ? 320 : 370, position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%" key={`dist-${xMin}-${xMax}-${yMin}-${yMax}-${activeYCol}-${yAggregation}`}>
                            <ComposedChart data={data} margin={{ top: 10, right: isMobile ? 55 : 70, left: isMobile ? 10 : 20, bottom: isMobile ? 50 : 40 }}>
                                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
                                <XAxis dataKey="binMiddle"
                                    label={{ value: effectiveXAxisLabel, position: 'insideBottom', offset: isMobile ? -30 : -20, style: { fontSize: isMobile ? '12px' : '13px', fill: '#555' } }}
                                    tick={{ fontSize: isMobile ? 10 : 12 }} domain={xAxisDomain} type="number"
                                    tickFormatter={activeXAxisIsDate ? formatDateValue : undefined} />
                                <YAxis yAxisId="left"
                                    label={{ value: effectiveYAxisLabel, angle: -90, position: 'insideLeft', offset: -5, style: { fontSize: isMobile ? '12px' : '13px', fill: '#555' } }}
                                    tick={{ fontSize: isMobile ? 10 : 12 }} domain={yAxisDomain}
                                    tickFormatter={activeYAxisIsDate ? formatDateValue : undefined} />
                                <YAxis yAxisId="right" orientation="right"
                                    label={{ value: 'Count', angle: 90, position: 'insideRight', offset: -5, style: { fontSize: isMobile ? '12px' : '13px', fill: '#555' } }}
                                    tick={{ fontSize: isMobile ? 10 : 12 }} />
                                <Tooltip
                                    formatter={(value, name) => {
                                        if (name === 'Count') return [value, 'Count'];
                                        if (activeYAxisIsDate && typeof value === 'number') return [formatDateValue(value, true), legendLabel];
                                        return [typeof value === 'number' ? value.toFixed(3) : value, legendLabel];
                                    }}
                                    labelFormatter={(label) => `${effectiveXAxisLabel}: ${activeXAxisIsDate ? formatDateValue(label, true) : label}`}
                                    contentStyle={{ fontSize: isMobile ? '12px' : '13px' }}
                                />
                                <Legend verticalAlign="top" height={36} align="left" wrapperStyle={{ fontSize: isMobile ? '12px' : '13px' }} />
                                {/* Solid filled area — no dashes */}
                                <Area yAxisId="left" type="monotone" dataKey="value"
                                    stroke={areaColor} strokeWidth={2.5}
                                    fill={areaColor} fillOpacity={areaOpacity}
                                    name={legendLabel}
                                    dot={showDataPoints ? { r: 3.5, fill: areaColor, stroke: '#fff', strokeWidth: 1.5 } : false}
                                    hide={!showAreaChart} connectNulls
                                />
                                {/* Bar with its complementary color for contrast */}
                                <Bar yAxisId="right" dataKey="count"
                                    fill={barColor} fillOpacity={0.8}
                                    name="Count" radius={[3, 3, 0, 0]}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                        <WatermarkContent />
                    </div>
                </CardContent>
            </Card>
        );
    };

    // ========================================================================
    // Separate Charts Render
    // ========================================================================
    const renderSeparateCharts = () => {
        return (
            <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
                {allDatasets.map((dataset, index) => {
                    const colors = DATASET_COLORS[index % DATASET_COLORS.length];
                    const chartRef = index === 0 ? withProductChartRef 
                                : index === 1 ? withoutProductChartRef 
                                : { current: null };

                    // filter this dataset's rows
                    const filteredData = filterColumn
                        ? (dataset.data || []).filter(row => {
                            const raw = row?.[filterColumn];
                            if (raw == null) return false;
                            const v = parseValue(raw, columnIsDateTime);
                            if (v == null) return false;
                            const minVal = columnIsDateTime
                                ? (filterMin ? parseDateTimeFromInput(filterMin) : null)
                                : (filterMin !== '' ? Number.parseFloat(filterMin) : null);
                            const maxVal = columnIsDateTime
                                ? (filterMax ? parseDateTimeFromInput(filterMax) : null)
                                : (filterMax !== '' ? Number.parseFloat(filterMax) : null);
                            if (minVal != null && v < minVal) return false;
                            if (maxVal != null && v > maxVal) return false;
                            return true;
                        })
                        : (dataset.data || []);

                    const distribution = buildViewBins(
                        filteredData,
                        separateColumn,
                        separateYAxisColumn,
                        yAggregation,
                        binCount
                    );

                    const allValues = filteredData
                        .map(row => parseRowValue(row, separateColumn))
                        .filter(v => v != null);

                    const globalMinMax = allValues.length
                        ? { min: Math.min(...allValues), max: Math.max(...allValues) }
                        : { min: 0, max: 0 };

                    return (
                        <Grid item xs={12} lg={allDatasets.length === 1 ? 12 : 6} key={index}>
                            <AxisControlPanel
                                title={dataset.name}
                                columnName={separateColumn}
                                xLabel={separateXAxisLabel} setXLabel={setSeparateXAxisLabel}
                                yLabel={separateYAxisLabel} setYLabel={setSeparateYAxisLabel}
                                xMin={separateXAxisMin} setXMin={setSeparateXAxisMin}
                                xMax={separateXAxisMax} setXMax={setSeparateXAxisMax}
                                yMin={separateYAxisMin} setYMin={setSeparateYAxisMin}
                                yMax={separateYAxisMax} setYMax={setSeparateYAxisMax}
                                dataMin={globalMinMax.min} dataMax={globalMinMax.max}
                            />
                            {renderDistributionChart(
                                distribution,
                                `${dataset.name} Distribution`,
                                colors.area,
                                colors.bar,
                                chartRef,
                                dataset.name,
                                separateXAxisLabel,
                                separateYAxisLabel,
                                separateXAxisMin,
                                separateXAxisMax,
                                separateYAxisMin,
                                separateYAxisMax,
                                separateYAxisColumn,
                                separateColumn
                            )}
                        </Grid>
                    );
                })}
            </Grid>
        );
    };

    // ========================================================================
    // Single Chart Render
    // ========================================================================
    const renderSingleChart = () => {
        const isWithProduct = singleViewType === 'withProduct';
        const title = `${isWithProduct ? 'With Product' : 'Without Product'} Distribution`;
        const areaColor = isWithProduct ? SINGLE_COLORS.withProduct.area : SINGLE_COLORS.withoutProduct.area;
        const barColor = isWithProduct ? SINGLE_COLORS.withProduct.bar : SINGLE_COLORS.withoutProduct.bar;
        const chartRef = isWithProduct ? withProductChartRef : withoutProductChartRef;
        const data = isWithProduct ? filteredWithProductData : filteredWithoutProductData;
        const values = data.map(row => parseRowValue(row, singleColumn)).filter(v => v != null);
        const globalMinMax = values.length ? { min: Math.min(...values), max: Math.max(...values) } : { min: 0, max: 0 };

        return (
            <>
                <AxisControlPanel title="Single View"
                    columnName={singleColumn}
                    xLabel={singleXAxisLabel} setXLabel={setSingleXAxisLabel}
                    yLabel={singleYAxisLabel} setYLabel={setSingleYAxisLabel}
                    xMin={singleXAxisMin} setXMin={setSingleXAxisMin}
                    xMax={singleXAxisMax} setXMax={setSingleXAxisMax}
                    yMin={singleYAxisMin} setYMin={setSingleYAxisMin}
                    yMax={singleYAxisMax} setYMax={setSingleYAxisMax}
                    dataMin={globalMinMax.min} dataMax={globalMinMax.max} />
                {renderDistributionChart(
                    singleDistribution, title,
                    areaColor, barColor, chartRef,
                    singleLegendLabel, singleXAxisLabel, singleYAxisLabel,
                    singleXAxisMin, singleXAxisMax, singleYAxisMin, singleYAxisMax,
                    singleYAxisColumn, singleColumn
                )}
            </>
        );
    };

    // ========================================================================
    // Main Render
    // ========================================================================
    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <ChartSettingsModal
                open={settingsModalOpen}
                onClose={handleSettingsModalClose}
                onApply={handleSettingsSave}
                onReset={resetSettingsDraft}
                draftSettings={draftSettings}
                setDraftSettings={setDraftSettings}
                colorPairs={allDatasets.map((dataset, index) => {
                    const datasetKey = dataset.name || `dataset${index}`;
                    return {
                        key: datasetKey,
                        label: dataset.name || `Dataset ${index + 1}`,
                        value: draftSettings?.combinedDatasetColors?.[datasetKey] || combinedDatasetColors[datasetKey] || DATASET_COLORS[index % DATASET_COLORS.length].area,
                        onChange: (color) => setDraftSettings(ds => ({
                            ...ds,
                            combinedDatasetColors: {
                                ...ds?.combinedDatasetColors,
                                [datasetKey]: color,
                            }
                        }))
                    };
                })}
                colorOptions={DEFAULT_COMBINED_COLOR_OPTIONS}
            />

            {/* View Mode Toggle */}
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'secondary.main' }}>View Mode</Typography>
                    <ToggleButtonGroup value={viewMode} exclusive onChange={(e, newMode) => newMode && setViewMode(newMode)} fullWidth size="small">
                        <ToggleButton value="combined">Combined</ToggleButton>
                        <ToggleButton value="separate">Separate</ToggleButton>
                    </ToggleButtonGroup>
                </Grid>
            </Grid>

            {/* Combined X & Y Axis Selection Card */}
            <CombinedAxisSelectionCard />

            {/* Distribution Settings */}
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1, bgcolor: 'grey.50' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>Distribution Settings</Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Box sx={{ px: 1 }}>
                                <Typography variant="body2" gutterBottom>Number of Bins: {binCount}</Typography>
                                <Slider value={binCount} onChange={(e, val) => setBinCount(val)} min={5} max={50} step={1} valueLabelDisplay="auto"
                                    marks={[{ value: 5, label: '5' }, { value: 20, label: '20' }, { value: 35, label: '35' }, { value: 50, label: '50' }]} />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel control={<Switch checked={showAreaChart} onChange={(e) => setShowAreaChart(e.target.checked)} />} label="Show Area Chart" />
                            <FormControlLabel control={<Switch checked={showNumberOfPoints} onChange={(e) => setShowNumberOfPoints(e.target.checked)} />} label="Show Count Bars" />
                            <FormControlLabel control={<Switch checked={showDataPoints} onChange={(e) => setShowDataPoints(e.target.checked)} />} label="Show Data Points" />
                            <FormControlLabel control={<Switch checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />} label="Show Grid" />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Data Filter Card */}
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1, bgcolor: 'grey.50' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>Data Filter</Typography>
                    <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
                        <Grid item xs={12} sm={6} md={3}>
                            <Autocomplete options={availableColumns} value={filterColumn} onChange={(event, newValue) => setFilterColumn(newValue || '')}
                                renderInput={(params) => <TextField {...params} label="Filter Column" variant="outlined" fullWidth size="small" />}
                                disableClearable={false} size="small" />
                        </Grid>
                        <Grid item xs={6} sm={3} md={2.5}>
                            <TextField type={columnIsDateTime ? 'datetime-local' : 'number'} label={columnIsDateTime ? 'Min (datetime)' : 'Min'}
                                value={filterMin} onChange={(e) => setFilterMin(e.target.value)} disabled={!filterColumn} variant="outlined" fullWidth size="small" />
                        </Grid>
                        <Grid item xs={6} sm={3} md={2.5}>
                            <TextField type={columnIsDateTime ? 'datetime-local' : 'number'} label={columnIsDateTime ? 'Max (datetime)' : 'Max'}
                                value={filterMax} onChange={(e) => setFilterMax(e.target.value)} disabled={!filterColumn} variant="outlined" fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12} sm={12} md={4}>
                            <Button onClick={resetLocalFilter} variant="outlined" size="small"
                                sx={{ textTransform: 'none', width: { xs: '100%', md: 'auto' }, minWidth: '120px' }}>Reset Filter</Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <div ref={pageRef}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
                    <MuiTooltip title="Download entire page as PNG">
                        <Button color="primary" onClick={downloadPageAsPNG} variant="outlined" size="small"
                            startIcon={<DownloadIcon />} sx={{ textTransform: 'none', fontWeight: 500 }}>Download Page</Button>
                    </MuiTooltip>
                </Box>

                {viewMode === 'combined' && renderCombinedChart()}
                {viewMode === 'separate' && renderSeparateCharts()}

                {viewMode === 'combined' && selectedColumns.length > 0 && <SummaryCards />}
                {viewMode === 'separate' && <InsightsPanel />}
            </div>
        </Box>
    );
};

export default DistributionCurveTab;