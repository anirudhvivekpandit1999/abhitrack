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
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Collapse,
    useTheme,
    useMediaQuery,
    Paper,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import logo from '../../assets/abhitech-logo.png';
import * as d3 from 'd3';
import { isDateColumn, parseValueForPlot } from '../../utils/dateUtils';

const CorrelationAnalysisTab = ({ availableColumns, withProductData, withoutProductData, clientName = '', plantName = '', productName = '' }) => {
    const [selectedVariable, setSelectedVariable] = useState('');
    const [showCorrelationList, setShowCorrelationList] = useState(false);
    const [colorScheme] = useState('RdYlBu');
    const [cellSize] = useState(60);
    const [fontSize] = useState(12);
    const [showPoweredBy] = useState(true);
    const [customColors] = useState({
        negative: '#313695',
        zero: '#FFFFBF',
        positive: '#A50026'
    });

    const heatmapRef = useRef(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const ui = {
        page: {
            minHeight: '100%',
            background: 'linear-gradient(180deg, #F7F9FC 0%, #FFFFFF 42%)',
            borderRadius: 3,
        },
        surface: {
            border: '1px solid #E5EAF2',
            borderRadius: 3,
            boxShadow: '0 8px 28px rgba(15, 23, 42, 0.055)',
            backgroundImage: 'none',
        },
        softSurface: {
            border: '1px solid #E8EDF5',
            borderRadius: 2.5,
            backgroundColor: '#FAFBFD',
        },
    };

    useEffect(() => {
        if (availableColumns.length > 0) {
            setSelectedVariable(availableColumns[0]);
        }
    }, [availableColumns]);

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
        const all = [...(withProductData || []), ...(withoutProductData || [])];
        const baseIsDate = isDateColumn(all, selectedVariable);
        const otherColumns = availableColumns.filter(col => col !== selectedVariable);
        const dataWithProduct = [];
        const dataWithoutProduct = [];

        otherColumns.forEach(column => {
            const otherIsDate = isDateColumn(all, column);
            const withProductPairs = [];
            (withProductData || []).forEach(row => {
                const baseVal = parseValueForPlot(row[selectedVariable], baseIsDate);
                const otherVal = parseValueForPlot(row[column], otherIsDate);
                if (baseVal != null && otherVal != null) {
                    withProductPairs.push({ base: baseVal, other: otherVal });
                }
            });
            const withoutProductPairs = [];
            (withoutProductData || []).forEach(row => {
                const baseVal = parseValueForPlot(row[selectedVariable], baseIsDate);
                const otherVal = parseValueForPlot(row[column], otherIsDate);
                if (baseVal != null && otherVal != null) {
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

        const sortedWith    = [...dataWithProduct].sort((a, b) => b.absCorrelation - a.absCorrelation);
        const sortedWithout = [...dataWithoutProduct].sort((a, b) => b.absCorrelation - a.absCorrelation);

        const topWithProduct    = sortedWith.slice(0, 20);
        const topWithoutProduct = sortedWithout.slice(0, 20);

        return { withProduct: sortedWith, withoutProduct: sortedWithout, topWithProduct, topWithoutProduct };
    }, [selectedVariable, withProductData, withoutProductData, availableColumns]);

    const correlationSummary = useMemo(() => {
        const withItems = correlationData.withProduct || [];
        const withoutItems = correlationData.withoutProduct || [];

        const strongestWith = withItems[0] || null;
        const strongestWithout = withoutItems[0] || null;

        const comparable = withItems
            .map(item => {
                const other = withoutItems.find(x => x.variable === item.variable);
                if (!other) return null;
                return {
                    variable: item.variable,
                    delta: item.correlation - other.correlation,
                    absDelta: Math.abs(item.correlation - other.correlation),
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.absDelta - a.absDelta);

        return {
            strongestWith,
            strongestWithout,
            largestShift: comparable[0] || null,
            comparedCount: comparable.length,
        };
    }, [correlationData]);

    const getColorScheme = (scheme) => {
        const schemes = {
            RdYlBu:   d3.interpolateRdYlBu,
            RdBu:     d3.interpolateRdBu,
            Spectral:  d3.interpolateSpectral,
            Blues:    d3.scaleSequential(d3.interpolateBlues),
            Reds:     d3.scaleSequential(d3.interpolateReds)
        };
        return schemes[scheme] || schemes.RdYlBu;
    };

    const getCorrelationColor = (correlation) => {
        if (colorScheme === 'custom') {
            const scaled = (correlation + 1) / 2;
            if (scaled < 0.5) {
                return d3.interpolateRgb(customColors.negative, customColors.zero)(scaled * 2);
            } else {
                return d3.interpolateRgb(customColors.zero, customColors.positive)((scaled - 0.5) * 2);
            }
        }
        const scaled = (correlation + 1) / 2;
        return getColorScheme(colorScheme)(scaled);
    };

    const renderHeatmap = () => {
        if (correlationData.withProduct.length === 0 && correlationData.withoutProduct.length === 0) {
            return (
                <Alert severity="info" sx={{ width: '100%', my: 3 }}>
                    No correlation data available. Please select variables and ensure data quality.
                </Alert>
            );
        }

        
        const allVariables = correlationData.withProduct.length > 0
            ? correlationData.withProduct.map(i => i.variable)
            : correlationData.withoutProduct.map(i => i.variable);

        const cellSpacing    = 10;
        const rowHeight      = cellSize + cellSpacing;
        const maxVarLength   = Math.max(...allVariables.map(v => v.length), 10);
        const varLabelWidth  = Math.max(200, maxVarLength * 7 + 20);
        const heatCellWidth  = cellSize;
        const marginTop      = 80;
        const marginBottom   = 60;
        const paddingLeft    = 20;
        const paddingRight   = 20;
        const chartHeight    = allVariables.length * rowHeight;

        const totalWidth  = Math.max(1200, (varLabelWidth + heatCellWidth) * 2 + 100);
        const totalHeight = marginTop + chartHeight + marginBottom;

        const leftLabelStartX = paddingLeft;
        const leftLabelEndX   = leftLabelStartX + varLabelWidth;
        const leftCellX       = leftLabelEndX;

        const rightSideStartX  = totalWidth / 2;
        const rightLabelEndX   = rightSideStartX + varLabelWidth;
        const rightCellX       = rightLabelEndX;

        return (
            <Box sx={{ overflowX: 'auto', overflowY: 'auto', maxWidth: '100%' }} className="abhitech-plot-area">
                <svg
                    ref={heatmapRef}
                    width={totalWidth}
                    height={totalHeight}
                    viewBox={`0 0 ${totalWidth} ${totalHeight}`}
                >
                    <rect width={totalWidth} height={totalHeight} fill="white" />

                    <g transform={`translate(0, ${marginTop})`}>

                        

                        <text
                            x={leftLabelEndX + heatCellWidth / 2}
                            y={-25}
                            fontSize={fontSize + 4}
                            textAnchor="middle"
                            fill="#1976d2"
                            fontWeight="800"
                        >
                            With Product
                        </text>

                        {allVariables.map((variable, idx) => {
                            const truncated = variable.length > 28
                                ? variable.substring(0, 25) + '...'
                                : variable;
                            return (
                                <text
                                    key={`left-lbl-${variable}`}
                                    x={leftLabelEndX - 8}
                                    y={idx * rowHeight + cellSize / 2}
                                    fontSize={fontSize - 1}
                                    textAnchor="end"
                                    alignmentBaseline="middle"
                                    fill="#333"
                                    fontWeight="500"
                                >
                                    {truncated}
                                </text>
                            );
                        })}

                        {allVariables.map((_, idx) => (
                            <line
                                key={`left-hg-${idx}`}
                                x1={leftCellX}
                                y1={idx * rowHeight}
                                x2={leftCellX + heatCellWidth}
                                y2={idx * rowHeight}
                                stroke="#e5e5e5"
                                strokeWidth={0.8}
                            />
                        ))}

                        {allVariables.map((variable, idx) => {
                            const item = correlationData.withProduct.find(d => d.variable === variable);
                            if (!item) return null;
                            const color     = getCorrelationColor(item.correlation);
                            const textColor = Math.abs(item.correlation) > 0.5 ? '#fff' : '#333';
                            return (
                                <g key={`left-cell-${variable}`}>
                                    <rect
                                        x={leftCellX}
                                        y={idx * rowHeight}
                                        width={heatCellWidth}
                                        height={cellSize}
                                        fill={color}
                                        stroke="#fff"
                                        strokeWidth={1.5}
                                        rx={4}
                                        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))' }}
                                    />
                                    <text
                                        x={leftCellX + heatCellWidth / 2}
                                        y={idx * rowHeight + cellSize / 2}
                                        fontSize={fontSize - 1}
                                        fill={textColor}
                                        textAnchor="middle"
                                        alignmentBaseline="middle"
                                        fontWeight="bold"
                                    >
                                        {item.correlation.toFixed(2)}
                                    </text>
                                </g>
                            );
                        })}

                        

                        <text
                            x={rightCellX + heatCellWidth / 2}
                            y={-25}
                            fontSize={fontSize + 4}
                            textAnchor="middle"
                            fill="#d32f2f"
                            fontWeight="800"
                        >
                            Without Product
                        </text>

                        {allVariables.map((variable, idx) => {
                            const truncated = variable.length > 28
                                ? variable.substring(0, 25) + '...'
                                : variable;
                            return (
                                <text
                                    key={`right-lbl-${variable}`}
                                    x={rightLabelEndX - 8}
                                    y={idx * rowHeight + cellSize / 2}
                                    fontSize={fontSize - 1}
                                    textAnchor="end"
                                    alignmentBaseline="middle"
                                    fill="#333"
                                    fontWeight="500"
                                >
                                    {truncated}
                                </text>
                            );
                        })}

                        {allVariables.map((_, idx) => (
                            <line
                                key={`right-hg-${idx}`}
                                x1={rightCellX}
                                y1={idx * rowHeight}
                                x2={rightCellX + heatCellWidth}
                                y2={idx * rowHeight}
                                stroke="#e5e5e5"
                                strokeWidth={0.8}
                            />
                        ))}

                        {allVariables.map((variable, idx) => {
                            const item = correlationData.withoutProduct.find(d => d.variable === variable);
                            if (!item) return null;
                            const color     = getCorrelationColor(item.correlation);
                            const textColor = Math.abs(item.correlation) > 0.5 ? '#fff' : '#333';
                            return (
                                <g key={`right-cell-${variable}`}>
                                    <rect
                                        x={rightCellX}
                                        y={idx * rowHeight}
                                        width={heatCellWidth}
                                        height={cellSize}
                                        fill={color}
                                        stroke="#fff"
                                        strokeWidth={1.5}
                                        rx={4}
                                        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))' }}
                                    />
                                    <text
                                        x={rightCellX + heatCellWidth / 2}
                                        y={idx * rowHeight + cellSize / 2}
                                        fontSize={fontSize - 1}
                                        fill={textColor}
                                        textAnchor="middle"
                                        alignmentBaseline="middle"
                                        fontWeight="bold"
                                    >
                                        {item.correlation.toFixed(2)}
                                    </text>
                                </g>
                            );
                        })}

                    </g>

                    {showPoweredBy && (
                        <g transform={`translate(${totalWidth - 20}, ${totalHeight - 35})`}>
                            <text x={0} y={0}  fontSize="11" fill="#666"    textAnchor="end">Powered by</text>
                            <text x={0} y={16} fontSize="13" fill="#1976d2" textAnchor="end" fontWeight="bold">
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
        const svgData    = new XMLSerializer().serializeToString(svgElement);
        const canvas     = document.createElement('canvas');
        const ctx        = canvas.getContext('2d');
        const img        = new Image();
        const scaleFactor = 2;
        canvas.width  = (svgElement.viewBox.baseVal.width  || 1200) * scaleFactor;
        canvas.height = (svgElement.viewBox.baseVal.height || 800)  * scaleFactor;

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
                const wx = canvas.width - 160 * scaleFactor - 10 * scaleFactor;
                const wy = 10 * scaleFactor;
                ctx.fillStyle = 'rgba(255,255,255,0.95)';
                ctx.fillRect(wx, wy, 160 * scaleFactor, 36 * scaleFactor);
                ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                ctx.lineWidth = scaleFactor;
                ctx.strokeRect(wx, wy, 160 * scaleFactor, 36 * scaleFactor);
                ctx.drawImage(logoImg, wx + 8 * scaleFactor, wy + 6 * scaleFactor, 24 * scaleFactor, 24 * scaleFactor);
                ctx.fillStyle = '#666';
                ctx.font = `${10 * scaleFactor}px Arial`;
                ctx.textAlign = 'left';
                ctx.fillText('Powered by', wx + 40 * scaleFactor, wy + 18 * scaleFactor);
                ctx.fillStyle = '#1976d2';
                ctx.font = `bold ${11 * scaleFactor}px Arial`;
                ctx.fillText("Abhitech's AbhiStat", wx + 40 * scaleFactor, wy + 30 * scaleFactor);
                const link = document.createElement('a');
                link.download = `CorrelationAnalysis_${selectedVariable}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            };
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    const formatCorrelation = (value) => (
        typeof value === 'number' && Number.isFinite(value) ? value.toFixed(3) : 'N/A'
    );

    const strengthLabel = (value) => {
        const abs = Math.abs(value || 0);
        if (abs >= 0.8) return 'Very strong';
        if (abs >= 0.6) return 'Strong';
        if (abs >= 0.4) return 'Moderate';
        if (abs >= 0.2) return 'Weak';
        return 'Very weak';
    };

    const metricCards = [
        {
            label: 'Strongest with product',
            value: correlationSummary.strongestWith ? formatCorrelation(correlationSummary.strongestWith.correlation) : 'N/A',
            helper: correlationSummary.strongestWith?.variable || 'No comparable variable',
            icon: <TrendingUpRoundedIcon />,
            iconBg: '#EFF6FF',
            iconColor: '#2563EB',
        },
        {
            label: 'Strongest without product',
            value: correlationSummary.strongestWithout ? formatCorrelation(correlationSummary.strongestWithout.correlation) : 'N/A',
            helper: correlationSummary.strongestWithout?.variable || 'No comparable variable',
            icon: <TrendingDownRoundedIcon />,
            iconBg: '#FFF7ED',
            iconColor: '#EA580C',
        },
        {
            label: 'Largest correlation shift',
            value: correlationSummary.largestShift ? formatCorrelation(correlationSummary.largestShift.absDelta) : 'N/A',
            helper: correlationSummary.largestShift?.variable || 'No comparable variable',
            icon: <CompareArrowsRoundedIcon />,
            iconBg: '#F5F3FF',
            iconColor: '#7C3AED',
        },
    ];

    return (
        <Box sx={{ ...ui.page, p: { xs: 1.5, sm: 2.5, md: 3 } }}>

            <Card elevation={0} sx={{ ...ui.surface, mb: 2.5, overflow: 'hidden', position: 'relative' }}>
                <Box
                    sx={{
                        position: 'absolute',
                        width: 220,
                        height: 220,
                        borderRadius: '50%',
                        bgcolor: '#EFF6FF',
                        right: -85,
                        top: -125,
                        pointerEvents: 'none',
                    }}
                />
                <CardContent sx={{ p: { xs: 2, md: 2.75 }, '&:last-child': { pb: { xs: 2, md: 2.75 } }, position: 'relative' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: { xs: 'flex-start', md: 'center' },
                            justifyContent: 'space-between',
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 2,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2.5,
                                    bgcolor: '#172B4D',
                                    color: '#FFFFFF',
                                    display: 'grid',
                                    placeItems: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <InsightsOutlinedIcon />
                            </Box>
                            <Box>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 850,
                                        color: '#0F172A',
                                        letterSpacing: '-0.025em',
                                        fontSize: { xs: '1.25rem', md: '1.55rem' },
                                    }}
                                >
                                    Correlation Analysis
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748B', mt: 0.25 }}>
                                    Compare how each variable relates to the selected parameter with and without product.
                                </Typography>
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                px: 1.5,
                                py: 0.9,
                                borderRadius: 2,
                                bgcolor: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                minWidth: { xs: '100%', md: 220 },
                            }}
                        >
                            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontWeight: 700 }}>
                                BASE VARIABLE
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#172B4D', fontWeight: 750, mt: 0.15, wordBreak: 'break-word' }}>
                                {selectedVariable || 'Not selected'}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Paper elevation={0} sx={{ ...ui.softSurface, p: { xs: 1.5, sm: 2 }, mb: 2.5 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={7}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <TuneRoundedIcon sx={{ color: '#64748B', fontSize: 19 }} />
                            <Typography variant="body2" sx={{ fontWeight: 750, color: '#334155' }}>
                                Analysis variable
                            </Typography>
                        </Box>
                        <Autocomplete
                            options={availableColumns}
                            value={selectedVariable}
                            onChange={(event, newValue) => {
                                if (newValue) setSelectedVariable(newValue);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Search and select a variable"
                                    fullWidth
                                    size={isMobile ? 'small' : 'medium'}
                                />
                            )}
                            sx={{
                                bgcolor: '#FFFFFF',
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                            }}
                            disableClearable
                            autoHighlight
                            openOnFocus
                        />
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <Box
                            sx={{
                                height: '100%',
                                minHeight: 76,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                px: { md: 2 },
                                borderLeft: { xs: 'none', md: '1px solid #E2E8F0' },
                            }}
                        >
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>
                                COMPARISON
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#334155', fontWeight: 650, mt: 0.5 }}>
                                Pearson correlation · With Product vs Without Product
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', mt: 0.4 }}>
                                {correlationSummary.comparedCount} comparable variables
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={2} sx={{ mb: 2.5 }}>
                {metricCards.map((metric) => (
                    <Grid item xs={12} md={4} key={metric.label}>
                        <Paper elevation={0} sx={{ ...ui.surface, p: 2.25, height: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 650 }}>
                                        {metric.label}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color: '#0F172A',
                                            fontWeight: 850,
                                            fontSize: { xs: 26, md: 30 },
                                            lineHeight: 1.15,
                                            mt: 0.5,
                                        }}
                                    >
                                        {metric.value}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        title={metric.helper}
                                        sx={{
                                            color: '#64748B',
                                            display: 'block',
                                            mt: 0.75,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {metric.helper}
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: 2.25,
                                        display: 'grid',
                                        placeItems: 'center',
                                        bgcolor: metric.iconBg,
                                        color: metric.iconColor,
                                        flexShrink: 0,
                                    }}
                                >
                                    {metric.icon}
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Card elevation={0} sx={{ ...ui.surface, mb: 2.5 }}>
                <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, '&:last-child': { pb: { xs: 1.5, sm: 2.5 } } }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 1.5,
                            mb: 2,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Box
                                sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 2,
                                    bgcolor: '#EFF6FF',
                                    color: '#2563EB',
                                    display: 'grid',
                                    placeItems: 'center',
                                }}
                            >
                                <GridViewRoundedIcon fontSize="small" />
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#172B4D', lineHeight: 1.2 }}>
                                    Correlation Heatmap
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B' }}>
                                    Values range from -1 to +1. Stronger absolute values indicate stronger relationships.
                                </Typography>
                            </Box>
                        </Box>

                        <Button
                            variant="outlined"
                            onClick={downloadHeatmapAsPNG}
                            startIcon={<DownloadIcon />}
                            size="small"
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 1.75,
                                bgcolor: '#FFFFFF',
                            }}
                        >
                            Download PNG
                        </Button>
                    </Box>

                    <Box
                        sx={{
                            border: '1px solid #E5EAF2',
                            borderRadius: 2.5,
                            bgcolor: '#FFFFFF',
                            overflow: 'hidden',
                        }}
                    >
                        {renderHeatmap()}
                    </Box>

                    <Box
                        sx={{
                            mt: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 1.5,
                            color: '#64748B',
                        }}
                    >
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>Correlation strength:</Typography>
                        {[
                            ['0.00–0.19', 'Very weak'],
                            ['0.20–0.39', 'Weak'],
                            ['0.40–0.59', 'Moderate'],
                            ['0.60–0.79', 'Strong'],
                            ['0.80–1.00', 'Very strong'],
                        ].map(([range, label]) => (
                            <Typography key={range} variant="caption">
                                <Box component="span" sx={{ fontWeight: 750, color: '#334155' }}>{range}</Box> {label}
                            </Typography>
                        ))}
                    </Box>
                </CardContent>
            </Card>

            <Card elevation={0} sx={{ ...ui.surface, mb: 1 }}>
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <Box
                        onClick={() => setShowCorrelationList(prev => !prev)}
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            px: { xs: 2, sm: 2.5 },
                            py: 2,
                            transition: 'background-color .18s ease',
                            '&:hover': { bgcolor: '#FAFBFD' },
                        }}
                    >
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#172B4D' }}>
                                Highest Correlations
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                                Top {correlationData.topWithProduct.length} variables ranked by absolute With Product correlation
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                width: 34,
                                height: 34,
                                display: 'grid',
                                placeItems: 'center',
                                borderRadius: 2,
                                bgcolor: '#F1F5F9',
                                color: '#475569',
                            }}
                        >
                            <ExpandMoreIcon
                                sx={{
                                    transform: showCorrelationList ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.25s ease',
                                }}
                            />
                        </Box>
                    </Box>

                    <Collapse in={showCorrelationList}>
                        <Box sx={{ borderTop: '1px solid #E5EAF2' }}>
                            <TableContainer sx={{ maxHeight: 600 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 750, bgcolor: '#F8FAFC', color: '#64748B', width: 55 }}>#</TableCell>
                                            <TableCell sx={{ fontWeight: 750, bgcolor: '#F8FAFC', color: '#334155' }}>Variable</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 750, bgcolor: '#F8FAFC', color: '#2563EB' }}>With Product</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 750, bgcolor: '#F8FAFC', color: '#EA580C' }}>Without Product</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 750, bgcolor: '#F8FAFC', color: '#64748B' }}>Strength</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {correlationData.topWithProduct.map((item, index) => {
                                            const withoutItem = correlationData.withoutProduct.find(w => w.variable === item.variable);
                                            return (
                                                <TableRow
                                                    key={item.variable}
                                                    sx={{
                                                        '&:hover': { bgcolor: '#FAFBFD' },
                                                        '&:last-child td': { borderBottom: 0 },
                                                    }}
                                                >
                                                    <TableCell sx={{ color: '#94A3B8', fontWeight: 650 }}>{index + 1}</TableCell>
                                                    <TableCell sx={{ fontWeight: 650, color: '#334155' }}>{item.variable}</TableCell>
                                                    <TableCell align="right">
                                                        <Box component="span" sx={{ fontWeight: 800, color: '#2563EB' }}>
                                                            {formatCorrelation(item.correlation)}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Box component="span" sx={{ fontWeight: 800, color: '#EA580C' }}>
                                                            {withoutItem ? formatCorrelation(withoutItem.correlation) : 'N/A'}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Box
                                                            component="span"
                                                            sx={{
                                                                display: 'inline-flex',
                                                                px: 1,
                                                                py: 0.35,
                                                                borderRadius: 10,
                                                                bgcolor: '#F1F5F9',
                                                                color: '#475569',
                                                                fontSize: '0.72rem',
                                                                fontWeight: 750,
                                                            }}
                                                        >
                                                            {strengthLabel(item.correlation)}
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Collapse>
                </CardContent>
            </Card>
        </Box>
    );
};

export default CorrelationAnalysisTab;