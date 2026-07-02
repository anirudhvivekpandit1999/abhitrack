import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    ThemeProvider,
    Tabs,
    Tab,
    Divider,
    InputLabel,
    Select,
    MenuItem,
    FormControl,
    IconButton
} from '@mui/material';

import customTheme from '../theme/customTheme';
import NavigationButtons from '../components/NavigationButtons';
import DistributionCurveTab from '../components/visualize/DistributionCurveTab';
import ScatterPlotTab from '../components/visualize/ScatterPlotTab';
import BootstrappingTab from '../components/visualize/BootstrappingTab';
import MultiVariateScatterPlotTab from '../components/visualize/MultiVariateScatterPlotTab';
import CorrelationAnalysisTab from '../components/visualize/CorrelationAnalysisTab';
import Assistant from '../components/Assistant';
import IndustrialTrendViewTab from '../components/visualize/IndustrialTrendViewTab';

const safeArray = (arr) => Array.isArray(arr) ? arr : [];

const VisualizeData = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [xAxis, setXAxis] = useState("");
    const [yAxis, setYAxis] = useState("");
    const [selectedColumns, setSelectedColumns] = useState([""]);
    const [error, setError] = useState(null);
    const [showColumnBuilder, setShowColumnBuilder] = useState(false);
    const [bifurcateSlices, setBifurcateSlices] = useState([]);
    const [selectedSheet, setSelectedSheet] = useState("");
    const [selectedSheetData, setSelectedSheetData] = useState([]);
    const [columnNames, setColumnNames] = useState([]);

    const {
        // ── single-sheet mode flags ──
        singleSheetMode = false,
        singleSheetName = '',
        singleSheetData = [],
        // ── regular two-sheet mode props ──
        dependentVariables = [],
        independentVariables = [],
        data_info = {},
        bootstrap_analysis = {},
        sessionId = null,
        clientName = '',
        plantName = '',
        productName = '',
        availableCols = [],
        preProductData = [],
        postProductData = [],
        excelData = [],
        preProductName = '',
        postProductName = '',
        sheetNames = []
    } = location.state || {};

    /* ─── Derive pre/post sheet selections ─── */
    // In single-sheet mode we only have one sheet and no post-sheet selector.
    const [selectedSheetsList, setSelectedSheetsList] = useState(
        singleSheetMode
            ? [singleSheetName]
            : [preProductName || '', postProductName || '']
    );
    const updateSheetAtIndex = (index, value) => {
        setSelectedSheetsList(prev => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    };

    const addSheetSlot = () => {
        setSelectedSheetsList(prev => [...prev, '']);
    };

    const removeSheetSlot = (index) => {
        setSelectedSheetsList(prev => prev.filter((_, i) => i !== index));
    };
    const excel_Data = safeArray(excelData);
    const sheets = safeArray(sheetNames);

    const getSheetData = (sheetName) => {
        if (!sheetName) return [];
        // In single-sheet mode the data is passed directly as singleSheetData
        if (singleSheetMode && sheetName === singleSheetName) return safeArray(singleSheetData);
        const sheet = excel_Data.find(s => s?.sheetName === sheetName);
        return safeArray(sheet?.sheetData);
    };

    const getSheetColumns = (sheetName) => {
        const data = getSheetData(sheetName);
        if (!data.length) return [];
        return Object.keys(data[0] || {});
    };

    /* ─── Data for tabs ─── */
    // In single-sheet mode: withProductData = current sheet, withoutProductData = []
    const withProductData = singleSheetMode
        ? safeArray(singleSheetData)
        : (selectedSheetsList[0] ? getSheetData(selectedSheetsList[0]) : safeArray(preProductData));

    const withoutProductData = singleSheetMode
        ? []
        : (selectedSheetsList[1] ? getSheetData(selectedSheetsList[1]) : safeArray(postProductData));

    const additionalSheetsData = selectedSheetsList
        .slice(2)
        .map(name => ({ name, data: getSheetData(name) }))
        .filter(s => s.data.length > 0);

    /* ─── Available columns ─── */
    const availableColumns = singleSheetMode
        ? (singleSheetData.length > 0
            ? Object.keys(singleSheetData[0])
            : safeArray(availableCols))
        : (selectedSheetsList[0] || selectedSheetsList[1]
            ? Array.from(
                new Set([
                    ...safeArray(getSheetColumns(selectedSheetsList[0])),
                    ...safeArray(getSheetColumns(selectedSheetsList[1]))
                ])
            )
            : safeArray(availableCols));

    const bootstrapAnalysis = bootstrap_analysis || {};

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handlePreviousStep = () => {
        navigate('/dependency-model', {
            state: {
                dependentVariables,
                independentVariables,
                sessionId,
                availableColumns
            }
        });
    };

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, []);

    /* ─── Voice assistant setup ─── */
    const recognitionRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [lastCommand, setLastCommand] = useState('');
    const [voiceFeedback, setVoiceFeedback] = useState('');
    const [assistantCollapsed, setAssistantCollapsed] = useState(true);

    const normalize = (s) =>
        String(s || '')
            .toLowerCase()
            .replace(/[_\-]/g, ' ')
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

    const levenshtein = (a = '', b = '') => {
        const an = a.length;
        const bn = b.length;
        if (!an) return bn;
        if (!bn) return an;
        const matrix = Array.from({ length: bn + 1 }, (_, i) => [i]);
        for (let j = 0; j <= an; j++) matrix[0][j] = j;
        for (let i = 1; i <= bn; i++) {
            for (let j = 1; j <= an; j++) {
                matrix[i][j] =
                    b.charAt(i - 1) === a.charAt(j - 1)
                        ? matrix[i - 1][j - 1]
                        : Math.min(
                            matrix[i - 1][j] + 1,
                            matrix[i][j - 1] + 1,
                            matrix[i - 1][j - 1] + 1
                        );
            }
        }
        return matrix[bn][an];
    };

    const similarity = (x, y) => {
        const a = normalize(x);
        const b = normalize(y);
        if (!a || !b) return 0;
        const d = levenshtein(a, b);
        return 1 - d / Math.max(a.length, b.length);
    };

    const findSheetMatch = (candidate) => {
        if (!sheets.length) return null;
        let best = null;
        let bestScore = 0;
        for (const sh of sheets) {
            const s = similarity(sh, candidate);
            if (s > bestScore) { bestScore = s; best = sh; }
        }
        return bestScore >= 0.5 ? best : null;
    };

    const ensureRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const r = new SpeechRecognition();
        r.continuous = false;
        r.lang = 'en-US';
        r.interimResults = false;
        r.maxAlternatives = 1;
        r.onresult = (event) => {
            const transcript = event.results[0][0].transcript.trim().toLowerCase();
            setLastCommand(transcript);
            handleVoiceCommand(transcript);
        };
        r.onend = () => setIsListening(false);
        r.onerror = () => setIsListening(false);
        recognitionRef.current = r;
    };

    useEffect(() => { ensureRecognition(); }, []);

    const startListening = () => {
        if (!recognitionRef.current) return;
        try { recognitionRef.current.start(); setIsListening(true); } catch { }
    };

    const stopListening = () => {
        try { recognitionRef.current?.stop(); } catch { }
        setIsListening(false);
    };

    const handleVoiceCommand = (text) => {
        if (!text) return;
        if (text.includes('switch to distribution')) { setActiveTab(0); setVoiceFeedback('Switched to Distribution Curve'); }
        if (text.includes('switch to scatter')) { setActiveTab(1); setVoiceFeedback('Switched to Scatter Plot'); }
        if (text.includes('switch to multi')) { setActiveTab(1); setVoiceFeedback('Switched to Multi Variate Scatter'); }
        if (text.includes('switch to bootstrapping')) { setActiveTab(2); setVoiceFeedback('Switched to Bootstrapping'); }
        if (text.includes('switch to correlation')) { setActiveTab(3); setVoiceFeedback('Switched to Correlation Analysis'); }
        if (text.includes('set distribution column')) {
            const match = text.match(/set distribution column to (.+)/i);
            if (match?.[1]) {
                const columnName = match[1].trim();
                const column = availableColumns.find(col => normalize(col).includes(normalize(columnName)));
                if (column) {
                    localStorage.setItem('selectedDistributionColumn', column);
                    window.dispatchEvent(new Event('distributionColumnChanged'));
                    setVoiceFeedback(`Distribution column set to: ${column}`);
                }
            }
        }
        setTimeout(() => setVoiceFeedback(''), 3000);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <DistributionCurveTab
                        availableColumns={availableColumns}
                        withProductData={withProductData}
                        withoutProductData={withoutProductData}
                        datasets={[
                            ...selectedSheetsList
                                .filter(name => name)
                                .map((name, index) => ({
                                    name: `Data ${index + 1}`,
                                    data: getSheetData(name)
                                }))
                        ]}
                        clientName={clientName}
                        plantName={plantName}
                        productName={productName}
                    />
                );
            case 1:
                return (
                    <MultiVariateScatterPlotTab
                        availableColumns={availableColumns}
                        withProductData={withProductData}
                        withoutProductData={withoutProductData}
                        datasets={[
                            ...selectedSheetsList
                                .filter(name => name)
                                .map((name, index) => ({
                                    name: `Data ${index + 1}`,
                                    data: getSheetData(name)
                                }))
                        ]}
                        clientName={clientName}
                        plantName={plantName}
                        productName={productName}
                    />
                );
            case 2:
                return (
                    <BootstrappingTab
                        availableColumns={availableColumns}
                        withProductData={withProductData}
                        withoutProductData={withoutProductData}
                        clientName={clientName}
                        plantName={plantName}
                        productName={productName}
                    />
                );
            case 3:
                return (
                    <CorrelationAnalysisTab
                        availableColumns={availableColumns}
                        withProductData={withProductData}
                        withoutProductData={withoutProductData}
                        clientName={clientName}
                        plantName={plantName}
                        productName={productName}
                    />
                );
            case 4:
                return (
                    <IndustrialTrendViewTab
                        withProductData={withProductData}
                        withoutProductData={withoutProductData}
                        availableColumns={availableColumns}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <ThemeProvider theme={customTheme}>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
                <Container maxWidth="xl">
                    <Paper elevation={2} sx={{ p: 3 }}>

                        <Typography variant="h5" color="primary.main" sx={{ mb: 2 }}>
                            Step 2: Visualize Data
                        </Typography>

                        <Typography variant="body2" sx={{ mb: 3 }}>
                            Explore visualizations of your data to identify patterns.
                        </Typography>

                        {/* ── Sheet selectors — only shown in two-sheet (comparison) mode ── */}
                        {!singleSheetMode && (
                            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                                {selectedSheetsList.map((sheetVal, index) => (
                                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <FormControl size="small" sx={{ minWidth: 220 }}>
                                            <InputLabel>{`Data ${index + 1} Sheet`}</InputLabel>
                                            <Select
                                                value={sheetVal}
                                                label={`Data ${index + 1} Sheet`}
                                                onChange={(e) => updateSheetAtIndex(index, e.target.value)}
                                            >
                                                {safeArray(sheets).map(name => (
                                                    <MenuItem key={name} value={name}>{name}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        {index >= 2 && (
                                            <IconButton
                                                size="small"
                                                onClick={() => removeSheetSlot(index)}
                                                sx={{ color: 'error.main' }}
                                                title="Remove"
                                            >
                                                ✕
                                            </IconButton>
                                        )}
                                    </Box>
                                ))}

                                <IconButton
                                    onClick={addSheetSlot}
                                    title="Add another sheet"
                                    sx={{
                                        border: '2px solid',
                                        borderColor: 'primary.main',
                                        borderRadius: '8px',
                                        color: 'primary.main',
                                        fontWeight: 'bold',
                                        fontSize: '1.2rem',
                                        width: 36,
                                        height: 36
                                    }}
                                >
                                    +
                                </IconButton>
                            </Box>
                        )}

                        {/* ── Single-sheet mode: show active sheet name as a label ── */}
                        {singleSheetMode && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Analysing sheet:&nbsp;
                                    <strong style={{ color: 'inherit' }}>{singleSheetName}</strong>
                                </Typography>
                            </Box>
                        )}

                        <Paper sx={{ mb: 3 }}>
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                variant="scrollable"
                                scrollButtons="auto"
                            >
                                <Tab label="Distribution Curve" />
                                <Tab label="Multi Variate Scatter" />
                                <Tab label="Bootstrapping" />
                                <Tab label="Correlation Analysis" />
                                {/* <Tab label="Industrial Trend" /> */}
                            </Tabs>

                            <Box sx={{ p: 3, minHeight: 400 }}>
                                {renderTabContent()}
                            </Box>
                        </Paper>

                        <Divider sx={{ my: 2 }} />

                        <Assistant
                            isListening={isListening}
                            lastCommand={lastCommand}
                            voiceFeedback={voiceFeedback}
                            assistantCollapsed={assistantCollapsed}
                            setAssistantCollapsed={setAssistantCollapsed}
                            startListening={startListening}
                            stopListening={stopListening}
                        />

                        {/* <NavigationButtons
                            onPrevious={handlePreviousStep}
                            isLoading={isLoading}
                            previousLabel="Back to Dependency Model"
                            hideNext
                        /> */}

                    </Paper>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default VisualizeData;