import { useState, useEffect, useMemo, useRef, useCallback, createRef } from "react";
import DebouncedTextField from '../DebouncedTextField';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  Autocomplete,
  Paper,
  FormControl,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Tooltip as MuiTooltip,
  Button,
  ButtonGroup,
  Switch,
  FormControlLabel,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Select,
  MenuItem,
  FormHelperText
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import PanToolIcon from "@mui/icons-material/PanTool";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InfoIcon from "@mui/icons-material/Info";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BarChartIcon from "@mui/icons-material/BarChart";
import ScaleIcon from "@mui/icons-material/Scale";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ScatterPlotIcon from "@mui/icons-material/ScatterPlot";
import TuneIcon from "@mui/icons-material/Tune";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import * as d3 from "d3";
import { v4 as uuidv4 } from 'uuid';
import logo from "../../assets/abhitech-logo.png";
import html2canvas from "html2canvas";
import ChartSettingsModal from '../ChartSettingsModal';
import SaveVisualizationButton from '../SaveVisualizationButton';
import Draggable from 'react-draggable';

// Base palette — matching DistributionCurveTab DATASET_COLORS
const BASE_COLORS = [
  "#2563EB", // Blue
  "#DC2626", // Red
  "#059669", // Green
  "#D97706", // Amber
  "#7C3AED", // Purple
  "#DB2777", // Pink
  "#0891B2", // Cyan
  "#EA580C", // Orange
  "#4338CA", // Indigo
  "#0D9488", // Teal
];

// Distinct categorical colors for individual plotted series.
// IMPORTANT: these are NOT light/dark variants of one pair color.
// Each pair + dataset combination receives its own independent hue.
const UNIQUE_SERIES_COLORS = [
  "#2563EB", "#DC2626", "#059669", "#D97706", "#7C3AED",
  "#DB2777", "#0891B2", "#EA580C", "#4F46E5", "#0D9488",
  "#65A30D", "#C026D3", "#0284C7", "#E11D48", "#16A34A",
  "#CA8A04", "#9333EA", "#E8590C", "#0369A1", "#BE123C",
  "#15803D", "#A16207", "#6D28D9", "#C2410C", "#0E7490",
  "#9F1239", "#166534", "#854D0E", "#5B21B6", "#B91C1C",
  "#047857", "#B45309", "#7E22CE", "#C0266D", "#0369A1",
  "#4D7C0F", "#A21CAF", "#1D4ED8", "#B91C1C", "#047857"
];

// Lighten a hex color by blending toward white by `amount` (0–1)
const lightenColor = (hex, amount = 0.45) => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `#${((1 << 24) | (lr << 16) | (lg << 8) | lb).toString(16).slice(1)}`;
};

// Darken a hex color by blending toward black by `amount` (0–1)
const darkenColor = (hex, amount = 0.3) => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const dr = Math.round(r * (1 - amount));
  const dg = Math.round(g * (1 - amount));
  const db = Math.round(b * (1 - amount));
  return `#${((1 << 24) | (dr << 16) | (dg << 8) | db).toString(16).slice(1)}`;
};

// Build per-pair color map: { [pairKey]: { base } }
const buildPairColorMap = (pairs, datasetNames) => {
  const map = {};
  pairs.forEach((pair, idx) => {
    const base = BASE_COLORS[idx % BASE_COLORS.length];
    const datasetColors = {};
    datasetNames.forEach((datasetName, dsIndex) => {
      if (dsIndex === 0) {
        datasetColors[datasetName] = base;
      } else {
        const variantTier = Math.floor((dsIndex - 1) / 2);
        const useLight = (dsIndex - 1) % 2 === 0;
        datasetColors[datasetName] = useLight
          ? lightenColor(base, Math.min(0.55, 0.25 + 0.12 * variantTier))
          : darkenColor(base, Math.min(0.55, 0.25 + 0.1 * variantTier));
      }
    });
    map[pair.key] = { base, datasetColors };
  });
  return map;
};

const sanitizeClassName = (value) => {
  return String(value)
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const CustomSlider = ({ value, onChange, min, max, step, label, formatValue }) => {
  const [tempValue, setTempValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => {
    setIsDragging(false);
    onChange(tempValue);
  };

  const handleChange = (newValue) => {
    setTempValue(newValue);
  };

  useEffect(() => {
    if (!isDragging) {
      setTempValue(value);
    }
  }, [value, isDragging]);

  return (
    <Box sx={{ width: '100%', p: 1.5, border: '1px solid #E8EDF5', borderRadius: 2, bgcolor: '#FAFBFD' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: '#2563EB',
            backgroundColor: '#EFF6FF',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.8rem'
          }}
        >
          {formatValue ? formatValue(tempValue) : tempValue}
        </Typography>
      </Box>
      <Box
        sx={{
          position: 'relative',
          height: '6px',
          backgroundColor: '#E2E8F0',
          borderRadius: '3px',
          cursor: 'pointer'
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            backgroundColor: '#2563EB',
            borderRadius: '3px',
            width: `${((tempValue - min) / (max - min)) * 100}%`,
            transition: isDragging ? 'none' : 'width 0.2s ease'
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={tempValue}
          onChange={(e) => handleChange(Number(e.target.value))}
          style={{
            position: 'absolute',
            top: '-8px',
            left: 0,
            width: '100%',
            height: '22px',
            opacity: 0,
            cursor: 'pointer'
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        />
      </Box>
    </Box>
  );
};

const EditableLabel = ({ value, onChange, color }) => {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleConfirm = () => {
    const nextValue = localValue.trim();
    if (nextValue) {
      onChange(nextValue);
    }
    setEditing(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') handleConfirm();
    if (event.key === 'Escape') {
      setLocalValue(value);
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={localValue}
        onChange={(event) => setLocalValue(event.target.value)}
        onBlur={handleConfirm}
        onKeyDown={handleKeyDown}
        style={{
          border: `1.5px solid ${color}`,
          borderRadius: '6px',
          padding: '2px 8px',
          fontSize: '0.75rem',
          fontWeight: 700,
          color,
          background: '#fff',
          outline: 'none',
          width: '120px',
          fontFamily: 'inherit',
        }}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      title="Click to rename"
      style={{
        fontWeight: 700,
        color,
        fontSize: '0.75rem',
        cursor: 'text',
        borderBottom: `1px dashed ${color}`,
        paddingBottom: '1px',
      }}
    >
      {value}
    </span>
  );
};

const MultiVariateScatterPlotTab = ({ withProductData = [], withoutProductData = [], availableColumns = [], clientName = '', plantName = '', productName = '', datasets = [] }) => {
  const [selectedXVars, setSelectedXVars] = useState([]);
  const [selectedYVars, setSelectedYVars] = useState([]);
  const [activePairs, setActivePairs] = useState([]);
  const [datasetView, setDatasetView] = useState("combined");
  const [showInsights, setShowInsights] = useState(false);
  const [showSummaryCards, setShowSummaryCards] = useState(false);
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const zoomRef = useRef(null);
  const zoomRectRef = useRef(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, data: null });
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const pageRef = useRef(null);
  
  // New settings for line and area display
  const [showLines, setShowLines] = useState(false);
  const [showArea, setShowArea] = useState(false);
  const [areaOpacity, setAreaOpacity] = useState(0.15);
  const [lineWidth, setLineWidth] = useState(2);
  
  // Axis scaling mode
  const [scaleMode, setScaleMode] = useState("global"); // "global", "perPair", or "perVariable"
  const [currentPairKey, setCurrentPairKey] = useState(null); // For per-pair mode, which pair to show

  const [chartSettings, setChartSettings] = useState({
    pointSize: 6,
    opacity: 0.5,
    showGrid: true,
    showTrendLines: true,
    trendLineMode: 'average', // 'average' | 'curve'
    showOutliers: false,
    showCorrelation: false,
    withProductColorOverride: {},
    withoutProductColorOverride: {}
});

  const [draftSettings, setDraftSettings] = useState(null);

  const [customXRange, setCustomXRange] = useState({ min: "", max: "", auto: true });
  const [customYRange, setCustomYRange] = useState({ min: "", max: "", auto: true });
  const [fixedXRange, setFixedXRange] = useState(null);
  const [datasetLabels, setDatasetLabels] = useState({});
  const [datasetColors, setDatasetColors] = useState({});
  // Custom color overrides for individual selected X-Y plots.
  // If a pair has no override, it continues to use the existing dataset colors.
  const [pairColors, setPairColors] = useState({});
  // Fully independent colors for every X-Y pair + dataset combination.
  // Key format: `${pairKey}|||${datasetName}`
  const [pairDatasetColors, setPairDatasetColors] = useState({});
  
  // NEW: Per-pair custom ranges
  const [perPairRanges, setPerPairRanges] = useState({});
  
  const canvasRef = useRef(null);
  const [currentTransform, setCurrentTransform] = useState(d3.zoomIdentity);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [annotations, setAnnotations] = useState([]);
  const [annotationPositions, setAnnotationPositions] = useState({});
  const annotationRefs = useRef({});

  const addAnnotation = () => {
    const id = Date.now();
    setAnnotations(prev => [...prev, { id, text: '', field: '', pairKey: scaleMode === 'perPair' ? currentPairKey : null }]);
    setAnnotationPositions(prev => ({ ...prev, [id]: { x: 120, y: 120 } }));
  };

  const removeAnnotation = (id) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
    setAnnotationPositions(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const updateAnnotation = (id, key, value) => {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, [key]: value } : a));
  };

  const handleAnnotationDragStop = (id, data) => {
    setAnnotationPositions(prev => ({ ...prev, [id]: { x: data.x, y: data.y } }));
  };

  const handleAnnotationDrag = (id, data) => {
    setAnnotationPositions(prev => ({ ...prev, [id]: { x: data.x, y: data.y } }));
  };

  const visibleAnnotations = useMemo(() => {
    if (scaleMode === 'perPair' && currentPairKey) {
      return annotations.filter(a => a.pairKey === currentPairKey);
    }
    return annotations;
  }, [annotations, scaleMode, currentPairKey]);

  const [filterColumn, setFilterColumn] = useState('');
  const [filterMin, setFilterMin] = useState('');
  const [filterMax, setFilterMax] = useState('');

  const isDateString = useCallback((value) => {
    if (!value || typeof value !== 'string') return false;
    const dateRegex = /^\d{4}-\d{2}-\d{2}([\sT]\d{2}:\d{2}:\d{2}(\.\d{3})?)?$/;
    return dateRegex.test(value) && !isNaN(Date.parse(value));
  }, []);

  const toNumeric = useCallback((value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return value;
    if (value instanceof Date && !isNaN(value.getTime())) return value.getTime();

    if (typeof value === 'string') {
      const str = value.trim();
      if (!str) return null;

      // Try numeric conversion first
      const num = Number(str);
      if (!isNaN(num)) {
        // Large numbers are likely timestamps in ms
        if (Math.abs(num) > 1e11) return num;
        // Excel serial date (days) heuristics -> convert to ms
        if (Number.isInteger(num) && num >= 25000 && num <= 50000) {
          const date = new Date((num - 25569) * 86400 * 1000);
          return isNaN(date.getTime()) ? null : date.getTime();
        }
        return num;
      }

      // Fallback: try Date parsing for strings like '2023-07-01 12:00'
      const dt = new Date(str);
      return isNaN(dt.getTime()) ? null : dt.getTime();
    }

    return null;
  }, []);

  const formatValue = useCallback((value, isDateTime) => {
    if (isDateTime && value && typeof value === 'number') {
      const date = new Date(value);
      const dateStr = date.toISOString().split("T")[0];
      const timeStr = date.toTimeString().split(" ")[0];
      return timeStr === "00:00:00" ? dateStr : `${dateStr} ${timeStr}`;
    }
    if (typeof value === "number") return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
    return String(value);
  }, []);

  const generateFileName = (visualizationName) => {
    const parts = [];
    if (clientName) parts.push(clientName.replace(/\s+/g, '_'));
    if (plantName) parts.push(plantName.replace(/\s+/g, '_'));
    if (productName) parts.push(productName.replace(/\s+/g, '_'));
    parts.push(visualizationName.replace(/\s+/g, '_'));
    return parts.join('-');
  };

  const availableColumnsForFilter = useMemo(() => availableColumns || [], [availableColumns]);

  const isDateTimeColumn = useCallback((data, columnName) => {
    if (!data || data.length === 0 || !columnName) return false;
    const sampleValues = data.slice(0, 20).map((row) => row?.[columnName]).filter((val) => val != null);
    if (sampleValues.length === 0) return false;
    let dateCount = 0;
    for (const val of sampleValues) {
      if (isDateString(String(val))) dateCount++;
    }
    return dateCount > sampleValues.length * 0.7;
  }, [isDateString]);

  const parseDateTimeFromInput = useCallback((inputValue) => {
    if (!inputValue) return null;
    const date = new Date(inputValue);
    return isNaN(date.getTime()) ? null : date.getTime();
  }, []);

  const columnIsDateTime = useMemo(() => {
    const all = [...withProductData, ...withoutProductData];
    return isDateTimeColumn(all, filterColumn);
  }, [withProductData, withoutProductData, filterColumn, isDateTimeColumn]);

  const parseValue = useCallback((value, treatAsDateTime) => {
    if (treatAsDateTime) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date.getTime();
    }
    const num = Number(value);
    return isNaN(num) ? null : num;
  }, []);

  const applyFilterToData = useCallback((data) => {
    if (!filterColumn || !Array.isArray(data)) return data || [];
    const minVal = columnIsDateTime ? (filterMin ? parseDateTimeFromInput(filterMin) : null) : (filterMin !== '' ? Number.parseFloat(filterMin) : null);
    const maxVal = columnIsDateTime ? (filterMax ? parseDateTimeFromInput(filterMax) : null) : (filterMax !== '' ? Number.parseFloat(filterMax) : null);
    if (minVal == null && maxVal == null) return data;
    return data.filter((row) => {
      const raw = row?.[filterColumn];
      if (raw == null) return false;
      const v = parseValue(raw, columnIsDateTime);
      if (v == null) return false;
      if (minVal != null && v < minVal) return false;
      if (maxVal != null && v > maxVal) return false;
      return true;
    });
  }, [columnIsDateTime, filterColumn, filterMax, filterMin, parseDateTimeFromInput, parseValue]);

  const allDatasets = useMemo(() => {
    const sourceDatasets = Array.isArray(datasets) && datasets.length > 0
      ? datasets
      : [
          { name: 'With Product', data: withProductData || [] },
          { name: 'Without Product', data: withoutProductData || [] },
        ];

    return sourceDatasets
      .filter((dataset) => Array.isArray(dataset?.data) && dataset.data.length > 0)
      .map((dataset) => ({
        ...dataset,
        data: applyFilterToData(dataset.data),
      }));
  }, [applyFilterToData, datasets, withProductData, withoutProductData]);

  // Legacy with/without datasets removed — use `allDatasets` everywhere

  useEffect(() => {
    setDatasetColors((prev) => {
      const next = { ...prev };
      allDatasets.forEach((dataset, index) => {
        const key = dataset.name || `dataset${index}`;
        if (!next[key]) {
          // Use an offset into the palette to avoid accidental color collisions
          // with per-pair base colors (which also use BASE_COLORS starting at 0).
          const OFFSET = 6;
          next[key] = BASE_COLORS[(index + OFFSET) % BASE_COLORS.length];
        }
      });
      return next;
    });
  }, [allDatasets]);

  useEffect(() => {
    setDatasetLabels((prev) => {
      const next = { ...prev };
      allDatasets.forEach((dataset, index) => {
        const key = dataset.name || `dataset${index}`;
        if (!next[key]) {
          next[key] = dataset.name || `Dataset ${index + 1}`;
        }
      });
      return next;
    });
  }, [allDatasets]);

  const resetLocalFilter = useCallback(() => {
    setFilterColumn('');
    setFilterMin('');
    setFilterMax('');
  }, []);

  useEffect(() => {
    if (!Array.isArray(availableColumns) || availableColumns.length === 0) return;

    setSelectedXVars((prev) => {
      if (prev.length > 0) return prev;
      return [availableColumns[0]];
    });

    setSelectedYVars((prev) => {
      if (prev.length > 0) return prev;
      const fallback = availableColumns[1] || availableColumns[0];
      return [fallback];
    });
  }, [availableColumns]);

  const allPairs = useMemo(() => {
    const pairs = [];
    selectedXVars.forEach((x) => {
      selectedYVars.forEach((y) => {
        if (x !== y) pairs.push({ x, y, key: `${x}__${y}` });
      });
    });
    return pairs;
  }, [selectedXVars, selectedYVars]);

  // Visible datasets: user-controlled list of dataset (sheet) names to show/hide
  const [visibleDatasetNames, setVisibleDatasetNames] = useState(() => allDatasets.map((dataset) => dataset.name));

  useEffect(() => {
    // keep previous visibility where possible when datasets change
    setVisibleDatasetNames((prev) => {
      const names = allDatasets.map((d) => d.name);
      // preserve previously visible ones that still exist
      const preserved = prev.filter(n => names.includes(n));
      // add any new datasets at the end (default visible)
      names.forEach(n => { if (!preserved.includes(n)) preserved.push(n); });
      return preserved;
    });
  }, [allDatasets]);

  const pairColorMap = useMemo(() => {
    const map = buildPairColorMap(allPairs, visibleDatasetNames);

    // Apply user-selected plot colors on top of the generated palette.
    // Dataset variants are rebuilt from the selected pair color so legends,
    // trend lines and any pair-derived styling remain visually consistent.
    allPairs.forEach((pair) => {
      const override = pairColors[pair.key];
      if (!override || !map[pair.key]) return;

      const datasetVariants = {};
      visibleDatasetNames.forEach((datasetName, dsIndex) => {
        if (dsIndex === 0) {
          datasetVariants[datasetName] = override;
        } else {
          const variantTier = Math.floor((dsIndex - 1) / 2);
          const useLight = (dsIndex - 1) % 2 === 0;
          datasetVariants[datasetName] = useLight
            ? lightenColor(override, Math.min(0.55, 0.25 + 0.12 * variantTier))
            : darkenColor(override, Math.min(0.55, 0.25 + 0.1 * variantTier));
        }
      });

      map[pair.key] = { base: override, datasetColors: datasetVariants };
    });

    return map;
  }, [allPairs, visibleDatasetNames, pairColors]);

  const getPairDatasetColor = useCallback((pairKey, dataset) => {
    const comboKey = `${pairKey}|||${dataset}`;

    // User-selected override always wins.
    if (pairDatasetColors[comboKey]) return pairDatasetColors[comboKey];

    // Assign every pair + dataset combination a completely independent
    // categorical color. No lightening/darkening and no inherited pair shade.
    const pairIndex = Math.max(0, allPairs.findIndex((pair) => pair.key === pairKey));
    const datasetIndex = Math.max(0, allDatasets.findIndex((ds) => ds.name === dataset));
    const seriesIndex = pairIndex * Math.max(allDatasets.length, 1) + datasetIndex;

    return UNIQUE_SERIES_COLORS[seriesIndex % UNIQUE_SERIES_COLORS.length];
  }, [pairDatasetColors, allPairs, allDatasets]);

  const getPairBaseColor = useCallback((pairKey) => {
    if (pairColors[pairKey]) return pairColors[pairKey];
    const firstDataset = allDatasets[0]?.name;
    return firstDataset ? getPairDatasetColor(pairKey, firstDataset) : BASE_COLORS[0];
  }, [pairColors, allDatasets, getPairDatasetColor]);

  const getDatasetColor = useCallback((dataset) => {
    return datasetColors[dataset] || BASE_COLORS[visibleDatasetNames.indexOf(dataset) % BASE_COLORS.length] || BASE_COLORS[0];
  }, [datasetColors, visibleDatasetNames]);

  const getPointColor = useCallback((pairKey, dataset) => {
    // Every pair + dataset series gets its own color.
    // This makes DATE/Data 1, DATE/Data 2, MACHINE SPEED/Data 1, etc.
    // visually independent instead of repeating the same dataset colors.
    return getPairDatasetColor(pairKey, dataset);
  }, [getPairDatasetColor]);

  const getTrendLineColor = useCallback((pairKey, dataset) => {
    // Match each trend line to the exact pair + dataset series.
    return getPairDatasetColor(pairKey, dataset);
  }, [getPairDatasetColor]);

  // Give each pair + dataset series a tiny screen-space offset so series that
  // have identical X/Y coordinates do not paint directly on top of each other.
  // This affects presentation only; axis values, tooltips and analysis still
  // use the original data values.
  const getSeriesVisualOffset = useCallback((pairKey, dataset) => {
    const pairIndex = Math.max(0, allPairs.findIndex((pair) => pair.key === pairKey));
    const datasetIndex = Math.max(0, allDatasets.findIndex((ds) => ds.name === dataset));
    const datasetCount = Math.max(allDatasets.length, 1);
    const seriesIndex = pairIndex * datasetCount + datasetIndex;
    const totalSeries = Math.max(allPairs.length * datasetCount, 1);

    // Golden-angle placement distributes many series without forming obvious rows.
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const angle = seriesIndex * goldenAngle;

    // 0px for a single series; otherwise 4–9px of separation.
    const radius = totalSeries <= 1 ? 0 : 4 + (seriesIndex % 3) * 2.5;

    return {
      dx: Math.cos(angle) * radius,
      dy: Math.sin(angle) * radius,
    };
  }, [allPairs, allDatasets]);

  useEffect(() => {
    setActivePairs(allPairs.map(p => p.key));
  }, [allPairs]);
  
  // Initialize per-pair ranges when pairs change
  useEffect(() => {
    const newPerPairRanges = {};
    allPairs.forEach(pair => {
      if (!perPairRanges[pair.key]) {
        newPerPairRanges[pair.key] = { xRange: { min: "", max: "", auto: true }, yRange: { min: "", max: "", auto: true } };
      } else {
        newPerPairRanges[pair.key] = perPairRanges[pair.key];
      }
    });
    setPerPairRanges(prev => ({ ...prev, ...newPerPairRanges }));
  }, [allPairs]);

  const processData = useCallback((data, pairs, datasetLabel) => {
    const result = [];
    for (const pair of pairs) {
      for (let idx = 0; idx < data.length; idx++) {
        const row = data[idx];
        const xRaw = row[pair.x];
        const yRaw = row[pair.y];
        const xVal = toNumeric(xRaw);
        const yVal = toNumeric(yRaw);
        if (xVal != null && yVal != null && !isNaN(xVal) && !isNaN(yVal)) {
          result.push({
            x: xVal,
            y: yVal,
            xDisplay: xRaw,
            yDisplay: yRaw,
            xLabel: pair.x,
            yLabel: pair.y,
            pairKey: pair.key,
            dataset: datasetLabel,
            id: uuidv4(),
            original: row
          });
        }
      }
    }
    // Sort by x value for line/area rendering
    return result.sort((a, b) => a.x - b.x);
  }, [toNumeric]);

  const datasetPointsByName = useMemo(() => {
    const pointsByName = {};
    allDatasets.forEach((dataset) => {
      pointsByName[dataset.name] = processData(dataset.data || [], allPairs, dataset.name);
    });
    return pointsByName;
  }, [allDatasets, allPairs, processData]);

  const allPoints = useMemo(() => {
    const visiblePoints = [];
    allDatasets.forEach((dataset) => {
      if (!visibleDatasetNames.includes(dataset.name)) return;
      visiblePoints.push(...(datasetPointsByName[dataset.name] || []));
    });
    return visiblePoints.filter((pt) => activePairs.includes(pt.pairKey));
  }, [allDatasets, visibleDatasetNames, datasetPointsByName, activePairs]);

  // Debug: log dataset / selection / parsed counts to help diagnose "No data"
  useEffect(() => {
    try {
      const datasetSummaries = allDatasets.map(ds => ({ name: ds.name, rows: (ds.data || []).length }));
      const pointsCounts = Object.fromEntries(Object.entries(datasetPointsByName || {}).map(([k, pts]) => [k, pts.length]));
      // eslint-disable-next-line no-console
      console.debug('ScatterTab Debug:', {
        datasetSummaries,
        availableColumns: (availableColumns || []).slice(0, 20),
        selectedXVars,
        selectedYVars,
        allPairs,
        pointsCounts,
        allPointsCount: (allPoints || []).length,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('ScatterTab debug logging failed', err);
    }
  }, [allDatasets, availableColumns, selectedXVars, selectedYVars, allPairs, datasetPointsByName, allPoints]);

  // NEW: Get points filtered by current pair (for per-pair mode)
  const currentPairPoints = useMemo(() => {
    if (!currentPairKey || scaleMode !== "perPair") return allPoints;
    return allPoints.filter((pt) => pt.pairKey === currentPairKey);
  }, [allPoints, currentPairKey, scaleMode]);

  const calculateTrendLine = useCallback((points, pairKey) => {
    if (!points || points.length < 2) return null;
    const pairPoints = points.filter(p => p.pairKey === pairKey);
    if (pairPoints.length < 2) return null;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    const n = pairPoints.length;
    pairPoints.forEach(point => {
      sumX += point.x;
      sumY += point.y;
      sumXY += point.x * point.y;
      sumXX += point.x * point.x;
    });
    const denominator = n * sumXX - sumX * sumX;
    if (denominator === 0) return null;
    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;
    if (isNaN(slope) || isNaN(intercept)) return null;
    const minX = Math.min(...pairPoints.map(p => p.x));
    const maxX = Math.max(...pairPoints.map(p => p.x));
    return [
      { x: minX, y: minX * slope + intercept },
      { x: maxX, y: maxX * slope + intercept }
    ];
  }, []);

  const calculateCurveFitTrendLine = useCallback((points) => {
    if (!points || points.length < 3) return null;
    const sorted = [...points].sort((a, b) => a.x - b.x);
    // bigger window = smoother curve, minimum 5 points
    const windowSize = Math.max(5, Math.round(sorted.length * 0.3));
    return sorted.map((pt, idx) => {
        const start = Math.max(0, idx - Math.floor(windowSize / 2));
        const end = Math.min(sorted.length, idx + Math.ceil(windowSize / 2));
        const windowPoints = sorted.slice(start, end);
        const avgY = windowPoints.reduce((sum, p) => sum + p.y, 0) / windowPoints.length;
        return { x: pt.x, y: avgY };
    });
}, []);
  // Dynamic global auto ranges - scales to fit ALL active pairs on the same graph
  const globalAutoRanges = useMemo(() => {
    // Get points only from active pairs
    const activePoints = allPoints.filter(pt => activePairs.includes(pt.pairKey));

    if (activePoints.length === 0) return { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };

    // Calculate extents for all active points
    const allXValues = activePoints.map(d => d.x);
    const allYValues = activePoints.map(d => d.y);

    const xExtent = d3.extent(allXValues);
    const yExtent = d3.extent(allYValues);

    // Calculate dynamic padding based on data range
    const xRange = xExtent[1] - xExtent[0];
    const yRange = yExtent[1] - yExtent[0];

    const xPad = xRange === 0 ? 1 : Math.max(xRange * 0.03, 1);
    const yPad = yRange === 0 ? 1 : Math.max(yRange * 0.03, 1);

    // Create scales and use nice() for better tick intervals
    const xScale = d3.scaleLinear().domain([xExtent[0] - xPad, xExtent[1] + xPad]);
    const yScale = d3.scaleLinear().domain([yExtent[0] - yPad, yExtent[1] + yPad]);

    // Get nice domain bounds
    const niceXDomain = xScale.nice().domain();
    const niceYDomain = yScale.nice().domain();

    return {
      xMin: niceXDomain[0],
      xMax: niceXDomain[1],
      yMin: niceYDomain[0],
      yMax: niceYDomain[1]
    };
  }, [allPoints, activePairs]);

  // NEW: Per-variable auto ranges - each column gets its own scale range
  const perVariableAutoRanges = useMemo(() => {
    const ranges = {};

    // Get all unique variables from selected pairs
    const allVariables = new Set();
    allPairs.forEach(pair => {
      allVariables.add(pair.x);
      allVariables.add(pair.y);
    });

    // Calculate range for each variable
    allVariables.forEach(variable => {
      // Get all points for this variable (both as X and Y)
      const variablePoints = allPoints.filter(p =>
        p.xLabel === variable || p.yLabel === variable
      );

      if (variablePoints.length === 0) {
        ranges[variable] = { min: 0, max: 1 };
      } else {
        // Get values for this variable
        const values = variablePoints.map(p =>
          p.xLabel === variable ? p.x : p.y
        );

        const extent = d3.extent(values);
        const range = extent[1] - extent[0];

        // Calculate dynamic padding
        const pad = range === 0 ? 1 : Math.max(range * 0.05, 1);

        // Create scale and use nice() for better intervals
        const scale = d3.scaleLinear().domain([extent[0] - pad, extent[1] + pad]);
        const niceDomain = scale.nice().domain();

        ranges[variable] = {
          min: niceDomain[0],
          max: niceDomain[1]
        };
      }
    });

    return ranges;
  }, [allPoints, allPairs]);

  // Auto ranges for each pair - truly independent per-pair scaling
  const perPairAutoRanges = useMemo(() => {
    const ranges = {};
    allPairs.forEach(pair => {
      const pairPoints = allPoints.filter(p => p.pairKey === pair.key);
      if (pairPoints.length === 0) {
        ranges[pair.key] = { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };
      } else {
        // Calculate ranges based ONLY on this pair's data
        const xValues = pairPoints.map(p => p.x);
        const yValues = pairPoints.map(p => p.y);

        const xExtent = d3.extent(xValues);
        const yExtent = d3.extent(yValues);

        // Calculate dynamic padding for this pair
        const xRange = xExtent[1] - xExtent[0];
        const yRange = yExtent[1] - yExtent[0];

        const xPad = xRange === 0 ? 1 : Math.max(xRange * 0.05, 1);
        const yPad = yRange === 0 ? 1 : Math.max(yRange * 0.05, 1);

        // Create scales and use nice() for better intervals
        const xScale = d3.scaleLinear().domain([xExtent[0] - xPad, xExtent[1] + xPad]);
        const yScale = d3.scaleLinear().domain([yExtent[0] - yPad, yExtent[1] + yPad]);

        const niceXDomain = xScale.nice().domain();
        const niceYDomain = yScale.nice().domain();

        ranges[pair.key] = {
          xMin: niceXDomain[0],
          xMax: niceXDomain[1],
          yMin: niceYDomain[0],
          yMax: niceYDomain[1]
        };
      }
    });
    return ranges;
  }, [allPoints, allPairs]);

  useEffect(() => {
    if (globalAutoRanges?.xMin != null && globalAutoRanges?.xMax != null) {
      setFixedXRange({ xMin: globalAutoRanges.xMin, xMax: globalAutoRanges.xMax });
      if (customXRange.min === "" && customXRange.max === "") {
        setCustomXRange({ min: "", max: "", auto: true });
      }
      if (customYRange.min === "" && customYRange.max === "") {
        setCustomYRange({ min: "", max: "", auto: true });
      }
    }
  }, [globalAutoRanges, activePairs]);

  // Determine effective ranges based on scale mode and current pair
  const getEffectiveRanges = useCallback(() => {
    if (scaleMode === "perVariable") {
      // For per-variable mode, show all pairs but use variable-based scaling
      // We need to determine which variables are currently being displayed
      const activePairsList = allPairs.filter(p => activePairs.includes(p.key));
      if (activePairsList.length === 0) return { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };

      // Find the union of all X and Y ranges from active pairs
      const xRanges = activePairsList.map(p => perVariableAutoRanges[p.x]).filter(r => r);
      const yRanges = activePairsList.map(p => perVariableAutoRanges[p.y]).filter(r => r);

      if (xRanges.length === 0 || yRanges.length === 0) return { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };

      const xMin = Math.min(...xRanges.map(r => r.min));
      const xMax = Math.max(...xRanges.map(r => r.max));
      const yMin = Math.min(...yRanges.map(r => r.min));
      const yMax = Math.max(...yRanges.map(r => r.max));

      return { xMin, xMax, yMin, yMax };
    } else if (scaleMode === "perPair" && currentPairKey) {
      const autoRanges = perPairAutoRanges[currentPairKey];
      const savedRanges = perPairRanges[currentPairKey];

      let xMin, xMax, yMin, yMax;
      if (savedRanges?.xRange?.auto || !savedRanges?.xRange?.min) xMin = autoRanges.xMin;
      else xMin = Number.parseFloat(savedRanges.xRange.min);
      if (savedRanges?.xRange?.auto || !savedRanges?.xRange?.max) xMax = autoRanges.xMax;
      else xMax = Number.parseFloat(savedRanges.xRange.max);
      if (savedRanges?.yRange?.auto || !savedRanges?.yRange?.min) yMin = autoRanges.yMin;
      else yMin = Number.parseFloat(savedRanges.yRange.min);
      if (savedRanges?.yRange?.auto || !savedRanges?.yRange?.max) yMax = autoRanges.yMax;
      else yMax = Number.parseFloat(savedRanges.yRange.max);

      return { xMin, xMax, yMin, yMax };
    } else {
      let xMin, xMax, yMin, yMax;
      const xAutoRange = globalAutoRanges;
      if (customXRange.auto || customXRange.min === "") xMin = xAutoRange.xMin;
      else xMin = Number.parseFloat(customXRange.min);
      if (customXRange.auto || customXRange.max === "") xMax = xAutoRange.xMax;
      else xMax = Number.parseFloat(customXRange.max);
      if (customYRange.auto || customYRange.min === "") yMin = globalAutoRanges.yMin;
      else yMin = Number.parseFloat(customYRange.min);
      if (customYRange.auto || customYRange.max === "") yMax = globalAutoRanges.yMax;
      else yMax = Number.parseFloat(customYRange.max);

      return { xMin, xMax, yMin, yMax };
    }
  }, [scaleMode, currentPairKey, perVariableAutoRanges, perPairAutoRanges, perPairRanges, globalAutoRanges, fixedXRange, customXRange, customYRange, allPairs, activePairs]);

  const effectiveRanges = useMemo(() => getEffectiveRanges(), [getEffectiveRanges]);

  const visibleAnalysisPoints = useMemo(() => {
    let points = allPoints.filter((pt) => activePairs.includes(pt.pairKey));
    if (scaleMode === "perPair" && currentPairKey) {
      points = points.filter((pt) => pt.pairKey === currentPairKey);
    }
    if (!effectiveRanges) return points;
    const { xMin, xMax, yMin, yMax } = effectiveRanges;
    return points.filter((pt) => {
      const withinX = pt.x >= xMin && pt.x <= xMax;
      const withinY = pt.y >= yMin && pt.y <= yMax;
      return withinX && withinY;
    });
  }, [allPoints, activePairs, scaleMode, currentPairKey, effectiveRanges]);

  const trendLinesData = useMemo(() => {
    const lines = {};
    for (const pair of allPairs) {
      lines[pair.key] = {};
      allDatasets.forEach(ds => {
        if (!visibleDatasetNames.includes(ds.name) || !chartSettings.showTrendLines) {
          lines[pair.key][ds.name] = null;
          return;
        }
        const pts = visibleAnalysisPoints.filter((p) => p.pairKey === pair.key && p.dataset === ds.name);
        //console.log('TREND DEBUG:', pair.key, ds.name, 'points:', pts.length, 'showTrendLines:', chartSettings.showTrendLines);
        lines[pair.key][ds.name] = chartSettings.trendLineMode === 'curve'
          ? calculateCurveFitTrendLine(pts)
          : calculateTrendLine(pts, pair.key);
        //console.log('TREND RESULT:', pair.key, ds.name, lines[pair.key][ds.name]);
      });
    }
    return lines;
}, [allPairs, allDatasets, visibleDatasetNames, visibleAnalysisPoints, calculateTrendLine, calculateCurveFitTrendLine, chartSettings.showTrendLines, chartSettings.trendLineMode]);

  // Handle per-pair range changes
  const handlePerPairRangeChange = useCallback((pairKey, axis, field, value) => {
    setPerPairRanges(prev => ({
      ...prev,
      [pairKey]: {
        ...prev[pairKey],
        [axis]: {
          ...prev[pairKey]?.[axis],
          [field]: value,
          auto: field === "auto" ? value : (prev[pairKey]?.[axis]?.auto || false)
        }
      }
    }));
  }, []);

  const resetZoom = useCallback(() => {
    if (zoomRef.current && zoomRectRef.current) {
      const zoomRect = d3.select(zoomRectRef.current);
      zoomRect.transition().duration(750).call(zoomRef.current.transform, d3.zoomIdentity);
      setCurrentTransform(d3.zoomIdentity);
    }
  }, []);

  const zoomIn = useCallback(() => {
    if (zoomRef.current && zoomRectRef.current) {
      d3.select(zoomRectRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.5);
    }
  }, []);

  const zoomOut = useCallback(() => {
    if (zoomRef.current && zoomRectRef.current) {
      d3.select(zoomRectRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1 / 1.5);
    }
  }, []);

  const resetAxisRanges = useCallback(() => {
    if (scaleMode === "perPair" && currentPairKey) {
      handlePerPairRangeChange(currentPairKey, "xRange", "auto", true);
      handlePerPairRangeChange(currentPairKey, "yRange", "auto", true);
      handlePerPairRangeChange(currentPairKey, "xRange", "min", "");
      handlePerPairRangeChange(currentPairKey, "xRange", "max", "");
      handlePerPairRangeChange(currentPairKey, "yRange", "min", "");
      handlePerPairRangeChange(currentPairKey, "yRange", "max", "");
    } else {
      setCustomXRange({ min: "", max: "", auto: true });
      setCustomYRange({ min: "", max: "", auto: true });
    }
  }, [scaleMode, currentPairKey, handlePerPairRangeChange]);

  const handleXRangeChange = useCallback((field, value) => {
    if (scaleMode === "perPair" && currentPairKey) {
      handlePerPairRangeChange(currentPairKey, "xRange", field, value);
    } else {
      setCustomXRange((prev) => ({ ...prev, [field]: value, auto: false }));
    }
  }, [scaleMode, currentPairKey, handlePerPairRangeChange]);

  const handleYRangeChange = useCallback((field, value) => {
    if (scaleMode === "perPair" && currentPairKey) {
      handlePerPairRangeChange(currentPairKey, "yRange", field, value);
    } else {
      setCustomYRange((prev) => ({ ...prev, [field]: value, auto: false }));
    }
  }, [scaleMode, currentPairKey, handlePerPairRangeChange]);

  const formatAxisValue = useCallback((value) => {
    if (Math.abs(value) > 1e12) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const dateStr = date.toISOString().split("T")[0];
        const timeStr = date.toTimeString().split(" ")[0];
        return timeStr === "00:00:00" ? dateStr : `${dateStr} ${timeStr}`;
      }
    }
    return value.toFixed(2);
  }, []);

  // Check if X or Y axis is date/time based on current pair
  const isXAxisDateTime = useMemo(() => {
    if (scaleMode === "perPair" && currentPairKey) {
      const xCol = currentPairKey.split("__")[0];
      return isDateTimeColumn(withProductData.concat(withoutProductData), xCol);
    }
    return selectedXVars.some(col => isDateTimeColumn(withProductData.concat(withoutProductData), col));
  }, [currentPairKey, scaleMode, selectedXVars, withProductData, withoutProductData, isDateTimeColumn]);

  const isYAxisDateTime = useMemo(() => {
    if (scaleMode === "perPair" && currentPairKey) {
      const yCol = currentPairKey.split("__")[1];
      return isDateTimeColumn(withProductData.concat(withoutProductData), yCol);
    }
    return selectedYVars.some(col => isDateTimeColumn(withProductData.concat(withoutProductData), col));
  }, [currentPairKey, scaleMode, selectedYVars, withProductData, withoutProductData, isDateTimeColumn]);

  // Convert timestamp to datetime-local format for input
  const timestampToDateTimeLocal = (timestamp) => {
    if (timestamp == null || isNaN(timestamp)) return "";
    const date = new Date(timestamp);
    return date.toISOString().slice(0, 16);
  };

  // Convert datetime-local input to timestamp
  const dateTimeLocalToTimestamp = (value) => {
    if (!value) return null;
    const timestamp = new Date(value).getTime();
    return isNaN(timestamp) ? null : timestamp;
  };

  // Draw SVG (axes, grid, trend lines, lines, and areas)
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const width = containerRef.current.offsetWidth || 700;
    const height = 500;
    const baseMargin = { top: 80, right: 60, bottom: 80, left: 80 };
    d3.select(svgRef.current).selectAll("*").remove();
    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);

    const activePairObjects = allPairs.filter(p => activePairs.includes(p.key));
    // Dual Y-axis mode removed — it produced overlapping/misleading area fills and
    // axis-label collisions when two Y variables with unrelated ranges shared one
    // panel. All pairs now render on a single shared Y-axis instead.
    const useDualYAxis = false;
    const useStackedPanels = datasetView === "individual" && activePairObjects.length > 1;
    // Increase left margin slightly when stacked/individual panels are used
    const extraLeft = useStackedPanels ? 40 : 0;
    const margin = { ...baseMargin, left: baseMargin.left + extraLeft };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const { xMin, xMax, yMin, yMax } = getEffectiveRanges();
    const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, plotWidth]);
    const plotGroup = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`).attr("class", "plot-group");

    svg.append("defs").append("clipPath").attr("id", "plot-clip")
      .append("rect").attr("x", 0).attr("y", 0).attr("width", plotWidth).attr("height", plotHeight);

    const gridGroup = plotGroup.append("g").attr("class", "grid-group").attr("clip-path", "url(#plot-clip)");
    const tickCount = 8;
    const PANEL_GAP = 40; // px of breathing room between stacked panels so axis labels don't collide
    const panelCount = useStackedPanels ? activePairObjects.length : 1;
    const panelHeight = useStackedPanels
      ? (plotHeight - PANEL_GAP * (panelCount - 1)) / panelCount
      : plotHeight;
    // One tick roughly every 35–40px of panel height, with sane min/max bounds
    const yTickCount = useStackedPanels
      ? Math.max(2, Math.min(5, Math.floor(panelHeight / 35)))
      : 8;

    const originalXScale = xScale.copy();
    let originalXScalePerPair = {};
    const originalYScales = {};

    // Helper to draw area under a line (uses dataset color for shading)
    const drawAreaUnderLine = (group, points, xSc, ySc, datasetColor, opacity) => {
      if (!points || points.length < 2) return;

      const areaGenerator = d3.area()
        .x(d => xSc(d.x))
        .y0(Math.min(ySc.range()[0], panelHeight))
        .y1(d => Math.max(0, ySc(d.y)))
        .curve(d3.curveMonotoneX);

      group.append("path")
        .datum(points)
        .attr("class", "area-under-line")
        .attr("d", areaGenerator)
        .attr("clip-path", "url(#plot-clip)")
        .style("fill", datasetColor)
        .style("fill-opacity", opacity)
        .style("stroke", "none");
    };

    // Helper to draw connecting line between points (uses pair/pair-color)
    const drawConnectingLine = (group, points, xSc, ySc, pairColor, strokeWidth) => {
      if (!points || points.length < 2) return;

      const lineGenerator = d3.line()
        .x(d => xSc(d.x))
        .y(d => ySc(d.y))
        .curve(d3.curveMonotoneX);

      group.append("path")
        .datum(points)
        .attr("class", "connecting-line")
        .attr("d", lineGenerator)
        .attr("clip-path", "url(#plot-clip)")
        .style("fill", "none")
        .style("stroke", pairColor)
        .style("stroke-width", strokeWidth)
        .style("stroke-opacity", 0.8);
    };

    const drawPairTrendLines = (pair, xSc, ySc, group, clipPathId = "plot-clip") => {
      const pairClass = sanitizeClassName(pair.key);
      allDatasets.forEach((ds) => {
        if (!visibleDatasetNames.includes(ds.name)) return;
        const trend = trendLinesData[pair.key]?.[ds.name];
        if (!trend || trend.length < 2) return;
        const dsClass = sanitizeClassName(ds.name);
        const color = getTrendLineColor(pair.key, ds.name);

        if (chartSettings.trendLineMode === 'curve') {
          const lineGen = d3.line()
            .x(d => xSc(d.x))
            .y(d => ySc(d.y))
            .curve(d3.curveMonotoneX);
          group.append("path")
            .attr("class", `trend-line-${pairClass} trend-line-${dsClass}-${pairClass}`)
            .attr("d", lineGen(trend))
            .attr("clip-path", `url(#${clipPathId})`)
            .style("fill", "none")
            .style("stroke", color)
            .style("stroke-width", 2.5)
            .style("stroke-dasharray", "5,5")
            .style("opacity", 0.9);
        } else {
          group.append("line")
            .attr("class", `trend-line-${pairClass} trend-line-${dsClass}-${pairClass}`)
            .attr("x1", xSc(trend[0].x)).attr("y1", ySc(trend[0].y))
            .attr("x2", xSc(trend[trend.length - 1].x)).attr("y2", ySc(trend[trend.length - 1].y))
            .attr("clip-path", `url(#${clipPathId})`)
            .style("stroke", color)
            .style("stroke-width", 2).style("stroke-dasharray", "5,5").style("opacity", 0.9);
        }
      });
    };

    // Helper to draw lines and areas for a dataset
    const drawScatterPoints = (group, points, xSc, ySc, color, size = 2, opacity = 0.4) => {
      if (!points || points.length === 0) return;
      group.selectAll(null)
        .data(points)
        .enter()
        .append("circle")
        .attr("class", "scatter-point")
        .attr("cx", (d) => {
          const offset = getSeriesVisualOffset(d.pairKey, d.dataset);
          return xSc(d.x) + offset.dx;
        })
        .attr("cy", (d) => {
          const offset = getSeriesVisualOffset(d.pairKey, d.dataset);
          return ySc(d.y) + offset.dy;
        })
        .attr("r", size)
        .style("fill", color)
        .style("fill-opacity", Math.max(0.88, opacity))
        .style("stroke", darkenColor(color, 0.35))
        .style("stroke-width", Math.max(1, size * 0.18));
    };

    // Toggle: use canvas for plotting points to avoid SVG duplicates and improve performance
    const useCanvasForPoints = false; // set false so SVG points are visible

    const drawLinesAndAreas = (group, points, xSc, ySc, datasetColor, pairColor, dataset, pairKey) => {
      if (!points || points.length < 2) return;

      const sortedPoints = [...points].sort((a, b) => a.x - b.x);

      // Draw area under the line (shading) using dataset color so it matches dataset legend
      if (showArea) {
        drawAreaUnderLine(group, sortedPoints, xSc, ySc, datasetColor, areaOpacity);
      }

      // Draw connecting line using pair color (parameter color)
      if (showLines) {
        drawConnectingLine(group, sortedPoints, xSc, ySc, pairColor, lineWidth);
      }
    };

    const drawStackedPanels = () => {
      activePairObjects.forEach((pair, index) => {
        const pairDomain = perPairAutoRanges[pair.key] || { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };
        const xScalePair = d3.scaleLinear().domain([pairDomain.xMin, pairDomain.xMax]).range([0, plotWidth]);
        const yScale = d3.scaleLinear().domain([pairDomain.yMin, pairDomain.yMax]).range([panelHeight, 0]);
        originalYScales[pair.key] = yScale.copy();
        // store original X scale per-pair so zoom/pan transforms can rescale correctly
        originalXScalePerPair[pair.key] = xScalePair.copy();

        const panelClipId = `panel-clip-${index}`;
        svg.select("defs").append("clipPath").attr("id", panelClipId)
          .append("rect").attr("x", 0).attr("y", 0).attr("width", plotWidth).attr("height", panelHeight);
        
        const panelClass = sanitizeClassName(pair.key);
        const panelGroup = plotGroup.append("g")
          .attr("transform", `translate(0,${index * (panelHeight + PANEL_GAP)})`)
          .attr("class", `panel-${panelClass}`);
        const clippedGroup = panelGroup.append("g").attr("clip-path", `url(#${panelClipId})`);

        if (showLines || showArea || datasetView === "individual") {
          allDatasets.forEach((ds) => {
            if (!visibleDatasetNames.includes(ds.name)) return;
            const pts = (datasetPointsByName[ds.name] || []).filter(p => p.pairKey === pair.key).sort((a, b) => a.x - b.x);
            const datasetColorForDraw = getPointColor(pair.key, ds.name);
            drawLinesAndAreas(clippedGroup, pts, xScalePair, yScale, datasetColorForDraw, getPairBaseColor(pair.key), ds.name, pair.key);
            // Points are rendered exclusively by the canvas layer (updateCanvasPoints) to avoid duplicate/desynced dots.
          });
        }

        if (chartSettings.showGrid) {
          panelGroup.append("g").attr("class", `grid-x-${panelClass}`).attr("transform", `translate(0,${panelHeight})`)
            .call(d3.axisBottom(xScalePair).ticks(4).tickSize(-panelHeight).tickFormat(""))
            .selectAll("line").style("stroke-dasharray", "3,3").style("opacity", 0.15);
    
          panelGroup.append("g").attr("class", `grid-y-${panelClass}`)
            .call(d3.axisLeft(yScale).ticks(yTickCount).tickSize(-plotWidth).tickFormat(""))
            .selectAll("line").style("stroke-dasharray", "3,3").style("opacity", 0.15);
        }

        panelGroup.append("g").attr("class", `y-axis y-axis-${panelClass}`)
          .call(d3.axisLeft(yScale).ticks(yTickCount).tickFormat(d => formatAxisValue(d)).tickPadding(6))
          .selectAll("text").style("font-size", "11px");

        panelGroup.append("g").attr("class", `x-axis x-axis-${panelClass}`).attr("transform", `translate(0,${panelHeight})`)
          .call(d3.axisBottom(xScalePair).tickFormat(d => formatAxisValue(d))).selectAll("text").style("font-size", "11px");

        panelGroup.append("text").attr("x", 6).attr("y", 14)
          .style("font-size", "12px").style("font-weight", "600").style("fill", "#333")
          .text(`${pair.x} vs ${pair.y}`);

        if (chartSettings.showTrendLines) {
            // use the panel-specific X scale for trend lines so they align with the panel data
            drawPairTrendLines(pair, xScalePair, yScale, panelGroup, panelClipId);
        }
      });
    };

    const drawSinglePanel = () => {
      // Check if we should use dual Y-axis (one X variable + exactly 2 Y variables)
      const useDualYAxis = false;

      if (useDualYAxis) {
        // Dual Y-axis mode: left for first Y var, right for second Y var
        const yVar1 = selectedYVars[0];
        const yVar2 = selectedYVars[1];

        // Calculate domains for each Y variable
        const pointsForY1 = allPoints.filter(p => p.pairKey.endsWith(`__${yVar1}`));
        const pointsForY2 = allPoints.filter(p => p.pairKey.endsWith(`__${yVar2}`));

        const y1Min = d3.min(pointsForY1, d => d.y) || 0;
        const y1Max = d3.max(pointsForY1, d => d.y) || 1;
        const y2Min = d3.min(pointsForY2, d => d.y) || 0;
        const y2Max = d3.max(pointsForY2, d => d.y) || 1;

        const yScaleLeft = d3.scaleLinear().domain([y1Min, y1Max]).range([plotHeight, 0]);
        const yScaleRight = d3.scaleLinear().domain([y2Min, y2Max]).range([plotHeight, 0]);

        originalYScales.left = yScaleLeft.copy();
        originalYScales.right = yScaleRight.copy();

        // Add lines and areas first (so they are behind points)
        if (showLines || showArea || datasetView === "individual") {
          const pairsToDraw = (scaleMode === "perPair" && currentPairKey) ? allPairs.filter(p => p.key === currentPairKey) : allPairs;
          const activePairsToDraw = pairsToDraw.filter(p => activePairs.includes(p.key));
          // Area fill only makes sense when one pair owns the shared scale — with
          // several pairs combined on one panel, overlapping fills blend into an
          // unreadable blob, so only shade area when exactly one pair is drawn here.
          const showAreaInThisPanel = showArea && activePairsToDraw.length <= 1;

          for (const pair of activePairsToDraw) {
            allDatasets.forEach((ds) => {
              if (!visibleDatasetNames.includes(ds.name)) return;
              const pts = (datasetPointsByName[ds.name] || []).filter(p => p.pairKey === pair.key).sort((a, b) => a.x - b.x);
              const datasetColorForDraw = getPointColor(pair.key, ds.name);
              drawLinesAndAreas(plotGroup, pts, xScale, yScale, datasetColorForDraw, getPairBaseColor(pair.key), ds.name, pair.key, showAreaInThisPanel);
            });
          }
        }

        if (chartSettings.showGrid) {
          gridGroup.append("g").attr("class", "grid-x").attr("transform", `translate(0,${plotHeight})`)
            .call(d3.axisBottom(xScale).ticks(tickCount).tickSize(-plotHeight).tickFormat(""))
            .selectAll("line").style("stroke-dasharray", "3,3").style("opacity", 0.3);
          // Grid for left Y-axis
          gridGroup.append("g").attr("class", "grid-y-left")
            .call(d3.axisLeft(yScaleLeft).ticks(tickCount).tickSize(-plotWidth).tickFormat(""))
            .selectAll("line").style("stroke-dasharray", "3,3").style("opacity", 0.3);
          // Grid for right Y-axis (optional, can be omitted for clarity)
        }

        const drawTrendLinesDual = (xSc, yScLeft, yScRight) => {
            plotGroup.selectAll('[class*="trend-line-"]').remove();
            const pairsToDraw = (scaleMode === "perPair" && currentPairKey) ? allPairs.filter(p => p.key === currentPairKey) : allPairs;
            
            for (const pair of pairsToDraw) {
                const isY1 = pair.y === yVar1;
                const ySc = isY1 ? yScLeft : yScRight;
                drawPairTrendLines(pair, xSc, ySc, plotGroup, "plot-clip");
            }
        };

        const zoom = d3.zoom()
          .scaleExtent([0.5, 50])
          .extent([[0, 0], [plotWidth, plotHeight]])
          .on("zoom", (event) => {
            const { transform } = event;
            setCurrentTransform(transform);
            const newX = transform.rescaleX(originalXScale);
            const newYLeft = transform.rescaleY(originalYScales.left);
            const newYRight = transform.rescaleY(originalYScales.right);
            plotGroup.select(".x-axis").call(d3.axisBottom(newX).tickFormat(d => formatAxisValue(d)));
            plotGroup.select(".y-axis-left").call(d3.axisLeft(newYLeft).tickFormat(d => formatAxisValue(d)));
            plotGroup.select(".y-axis-right").call(d3.axisRight(newYRight).tickFormat(d => formatAxisValue(d)));
            if (chartSettings.showTrendLines) drawTrendLinesDual(newX, newYLeft, newYRight);
            if (chartSettings.showGrid) {
              plotGroup.select(".grid-x").call(d3.axisBottom(newX).ticks(tickCount).tickSize(-plotHeight).tickFormat(""));
              plotGroup.select(".grid-y-left").call(d3.axisLeft(newYLeft).ticks(tickCount).tickSize(-plotWidth).tickFormat(""));
            }
          });

        zoomRef.current = zoom;
        const zoomRect = plotGroup.append("rect")
          .attr("width", plotWidth).attr("height", plotHeight)
          .style("fill", "none").style("pointer-events", "all")
          .call(zoom);
        zoomRectRef.current = zoomRect.node();

        plotGroup.append("g").attr("class", "x-axis").attr("transform", `translate(0,${plotHeight})`).call(d3.axisBottom(xScale).tickFormat(d => formatAxisValue(d)));
        plotGroup.append("g").attr("class", "y-axis-left").call(d3.axisLeft(yScaleLeft).tickFormat(d => formatAxisValue(d)));
        plotGroup.append("g").attr("class", "y-axis-right").attr("transform", `translate(${plotWidth},0)`).call(d3.axisRight(yScaleRight).tickFormat(d => formatAxisValue(d)));

        if (chartSettings.showTrendLines) drawTrendLinesDual(xScale, yScaleLeft, yScaleRight);

      } else {
        // Original single Y-axis logic
        const yScale = d3.scaleLinear().domain([yMin, yMax]).range([plotHeight, 0]);
        originalYScales.single = yScale.copy();

        // Add lines and areas first (so they are behind points)
        if (showLines || showArea || datasetView === "individual") {
          const pairsToDraw = (scaleMode === "perPair" && currentPairKey) ? allPairs.filter(p => p.key === currentPairKey) : allPairs;
          
          for (const pair of pairsToDraw) {
            if (!activePairs.includes(pair.key)) continue;
            // Draw each visible dataset's line/area for this pair
            allDatasets.forEach((ds) => {
              if (!visibleDatasetNames.includes(ds.name)) return;
              const pts = (datasetPointsByName[ds.name] || []).filter(p => p.pairKey === pair.key).sort((a, b) => a.x - b.x);
              const datasetColorForDraw = getPointColor(pair.key, ds.name);
              drawLinesAndAreas(plotGroup, pts, xScale, yScale, datasetColorForDraw, getPairBaseColor(pair.key), ds.name, pair.key);
              if (datasetView === "individual") {
                if (!useCanvasForPoints) drawScatterPoints(plotGroup, pts, xScale, yScale, getPointColor(pair.key, ds.name), chartSettings.pointSize || 3, chartSettings.opacity || 0.85);
              }
            });
          }
        }

        if (chartSettings.showGrid) {
          gridGroup.append("g").attr("class", "grid-x").attr("transform", `translate(0,${plotHeight})`)
            .call(d3.axisBottom(xScale).ticks(tickCount).tickSize(-plotHeight).tickFormat(""))
            .selectAll("line").style("stroke-dasharray", "3,3").style("opacity", 0.3);
          gridGroup.append("g").attr("class", "grid-y")
            .call(d3.axisLeft(yScale).ticks(tickCount).tickSize(-plotWidth).tickFormat(""))
            .selectAll("line").style("stroke-dasharray", "3,3").style("opacity", 0.3);
        }

        const drawTrendLines = (xSc, ySc) => {
            plotGroup.selectAll('[class*="trend-line-"]').remove();
            const pairsToDraw = (scaleMode === "perPair" && currentPairKey) ? allPairs.filter(p => p.key === currentPairKey) : allPairs;
            
            for (const pair of pairsToDraw) {
                drawPairTrendLines(pair, xSc, ySc, plotGroup, "plot-clip");
            }
        };

        const zoom = d3.zoom()
          .scaleExtent([0.5, 50])
          .extent([[0, 0], [plotWidth, plotHeight]])
          .on("zoom", (event) => {
            const { transform } = event;
            setCurrentTransform(transform);
            const newX = transform.rescaleX(originalXScale);
            const newY = transform.rescaleY(originalYScales.single);
            plotGroup.select(".x-axis").call(d3.axisBottom(newX).tickFormat(d => formatAxisValue(d)));
            plotGroup.select(".y-axis").call(d3.axisLeft(newY).tickFormat(d => formatAxisValue(d)));
            if (chartSettings.showTrendLines) drawTrendLines(newX, newY);
            if (chartSettings.showGrid) {
              plotGroup.select(".grid-x").call(d3.axisBottom(newX).ticks(tickCount).tickSize(-plotHeight).tickFormat(""));
              plotGroup.select(".grid-y").call(d3.axisLeft(newY).ticks(tickCount).tickSize(-plotWidth).tickFormat(""));
            }
          });

        zoomRef.current = zoom;
        const zoomRect = plotGroup.append("rect")
          .attr("width", plotWidth).attr("height", plotHeight)
          .style("fill", "none").style("pointer-events", "all")
          .call(zoom);
        zoomRectRef.current = zoomRect.node();

        plotGroup.append("g").attr("class", "x-axis").attr("transform", `translate(0,${plotHeight})`).call(d3.axisBottom(xScale).tickFormat(d => formatAxisValue(d)));
        plotGroup.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale).tickFormat(d => formatAxisValue(d)));

        if (chartSettings.showTrendLines) drawTrendLines(xScale, yScale);
      }
    };

    if (useStackedPanels) {
      drawStackedPanels();

      const zoom = d3.zoom()
        .scaleExtent([0.5, 50])
        .extent([[0, 0], [plotWidth, plotHeight]])
        .on("zoom", (event) => {
          const { transform } = event;
          setCurrentTransform(transform);
          const newX = transform.rescaleX(originalXScale);
  
          activePairObjects.forEach((pair) => {
            const sanitized = sanitizeClassName(pair.key);
            const yScale = originalYScales[pair.key];
            const newY = transform.rescaleY(yScale);
            const origX = (originalXScalePerPair && originalXScalePerPair[pair.key]) ? originalXScalePerPair[pair.key] : originalXScale;
            const newXForPair = transform.rescaleX(origX);
            const panelGroup = plotGroup.selectAll('g').filter(function() {
              return this.classList && this.classList.contains(`panel-${sanitized}`);
            });
            const panelClipId = `panel-clip-${activePairObjects.findIndex(p => p.key === pair.key)}`;

            plotGroup.selectAll('g').filter(function() {
              return this.classList && this.classList.contains(`y-axis-${sanitized}`);
            }).call(d3.axisLeft(newY).ticks(yTickCount).tickFormat(d => formatAxisValue(d)));

            // Redraw lines and areas with the transformed scale — previously these were
            // only ever drawn once at mount and never updated on zoom/pan, so they
            // stayed frozen while canvas-rendered points (which do use currentTransform)
            // moved independently, causing them to visually separate after any zoom.
            panelGroup.selectAll(".connecting-line, .area-under-line").remove();
            if (showLines || showArea) {
              allDatasets.forEach((ds) => {
                if (!visibleDatasetNames.includes(ds.name)) return;
                const pts = (datasetPointsByName[ds.name] || []).filter(p => p.pairKey === pair.key).sort((a, b) => a.x - b.x);
                const datasetColorForDraw = getPointColor(pair.key, ds.name);
                const clippedGroup = panelGroup.select(`g[clip-path="url(#${panelClipId})"]`);
                drawLinesAndAreas(clippedGroup, pts, newXForPair, newY, datasetColorForDraw, getPairBaseColor(pair.key), ds.name, pair.key);
              });
            }

            plotGroup.selectAll(`.trend-line-${sanitized}`).remove();
            if (chartSettings.showTrendLines) {
              drawPairTrendLines(pair, newXForPair, newY, panelGroup, panelClipId);
            }
          });
          if (chartSettings.showGrid) {
            activePairObjects.forEach((pair) => {
              const sanitized = sanitizeClassName(pair.key);
              const panelGroup = plotGroup.selectAll('g').filter(function() {
                return this.classList && this.classList.contains(`panel-${sanitized}`);
              });
              const yScale = originalYScales[pair.key];
              const newY = transform.rescaleY(yScale);
              panelGroup.selectAll('g').filter(function() {
                return this.classList && this.classList.contains(`grid-x-${sanitized}`);
              }).call(d3.axisBottom(newX).ticks(4).tickSize(-panelHeight).tickFormat(""));
              panelGroup.selectAll('g').filter(function() {
                return this.classList && this.classList.contains(`grid-y-${sanitized}`);
              }).call(d3.axisLeft(newY).ticks(yTickCount).tickSize(-plotWidth).tickFormat(""));
            });
          }
        });

      zoomRef.current = zoom;
      const zoomRect = plotGroup.append("rect")
        .attr("width", plotWidth).attr("height", plotHeight)
        .style("fill", "none").style("pointer-events", "all")
        .call(zoom);
      zoomRectRef.current = zoomRect.node();
    } else {
      drawSinglePanel();
    }

    plotGroup.append("text").attr("x", plotWidth / 2).attr("y", plotHeight + 40)
      .style("text-anchor", "middle").style("font-size", "14px").style("font-weight", "500").style("fill", "#666")
      .text(() => {
        if (scaleMode === "perPair" && currentPairKey) {
          return `X: ${currentPairKey.split("__")[0]}`;
        } else if (selectedXVars.length > 0) {
          return `X: ${selectedXVars.join(", ")}`;
        } else {
          return "X Variables";
        }
      });
    // Y-axis label: move outward and reduce font size to avoid overlapping ticks/labels
    plotGroup.append("text").attr("transform", "rotate(-90)").attr("x", -plotHeight / 2).attr("y", -60)
      .style("text-anchor", "middle").style("font-size", "13px").style("font-weight", "500").style("fill", "#666")
    .text(() => {
      if (datasetView === 'individual' && useStackedPanels) {
        return selectedYVars.length > 0 
            ? `Y: ${selectedYVars.join(" / ")}` 
            : "Y Variables (Individual Panels)";
      } else if (scaleMode === "perPair" && currentPairKey) {
        return `Y: ${currentPairKey.split("__")[1]}`;
      } else if (selectedYVars.length > 0) {
        return `Y: ${selectedYVars.join(", ")}`;
      } else {
        return "Y Variables";
      }
    });

    svg.append("text").attr("x", width / 2).attr("y", 25).attr("text-anchor", "middle")
      .style("font-size", "18px").style("font-weight", "bold").style("fill", "#333")
      .text(() => {
        let title = "Multi-Variate Scatter Plot";
        if (datasetView === 'individual' && useStackedPanels) {
          title += " — Individual Panels";
        } else if (scaleMode === "perPair" && currentPairKey) {
          title += ` - ${currentPairKey.replace("__", " vs ")}`;
        } 
        else if (scaleMode === "global") {
          title += " (All Selected Pairs - Dynamic Scaling)";
        } else if (scaleMode === "perVariable") {
          title += " (Per-Variable Scaling)";
        }
        return title;
      });

    // Legend
    // const legend = svg.append("g").attr("class", "legend").attr("transform", `translate(${margin.left}, ${margin.top - 55})`);
    // let legendX = 0;
    // const pairsToShow = scaleMode === "perPair" && currentPairKey ? allPairs.filter(p => p.key === currentPairKey) : allPairs;

    // pairsToShow.forEach((pair) => {
    //   const colors = pairColorMap[pair.key];
    //   if (!colors) return;
    //   const grp = legend.append("g").attr("transform", `translate(${legendX}, 0)`);
    //   const label = `${pair.x} vs ${pair.y}`;
    //   const shortLabel = label.length > 20 ? label.slice(0, 18) + "…" : label;

    //   if (datasetView === "both" || datasetView === "withoutProduct") {
    //     grp.append("circle").attr("cx", 6).attr("cy", 6).attr("r", 6)
    //       .style("fill", colors.pre).style("stroke", colors.base).style("stroke-width", 1);
    //     grp.append("text").attr("x", 16).attr("y", 6).attr("dy", "0.35em")
    //       .style("font-size", "10px").style("fill", "#555").text("Pre");
    //   }

    //   if (datasetView === "both" || datasetView === "withProduct") {
    //     const preOffset = (datasetView === "both" || datasetView === "withoutProduct") ? 36 : 0;
    //     grp.append("circle").attr("cx", preOffset + 6).attr("cy", 6).attr("r", 6)
    //       .style("fill", colors.post).style("stroke", colors.base).style("stroke-width", 1);
    //     grp.append("text").attr("x", preOffset + 16).attr("y", 6).attr("dy", "0.35em")
    //       .style("font-size", "10px").style("fill", "#555").text("Post");
    //   }

    //   const labelOffset = datasetView === "both" ? 72 : 36;
    //   grp.append("text").attr("x", labelOffset).attr("y", 6).attr("dy", "0.35em")
    //     .style("font-size", "10px").style("font-weight", "600").style("fill", colors.base)
    //     .text(`(${shortLabel})`);

    //   legendX += Math.max(180, shortLabel.length * 7 + labelOffset + 10);
    // });

  }, [getEffectiveRanges, formatAxisValue, chartSettings.showGrid, datasetView,
    chartSettings.showTrendLines, chartSettings.trendLineMode, trendLinesData, allPairs, getTrendLineColor, getPointColor, getSeriesVisualOffset, pairColorMap, perPairAutoRanges, activePairs, scaleMode, currentPairKey, showLines, showArea, areaOpacity, lineWidth, datasetPointsByName, datasetColors, allDatasets, visibleDatasetNames, selectedYVars]);

  // Update canvas points
  const updateCanvasPoints = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const width = containerRef.current.offsetWidth || 700;
    const height = 500;
    const margin = { top: 80, right: 60, bottom: 80, left: 80 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const activePairObjects = allPairs.filter(p => activePairs.includes(p.key));
    const useDualYAxis = false;
    const useStackedPanels = datasetView === "individual" && activePairObjects.length > 1;
    const { xMin, xMax, yMin, yMax } = getEffectiveRanges();
    const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, plotWidth]);
    const transformedXScale = currentTransform.rescaleX(xScale);

    let transformedYScales = {};
    let transformedXScalesPerPair = {};
    let panelHeight = plotHeight;
    let pairIndexMap = {};

    const PANEL_GAP = 40;
    if (useStackedPanels) {
      panelHeight = (plotHeight - PANEL_GAP * (activePairObjects.length - 1)) / activePairObjects.length;
      activePairObjects.forEach((pair, index) => {
        const yDomain = perPairAutoRanges[pair.key] || { yMin: 0, yMax: 1 };
        const yScale = d3.scaleLinear().domain([yDomain.yMin, yDomain.yMax]).range([panelHeight, 0]);
        transformedYScales[pair.key] = currentTransform.rescaleY(yScale);
        pairIndexMap[pair.key] = index;
        // compute per-pair X scale and transformed X for canvas drawing
        const xDomain = perPairAutoRanges[pair.key] || { xMin: 0, xMax: 1 };
        const xScalePair = d3.scaleLinear().domain([xDomain.xMin, xDomain.xMax]).range([0, plotWidth]);
        transformedXScalesPerPair[pair.key] = currentTransform.rescaleX(xScalePair);
      });
    } else if (useDualYAxis) {
      // Dual Y-axis: calculate scales for each Y variable
      const yVar1 = selectedYVars[0];
      const yVar2 = selectedYVars[1];
      const pointsForY1 = allPoints.filter(p => p.pairKey.endsWith(`__${yVar1}`));
      const pointsForY2 = allPoints.filter(p => p.pairKey.endsWith(`__${yVar2}`));
      const y1Min = d3.min(pointsForY1, d => d.y) || 0;
      const y1Max = d3.max(pointsForY1, d => d.y) || 1;
      const y2Min = d3.min(pointsForY2, d => d.y) || 0;
      const y2Max = d3.max(pointsForY2, d => d.y) || 1;
      const yScaleLeft = d3.scaleLinear().domain([y1Min, y1Max]).range([plotHeight, 0]);
      const yScaleRight = d3.scaleLinear().domain([y2Min, y2Max]).range([plotHeight, 0]);
      transformedYScales.left = currentTransform.rescaleY(yScaleLeft);
      transformedYScales.right = currentTransform.rescaleY(yScaleRight);
    } else {
      const yScale = d3.scaleLinear().domain([yMin, yMax]).range([plotHeight, 0]);
      transformedYScales.single = currentTransform.rescaleY(yScale);
    }

    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(margin.left, margin.top);
    ctx.beginPath();
    ctx.rect(0, 0, plotWidth, plotHeight);
    ctx.clip();

    const drawCanvasPoint = (x, y, color, size, opacity) => {
      const strokeColor = darkenColor(color, 0.35);
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = Math.max(1, size * 0.18);
      ctx.strokeStyle = strokeColor;
      ctx.stroke();
      ctx.restore();
    };

    const pointsToDraw = scaleMode === "perPair" && currentPairKey
      ? currentPairPoints.filter(pt => visibleDatasetNames.includes(pt.dataset))
      : allPoints.filter(pt => activePairs.includes(pt.pairKey) && visibleDatasetNames.includes(pt.dataset));
    const nPoints = pointsToDraw.length;
    const perfPointSize = nPoints > 1200 ? Math.max(2, Math.min(chartSettings.pointSize, 6)) : chartSettings.pointSize;
    const perfOpacity = nPoints > 1200 ? Math.min(0.45, chartSettings.opacity) : Math.max(0.75, chartSettings.opacity);

      for (let i = 0; i < pointsToDraw.length; i++) {
      const d = pointsToDraw[i];
      let xPos;
      if (useStackedPanels) {
        const tx = transformedXScalesPerPair[d.pairKey];
        if (!tx) continue;
        xPos = tx(d.x);
      } else {
        xPos = transformedXScale(d.x);
      }
      let yPos;
      if (useDualYAxis) {
        // Determine which Y scale to use based on the Y variable in pairKey
        const yVar = d.pairKey.split('__')[1];
        const isY1 = yVar === selectedYVars[0];
        let yScale = isY1 ? transformedYScales.left : transformedYScales.right;
        if (!yScale) {
          yScale = transformedYScales.single;
        }
        if (!yScale) continue;
        yPos = yScale(d.y);
      } else if (useStackedPanels) {
        const pairIndex = pairIndexMap[d.pairKey];
        const yScale = transformedYScales[d.pairKey];
        if (pairIndex == null || !yScale) continue;
        yPos = yScale(d.y) + pairIndex * (panelHeight + PANEL_GAP);
      } else {
        const yScale = transformedYScales.single;
        if (!yScale) continue;
        yPos = yScale(d.y);
      }
      if (xPos >= -50 && xPos <= plotWidth + 50 && yPos >= -50 && yPos <= plotHeight + 50) {
        const fillColor = getPointColor(d.pairKey, d.dataset);
        const offset = getSeriesVisualOffset(d.pairKey, d.dataset);

        // The tiny offset prevents coincident series from hiding one another.
        // Keep points highly opaque so every legend color is actually visible.
        drawCanvasPoint(
          xPos + offset.dx,
          yPos + offset.dy,
          fillColor,
          perfPointSize,
          Math.max(0.9, perfOpacity)
        );
      }
    }
    ctx.restore();
  }, [allPoints, activePairs, allPairs, currentPairPoints, chartSettings.pointSize, chartSettings.opacity, datasetView, getEffectiveRanges, getPointColor, getSeriesVisualOffset, currentTransform, pairColorMap, perPairAutoRanges, scaleMode, currentPairKey, selectedYVars]);

  useEffect(() => {
    updateCanvasPoints();
  }, [updateCanvasPoints]);

  const gridIndexRef = useRef(null);
  const gridCellSize = 24;

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.offsetWidth || 700;
    const height = 500;
    const margin = { top: 80, right: 60, bottom: 80, left: 80 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const { xMin, xMax, yMin, yMax } = getEffectiveRanges();
    const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, plotWidth]);
    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([plotHeight, 0]);
    const transformedXScale = currentTransform.rescaleX(xScale);
    const transformedYScale = currentTransform.rescaleY(yScale);
    const nCols = Math.ceil(plotWidth / gridCellSize);
    const nRows = Math.ceil(plotHeight / gridCellSize);
    const grid = Array.from({ length: nCols * nRows }, () => []);
    const pointsToIndex = scaleMode === "perPair" && currentPairKey ? currentPairPoints.filter(pt => visibleDatasetNames.includes(pt.dataset)) : allPoints.filter(pt => visibleDatasetNames.includes(pt.dataset));
    for (let i = 0; i < pointsToIndex.length; i++) {
      const d = pointsToIndex[i];
      const px = transformedXScale(d.x);
      const py = transformedYScale(d.y);
      const col = Math.floor(px / gridCellSize);
      const row = Math.floor(py / gridCellSize);
      if (col >= 0 && col < nCols && row >= 0 && row < nRows) {
        grid[row * nCols + col].push({ ...d, px, py });
      }
    }
    gridIndexRef.current = { grid, nCols, nRows, cellSize: gridCellSize };
  }, [allPoints, currentPairPoints, getEffectiveRanges, currentTransform, scaleMode, currentPairKey]);

  const handleCanvasMouseMove = useCallback((e) => {
    if (!canvasRef.current || !containerRef.current || !gridIndexRef.current) return;
    const margin = { top: 80, right: 60, bottom: 80, left: 80 };
    const mouseX = e.nativeEvent.offsetX - margin.left;
    const mouseY = e.nativeEvent.offsetY - margin.top;
    const { grid, nCols, nRows, cellSize } = gridIndexRef.current;
    const col = Math.floor(mouseX / cellSize);
    const row = Math.floor(mouseY / cellSize);
    let candidates = [];
    for (let dRow = -1; dRow <= 1; dRow++) {
      for (let dCol = -1; dCol <= 1; dCol++) {
        const nCol = col + dCol;
        const nRow = row + dRow;
        if (nCol >= 0 && nCol < nCols && nRow >= 0 && nRow < nRows) {
          candidates = candidates.concat(grid[nRow * nCols + nCol]);
        }
      }
    }
    const pointsToDraw = scaleMode === "perPair" && currentPairKey ? currentPairPoints.filter(pt => visibleDatasetNames.includes(pt.dataset)) : allPoints.filter(pt => visibleDatasetNames.includes(pt.dataset));
    const perfPointSize = pointsToDraw.length > 2000 ? Math.max(2, chartSettings.pointSize * 0.6) : chartSettings.pointSize;
    let minDist = Infinity, closest = null;
    for (let i = 0; i < candidates.length; i++) {
      const d = candidates[i];
      const dist = Math.hypot(d.px - mouseX, d.py - mouseY);
      if (dist < perfPointSize + 3 && dist < minDist) { minDist = dist; closest = d; }
    }
    if (closest) {
      setTooltip({ visible: true, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, data: closest });
    } else {
      setTooltip({ visible: false, x: 0, y: 0, data: null });
    }
  }, [allPoints, currentPairPoints, chartSettings.pointSize, scaleMode, currentPairKey]);

  const handleCanvasMouseOut = useCallback(() => {
    setTooltip({ visible: false, x: 0, y: 0, data: null });
  }, []);

  // Downloads
  const downloadChartAsPNG = () => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current;
    const svgRect = svgElement.getBoundingClientRect();
    const scaleFactor = 2;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = svgRect.width * scaleFactor;
    canvas.height = (svgRect.height + 50) * scaleFactor;

    const convertImageToDataURL = (imgSrc) => new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const c = document.createElement('canvas');
        const cx = c.getContext('2d');
        c.width = img.width; c.height = img.height;
        cx.drawImage(img, 0, 0);
        resolve(c.toDataURL('image/png'));
      };
      img.onerror = () => resolve(null);
      img.src = imgSrc;
    });

    convertImageToDataURL(logo).then((logoDataURL) => {
      const svgClone = svgElement.cloneNode(true);
      if (logoDataURL) {
        const wg = document.createElementNS("http://www.w3.org/2000/svg", "g");
        wg.setAttribute("transform", `translate(${svgRect.width - 170}, 10)`);
        const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        bgRect.setAttribute("x", "0"); bgRect.setAttribute("y", "0");
        bgRect.setAttribute("width", "160"); bgRect.setAttribute("height", "36");
        bgRect.setAttribute("fill", "rgba(255,255,255,0.95)");
        bgRect.setAttribute("stroke", "rgba(0,0,0,0.1)"); bgRect.setAttribute("stroke-width", "1"); bgRect.setAttribute("rx", "4");
        const logoImg = document.createElementNS("http://www.w3.org/2000/svg", "image");
        logoImg.setAttributeNS('http://www.w3.org/1999/xlink', 'href', logoDataURL);
        logoImg.setAttribute("x", "8"); logoImg.setAttribute("y", "6");
        logoImg.setAttribute("width", "24"); logoImg.setAttribute("height", "24");
        logoImg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        const pt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        pt.setAttribute("x", "40"); pt.setAttribute("y", "18");
        pt.setAttribute("fill", "#666"); pt.setAttribute("font-size", "10"); pt.setAttribute("font-family", "Arial, sans-serif");
        pt.textContent = "Powered by";
        const bt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        bt.setAttribute("x", "40"); bt.setAttribute("y", "30");
        bt.setAttribute("fill", "#1976d2"); bt.setAttribute("font-size", "11");
        bt.setAttribute("font-weight", "bold"); bt.setAttribute("font-family", "Arial, sans-serif");
        bt.textContent = "Abhitech's AbhiStat";
        wg.appendChild(bgRect); wg.appendChild(logoImg); wg.appendChild(pt); wg.appendChild(bt);
        svgClone.appendChild(wg);
      }
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = `${16 * scaleFactor}px Arial`;
        ctx.textAlign = 'center';
        // Build the export title matching the SVG title logic
        let exportTitle = 'Multi-Variate Scatter Plot';
        if (datasetView === 'individual' && activePairObjects && activePairObjects.length > 1) {
          exportTitle += ' — Individual Panels';
        } else if (scaleMode === "perPair" && currentPairKey) {
          exportTitle += ` - ${currentPairKey.replace("__", " vs ")}`;
        } else if (scaleMode === "global") {
          exportTitle += ` (All Selected Pairs - Dynamic Scaling)`;
        } else if (scaleMode === "perVariable") {
          exportTitle += ` (Per-Variable Scaling)`;
        } else {
          exportTitle += ` (${activePairs.length} pairs)`;
        }
        ctx.fillText(exportTitle, canvas.width / 2, 30 * scaleFactor);
        ctx.drawImage(img, 0, 50 * scaleFactor, svgRect.width * scaleFactor, svgRect.height * scaleFactor);
        // Draw canvas points on top of SVG
        if (canvasRef.current) {
          ctx.drawImage(canvasRef.current, 0, 50 * scaleFactor, svgRect.width * scaleFactor, svgRect.height * scaleFactor);
        }
        const link = document.createElement("a");
        link.download = `${generateFileName("MultiVariateScatterPlot")}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    });
  };

  const downloadPageAsPNG = async () => {
    if (!pageRef.current) return;
    const origSummary = showSummaryCards;
    const origInsights = showInsights;
    setShowSummaryCards(true);
    setShowInsights(true);
    await new Promise(resolve => setTimeout(resolve, 400));
    const element = pageRef.current;
    const canvas = await html2canvas(element, { useCORS: true, backgroundColor: '#fff', scale: 2, logging: false, windowWidth: element.scrollWidth, windowHeight: element.scrollHeight });
    setShowSummaryCards(origSummary);
    setShowInsights(origInsights);
    const link = document.createElement('a');
    link.download = `${generateFileName("MultiVariateScatterPlot_Page")}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Settings Modal
  const getDefaultDatasetColors = useCallback(() => {
    const next = {};
    allDatasets.forEach((dataset, index) => {
      next[dataset.name] = datasetColors[dataset.name] || BASE_COLORS[(index + 6) % BASE_COLORS.length] || BASE_COLORS[index % BASE_COLORS.length];
    });
    return next;
  }, [allDatasets, datasetColors]);

  const openSettingsModal = () => {
    setDraftSettings({
      ...chartSettings,
      datasetColors: getDefaultDatasetColors(),
      pairColors: { ...pairColors },
      pairDatasetColors: { ...pairDatasetColors },
    });
    setSettingsModalOpen(true);
  };
  const handleSettingsModalClose = () => { setSettingsModalOpen(false); setDraftSettings(null); };
  const handleSettingsSave = () => {
    if (!draftSettings) return;
    const {
      datasetColors: nextDatasetColors,
      pairColors: nextPairColors,
      pairDatasetColors: nextPairDatasetColors,
      ...nextChartSettings
    } = draftSettings;
    setChartSettings(nextChartSettings);
    if (nextDatasetColors) setDatasetColors({ ...nextDatasetColors });
    if (nextPairColors) setPairColors({ ...nextPairColors });
    if (nextPairDatasetColors) setPairDatasetColors({ ...nextPairDatasetColors });
    setSettingsModalOpen(false);
    setDraftSettings(null);
  };
  const resetSettings = () => {
    const nextColors = {};
    allDatasets.forEach((dataset, index) => {
      nextColors[dataset.name] = BASE_COLORS[(index + 6) % BASE_COLORS.length] || BASE_COLORS[index % BASE_COLORS.length];
    });
    // Clearing pairColors restores the normal dataset-level colors for points/areas
    // and the generated palette for pair-specific trend/connecting lines.
    setDraftSettings({ pointSize: 8, opacity: 0.7, showGrid: true, showTrendLines: true, trendLineMode: 'average', showOutliers: false, showCorrelation: false, withProductColorOverride: {}, withoutProductColorOverride: {}, datasetColors: nextColors, pairColors: {}, pairDatasetColors: {} });
};

  const SummaryCards = () => (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
      <Box sx={{ p: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: showSummaryCards ? '1px solid' : 'none', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => setShowSummaryCards(!showSummaryCards)}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AnalyticsIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 500, color: 'primary.main' }}>Data Summary</Typography>
        </Box>
        <IconButton size="small" sx={{ transform: showSummaryCards ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}><ExpandMoreIcon /></IconButton>
      </Box>
      <Collapse in={showSummaryCards} timeout={300} easing="ease-in-out">
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {(() => {
              const datasetCountsSummary = Object.entries(visibleAnalysisPoints.reduce((acc, pt) => {
                acc[pt.dataset] = (acc[pt.dataset] || 0) + 1;
                return acc;
              }, {})).map(([name, count]) => `${datasetLabels[name] || name}: ${count}`).join(' | ');
              return [
                { label: "Total Points", value: visibleAnalysisPoints.length, sub: datasetCountsSummary || 'No data', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: <AnalyticsIcon sx={{ mr: 1, fontSize: 20 }} /> },
                { label: "Active Pairs", value: activePairs.length, sub: `out of ${allPairs.length} total pairs`, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', icon: <TrendingUpIcon sx={{ mr: 1, fontSize: 20 }} /> },
                { label: "X Variables", value: selectedXVars.length, sub: "selected for analysis", gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', icon: <BarChartIcon sx={{ mr: 1, fontSize: 20 }} /> },
                { label: "Y Variables", value: selectedYVars.length, sub: "selected for analysis", gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', icon: <InfoIcon sx={{ mr: 1, fontSize: 20 }} /> },
              ];
            })().map(({ label, value, sub, gradient, icon }) => (
              <Grid item xs={12} sm={6} md={3} key={label}>
                <Card sx={{ height: '100%', background: gradient, color: 'white' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>{icon}<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{label}</Typography></Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>{value}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>{sub}</Typography>
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
    const insightsData = scaleMode === "perPair" && currentPairKey ? 
      (combinedInsights && {
        correlations: { [currentPairKey]: combinedInsights.correlations?.[currentPairKey] },
        regressions: { [currentPairKey]: combinedInsights.regressions?.[currentPairKey] },
        outliers: { [currentPairKey]: combinedInsights.outliers?.[currentPairKey] || [] }
      }) : combinedInsights;
    
    const pairsToShow = scaleMode === "perPair" && currentPairKey ? allPairs.filter(p => p.key === currentPairKey) : allPairs;

    return (
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2, border: '1px solid', borderColor: 'primary.light' }}>
        <Box sx={{ p: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: showInsights ? '1px solid' : 'none', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => setShowInsights(!showInsights)}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AnalyticsIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 500, color: 'primary.main' }}>Analysis Insights</Typography>
          </Box>
          <IconButton size="small" sx={{ transform: showInsights ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}><ExpandMoreIcon /></IconButton>
        </Box>
        <Collapse in={showInsights} timeout={300} easing="ease-in-out">
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {pairsToShow.map((pair) => {
                const correlation = insightsData?.correlations?.[pair.key];
                const regression = insightsData?.regressions?.[pair.key];
                const outlierList = insightsData?.outliers?.[pair.key] || [];
                const colors = pairColorMap[pair.key];
                return (
                  <Grid item xs={12} md={scaleMode === "perPair" ? 12 : 6} key={pair.key}>
                    <Card sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, borderLeft: `4px solid ${colors?.base || '#ccc'}` }}>
                              <Box sx={{ display: 'flex', gap: 0.5, mb: 1, alignItems: 'center' }}>
                              {allDatasets.filter(ds => visibleDatasetNames.includes(ds.name)).map((ds, idx) => (
                                <Box key={ds.name} sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: datasetColors[ds.name] || BASE_COLORS[idx % BASE_COLORS.length], border: `2px solid ${darkenColor(datasetColors[ds.name] || BASE_COLORS[idx % BASE_COLORS.length], 0.25)}` }} />
                              ))}
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', ml: 1 }}>{pair.x} vs {pair.y}</Typography>
                            </Box>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><TrendingUpIcon sx={{ color: colors?.base }} /></ListItemIcon>
                          <ListItemText primary="Correlation" secondary={correlation != null ? correlation.toFixed(4) : 'N/A'} />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><BarChartIcon sx={{ color: colors?.base }} /></ListItemIcon>
                          <ListItemText primary="Regression" secondary={regression ? regression.equation : 'N/A'} />
                        </ListItem>
                        {outlierList.length > 0 && (
                          <ListItem>
                            <ListItemIcon><InfoIcon color="warning" /></ListItemIcon>
                            <ListItemText primary="Outliers" secondary={`${outlierList.length} outliers detected`} />
                          </ListItem>
                        )}
                      </List>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Collapse>
      </Card>
    );
  };

  const combinedInsights = useMemo(() => {
    const allData = visibleAnalysisPoints;
    if (allData.length === 0) return null;
    const correlations = {};
    const regressions = {};
    const outliers = {};
    for (const pair of allPairs) {
      const pairPoints = allData.filter(p => p.pairKey === pair.key);
      if (pairPoints.length >= 2) {
        const n = pairPoints.length;
        const sumX = pairPoints.reduce((s, p) => s + p.x, 0);
        const sumY = pairPoints.reduce((s, p) => s + p.y, 0);
        const sumXY = pairPoints.reduce((s, p) => s + p.x * p.y, 0);
        const sumX2 = pairPoints.reduce((s, p) => s + p.x * p.x, 0);
        const sumY2 = pairPoints.reduce((s, p) => s + p.y * p.y, 0);
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        correlations[pair.key] = denominator === 0 ? 0 : numerator / denominator;
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        regressions[pair.key] = { slope, intercept, rSquared: Math.pow(correlations[pair.key], 2), equation: `y = ${slope.toFixed(3)}x + ${intercept.toFixed(3)}` };
        const xValues = pairPoints.map(p => p.x);
        const yValues = pairPoints.map(p => p.y);
        const xQ1 = d3.quantile(xValues, 0.25);
        const xQ3 = d3.quantile(xValues, 0.75);
        const xIQR = xQ3 - xQ1;
        const yQ1 = d3.quantile(yValues, 0.25);
        const yQ3 = d3.quantile(yValues, 0.75);
        const yIQR = yQ3 - yQ1;
        outliers[pair.key] = pairPoints.filter(p =>
          p.x < xQ1 - 1.5 * xIQR || p.x > xQ3 + 1.5 * xIQR ||
          p.y < yQ1 - 1.5 * yIQR || p.y > yQ3 + 1.5 * yIQR
        );
      }
    }
    return { correlations, regressions, outliers };
  }, [visibleAnalysisPoints, allPairs]);

  const SettingsModal = () => {
    const featureSections = [
      <Box key="chart-features">
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>Chart Features</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={!!draftSettings?.showGrid} onChange={e => setDraftSettings(ds => ({ ...ds, showGrid: e.target.checked }))} />} label="Show Grid" /></Grid>
          <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={!!draftSettings?.showTrendLines} onChange={e => setDraftSettings(ds => ({ ...ds, showTrendLines: e.target.checked }))} />} label="Show Trend Lines" /></Grid>
          <Grid item xs={12} sm={6}><CustomSlider value={draftSettings?.pointSize ?? 8} onChange={(value) => setDraftSettings(ds => ({ ...ds, pointSize: value }))} min={4} max={16} step={1} label="Point Size" formatValue={(val) => `${val}px`} /></Grid>
          <Grid item xs={12} sm={6}><CustomSlider value={draftSettings?.opacity ?? 0.7} onChange={(value) => setDraftSettings(ds => ({ ...ds, opacity: value }))} min={0.3} max={1} step={0.1} label="Opacity" formatValue={(val) => `${Math.round(val * 100)}%`} /></Grid>
        </Grid>
      </Box>,
      <Box key="line-area-features" sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>Line & Area Settings</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControlLabel control={<Switch checked={showLines} onChange={e => setShowLines(e.target.checked)} />} label="Show Connecting Lines" />
            <FormControlLabel control={<Switch checked={showArea} onChange={e => setShowArea(e.target.checked)} />} label="Show Area Under Lines" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomSlider value={lineWidth} onChange={(value) => setLineWidth(value)} min={1} max={5} step={0.5} label="Line Width" formatValue={(val) => `${val}px`} />
            <CustomSlider value={areaOpacity} onChange={(value) => setAreaOpacity(value)} min={0.1} max={0.7} step={0.05} label="Area Transparency" formatValue={(val) => `${Math.round(val * 100)}%`} />
          </Grid>
        </Grid>
      </Box>,
      <Box key="trend-line-mode" sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>Trend Line Type</Typography>
        <ToggleButtonGroup
          value={draftSettings?.trendLineMode || 'average'}
          exclusive
          onChange={(e, v) => v && setDraftSettings(ds => ({ ...ds, trendLineMode: v }))}
          size="small"
        >
          <ToggleButton value="average" sx={{ textTransform: 'none' }}>Average-Based Trend Line</ToggleButton>
          <ToggleButton value="curve" sx={{ textTransform: 'none' }}>Curve-Fit Trend Line</ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Average-Based draws a straight best-fit line. Curve-Fit follows the actual shape of the data using a smoothed line.
        </Typography>
      </Box>,
      <Box key="annotations" sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>Text Annotations</Typography>
          <Button variant="contained" size="small" onClick={addAnnotation} sx={{ textTransform: 'none' }}>
            + Add Text Box
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Add labels that appear on the chart. After closing settings, drag them anywhere on the plot.
        </Typography>
        {annotations.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No annotations yet. Click "+ Add Text Box" to add one.
          </Typography>
        )}
        {annotations.map((ann, index) => (
          <Box key={ann.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#666', minWidth: 24 }}>#{index + 1}</Typography>
            <DebouncedTextField
              size="small"
              label="Label"
              value={ann.field}
              onChange={(e) => updateAnnotation(ann.id, 'field', e.target.value)}
              sx={{ width: 130 }}
            />
            <DebouncedTextField
              size="small"
              label="Text"
              value={ann.text}
              onChange={(e) => updateAnnotation(ann.id, 'text', e.target.value)}
              sx={{ flex: 1 }}
            />
            <Button size="small" color="error" variant="outlined" onClick={() => removeAnnotation(ann.id)} sx={{ minWidth: 32, textTransform: 'none' }}>✕</Button>
          </Box>
        ))}
      </Box>
    ];


    const datasetColorPairs = allDatasets.map((dataset, index) => ({
      key: `dataset-${dataset.name}`,
      label: `Dataset: ${datasetLabels[dataset.name] || dataset.name || `Sheet ${index + 1}`}`,
      value: draftSettings?.datasetColors?.[dataset.name] || datasetColors[dataset.name] || BASE_COLORS[(index + 6) % BASE_COLORS.length],
      onChange: (color) => setDraftSettings(ds => ({
        ...ds,
        datasetColors: {
          ...ds?.datasetColors,
          [dataset.name]: color,
        }
      }))
    }));

    const plotColorPairs = allPairs.map((pair, index) => ({
      key: `pair-${pair.key}`,
      label: `Plot: ${pair.x} vs ${pair.y}`,
      value: draftSettings?.pairColors?.[pair.key] || pairColors[pair.key] || pairColorMap[pair.key]?.base || BASE_COLORS[index % BASE_COLORS.length],
      onChange: (color) => setDraftSettings(ds => ({
        ...ds,
        pairColors: {
          ...ds?.pairColors,
          [pair.key]: color,
        }
      }))
    }));

    const seriesColorPairs = allPairs.flatMap((pair, pairIndex) =>
      allDatasets.map((dataset, datasetIndex) => {
        const comboKey = `${pair.key}|||${dataset.name}`;
        return {
          key: `series-${comboKey}`,
          label: `${pair.x} vs ${pair.y} — ${datasetLabels[dataset.name] || dataset.name}`,
          value:
            draftSettings?.pairDatasetColors?.[comboKey] ||
            pairDatasetColors[comboKey] ||
            getPairDatasetColor(pair.key, dataset.name),
          onChange: (color) => setDraftSettings(ds => ({
            ...ds,
            pairDatasetColors: {
              ...ds?.pairDatasetColors,
              [comboKey]: color,
            }
          }))
        };
      })
    );

    const colorPairs = [...datasetColorPairs, ...plotColorPairs, ...seriesColorPairs];

    return (
      <ChartSettingsModal
        open={settingsModalOpen}
        onClose={handleSettingsModalClose}
        onApply={handleSettingsSave}
        onReset={resetSettings}
        settings={null}
        draftSettings={draftSettings}
        setDraftSettings={setDraftSettings}
        colorPairs={colorPairs}
        colorOptions={BASE_COLORS}
        featureSections={featureSections}
        colorSection={allDatasets.length > 0 || allPairs.length > 0}
        title="Chart Settings"
        description="Customize chart appearance, dataset colors, and colors for each selected X-Y plot"
        colorSectionTitle="Dataset, Pair & Individual Series Colors"
        minHeight={600}
        maxWidth="lg"
        multiDatasetColors={false}
      />
    );
  };

  const hasData = allPoints && allPoints.length > 0;

  // Get current pair label for display
  const currentPairLabel = currentPairKey ? currentPairKey.replace("__", " vs ") : "";
  
  // Get current per-pair ranges for display
  const currentXRange = scaleMode === "perPair" && currentPairKey ? perPairRanges[currentPairKey]?.xRange : customXRange;
  const currentYRange = scaleMode === "perPair" && currentPairKey ? perPairRanges[currentPairKey]?.yRange : customYRange;
  const currentAutoXRanges = scaleMode === "perPair" && currentPairKey ? perPairAutoRanges[currentPairKey] : globalAutoRanges;
  const currentAutoYRanges = scaleMode === "perPair" && currentPairKey ? perPairAutoRanges[currentPairKey] : globalAutoRanges;

  const renderLegendBlock = () => {
    // Choose a context pair key for legend shading when in individual/stacked view
    const contextPairKey = (datasetView === 'individual' && activePairs.length > 0) ? activePairs[0] : (scaleMode === 'perPair' && currentPairKey ? currentPairKey : null);

    const activePairObjects = allPairs.filter(p => activePairs.includes(p.key));
    const useStackedPanels = datasetView === "individual" && activePairObjects.length > 1;
    const datasetLegend = allDatasets.map((dataset, idx) => ({
      key: `dataset-${dataset.name}`,
      name: dataset.name,
      label: datasetLabels[dataset.name] || dataset.name,
      // If showing a single pair in per-pair Individual view, use the pair-specific dataset variant so swatch matches area
      color: (datasetView === 'individual' && scaleMode === 'perPair' && currentPairKey && !useStackedPanels) ? getPairDatasetColor(currentPairKey, dataset.name) : getDatasetColor(dataset.name),
      visible: visibleDatasetNames.includes(dataset.name),
    }));

    const pairLegend = allPairs
      .filter((pair) => activePairs.includes(pair.key))
      .map((pair) => ({
        key: `pair-${pair.key}`,
        pairKey: pair.key,
        label: `${pair.x} vs ${pair.y}`,
        color: getPairBaseColor(pair.key),
        series: allDatasets
          .filter((dataset) => visibleDatasetNames.includes(dataset.name))
          .map((dataset) => ({
            key: `${pair.key}|||${dataset.name}`,
            dataset: dataset.name,
            label: datasetLabels[dataset.name] || dataset.name,
            color: getPairDatasetColor(pair.key, dataset.name),
          })),
      }));

    return (
      <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>Legend</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
          {datasetLegend.map((item) => (
            <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Checkbox size="small" checked={item.visible} onChange={() => {
                setVisibleDatasetNames(prev => item.visible ? prev.filter(n => n !== item.name) : [...prev, item.name]);
              }} sx={{ p: 0.5 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'background.paper', px: 1, py: 0.5, borderRadius: 2, border: '1px solid', borderColor: 'grey.300' }}>
                <Box sx={{ width: 13, height: 13, borderRadius: '50%', bgcolor: item.color, flexShrink: 0, border: `1px solid ${darkenColor(item.color, 0.3)}` }} />
                <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>
                  {item.label}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        {pairLegend.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {pairLegend.map((item) => (
              <Box
                key={item.key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.9,
                  bgcolor: 'background.paper',
                  px: 1.25,
                  py: 0.75,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.300'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45 }}>
                  {item.series.map((series) => (
                    <MuiTooltip key={series.key} title={`${item.label} — ${series.label}`}>
                      <Box
                        sx={{
                          width: 13,
                          height: 13,
                          borderRadius: '50%',
                          bgcolor: series.color,
                          flexShrink: 0,
                          border: `1px solid ${darkenColor(series.color, 0.3)}`
                        }}
                      />
                    </MuiTooltip>
                  ))}
                </Box>
                <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 700 }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
        
      </Box>
    );
  };

  return (
    <Box sx={{
      p: { xs: 1.5, sm: 2.5, md: 3 },
      maxWidth: "100%",
      overflow: "hidden",
      minHeight: "100%",
      bgcolor: "#F7F9FC",
      background: "linear-gradient(180deg, #F5F8FC 0%, #FAFBFD 36%, #FFFFFF 100%)",
      borderRadius: 3
    }}>
      <SettingsModal />

      {/* Scale Mode Selection */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 2.5, border: '1px solid #E5EAF2', boxShadow: 'none', bgcolor: '#FAFBFD' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <ScaleIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>Axis Scaling Mode:</Typography>
            <ToggleButtonGroup value={scaleMode} exclusive onChange={(_, v) => { if (v) { setScaleMode(v); resetZoom(); if (v == "perPair"){setActivePairs(allPairs.map(p => p.key));if (allPairs.length > 0) { setCurrentPairKey(allPairs[0].key); } } } }} size="small">
              <ToggleButton value="global" sx={{ textTransform: 'none' }}>All Selected Pairs View (All Sheets)</ToggleButton>
              <ToggleButton value="perPair" sx={{ textTransform: 'none' }}>Single Sheet View</ToggleButton>
              <ToggleButton value="perVariable" sx={{ textTransform: 'none' }}>Per-Variable Scale</ToggleButton>
            </ToggleButtonGroup>
            {scaleMode === "perPair" && allPairs.length > 0 && (
              <>
                <Typography variant="body2" sx={{ ml: { xs: 0, sm: 2 }, color: 'text.secondary' }}>Show pair:</Typography>
                <Select
                  size="small"
                  value={currentPairKey || (allPairs[0]?.key || "")}
                  onChange={(e) => { setCurrentPairKey(e.target.value); resetZoom(); }}
                  sx={{ minWidth: 200 }}
                >
                  {allPairs.map(pair => (
                    <MenuItem key={pair.key} value={pair.key}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: pairColorMap[pair.key]?.post, border: `2px solid ${pairColorMap[pair.key]?.base}` }} />
                        <span>{pair.x} vs {pair.y}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {scaleMode === "global" 
              ? "All variable pairs share the same X and Y axis scales. Use this for direct comparison across pairs." 
              : scaleMode === "perPair"
              ? "Each variable pair has its own independent axis scales, optimized for that pair's data range. Use this to see finer details in each relationship."
              : "Each axis uses the scale range of its specific variable across all data. Use this for consistent variable scaling across different pairs."}
          </Typography>
        </CardContent>
      </Card>

      {/* Variable Selection */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'primary.main' }}>Select X (Independent) Variables</Typography>
          <Autocomplete multiple options={availableColumns} value={selectedXVars} onChange={(_, v) => setSelectedXVars(v)} renderInput={(params) => <DebouncedTextField {...params} label="X Variables" variant="outlined" size="small" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'success.main' }}>Select Y (Dependent) Variables</Typography>
          <Autocomplete multiple options={availableColumns} value={selectedYVars} onChange={(_, v) => setSelectedYVars(v)} renderInput={(params) => <DebouncedTextField {...params} label="Y Variables" variant="outlined" size="small" />} />
        </Grid>
        <Grid item xs={12} sm={12} md={4}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'secondary.main' }}>Chart Layout</Typography>
          <ToggleButtonGroup value={datasetView} exclusive onChange={(_, v) => { if (v) setDatasetView(v); }} color="primary" fullWidth sx={{ height: "48px", "& .MuiToggleButton-root": { textTransform: "none", px: 1.5, fontSize: "0.875rem", border: "1px solid", borderColor: "primary.main", "&.Mui-selected": { backgroundColor: "primary.main", color: "white", "&:hover": { backgroundColor: "primary.dark" } } } }}>
            <ToggleButton value="combined">Combined</ToggleButton>
            <ToggleButton value="individual">Individual</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>

      {/* Data Filter */}
      <Card sx={{ mb: 3, borderRadius: 2.5, border: '1px solid #E5EAF2', boxShadow: '0 4px 16px rgba(15,23,42,.04)', bgcolor: 'grey.50' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>Data Filter</Typography>
          <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete options={availableColumnsForFilter} value={filterColumn} onChange={(e, v) => setFilterColumn(v || '')} renderInput={(params) => <DebouncedTextField {...params} label="Filter Column" variant="outlined" size="small" />} disableClearable={false} />
            </Grid>
            <Grid item xs={6} sm={3} md={2.5}>
              <DebouncedTextField type={columnIsDateTime ? 'datetime-local' : 'number'} size="small" label={columnIsDateTime ? 'Min (datetime)' : 'Min'} value={filterMin} onChange={(e) => setFilterMin(e.target.value)} disabled={!filterColumn} fullWidth />
            </Grid>
            <Grid item xs={6} sm={3} md={2.5}>
              <DebouncedTextField type={columnIsDateTime ? 'datetime-local' : 'number'} size="small" label={columnIsDateTime ? 'Max (datetime)' : 'Max'} value={filterMax} onChange={(e) => setFilterMax(e.target.value)} disabled={!filterColumn} fullWidth />
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              <Button onClick={resetLocalFilter} variant="outlined" size="small" sx={{ textTransform: 'none', width: { xs: '100%', md: 'auto' }, minWidth: '120px' }}>Reset Filter</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Active Variable Pairs */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 3, border: "1px solid #E5EAF2", boxShadow: "0 8px 28px rgba(15,23,42,.055)", backgroundImage: "none" }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>Active Variable Pairs</Typography>
          <Paper elevation={0} sx={{ maxHeight: 120, overflowY: 'auto', p: 2, bgcolor: 'grey.100', borderRadius: 2, boxShadow: 0 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {allPairs.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Select X and Y variables to see pairs.</Typography>
              ) : (
                allPairs.map((pair) => {
                  return (
                    <FormControlLabel
                      key={pair.key}
                      control={
                        <Checkbox
                          checked={activePairs.includes(pair.key)}
                          onChange={() => setActivePairs(prev => prev.includes(pair.key) ? prev.filter(k => k !== pair.key) : [...prev, pair.key])}
                          sx={{ color: datasetColors[allDatasets[0]?.name] || pairColorMap[pair.key]?.base || BASE_COLORS[0] }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            {allDatasets.filter(ds => visibleDatasetNames.includes(ds.name)).map((ds) => {
                              const seriesColor = getPairDatasetColor(pair.key, ds.name);
                              return (
                                <MuiTooltip key={ds.name} title={`${pair.x} vs ${pair.y} — ${datasetLabels[ds.name] || ds.name}`}>
                                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: seriesColor, border: `2px solid ${darkenColor(seriesColor, 0.25)}` }} />
                                </MuiTooltip>
                              );
                            })}
                          </Box>
                          <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>{pair.x} vs {pair.y}</Typography>
                        </Box>
                      }
                      sx={{ m: 0, mr: 2, mb: 1 }}
                    />
                  );
                })
              )}
            </Box>
          </Paper>
        </CardContent>
      </Card>

      {/* Dataset Color Customization */}
      <Card sx={{ mb: 3, borderRadius: 2.5, border: '1px solid #E5EAF2', boxShadow: '0 4px 16px rgba(15,23,42,.04)', bgcolor: 'grey.50' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>Dataset Colors</Typography>
          <Grid container spacing={2}>
            {allDatasets.map((ds, idx) => (
              <Grid item xs={12} sm={6} md={4} key={ds.name}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: datasetColors[ds.name] || BASE_COLORS[idx % BASE_COLORS.length], border: `2px solid ${darkenColor(datasetColors[ds.name] || BASE_COLORS[idx % BASE_COLORS.length], 0.25)}` }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{ds.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input
                        type="color"
                        value={datasetColors[ds.name] || BASE_COLORS[idx % BASE_COLORS.length]}
                        onChange={(e) => setDatasetColors(prev => ({ ...prev, [ds.name]: e.target.value }))}
                        style={{ width: 40, height: 28, border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}
                      />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Click to edit</Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Line & Area Settings Toggle */}
      <Card sx={{ mb: 3, borderRadius: 2.5, border: '1px solid #E5EAF2', boxShadow: '0 4px 16px rgba(15,23,42,.04)', bgcolor: 'grey.50' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <ShowChartIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>Line & Area Display Settings:</Typography>
            <FormControlLabel control={<Switch checked={showLines} onChange={e => setShowLines(e.target.checked)} />} label="Show Connecting Lines" />
            <FormControlLabel control={<Switch checked={showArea} onChange={e => setShowArea(e.target.checked)} />} label="Show Area Under Lines" />
            {showArea && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
                <Typography variant="body2">Area Opacity:</Typography>
                <input
                  type="range"
                  min={0.1}
                  max={0.7}
                  step={0.05}
                  value={areaOpacity}
                  onChange={(e) => setAreaOpacity(parseFloat(e.target.value))}
                  style={{ width: 150 }}
                />
                <Typography variant="body2">{Math.round(areaOpacity * 100)}%</Typography>
              </Box>
            )}
            {showLines && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2">Line Width:</Typography>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={0.5}
                  value={lineWidth}
                  onChange={(e) => setLineWidth(parseFloat(e.target.value))}
                  style={{ width: 150 }}
                />
                <Typography variant="body2">{lineWidth}px</Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Dashboard Header */}
      <Card elevation={0} sx={{
        mb: 2.5,
        border: '1px solid #E5EAF2',
        borderRadius: 3,
        boxShadow: '0 8px 28px rgba(15,23,42,0.055)',
        overflow: 'hidden',
        position: 'relative',
        backgroundImage: 'none'
      }}>
        <Box sx={{
          position: 'absolute', width: 250, height: 250, borderRadius: '50%',
          bgcolor: '#EEF4FF', right: -90, top: -145, pointerEvents: 'none'
        }} />
        <Box sx={{
          position: 'absolute', width: 110, height: 110, borderRadius: '50%',
          bgcolor: '#F5F3FF', right: 135, bottom: -82, pointerEvents: 'none'
        }} />
        <CardContent sx={{ p: { xs: 2, md: 2.75 }, '&:last-child': { pb: { xs: 2, md: 2.75 } }, position: 'relative' }}>
          <Box sx={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            flexDirection: { xs: 'column', md: 'row' }, gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 48, height: 48, borderRadius: 2.5, display: 'grid',
                placeItems: 'center', bgcolor: '#172B4D', color: '#fff',
                boxShadow: '0 8px 20px rgba(23,43,77,.18)', flexShrink: 0
              }}>
                <ScatterPlotIcon />
              </Box>
              <Box>
                <Typography variant="h5" sx={{
                  fontWeight: 850, color: '#0F172A', letterSpacing: '-0.025em',
                  fontSize: { xs: '1.25rem', md: '1.55rem' }
                }}>
                  Multi-Variate Scatter Plot
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', mt: .3, maxWidth: 720 }}>
                  Compare variable relationships across datasets with independent series colors, flexible scaling, trend analysis and interactive zoom.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: { xs: '100%', md: 'auto' } }}>
              <Button
                variant="outlined"
                startIcon={<TuneIcon />}
                onClick={openSettingsModal}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, borderColor: '#D8E0EC', color: '#334155', bgcolor: '#fff' }}
              >
                Chart Settings
              </Button>
              <MuiTooltip title="Download entire page as PNG">
                <Button
                  onClick={downloadPageAsPNG}
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, bgcolor: '#172B4D', boxShadow: 'none', '&:hover': { bgcolor: '#223A61', boxShadow: 'none' } }}
                >
                  Export Page
                </Button>
              </MuiTooltip>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2.25 }}>
            <Box sx={{ px: 1.2, py: .55, borderRadius: 10, bgcolor: '#EFF6FF', color: '#2563EB', fontSize: 12, fontWeight: 750 }}>
              {activePairs.length} active pair{activePairs.length === 1 ? '' : 's'}
            </Box>
            <Box sx={{ px: 1.2, py: .55, borderRadius: 10, bgcolor: '#ECFDF5', color: '#047857', fontSize: 12, fontWeight: 750 }}>
              {visibleDatasetNames.length} visible dataset{visibleDatasetNames.length === 1 ? '' : 's'}
            </Box>
            <Box sx={{ px: 1.2, py: .55, borderRadius: 10, bgcolor: '#F5F3FF', color: '#7C3AED', fontSize: 12, fontWeight: 750 }}>
              {visibleAnalysisPoints.length.toLocaleString()} plotted points
            </Box>
            <Box sx={{ px: 1.2, py: .55, borderRadius: 10, bgcolor: '#F8FAFC', color: '#475569', fontSize: 12, fontWeight: 750 }}>
              {scaleMode === 'global' ? 'Dynamic scale' : scaleMode === 'perPair' ? 'Single-pair scale' : 'Per-variable scale'}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <div ref={pageRef}>
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main", fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" }, textAlign: { xs: "center", sm: "left" } }}>
                Multi-Variate Scatter Plot{scaleMode === "perPair" && currentPairLabel ? ` - ${currentPairLabel}` : ""}
              </Typography>
            </Box>

            {/* Color legend for pairs */}
            {/* {allPairs.length > 0 && scaleMode !== "perPair" && (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {allPairs.map((pair) => {
                  const colors = pairColorMap[pair.key];
                  if (!activePairs.includes(pair.key)) return null;
                  return (
                    <Box key={pair.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: colors?.pre, border: `2px solid ${colors?.base}`, flexShrink: 0 }} />
                      <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: colors?.post, border: `2px solid ${colors?.base}`, flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ color: colors?.base, fontWeight: 600 }}>{pair.x} vs {pair.y}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>(light=pre, dark=post)</Typography>
                    </Box>
                  );
                })}
              </Box>
            )} */}
            

            <Box sx={{ mb: 3 }}>
              <Alert severity="info" variant="outlined" sx={{ display: "flex", alignItems: "center", gap: 1, borderRadius: 2.5, borderColor: "#D9E7FF", bgcolor: "#F8FBFF", color: "#475569", "& .MuiAlert-icon": { color: "#2563EB" } }}>
                <PanToolIcon fontSize="small" />
                <Typography variant="body2">
                  Use mouse wheel to zoom, drag to pan. Every variable-pair + dataset series has its own color. Coincident series are slightly separated on-screen so no series color is hidden behind another.
                  {showLines && " Blue lines connect points to show data sequence."}
                  {showArea && " Shaded areas highlight the region under each data line."}
                  {datasetView === "individual" && " Individual View displays each active variable pair in its own separate panel."}
                  {datasetView === "combined" && " Combined View overlays all active pairs onto a single chart."}
                  {scaleMode === "global" && " In Dynamic Scale mode, all active pairs share the same X/Y axis ranges."}
                  {scaleMode === "perPair" && " In Single Pair View mode, select a pair from the dropdown to view it with its own independent axis scales."}
                  {scaleMode === "perVariable" && " In Per-Variable Scale mode, each axis uses the scale range of its specific variable across all data."}
                </Typography>
              </Alert>
            </Box>

            {renderLegendBlock()}

            {/* Axis Scale Controls */}
            {scaleMode !== "perVariable" && (
              <Card sx={{ mb: 3, borderRadius: 2.5, border: '1px solid #E5EAF2', boxShadow: '0 4px 16px rgba(15,23,42,.04)', bgcolor: 'grey.50' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "primary.main" }}>
                      Axis Scale Controls{scaleMode === "perPair" && currentPairLabel ? ` (${currentPairLabel})` : ""}
                    </Typography>
                    <MuiTooltip title="Reset to Auto Scale"><Button onClick={resetAxisRanges} size="small" variant="outlined" startIcon={<RefreshIcon />} sx={{ textTransform: 'none' }}>Reset Auto</Button></MuiTooltip>
                  </Box>
                  <Grid container spacing={{ xs: 2, sm: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" sx={{ mb: 2, fontWeight: 500, color: "primary.main" }}>X-Axis Range:</Typography>
                      <Grid container spacing={1} alignItems="center">
                        <Grid item xs={5}><DebouncedTextField type="number" size="small" value={currentXRange?.min || ""} onChange={(e) => handleXRangeChange("min", e.target.value)} placeholder={currentAutoXRanges?.xMin?.toFixed(2) || "Auto"} /></Grid>
                        <Grid item xs={2} sx={{ textAlign: 'center' }}><Typography variant="body2" sx={{ fontWeight: 500 }}>to</Typography></Grid>
                        <Grid item xs={5}><DebouncedTextField type="number" size="small" value={currentXRange?.max || ""} onChange={(e) => handleXRangeChange("max", e.target.value)} placeholder={currentAutoXRanges?.xMax?.toFixed(2) || "Auto"} /></Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" sx={{ mb: 2, fontWeight: 500, color: "success.main" }}>Y-Axis Range:</Typography>
                      <Grid container spacing={1} alignItems="center">
                        <Grid item xs={5}><DebouncedTextField type="number" size="small" value={currentYRange?.min || ""} onChange={(e) => handleYRangeChange("min", e.target.value)} placeholder={currentAutoYRanges?.yMin?.toFixed(2) || "Auto"} /></Grid>
                        <Grid item xs={2} sx={{ textAlign: 'center' }}><Typography variant="body2" sx={{ fontWeight: 500 }}>to</Typography></Grid>
                        <Grid item xs={5}><DebouncedTextField type="number" size="small" value={currentYRange?.max || ""} onChange={(e) => handleYRangeChange("max", e.target.value)} placeholder={currentAutoYRanges?.yMax?.toFixed(2) || "Auto"} /></Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Zoom Controls */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap", justifyContent: { xs: "center", sm: "flex-end" }, mb: 2 }}>
              <ButtonGroup variant="outlined" size="small">
                <MuiTooltip title="Zoom In"><Button onClick={zoomIn} sx={{ minWidth: "40px", px: 1 }}><ZoomInIcon fontSize="small" /></Button></MuiTooltip>
                <MuiTooltip title="Zoom Out"><Button onClick={zoomOut} sx={{ minWidth: "40px", px: 1 }}><ZoomOutIcon fontSize="small" /></Button></MuiTooltip>
                <MuiTooltip title="Reset Zoom"><Button onClick={resetZoom} sx={{ minWidth: "40px", px: 1 }}><CenterFocusStrongIcon fontSize="small" /></Button></MuiTooltip>
              </ButtonGroup>
              <Box sx={{ display: "flex", gap: 1, alignItems: 'center' }}>
                <MuiTooltip title="Chart Settings">
                  <Button variant="outlined" color="primary" onClick={openSettingsModal} startIcon={<SettingsIcon />} size="small" sx={{ textTransform: 'none', height: 32 }}>Settings</Button>
                </MuiTooltip>
                <SaveVisualizationButton elementId="visualization-content" fileNamePrefix="multivariate_scatter" variableNames={[...selectedXVars, ...selectedYVars].filter(Boolean)} />
                <MuiTooltip title="Download Plot as PNG">
                  <Button variant="outlined" color="primary" onClick={downloadChartAsPNG} startIcon={<DownloadIcon />} size="small" sx={{ textTransform: 'none', height: 32 }}>Download PNG</Button>
                </MuiTooltip>
              </Box>
            </Box>
            {allPairs.length > 0 && (
              <Box sx={{ mb: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 2, border: '1px solid #1976d2', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                {(scaleMode === "perPair" && currentPairKey
                  ? allPairs.filter(p => p.key === currentPairKey)
                  : allPairs
                ).map((pair) => {
                  if (!activePairs.includes(pair.key)) return null;
                  return (
                    <Box key={pair.key} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'nowrap', mr: 1 }}>
                      {allDatasets.filter(ds => visibleDatasetNames.includes(ds.name)).map((ds) => {
                        const seriesColor = getPairDatasetColor(pair.key, ds.name);
                        return (
                          <MuiTooltip key={ds.name} title={`${pair.x} vs ${pair.y} — ${datasetLabels[ds.name] || ds.name}`}>
                            <Box sx={{ width: 13, height: 13, borderRadius: '50%', bgcolor: seriesColor, flexShrink: 0, border: `2px solid ${darkenColor(seriesColor, 0.25)}` }} />
                          </MuiTooltip>
                        );
                      })}
                      <Typography sx={{ color: getPairBaseColor(pair.key), fontWeight: 700, fontSize: '14px', fontFamily: 'inherit' }}>
                        {pair.x} vs {pair.y}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
            {/* Plot Area */}
            {!hasData ? (
              <Alert severity="info" sx={{ width: "100%", my: 3, borderRadius: 2 }}>No data available for the selected variables</Alert>
            ) : (
              <Card sx={{ mb: 3, borderRadius: 2.5, border: '1px solid #E5EAF2', boxShadow: '0 4px 16px rgba(15,23,42,.04)', overflow: 'hidden' }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ width: '100%', position: 'relative' }}>
                    <div ref={containerRef} className="abhitech-plot-area" style={{ width: "100%", height: "500px", position: "relative" }}>
                      <svg ref={svgRef} style={{ width: "100%", height: "100%", display: "block", position: "absolute", top: 0, left: 0 }}></svg>
                      <canvas ref={canvasRef} width={containerRef.current?.offsetWidth || 700} height={500} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '500px', pointerEvents: 'none' }} />
                      <div
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '500px', zIndex: 10, pointerEvents: 'auto', background: 'transparent', cursor: isDragging ? 'grabbing' : 'grab' }}
                        onWheel={(e) => { if (e.cancelable) e.preventDefault(); if (zoomRef.current && zoomRectRef.current) { const zoomRect = d3.select(zoomRectRef.current); const rect = zoomRectRef.current.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top; const scale = e.deltaY > 0 ? 0.9 : 1.1; zoomRect.call(zoomRef.current.scaleBy, scale, [x, y]); } }}
                        onMouseDown={(e) => { if (e.button === 0 && zoomRef.current && zoomRectRef.current) { setIsDragging(true); setDragStart({ x: e.clientX, y: e.clientY }); if (e.cancelable) e.preventDefault(); } }}
                        onMouseMove={(e) => { handleCanvasMouseMove(e); if (isDragging && zoomRef.current && zoomRectRef.current) { const dx = e.clientX - dragStart.x; const dy = e.clientY - dragStart.y; if (Math.abs(dx) > 2 || Math.abs(dy) > 2) { const zoomRect = d3.select(zoomRectRef.current); const ct = d3.zoomTransform(zoomRectRef.current); const newTransform = ct.translate(dx / ct.k, dy / ct.k); zoomRect.call(zoomRef.current.transform, newTransform); setDragStart({ x: e.clientX, y: e.clientY }); } } }}
                        onMouseUp={() => setIsDragging(false)}
                        onMouseLeave={() => { setIsDragging(false); handleCanvasMouseOut(); }}
                      />
                      {/* <Box sx={{ position: 'absolute', top: 10, right: 20, zIndex: 1000, pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: 1, background: 'rgba(255,255,255,0.95)', p: '4px 10px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                        <Box sx={{ width: 22, height: 22 }}><img src={logo} alt="Abhitech Logo" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'contain' }} /></Box>
                        <Box><Box sx={{ fontSize: '8px', lineHeight: '1' }}>Powered by</Box><Box sx={{ fontSize: '9px', fontWeight: 'bold', color: '#1976d2', lineHeight: '1.1' }}>Abhitech's AbhiStat</Box></Box>
                      </Box> */}
                      <Box sx={{ position: 'absolute', top: 12, right: 20, zIndex: 1000, pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: 1.5, background: 'rgba(255,255,255,0.97)', p: '8px 14px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', boxShadow: '0 3px 10px rgba(0,0,0,0.15)' }}>
                      <Box sx={{ width: 36, height: 36 }}><img src={logo} alt="Abhitech Logo" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'contain' }} /></Box>
                      <Box>
                        <Box sx={{ fontSize: '11px', lineHeight: '1.4', color: '#666' }}>Powered by</Box>
                        <Box sx={{ fontSize: '13px', fontWeight: 'bold', color: '#1976d2', lineHeight: '1.4' }}>Abhitech's AbhiStat</Box>
                      </Box>
                    </Box>
                    {visibleAnnotations.map((ann) => {
                      if (!annotationRefs.current[ann.id]) {
                        annotationRefs.current[ann.id] = createRef();
                      }
                      return (
                        <Draggable
                          key={ann.id}
                          nodeRef={annotationRefs.current[ann.id]}
                          position={annotationPositions[ann.id] || { x: 120, y: 120 }}
                          onDrag={(e, data) => handleAnnotationDrag(ann.id, data)}
                          onStop={(e, data) => handleAnnotationDragStop(ann.id, data)}
                          bounds="parent"
                        >
                          <Box ref={annotationRefs.current[ann.id]} sx={{
                            position: 'absolute',
                            zIndex: 998,
                            cursor: 'grab',
                            background: 'rgba(255,255,255,0.96)',
                            border: '1.5px solid #1976d2',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            minWidth: 80,
                            userSelect: 'none',
                          }}>
                            {ann.field && (
                              <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: '#1976d2', fontSize: '11px' }}>
                                {ann.field}
                              </Typography>
                            )}
                            <Typography variant="body2" sx={{ fontSize: '12px', color: '#333' }}>
                              {ann.text || '(empty)'}
                            </Typography>
                          </Box>
                        </Draggable>
                      );
                    })}
                      {tooltip.visible && tooltip.data && (
                        <Paper elevation={3} sx={{ position: "absolute", left: Math.min(tooltip.x + 10, window.innerWidth - 320), top: Math.max(tooltip.y - 10, 10), p: { xs: 1.5, md: 2 }, backgroundColor: "background.paper", maxWidth: { xs: 250, md: 300 }, borderRadius: 2, border: "2px solid", borderColor: getPairBaseColor(tooltip.data.pairKey) || 'divider', boxShadow: "0 16px 36px rgba(15,23,42,0.16)", pointerEvents: "none", zIndex: 1000 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: getPointColor(tooltip.data.pairKey, tooltip.data.dataset), border: `2px solid ${getPairBaseColor(tooltip.data.pairKey)}`, flexShrink: 0 }} />
                            <Typography variant="subtitle2" sx={{ color: getPairBaseColor(tooltip.data.pairKey), fontWeight: "bold" }}>{tooltip.data.dataset} — {tooltip.data.xLabel} vs {tooltip.data.yLabel}</Typography>
                          </Box>
                          <Typography variant="body2">{tooltip.data.xLabel}: {formatValue(tooltip.data.xDisplay, tooltip.data.x > 1e12)}</Typography>
                          <Typography variant="body2">{tooltip.data.yLabel}: {formatValue(tooltip.data.yDisplay, tooltip.data.y > 1e12)}</Typography>
                        </Paper>
                      )}
                    </div>
                  </Box>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <SummaryCards />
        <InsightsPanel />
      </div>
    </Box>
  );
};

export default MultiVariateScatterPlotTab;
