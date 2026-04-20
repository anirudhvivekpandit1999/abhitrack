import { useState, useEffect, useMemo, useRef } from 'react';
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

const DistributionCurveTab = ({
    availableColumns, withProductData, withoutProductData,
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

    // DateTime helpers
    const isDateTimeColumn = (allRows, columnName) => {
        if (!allRows || allRows.length === 0 || !columnName) return false;
        const sampleValues = allRows.slice(0, 10).map(row => row?.[columnName]).filter(val => val != null);
        if (sampleValues.length === 0) return false;
        const dateTimeRegex = /^\d{4}-\d{2}-\d{2}([\sT]\d{2}:\d{2}:\d{2}(\.\d{3})?)?$/;
        return sampleValues.every(val => {
            const str = String(val).trim();
            return dateTimeRegex.test(str) && !isNaN(Date.parse(str));
        });
    };

    const parseDateTimeFromInput = (inputValue) => {
        if (!inputValue) return null;
        const date = new Date(inputValue);
        return isNaN(date.getTime()) ? null : date.getTime();
    };

    const parseValue = (value, treatAsDateTime) => {
        if (treatAsDateTime) {
            const date = new Date(value);
            return isNaN(date.getTime()) ? null : date.getTime();
        }
        const num = Number(value);
        return isNaN(num) ? null : num;
    };

    const columnIsDateTime = useMemo(() => {
        const all = [...(withProductData || []), ...(withoutProductData || [])];
        return isDateTimeColumn(all, filterColumn);
    }, [withProductData, withoutProductData, filterColumn]);

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
            const xVal = parseFloat(row[xCol]);
            if (isNaN(xVal)) return;
            let idx = Math.floor((xVal - globalMin) / binWidth);
            if (idx >= nBins) idx = nBins - 1;
            if (idx < 0) return;
            if (yCol) {
                const yVal = parseFloat(row[yCol]);
                if (!isNaN(yVal)) buckets[idx].push(yVal);
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
        const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
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
        const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
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
        const values = data.map(row => parseFloat(row[column])).filter(v => !isNaN(v));
        if (values.length < 4) return [];
        const q1 = d3.quantile(values, 0.25);
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1;
        return values.filter(v => v < q1 - threshold * iqr || v > q3 + threshold * iqr);
    };

    const assessDataQuality = (data, column) => {
        if (!data || data.length === 0) return null;
        const values = data.map(row => parseFloat(row[column])).filter(v => !isNaN(v));
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
            filteredWithProductData.map(row => parseFloat(row[column])).filter(v => !isNaN(v)).forEach(v => allXValues.push(v));
            filteredWithoutProductData.map(row => parseFloat(row[column])).filter(v => !isNaN(v)).forEach(v => allXValues.push(v));
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
            const withVals = buildBinnedData(filteredWithProductData, column, yAxisColumn, globalMin, globalMax, binCount, yAggregation);
            const withoutVals = buildBinnedData(filteredWithoutProductData, column, yAxisColumn, globalMin, globalMax, binCount, yAggregation);
            const withCounts = buildBinnedData(filteredWithProductData, column, null, globalMin, globalMax, binCount, 'frequency');
            const withoutCounts = buildBinnedData(filteredWithoutProductData, column, null, globalMin, globalMax, binCount, 'frequency');
            bins.forEach((bin, idx) => {
                bin.data[`${column}_with`] = withVals[idx];
                bin.data[`${column}_without`] = withoutVals[idx];
                bin.data[`${column}_with_count`] = withCounts[idx] ?? 0;
                bin.data[`${column}_without_count`] = withoutCounts[idx] ?? 0;
            });
        });
        return bins;
    }, [selectedColumns, filteredWithProductData, filteredWithoutProductData, binCount, yAxisColumn, yAggregation]);

    // ========================================================================
    // Single / Separate view bins
    // ========================================================================
    const buildViewBins = (rows, xCol, yCol, aggregation, nBins) => {
        if (!rows.length || !xCol) return [];
        const xValues = rows.map(row => parseFloat(row[xCol])).filter(v => !isNaN(v));
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
            const xVal = parseFloat(row[xCol]);
            if (isNaN(xVal)) return;
            let idx = Math.floor((xVal - globalMin) / binWidth);
            if (idx >= nBins) idx = nBins - 1;
            if (idx < 0) return;
            bins[idx].count++;
            if (yCol) { const yVal = parseFloat(row[yCol]); if (!isNaN(yVal)) bins[idx].yVals.push(yVal); }
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

    const withProductStats = useMemo(() => calculateDistributionStats(filteredWithProductData, separateColumn), [filteredWithProductData, separateColumn]);
    const withoutProductStats = useMemo(() => calculateDistributionStats(filteredWithoutProductData, separateColumn), [filteredWithoutProductData, separateColumn]);
    const withProductSkewness = useMemo(() => calculateSkewness(filteredWithProductData, separateColumn), [filteredWithProductData, separateColumn]);
    const withoutProductSkewness = useMemo(() => calculateSkewness(filteredWithoutProductData, separateColumn), [filteredWithoutProductData, separateColumn]);
    const withProductQuality = useMemo(() => assessDataQuality(filteredWithProductData, separateColumn), [filteredWithProductData, separateColumn]);
    const withoutProductQuality = useMemo(() => assessDataQuality(filteredWithoutProductData, separateColumn), [filteredWithoutProductData, separateColumn]);

    const getDefaultYLabel = (yCol, agg) => {
        if (!yCol) return 'Frequency (count)';
        if (agg === 'frequency') return 'Frequency (count)';
        if (agg === 'sum') return `Sum of ${yCol}`;
        return `Mean of ${yCol}`;
    };

    // ========================================================================
    // Watermark
    // ========================================================================
    const WatermarkContent = () => (
        <div style={{
            position: 'absolute', top: isMobile ? '5px' : '0px', right: isMobile ? '10px' : '50px',
            display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '6px',
            background: 'rgba(255,255,255,0.95)', padding: isMobile ? '2px 6px' : '4px 10px',
            borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)',
            fontSize: isMobile ? '8px' : '10px', color: '#666', fontFamily: 'Arial, sans-serif',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 1000, pointerEvents: 'none'
        }}>
            <div style={{ width: isMobile ? '16px' : '22px', height: isMobile ? '16px' : '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src={logo} alt="Abhitech Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
            </div>
            <div>
                <div style={{ fontSize: isMobile ? '6px' : '8px', lineHeight: '1' }}>Powered by</div>
                <div style={{ fontSize: isMobile ? '7px' : '9px', fontWeight: 'bold', color: '#1976d2', lineHeight: '1.1' }}>Abhitech's AbhiStat</div>
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
        const allData = [...filteredWithProductData, ...filteredWithoutProductData];
        const values = allData.map(row => parseFloat(row[firstColumn])).filter(v => !isNaN(v));
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
                            { label: 'Total Data Points', value: combinedStats?.count || 0, sub: `${filteredWithProductData?.length || 0} with, ${filteredWithoutProductData?.length || 0} without`, icon: <AnalyticsIcon sx={{ mr: 1, fontSize: 20 }} />, bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
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
        const allOutliers = detectOutliers([...filteredWithProductData, ...filteredWithoutProductData], separateColumn);
        return (
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2, border: '1px solid', borderColor: 'primary.light' }}>
                <Box sx={{ p: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: showInsights ? '1px solid' : 'none', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => setShowInsights(!showInsights)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><AnalyticsIcon color="primary" /><Typography variant="h6" sx={{ fontWeight: 500, color: 'primary.main' }}>Distribution Analysis</Typography></Box>
                    <IconButton size="small" sx={{ transform: showInsights ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}><ExpandMoreIcon /></IconButton>
                </Box>
                <Collapse in={showInsights} timeout={300}>
                    <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'success.main' }}>With Product Analysis</Typography>
                                <List dense>
                                    <ListItem><ListItemIcon><TrendingUpIcon color="success" /></ListItemIcon><ListItemText primary="Mean" secondary={withProductStats?.mean || 'N/A'} /></ListItem>
                                    <ListItem><ListItemIcon><BarChartIcon color="success" /></ListItemIcon><ListItemText primary="Standard Deviation" secondary={withProductStats?.std || 'N/A'} /></ListItem>
                                    <ListItem><ListItemIcon><InfoIcon color="success" /></ListItemIcon><ListItemText primary="Skewness" secondary={withProductSkewness ? `${withProductSkewness.value} (${withProductSkewness.interpretation})` : 'N/A'} /></ListItem>
                                    <ListItem><ListItemIcon><AnalyticsIcon color="success" /></ListItemIcon><ListItemText primary="Data Quality" secondary={withProductQuality ? `${withProductQuality.quality} (${withProductQuality.score}/100)` : 'N/A'} /></ListItem>
                                </List>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'error.main' }}>Without Product Analysis</Typography>
                                <List dense>
                                    <ListItem><ListItemIcon><TrendingUpIcon color="error" /></ListItemIcon><ListItemText primary="Mean" secondary={withoutProductStats?.mean || 'N/A'} /></ListItem>
                                    <ListItem><ListItemIcon><BarChartIcon color="error" /></ListItemIcon><ListItemText primary="Standard Deviation" secondary={withoutProductStats?.std || 'N/A'} /></ListItem>
                                    <ListItem><ListItemIcon><InfoIcon color="error" /></ListItemIcon><ListItemText primary="Skewness" secondary={withoutProductSkewness ? `${withoutProductSkewness.value} (${withoutProductSkewness.interpretation})` : 'N/A'} /></ListItem>
                                    <ListItem><ListItemIcon><AnalyticsIcon color="error" /></ListItemIcon><ListItemText primary="Data Quality" secondary={withoutProductQuality ? `${withoutProductQuality.quality} (${withoutProductQuality.score}/100)` : 'N/A'} /></ListItem>
                                </List>
                            </Grid>
                        </Grid>
                        {allOutliers.length > 0 && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'warning.dark' }}>⚠️ Outlier Detection</Typography>
                                <Typography variant="body2" sx={{ color: 'warning.dark' }}>{allOutliers.length} outliers detected using IQR method (1.5 × IQR threshold)</Typography>
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
    const openSettingsModal = () => {
        setDraftSettings({
            showGrid, showStatistics, showOutliers, showDataPoints, areaOpacity, binCount,
            combinedLegendLabels: { ...combinedLegendLabels }, combinedXAxisLabel, combinedYAxisLabel,
            combinedXAxisMin, combinedXAxisMax, combinedYAxisMin, combinedYAxisMax,
            distributionColors: { withProduct: SINGLE_COLORS.withProduct.area, withoutProduct: SINGLE_COLORS.withoutProduct.area },
            barColors: { withProduct: SINGLE_COLORS.withProduct.bar, withoutProduct: SINGLE_COLORS.withoutProduct.bar },
            singleLegendLabel, singleXAxisLabel, singleYAxisLabel, singleXAxisMin, singleXAxisMax, singleYAxisMin, singleYAxisMax,
            separateLegendLabels: { ...separateLegendLabels }, separateXAxisLabel, separateYAxisLabel,
            separateXAxisMin, separateXAxisMax, separateYAxisMin, separateYAxisMax,
        });
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
    // Axis Control Panel
    // ========================================================================
    const AxisControlPanel = ({ title, xLabel, setXLabel, yLabel, setYLabel, xMin, setXMin, xMax, setXMax, yMin, setYMin, yMax, setYMax, dataMin, dataMax }) => {
        const [showAdvanced, setShowAdvanced] = useState(false);
        const columnName = viewMode === 'separate' ? separateColumn : singleColumn;
        return (
            <Card sx={{ mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                <Box sx={{ p: 1.5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => setShowAdvanced(!showAdvanced)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><SettingsIcon fontSize="small" color="primary" /><Typography variant="subtitle2" sx={{ fontWeight: 500 }}>{title} Axis Settings</Typography></Box>
                    <IconButton size="small" sx={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}><ExpandMoreIcon /></IconButton>
                </Box>
                <Collapse in={showAdvanced}><Divider />
                    <CardContent sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}><TextField label="X-Axis Label" value={xLabel} onChange={(e) => setXLabel(e.target.value)} fullWidth size="small" placeholder={`e.g., ${columnName || 'Variable'}`} /></Grid>
                            <Grid item xs={12} sm={6}><TextField label="Y-Axis Label" value={yLabel} onChange={(e) => setYLabel(e.target.value)} fullWidth size="small" placeholder="e.g., Mean of Parameter" /></Grid>
                            <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>X-Axis Range (Optional)</Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField label={`Min (Data: ${dataMin?.toFixed(2) || 'N/A'})`} type="number" value={xMin} onChange={(e) => setXMin(e.target.value)} size="small" placeholder="Auto" sx={{ flex: 1 }} />
                                    <TextField label={`Max (Data: ${dataMax?.toFixed(2) || 'N/A'})`} type="number" value={xMax} onChange={(e) => setXMax(e.target.value)} size="small" placeholder="Auto" sx={{ flex: 1 }} />
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
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

    // ========================================================================
    // Color Legend Block — shown above combined chart
    // ========================================================================
    const ColorLegendBlock = ({ columns }) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
            {columns.map(col => {
                const pair = columnColorMap[col] || COLOR_PAIRS[0];
                return (
                    <Box key={col} sx={{
                        display: 'flex', alignItems: 'center', gap: 0.75,
                        bgcolor: 'grey.100', px: 1.5, py: 0.75, borderRadius: 2,
                        border: '1px solid', borderColor: 'grey.300'
                    }}>
                        <Box sx={{ width: 13, height: 13, borderRadius: '50%', bgcolor: pair.with, flexShrink: 0, boxShadow: '0 0 0 2px rgba(0,0,0,0.1)' }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: pair.with }}>{col} (With)</Typography>
                        <Box sx={{ width: 13, height: 13, borderRadius: '50%', bgcolor: pair.without, flexShrink: 0, ml: 0.5, boxShadow: '0 0 0 2px rgba(0,0,0,0.1)' }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>(Without)</Typography>
                    </Box>
                );
            })}
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
        const areas = [];
        const bars = [];

        selectedColumns.forEach(column => {
            const pair = columnColorMap[column] || COLOR_PAIRS[0];

            // WITH product — deep/saturated color, solid filled area
            areas.push(
                <Area key={`${column}_with`} yAxisId="left" type="monotone"
                    dataKey={`data.${column}_with`}
                    stroke={pair.with} strokeWidth={2.5}
                    fill={pair.with} fillOpacity={areaOpacity}
                    name={`${column} — With Product`}
                    dot={showDataPoints ? { r: 3, fill: pair.with, stroke: '#fff', strokeWidth: 1 } : false}
                    hide={!showAreaChart} connectNulls
                />
            );
            // WITHOUT product — light/pastel version of same hue, solid filled area
            areas.push(
                <Area key={`${column}_without`} yAxisId="left" type="monotone"
                    dataKey={`data.${column}_without`}
                    stroke={pair.without} strokeWidth={2.5}
                    fill={pair.without} fillOpacity={areaOpacity}
                    name={`${column} — Without Product`}
                    dot={showDataPoints ? { r: 3, fill: pair.without, stroke: '#fff', strokeWidth: 1 } : false}
                    hide={!showAreaChart} connectNulls
                />
            );
            if (showNumberOfPoints) {
                bars.push(<Bar key={`${column}_with_bar`} yAxisId="right" dataKey={`data.${column}_with_count`} fill={pair.with} fillOpacity={0.65} name={`Count — ${column} With`} barSize={6} radius={[2, 2, 0, 0]} />);
                bars.push(<Bar key={`${column}_without_bar`} yAxisId="right" dataKey={`data.${column}_without_count`} fill={pair.without} fillOpacity={0.65} name={`Count — ${column} Without`} barSize={6} radius={[2, 2, 0, 0]} />);
            }
        });

        return (
            <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 2 }}>
                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                    <Box sx={{ mb: 2 }}>
                        <Alert severity="info" sx={{ display: "flex", alignItems: "center", gap: 1, borderRadius: 2 }}>
                            <PanToolIcon fontSize="small" />
                            <Typography variant="body2">
                                Each column uses a <strong>deep color</strong> for "With Product" and a <strong>matching light color</strong> for "Without Product" — fully solid fills, easy to distinguish.
                                {yAxisColumn ? ` Y-axis: ${defaultYLabel}.` : ' Y-axis: frequency count.'}
                            </Typography>
                        </Alert>
                    </Box>

                    <ColorLegendBlock columns={selectedColumns} />

                    <div ref={combinedChartRef} className="abhitech-plot-area" style={{ width: '100%', height: isMobile ? 280 : isTablet ? 320 : 390, position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={combinedChartData} margin={{ top: 10, right: 70, left: 20, bottom: 40 }}>
                                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
                                <XAxis dataKey="binMiddle"
                                    label={{ value: combinedXAxisLabel || 'X Value', position: 'insideBottom', offset: -20, style: { fontSize: '13px', fill: '#555' } }}
                                    domain={xDomain} type="number" tick={{ fontSize: isMobile ? 10 : 12 }} />
                                <YAxis yAxisId="left"
                                    label={{ value: combinedYAxisLabel || defaultYLabel, angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: '13px', fill: '#555' } }}
                                    domain={yDomain} tick={{ fontSize: isMobile ? 10 : 12 }} />
                                <YAxis yAxisId="right" orientation="right"
                                    label={{ value: 'Count', angle: 90, position: 'insideRight', offset: -5, style: { fontSize: '13px', fill: '#555' } }}
                                    tick={{ fontSize: isMobile ? 10 : 12 }} />
                                <Tooltip formatter={(value, name) => typeof value === 'number' ? [value.toFixed(3), name] : [value, name]} />
                                <Legend wrapperStyle={{ fontSize: isMobile ? '10px' : '12px', paddingTop: '8px' }} />
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
        xMin = '', xMax = '', yMin = '', yMax = '', activeYCol = ''
    ) => {
        if (!data || data.length === 0) {
            return <Alert severity="info" sx={{ width: '100%', mx: { xs: 1, sm: 0 } }}>No data available for visualization</Alert>;
        }
        const effectiveXAxisLabel = xAxisLabel || (viewMode === 'separate' ? separateColumn : singleColumn);
        const effectiveYAxisLabel = yAxisLabel || getDefaultYLabel(activeYCol, yAggregation);
        const xAxisDomain = xMin !== '' || xMax !== '' ? [parseFloat(xMin) || 'auto', parseFloat(xMax) || 'auto'] : ['auto', 'auto'];
        const yAxisDomain = yMin !== '' || yMax !== '' ? [parseFloat(yMin) || 'auto', parseFloat(yMax) || 'auto'] : ['auto', 'auto'];

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
                            <MuiTooltip title="Chart Settings">
                                <Button variant="outlined" color="primary" onClick={openSettingsModal} startIcon={<SettingsIcon />} size="small" sx={{ textTransform: 'none', height: 32 }}>Settings</Button>
                            </MuiTooltip>
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
                                    tick={{ fontSize: isMobile ? 10 : 12 }} domain={xAxisDomain} type="number" />
                                <YAxis yAxisId="left"
                                    label={{ value: effectiveYAxisLabel, angle: -90, position: 'insideLeft', offset: -5, style: { fontSize: isMobile ? '12px' : '13px', fill: '#555' } }}
                                    tick={{ fontSize: isMobile ? 10 : 12 }} domain={yAxisDomain} />
                                <YAxis yAxisId="right" orientation="right"
                                    label={{ value: 'Count', angle: 90, position: 'insideRight', offset: -5, style: { fontSize: isMobile ? '12px' : '13px', fill: '#555' } }}
                                    tick={{ fontSize: isMobile ? 10 : 12 }} />
                                <Tooltip
                                    formatter={(value, name) => {
                                        if (name === 'Count') return [value, 'Count'];
                                        return [typeof value === 'number' ? value.toFixed(3) : value, legendLabel];
                                    }}
                                    labelFormatter={(label) => `${effectiveXAxisLabel}: ${label}`}
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
        const withValues = filteredWithProductData.map(row => parseFloat(row[separateColumn])).filter(v => !isNaN(v));
        const withoutValues = filteredWithoutProductData.map(row => parseFloat(row[separateColumn])).filter(v => !isNaN(v));
        const all = [...withValues, ...withoutValues];
        const globalMinMax = all.length ? { min: Math.min(...all), max: Math.max(...all) } : { min: 0, max: 0 };

        return (
            <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
                <Grid item xs={12} lg={6}>
                    <AxisControlPanel title="Without Product"
                        xLabel={separateXAxisLabel} setXLabel={setSeparateXAxisLabel}
                        yLabel={separateYAxisLabel} setYLabel={setSeparateYAxisLabel}
                        xMin={separateXAxisMin} setXMin={setSeparateXAxisMin}
                        xMax={separateXAxisMax} setXMax={setSeparateXAxisMax}
                        yMin={separateYAxisMin} setYMin={setSeparateYAxisMin}
                        yMax={separateYAxisMax} setYMax={setSeparateYAxisMax}
                        dataMin={globalMinMax.min} dataMax={globalMinMax.max} />
                    {renderDistributionChart(
                        withoutProductDistribution, 'Without Product Distribution',
                        SINGLE_COLORS.withoutProduct.area, SINGLE_COLORS.withoutProduct.bar,
                        withoutProductChartRef, separateLegendLabels.withoutProduct,
                        separateXAxisLabel, separateYAxisLabel,
                        separateXAxisMin, separateXAxisMax, separateYAxisMin, separateYAxisMax,
                        separateYAxisColumn
                    )}
                </Grid>
                <Grid item xs={12} lg={6}>
                    <AxisControlPanel title="With Product"
                        xLabel={separateXAxisLabel} setXLabel={setSeparateXAxisLabel}
                        yLabel={separateYAxisLabel} setYLabel={setSeparateYAxisLabel}
                        xMin={separateXAxisMin} setXMin={setSeparateXAxisMin}
                        xMax={separateXAxisMax} setXMax={setSeparateXAxisMax}
                        yMin={separateYAxisMin} setYMin={setSeparateYAxisMin}
                        yMax={separateYAxisMax} setYMax={setSeparateYAxisMax}
                        dataMin={globalMinMax.min} dataMax={globalMinMax.max} />
                    {renderDistributionChart(
                        withProductDistribution, 'With Product Distribution',
                        SINGLE_COLORS.withProduct.area, SINGLE_COLORS.withProduct.bar,
                        withProductChartRef, separateLegendLabels.withProduct,
                        separateXAxisLabel, separateYAxisLabel,
                        separateXAxisMin, separateXAxisMax, separateYAxisMin, separateYAxisMax,
                        separateYAxisColumn
                    )}
                </Grid>
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
        const values = data.map(row => parseFloat(row[singleColumn])).filter(v => !isNaN(v));
        const globalMinMax = values.length ? { min: Math.min(...values), max: Math.max(...values) } : { min: 0, max: 0 };

        return (
            <>
                <AxisControlPanel title="Single View"
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
                    singleYAxisColumn
                )}
            </>
        );
    };

    // ========================================================================
    // Y-axis column selector UI
    // ========================================================================
    const renderYColumnSelector = () => {
        const yCol = viewMode === 'combined' ? yAxisColumn : viewMode === 'single' ? singleYAxisColumn : separateYAxisColumn;
        const setYCol = viewMode === 'combined' ? setYAxisColumn : viewMode === 'single' ? setSingleYAxisColumn : setSeparateYAxisColumn;
        return (
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={5} md={4}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'secondary.main' }}>Y-Axis Parameter (optional)</Typography>
                    <Autocomplete
                        options={['', ...availableColumns]} value={yCol} onChange={(e, v) => setYCol(v || '')}
                        renderInput={(params) => <TextField {...params} label="Select Y-axis column" placeholder="Default: Frequency count" size="small" />}
                        getOptionLabel={(o) => o === '' ? 'Frequency (count)' : o} size="small"
                    />
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'secondary.main' }}>Aggregation</Typography>
                    <ToggleButtonGroup value={yAggregation} exclusive onChange={(e, v) => v && setYAggregation(v)} fullWidth size="small" disabled={!yCol}>
                        <ToggleButton value="mean">Mean</ToggleButton>
                        <ToggleButton value="sum">Sum</ToggleButton>
                        <ToggleButton value="frequency">Count</ToggleButton>
                    </ToggleButtonGroup>
                </Grid>
                {yCol && (
                    <Grid item xs={12} sm={3} md={5}>
                        <Alert severity="success" sx={{ py: 0.5 }}>
                            <Typography variant="caption">Plotting <strong>{yAggregation}</strong> of <strong>{yCol}</strong> per X bin</Typography>
                        </Alert>
                    </Grid>
                )}
            </Grid>
        );
    };

    // ========================================================================
    // Main Render
    // ========================================================================
    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <ChartSettingsModal open={settingsModalOpen} onClose={handleSettingsModalClose} onSave={handleSettingsSave} draftSettings={draftSettings} setDraftSettings={setDraftSettings} />

            {/* View Mode and Column Selection */}
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'secondary.main' }}>View Mode</Typography>
                    <ToggleButtonGroup value={viewMode} exclusive onChange={(e, newMode) => newMode && setViewMode(newMode)} fullWidth size="small">
                        <ToggleButton value="combined">Combined</ToggleButton>
                        <ToggleButton value="separate">Separate</ToggleButton>
                        <ToggleButton value="single">Single</ToggleButton>
                    </ToggleButtonGroup>
                </Grid>

                {viewMode === 'combined' && (
                    <Grid item xs={12} sm={12} md={9}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'primary.main' }}>Select X Columns (Multiple)</Typography>
                        <Autocomplete
                            multiple options={availableColumns} value={selectedColumns}
                            onChange={(event, newValue) => setSelectedColumns(newValue)}
                            renderInput={(params) => <TextField {...params} label="Choose X-axis columns to compare" placeholder="Select columns..." size="small" />}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip label={option} {...getTagProps({ index })} size="small"
                                        sx={{ bgcolor: columnColorMap[option]?.with || '#2563EB', color: 'white', fontWeight: 'bold' }} />
                                ))
                            }
                            size="small"
                        />
                    </Grid>
                )}

                {viewMode === 'single' && (
                    <>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'primary.main' }}>X-Axis Column</Typography>
                            <Autocomplete options={availableColumns} value={singleColumn} onChange={(e, v) => setSingleColumn(v || '')} renderInput={(params) => <TextField {...params} size="small" />} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'info.main' }}>Dataset</Typography>
                            <ToggleButtonGroup value={singleViewType} exclusive onChange={(e, v) => v && setSingleViewType(v)} fullWidth size="small">
                                <ToggleButton value="withProduct">With Product</ToggleButton>
                                <ToggleButton value="withoutProduct">Without Product</ToggleButton>
                            </ToggleButtonGroup>
                        </Grid>
                    </>
                )}

                {viewMode === 'separate' && (
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'primary.main' }}>X-Axis Column</Typography>
                        <Autocomplete options={availableColumns} value={separateColumn} onChange={(e, v) => setSeparateColumn(v || '')} renderInput={(params) => <TextField {...params} size="small" />} />
                    </Grid>
                )}
            </Grid>

            {/* Y-Axis Column Selector */}
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1, border: '1px solid', borderColor: 'primary.light' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>Y-Axis Configuration</Typography>
                    {renderYColumnSelector()}
                </CardContent>
            </Card>

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
                {viewMode === 'single' && renderSingleChart()}

                {viewMode === 'combined' && selectedColumns.length > 0 && <SummaryCards />}
                {(viewMode === 'separate' || viewMode === 'single') && <InsightsPanel />}
            </div>
        </Box>
    );
};

export default DistributionCurveTab;