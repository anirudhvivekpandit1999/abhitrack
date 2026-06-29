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
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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

        // Sort both by absCorrelation descending — show ALL parameters
        const sortedWith    = [...dataWithProduct].sort((a, b) => b.absCorrelation - a.absCorrelation);
        const sortedWithout = [...dataWithoutProduct].sort((a, b) => b.absCorrelation - a.absCorrelation);

        // topWithProduct used only for the collapsible table (top 20)
        const topWithProduct    = sortedWith.slice(0, 20);
        const topWithoutProduct = sortedWithout.slice(0, 20);

        return { withProduct: sortedWith, withoutProduct: sortedWithout, topWithProduct, topWithoutProduct };
    }, [selectedVariable, withProductData, withoutProductData, availableColumns]);

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

        // Use ALL variables from withProduct (sorted by abs correlation)
        // The right side (without product) will show the same variable list
        const allVariables = correlationData.withProduct.length > 0
            ? correlationData.withProduct.map(i => i.variable)
            : correlationData.withoutProduct.map(i => i.variable);

        // ── Layout ──
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

        // Total SVG width = full page width (1200px minimum)
        const totalWidth  = Math.max(1200, (varLabelWidth + heatCellWidth) * 2 + 100);
        const totalHeight = marginTop + chartHeight + marginBottom;

        // Left side starts at paddingLeft
        const leftLabelStartX = paddingLeft;
        const leftLabelEndX   = leftLabelStartX + varLabelWidth;
        const leftCellX       = leftLabelEndX;

        // Right side starts at the right half of the SVG
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
                    {/* White background */}
                    <rect width={totalWidth} height={totalHeight} fill="white" />

                    <g transform={`translate(0, ${marginTop})`}>

                        {/* ══════════════════════════════════
                            LEFT SIDE — With Product
                        ══════════════════════════════════ */}

                        {/* Left column header */}
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

                        {/* Left variable name labels */}
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

                        {/* Left horizontal grid lines */}
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

                        {/* Left heatmap cells */}
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

                        {/* ══════════════════════════════════
                            RIGHT SIDE — Without Product
                        ══════════════════════════════════ */}

                        {/* Right column header */}
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

                        {/* Right variable name labels */}
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

                        {/* Right horizontal grid lines */}
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

                        {/* Right heatmap cells */}
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

                    {/* Powered by watermark */}
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

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>

            {/* ── 1. Control Panel ── */}
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
                <CardContent>
                    <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} alignItems="center">
                        <Grid item xs={12} sm={12} md={5}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main', fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
                                Select Base Variable
                            </Typography>
                            <Autocomplete
                                options={availableColumns}
                                value={selectedVariable}
                                onChange={(event, newValue) => { if (newValue) setSelectedVariable(newValue); }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Variable"
                                        variant="outlined"
                                        fullWidth
                                        size={isMobile ? 'small' : 'medium'}
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

            {/* ── 2. Correlation Matrix Heatmap ── */}
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Correlation Matrix Heatmap
                        </Typography>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={downloadHeatmapAsPNG}
                            startIcon={<DownloadIcon />}
                            size="small"
                        >
                            Download PNG
                        </Button>
                    </Box>
                    {renderHeatmap()}
                </CardContent>
            </Card>

            {/* ── 3. Collapsible Top N Correlation Table ── */}
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>

                    {/* Clickable header */}
                    <Box
                        onClick={() => setShowCorrelationList(prev => !prev)}
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            px: 3,
                            py: 2,
                            backgroundColor: 'grey.100',
                            borderRadius: showCorrelationList ? '8px 8px 0 0' : 2,
                            '&:hover': { backgroundColor: 'grey.200' }
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Top {correlationData.topWithProduct.length} Correlation Analysis
                        </Typography>
                        <ExpandMoreIcon sx={{
                            transform: showCorrelationList ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s',
                            color: 'primary.main'
                        }} />
                    </Box>

                    {/* Collapsible table */}
                    <Collapse in={showCorrelationList}>
                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50', color: 'text.primary', borderBottom: '2px solid', borderColor: 'primary.main' }}>
                                            #
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50', color: 'text.primary', borderBottom: '2px solid', borderColor: 'primary.main' }}>
                                            Variable
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'grey.50', color: 'primary.main', borderBottom: '2px solid', borderColor: 'primary.main' }}>
                                            With Product
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'grey.50', color: 'secondary.main', borderBottom: '2px solid', borderColor: 'primary.main' }}>
                                            Without Product
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {correlationData.topWithProduct.map((item, index) => {
                                        const withoutItem = correlationData.withoutProduct.find(w => w.variable === item.variable);
                                        return (
                                            <TableRow
                                                key={item.variable}
                                                sx={{
                                                    '&:hover': { bgcolor: 'action.hover' },
                                                    bgcolor: index % 2 === 0 ? 'background.paper' : 'grey.50'
                                                }}
                                            >
                                                <TableCell sx={{ color: 'text.secondary', width: 40 }}>{index + 1}</TableCell>
                                                <TableCell sx={{ fontWeight: 500 }}>{item.variable}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                    {item.correlation.toFixed(3)}
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                                                    {withoutItem ? withoutItem.correlation.toFixed(3) : 'N/A'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Collapse>

                </CardContent>
            </Card>

        </Box>
    );
};

export default CorrelationAnalysisTab;