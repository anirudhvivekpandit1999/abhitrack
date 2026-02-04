import { useState, useEffect, useMemo, useRef } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Alert,
    TextField,
    Autocomplete,
    IconButton,
    Tooltip as MuiTooltip,
    ToggleButton,
    ToggleButtonGroup,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    useTheme,
    useMediaQuery,
    Button,
    Switch,
    FormControlLabel,
    Collapse,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import DebouncedTextField from '../DebouncedTextField';
import { ResponsiveContainer, AreaChart, ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import DownloadIcon from '@mui/icons-material/Download';
import PanToolIcon from '@mui/icons-material/PanTool';
import SettingsIcon from '@mui/icons-material/Settings';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BarChartIcon from '@mui/icons-material/BarChart';
import * as d3 from 'd3';
import logo from "../../assets/abhitech-logo.png"
import html2canvas from "html2canvas"
import ChartSettingsModal from '../ChartSettingsModal'
import SaveVisualizationButton from '../SaveVisualizationButton'

const DistributionCurveTab = ({ availableColumns, withProductData, withoutProductData, clientName = '', plantName = '', productName = '' }) => {
    const [selectedColumn, setSelectedColumn] = useState('');
    const [viewMode, setViewMode] = useState('combined');
    const [singleViewType, setSingleViewType] = useState('withProduct');
    
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [showInsights, setShowInsights] = useState(true);
    const [showSummaryCards, setShowSummaryCards] = useState(true);
    
    const [combinedLegendLabels, setCombinedLegendLabels] = useState({
        withProduct: 'With Product',
        withoutProduct: 'Without Product',
    });
    const [combinedXAxisLabel, setCombinedXAxisLabel] = useState('');
    const [combinedYAxisLabel, setCombinedYAxisLabel] = useState('Frequency (%)');
    const [distributionColors, setDistributionColors] = useState({
        withProduct: '#3B82F6',
        withoutProduct: '#EF4444',
    });
    const [barColors, setBarColors] = useState({
        withProduct: '#EF4444',
        withoutProduct: '#3B82F6',
    });

    const [singleLegendLabel, setSingleLegendLabel] = useState('Frequency');
    const [singleXAxisLabel, setSingleXAxisLabel] = useState('');
    const [singleYAxisLabel, setSingleYAxisLabel] = useState('Frequency');
    const [separateLegendLabels, setSeparateLegendLabels] = useState({
        withProduct: 'With Product',
        withoutProduct: 'Without Product',
    });
    const [separateXAxisLabel, setSeparateXAxisLabel] = useState('');
    const [separateYAxisLabel, setSeparateYAxisLabel] = useState('Frequency');
    
    const [showGrid, setShowGrid] = useState(true);
    const [showDataPoints, setShowDataPoints] = useState(false);
    const [showNumberOfPoints, setShowNumberOfPoints] = useState(true);
    const [showAreaChart, setShowAreaChart] = useState(true);
    const [areaOpacity, setAreaOpacity] = useState(0.6);
    const [binCount, setBinCount] = useState(20);
    const [showStatistics, setShowStatistics] = useState(false);
    const [showOutliers, setShowOutliers] = useState(false);

    const [filterColumn, setFilterColumn] = useState('');
    const [filterMin, setFilterMin] = useState('');
    const [filterMax, setFilterMax] = useState('');

    const combinedChartRef = useRef(null);
    const withoutProductChartRef = useRef(null);
    const withProductChartRef = useRef(null);
    const pageRef = useRef(null)

    // Generate custom filename based on project information
    const generateFileName = (visualizationName) => {
        const parts = [];
        if (clientName) parts.push(clientName.replace(/\s+/g, '_'));
        if (plantName) parts.push(plantName.replace(/\s+/g, '_'));
        if (productName) parts.push(productName.replace(/\s+/g, '_'));
        parts.push(visualizationName.replace(/\s+/g, '_'));
        return parts.join('-');
    };

    // Custom bar shape for superimposed bars
    const SuperimposedBar = (props) => {
        if (!showNumberOfPoints) return null;
        
        const { x, y, width, height, payload } = props;
        const withoutCount = payload?.withoutProductCount || 0;
        const withCount = payload?.withProductCount || 0;
        
        if (withoutCount === 0 && withCount === 0) return null;
        
        // Find the maximum count across all data points for proper scaling
        const allData = combinedDistributionPercent || [];
        const maxCountInDataset = Math.max(
            ...allData.map(d => Math.max(d.withoutProductCount || 0, d.withProductCount || 0)),
            1
        );
        
        // Calculate heights based on the maximum value in the dataset
        const withoutHeight = (withoutCount / maxCountInDataset) * height;
        const withHeight = (withCount / maxCountInDataset) * height;
        
        return (
            <g>
                {/* Without Product Bar (behind) */}
                {withoutCount > 0 && (
                    <rect
                        x={x}
                        y={y + height - withoutHeight}
                        width={width}
                        height={withoutHeight}
                        fill={barColors.withoutProduct}
                        fillOpacity={0.6}
                        rx={4}
                        ry={4}
                    />
                )}
                {/* With Product Bar (in front, overlapping) */}
                {withCount > 0 && (
                    <rect
                        x={x}
                        y={y + height - withHeight}
                        width={width}
                        height={withHeight}
                        fill={barColors.withProduct}
                        fillOpacity={0.6}
                        rx={4}
                        ry={4}
                    />
                )}
            </g>
        );
    };

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        if (availableColumns.length > 0) {
            setSelectedColumn(availableColumns[0]);
        }
    }, [availableColumns]);

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
        const syncSelectedColumnName = () => {
            const saved = localStorage.getItem('selectedDistributionColumn');
            setSelectedColumn(saved || '');
        }

        window.addEventListener('selectedDistributionColumnChanged', syncSelectedColumnName);
        
        return () => window.removeEventListener('selectedDistributionColumnChanged', syncSelectedColumnName);
    },[])

    useEffect(()=>{
        const syncViewMode = () => {
            const saved = localStorage.getItem('selectedDistributionViewMode');
            setViewMode(saved || 'combined');
        }

        window.addEventListener('distributionViewModeChanged', syncViewMode);

        return () => window.removeEventListener('distributionViewModeChanged', syncViewMode);
    },[])

    useEffect(()=>{
        const syncDataFilterColumn = () => {
            const saved = localStorage.getItem('dataFilterColumn');
            setFilterColumn(saved || '');

        }

        window.addEventListener('dataFilterColumnChanged', syncDataFilterColumn);
        return () => window.removeEventListener('dataFilterColumnChanged', syncDataFilterColumn);
    },[])



    const isDateTimeColumn = (allRows, columnName) => {
        if (!allRows || allRows.length === 0 || !columnName) return false;
        const sampleValues = allRows
            .slice(0, 10)
            .map((row) => row?.[columnName])
            .filter((val) => val != null);
        if (sampleValues.length === 0) return false;
        const dateTimeRegex = /^\d{4}-\d{2}-\d{2}([\sT]\d{2}:\d{2}:\d{2}(\.\d{3})?)?$/;
        return sampleValues.every((val) => {
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
        
        return (withProductData || []).filter((row) => {
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
        
        return (withoutProductData || []).filter((row) => {
            const raw = row?.[filterColumn];
            if (raw == null) return false;
            const v = parseValue(raw, columnIsDateTime);
            if (v == null) return false;
            if (minVal != null && v < minVal) return false;
            if (maxVal != null && v > maxVal) return false;
            return true;
        });
    }, [withoutProductData, filterColumn, filterMin, filterMax, columnIsDateTime]);

    const resetLocalFilter = () => {
        setFilterColumn('');
        setFilterMin('');
        setFilterMax('');
    };

    useEffect(() => {
        setCombinedXAxisLabel(selectedColumn || '');
        setSingleXAxisLabel(selectedColumn || '');
        setSeparateXAxisLabel(selectedColumn || '');
    }, [selectedColumn]);

    const calculateDistributionStats = (data) => {
        if (!data || data.length === 0) return null;

        const values = data.map(row => parseFloat(row[selectedColumn])).filter(val => !isNaN(val));
        if (values.length === 0) return null;

        const mean = d3.mean(values);
        const median = d3.median(values);
        const std = d3.deviation(values);
        const min = d3.min(values);
        const max = d3.max(values);
        const q1 = d3.quantile(values, 0.25);
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1;

        return {
            count: values.length,
            mean: mean.toFixed(2),
            median: median.toFixed(2),
            std: std.toFixed(2),
            min: min.toFixed(2),
            max: max.toFixed(2),
            q1: q1.toFixed(2),
            q3: q3.toFixed(2),
            iqr: iqr.toFixed(2),
            range: (max - min).toFixed(2)
        };
    };

    const calculateSkewness = (data) => {
        if (!data || data.length === 0) return null;

        const values = data.map(row => parseFloat(row[selectedColumn])).filter(val => !isNaN(val));
        if (values.length < 3) return null;

        const mean = d3.mean(values);
        const std = d3.deviation(values);
        
        const skewness = values.reduce((sum, val) => {
            return sum + Math.pow((val - mean) / std, 3);
        }, 0) / values.length;

        return {
            value: skewness.toFixed(3),
            interpretation: Math.abs(skewness) < 0.5 ? 'Symmetric' : 
                           skewness > 0 ? 'Right-skewed' : 'Left-skewed'
        };
    };

    const calculateKurtosis = (data) => {
        if (!data || data.length === 0) return null;

        const values = data.map(row => parseFloat(row[selectedColumn])).filter(val => !isNaN(val));
        if (values.length < 4) return null;

        const mean = d3.mean(values);
        const std = d3.deviation(values);
        
        const kurtosis = values.reduce((sum, val) => {
            return sum + Math.pow((val - mean) / std, 4);
        }, 0) / values.length - 3;

        return {
            value: kurtosis.toFixed(3),
            interpretation: Math.abs(kurtosis) < 0.5 ? 'Normal' : 
                           kurtosis > 0 ? 'Heavy-tailed' : 'Light-tailed'
        };
    };

    const detectOutliers = (data, threshold = 1.5) => {
        if (!data || data.length === 0) return [];

        const values = data.map(row => parseFloat(row[selectedColumn])).filter(val => !isNaN(val));
        if (values.length < 4) return [];

        const q1 = d3.quantile(values, 0.25);
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1;
        const lowerBound = q1 - threshold * iqr;
        const upperBound = q3 + threshold * iqr;

        return values.filter(val => val < lowerBound || val > upperBound);
    };

    const assessDataQuality = (data) => {
        if (!data || data.length === 0) return null;

        const values = data.map(row => parseFloat(row[selectedColumn])).filter(val => !isNaN(val));
        const totalCount = data.length;
        const validCount = values.length;
        const outliers = detectOutliers(data);
        
        const completeness = (validCount / totalCount) * 100;
        const outlierPercentage = (outliers.length / validCount) * 100;
        
        let quality = 'Excellent';
        let score = 100;

        if (completeness < 80) {
            quality = 'Poor';
            score -= 40;
        } else if (completeness < 95) {
            quality = 'Fair';
            score -= 20;
        }

        if (outlierPercentage > 10) {
            quality = 'Poor';
            score -= 30;
        } else if (outlierPercentage > 5) {
            quality = 'Fair';
            score -= 15;
        }

        return {
            quality,
            score: Math.max(0, score),
            completeness: completeness.toFixed(1),
            outlierPercentage: outlierPercentage.toFixed(1),
            validCount,
            totalCount
        };
    };

    const combinedMinMax = useMemo(() => {
        if (!selectedColumn || !filteredWithProductData || !filteredWithoutProductData) {
            return { min: 0, max: 0 };
        }

        const withProductValues = filteredWithProductData
            .map(row => parseFloat(row[selectedColumn]))
            .filter(value => !isNaN(value));

        const withoutProductValues = filteredWithoutProductData
            .map(row => parseFloat(row[selectedColumn]))
            .filter(value => !isNaN(value));

        const allValues = [...withProductValues, ...withoutProductValues];
        
        if (allValues.length === 0) {
            return { min: 0, max: 0 };
        }

        return {
            min: Math.min(...allValues),
            max: Math.max(...allValues)
        };
    }, [filteredWithProductData, filteredWithoutProductData, selectedColumn]);

    const processDataForDistribution = (data, columnName, globalMin = null, globalMax = null) => {
        if (!data || data.length === 0 || !columnName) return [];

        const values = data
            .map(row => parseFloat(row[columnName]))
            .filter(value => !isNaN(value));

        if (values.length === 0) return [];

        const min = globalMin !== null ? globalMin : Math.min(...values);
        const max = globalMax !== null ? globalMax : Math.max(...values);

        if (min === max) {
            return [{
                binMiddle: min.toFixed(2),
                count: values.length,
                binRange: `${min.toFixed(2)} - ${min.toFixed(2)}`
            }];
        }

        const dynamicBinCount = Math.min(binCount, Math.ceil(Math.sqrt(values.length)));
        const binWidth = (max - min) / dynamicBinCount;
        const bins = Array(dynamicBinCount).fill(0);

        values.forEach(value => {
            const binIndex = Math.min(
                Math.floor((value - min) / binWidth),
                dynamicBinCount - 1
            );
            bins[binIndex]++;
        });

        return bins.map((count, index) => {
            const binStart = min + index * binWidth;
            const binEnd = index === dynamicBinCount - 1 ? max : binStart + binWidth;
            const binMiddle = (binStart + binEnd) / 2;
            const actualBinEnd = binEnd > binStart ? binEnd : binStart + binWidth;
            const actualBinMiddle = binMiddle > 0 ? binMiddle : (binStart + actualBinEnd) / 2;
            
            return {
                binMiddle: actualBinMiddle.toFixed(2),
                count,
                binRange: `${binStart.toFixed(2)} - ${actualBinEnd.toFixed(2)}`
            };
        }).filter(bin => parseFloat(bin.binMiddle) > 0);
    };

    const withProductDistribution = useMemo(() => {
        return processDataForDistribution(filteredWithProductData, selectedColumn, combinedMinMax.min, combinedMinMax.max);
    }, [filteredWithProductData, selectedColumn, combinedMinMax]);

    const withoutProductDistribution = useMemo(() => {
        return processDataForDistribution(filteredWithoutProductData, selectedColumn, combinedMinMax.min, combinedMinMax.max);
    }, [filteredWithoutProductData, selectedColumn, combinedMinMax]);

    const totalWithProduct = useMemo(() => withProductDistribution.reduce((sum, bin) => sum + bin.count, 0), [withProductDistribution]);
    const totalWithoutProduct = useMemo(() => withoutProductDistribution.reduce((sum, bin) => sum + bin.count, 0), [withoutProductDistribution]);

    const withProductStats = useMemo(() => {
        return calculateDistributionStats(filteredWithProductData);
    }, [filteredWithProductData, selectedColumn, filterColumn, filterMin, filterMax]);

    const withoutProductStats = useMemo(() => {
        return calculateDistributionStats(filteredWithoutProductData);
    }, [filteredWithoutProductData, selectedColumn, filterColumn, filterMin, filterMax]);

    const withProductSkewness = useMemo(() => {
        return calculateSkewness(filteredWithProductData);
    }, [filteredWithProductData, selectedColumn, filterColumn, filterMin, filterMax]);

    const withoutProductSkewness = useMemo(() => {
        return calculateSkewness(filteredWithoutProductData);
    }, [filteredWithoutProductData, selectedColumn, filterColumn, filterMin, filterMax]);

    const withProductQuality = useMemo(() => {
        return assessDataQuality(filteredWithProductData);
    }, [filteredWithProductData, selectedColumn, filterColumn, filterMin, filterMax]);

    const withoutProductQuality = useMemo(() => {
        return assessDataQuality(filteredWithoutProductData);
    }, [filteredWithoutProductData, selectedColumn, filterColumn, filterMin, filterMax]);

    const combinedInsights = useMemo(() => {
        const allData = [...(filteredWithProductData || []), ...(filteredWithoutProductData || [])];
        return {
            stats: calculateDistributionStats(allData),
            skewness: calculateSkewness(allData),
            kurtosis: calculateKurtosis(allData),
            outliers: detectOutliers(allData),
            quality: assessDataQuality(allData)
        };
    }, [filteredWithProductData, filteredWithoutProductData, selectedColumn, filterColumn, filterMin, filterMax]);

    const combinedDistributionPercent = useMemo(() => {
        if (!withProductDistribution.length || !withoutProductDistribution.length) return [];
        
        const maxLength = Math.max(withProductDistribution.length, withoutProductDistribution.length);
        
        return Array.from({ length: maxLength }, (_, index) => {
            const withProductBin = withProductDistribution[index];
            const withoutProductBin = withoutProductDistribution[index];
            
            if (!withProductBin && !withoutProductBin) return null;
            
            const withPct = totalWithProduct && withProductBin ? (withProductBin.count / totalWithProduct) * 100 : 0;
            const withoutPct = totalWithoutProduct && withoutProductBin ? (withoutProductBin.count / totalWithoutProduct) * 100 : 0;
            
            const validBin = withProductBin || withoutProductBin;
            
            return {
                binMiddle: validBin.binMiddle,
                withProductPercent: withPct,
                withoutProductPercent: withoutPct,
                withProductCount: withProductBin ? withProductBin.count : 0,
                withoutProductCount: withoutProductBin ? withoutProductBin.count : 0,
                totalCount: (withProductBin ? withProductBin.count : 0) + (withoutProductBin ? withoutProductBin.count : 0),
                binRange: validBin.binRange,
            };
        }).filter(bin => bin !== null && bin.binMiddle !== '0' && bin.binMiddle !== '0.00');
    }, [withProductDistribution, withoutProductDistribution, totalWithProduct, totalWithoutProduct]);

    const WatermarkContent = () => (
        <div style={{
            position: 'absolute',
            top: isMobile ? '5px' : '0px',
            right: isMobile ? '10px' : '50px',
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '4px' : '6px',
            background: 'rgba(255, 255, 255, 0.95)',
            padding: isMobile ? '2px 6px' : '4px 10px',
            borderRadius: '4px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            fontSize: isMobile ? '8px' : '10px',
            color: '#666',
            fontFamily: 'Arial, sans-serif',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            zIndex: 1000,
            pointerEvents: 'none'
        }}>
            <div style={{
                width: isMobile ? '16px' : '22px',
                height: isMobile ? '16px' : '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}>
                <img
                    src={logo}
                    alt="Abhitech Logo"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: '50%',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}
                />
            </div>
            <div>
                <div style={{ fontSize: isMobile ? '6px' : '8px', lineHeight: '1' }}>Powered by</div>
                <div style={{ 
                    fontSize: isMobile ? '7px' : '9px', 
                    fontWeight: 'bold', 
                    color: '#1976d2',
                    lineHeight: '1.1'
                }}>
                    Abhitech's AbhiStat
                </div>
            </div>
        </div>
    );

    const downloadChartAsPNG = (chartRef, title) => {
        if (!chartRef.current) return;

        const chartContainer = chartRef.current;
        const svgElement = chartContainer.querySelector('svg');
        if (!svgElement) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const svgRect = svgElement.getBoundingClientRect();
        const scaleFactor = 2;
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
                bgRect.setAttribute("fill", "rgba(255,255,255,0.95)");
                bgRect.setAttribute("stroke", "rgba(0,0,0,0.1)");
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
                ctx.fillText(`${title} (${selectedColumn})`, canvas.width / 2, 30 * scaleFactor);

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

                const downloadLink = document.createElement('a');
                const fileName = generateFileName(`DistributionCurve_${selectedColumn}`);
                downloadLink.download = `${fileName}.png`;
                downloadLink.href = canvas.toDataURL('image/png');
                downloadLink.click();
            };

            img.onerror = () => {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = 'black';
                ctx.font = `${16 * scaleFactor}px Arial`;
                ctx.textAlign = 'center';
                ctx.fillText(`${title} (${selectedColumn})`, canvas.width / 2, 30 * scaleFactor);

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

                const downloadLink = document.createElement('a');
                const fileName = generateFileName(`DistributionCurve_${selectedColumn}`);
                downloadLink.download = `${fileName}.png`;
                downloadLink.href = canvas.toDataURL('image/png');
                downloadLink.click();
            };

            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        });
    };

    const SummaryCards = () => (
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            <Box 
                sx={{ 
                    p: 2, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    borderBottom: showSummaryCards ? '1px solid' : 'none',
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => setShowSummaryCards(!showSummaryCards)}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AnalyticsIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 500, color: 'primary.main' }}>
                        Distribution Summary
                    </Typography>
                </Box>
                <IconButton size="small" sx={{ transform: showSummaryCards ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                    <ExpandMoreIcon />
                </IconButton>
            </Box>
            <Collapse in={showSummaryCards} timeout={300} easing="ease-in-out">
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ 
                                height: '100%', 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white'
                            }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <AnalyticsIcon sx={{ mr: 1, fontSize: 20 }} />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            Total Data Points
                                        </Typography>
                                    </Box>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        {combinedInsights.stats ? combinedInsights.stats.count : 0}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                        {filteredWithProductData?.length || 0} with product, {filteredWithoutProductData?.length || 0} without
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ 
                                height: '100%', 
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                color: 'white'
                            }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <TrendingUpIcon sx={{ mr: 1, fontSize: 20 }} />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            Distribution Shape
                                        </Typography>
                                    </Box>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        {combinedInsights.skewness ? combinedInsights.skewness.interpretation.split('-')[0] : 'N/A'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                        {combinedInsights.skewness ? combinedInsights.skewness.value : 'N/A'} skewness
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ 
                                height: '100%', 
                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                color: 'white'
                            }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <BarChartIcon sx={{ mr: 1, fontSize: 20 }} />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            Tail Behavior
                                        </Typography>
                                    </Box>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        {combinedInsights.kurtosis ? combinedInsights.kurtosis.interpretation.split('-')[0] : 'N/A'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                        {combinedInsights.kurtosis ? combinedInsights.kurtosis.value : 'N/A'} kurtosis
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ 
                                height: '100%', 
                                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                color: 'white'
                            }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <InfoIcon sx={{ mr: 1, fontSize: 20 }} />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            Data Quality
                                        </Typography>
                                    </Box>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        {combinedInsights.quality ? combinedInsights.quality.score : 'N/A'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                        {combinedInsights.quality ? combinedInsights.quality.quality : 'N/A'} quality score
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </CardContent>
            </Collapse>
        </Card>
    );

    const InsightsPanel = () => (
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2, border: '1px solid', borderColor: 'primary.light' }}>
            <Box 
                sx={{ 
                    p: 2, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    borderBottom: showInsights ? '1px solid' : 'none',
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => setShowInsights(!showInsights)}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AnalyticsIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 500, color: 'primary.main' }}>
                        Distribution Analysis
                    </Typography>
                </Box>
                <IconButton size="small" sx={{ transform: showInsights ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                    <ExpandMoreIcon />
                </IconButton>
            </Box>
            <Collapse in={showInsights} timeout={300} easing="ease-in-out">
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'success.main' }}>
                                With Product Analysis
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemIcon>
                                        <TrendingUpIcon color="success" />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="Mean"
                                        secondary={withProductStats ? withProductStats.mean : 'N/A'}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <BarChartIcon color="success" />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="Standard Deviation"
                                        secondary={withProductStats ? withProductStats.std : 'N/A'}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <InfoIcon color="success" />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="Skewness"
                                        secondary={withProductSkewness ? `${withProductSkewness.value} (${withProductSkewness.interpretation})` : 'N/A'}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <AnalyticsIcon color="success" />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="Data Quality"
                                        secondary={withProductQuality ? `${withProductQuality.quality} (${withProductQuality.score}/100)` : 'N/A'}
                                    />
                                </ListItem>
                            </List>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'error.main' }}>
                                Without Product Analysis
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemIcon>
                                        <TrendingUpIcon color="error" />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="Mean"
                                        secondary={withoutProductStats ? withoutProductStats.mean : 'N/A'}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <BarChartIcon color="error" />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="Standard Deviation"
                                        secondary={withoutProductStats ? withoutProductStats.std : 'N/A'}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <InfoIcon color="error" />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="Skewness"
                                        secondary={withoutProductSkewness ? `${withoutProductSkewness.value} (${withoutProductSkewness.interpretation})` : 'N/A'}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <AnalyticsIcon color="error" />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="Data Quality"
                                        secondary={withoutProductQuality ? `${withoutProductQuality.quality} (${withoutProductQuality.score}/100)` : 'N/A'}
                                    />
                                </ListItem>
                            </List>
                        </Grid>
                    </Grid>
                    
                    {combinedInsights.outliers && combinedInsights.outliers.length > 0 && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'warning.dark' }}>
                                ⚠️ Outlier Detection
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'warning.dark' }}>
                                {combinedInsights.outliers.length} outliers detected using IQR method (1.5 × IQR threshold)
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Collapse>
        </Card>
    );

    const [draftSettings, setDraftSettings] = useState(null)

    const openSettingsModal = () => {
      setDraftSettings({
        showGrid,
        showStatistics,
        showOutliers,
        showDataPoints,
        areaOpacity,
        binCount,
        combinedLegendLabels: { ...combinedLegendLabels },
        combinedXAxisLabel,
        combinedYAxisLabel,
        distributionColors: { ...distributionColors },
        barColors: { ...barColors },
        singleLegendLabel,
        singleXAxisLabel,
        singleYAxisLabel,
        separateLegendLabels: { ...separateLegendLabels },
        separateXAxisLabel,
        separateYAxisLabel,
      })
      setSettingsModalOpen(true)
    }

    const handleSettingsModalClose = () => {
      setSettingsModalOpen(false)
      setDraftSettings(null)
    }

    const handleSettingsSave = () => {
      if (!draftSettings) return
      setShowGrid(draftSettings.showGrid)
      setShowStatistics(draftSettings.showStatistics)
      setShowOutliers(draftSettings.showOutliers)
      setShowDataPoints(draftSettings.showDataPoints)
      setAreaOpacity(draftSettings.areaOpacity)
      setBinCount(draftSettings.binCount)
      setCombinedLegendLabels({ ...draftSettings.combinedLegendLabels })
      setCombinedXAxisLabel(draftSettings.combinedXAxisLabel)
      setCombinedYAxisLabel(draftSettings.combinedYAxisLabel)
      setDistributionColors({ ...draftSettings.distributionColors })
      setBarColors({ ...draftSettings.barColors })
      setSingleLegendLabel(draftSettings.singleLegendLabel)
      setSingleXAxisLabel(draftSettings.singleXAxisLabel)
      setSingleYAxisLabel(draftSettings.singleYAxisLabel)
      setSeparateLegendLabels({ ...draftSettings.separateLegendLabels })
      setSeparateXAxisLabel(draftSettings.separateXAxisLabel)
      setSeparateYAxisLabel(draftSettings.separateYAxisLabel)
      setSettingsModalOpen(false)
      setDraftSettings(null)
    }
    
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

    const SettingsModal = () => {
      const featureSections = [
        <Box key="chart-features">
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
            Chart Features
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!draftSettings?.showGrid}
                    onChange={e => setDraftSettings(ds => ({ ...ds, showGrid: e.target.checked }))}
                  />
                }
                label="Show Grid"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!draftSettings?.showStatistics}
                    onChange={e => setDraftSettings(ds => ({ ...ds, showStatistics: e.target.checked }))}
                  />
                }
                label="Show Statistics"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!draftSettings?.showOutliers}
                    onChange={e => setDraftSettings(ds => ({ ...ds, showOutliers: e.target.checked }))}
                  />
                }
                label="Highlight Outliers"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!draftSettings?.showDataPoints}
                    onChange={e => setDraftSettings(ds => ({ ...ds, showDataPoints: e.target.checked }))}
                  />
                }
                label="Show Data Points"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomSlider
                value={draftSettings?.areaOpacity ?? 0.6}
                onChange={(value) => setDraftSettings(ds => ({ ...ds, areaOpacity: value }))}
                min={0}
                max={1}
                step={0.1}
                label="Area Opacity"
                formatValue={(val) => `${Math.round(val * 100)}%`}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomSlider
                value={draftSettings?.binCount ?? 20}
                onChange={(value) => setDraftSettings(ds => ({ ...ds, binCount: value }))}
                min={5}
                max={50}
                step={5}
                label="Bin Count"
                formatValue={(val) => `${val}`}
              />
            </Grid>
          </Grid>
        </Box>,
        <Box key="combined-labels">
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
            Combined View Labels
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
                  With Product Legend
                </Typography>
                <DebouncedTextField
                  value={draftSettings?.combinedLegendLabels?.withProduct || ''}
                  onChange={e => setDraftSettings(ds => ({ ...ds, combinedLegendLabels: { ...ds.combinedLegendLabels, withProduct: e.target.value } }))}
                  size="small"
                  fullWidth
                  placeholder="Enter legend label"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
                  Without Product Legend
                </Typography>
                <DebouncedTextField
                  value={draftSettings?.combinedLegendLabels?.withoutProduct || ''}
                  onChange={e => setDraftSettings(ds => ({ ...ds, combinedLegendLabels: { ...ds.combinedLegendLabels, withoutProduct: e.target.value } }))}
                  size="small"
                  fullWidth
                  placeholder="Enter legend label"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
                  X Axis Label
                </Typography>
                <DebouncedTextField
                  value={draftSettings?.combinedXAxisLabel || ''}
                  onChange={e => setDraftSettings(ds => ({ ...ds, combinedXAxisLabel: e.target.value }))}
                  size="small"
                  fullWidth
                  placeholder="Enter X axis label"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
                  Y Axis Label
                </Typography>
                <DebouncedTextField
                  value={draftSettings?.combinedYAxisLabel || ''}
                  onChange={e => setDraftSettings(ds => ({ ...ds, combinedYAxisLabel: e.target.value }))}
                  size="small"
                  fullWidth
                  placeholder="Enter Y axis label"
                />
              </Box>
            </Grid>
          </Grid>
        </Box>,
        <Box key="separate-labels">
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
            Separate View Labels
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
                  With Product Legend
                </Typography>
                <DebouncedTextField
                  value={draftSettings?.separateLegendLabels?.withProduct || ''}
                  onChange={e => setDraftSettings(ds => ({ ...ds, separateLegendLabels: { ...ds.separateLegendLabels, withProduct: e.target.value } }))}
                  size="small"
                  fullWidth
                  placeholder="Enter legend label"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
                  Without Product Legend
                </Typography>
                <DebouncedTextField
                  value={draftSettings?.separateLegendLabels?.withoutProduct || ''}
                  onChange={e => setDraftSettings(ds => ({ ...ds, separateLegendLabels: { ...ds.separateLegendLabels, withoutProduct: e.target.value } }))}
                  size="small"
                  fullWidth
                  placeholder="Enter legend label"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
                  X Axis Label
                </Typography>
                <DebouncedTextField
                  value={draftSettings?.separateXAxisLabel || ''}
                  onChange={e => setDraftSettings(ds => ({ ...ds, separateXAxisLabel: e.target.value }))}
                  size="small"
                  fullWidth
                  placeholder="Enter X axis label"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
                  Y Axis Label
                </Typography>
                <DebouncedTextField
                  value={draftSettings?.separateYAxisLabel || ''}
                  onChange={e => setDraftSettings(ds => ({ ...ds, separateYAxisLabel: e.target.value }))}
                  size="small"
                  fullWidth
                  placeholder="Enter Y axis label"
                />
              </Box>
            </Grid>
          </Grid>
        </Box>,
        <Box key="single-labels">
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
            Single View Labels
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
                  Legend Label
                </Typography>
                <DebouncedTextField
                  value={draftSettings?.singleLegendLabel || ''}
                  onChange={e => setDraftSettings(ds => ({ ...ds, singleLegendLabel: e.target.value }))}
                  size="small"
                  fullWidth
                  placeholder="Enter legend label"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
                  X Axis Label
                </Typography>
                <DebouncedTextField
                  value={draftSettings?.singleXAxisLabel || ''}
                  onChange={e => setDraftSettings(ds => ({ ...ds, singleXAxisLabel: e.target.value }))}
                  size="small"
                  fullWidth
                  placeholder="Enter X axis label"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
                  Y Axis Label
                </Typography>
                <DebouncedTextField
                  value={draftSettings?.singleYAxisLabel || ''}
                  onChange={e => setDraftSettings(ds => ({ ...ds, singleYAxisLabel: e.target.value }))}
                  size="small"
                  fullWidth
                  placeholder="Enter Y axis label"
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      ];

      const colorPairs = [
        {
          key: 'withProduct',
          value: draftSettings?.distributionColors?.withProduct || '#3B82F6',
          onChange: (color) => setDraftSettings(ds => ({ ...ds, distributionColors: { ...ds.distributionColors, withProduct: color } })),
          label: 'With Product Area Color'
        },
        {
          key: 'withoutProduct',
          value: draftSettings?.distributionColors?.withoutProduct || '#EF4444',
          onChange: (color) => setDraftSettings(ds => ({ ...ds, distributionColors: { ...ds.distributionColors, withoutProduct: color } })),
          label: 'Without Product Area Color'
        },
        {
          key: 'withProductBar',
          value: draftSettings?.barColors?.withProduct || '#EF4444',
          onChange: (color) => setDraftSettings(ds => ({ ...ds, barColors: { ...ds.barColors, withProduct: color } })),
          label: 'With Product Bar Color'
        },
        {
          key: 'withoutProductBar',
          value: draftSettings?.barColors?.withoutProduct || '#3B82F6',
          onChange: (color) => setDraftSettings(ds => ({ ...ds, barColors: { ...ds.barColors, withoutProduct: color } })),
          label: 'Without Product Bar Color'
        }
      ];

      return (
        <ChartSettingsModal
          open={settingsModalOpen}
          onClose={handleSettingsModalClose}
          onApply={handleSettingsSave}
          onReset={() => setDraftSettings(null)}
          settings={null}
          draftSettings={draftSettings}
          setDraftSettings={setDraftSettings}
          colorPairs={colorPairs}
          colorOptions={['#3B82F6', '#EF4444', '#2196f3', '#ff9800', '#9c27b0', '#00bcd4', '#e91e63', '#607d8b', '#ffc107', '#3f51b5', '#6B7280', '#9CA3AF', '#4B5563', '#D1D5DB', '#374151', '#111827']}
          featureSections={featureSections}
          colorSection={true}
          title="Chart Settings"
          description="Customize your distribution curve appearance"
          minHeight={600}
          maxWidth="md"
        />
      );
    };

    const renderCombinedChart = () => {
        if (!combinedDistributionPercent || combinedDistributionPercent.length === 0) {
            return (
                <Alert severity="info" sx={{ width: '100%', mx: { xs: 1, sm: 0 } }}>
                    No data available for visualization
                </Alert>
            );
        }
        return (
            <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 2 }}>
                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                    <Box sx={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        mb: 3, 
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 2 
                    }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 600,
                                color: "primary.main",
                                fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
                                textAlign: { xs: "center", sm: "left" }
                            }}
                        >
                            Combined Distribution Curves
                        </Typography>

                        <Box sx={{ 
                            display: "flex", 
                            gap: 1, 
                            alignItems: "center", 
                            flexWrap: "wrap",
                            justifyContent: { xs: "center", sm: "flex-end" }
                        }}>
                            {/* <FormControlLabel
                                control={
                                    <Switch
                                        checked={showNumberOfPoints}
                                        onChange={(e) => setShowNumberOfPoints(e.target.checked)}
                                        size="small"
                                    />
                                }
                                label="Number of Points"
                                sx={{ mr: 1 }}
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={showAreaChart}
                                        onChange={(e) => setShowAreaChart(e.target.checked)}
                                        size="small"
                                    />
                                }
                                label="Show Area Chart"
                                sx={{ mr: 1 }}
                            /> */}
                            
                            <MuiTooltip title="Chart Settings">
                                <Button
                                id='settings-button'
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
                                fileNamePrefix="distribution_curve"
                                variableNames={selectedColumn}
                            />

                            <MuiTooltip title="Download as PNG">
                                <Button
                                id='download-visualization-btn'
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => downloadChartAsPNG(combinedChartRef, 'Combined_Distribution')}
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

                    <Box sx={{ mb: 3 }}>
                        <Alert severity="info" sx={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 1,
                            borderRadius: 2,
                            fontSize: { xs: "0.8rem", sm: "0.875rem" }
                        }}>
                            <PanToolIcon fontSize="small" />
                            <Typography variant="body2">
                                Interactive distribution curves with customizable bins, colors, and statistical analysis.
                            </Typography>
                        </Alert>
                    </Box>

                    <Card sx={{ borderRadius: 2, boxShadow: 1, overflow: 'hidden', border: '1px solid', borderColor: 'grey.300' }}>
                        <CardContent sx={{ p: 0 }}>
                            <div ref={combinedChartRef} className="abhitech-plot-area" style={{
                                width: '100%',
                                height: isMobile ? 280 : isTablet ? 320 : 350,
                                position: 'relative'
                            }}>
                                <ResponsiveContainer width="100%" height="100%" key={`combined-${showNumberOfPoints}`}>
                                    <ComposedChart
                                        data={combinedDistributionPercent}
                                        margin={{
                                            top: 10,
                                            right: isMobile ? 50 : 60,
                                            left: isMobile ? 10 : 20,
                                            bottom: isMobile ? 60 : 70
                                        }}
                                        barCategoryGap="10%"
                                        barGap={-30}
                                        maxBarSize={30}
                                    >
                                        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                                        <XAxis
                                            dataKey="binMiddle"
                                            label={{
                                                value: combinedXAxisLabel,
                                                position: 'insideBottom',
                                                offset: isMobile ? -40 : -30,
                                                style: { fontSize: isMobile ? '12px' : '14px', fill: '#666' }
                                            }}
                                            tick={{ fontSize: isMobile ? 10 : 12 }}
                                        />
                                        <YAxis
                                            yAxisId="left"
                                            label={{
                                                value: combinedYAxisLabel,
                                                angle: -90,
                                                position: 'insideLeft',
                                                offset: -5,
                                                style: { fontSize: isMobile ? '12px' : '14px', fill: '#666' }
                                            }}
                                            tickFormatter={v => `${v.toFixed(1)}%`}
                                            tick={{ fontSize: isMobile ? 10 : 12 }}
                                        />
                                        {showNumberOfPoints ? (
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                label={{
                                                    value: 'Number of Points',
                                                    angle: 90,
                                                    position: 'insideRight',
                                                    offset: -5,
                                                    style: { fontSize: isMobile ? '12px' : '14px', fill: '#666' }
                                                }}
                                                tick={{ fontSize: isMobile ? 10 : 12 }}
                                            />
                                        ) : (
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                tick={false}
                                                tickLine={false}
                                                axisLine={false}
                                                width={0}
                                            />
                                        )}
                                        <Tooltip
                                            content={({ active, payload, label }) => {
                                                if (!active || !payload || !payload.length) return null;
                                                
                                                const data = payload[0]?.payload;
                                                if (!data) return null;
                                                
                                                return (
                                                    <div style={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                        border: '1px solid #ccc',
                                                        borderRadius: '4px',
                                                        padding: '8px',
                                                        fontSize: isMobile ? '12px' : '14px',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}>
                                                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                                            {combinedXAxisLabel}: {label}
                                                        </div>
                                                        
                                                        {showAreaChart && (
                                                            <>
                                                                {data.withoutProductPercent > 0 && (
                                                                    <div style={{ color: distributionColors.withoutProduct }}>
                                                                        {combinedLegendLabels.withoutProduct}: {data.withoutProductPercent.toFixed(2)}% ({data.withoutProductCount} points)
                                                                    </div>
                                                                )}
                                                                {data.withProductPercent > 0 && (
                                                                    <div style={{ color: distributionColors.withProduct }}>
                                                                        {combinedLegendLabels.withProduct}: {data.withProductPercent.toFixed(2)}% ({data.withProductCount} points)
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                        
                                                        {showNumberOfPoints && (
                                                            <>
                                                                {data.withoutProductCount > 0 && (
                                                                    <div style={{ color: barColors.withoutProduct }}>
                                                                        Number of Points (Without Product): {data.withoutProductCount}
                                                                    </div>
                                                                )}
                                                                {data.withProductCount > 0 && (
                                                                    <div style={{ color: barColors.withProduct }}>
                                                                        Number of Points (With Product): {data.withProductCount}
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                        
                                                        <div style={{ marginTop: '4px', fontSize: '11px', color: '#666' }}>
                                                            Range: {data.binRange}
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                        />
                                        <Legend
                                            verticalAlign="top"
                                            height={36}
                                            align="left"
                                            wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                                            payload={[
                                                ...(showAreaChart ? [
                                                    { value: combinedLegendLabels.withoutProduct, type: 'square', color: distributionColors.withoutProduct, id: 'withoutProductPercent' },
                                                    { value: combinedLegendLabels.withProduct, type: 'square', color: distributionColors.withProduct, id: 'withProductPercent' },
                                                ] : []),
                                                ...(showNumberOfPoints ? [
                                                    { value: 'Number of Points (Without Product)', type: 'square', color: barColors.withoutProduct, id: 'withoutProductCount' },
                                                    { value: 'Number of Points (With Product)', type: 'square', color: barColors.withProduct, id: 'withProductCount' },
                                                ] : [])
                                            ]}
                                        />
                                        <Area
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="withoutProductPercent"
                                            stackId="1"
                                            stroke={distributionColors.withoutProduct}
                                            fill={distributionColors.withoutProduct}
                                            fillOpacity={areaOpacity}
                                            name={combinedLegendLabels.withoutProduct}
                                            dot={showDataPoints ? { r: 3, fill: distributionColors.withoutProduct } : false}
                                            hide={!showAreaChart}
                                        />
                                        <Area
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="withProductPercent"
                                            stackId="2"
                                            stroke={distributionColors.withProduct}
                                            fill={distributionColors.withProduct}
                                            fillOpacity={areaOpacity}
                                            name={combinedLegendLabels.withProduct}
                                            dot={showDataPoints ? { r: 3, fill: distributionColors.withProduct } : false}
                                            hide={!showAreaChart}
                                        />
                                        <Bar
                                            yAxisId="right"
                                            dataKey="withoutProductCount"
                                            fill="transparent"
                                            name="Number of Points"
                                            hide={!showNumberOfPoints}
                                            isAnimationActive={false}
                                            barSize={30}
                                            shape={SuperimposedBar}

                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                                <WatermarkContent />
                            </div>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        );
    };

    const renderDistributionChart = (data, title, color, chartRef, legendLabel = 'Frequency', xAxisLabel = null, yAxisLabel = 'Frequency', barColor = '#3B82F6') => {
        if (!data || data.length === 0) {
            return (
                <Alert severity="info" sx={{ width: '100%', mx: { xs: 1, sm: 0 } }}>
                    No data available for visualization
                </Alert>
            );
        }

        const effectiveXAxisLabel = xAxisLabel || selectedColumn;
        const effectiveYAxisLabel = yAxisLabel;

        return (
            <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 2 }}>
                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 500,
                                color: "primary.main",
                                fontSize: { xs: "1rem", md: "1.25rem" },
                            }}
                        >
                            {title}
                        </Typography>

                        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                                <MuiTooltip title="Chart Settings">
                                    <Button
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
                                    fileNamePrefix="distribution_curve" 
                                />

                                <MuiTooltip title="Download as PNG">
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => downloadChartAsPNG(chartRef, title)}
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

                    <Box sx={{ mb: 2 }}>
                        <Alert severity="info" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <PanToolIcon fontSize="small" />
                            <Typography variant="body2" sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}>
                                Interactive distribution curve with customizable bins, colors, and statistical analysis.
                            </Typography>
                        </Alert>
                    </Box>

                    <div ref={chartRef} className="abhitech-plot-area" style={{
                        width: '100%',
                        height: isMobile ? 280 : isTablet ? 320 : 350,
                        position: 'relative'
                    }}>
                        <ResponsiveContainer width="100%" height="100%" key={`distribution-${showNumberOfPoints}`}>
                            <ComposedChart
                                data={data}
                                margin={{
                                    top: 10,
                                    right: isMobile ? 50 : 60,
                                    left: isMobile ? 10 : 20,
                                    bottom: isMobile ? 50 : 40
                                }}
                            >
                                {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                                <XAxis
                                    dataKey="binMiddle"
                                    label={{
                                        value: effectiveXAxisLabel,
                                        position: 'insideBottom',
                                        offset: isMobile ? -30 : -20,
                                        style: { fontSize: isMobile ? '12px' : '14px', fill: '#666' }
                                    }}
                                    tick={{ fontSize: isMobile ? 10 : 12 }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    label={{
                                        value: effectiveYAxisLabel,
                                        angle: -90,
                                        position: 'insideLeft',
                                        offset: -5,
                                        style: { fontSize: isMobile ? '12px' : '14px', fill: '#666' }
                                    }}
                                    tick={{ fontSize: isMobile ? 10 : 12 }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    label={{
                                        value: 'Number of Points',
                                        angle: 90,
                                        position: 'insideRight',
                                        offset: -5,
                                        style: { fontSize: isMobile ? '12px' : '14px', fill: '#666' }
                                    }}
                                    tick={{ fontSize: isMobile ? 10 : 12 }}
                                />
                                <Tooltip
                                    formatter={(value, name) => {
                                        if (name === 'count') {
                                            return [value, 'Number of Points'];
                                        }
                                        return [value, legendLabel];
                                    }}
                                    labelFormatter={(label) => `${effectiveXAxisLabel}: ${label}`}
                                    contentStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                                />
                                <Legend
                                    verticalAlign="top"
                                    height={36}
                                    align="left"
                                    wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                                />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="count"
                                    stroke={color}
                                    fill={color}
                                    fillOpacity={areaOpacity}
                                    name={legendLabel}
                                    dot={showDataPoints ? { r: 3, fill: color } : false}
                                    hide={!showAreaChart}
                                />
                                <Bar
                                    yAxisId="right"
                                    dataKey="count"
                                    fill={barColor}
                                    fillOpacity={0.5}
                                    name="Number of Points"
                                    radius={[4, 4, 0, 0]}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                        <WatermarkContent />
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderSeparateCharts = () => (
        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
            <Grid item xs={12} lg={6}>
                <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 2 }}>
                    <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 500,
                                    color: "primary.main",
                                    fontSize: { xs: "1rem", md: "1.25rem" },
                                }}
                            >
                                Without Product Distribution
                            </Typography>

                            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                                {/* <FormControlLabel
                                    control={
                                        <Switch
                                            checked={showNumberOfPoints}
                                            onChange={(e) => setShowNumberOfPoints(e.target.checked)}
                                            size="small"
                                        />
                                    }
                                    label="Number of Points"
                                    sx={{ mr: 1 }}
                                /> */}
                                
                                {/* <MuiTooltip title="Chart Settings">
                                    <Button
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
                                </MuiTooltip> */}

                                {/* <SaveVisualizationButton 
                                    elementId="visualization-content" 
                                    fileNamePrefix="distribution_curve_individual"
                                    variableNames={selectedColumn}
                                />

                                <MuiTooltip title="Download as PNG">
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => downloadChartAsPNG(withoutProductChartRef, 'Without_Product_Distribution')}
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
                                </MuiTooltip> */}
                            </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Alert severity="info" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <PanToolIcon fontSize="small" />
                                <Typography variant="body2" sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}>
                                    Interactive distribution curve with customizable bins, colors, and statistical analysis.
                                </Typography>
                            </Alert>
                        </Box>

                        <div ref={withoutProductChartRef} style={{
                            width: '100%',
                            height: isMobile ? 280 : isTablet ? 320 : 350,
                            position: 'relative'
                        }}>
                            <ResponsiveContainer width="100%" height="100%" key={`without-${showNumberOfPoints}`}>
                                <ComposedChart
                                    data={withoutProductDistribution}
                                    margin={{
                                        top: 10,
                                        right: isMobile ? 50 : 60,
                                        left: isMobile ? 10 : 20,
                                        bottom: isMobile ? 50 : 40
                                    }}
                                >
                                    {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                                    <XAxis
                                        dataKey="binMiddle"
                                        label={{
                                            value: separateXAxisLabel,
                                            position: 'insideBottom',
                                            offset: isMobile ? -30 : -20,
                                            style: { fontSize: isMobile ? '12px' : '14px', fill: '#666' }
                                        }}
                                        tick={{ fontSize: isMobile ? 10 : 12 }}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        label={{
                                            value: separateYAxisLabel,
                                            angle: -90,
                                            position: 'insideLeft',
                                            offset: -5,
                                            style: { fontSize: isMobile ? '12px' : '14px', fill: '#666' }
                                        }}
                                        tick={{ fontSize: isMobile ? 10 : 12 }}
                                    />
                                    {showNumberOfPoints ? (
                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            label={{
                                                value: 'Number of Points',
                                                angle: 90,
                                                position: 'insideRight',
                                                offset: -5,
                                                style: { fontSize: isMobile ? '12px' : '14px', fill: '#666' }
                                            }}
                                            tick={{ fontSize: isMobile ? 10 : 12 }}
                                        />
                                    ) : (
                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            tick={false}
                                            tickLine={false}
                                            axisLine={false}
                                            width={0}
                                        />
                                    )}
                                    <Tooltip
                                        formatter={(value, name) => {
                                            if (name === 'count') {
                                                return [value, 'Number of Points'];
                                            }
                                            return [value, separateLegendLabels.withoutProduct];
                                        }}
                                        labelFormatter={(label) => `${separateXAxisLabel}: ${label}`}
                                        contentStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                                    />
                                    <Legend
                                        verticalAlign="top"
                                        height={36}
                                        align="left"
                                        wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                                    />
                                    <Area
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="count"
                                        stroke={distributionColors.withoutProduct}
                                        fill={distributionColors.withoutProduct}
                                        fillOpacity={areaOpacity}
                                        name={separateLegendLabels.withoutProduct}
                                        dot={showDataPoints ? { r: 3, fill: distributionColors.withoutProduct } : false}
                                        hide={!showAreaChart}
                                    />
                                    <Bar
                                        yAxisId="right"
                                        dataKey="count"
                                        fill={barColors.withoutProduct}
                                        fillOpacity={showNumberOfPoints ? 0.4 : 0}
                                        name="Number of Points"
                                        radius={[4, 4, 0, 0]}
                                        barSize={20}
                                        hide={!showNumberOfPoints}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                            <WatermarkContent />
                        </div>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} lg={6}>
                <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 2 }}>
                    <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
                            {/* <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 500,
                                    color: "primary.main",
                                    fontSize: { xs: "1rem", md: "1.25rem" },
                                }}
                            >
                                With Product Distribution
                            </Typography>

                            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={showNumberOfPoints}
                                            onChange={(e) => setShowNumberOfPoints(e.target.checked)}
                                            size="small"
                                        />
                                    }
                                    label="Number of Points"
                                    sx={{ mr: 1 }}
                                />
                                
                                <MuiTooltip title="Chart Settings">
                                    <Button
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
                                    fileNamePrefix="distribution_curve_individual"
                                    variableNames={selectedColumn}
                                />

                                <MuiTooltip title="Download as PNG">
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => downloadChartAsPNG(withProductChartRef, 'With_Product_Distribution')}
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
                            </Box> */}
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Alert severity="info" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <PanToolIcon fontSize="small" />
                                <Typography variant="body2" sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}>
                                    Interactive distribution curve with customizable bins, colors, and statistical analysis.
                                </Typography>
                            </Alert>
                        </Box>

                        <div ref={withProductChartRef} style={{
                            width: '100%',
                            height: isMobile ? 280 : isTablet ? 320 : 350,
                            position: 'relative'
                        }}>
                            <ResponsiveContainer width="100%" height="100%" key={`with-${showNumberOfPoints}`}>
                                <ComposedChart
                                    data={withProductDistribution}
                                    margin={{
                                        top: 10,
                                        right: isMobile ? 50 : 60,
                                        left: isMobile ? 10 : 20,
                                        bottom: isMobile ? 50 : 40
                                    }}
                                >
                                    {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                                    <XAxis
                                        dataKey="binMiddle"
                                        label={{
                                            value: separateXAxisLabel,
                                            position: 'insideBottom',
                                            offset: isMobile ? -30 : -20,
                                            style: { fontSize: isMobile ? '12px' : '14px', fill: '#666' }
                                        }}
                                        tick={{ fontSize: isMobile ? 10 : 12 }}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        label={{
                                            value: separateYAxisLabel,
                                            angle: -90,
                                            position: 'insideLeft',
                                            offset: -5,
                                            style: { fontSize: isMobile ? '12px' : '14px', fill: '#666' }
                                        }}
                                        tick={{ fontSize: isMobile ? 10 : 12 }}
                                    />
                                    {showNumberOfPoints ? (
                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            label={{
                                                value: 'Number of Points',
                                                angle: 90,
                                                position: 'insideRight',
                                                offset: -5,
                                                style: { fontSize: isMobile ? '12px' : '14px', fill: '#666' }
                                            }}
                                            tick={{ fontSize: isMobile ? 10 : 12 }}
                                        />
                                    ) : (
                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            tick={false}
                                            tickLine={false}
                                            axisLine={false}
                                            width={0}
                                        />
                                    )}
                                    <Tooltip
                                        formatter={(value, name) => {
                                            if (name === 'count') {
                                                return [value, 'Number of Points'];
                                            }
                                            return [value, separateLegendLabels.withProduct];
                                        }}
                                        labelFormatter={(label) => `${separateXAxisLabel}: ${label}`}
                                        contentStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                                    />
                                    <Legend
                                        verticalAlign="top"
                                        height={36}
                                        align="left"
                                        wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                                    />
                                    <Area
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="count"
                                        stroke={distributionColors.withProduct}
                                        fill={distributionColors.withProduct}
                                        fillOpacity={areaOpacity}
                                        name={separateLegendLabels.withProduct}
                                        dot={showDataPoints ? { r: 3, fill: distributionColors.withProduct } : false}
                                        hide={!showAreaChart}
                                    />
                                    <Bar
                                        yAxisId="right"
                                        dataKey="count"
                                        fill={barColors.withProduct}
                                        fillOpacity={showNumberOfPoints ? 0.4 : 0}
                                        name="Number of Points"
                                        radius={[4, 4, 0, 0]}
                                        barSize={20}
                                        hide={!showNumberOfPoints}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                            <WatermarkContent />
                        </div>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderSingleChart = () => {
        const isWithProduct = singleViewType === 'withProduct';
        const data = isWithProduct ? withProductDistribution : withoutProductDistribution;
        const title = isWithProduct ? 'With Product Distribution' : 'Without Product Distribution';
        const color = isWithProduct ? distributionColors.withProduct : distributionColors.withoutProduct;
        const barColor = isWithProduct ? barColors.withProduct : barColors.withoutProduct;
        const chartRef = isWithProduct ? withProductChartRef : withoutProductChartRef;

        if (!data || data.length === 0) {
            return (
                <Alert severity="info" sx={{ width: '100%', mx: { xs: 1, sm: 0 } }}>
                    No data available for visualization
                </Alert>
            );
        }

        return (
            <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 2 }}>
                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 500,
                                color: "primary.main",
                                fontSize: { xs: "1rem", md: "1.25rem" },
                            }}
                        >
                            {title}
                        </Typography>

                        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={showNumberOfPoints}
                                        onChange={(e) => setShowNumberOfPoints(e.target.checked)}
                                        size="small"
                                    />
                                }
                                label="Number of Points"
                                sx={{ mr: 1 }}
                            />
                            
                                <MuiTooltip title="Chart Settings">
                                    <Button
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
                                    fileNamePrefix="distribution_curve" 
                                />

                                <MuiTooltip title="Download as PNG">
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => downloadChartAsPNG(chartRef, title.replace(/\s+/g, '_'))}
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

                    <Box sx={{ mb: 2 }}>
                        <Alert severity="info" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <PanToolIcon fontSize="small" />
                            <Typography variant="body2" sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}>
                                Interactive distribution curve with customizable bins, colors, and statistical analysis.
                            </Typography>
                        </Alert>
                    </Box>

                    <div ref={chartRef} className="abhitech-plot-area" style={{
                        width: '100%',
                        height: isMobile ? 280 : isTablet ? 320 : 350,
                        position: 'relative'
                    }}>
                        <ResponsiveContainer width="100%" height="100%" key={`single-${showNumberOfPoints}`}>
                            <ComposedChart
                                data={data}
                                margin={{
                                    top: 10,
                                    right: isMobile ? 50 : 60,
                                    left: isMobile ? 10 : 20,
                                    bottom: isMobile ? 50 : 40
                                }}
                            >
                                {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                                <XAxis
                                    dataKey="binMiddle"
                                    label={{
                                        value: singleXAxisLabel,
                                        position: 'insideBottom',
                                        offset: isMobile ? -30 : -20,
                                        style: { fontSize: isMobile ? '12px' : '14px', fill: '#666' }
                                    }}
                                    tick={{ fontSize: isMobile ? 10 : 12 }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    label={{
                                        value: singleYAxisLabel,
                                        angle: -90,
                                        position: 'insideLeft',
                                        offset: -5,
                                        style: { fontSize: isMobile ? '12px' : '14px', fill: '#666' }
                                    }}
                                    tick={{ fontSize: isMobile ? 10 : 12 }}
                                />
                                {showNumberOfPoints ? (
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        label={{
                                            value: 'Number of Points',
                                            angle: 90,
                                            position: 'insideRight',
                                            offset: -5,
                                            style: { fontSize: isMobile ? '12px' : '14px', fill: '#666' }
                                        }}
                                        tick={{ fontSize: isMobile ? 10 : 12 }}
                                    />
                                ) : (
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        tick={false}
                                        tickLine={false}
                                        axisLine={false}
                                        width={0}
                                    />
                                )}
                                <Tooltip
                                    formatter={(value, name) => {
                                        if (name === 'count') {
                                            return [value, 'Number of Points'];
                                        }
                                        return [value, singleLegendLabel];
                                    }}
                                    labelFormatter={(label) => `${singleXAxisLabel}: ${label}`}
                                    contentStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                                />
                                <Legend
                                    verticalAlign="top"
                                    height={36}
                                    align="left"
                                    wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                                />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="count"
                                    stroke={color}
                                    fill={color}
                                    fillOpacity={areaOpacity}
                                    name={singleLegendLabel}
                                    dot={showDataPoints ? { r: 3, fill: color } : false}
                                    hide={!showAreaChart}
                                />
                                <Bar
                                    yAxisId="right"
                                    dataKey="count"
                                    fill={barColor}
                                    fillOpacity={showNumberOfPoints ? 0.5 : 0}
                                    name="Number of Points"
                                    radius={[4, 4, 0, 0]}
                                    barSize={20}
                                    hide={!showNumberOfPoints}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                        <WatermarkContent />
                    </div>
                </CardContent>
            </Card>
        );
    };
    
    const downloadPageAsPNG = async () => {
        if (!pageRef.current) return
        
        const originalShowSummaryCards = showSummaryCards
        const originalShowInsights = showInsights
        
        setShowSummaryCards(true)
        setShowInsights(true)
        
        await new Promise(resolve => setTimeout(resolve, 400))
        
        const element = pageRef.current
        const canvas = await html2canvas(element, {
            useCORS: true,
            backgroundColor: '#fff',
            scale: 2,
            logging: false,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
        })
        
        setShowSummaryCards(originalShowSummaryCards)
        setShowInsights(originalShowInsights)
        
        const link = document.createElement('a')
        const fileName = generateFileName(`DistributionCurve_Page_${selectedColumn}`)
        link.download = `${fileName}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
    }

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <SettingsModal />

            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
                <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'primary.main' }}>
                        Select Column
                    </Typography>
                    <Autocomplete
                        options={availableColumns}
                        value={selectedColumn}
                        onChange={(event, newValue) => {
                            if (newValue) {
                                setSelectedColumn(newValue);
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                id='distribution-column-select'
                                {...params}
                                label="Select Column"
                                variant="outlined"
                                fullWidth
                                size="small"
                            />
                        )}
                        disableClearable
                        autoHighlight
                        openOnFocus
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'secondary.main' }}>
                        View Mode
                    </Typography>
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(event, newMode) => {
                            if (newMode !== null) {
                                setViewMode(newMode);
                            }
                        }}
                        aria-label="view mode"
                        fullWidth
                        size="small"
                        orientation="horizontal"
                        sx={{
                            height: "48px",
                            "& .MuiToggleButton-root": {
                                fontSize: "0.875rem",
                                textTransform: "none",
                                border: "1px solid",
                                borderColor: "primary.main",
                                "&.Mui-selected": {
                                    backgroundColor: "primary.main",
                                    color: "white",
                                    "&:hover": {
                                        backgroundColor: "primary.dark",
                                    }
                                }
                            }
                        }}
                    >
                        <ToggleButton value="combined" aria-label="combined view">
                            Combined
                        </ToggleButton>
                        <ToggleButton value="separate" aria-label="separate view">
                            Separate
                        </ToggleButton>
                        <ToggleButton value="single" aria-label="single view">
                            Single
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Grid>
                {viewMode === 'single' && (
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'success.main' }}>
                            Chart Type
                        </Typography>
                        <FormControl fullWidth size="small">
                            <InputLabel id="single-view-select-label">Chart Type</InputLabel>
                            <Select
                                labelId="single-view-select-label"
                                value={singleViewType}
                                label="Chart Type"
                                onChange={(event) => setSingleViewType(event.target.value)}
                            >
                                <MenuItem value="withProduct">With Product</MenuItem>
                                <MenuItem value="withoutProduct">Without Product</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                )}
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
                                options={availableColumns}
                                value={filterColumn}
                                onChange={(event, newValue) => setFilterColumn(newValue || '')}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Filter Column"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                    />
                                )}
                                disableClearable={false}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={6} sm={3} md={2.5}>
                            <TextField
                                type={columnIsDateTime ? 'datetime-local' : 'number'}
                                label={columnIsDateTime ? 'Min (datetime)' : 'Min'}
                                value={filterMin}
                                onChange={(e) => setFilterMin(e.target.value)}
                                disabled={!filterColumn}
                                variant="outlined"
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={6} sm={3} md={2.5}>
                            <TextField
                                type={columnIsDateTime ? 'datetime-local' : 'number'}
                                label={columnIsDateTime ? 'Max (datetime)' : 'Max'}
                                value={filterMax}
                                onChange={(e) => setFilterMax(e.target.value)}
                                disabled={!filterColumn}
                                variant="outlined"
                                fullWidth
                                size="small"
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

            <div ref={pageRef}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
                    <MuiTooltip title="Download entire page as PNG">
                        <Button
                            id='download-visualization-btn'
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

                {selectedColumn && (
                    <Box>
                        {viewMode === 'combined' && renderCombinedChart()}
                        {viewMode === 'separate' && renderSeparateCharts()}
                        {viewMode === 'single' && renderSingleChart()}

                        {/* Analysis Sections - Below the charts */}
                        <SummaryCards />
                        <InsightsPanel />
                    </Box>
                )}
            </div>
        </Box>
    );
};

export default DistributionCurveTab;