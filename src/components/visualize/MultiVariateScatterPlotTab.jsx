import { useState, useMemo, useRef, useEffect, useCallback, use } from "react";
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
  Checkbox,
  FormControlLabel,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Tooltip as MuiTooltip,
  Button,
  ButtonGroup,
  Divider
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import * as d3 from "d3";
import { v4 as uuidv4 } from 'uuid';
import logo from '../../assets/abhitech-logo.png';
import html2canvas from 'html2canvas';
import ChartSettingsModal from '../ChartSettingsModal';
import SaveVisualizationButton from '../SaveVisualizationButton'

const COLORS = [
  "#4caf50", "#f44336", "#2196f3", "#ff9800", "#9c27b0", "#00bcd4", "#e91e63", "#607d8b", "#ffc107", "#3f51b5"
];

const DATASET_COLORS = {
  "With Product": "#1976d2",
  "Without Product": "#ff6b35"
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
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
          {label}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 600, 
            color: '#1976d2',
            backgroundColor: '#f5f5f5',
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
          backgroundColor: '#e0e0e0',
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
            backgroundColor: '#1976d2',
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

const MultiVariateScatterPlotTab = ({ withProductData = [], withoutProductData = [], availableColumns = [], clientName = '', plantName = '', productName = '' }) => {
  const [selectedXVars, setSelectedXVars] = useState([]);
  const [selectedYVars, setSelectedYVars] = useState([]);
  const [activePairs, setActivePairs] = useState([]);
  const [datasetView, setDatasetView] = useState("both");
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const zoomRef = useRef(null);
  const zoomRectRef = useRef(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, data: null });
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  
  const [chartSettings, setChartSettings] = useState({
    pointSize: 8,
    opacity: 0.7,
    withProductColorOverride: {},
    withoutProductColorOverride: {}
  });
  
  const [draftSettings, setDraftSettings] = useState({
    pointSize: 8,
    opacity: 0.7,
    withProductColorOverride: {},
    withoutProductColorOverride: {}
  });
  
  const [customXRange, setCustomXRange] = useState({ min: "", max: "", auto: true });
  const [customYRange, setCustomYRange] = useState({ min: "", max: "", auto: true });
  const canvasRef = useRef(null);

  // Generate custom filename based on project information
  const generateFileName = (visualizationName) => {
    const parts = [];
    if (clientName) parts.push(clientName.replace(/\s+/g, '_'));
    if (plantName) parts.push(plantName.replace(/\s+/g, '_'));
    if (productName) parts.push(productName.replace(/\s+/g, '_'));
    parts.push(visualizationName.replace(/\s+/g, '_'));
    return parts.join('-');
  };
  const [currentTransform, setCurrentTransform] = useState(d3.zoomIdentity);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [filterColumn, setFilterColumn] = useState('');
  const [filterMin, setFilterMin] = useState('');
  const [filterMax, setFilterMax] = useState('');
  const pageRef = useRef(null);

  const availableColumnsForFilter = useMemo(() => availableColumns || [], [availableColumns]);

  const isDateTimeColumn = useCallback((data, columnName) => {
    if (!data || data.length === 0 || !columnName) return false;
    const sampleValues = data
      .slice(0, 10)
      .map((row) => row?.[columnName])
      .filter((val) => val != null);
    if (sampleValues.length === 0) return false;
    const dateTimeRegex = /^\d{4}-\d{2}-\d{2}([\sT]\d{2}:\d{2}:\d{2}(\.\d{3})?)?$/;
    return sampleValues.every((val) => {
      const str = String(val).trim();
      return dateTimeRegex.test(str) && !isNaN(Date.parse(str));
    });
  }, []);

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

  const filteredWithProductData = useMemo(() => {
    if (!filterColumn) return withProductData;
    const minVal = columnIsDateTime ? (filterMin ? parseDateTimeFromInput(filterMin) : null) : (filterMin !== '' ? Number.parseFloat(filterMin) : null);
    const maxVal = columnIsDateTime ? (filterMax ? parseDateTimeFromInput(filterMax) : null) : (filterMax !== '' ? Number.parseFloat(filterMax) : null);
    
    if (minVal == null && maxVal == null) return withProductData;
    
    return withProductData.filter((row) => {
      const raw = row?.[filterColumn];
      if (raw == null) return false;
      const v = parseValue(raw, columnIsDateTime);
      if (v == null) return false;
      if (minVal != null && v < minVal) return false;
      if (maxVal != null && v > maxVal) return false;
      return true;
    });
  }, [withProductData, filterColumn, filterMin, filterMax, columnIsDateTime, parseDateTimeFromInput, parseValue]);

  const filteredWithoutProductData = useMemo(() => {
    if (!filterColumn) return withoutProductData;
    const minVal = columnIsDateTime ? (filterMin ? parseDateTimeFromInput(filterMin) : null) : (filterMin !== '' ? Number.parseFloat(filterMin) : null);
    const maxVal = columnIsDateTime ? (filterMax ? parseDateTimeFromInput(filterMax) : null) : (filterMax !== '' ? Number.parseFloat(filterMax) : null);
    
    // If no min/max values are set, don't filter - just return original data
    if (minVal == null && maxVal == null) return withoutProductData;
    
    return withoutProductData.filter((row) => {
      const raw = row?.[filterColumn];
      if (raw == null) return false;
      const v = parseValue(raw, columnIsDateTime);
      if (v == null) return false;
      if (minVal != null && v < minVal) return false;
      if (maxVal != null && v > maxVal) return false;
      return true;
    });
  }, [withoutProductData, filterColumn, filterMin, filterMax, columnIsDateTime, parseDateTimeFromInput, parseValue]);

  const resetLocalFilter = useCallback(() => {
    setFilterColumn('');
    setFilterMin('');
    setFilterMax('');
  }, []);

  const allPairs = useMemo(() => {
    const pairs = [];
    selectedXVars.forEach((x) => {
      selectedYVars.forEach((y) => {
        if (x !== y) pairs.push({ x, y, key: `${x}__${y}` });
      });
    });
    return pairs;
  }, [selectedXVars, selectedYVars]);

  const colorMap = useMemo(() => {
    const map = {};
    allPairs.forEach((pair, idx) => {
      map[pair.key] = COLORS[idx % COLORS.length];
    });
    return map;
  }, [allPairs]);

  const getPointColor = useCallback((pairKey, dataset) => {
    if (dataset === "With Product" && chartSettings.withProductColorOverride[pairKey]) {
      return chartSettings.withProductColorOverride[pairKey];
    }
    if (dataset === "Without Product" && chartSettings.withoutProductColorOverride[pairKey]) {
      return chartSettings.withoutProductColorOverride[pairKey];
    }
    
    const baseColor = colorMap[pairKey];
    const datasetColor = DATASET_COLORS[dataset];
    const blendRatio = 0.7;
    return blendColors(baseColor, datasetColor, blendRatio);
  }, [colorMap, chartSettings.withProductColorOverride, chartSettings.withoutProductColorOverride]);

  const blendColors = useCallback((color1, color2, ratio) => {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);
    
    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);
    
    const r = Math.round(r1 * ratio + r2 * (1 - ratio));
    const g = Math.round(g1 * ratio + g2 * (1 - ratio));
    const b = Math.round(b1 * ratio + b2 * (1 - ratio));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    setActivePairs(allPairs.map(p => p.key));
  }, [allPairs.length]);
  useEffect(()=>{
          const syncDataFilterMax = () => {
              const saved = localStorage.getItem('dataFilterMax');
              setFilterMax(saved || '');
          }
  
          window.addEventListener('dataFilterMaxChanged', syncDataFilterMax);
          return () => window.removeEventListener('dataFilterMaxChanged', syncDataFilterMax);
      },[])
  
      useEffect(()=>{
          const syncDataFilterMin = () => {
              const saved = localStorage.getItem('dataFilterMin');
              setFilterMin(saved || '');
          }
  
          window.addEventListener('dataFilterMinChanged', syncDataFilterMin);
          return () => window.removeEventListener('dataFilterMinChanged', syncDataFilterMin);
      },[])

      useEffect(()=>{
              const syncDataFilterColumn = () => {
                  const saved = localStorage.getItem('dataFilterColumn');
                  setFilterColumn(saved || '');
      
              }
      
              window.addEventListener('dataFilterColumnChanged', syncDataFilterColumn);
              return () => window.removeEventListener('dataFilterColumnChanged', syncDataFilterColumn);
          },[])

  useEffect(()=> {
    const syncMultiXVariable = () => {
        const saved = localStorage.getItem('multiVariateScatterXColumn');
        if (saved && !selectedXVars.includes(saved)) {
            setSelectedXVars(prev => [...prev, saved]);
        }
    }

    window.addEventListener('multiVariateScatterXColumnChanged', syncMultiXVariable);
    return () => window.removeEventListener('multiVariateScatterXColumnChanged', syncMultiXVariable);
  },[])

  useEffect(()=> {
    const syncMultiYVariable = () => {
        const saved = localStorage.getItem('multiVariateScatterYColumn');
        if (saved && !selectedYVars.includes(saved)) {
            setSelectedYVars(prev => [...prev, saved]);
        }
    }
    window.addEventListener('multiVariateScatterYColumnChanged', syncMultiYVariable);
    return () => window.removeEventListener('multiVariateScatterYColumnChanged', syncMultiYVariable);
  },[])

  useEffect(()=> {
    const syncViewMode = () => {
        const saved = localStorage.getItem('multiVariateScatterViewMode') || 'both';
        setDatasetView(saved);
    }
    window.addEventListener('multiVariateScatterViewModeChanged', syncViewMode);
    return () => window.removeEventListener('multiVariateScatterViewModeChanged', syncViewMode);
  },[])

  const processData = useCallback((data, pairs) => {
    const result = [];
    for (const pair of pairs) {
      for (let idx = 0; idx < data.length; idx++) {
        const row = data[idx];
        const xVal = row[pair.x];
        const yVal = row[pair.y];
        if (xVal != null && yVal != null && !isNaN(Number(xVal)) && !isNaN(Number(yVal))) {
          result.push({
            x: Number(xVal),
            y: Number(yVal),
            xLabel: pair.x,
            yLabel: pair.y,
            pairKey: pair.key,
            dataset: data === withProductData ? "With Product" : "Without Product",
            id: uuidv4(),
            original: row
          });
        }
      }
    }
    return result;
  }, [withProductData]);

  const withProductPoints = useMemo(() => processData(filteredWithProductData, allPairs), [filteredWithProductData, allPairs, processData]);
  const withoutProductPoints = useMemo(() => processData(filteredWithoutProductData, allPairs), [filteredWithoutProductData, allPairs, processData]);

  const allPoints = useMemo(() => {
    let arr = [];
    if (datasetView === "both" || datasetView === "withProduct") arr = arr.concat(withProductPoints);
    if (datasetView === "both" || datasetView === "withoutProduct") arr = arr.concat(withoutProductPoints);
    return arr.filter(pt => activePairs.includes(pt.pairKey));
  }, [withProductPoints, withoutProductPoints, datasetView, activePairs]);

  const autoRanges = useMemo(() => {
    if (allPoints.length === 0) return { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };
    const xExtent = d3.extent(allPoints, d => d.x);
    const yExtent = d3.extent(allPoints, d => d.y);
    const xPad = (xExtent[1] - xExtent[0]) * 0.05;
    const yPad = (yExtent[1] - yExtent[0]) * 0.05;
    return {
      xMin: xExtent[0] - xPad,
      xMax: xExtent[1] + xPad,
      yMin: yExtent[0] - yPad,
      yMax: yExtent[1] + yPad
    };
  }, [allPoints]);

  useEffect(() => {
    setCustomXRange({ min: "", max: "", auto: true });
    setCustomYRange({ min: "", max: "", auto: true });
  }, [selectedXVars, selectedYVars]);

  const getEffectiveRanges = useCallback(() => {
    let xMin, xMax, yMin, yMax;
    if (customXRange.auto || customXRange.min === "") xMin = autoRanges.xMin;
    else xMin = Number.parseFloat(customXRange.min);
    if (customXRange.auto || customXRange.max === "") xMax = autoRanges.xMax;
    else xMax = Number.parseFloat(customXRange.max);
    if (customYRange.auto || customYRange.min === "") yMin = autoRanges.yMin;
    else yMin = Number.parseFloat(customYRange.min);
    if (customYRange.auto || customYRange.max === "") yMax = autoRanges.yMax;
    else yMax = Number.parseFloat(customYRange.max);
    return { xMin, xMax, yMin, yMax };
  }, [autoRanges, customXRange, customYRange]);

  const resetZoom = useCallback(() => {
    if (zoomRef.current && zoomRectRef.current) {
      const zoomRect = d3.select(zoomRectRef.current);
      zoomRect.transition().duration(750).call(zoomRef.current.transform, d3.zoomIdentity);
      setCurrentTransform(d3.zoomIdentity);
    }
  }, []);
  
  const zoomIn = useCallback(() => {
    if (zoomRef.current && zoomRectRef.current) {
      const zoomRect = d3.select(zoomRectRef.current);
      zoomRect.transition().duration(300).call(zoomRef.current.scaleBy, 1.5);
    }
  }, []);
  
  const zoomOut = useCallback(() => {
    if (zoomRef.current && zoomRectRef.current) {
      const zoomRect = d3.select(zoomRectRef.current);
      zoomRect.transition().duration(300).call(zoomRef.current.scaleBy, 1 / 1.5);
    }
  }, []);
  
  const resetAxisRanges = useCallback(() => {
    setCustomXRange({ min: "", max: "", auto: true });
    setCustomYRange({ min: "", max: "", auto: true });
  }, []);
  
  const handleXRangeChange = useCallback((field, value) => {
    setCustomXRange((prev) => ({ ...prev, [field]: value, auto: field === "min" || field === "max" ? false : prev.auto }));
  }, []);
  
  const handleYRangeChange = useCallback((field, value) => {
    setCustomYRange((prev) => ({ ...prev, [field]: value, auto: field === "min" || field === "max" ? false : prev.auto }));
  }, []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const width = containerRef.current.offsetWidth || 700;
    const height = 500, margin = { top: 40, right: 40, bottom: 60, left: 60 };
    d3.select(svgRef.current).selectAll("*").remove();
    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const { xMin, xMax, yMin, yMax } = getEffectiveRanges();
    const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, plotWidth]);
    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([plotHeight, 0]);
    const plotGroup = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`).attr("class", "plot-group");

    svg.append("defs")
      .append("clipPath")
      .attr("id", "plot-clip")
      .append("rect")
      .attr("width", plotWidth)
      .attr("height", plotHeight);

    const gridGroup = plotGroup.append("g").attr("class", "grid-group").attr("clip-path", "url(#plot-clip)");
    const tickCount = 8;
    gridGroup
      .append("g")
      .attr("class", "grid-x")
      .attr("transform", `translate(0,${plotHeight})`)
      .call(d3.axisBottom(xScale).ticks(tickCount).tickSize(-plotHeight).tickFormat(""))
      .selectAll("line")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);
    gridGroup
      .append("g")
      .attr("class", "grid-y")
      .call(d3.axisLeft(yScale).ticks(tickCount).tickSize(-plotWidth).tickFormat(""))
      .selectAll("line")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);

    const zoom = d3.zoom().scaleExtent([0.1, 50]).extent([[0, 0], [plotWidth, plotHeight]]).on("zoom", (event) => {
      const { transform } = event;
      setCurrentTransform(transform);
      const newXScale = transform.rescaleX(xScale);
      const newYScale = transform.rescaleY(yScale);
      plotGroup.select(".x-axis").call(d3.axisBottom(newXScale));
      plotGroup.select(".y-axis").call(d3.axisLeft(newYScale));
      plotGroup.select(".grid-x").call(d3.axisBottom(newXScale).ticks(tickCount).tickSize(-plotHeight).tickFormat(""));
      plotGroup.select(".grid-y").call(d3.axisLeft(newYScale).ticks(tickCount).tickSize(-plotWidth).tickFormat(""));
    });
    zoomRef.current = zoom;
    const zoomRect = plotGroup.append("rect").attr("width", plotWidth).attr("height", plotHeight).style("fill", "none").style("pointer-events", "all").call(zoom);
    zoomRectRef.current = zoomRect.node();

    plotGroup.append("g").attr("class", "x-axis").attr("transform", `translate(0,${plotHeight})`).call(d3.axisBottom(xScale));
    plotGroup.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));

  }, [allPoints, customXRange, customYRange, selectedXVars, selectedYVars, getEffectiveRanges]);

  const updateCanvasPoints = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const width = containerRef.current.offsetWidth || 700;
    const height = 500, margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const { xMin, xMax, yMin, yMax } = getEffectiveRanges();
    const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, plotWidth]);
    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([plotHeight, 0]);
    
    const transformedXScale = currentTransform.rescaleX(xScale);
    const transformedYScale = currentTransform.rescaleY(yScale);
    
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(margin.left, margin.top);
    
    ctx.beginPath();
    ctx.rect(0, 0, plotWidth, plotHeight);
    ctx.clip();
    
    const nPoints = allPoints.length;
    const perfPointSize = nPoints > 2000 ? Math.max(2, chartSettings.pointSize * 0.6) : chartSettings.pointSize;
    const perfOpacity = nPoints > 2000 ? Math.min(0.3, chartSettings.opacity) : chartSettings.opacity;
    
    for (let i = 0; i < allPoints.length; i++) {
      const d = allPoints[i];
      ctx.beginPath();
      ctx.arc(transformedXScale(d.x), transformedYScale(d.y), perfPointSize, 0, 2 * Math.PI);
      ctx.globalAlpha = perfOpacity;
      ctx.fillStyle = getPointColor(d.pairKey, d.dataset);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#333';
      ctx.stroke();
    }
    ctx.restore();
  }, [allPoints, chartSettings.pointSize, chartSettings.opacity, customXRange, customYRange, selectedXVars, selectedYVars, getEffectiveRanges, getPointColor, currentTransform]);

  useEffect(() => {
    updateCanvasPoints();
  }, [updateCanvasPoints]);

  const gridIndexRef = useRef(null);
  const gridCellSize = 24;

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.offsetWidth || 700;
    const height = 500, margin = { top: 40, right: 40, bottom: 60, left: 60 };
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
    for (let i = 0; i < allPoints.length; i++) {
      const d = allPoints[i];
      const px = transformedXScale(d.x);
      const py = transformedYScale(d.y);
      const col = Math.floor(px / gridCellSize);
      const row = Math.floor(py / gridCellSize);
      if (col >= 0 && col < nCols && row >= 0 && row < nRows) {
        grid[row * nCols + col].push({ ...d, px, py });
      }
    }
    gridIndexRef.current = { grid, nCols, nRows, cellSize: gridCellSize };
  }, [allPoints, customXRange, customYRange, selectedXVars, selectedYVars, getEffectiveRanges, currentTransform]);

  const handleCanvasMouseMove = useCallback((e) => {
    if (!canvasRef.current || !containerRef.current || !gridIndexRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const width = containerRef.current.offsetWidth || 700;
    const height = 500, margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
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
    const nPoints = candidates.length;
    const perfPointSize = allPoints.length > 2000 ? Math.max(2, chartSettings.pointSize * 0.6) : chartSettings.pointSize;
    let minDist = Infinity, closest = null;
    for (let i = 0; i < nPoints; i++) {
      const d = candidates[i];
      const dist = Math.hypot(d.px - mouseX, d.py - mouseY);
      if (dist < perfPointSize + 3 && dist < minDist) {
        minDist = dist;
        closest = d;
      }
    }
    if (closest) {
      setTooltip({ visible: true, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, data: closest });
    } else {
      setTooltip({ visible: false, x: 0, y: 0, data: null });
    }
  }, [allPoints, chartSettings.pointSize]);

  const handleCanvasMouseOut = useCallback(() => {
    setTooltip({ visible: false, x: 0, y: 0, data: null });
  }, []);

  function throttle(fn, wait) {
    let last = 0;
    let timeout;
    return function (...args) {
      const now = Date.now();
      if (now - last >= wait) {
        last = now;
        fn.apply(this, args);
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          last = Date.now();
          fn.apply(this, args);
        }, wait - (now - last));
      }
    };
  }
  
  const downloadChartAsPNG = useCallback(() => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current;
    const svgRect = svgElement.getBoundingClientRect();
    const scaleFactor = 2;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = svgRect.width * scaleFactor;
    canvas.height = (svgRect.height + 50) * scaleFactor;
    
    const convertImageToDataURL = (imgSrc) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(null);
        img.src = imgSrc;
      });
    };
    
    convertImageToDataURL(logo).then((logoDataURL) => {
      const svgClone = svgElement.cloneNode(true); 
      
      if (logoDataURL) {
        const watermarkGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        watermarkGroup.setAttribute("transform", `translate(${svgRect.width - 170}, 10)`);
        const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        bgRect.setAttribute("x", "0");
        bgRect.setAttribute("y", "0");
        bgRect.setAttribute("width", "160");
        bgRect.setAttribute("height", "36");
        bgRect.setAttribute("fill", "rgba(255, 255, 255, 0.95)");
        bgRect.setAttribute("stroke", "rgba(0, 0, 0, 0.1)");
        bgRect.setAttribute("stroke-width", "1");
        bgRect.setAttribute("rx", "4");
        
        const logoImg = document.createElementNS("http://www.w3.org/2000/svg", "image");
        logoImg.setAttributeNS('http://www.w3.org/1999/xlink', 'href', logoDataURL);
        logoImg.setAttribute("x", "8");
        logoImg.setAttribute("y", "6");
        logoImg.setAttribute("width", "24");
        logoImg.setAttribute("height", "24");
        logoImg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        
        const poweredByText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        poweredByText.setAttribute("x", "40");
        poweredByText.setAttribute("y", "18");
        poweredByText.setAttribute("fill", "#666");
        poweredByText.setAttribute("font-size", "10");
        poweredByText.setAttribute("font-family", "Arial, sans-serif");
        poweredByText.textContent = "Powered by";
        
        const brandText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        brandText.setAttribute("x", "40");
        brandText.setAttribute("y", "30");
        brandText.setAttribute("fill", "#1976d2");
        brandText.setAttribute("font-size", "11");
        brandText.setAttribute("font-weight", "bold");
        brandText.setAttribute("font-family", "Arial, sans-serif");
        brandText.textContent = "Abhitech's AbhiStat";
        
        watermarkGroup.appendChild(bgRect);
        watermarkGroup.appendChild(logoImg);
        watermarkGroup.appendChild(poweredByText);
        watermarkGroup.appendChild(brandText);
        svgClone.appendChild(watermarkGroup);
      }
      
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const img = new Image();
      
      img.onload = () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'black';
        ctx.font = `${16 * scaleFactor}px Arial`;
        ctx.textAlign = 'center';
        const datasetLabel = datasetView === "both" ? "Both" : datasetView === "withProduct" ? "With Product" : "Without Product";
        const activePairsText = activePairs.length > 0 ? ` (${activePairs.length} pairs)` : "";
        ctx.fillText(`Multi-Variate Scatter Plot${activePairsText} - ${datasetLabel}`, canvas.width / 2, 30 * scaleFactor);

        ctx.drawImage(img, 0, 50 * scaleFactor, svgRect.width * scaleFactor, svgRect.height * scaleFactor);
        
        if (!logoDataURL) {
          const watermarkX = canvas.width - 160 * scaleFactor - 10 * scaleFactor;
          const watermarkY = 10 * scaleFactor;
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.fillRect(watermarkX, watermarkY, 160 * scaleFactor, 36 * scaleFactor);
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
          ctx.lineWidth = 1 * scaleFactor;
          ctx.strokeRect(watermarkX, watermarkY, 160 * scaleFactor, 36 * scaleFactor);
          
          ctx.fillStyle = '#666';
          ctx.font = `${10 * scaleFactor}px Arial`;
          ctx.fillText('Powered by', watermarkX + 8 * scaleFactor, watermarkY + 18 * scaleFactor);
          
          ctx.fillStyle = '#1976d2';
          ctx.font = `bold ${11 * scaleFactor}px Arial`;
          ctx.fillText("Abhitech's AbhiStat", watermarkX + 8 * scaleFactor, watermarkY + 30 * scaleFactor);
        }
        
        const downloadLink = document.createElement("a");
        const firstVariable = selectedXVars.length > 0 ? selectedXVars[0] : (selectedYVars.length > 0 ? selectedYVars[0] : 'MultiVariate');
        const fileName = generateFileName(`MultiVariateScatterPlot_${firstVariable}`);
        downloadLink.download = `${fileName}.png`;
        downloadLink.href = canvas.toDataURL("image/png");
        downloadLink.click();
      };
      
      img.onerror = () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'black';
        ctx.font = `${16 * scaleFactor}px Arial`;
        ctx.textAlign = 'center';
        const datasetLabel = datasetView === "both" ? "Both" : datasetView === "withProduct" ? "With Product" : "Without Product";
        const activePairsText = activePairs.length > 0 ? ` (${activePairs.length} pairs)` : "";
        ctx.fillText(`Multi-Variate Scatter Plot${activePairsText} - ${datasetLabel}`, canvas.width / 2, 30 * scaleFactor);

        ctx.drawImage(svgElement, 0, 50 * scaleFactor, svgRect.width * scaleFactor, svgRect.height * scaleFactor);

        const watermarkX = canvas.width - 160 * scaleFactor - 10 * scaleFactor;
        const watermarkY = 10 * scaleFactor;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(watermarkX, watermarkY, 160 * scaleFactor, 36 * scaleFactor);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1 * scaleFactor;
        ctx.strokeRect(watermarkX, watermarkY, 160 * scaleFactor, 36 * scaleFactor);
        
        ctx.fillStyle = '#666';
        ctx.font = `${10 * scaleFactor}px Arial`;
        ctx.fillText('Powered by', watermarkX + 8 * scaleFactor, watermarkY + 18 * scaleFactor);
        
        ctx.fillStyle = '#1976d2';
        ctx.font = `bold ${11 * scaleFactor}px Arial`;
        ctx.fillText("Abhitech's AbhiStat", watermarkX + 8 * scaleFactor, watermarkY + 30 * scaleFactor);

        const downloadLink = document.createElement("a");
        const firstVariable = selectedXVars.length > 0 ? selectedXVars[0] : (selectedYVars.length > 0 ? selectedYVars[0] : 'MultiVariate');
        const fileName = generateFileName(`MultiVariateScatterPlot_${firstVariable}`);
        downloadLink.download = `${fileName}.png`;
        downloadLink.href = canvas.toDataURL("image/png");
        downloadLink.click();
      };
      
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    });
  }, [datasetView, activePairs, selectedXVars, selectedYVars]);

  const downloadPageAsPNG = useCallback(async () => {
    if (!pageRef.current) return;
    
    const element = pageRef.current;
    const scaleFactor = 2;
    const canvas = await html2canvas(element, {
      useCORS: true,
      backgroundColor: '#fff',
      scale: scaleFactor,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });
    
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height + 120 * scaleFactor;
    finalCtx.fillStyle = 'white';
    finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    finalCtx.fillStyle = 'black';
    finalCtx.font = `bold ${18 * scaleFactor}px Arial`;
    finalCtx.textAlign = 'center';
    const datasetLabel = datasetView === "both" ? "Both" : datasetView === "withProduct" ? "With Product" : "Without Product";
    const activePairsText = activePairs.length > 0 ? ` (${activePairs.length} pairs)` : "";
    finalCtx.fillText('Multi-Variate Scatter Plot', finalCanvas.width / 2, 30 * scaleFactor);
    finalCtx.font = `${14 * scaleFactor}px Arial`;
    finalCtx.fillText(`Dataset: ${datasetLabel}${activePairsText}`, finalCanvas.width / 2, 55 * scaleFactor);

    finalCtx.drawImage(canvas, 0, 80 * scaleFactor);

    const watermarkImg = new Image();
    watermarkImg.onload = () => {
      const watermarkWidth = 160 * scaleFactor;
      const watermarkHeight = 36 * scaleFactor;
      const watermarkX = finalCanvas.width - watermarkWidth - 10 * scaleFactor;
      const watermarkY = 10 * scaleFactor;

      finalCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      finalCtx.fillRect(watermarkX, watermarkY, watermarkWidth, watermarkHeight);
      finalCtx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      finalCtx.lineWidth = 1 * scaleFactor;
      finalCtx.strokeRect(watermarkX, watermarkY, watermarkWidth, watermarkHeight);

      const logoSize = 24 * scaleFactor;
      finalCtx.drawImage(watermarkImg, watermarkX + 8 * scaleFactor, watermarkY + 6 * scaleFactor, logoSize, logoSize);

      finalCtx.fillStyle = '#666';
      finalCtx.font = `${10 * scaleFactor}px Arial`;
      finalCtx.textAlign = 'left';
      finalCtx.fillText('Powered by', watermarkX + 40 * scaleFactor, watermarkY + 18 * scaleFactor);

      finalCtx.fillStyle = '#1976d2';
      finalCtx.font = `bold ${11 * scaleFactor}px Arial`;
      finalCtx.fillText("Abhitech's AbhiStat", watermarkX + 40 * scaleFactor, watermarkY + 30 * scaleFactor);

      const link = document.createElement('a');
      const firstVariable = selectedXVars.length > 0 ? selectedXVars[0] : (selectedYVars.length > 0 ? selectedYVars[0] : 'MultiVariate');
      const fileName = generateFileName(`MultiVariateScatterPlot_Page_${firstVariable}`);
      link.download = `${fileName}.png`;
      link.href = finalCanvas.toDataURL('image/png');
      link.click();
    };
    watermarkImg.onerror = () => {
      const watermarkWidth = 160 * scaleFactor;
      const watermarkHeight = 36 * scaleFactor;
      const watermarkX = finalCanvas.width - watermarkWidth - 10 * scaleFactor;
      const watermarkY = 10 * scaleFactor;

      finalCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      finalCtx.fillRect(watermarkX, watermarkY, watermarkWidth, watermarkHeight);
      finalCtx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      finalCtx.lineWidth = 1 * scaleFactor;
      finalCtx.strokeRect(watermarkX, watermarkY, watermarkWidth, watermarkHeight);

      finalCtx.fillStyle = '#666';
      finalCtx.font = `${10 * scaleFactor}px Arial`;
      finalCtx.textAlign = 'left';
      finalCtx.fillText('Powered by', watermarkX + 8 * scaleFactor, watermarkY + 18 * scaleFactor);

      finalCtx.fillStyle = '#1976d2';
      finalCtx.font = `bold ${11 * scaleFactor}px Arial`;
      finalCtx.fillText("Abhitech's AbhiStat", watermarkX + 8 * scaleFactor, watermarkY + 30 * scaleFactor);

      const link = document.createElement('a');
      const firstVariable = selectedXVars.length > 0 ? selectedXVars[0] : (selectedYVars.length > 0 ? selectedYVars[0] : 'MultiVariate');
      const fileName = generateFileName(`MultiVariateScatterPlot_Page_${firstVariable}`);
      link.download = `${fileName}.png`;
      link.href = finalCanvas.toDataURL('image/png');
      link.click();
    };
    watermarkImg.src = logo;
  }, [datasetView, activePairs, selectedXVars, selectedYVars]);

  const initializeSettings = useCallback(() => {
    setDraftSettings({
      pointSize: chartSettings.pointSize,
      opacity: chartSettings.opacity,
      withProductColorOverride: { ...chartSettings.withProductColorOverride },
      withoutProductColorOverride: { ...chartSettings.withoutProductColorOverride }
    });
  }, [chartSettings]);

  const openSettingsModal = useCallback(() => {
    initializeSettings();
    setSettingsModalOpen(true);
  }, [initializeSettings]);

  const closeSettingsModal = useCallback(() => {
    setSettingsModalOpen(false);
    setDraftSettings({ pointSize: 8, opacity: 0.7, withProductColorOverride: {}, withoutProductColorOverride: {} });
  }, []);

  const saveSettings = useCallback(() => {
    setChartSettings({
      pointSize: draftSettings.pointSize,
      opacity: draftSettings.opacity,
      withProductColorOverride: { ...draftSettings.withProductColorOverride },
      withoutProductColorOverride: { ...draftSettings.withoutProductColorOverride }
    });
    closeSettingsModal();
  }, [draftSettings, closeSettingsModal]);

  const resetSettings = useCallback(() => {
    const defaultSettings = { pointSize: 8, opacity: 0.7, withProductColorOverride: {}, withoutProductColorOverride: {} };
    setDraftSettings(defaultSettings);
  }, []);

  const updateDraftPointSize = useCallback((value) => {
    setDraftSettings(prev => ({ ...prev, pointSize: value }));
  }, []);

  const updateDraftOpacity = useCallback((value) => {
    setDraftSettings(prev => ({ ...prev, opacity: value }));
  }, []);

  const updateDraftWithProductColor = useCallback((pairKey, color) => {
    setDraftSettings(prev => ({
      ...prev,
      withProductColorOverride: { ...prev.withProductColorOverride, [pairKey]: color }
    }));
  }, []);

  const updateDraftWithoutProductColor = useCallback((pairKey, color) => {
    setDraftSettings(prev => ({
      ...prev,
      withoutProductColorOverride: { ...prev.withoutProductColorOverride, [pairKey]: color }
    }));
  }, []);

  const EnhancedSettingsModal = () => {
    const featureSections = [
      <Box key="point-appearance">
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
          Point Appearance
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <CustomSlider
              value={draftSettings.pointSize}
              onChange={updateDraftPointSize}
              min={4}
              max={16}
              step={1}
              label="Point Size"
              formatValue={(val) => `${val}px`}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomSlider
              value={draftSettings.opacity}
              onChange={updateDraftOpacity}
              min={0.3}
              max={1}
              step={0.1}
              label="Opacity"
              formatValue={(val) => `${Math.round(val * 100)}%`}
            />
          </Grid>
        </Grid>
      </Box>
    ];

    const colorPairs = allPairs.map((pair) => ({
      key: pair.key,
      label: `${pair.x} vs ${pair.y}`,
      withProductColor: draftSettings.withProductColorOverride[pair.key] || getPointColor(pair.key, "With Product"),
      withoutProductColor: draftSettings.withoutProductColorOverride[pair.key] || getPointColor(pair.key, "Without Product"),
      onWithProductColorChange: (color) => updateDraftWithProductColor(pair.key, color),
      onWithoutProductColorChange: (color) => updateDraftWithoutProductColor(pair.key, color)
    }));

    return (
      <ChartSettingsModal
        open={settingsModalOpen}
        onClose={closeSettingsModal}
        onApply={saveSettings}
        onReset={resetSettings}
        settings={chartSettings}
        draftSettings={draftSettings}
        setDraftSettings={setDraftSettings}
        colorPairs={colorPairs}
        colorOptions={COLORS}
        featureSections={featureSections}
        colorSection={allPairs.length > 0}
        title="Chart Settings"
        description="Customize your visualization appearance"
        minHeight={600}
        maxWidth="lg"
        multiDatasetColors={true}
      />
    );
  };
  
  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: { xs: 1, sm: 2, md: 3 } }} ref={pageRef}>
      <EnhancedSettingsModal />
      
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'primary.main' }}>
            Select X (Independent) Variables
          </Typography>
          <Autocomplete
            id = 'open-multiple-x-axis-btn'
            multiple
            options={availableColumns}
            value={selectedXVars}
            onChange={(_, newValue) => setSelectedXVars(newValue)}
            renderInput={(params) => (
              <DebouncedTextField {...params} label="X Variables" variant="outlined" size="small" />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'success.main' }}>
            Select Y (Dependent) Variables
          </Typography>
          <Autocomplete
            id="open-multiple-y-axis-btn"
            multiple
            options={availableColumns}
            value={selectedYVars}
            onChange={(_, newValue) => setSelectedYVars(newValue)}
            renderInput={(params) => (
              <DebouncedTextField {...params} label="Y Variables" variant="outlined" size="small" />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={4}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'secondary.main' }}>
            Dataset View
          </Typography>
          <ToggleButtonGroup
            value={datasetView}
            exclusive
            onChange={(event, newValue) => { if (newValue) setDatasetView(newValue); }}
            color="primary"
            aria-label="dataset view"
            fullWidth
            orientation="horizontal"
            sx={{
              height: "48px",
              "& .MuiToggleButton-root": {
                textTransform: "none",
                px: 1.5,
                fontSize: "0.875rem",
                border: "1px solid",
                borderColor: "primary.main",
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  }
                }
              },
            }}
          >
            <ToggleButton value="both">Both</ToggleButton>
            <ToggleButton value="withoutProduct">Without Product</ToggleButton>
            <ToggleButton value="withProduct">With Product</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1, bgcolor: 'grey.50' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
            Data Filter
          </Typography>
          <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                id='data-filter-column-select'
                options={availableColumnsForFilter}
                value={filterColumn}
                onChange={(_, v) => setFilterColumn(v || '')}
                renderInput={(params) => (
                  <DebouncedTextField {...params} label="Filter Column" variant="outlined" size="small" />
                )}
                disableClearable={false}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2.5}>
              <DebouncedTextField
                type={columnIsDateTime ? 'datetime-local' : 'number'}
                size="small"
                label={columnIsDateTime ? 'Min (datetime)' : 'Min'}
                value={filterMin}
                onChange={(e) => setFilterMin(e.target.value)}
                disabled={!filterColumn}
                fullWidth
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2.5}>
              <DebouncedTextField
                type={columnIsDateTime ? 'datetime-local' : 'number'}
                size="small"
                label={columnIsDateTime ? 'Max (datetime)' : 'Max'}
                value={filterMax}
                onChange={(e) => setFilterMax(e.target.value)}
                disabled={!filterColumn}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              <Button 
              id='clear-data-filter-btn'
                onClick={resetLocalFilter} 
                variant="outlined" 
                size="small" 
                sx={{ 
                  textTransform: 'none',
                  width: { xs: '100%', md: 'auto' },
                  minWidth: '120px'
                }}
              >
                Reset Filter
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
            Active Variable Pairs
          </Typography>
          <Paper elevation={0} sx={{ 
            maxHeight: 120, 
            overflowY: 'auto', 
            p: 2, 
            bgcolor: 'grey.100', 
            borderRadius: 2, 
            boxShadow: 0 
          }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {allPairs.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Select X and Y variables to see pairs.
                </Typography>
              ) : (
                allPairs.map((pair, idx) => (
                  <FormControlLabel
                    key={pair.key}
                    control={
                      <Checkbox
                        checked={activePairs.includes(pair.key)}
                        onChange={() => {
                          setActivePairs((prev) =>
                            prev.includes(pair.key)
                              ? prev.filter((k) => k !== pair.key)
                              : [...prev, pair.key]
                          );
                        }}
                        sx={{ color: colorMap[pair.key] }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ 
                        color: colorMap[pair.key], 
                        fontWeight: 500,
                        fontSize: '0.875rem'
                      }}>
                        {pair.x} vs {pair.y}
                      </Typography>
                    }
                    sx={{ m: 0, mr: 2, mb: 1 }}
                  />
                ))
              )}
            </Box>
          </Paper>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
        <MuiTooltip title="Download entire page as PNG">
          <Button
            color="primary"
            onClick={downloadPageAsPNG}
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            Download Page
          </Button>
        </MuiTooltip>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        alignItems: 'center', 
        mb: 3, 
        gap: 2, 
        justifyContent: { xs: 'center', md: 'flex-end' },
        flexDirection: { xs: 'column', sm: 'row' }
      }}>
        <Box sx={{ display: 'flex', gap: 1, order: { xs: 2, sm: 1 } }}>
          {/* <ButtonGroup variant="outlined" size="small">
            <MuiTooltip title="Zoom In">
              <Button onClick={zoomIn} sx={{ minWidth: "40px", px: 1 }}>
                <ZoomInIcon fontSize="small" />
              </Button>
            </MuiTooltip>
            <MuiTooltip title="Zoom Out">
              <Button onClick={zoomOut} sx={{ minWidth: "40px", px: 1 }}>
                <ZoomOutIcon fontSize="small" />
              </Button>
            </MuiTooltip>
            <MuiTooltip title="Reset Zoom">
              <Button onClick={resetZoom} sx={{ minWidth: "40px", px: 1 }}>
                <CenterFocusStrongIcon fontSize="small" />
              </Button>
            </MuiTooltip>
          </ButtonGroup>
        </Box> */}
       </Box> 
        <Box sx={{ display: 'flex', gap: 1, order: { xs: 1, sm: 2 }, alignItems: 'center' }}>
          <MuiTooltip title="Chart Settings">
            <Button
              id="settings-button"
              variant="outlined"
              color="primary" 
              onClick={openSettingsModal}
              startIcon={<SettingsIcon />}
              size="small"
              sx={{ 
                textTransform: 'none',
                height: 32,
                border: "1px solid",
                borderColor: "primary.main",
                "&:hover": {
                  backgroundColor: "primary.light",
                  color: "white"
                }
              }}
            >
              Settings
            </Button>
          </MuiTooltip>

          <SaveVisualizationButton 
            elementId="visualization-content" 
            fileNamePrefix="multivariate_scatter"
            variableNames={[...selectedXVars, ...selectedYVars].filter(Boolean)}
          />

          <MuiTooltip title="Download as PNG">
            <Button
              id="multivariate-btn"
              variant="outlined"
              color="primary" 
              onClick={downloadChartAsPNG}
              startIcon={<DownloadIcon />}
              size="small"
              sx={{ 
                textTransform: 'none',
                height: 32,
                border: "1px solid",
                borderColor: "primary.main",
                "&:hover": {
                  backgroundColor: "primary.light",
                  color: "white"
                }
              }}
            >
              Download PNG
            </Button>
          </MuiTooltip>
        </Box>
      </Box>
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2, overflow: 'hidden' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            mb: 3,
            flexDirection: { xs: "column", sm: "row" },
            gap: 1
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
              Multi-Variate Scatter Plot
            </Typography>
            <MuiTooltip title="Reset to Auto Scale">
              {/* <Button 
                onClick={resetAxisRanges} 
                size="small" 
                variant="outlined"
                startIcon={<RefreshIcon />}
                sx={{ textTransform: 'none' }}
              >
                Reset Auto
              </Button> */}
            </MuiTooltip>
          </Box>

          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1, bgcolor: 'grey.50' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}>
                Axis Scale Controls
              </Typography>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ mb: 2, fontWeight: 500, color: "primary.main" }}>
                    X-Axis Range:
                  </Typography>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={5}>
                      <DebouncedTextField
                        type="number"
                        size="small"
                        value={customXRange.min}
                        onChange={(e) => handleXRangeChange("min", e.target.value)}
                        placeholder={autoRanges.xMin.toFixed(2)}
                      />
                    </Grid>
                    <Grid item xs={2} sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        to
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <DebouncedTextField
                        type="number"
                        size="small"
                        value={customXRange.max}
                        onChange={(e) => handleXRangeChange("max", e.target.value)}
                        placeholder={autoRanges.xMax.toFixed(2)}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ mb: 2, fontWeight: 500, color: "success.main" }}>
                    Y-Axis Range:
                  </Typography>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={5}>
                      <DebouncedTextField
                        type="number"
                        size="small"
                        value={customYRange.min}
                        onChange={(e) => handleYRangeChange("min", e.target.value)}
                        placeholder={autoRanges.yMin.toFixed(2)}
                      />
                    </Grid>
                    <Grid item xs={2} sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        to
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <DebouncedTextField
                        type="number"
                        size="small"
                        value={customYRange.max}
                        onChange={(e) => handleYRangeChange("max", e.target.value)}
                        placeholder={autoRanges.yMax.toFixed(2)}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          <Box ref={containerRef} className="abhitech-plot-area" sx={{ 
            width: '100%', 
            height: 500, 
            position: 'relative', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'grey.300'
          }}>
            <svg ref={svgRef} style={{ width: '100%', height: 500, display: 'block', position: 'absolute', top: 0, left: 0, zIndex: 1 }} />
            <canvas
              ref={canvasRef}
              width={containerRef.current ? containerRef.current.offsetWidth : 700}
              height={500}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 500, zIndex: 2, pointerEvents: 'none' }}
            />
            <div
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: 500, 
                zIndex: 3, 
                pointerEvents: 'auto',
                background: 'transparent',
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              onWheel={(e) => {
                e.preventDefault();
                if (zoomRef.current && zoomRectRef.current) {
                  const zoomRect = d3.select(zoomRectRef.current);
                  const rect = zoomRectRef.current.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const scale = e.deltaY > 0 ? 0.9 : 1.1;
                  zoomRect.call(zoomRef.current.scaleBy, scale, [x, y]);
                }
              }}
              onMouseDown={(e) => {
                if (e.button === 0 && zoomRef.current && zoomRectRef.current) {
                  setIsDragging(true);
                  setDragStart({ x: e.clientX, y: e.clientY });
                  e.preventDefault();
                }
              }}
              onMouseMove={(e) => {
                handleCanvasMouseMove(e);
                
                if (isDragging && zoomRef.current && zoomRectRef.current) {
                  const dx = e.clientX - dragStart.x;
                  const dy = e.clientY - dragStart.y;
                  
                  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                    const zoomRect = d3.select(zoomRectRef.current);
                    const currentTransform = d3.zoomTransform(zoomRectRef.current);
                    const newTransform = currentTransform.translate(dx / currentTransform.k, dy / currentTransform.k);
                    zoomRect.call(zoomRef.current.transform, newTransform);
                    setDragStart({ x: e.clientX, y: e.clientY });
                  }
                }
              }}
              onMouseUp={() => {
                setIsDragging(false);
              }}
              onMouseLeave={() => {
                setIsDragging(false);
                handleCanvasMouseOut();
              }}
            />
            <Box sx={{ 
              position: 'absolute', 
              top: 10, 
              right: 20, 
              zIndex: 1000, 
              pointerEvents: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              background: 'rgba(255,255,255,0.95)', 
              p: '4px 10px', 
              borderRadius: '6px', 
              border: '1px solid rgba(0,0,0,0.1)', 
              fontSize: '10px', 
              color: '#666', 
              fontFamily: 'Arial, sans-serif', 
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)' 
            }}>
              <Box sx={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src={logo} alt="Abhitech Logo" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'contain', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
              </Box>
              <Box>
                <Box sx={{ fontSize: '8px', lineHeight: '1' }}>Powered by</Box>
                <Box sx={{ fontSize: '9px', fontWeight: 'bold', color: '#1976d2', lineHeight: '1.1' }}>Abhitech's AbhiStat</Box>
              </Box>
            </Box>
            {tooltip.visible && tooltip.data && (
              <Paper
                elevation={3}
                sx={{
                  position: "absolute",
                  left: Math.min(tooltip.x + 10, 600),
                  top: Math.max(tooltip.y - 10, 10),
                  p: 2,
                  backgroundColor: "background.paper",
                  maxWidth: 300,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "primary.light",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  pointerEvents: "none",
                  zIndex: 1000,
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1, color: getPointColor(tooltip.data.pairKey, tooltip.data.dataset), fontWeight: "bold" }}>
                  {tooltip.data.xLabel} vs {tooltip.data.yLabel} ({tooltip.data.dataset})
                </Typography>
                <Typography variant="body2">X: {tooltip.data.x}</Typography>
                <Typography variant="body2">Y: {tooltip.data.y}</Typography>
              </Paper>
            )}
          </Box>
        </CardContent>
      </Card>

      {allPairs.length > 0 && (
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
              Variable Pairs Legend
            </Typography>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {allPairs.map((pair, idx) => (
                <Grid item xs={12} sm={6} md={4} key={pair.key}>
                  <Card sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    borderRadius: 2, 
                    boxShadow: 0,
                    border: '1px solid',
                    borderColor: 'grey.200'
                  }}>
                    <Typography variant="body2" sx={{ 
                      color: colorMap[pair.key], 
                      fontWeight: 600, 
                      fontSize: '0.9rem', 
                      mb: 1.5 
                    }}>
                      {pair.x} vs {pair.y}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 16, 
                          height: 16, 
                          borderRadius: '50%', 
                          background: getPointColor(pair.key, "With Product"), 
                          border: '2px solid #333', 
                          boxShadow: '0 1px 2px rgba(0,0,0,0.08)' 
                        }} />
                        <Typography variant="body2" sx={{ color: '#333', fontSize: '0.85rem' }}>
                          With Product
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 16, 
                          height: 16, 
                          borderRadius: '50%', 
                          background: getPointColor(pair.key, "Without Product"), 
                          border: '2px solid #333', 
                          boxShadow: '0 1px 2px rgba(0,0,0,0.08)' 
                        }} />
                        <Typography variant="body2" sx={{ color: '#333', fontSize: '0.85rem' }}>
                          Without Product
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {allPoints.length === 0 && (
        <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
          Select at least one X and one Y variable to plot.
        </Alert>
      )}
    </Box>
  );
};

export default MultiVariateScatterPlotTab;