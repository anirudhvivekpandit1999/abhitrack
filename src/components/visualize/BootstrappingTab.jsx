import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    TextField,
    Autocomplete,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Alert,
    AlertTitle,
    Pagination,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    ToggleButton,
    ToggleButtonGroup,
    Divider,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormGroup,
    FormControlLabel,
    Checkbox,
    IconButton,
    Tooltip
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import logo from '../../assets/abhitech-logo.png';
import SaveVisualizationButton from '../SaveVisualizationButton'

const BootstrappingTab = ({ 
    availableColumns, 
    bootstrapAnalysis = {},
    clientName = '',
    plantName = '',
    productName = ''
}) => {
    const [selectedColumn, setSelectedColumn] = useState('');
    const [significantPage, setSignificantPage] = useState(1);
    const [nonSignificantPage, setNonSignificantPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [sortOrder, setSortOrder] = useState('impact');
    const [viewMode, setViewMode] = useState('grid');
    
    const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
    const [downloadOptions, setDownloadOptions] = useState({
        selectedColumns: [],
        statistics: {
            column: true,
            mean_difference: true,
            standard_deviation: true,
            confidence_interval_lower: true,
            confidence_interval_upper: true,
            is_significant: true
        },
        fileName: 'bootstrap_analysis'
    });
    const [columnSearchTerm, setColumnSearchTerm] = useState('');
    const tableRef = useRef(null);

    // Generate custom filename based on project information
    const generateFileName = (visualizationName) => {
        const parts = [];
        if (clientName) parts.push(clientName.replace(/\s+/g, '_'));
        if (plantName) parts.push(plantName.replace(/\s+/g, '_'));
        if (productName) parts.push(productName.replace(/\s+/g, '_'));
        parts.push(visualizationName.replace(/\s+/g, '_'));
        return parts.join('-');
    };

    useEffect(() => {
        if (availableColumns.length > 0) {
            setSelectedColumn(availableColumns[0]);
        }
    }, [availableColumns]);

    const getColumnStatistics = (columnName) => {
        const significantResults = bootstrapAnalysis.significant_impact || [];
        const nonSignificantResults = bootstrapAnalysis.no_significant_impact || [];
        
        const allResults = [...significantResults, ...nonSignificantResults];
        return allResults.find(result => result.column === columnName);
    };

    const sortedSignificantColumns = useMemo(() => {
        const significant = bootstrapAnalysis.significant_impact || [];
        return [...significant].sort((a, b) => {
            if (sortOrder === 'impact') {
                return Math.abs(b.mean_difference || 0) - Math.abs(a.mean_difference || 0);
            } else if (sortOrder === 'alphabetical') {
                return a.column.localeCompare(b.column);
            }
            return 0;
        });
    }, [bootstrapAnalysis.significant_impact, sortOrder]);

    const sortedNonSignificantColumns = useMemo(() => {
        const nonSignificant = bootstrapAnalysis.no_significant_impact || [];
        return [...nonSignificant].sort((a, b) => {
            if (sortOrder === 'impact') {
                return Math.abs(b.mean_difference || 0) - Math.abs(a.mean_difference || 0);
            } else if (sortOrder === 'alphabetical') {
                return a.column.localeCompare(b.column);
            }
            return 0;
        });
    }, [bootstrapAnalysis.no_significant_impact, sortOrder]);

    const paginatedSignificantColumns = useMemo(() => {
        const startIndex = (significantPage - 1) * itemsPerPage;
        return sortedSignificantColumns.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedSignificantColumns, significantPage, itemsPerPage]);

    const paginatedNonSignificantColumns = useMemo(() => {
        const startIndex = (nonSignificantPage - 1) * itemsPerPage;
        return sortedNonSignificantColumns.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedNonSignificantColumns, nonSignificantPage, itemsPerPage]);

    const handleDownloadTableAsPNG = async () => {
        if (!tableRef.current || !selectedColumn) {
            alert('Please select a column first to download the statistics table.');
            return;
        }
        
        try {
            const canvas = await html2canvas(tableRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false
            });
            
            const finalCanvas = document.createElement('canvas');
            const finalCtx = finalCanvas.getContext('2d');
            const scaleFactor = 2;
            
            finalCanvas.width = canvas.width;
            finalCanvas.height = canvas.height + 120 * scaleFactor;
            finalCtx.fillStyle = 'white';
            finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            
            finalCtx.fillStyle = 'black';
            finalCtx.font = `bold ${18 * scaleFactor}px Arial`;
            finalCtx.textAlign = 'center';
            finalCtx.fillText('Bootstrap Difference Analysis', finalCanvas.width / 2, 30 * scaleFactor);
            
            finalCtx.font = `${14 * scaleFactor}px Arial`;
            finalCtx.fillText(`Column: ${selectedColumn}`, finalCanvas.width / 2, 55 * scaleFactor);
            
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
                const fileName = generateFileName(`Bootstrap_${selectedColumn}`);
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
                finalCtx.fillText('Powered by', watermarkX + 40 * scaleFactor, watermarkY + 18 * scaleFactor);
                
                finalCtx.fillStyle = '#1976d2';
                finalCtx.font = `bold ${11 * scaleFactor}px Arial`;
                finalCtx.fillText("Abhitech's AbhiStat", watermarkX + 40 * scaleFactor, watermarkY + 30 * scaleFactor);
                
                const link = document.createElement('a');
                const fileName = generateFileName(`Bootstrap_${selectedColumn}`);
                link.download = `${fileName}.png`;
                link.href = finalCanvas.toDataURL('image/png');
                link.click();
            };
            watermarkImg.src = logo;
            
        } catch (error) {
            console.error('Error generating PNG:', error);
            alert('Failed to generate PNG. Please try again.');
        }
    };

    const renderBootstrapStatisticsTable = (columnStats) => {
        if (!columnStats) {
            return (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ p: { xs: 2, sm: 3 } }}>
                    No bootstrap statistics available for selected column
                </Typography>
            );
        }

        const {
            mean_difference,
            standard_deviation,
            confidence_interval,
            is_significant
        } = columnStats;

        return (
            <Box sx={{ px: { xs: 1, sm: 2 } }}>
                <Box sx={{ 
                    mb: { xs: 1.5, sm: 2 }, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    justifyContent: { xs: 'center', sm: 'flex-start' }
                }}>
                    <Chip 
                        label={is_significant ? "Significant Impact" : "No Significant Impact"} 
                        color={is_significant ? "error" : "success"}
                        variant="outlined"
                        size="small"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
                    />
                </Box>
                
                {/* Download PNG Button */}
                <Box sx={{ 
                    mb: 2, 
                    display: 'flex', 
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <SaveVisualizationButton 
                        elementId="visualization-content" 
                        fileNamePrefix="bootstrapping"
                        variableNames={selectedColumn}
                    />
                    <Tooltip title="Download Table as PNG">
                        <Button
                            id='bootstrap-btn'
                            variant="outlined"
                            size="small"
                            startIcon={<ImageIcon />}
                            onClick={handleDownloadTableAsPNG}
                            disabled={!selectedColumn || !columnStats}
                            sx={{ 
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                height: 32
                            }}
                        >
                            Download PNG
                        </Button>
                    </Tooltip>
                </Box>
                
                <TableContainer 
                    component={Paper} 
                    elevation={1} 
                    sx={{ overflowX: 'auto' }}
                    ref={tableRef}
                    className="abhitech-plot-area"
                >
                    <Table size="small" sx={{ minWidth: { xs: 280, sm: 400 } }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    <strong>Statistic</strong>
                                </TableCell>
                                <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    <strong>Value</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    Mean Difference
                                </TableCell>
                                <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    {mean_difference}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    Standard Deviation
                                </TableCell>
                                <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    {standard_deviation}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    95% Confidence Interval
                                </TableCell>
                                <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    [{confidence_interval.lower_bound}, {confidence_interval.upper_bound}]
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    Lower Bound (2.5%)
                                </TableCell>
                                <TableCell 
                                    align="right" 
                                    sx={{ 
                                        color: confidence_interval.lower_bound > 0 ? 'error.main' : 'text.primary',
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                    }}
                                >
                                    {confidence_interval.lower_bound}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    Upper Bound (97.5%)
                                </TableCell>
                                <TableCell 
                                    align="right" 
                                    sx={{ 
                                        color: confidence_interval.upper_bound < 0 ? 'error.main' : 'text.primary',
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                    }}
                                >
                                    {confidence_interval.upper_bound}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };

    const renderSummaryStats = () => {
        const significantCount = bootstrapAnalysis.significant_impact?.length || 0;
        const nonSignificantCount = bootstrapAnalysis.no_significant_impact?.length || 0;
        const totalAnalyzed = bootstrapAnalysis.total_columns_analyzed || 0;

        if (totalAnalyzed === 0) {
            return null;
        }

        return (
            <Alert severity="info" sx={{ mb: { xs: 2, sm: 3 }, mx: { xs: 1, sm: 0 } }}>
                <AlertTitle sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    Bootstrap Analysis Summary
                </AlertTitle>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <strong>Total columns analyzed:</strong> {totalAnalyzed}<br/>
                    <strong>Columns with significant impact:</strong> {significantCount}<br/>
                    <strong>Columns with no significant impact:</strong> {nonSignificantCount}
                </Typography>
            </Alert>
        );
    };

    const renderColumnChips = (columns, color, onColumnClick) => {
        if (viewMode === 'list') {
            return (
                <TableContainer component={Paper} elevation={0}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    Column Name
                                </TableCell>
                                <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    Mean Difference
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {columns.map((result) => (
                                <TableRow 
                                    key={result.column}
                                    onClick={() => onColumnClick(result.column)}
                                    sx={{ 
                                        cursor: 'pointer',
                                        '&:hover': { backgroundColor: 'action.hover' },
                                        backgroundColor: result.column === selectedColumn ? 'action.selected' : 'inherit'
                                    }}
                                >
                                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                        {result.column}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                        {result.mean_difference?.toFixed(4) || 'N/A'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            );
        }

        return (
            <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: { xs: 0.5, sm: 1 },
                justifyContent: { xs: 'center', sm: 'flex-start' }
            }}>
                {columns.map((result) => (
                    <Chip
                        key={result.column}
                        label={result.column}
                        size="small"
                        color={color}
                        variant={result.column === selectedColumn ? "filled" : "outlined"}
                        onClick={() => onColumnClick(result.column)}
                        clickable
                        sx={{ 
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            height: { xs: 24, sm: 32 },
                            '& .MuiChip-label': {
                                px: { xs: 1, sm: 1.5 }
                            }
                        }}
                    />
                ))}
            </Box>
        );
    };

    const renderPaginationControls = (currentPage, setCurrentPage, totalItems, label) => {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        if (totalPages <= 1) return null;

        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                mt: 2,
                gap: 2,
                flexWrap: 'wrap'
            }}>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {label}: {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
                </Typography>
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(event, value) => setCurrentPage(value)}
                    size="small"
                    color="primary"
                    showFirstButton
                    showLastButton
                />
            </Box>
        );
    };

    const selectedColumnStats = getColumnStatistics(selectedColumn);

    const handleDownloadExcel = () => {
        const workbook = XLSX.utils.book_new();
        
        const exportData = [];
        
        if (downloadOptions.selectedColumns.length > 0) {
            const selectedData = [...(bootstrapAnalysis.significant_impact || []), ...(bootstrapAnalysis.no_significant_impact || [])]
                .filter(item => downloadOptions.selectedColumns.includes(item.column));
            selectedData.forEach(item => {
                const row = {};
                if (downloadOptions.statistics.column) row['Column'] = item.column;
                if (downloadOptions.statistics.mean_difference) row['Mean Difference'] = item.mean_difference;
                if (downloadOptions.statistics.standard_deviation) row['Standard Deviation'] = item.standard_deviation;
                if (downloadOptions.statistics.confidence_interval_lower) row['CI Lower (2.5%)'] = item.confidence_interval?.lower_bound;
                if (downloadOptions.statistics.confidence_interval_upper) row['CI Upper (97.5%)'] = item.confidence_interval?.upper_bound;
                if (downloadOptions.statistics.is_significant) row['Significant Impact'] = item.is_significant ? 'Yes' : 'No';
                row['Category'] = item.is_significant ? 'Significant Impact' : 'No Significant Impact';
                exportData.push(row);
            });
        } else {
            const allData = [...(bootstrapAnalysis.significant_impact || []), ...(bootstrapAnalysis.no_significant_impact || [])];
            allData.forEach(item => {
                const row = {};
                if (downloadOptions.statistics.column) row['Column'] = item.column;
                if (downloadOptions.statistics.mean_difference) row['Mean Difference'] = item.mean_difference;
                if (downloadOptions.statistics.standard_deviation) row['Standard Deviation'] = item.standard_deviation;
                if (downloadOptions.statistics.confidence_interval_lower) row['CI Lower (2.5%)'] = item.confidence_interval?.lower_bound;
                if (downloadOptions.statistics.confidence_interval_upper) row['CI Upper (97.5%)'] = item.confidence_interval?.upper_bound;
                if (downloadOptions.statistics.is_significant) row['Significant Impact'] = item.is_significant ? 'Yes' : 'No';
                row['Category'] = item.is_significant ? 'Significant Impact' : 'No Significant Impact';
                exportData.push(row);
            });
        }
        
        if (exportData.length === 0) {
            alert('No data available for export with current selection.');
            return;
        }
        
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        
        const columnWidths = Object.keys(exportData[0] || {}).map(key => ({
            wch: Math.max(key.length, 15)
        }));
        worksheet['!cols'] = columnWidths;
        
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Bootstrap Analysis');
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const fileName = `${downloadOptions.fileName}_${timestamp}.xlsx`;
        
        XLSX.writeFile(workbook, fileName);
        setDownloadDialogOpen(false);
    };

    const handleStatisticToggle = (statistic) => {
        setDownloadOptions(prev => ({
            ...prev,
            statistics: {
                ...prev.statistics,
                [statistic]: !prev.statistics[statistic]
            }
        }));
    };

    const handleSelectAllStatistics = (checked) => {
        setDownloadOptions(prev => ({
            ...prev,
            statistics: {
                column: checked,
                mean_difference: checked,
                standard_deviation: checked,
                confidence_interval_lower: checked,
                confidence_interval_upper: checked,
                is_significant: checked
            }
        }));
    };

    const getSelectedStatisticsCount = () => {
        return Object.values(downloadOptions.statistics).filter(Boolean).length;
    };

    const getTotalStatisticsCount = () => {
        return Object.keys(downloadOptions.statistics).length;
    };

    const getAllAvailableColumns = () => {
        const significant = bootstrapAnalysis.significant_impact || [];
        const nonSignificant = bootstrapAnalysis.no_significant_impact || [];
        return [...significant, ...nonSignificant].map(item => item.column);
    };

    const handleColumnToggle = (columnName) => {
        setDownloadOptions(prev => ({
            ...prev,
            selectedColumns: prev.selectedColumns.includes(columnName)
                ? prev.selectedColumns.filter(col => col !== columnName)
                : [...prev.selectedColumns, columnName]
        }));
    };

    const handleSelectAllColumns = (checked) => {
        if (checked) {
            setDownloadOptions(prev => ({
                ...prev,
                selectedColumns: getAllAvailableColumns()
            }));
        } else {
            setDownloadOptions(prev => ({
                ...prev,
                selectedColumns: []
            }));
        }
    };

    const getSelectedColumnsCount = () => {
        return downloadOptions.selectedColumns.length;
    };

    const getTotalColumnsCount = () => {
        return getAllAvailableColumns().length;
    };

    const getFilteredColumns = () => {
        const allColumns = getAllAvailableColumns();
        if (!columnSearchTerm) return allColumns;
        return allColumns.filter(column => 
            column.toLowerCase().includes(columnSearchTerm.toLowerCase())
        );
    };

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 0 } }}>
            {renderSummaryStats()}
            
            <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12} md={6} lg={4}>
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
                                {...params}
                                label="Select Column for Analysis"
                                variant="outlined"
                                fullWidth
                                size="small"
                            />
                        )}
                        sx={{ mb: { xs: 2, sm: 3, md: 4 } }}
                        disableClearable
                        autoHighlight
                        openOnFocus
                    />
                </Grid>
            </Grid>

            <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    mb: { xs: 1.5, sm: 2 },
                                    fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                                    wordBreak: 'break-word'
                                }}
                            >
                                Bootstrap Difference Analysis - {selectedColumn}
                            </Typography>
                            <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ 
                                    mb: { xs: 2, sm: 3 },
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    lineHeight: { xs: 1.4, sm: 1.5 }
                                }}
                            >
                                Analysis of mean difference between "with product" and "without product" conditions using 10,000 bootstrap samples.
                                A significant impact indicates the confidence interval does not include zero.
                            </Typography>
                            {renderBootstrapStatisticsTable(selectedColumnStats)}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ mt: { xs: 2, sm: 3 }, mb: { xs: 1, sm: 2 } }}>
                <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Items per page</InputLabel>
                            <Select
                                value={itemsPerPage}
                                label="Items per page"
                                onChange={(e) => {
                                    setItemsPerPage(e.target.value);
                                    setSignificantPage(1);
                                    setNonSignificantPage(1);
                                }}
                            >
                                <MenuItem value={10}>10</MenuItem>
                                <MenuItem value={20}>20</MenuItem>
                                <MenuItem value={50}>50</MenuItem>
                                <MenuItem value={100}>100</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Sort by</InputLabel>
                            <Select
                                value={sortOrder}
                                label="Sort by"
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <MenuItem value="impact">Impact (High to Low)</MenuItem>
                                <MenuItem value="alphabetical">Alphabetical</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={(e, newMode) => newMode && setViewMode(newMode)}
                            size="small"
                            fullWidth
                        >
                            <ToggleButton value="grid">Grid View</ToggleButton>
                            <ToggleButton value="list">List View</ToggleButton>
                        </ToggleButtonGroup>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Tooltip title="Download Excel Report">
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<DownloadIcon />}
                                onClick={() => setDownloadDialogOpen(true)}
                                fullWidth
                                sx={{ 
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    height: 40
                                }}
                            >
                                Export Excel
                            </Button>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Box>

            <Divider sx={{ my: { xs: 2, sm: 3 } }} />

            <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12} lg={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    mb: { xs: 1.5, sm: 2 }, 
                                    color: 'error.main',
                                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
                                }}
                            >
                                Columns with Significant Impact ({sortedSignificantColumns.length})
                            </Typography>
                            {paginatedSignificantColumns.length > 0 ? (
                                <>
                                    {renderColumnChips(paginatedSignificantColumns, 'error', setSelectedColumn)}
                                    {renderPaginationControls(
                                        significantPage, 
                                        setSignificantPage, 
                                        sortedSignificantColumns.length,
                                        'Significant'
                                    )}
                                </>
                            ) : (
                                <Typography 
                                    variant="body2" 
                                    color="text.secondary"
                                    sx={{ 
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                        textAlign: { xs: 'center', sm: 'left' }
                                    }}
                                >
                                    No columns show significant impact
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} lg={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    mb: { xs: 1.5, sm: 2 }, 
                                    color: 'success.main',
                                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
                                }}
                            >
                                Columns with No Significant Impact ({sortedNonSignificantColumns.length})
                            </Typography>
                            {paginatedNonSignificantColumns.length > 0 ? (
                                <>
                                    {renderColumnChips(paginatedNonSignificantColumns, 'success', setSelectedColumn)}
                                    {renderPaginationControls(
                                        nonSignificantPage, 
                                        setNonSignificantPage, 
                                        sortedNonSignificantColumns.length,
                                        'Non-significant'
                                    )}
                                </>
                            ) : (
                                <Typography 
                                    variant="body2" 
                                    color="text.secondary"
                                    sx={{ 
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                        textAlign: { xs: 'center', sm: 'left' }
                                    }}
                                >
                                    All columns show significant impact
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Download Dialog */}
            <Dialog 
                open={downloadDialogOpen} 
                onClose={() => setDownloadDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ 
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    pb: 1
                }}>
                    Download Bootstrap Analysis Excel Report
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                Select Individual Columns
                            </Typography>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={getSelectedColumnsCount() === getTotalColumnsCount() && getTotalColumnsCount() > 0}
                                        indeterminate={getSelectedColumnsCount() > 0 && getSelectedColumnsCount() < getTotalColumnsCount()}
                                        onChange={(e) => handleSelectAllColumns(e.target.checked)}
                                    />
                                }
                                label={`${getSelectedColumnsCount()}/${getTotalColumnsCount()} selected`}
                            />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            Leave empty to include all columns, or select specific columns to export.
                        </Typography>
                        
                        {/* Search Bar */}
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search columns..."
                            value={columnSearchTerm}
                            onChange={(e) => setColumnSearchTerm(e.target.value)}
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <Box sx={{ color: 'text.secondary', mr: 1 }}>
                                        🔍
                                    </Box>
                                ),
                                endAdornment: columnSearchTerm && (
                                    <Box 
                                        component="span" 
                                        onClick={() => setColumnSearchTerm('')}
                                        sx={{ 
                                            cursor: 'pointer', 
                                            color: 'text.secondary',
                                            mr: 1,
                                            fontSize: '1.2rem'
                                        }}
                                    >
                                        ×
                                    </Box>
                                )
                            }}
                        />
                        
                        <Box sx={{ 
                            maxHeight: 200, 
                            overflowY: 'auto', 
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            p: 1
                        }}>
                            <FormGroup>
                                {getFilteredColumns().map((columnName) => {
                                    const columnData = [...(bootstrapAnalysis.significant_impact || []), ...(bootstrapAnalysis.no_significant_impact || [])]
                                        .find(item => item.column === columnName);
                                    const isSignificant = columnData?.is_significant;
                                    
                                    return (
                                        <FormControlLabel
                                            key={columnName}
                                            control={
                                                <Checkbox
                                                    checked={downloadOptions.selectedColumns.includes(columnName)}
                                                    onChange={() => handleColumnToggle(columnName)}
                                                    size="small"
                                                />
                                            }
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                                        {columnName}
                                                    </Typography>
                                                    <Chip 
                                                        label={isSignificant ? "Significant" : "Non-significant"} 
                                                        color={isSignificant ? "error" : "success"}
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' }, height: 20 }}
                                                    />
                                                </Box>
                                            }
                                            sx={{ 
                                                mb: 0.5,
                                                '& .MuiFormControlLabel-label': { width: '100%' }
                                            }}
                                        />
                                    );
                                })}
                                {getFilteredColumns().length === 0 && (
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary" 
                                        sx={{ 
                                            textAlign: 'center', 
                                            py: 2,
                                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                        }}
                                    >
                                        No columns found matching "{columnSearchTerm}"
                                    </Typography>
                                )}
                            </FormGroup>
                        </Box>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                Include Statistics
                            </Typography>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={getSelectedStatisticsCount() === getTotalStatisticsCount()}
                                        indeterminate={getSelectedStatisticsCount() > 0 && getSelectedStatisticsCount() < getTotalStatisticsCount()}
                                        onChange={(e) => handleSelectAllStatistics(e.target.checked)}
                                    />
                                }
                                label={`${getSelectedStatisticsCount()}/${getTotalStatisticsCount()} selected`}
                            />
                        </Box>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={downloadOptions.statistics.column}
                                        onChange={() => handleStatisticToggle('column')}
                                    />
                                }
                                label="Column Name"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={downloadOptions.statistics.mean_difference}
                                        onChange={() => handleStatisticToggle('mean_difference')}
                                    />
                                }
                                label="Mean Difference"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={downloadOptions.statistics.standard_deviation}
                                        onChange={() => handleStatisticToggle('standard_deviation')}
                                    />
                                }
                                label="Standard Deviation"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={downloadOptions.statistics.confidence_interval_lower}
                                        onChange={() => handleStatisticToggle('confidence_interval_lower')}
                                    />
                                }
                                label="Confidence Interval Lower Bound (2.5%)"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={downloadOptions.statistics.confidence_interval_upper}
                                        onChange={() => handleStatisticToggle('confidence_interval_upper')}
                                    />
                                }
                                label="Confidence Interval Upper Bound (97.5%)"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={downloadOptions.statistics.is_significant}
                                        onChange={() => handleStatisticToggle('is_significant')}
                                    />
                                }
                                label="Significant Impact (Yes/No)"
                            />
                        </FormGroup>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            File Name
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            value={downloadOptions.fileName}
                            onChange={(e) => setDownloadOptions(prev => ({
                                ...prev,
                                fileName: e.target.value
                            }))}
                            placeholder="bootstrap_analysis"
                            helperText="File will be saved with timestamp (e.g., bootstrap_analysis_2024-01-15T10-30-45.xlsx)"
                        />
                    </Box>

                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            <strong>Note:</strong> The Excel file will include a "Category" column to distinguish between significant and non-significant impacts.
                            {(() => {
                                const exportRowCount = downloadOptions.selectedColumns.length > 0 ? 
                                    downloadOptions.selectedColumns.length :
                                    getAllAvailableColumns().length;
                                
                                if (exportRowCount > 0) {
                                    return ` Total rows to export: ${exportRowCount}`;
                                } else {
                                    return ' No data available for export with current selection.';
                                }
                            })()}
                        </Typography>
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 1 }}>
                    <Button onClick={() => setDownloadDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDownloadExcel}
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        disabled={
                            getSelectedStatisticsCount() === 0 ||
                            getAllAvailableColumns().length === 0
                        }
                    >
                        Download Excel
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BootstrappingTab;