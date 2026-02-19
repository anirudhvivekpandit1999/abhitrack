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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Collapse,
    Switch,
    useTheme,
    useMediaQuery,
    Divider
} from '@mui/material';
import DebouncedTextField from '../DebouncedTextField';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import logo from '../../assets/abhitech-logo.png';
import html2canvas from 'html2canvas';
import SaveVisualizationButton from '../SaveVisualizationButton'
import ImageIcon from '@mui/icons-material/Image';
import ChartSettingsModal from '../ChartSettingsModal';
import * as d3 from 'd3';

const CorrelationAnalysisTab = ({ availableColumns, withProductData, withoutProductData, clientName = '', plantName = '', productName = '' }) => {
    const [selectedVariable, setSelectedVariable] = useState('');
    const [datasetView, setDatasetView] = useState('both');
    const [selectedTopVariables, setSelectedTopVariables] = useState([]);
    const [maxVariables, setMaxVariables] = useState(10);
    
    const [showSettings, setShowSettings] = useState(false);
    const [colorScheme, setColorScheme] = useState('RdYlBu');
    const [cellSize, setCellSize] = useState(60);
    const [fontSize, setFontSize] = useState(12);
    
    const [xAxisLabel, setXAxisLabel] = useState('Datasets');
    const [yAxisLabel, setYAxisLabel] = useState('Variables');
    const [showPoweredBy, setShowPoweredBy] = useState(true);
    const [customColors, setCustomColors] = useState({
        negative: '#313695',
        zero: '#FFFFBF',
        positive: '#A50026'
    });
    
    const [showBarChartSettings, setShowBarChartSettings] = useState(false);
    const [selectedBarChartVariables, setSelectedBarChartVariables] = useState([]);
    const [barChartWithProductColor, setBarChartWithProductColor] = useState('#3B82F6');
    const [barChartWithoutProductColor, setBarChartWithoutProductColor] = useState('#EF4444');
    const [barChartXAxisLabel, setBarChartXAxisLabel] = useState('Variables');
    const [barChartYAxisLabel, setBarChartYAxisLabel] = useState('% Impact');

    // Generate custom filename based on project information
    const generateFileName = (visualizationName) => {
        const parts = [];
        if (clientName) parts.push(clientName.replace(/\s+/g, '_'));
        if (plantName) parts.push(plantName.replace(/\s+/g, '_'));
        if (productName) parts.push(productName.replace(/\s+/g, '_'));
        parts.push(visualizationName.replace(/\s+/g, '_'));
        return parts.join('-');
    };
    
    const heatmapRef = useRef(null);
    const pageRef = useRef(null);
    const barChartRef = useRef(null);
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    
    useEffect(() => {
        if (availableColumns.length > 0) {
            setSelectedVariable(availableColumns[0]);
        }
    }, [availableColumns]);

    useEffect(() => {
        const syncBaseColumnName = () => {
            const saved = localStorage.getItem('correlationColumn');
            if (saved && availableColumns.includes(saved)) {
                setSelectedVariable(saved);
            }
        }
        window.addEventListener('correlationColumnChanged', syncBaseColumnName);
        return () => window.removeEventListener('correlationColumnChanged', syncBaseColumnName);
    },[])
    
    const calculateCorrelation = (xValues, yValues) => {
        if (!xValues || !yValues || xValues.length !== yValues.length || xValues.length < 2) return 0;
        
        const n = xValues.length;
        const sumX = xValues.reduce((sum, val) => sum + val, 0);
        const sumY = yValues.reduce((sum, val) => sum + val, 0);
        const sumXY = xValues.reduce((sum, val, idx) => sum + val * yValues[idx], 0);
        const sumX2 = xValues.reduce((sum, val) => sum + val * val, 0);
        const sumY2 = yValues.reduce((sum, val) => sum + val * val, 0);
        
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        
        return denominator === 0 ? 0 : numerator / denominator;
    };
    
    const correlationData = useMemo(() => {
        if (!selectedVariable) return { withProduct: [], withoutProduct: [], topWithProduct: [], topWithoutProduct: [] };
        
        const otherColumns = availableColumns.filter(col => col !== selectedVariable);
        const dataWithProduct = [];
        const dataWithoutProduct = [];
        
        const baseValuesWith = [];
        const baseValuesWithout = [];
        
        (withProductData || []).forEach(row => {
            const val = parseFloat(row[selectedVariable]);
            if (!isNaN(val)) baseValuesWith.push(val);
        });
        
        (withoutProductData || []).forEach(row => {
            const val = parseFloat(row[selectedVariable]);
            if (!isNaN(val)) baseValuesWithout.push(val);
        });
        
        otherColumns.forEach(column => {
            const withProductPairs = [];
            (withProductData || []).forEach(row => {
                const baseVal = parseFloat(row[selectedVariable]);
                const otherVal = parseFloat(row[column]);
                if (!isNaN(baseVal) && !isNaN(otherVal)) {
                    withProductPairs.push({ base: baseVal, other: otherVal });
                }
            });
            
            const withoutProductPairs = [];
            (withoutProductData || []).forEach(row => {
                const baseVal = parseFloat(row[selectedVariable]);
                const otherVal = parseFloat(row[column]);
                if (!isNaN(baseVal) && !isNaN(otherVal)) {
                    withoutProductPairs.push({ base: baseVal, other: otherVal });
                }
            });
            
            if (withProductPairs.length > 1) {
                const xVals = withProductPairs.map(p => p.base);
                const yVals = withProductPairs.map(p => p.other);
                const corr = calculateCorrelation(xVals, yVals);
                dataWithProduct.push({ variable: column, correlation: corr, absCorrelation: Math.abs(corr) });
            }
            
            if (withoutProductPairs.length > 1) {
                const xVals = withoutProductPairs.map(p => p.base);
                const yVals = withoutProductPairs.map(p => p.other);
                const corr = calculateCorrelation(xVals, yVals);
                dataWithoutProduct.push({ variable: column, correlation: corr, absCorrelation: Math.abs(corr) });
            }
        });
        
        const sortedWith = [...dataWithProduct].sort((a, b) => b.absCorrelation - a.absCorrelation);
        const sortedWithout = [...dataWithoutProduct].sort((a, b) => b.absCorrelation - a.absCorrelation);
        
        const topWithProduct = sortedWith.slice(0, 10);
        const topWithoutProduct = sortedWithout.slice(0, 10);
        
        return {
            withProduct: sortedWith,
            withoutProduct: sortedWithout,
            topWithProduct,
            topWithoutProduct
        };
    }, [selectedVariable, withProductData, withoutProductData, availableColumns]);
    
    const calculateImpact = (data) => {
        if (!Array.isArray(data) || data.length === 0) return 0;
        const totalAbsCorrelation = data.reduce((sum, item) => {
            const fromAbs = typeof item?.absCorrelation === 'number' && isFinite(item.absCorrelation)
                ? Math.abs(item.absCorrelation)
                : 0;
            const fromCorr = fromAbs === 0 && typeof item?.correlation === 'number' && isFinite(item.correlation)
                ? Math.abs(item.correlation)
                : 0;
            return sum + (fromAbs || fromCorr);
        }, 0);
        return Number.isFinite(totalAbsCorrelation) ? totalAbsCorrelation : 0;
    };
    
useEffect(() => {
    const handler = (e) => {
        const vars = e?.detail || [];
        // if you want to replace:
        setSelectedBarChartVariables(vars);

        // Or if you prefer merging with existing selection:
        // setSelectedBarChartVariables(prev => Array.from(new Set([...(prev||[]), ...vars])));
    };
    window.addEventListener('selectedBarChartVariablesChanged', handler);
    return () => window.removeEventListener('selectedBarChartVariablesChanged', handler);
}, []);


    const totalImpactWithProduct = useMemo(() => calculateImpact(correlationData.withProduct), [correlationData.withProduct]);
    const totalImpactWithoutProduct = useMemo(() => calculateImpact(correlationData.withoutProduct), [correlationData.withoutProduct]);
    const totalImpactTopWith = useMemo(() => calculateImpact(correlationData.topWithProduct), [correlationData.topWithProduct]);
    const totalImpactTopWithout = useMemo(() => calculateImpact(correlationData.topWithoutProduct), [correlationData.topWithoutProduct]);
    
    const allTopVariables = useMemo(() => {
        const topVars = [
            ...correlationData.topWithProduct.map(item => item.variable),
            ...correlationData.topWithoutProduct.map(item => item.variable)
        ];
        return [...new Set(topVars)];
    }, [correlationData]);
    
    useEffect(() => {
        const uniqueTopVariables = allTopVariables.slice(0, maxVariables);
        setSelectedTopVariables(uniqueTopVariables);
    }, [allTopVariables, maxVariables]);

    useEffect(() => {
        if (allTopVariables.length > 0 && selectedBarChartVariables.length === 0) {
            setSelectedBarChartVariables(allTopVariables.slice(0, Math.min(5, allTopVariables.length)));
        }
    }, [allTopVariables]);
    
    const filteredCorrelationData = useMemo(() => {
        const variablesToUse = selectedTopVariables.length > 0 ? selectedTopVariables : allTopVariables.slice(0, maxVariables);
        
        const filtered = [];
        
        if (datasetView === 'both' || datasetView === 'withProduct') {
            const withProductData = correlationData.withProduct
                .filter(item => variablesToUse.includes(item.variable))
                .map(item => ({ ...item, dataset: 'With Product' }));
            filtered.push(...withProductData);
        }
        
        if (datasetView === 'both' || datasetView === 'withoutProduct') {
            const withoutProductData = correlationData.withoutProduct
                .filter(item => variablesToUse.includes(item.variable))
                .map(item => ({ ...item, dataset: 'Without Product' }));
            filtered.push(...withoutProductData);
        }
        
        return filtered;
    }, [selectedTopVariables, datasetView, correlationData, allTopVariables, maxVariables]);
    
    const getColorScheme = (scheme) => {
        const schemes = {
            RdYlBu: d3.interpolateRdYlBu,
            RdBu: d3.interpolateRdBu,
            Spectral: d3.interpolateSpectral,
            Blues: d3.scaleSequential(d3.interpolateBlues),
            Reds: d3.scaleSequential(d3.interpolateReds)
        };
        return schemes[scheme] || schemes.RdYlBu;
    };
    
    const getCorrelationColor = (correlation) => {
        if (colorScheme === 'custom') {
            const scaled = (correlation + 1) / 2;
            if (scaled < 0.5) {
                const t = scaled * 2;
                return d3.interpolateRgb(customColors.negative, customColors.zero)(t);
            } else {
                const t = (scaled - 0.5) * 2;
                return d3.interpolateRgb(customColors.zero, customColors.positive)(t);
            }
        }
        const scaled = (correlation + 1) / 2;
        const colorFunc = getColorScheme(colorScheme);
        return colorFunc(scaled);
    };
    
    const renderHeatmap = () => {
        if (filteredCorrelationData.length === 0) {
            return (
                <Alert severity="info" sx={{ width: '100%', my: 3 }}>
                    No correlation data available. Please select variables and ensure data quality.
                </Alert>
            );
        }
        
        const uniqueVariables = [...new Set(filteredCorrelationData.map(item => item.variable))];
        const datasets = datasetView === 'both' ? ['With Product', 'Without Product'] : 
                        datasetView === 'withProduct' ? ['With Product'] : ['Without Product'];
        
        const maxVarLength = Math.max(...uniqueVariables.map(v => v.length));
        const marginLeft = Math.max(200, maxVarLength * 7 + 30);
        const marginTop = 120;
        const legendWidth = 250;
        const legendHeight = 20;
        const cellSpacing = 20;
        const rowHeight = cellSize + cellSpacing;
        
        const chartWidth = datasets.length * (cellSize + 40);
        const chartHeight = uniqueVariables.length * rowHeight;
        const totalWidth = marginLeft + chartWidth + 80;
        const totalHeight = marginTop + chartHeight + 80;
        
        return (
            <Box sx={{ overflowX: 'auto', overflowY: 'auto', maxWidth: '100%' }} className="abhitech-plot-area">
                <svg 
                    ref={heatmapRef}
                    width={totalWidth}
                    height={totalHeight}
                    viewBox={`0 0 ${totalWidth} ${totalHeight}`}
                >
                    {/* Background */}
                    <rect width={totalWidth} height={totalHeight} fill="white" />
                    
                    <g transform={`translate(${marginLeft}, ${marginTop})`}>
                        {/* Color scale legend */}
                        <text x={0} y={-70} fontSize={18} fontWeight="bold" fill="#1a1a1a">Correlation Scale</text>
                        <defs>
                            <linearGradient id="colorScale" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={colorScheme === 'custom' ? customColors.negative : '#004d99'} />
                                <stop offset="25%" stopColor="#4d94ff" />
                                <stop offset="50%" stopColor={colorScheme === 'custom' ? customColors.zero : '#ffffcc'} />
                                <stop offset="75%" stopColor="#ff6666" />
                                <stop offset="100%" stopColor={colorScheme === 'custom' ? customColors.positive : '#cc0000'} />
                            </linearGradient>
                        </defs>
                        <rect x={0} y={-50} width={legendWidth} height={legendHeight} fill="url(#colorScale)" rx={3} stroke="#666" strokeWidth={1.5} />
                        <text x={0} y={-30} fontSize={12} fill="#333" fontWeight="600">-1 (Negative)</text>
                        <text x={legendWidth - 20} y={-30} fontSize={12} fill="#333" fontWeight="600">1 (Positive)</text>
                        
                        {/* Y-axis label */}
                        <text
                            x={-30}
                            y={chartHeight / 2}
                            fontSize={fontSize + 2}
                            textAnchor="middle"
                            fill="#333"
                            fontWeight="600"
                            transform={`rotate(-90, -30, ${chartHeight / 2})`}
                        >
                            {yAxisLabel}
                        </text>
                        
                        {/* Y-axis labels (Variables) - rotated for better visibility */}
                        {uniqueVariables.map((variable, idx) => {
                            const truncatedVar = variable.length > 35 ? variable.substring(0, 32) + '...' : variable;
                            return (
                                <g key={variable}>
                                    <text
                                        x={-15}
                                        y={idx * rowHeight + cellSize / 2}
                                        fontSize={fontSize - 1}
                                        textAnchor="end"
                                        alignmentBaseline="middle"
                                        fill="#333"
                                        fontWeight="500"
                                    >
                                        {truncatedVar}
                                    </text>
                                </g>
                            );
                        })}
                        
                        {/* Vertical grid lines for better readability */}
                        {datasets.map((_, idx) => {
                            const xPos = idx * (cellSize + 40);
                            return (
                                <line
                                    key={`vgrid-${idx}`}
                                    x1={xPos}
                                    y1={0}
                                    x2={xPos}
                                    y2={chartHeight}
                                    stroke="#d0d0d0"
                                    strokeWidth={1}
                                    strokeDasharray="3,3"
                                />
                            );
                        })}
                        
                        {/* Horizontal grid lines */}
                        {uniqueVariables.map((_, idx) => (
                            <line
                                key={`hgrid-${idx}`}
                                x1={-5}
                                y1={idx * rowHeight}
                                x2={chartWidth}
                                y2={idx * rowHeight}
                                stroke="#e5e5e5"
                                strokeWidth={0.8}
                            />
                        ))}
                        
                        {/* Heatmap cells */}
                        {filteredCorrelationData.map((item) => {
                            const variableIdx = uniqueVariables.indexOf(item.variable);
                            const datasetIdx = datasets.indexOf(item.dataset);
                            const xPos = datasetIdx * (cellSize + 40);
                            const yPos = variableIdx * rowHeight;
                            const color = getCorrelationColor(item.correlation);
                            const textColor = Math.abs(item.correlation) > 0.6 ? '#fff' : '#333';
                            const correlationValue = item.correlation.toFixed(2);
                            
                            return (
                                <g key={`${item.variable}-${item.dataset}`}>
                                    <rect
                                        x={xPos}
                                        y={yPos}
                                        width={cellSize}
                                        height={cellSize}
                                        fill={color}
                                        stroke="#fff"
                                        strokeWidth={2}
                                        rx={4}
                                        style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))' }}
                                    />
                                    <text
                                        x={xPos + cellSize / 2}
                                        y={yPos + cellSize / 2}
                                        fontSize={fontSize}
                                        fill={textColor}
                                        textAnchor="middle"
                                        alignmentBaseline="middle"
                                        fontWeight="bold"
                                        style={{ 
                                            textShadow: textColor === '#fff' ? '1px 1px 2px rgba(0,0,0,0.5)' : 'none' 
                                        }}
                                    >
                                        {correlationValue}
                                    </text>
                                </g>
                            );
                        })}
                        
                        {/* X-axis label */}
                        <text
                            x={chartWidth / 2}
                            y={chartHeight + 50}
                            fontSize={fontSize + 2}
                            textAnchor="middle"
                            fill="#333"
                            fontWeight="600"
                        >
                            {xAxisLabel}
                        </text>
                        
                        {/* X-axis labels (Datasets) */}
                        {datasets.map((dataset, idx) => (
                            <text
                                key={dataset}
                                x={idx * (cellSize + 40) + cellSize / 2}
                                y={chartHeight + 40}
                                fontSize={fontSize + 2}
                                textAnchor="middle"
                                fill="#1a1a1a"
                                fontWeight="700"
                            >
                                {dataset}
                            </text>
                        ))}
                    </g>
                    
                    {/* Powered by text */}
                    {showPoweredBy && (
                        <g transform={`translate(${totalWidth - 150}, ${totalHeight - 30})`}>
                            <text
                                x={0}
                                y={0}
                                fontSize="12"
                                fill="#666"
                                textAnchor="end"
                            >
                                Powered by
                            </text>
                            <text
                                x={0}
                                y={15}
                                fontSize="14"
                                fill="#1976d2"
                                fontWeight="bold"
                                textAnchor="end"
                            >
                                Abhitech's AbhiStat
                            </text>
                        </g>
                    )}
                </svg>
            </Box>
        );
    };
    
    const downloadHeatmapAsPNG = () => {
        if (!heatmapRef.current) return;
        
        const svgElement = heatmapRef.current;
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        const scaleFactor = 2;
        canvas.width = svgElement.viewBox.baseVal.width * scaleFactor || 1200 * scaleFactor;
        canvas.height = svgElement.viewBox.baseVal.height * scaleFactor || 800 * scaleFactor;
        
        img.onload = () => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = 'black';
            ctx.font = `${16 * scaleFactor}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(`Correlation Analysis: ${selectedVariable}`, canvas.width / 2, 30 * scaleFactor);
            
            ctx.drawImage(img, 0, 50 * scaleFactor, canvas.width, canvas.height - 100 * scaleFactor);
            
            const logoImg = new Image();
            logoImg.src = logo;
            logoImg.onload = () => {
                const watermarkX = canvas.width - 160 * scaleFactor - 10 * scaleFactor;
                const watermarkY = 10 * scaleFactor;
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                ctx.fillRect(watermarkX, watermarkY, 160 * scaleFactor, 36 * scaleFactor);
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.lineWidth = scaleFactor;
                ctx.strokeRect(watermarkX, watermarkY, 160 * scaleFactor, 36 * scaleFactor);
                
                ctx.drawImage(logoImg, watermarkX + 8 * scaleFactor, watermarkY + 6 * scaleFactor, 24 * scaleFactor, 24 * scaleFactor);
                
                ctx.fillStyle = '#666';
                ctx.font = `${10 * scaleFactor}px Arial`;
                ctx.textAlign = 'left';
                ctx.fillText('Powered by', watermarkX + 40 * scaleFactor, watermarkY + 18 * scaleFactor);
                
                ctx.fillStyle = '#1976d2';
                ctx.font = `bold ${11 * scaleFactor}px Arial`;
                ctx.fillText("Abhitech's AbhiStat", watermarkX + 40 * scaleFactor, watermarkY + 30 * scaleFactor);
                
                const link = document.createElement('a');
                const fileName = generateFileName(`CorrelationAnalysis_${selectedVariable}`);
                link.download = `${fileName}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            };
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    const barChartData = useMemo(() => {
        if (!selectedVariable || selectedBarChartVariables.length === 0) return [];
        
        return selectedBarChartVariables.map(variable => {
            const withProductItem = correlationData.withProduct.find(item => item.variable === variable);
            const withoutProductItem = correlationData.withoutProduct.find(item => item.variable === variable);
            
            const impactWith = totalImpactTopWith > 0 && withProductItem 
                ? (withProductItem.absCorrelation / totalImpactTopWith * 100) 
                : 0;
            const impactWithout = totalImpactTopWithout > 0 && withoutProductItem 
                ? (withoutProductItem.absCorrelation / totalImpactTopWithout * 100) 
                : 0;
            
            return {
                variable,
                'With Product': impactWith,
                'Without Product': impactWithout
            };
        });
    }, [selectedVariable, selectedBarChartVariables, correlationData, totalImpactTopWith, totalImpactTopWithout]);

    const renderBarChart = () => {
        if (!barChartRef.current || barChartData.length === 0) return;
        
        const container = barChartRef.current.parentElement;
        if (!container) return;
        
        const width = container.offsetWidth || 800;
        const height = 500;
        
        // Calculate dynamic margins based on variable name lengths and axis labels
        const maxVarLength = barChartData.length > 0 
            ? Math.max(...barChartData.map(d => d.variable.length), 10) 
            : 10;
        
        // Increased left margin for y-axis labels with padding
        const yAxisLabelWidth = Math.max(70, barChartYAxisLabel.length * 6);
        const leftMargin = Math.max(120, yAxisLabelWidth + 30);
        
        // Increased bottom margin for rotated x-axis labels
        const bottomMargin = Math.max(120, maxVarLength * 5);
        
        const margin = { 
            top: 80, 
            right: 120, 
            bottom: bottomMargin, 
            left: leftMargin
        };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        
        d3.select(barChartRef.current).selectAll("*").remove();
        
        const svg = d3.select(barChartRef.current)
            .attr("width", width)
            .attr("height", height);
        
        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
        const x0Scale = d3.scaleBand()
            .domain(barChartData.map(d => d.variable))
            .range([0, chartWidth])
            .paddingInner(0.2)
            .paddingOuter(0.1);
        
        const x1Scale = d3.scaleBand()
            .domain(['With Product', 'Without Product'])
            .range([0, x0Scale.bandwidth()])
            .padding(0.1);
        
        const maxValue = d3.max(barChartData, d => Math.max(d['With Product'], d['Without Product']));
        const yScale = d3.scaleLinear()
            .domain([0, maxValue * 1.1])
            .range([chartHeight, 0]);
        
        const colorScale = d3.scaleOrdinal()
            .domain(['With Product', 'Without Product'])
            .range([barChartWithProductColor, barChartWithoutProductColor]);
        
        const xAxis = g.append("g")
            .attr("transform", `translate(0,${chartHeight})`)
            .call(d3.axisBottom(x0Scale))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .attr("dx", "-0.5em")
            .attr("dy", "0.8em")
            .style("text-anchor", "end")
            .style("font-size", "12px");
        
        const yAxis = g.append("g")
            .call(d3.axisLeft(yScale).ticks(10).tickFormat(d => `${d.toFixed(1)}%`))
            .style("font-size", "12px");
        
        // Add spacing to y-axis labels to prevent overlap
        yAxis.selectAll("text")
            .attr("dx", "-0.8em")
            .style("text-anchor", "end");
        
        g.append("g")
            .attr("class", "grid")
            .attr("transform", `translate(0,${chartHeight})`)
            .call(d3.axisBottom(x0Scale)
                .tickSize(-chartHeight)
                .tickFormat(""))
            .selectAll("line")
            .style("stroke", "#e0e0e0")
            .style("stroke-dasharray", "3,3");
        
        g.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(yScale)
                .ticks(10)
                .tickSize(-chartWidth)
                .tickFormat(""))
            .selectAll("line")
            .style("stroke", "#e0e0e0")
            .style("stroke-dasharray", "3,3");
        
        const groups = g.selectAll(".group")
            .data(barChartData)
            .enter()
            .append("g")
            .attr("class", "group")
            .attr("transform", d => `translate(${x0Scale(d.variable)},0)`);
        
        groups.selectAll("rect")
            .data(d => ['With Product', 'Without Product'].map(key => ({ key, value: d[key] })))
            .enter()
            .append("rect")
            .attr("x", d => x1Scale(d.key))
            .attr("y", d => yScale(d.value))
            .attr("width", x1Scale.bandwidth())
            .attr("height", d => chartHeight - yScale(d.value))
            .attr("fill", d => colorScale(d.key))
            .attr("stroke", "#333")
            .attr("stroke-width", 1)
            .on("mouseover", function(event, d) {
                d3.select(this).attr("opacity", 0.7);
                const [mouseX, mouseY] = d3.pointer(event, g.node());
                const tooltip = g.append("g")
                    .attr("class", "tooltip")
                    .attr("transform", `translate(${mouseX},${mouseY - 10})`);
                
                tooltip.append("rect")
                    .attr("x", -50)
                    .attr("y", -25)
                    .attr("width", 100)
                    .attr("height", 40)
                    .attr("fill", "rgba(0,0,0,0.8)")
                    .attr("rx", 4);
                
                tooltip.append("text")
                    .attr("text-anchor", "middle")
                    .attr("fill", "white")
                    .attr("font-size", "11px")
                    .attr("dy", "-5")
                    .text(`${d.key}`);
                
                tooltip.append("text")
                    .attr("text-anchor", "middle")
                    .attr("fill", "white")
                    .attr("font-size", "12px")
                    .attr("dy", "10")
                    .attr("font-weight", "bold")
                    .text(`${d.value.toFixed(2)}%`);
            })
            .on("mouseout", function() {
                d3.select(this).attr("opacity", 1);
                g.selectAll(".tooltip").remove();
            });
        
        // X axis label with increased spacing
        g.append("text")
            .attr("x", chartWidth / 2)
            .attr("y", chartHeight + bottomMargin - 25)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "600")
            .text(barChartXAxisLabel);
        
        // Y axis label with increased margin
        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -chartHeight / 2)
            .attr("y", -(margin.left - 20))
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "600")
            .text(barChartYAxisLabel);
        
        const legend = g.append("g")
            .attr("transform", `translate(${chartWidth - 150}, 10)`);
        
        const legendData = [
            { label: 'With Product', color: barChartWithProductColor },
            { label: 'Without Product', color: barChartWithoutProductColor }
        ];
        
        legendData.forEach((item, i) => {
            const legendItem = legend.append("g")
                .attr("transform", `translate(0, ${i * 25})`);
            
            legendItem.append("rect")
                .attr("width", 18)
                .attr("height", 18)
                .attr("fill", item.color)
                .attr("stroke", "#333")
                .attr("stroke-width", 1);
            
            legendItem.append("text")
                .attr("x", 25)
                .attr("y", 14)
                .attr("font-size", "12px")
                .text(item.label);
        });
        
        if (showPoweredBy) {
            const logoSize = isMobile ? 16 : 22;
            const fontSize1 = isMobile ? '6px' : '8px';
            const fontSize2 = isMobile ? '7px' : '9px';
            const padding = isMobile ? 2 : 4;
            const textGap = isMobile ? 4 : 6;
            
            // Calculate watermark dimensions based on text content
            // Estimate text width: "Abhitech's AbhiStat" is the longest text
            const estimatedTextWidth = isMobile ? 70 : 90;
            const watermarkWidth = logoSize + textGap + estimatedTextWidth + (padding * 2);
            const watermarkHeight = isMobile ? 24 : 30;
            
            // Ensure enough right margin to prevent cutoff
            const rightMargin = isMobile ? 15 : 60;
            const watermarkX = Math.max(0, width - watermarkWidth - rightMargin);
            const watermarkY = isMobile ? 5 : 0;
            
            // Background rectangle with proper sizing
            svg.append("rect")
                .attr("x", watermarkX)
                .attr("y", watermarkY)
                .attr("width", watermarkWidth)
                .attr("height", watermarkHeight)
                .attr("fill", "rgba(255, 255, 255, 0.95)")
                .attr("stroke", "rgba(0, 0, 0, 0.1)")
                .attr("stroke-width", 1)
                .attr("rx", 4)
                .style("filter", "drop-shadow(0 1px 3px rgba(0,0,0,0.1))");
            
            // Logo image - using native DOM for xlink namespace
            const logoX = watermarkX + padding;
            const logoY = watermarkY + padding;
            const logoGroup = svg.append("g")
                .attr("transform", `translate(${logoX}, ${logoY})`);
            
            const logoElement = document.createElementNS("http://www.w3.org/2000/svg", "image");
            logoElement.setAttributeNS("http://www.w3.org/1999/xlink", "href", logo);
            logoElement.setAttribute("width", logoSize);
            logoElement.setAttribute("height", logoSize);
            logoElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
            logoElement.style.borderRadius = "50%";
            logoElement.style.filter = "drop-shadow(0 1px 2px rgba(0,0,0,0.2))";
            logoGroup.node().appendChild(logoElement);
            
            // Text group with proper alignment
            const textX = watermarkX + logoSize + textGap;
            const textY = watermarkY + padding;
            const textGroup = svg.append("g")
                .attr("transform", `translate(${textX}, ${textY})`);
            
            // "Powered by" text - adjusted positioning
            textGroup.append("text")
                .attr("x", 0)
                .attr("y", isMobile ? 6 : 7)
                .attr("font-size", fontSize1)
                .attr("fill", "#666")
                .attr("font-family", "Arial, sans-serif")
                .style("line-height", "1")
                .style("alignment-baseline", "hanging")
                .text("Powered by");
            
            // "Abhitech's AbhiStat" text - adjusted positioning with proper spacing
            textGroup.append("text")
                .attr("x", 0)
                .attr("y", isMobile ? 14 : 16)
                .attr("font-size", fontSize2)
                .attr("fill", "#1976d2")
                .attr("font-family", "Arial, sans-serif")
                .attr("font-weight", "bold")
                .style("line-height", "1.1")
                .style("alignment-baseline", "hanging")
                .text("Abhitech's AbhiStat");
        }
    };

    useEffect(() => {
        if (barChartData.length > 0 && barChartRef.current) {
            renderBarChart();
        }
        
        const handleResize = () => {
            if (barChartData.length > 0 && barChartRef.current) {
                renderBarChart();
            }
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [barChartData, barChartWithProductColor, barChartWithoutProductColor, barChartXAxisLabel, barChartYAxisLabel, showPoweredBy]);

    const downloadBarChartAsPNG = () => {
        if (!barChartRef.current) return;
        
        const svgElement = barChartRef.current;
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        const scaleFactor = 2;
        canvas.width = svgElement.viewBox.baseVal.width * scaleFactor || 1200 * scaleFactor;
        canvas.height = svgElement.viewBox.baseVal.height * scaleFactor || 800 * scaleFactor;
        
        img.onload = () => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = 'black';
            ctx.font = `${16 * scaleFactor}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(`Impact Analysis Bar Chart: ${selectedVariable}`, canvas.width / 2, 30 * scaleFactor);
            
            ctx.drawImage(img, 0, 50 * scaleFactor, canvas.width, canvas.height - 100 * scaleFactor);
            
            const logoImg = new Image();
            logoImg.src = logo;
            logoImg.onload = () => {
                const watermarkX = canvas.width - 160 * scaleFactor - 10 * scaleFactor;
                const watermarkY = 10 * scaleFactor;
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                ctx.fillRect(watermarkX, watermarkY, 160 * scaleFactor, 36 * scaleFactor);
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.lineWidth = scaleFactor;
                ctx.strokeRect(watermarkX, watermarkY, 160 * scaleFactor, 36 * scaleFactor);
                
                ctx.drawImage(logoImg, watermarkX + 8 * scaleFactor, watermarkY + 6 * scaleFactor, 24 * scaleFactor, 24 * scaleFactor);
                
                ctx.fillStyle = '#666';
                ctx.font = `${10 * scaleFactor}px Arial`;
                ctx.textAlign = 'left';
                ctx.fillText('Powered by', watermarkX + 40 * scaleFactor, watermarkY + 18 * scaleFactor);
                
                ctx.fillStyle = '#1976d2';
                ctx.font = `bold ${11 * scaleFactor}px Arial`;
                ctx.fillText("Abhitech's AbhiStat", watermarkX + 40 * scaleFactor, watermarkY + 30 * scaleFactor);
                
                const link = document.createElement('a');
                const fileName = generateFileName(`CorrelationAnalysis_${selectedVariable}`);
                link.download = `${fileName}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            };
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    const downloadPageAsPNG = async () => {
        if (!pageRef.current) return;
        const node = pageRef.current;
        const scaleFactor = 2;
        const canvas = await html2canvas(node, {
            backgroundColor: '#ffffff',
            scale: scaleFactor,
            useCORS: true,
            allowTaint: true,
            logging: false,
            windowWidth: document.documentElement.scrollWidth,
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
        finalCtx.fillText('Correlation Analysis', finalCanvas.width / 2, 30 * scaleFactor);
        finalCtx.font = `${14 * scaleFactor}px Arial`;
        finalCtx.fillText(`Base Variable: ${selectedVariable}`, finalCanvas.width / 2, 55 * scaleFactor);

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
            const fileName = generateFileName(`CorrelationAnalysis_Page_${selectedVariable}`);
            link.download = `${fileName}.png`;
            link.href = finalCanvas.toDataURL('image/png');
            link.click();
        };
        watermarkImg.src = logo;
    };
    
    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }} ref={pageRef}>
            {/* Control Panel */}
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
                <CardContent>
                    <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} alignItems="center">
                        <Grid item xs={12} sm={12} md={5}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main', fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
                                Select Base Variable
                            </Typography>
                            <Autocomplete
                                id='correlation-column-select'
                                options={availableColumns}
                                value={selectedVariable}
                                onChange={(event, newValue) => {
                                    if (newValue) {
                                        setSelectedVariable(newValue);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Variable"
                                        variant="outlined"
                                        fullWidth
                                        size={isMobile ? "small" : "medium"}
                                    />
                                )}
                                disableClearable
                                autoHighlight
                                openOnFocus
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            
            {/* Summary Cards */}
            <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={6}>
                    <Card 
                        sx={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                            color: 'white',
                            borderRadius: 2,
                            boxShadow: 3,
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 6
                            }
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <AnalyticsIcon sx={{ mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' } }}>
                                    With Product - Total Impact
                                </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
                                {isNaN(totalImpactTopWith) ? '0.000' : totalImpactTopWith.toFixed(3)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={6}>
                    <Card 
                        sx={{ 
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
                            color: 'white',
                            borderRadius: 2,
                            boxShadow: 3,
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 6
                            }
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <AnalyticsIcon sx={{ mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' } }}>
                                    Without Product - Total Impact
                                </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
                                {isNaN(totalImpactTopWithout) ? '0.000' : totalImpactTopWithout.toFixed(3)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            
            {/* Correlation Table */}
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
                        Correlation Values
                    </Typography>
                    <TableContainer sx={{ 
                        maxHeight: { xs: 400, sm: 500, md: 600 },
                        overflow: 'auto',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                    }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.8125rem', sm: '0.875rem' }, bgcolor: 'grey.100', color: 'text.primary' }}>Variable</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: { xs: '0.8125rem', sm: '0.875rem' }, bgcolor: 'grey.100', color: 'text.primary' }}>With Product</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: { xs: '0.8125rem', sm: '0.875rem' }, bgcolor: 'grey.100', color: 'text.primary' }}>Without Product</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: { xs: '0.8125rem', sm: '0.875rem' }, bgcolor: 'grey.100', color: 'text.primary' }}>% Impact (With)</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: { xs: '0.8125rem', sm: '0.875rem' }, bgcolor: 'grey.100', color: 'text.primary' }}>% Impact (Without)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {correlationData.topWithProduct.map((item, index) => {
                                    const withoutItem = correlationData.withoutProduct.find(w => w.variable === item.variable);
                                    const impactWith = totalImpactTopWith > 0 ? (item.absCorrelation / totalImpactTopWith * 100).toFixed(2) : '0.00';
                                    const impactWithout = totalImpactTopWithout > 0 && withoutItem ? (withoutItem.absCorrelation / totalImpactTopWithout * 100).toFixed(2) : '0.00';
                                    
                                    return (
                                        <TableRow 
                                            key={item.variable}
                                            sx={{ 
                                                '&:hover': { bgcolor: 'action.hover' },
                                                bgcolor: index % 2 === 0 ? 'background.paper' : 'grey.50'
                                            }}
                                        >
                                            <TableCell sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' }, fontWeight: 500 }}>{item.variable}</TableCell>
                                            <TableCell align="right" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>{item.correlation.toFixed(3)}</TableCell>
                                            <TableCell align="right" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>{withoutItem ? withoutItem.correlation.toFixed(3) : 'N/A'}</TableCell>
                                            <TableCell align="right" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' }, fontWeight: 600, color: 'primary.main' }}>{impactWith}%</TableCell>
                                            <TableCell align="right" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' }, fontWeight: 600, color: 'secondary.main' }}>{impactWithout}%</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Bar Chart Section */}
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
                            Impact Analysis Bar Chart
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <MuiTooltip title="Bar Chart Settings">
                                <Button
                                    id='bar-chart-settings-btn'
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => setShowBarChartSettings(true)}
                                    startIcon={<SettingsIcon />}
                                    size="small"
                                    sx={{
                                        textTransform: 'none',
                                        height: 32,
                                        border: "1px solid",
                                        borderColor: "primary.main",
                                        "&:hover": {
                                            backgroundColor: "primary.light",
                                            color: "white",
                                            transform: "scale(1.02)",
                                        }
                                    }}
                                >
                                    Settings
                                </Button>
                            </MuiTooltip>
                            
                            <SaveVisualizationButton 
                                elementId="visualization-content" 
                                fileNamePrefix="correlation_analysis"
                                variableNames={selectedVariable}
                            />

                            <MuiTooltip title="Download Bar Chart as PNG">
                                <Button
                                    id='bar-chart-download-btn'
                                    variant="outlined"
                                    color="primary"
                                    onClick={downloadBarChartAsPNG}
                                    startIcon={<DownloadIcon />}
                                    size="small"
                                    sx={{
                                        textTransform: 'none',
                                        height: 32,
                                        border: "1px solid",
                                        borderColor: "primary.main",
                                        "&:hover": {
                                            backgroundColor: "primary.light",
                                            color: "white",
                                            transform: "scale(1.02)",
                                        }
                                    }}
                                >
                                    Download PNG
                                </Button>
                            </MuiTooltip>
                        </Box>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={12} md={6}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main', fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
                                Select Variables for Bar Chart
                            </Typography>
                            <Autocomplete
                                multiple
                                options={allTopVariables}
                                value={selectedBarChartVariables}
                                onChange={(event, newValue) => {
                                    setSelectedBarChartVariables(newValue);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Variables"
                                        variant="outlined"
                                        fullWidth
                                        size={isMobile ? "small" : "medium"}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props} key={option}>
                                        <Checkbox
                                            checked={selectedBarChartVariables.indexOf(option) > -1}
                                            sx={{ mr: 1 }}
                                        />
                                        {option}
                                    </li>
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            {...getTagProps({ index })}
                                            key={option}
                                            label={option}
                                            size="small"
                                        />
                                    ))
                                }
                            />
                        </Grid>
                    </Grid>

                    {barChartData.length > 0 ? (
                        <Box sx={{ width: '100%', overflowX: 'auto' }}>
                            <Box sx={{ width: '100%', minWidth: '800px' }} className="abhitech-plot-area">
                                <svg ref={barChartRef} style={{ display: 'block', width: '100%', height: '500px' }}></svg>
                            </Box>
                        </Box>
                    ) : (
                        <Alert severity="info" sx={{ width: '100%', my: 3 }}>
                            Please select variables to display in the bar chart.
                        </Alert>
                    )}
                </CardContent>
            </Card>
            
            {/* Chart Settings Modal */}
            <ChartSettingsModal
                open={showSettings}
                onClose={() => setShowSettings(false)}
                title="Heatmap Settings"
                settings={[
                    {
                        label: "Cell Size",
                        type: "slider",
                        value: cellSize,
                        onChange: setCellSize,
                        min: 40,
                        max: 100,
                        step: 5,
                    },
                    {
                        label: "Font Size",
                        type: "slider",
                        value: fontSize,
                        onChange: setFontSize,
                        min: 8,
                        max: 16,
                        step: 1,
                    },
                    {
                        label: "Color Scheme",
                        type: "select",
                        value: colorScheme,
                        onChange: setColorScheme,
                        options: [
                            { value: "RdYlBu", label: "Red-Yellow-Blue" },
                            { value: "RdBu", label: "Red-Blue" },
                            { value: "Spectral", label: "Spectral" },
                            { value: "Blues", label: "Blues" },
                            { value: "Reds", label: "Reds" },
                            { value: "custom", label: "Custom Colors" },
                        ],
                    },
                    {
                        label: "Show Powered By",
                        type: "switch",
                        value: showPoweredBy,
                        onChange: setShowPoweredBy,
                    },
                    {
                        label: "X-Axis Label",
                        type: "text",
                        value: xAxisLabel,
                        onChange: setXAxisLabel,
                    },
                    {
                        label: "Y-Axis Label",
                        type: "text",
                        value: yAxisLabel,
                        onChange: setYAxisLabel,
                    },
                    {
                        label: "Max Variables",
                        type: "slider",
                        value: maxVariables,
                        onChange: setMaxVariables,
                        min: 5,
                        max: 15,
                        step: 1,
                    },
                ]}
            />
            
            {/* Custom Color Picker Modal (shown when colorScheme is 'custom') */}
            {colorScheme === 'custom' && (
                <Box sx={{ mt: 2 }}>
                    <Card sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                            Custom Colors
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Negative Color"
                                    type="color"
                                    value={customColors.negative}
                                    onChange={(e) => setCustomColors({ ...customColors, negative: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Zero Color"
                                    type="color"
                                    value={customColors.zero}
                                    onChange={(e) => setCustomColors({ ...customColors, zero: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Positive Color"
                                    type="color"
                                    value={customColors.positive}
                                    onChange={(e) => setCustomColors({ ...customColors, positive: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                    </Card>
                </Box>
            )}

            {/* Bar Chart Settings Modal */}
            <ChartSettingsModal
                open={showBarChartSettings}
                onClose={() => setShowBarChartSettings(false)}
                onApply={() => setShowBarChartSettings(false)}
                onReset={() => {
                    setBarChartWithProductColor('#3B82F6');
                    setBarChartWithoutProductColor('#EF4444');
                    setBarChartXAxisLabel('Variables');
                    setBarChartYAxisLabel('% Impact');
                }}
                title="Bar Chart Settings"
                description="Customize bar colors and axis labels"
                featureSections={[
                    <Box key="bar-chart-settings">
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
                            Colors
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
                                        With Product Color
                                    </Typography>
                                    <TextField
                                        type="color"
                                        value={barChartWithProductColor}
                                        onChange={(e) => setBarChartWithProductColor(e.target.value)}
                                        fullWidth
                                        size="small"
                                        InputProps={{
                                            style: { height: '40px' }
                                        }}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
                                        Without Product Color
                                    </Typography>
                                    <TextField
                                        type="color"
                                        value={barChartWithoutProductColor}
                                        onChange={(e) => setBarChartWithoutProductColor(e.target.value)}
                                        fullWidth
                                        size="small"
                                        InputProps={{
                                            style: { height: '40px' }
                                        }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                        <Typography variant="h6" sx={{ mb: 3, mt: 4, fontWeight: 600, color: '#333' }}>
                            Axis Labels
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
                                        X-Axis Label
                                    </Typography>
                                    <DebouncedTextField
                                        value={barChartXAxisLabel}
                                        onChange={(e) => setBarChartXAxisLabel(e.target.value)}
                                        fullWidth
                                        size="small"
                                        placeholder="Variables"
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
                                        Y-Axis Label
                                    </Typography>
                                    <DebouncedTextField
                                        value={barChartYAxisLabel}
                                        onChange={(e) => setBarChartYAxisLabel(e.target.value)}
                                        fullWidth
                                        size="small"
                                        placeholder="% Impact"
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                ]}
                colorSection={false}
            />
        </Box>
    );
};

export default CorrelationAnalysisTab;
