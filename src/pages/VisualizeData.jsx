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
    FormControl
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

    const [selectedPreSheet, setSelectedPreSheet] = useState(preProductName || '');
    const [selectedPostSheet, setSelectedPostSheet] = useState(postProductName || '');

    const excel_Data = safeArray(excelData);
    const sheets = safeArray(sheetNames);

    const getSheetData = (sheetName) => {
        if (!sheetName) return [];
        const sheet = excel_Data.find(s => s?.sheetName === sheetName);
        return safeArray(sheet?.sheetData);
    };

    const getSheetColumns = (sheetName) => {
        const data = getSheetData(sheetName);
        if (!data.length) return [];
        return Object.keys(data[0] || {});
    };

    const withProductData =
        selectedPreSheet ? getSheetData(selectedPreSheet) : safeArray(preProductData);

    const withoutProductData =
        selectedPostSheet ? getSheetData(selectedPostSheet) : safeArray(postProductData);

    const availableColumns =
        selectedPreSheet || selectedPostSheet
            ? Array.from(
                new Set([
                    ...safeArray(getSheetColumns(selectedPreSheet)),
                    ...safeArray(getSheetColumns(selectedPostSheet))
                ])
            )
            : safeArray(availableCols);

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

    const recognitionRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [lastCommand, setLastCommand] = useState('');
    const [voiceFeedback, setVoiceFeedback] = useState('');
    const [assistantCollapsed, setAssistantCollapsed] = useState(false);

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

    const matchBarVariables = (spokenText) => {

        if (!availableColumns.length) return [];

        const tokens = normalize(spokenText).split(' ');
        const matched = [];

        tokens.forEach(token => {

            const exact = availableColumns.find(v =>
                normalize(v).includes(token)
            );

            if (exact && !matched.includes(exact)) {
                matched.push(exact);
            }
        });

        return matched;
    };

    const findSheetMatch = (candidate) => {

        if (!sheets.length) return null;

        let best = null;
        let bestScore = 0;

        for (const sh of sheets) {
            const s = similarity(sh, candidate);
            if (s > bestScore) {
                bestScore = s;
                best = sh;
            }
        }

        return bestScore >= 0.5 ? best : null;
    };

    const ensureRecognition = () => {

        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) return;

        const r = new SpeechRecognition();

        r.continuous = false;
        r.lang = 'en-US';
        r.interimResults = false;
        r.maxAlternatives = 1;

        r.onresult = (event) => {

            const transcript =
                event.results[0][0].transcript.trim().toLowerCase();

            setLastCommand(transcript);
            handleVoiceCommand(transcript);
        };

        r.onend = () => setIsListening(false);
        r.onerror = () => setIsListening(false);

        recognitionRef.current = r;
    };

    useEffect(() => {
        ensureRecognition();
    }, []);

    const startListening = () => {

        if (!recognitionRef.current) return;

        try {
            recognitionRef.current.start();
            setIsListening(true);
        } catch { }
    };

    const stopListening = () => {

        try {
            recognitionRef.current?.stop();
        } catch { }

        setIsListening(false);
    };

    const handleVoiceCommand = (text) => {

        if (!text) return;

        if (text.includes('switch to distribution')) {
            setActiveTab(0);
            setVoiceFeedback('Switched to Distribution Curve');
        }

        if (text.includes('switch to scatter')) {
            setActiveTab(1);
            setVoiceFeedback('Switched to Scatter Plot');
        }

        if (text.includes('switch to multi')) {
            setActiveTab(1);
            setVoiceFeedback('Switched to Multi Variate Scatter');
        }

        if (text.includes('switch to bootstrapping')) {
            setActiveTab(2);
            setVoiceFeedback('Switched to Bootstrapping');
        }

        if (text.includes('switch to correlation')) {
            setActiveTab(3);
            setVoiceFeedback('Switched to Correlation Analysis');
        }

        if (text.includes('set distribution column')) {

            const match = text.match(/set distribution column to (.+)/i);

            if (match?.[1]) {

                const columnName = match[1].trim();

                const column = availableColumns.find(col =>
                    normalize(col).includes(normalize(columnName))
                );

                if (column) {

                    localStorage.setItem('selectedDistributionColumn', column);

                    window.dispatchEvent(
                        new Event('distributionColumnChanged')
                    );

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
                        clientName={clientName}
                        plantName={plantName}
                        productName={productName}
                    />
                );

            case 2:
                return (
                    <BootstrappingTab
                        availableColumns={availableColumns}
                        bootstrapAnalysis={bootstrapAnalysis}
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

    const handleAddColumnSelector = () => {
        if (selectedColumns.length >= columnNames.length) return;
        setSelectedColumns((prev) => [...prev, ""]);
    };
    const openColumnBuilder = () => {
        const baseSheet = excelData.find((s) => s.sheetName === (copyFromSheet || selectedSheet));
        const rows = baseSheet && Array.isArray(baseSheet.sheetData) ? baseSheet.sheetData : [];
        setBuilderRows(rows);
        setShowColumnBuilder(true);
    };

    const scatterSlicesData =
        bifurcateSlices.length > 0
            ? bifurcateSlices.map((s) => {
                return {
                    name: s.fullName,
                    color: s.colorHex || "#6366f1",
                    data: s.rows.map((row) => ({ x: getNumeric(row, xAxis), y: getNumeric(row, yAxis) })).filter((p) => !isNaN(p.x) && !isNaN(p.y)),
                };
            })
            : [
                {
                    name: selectedSheet,
                    color: "#6366f1",
                    data: selectedSheetData.map((row) => ({ x: getNumeric(row, xAxis), y: getNumeric(row, yAxis) })).filter((p) => !isNaN(p.x) && !isNaN(p.y)),
                },
            ];

    return (

        <ThemeProvider theme={customTheme}>

            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>

                <Container maxWidth="xl">

                    <Paper elevation={2} sx={{ p: 3 }}>

                        <Typography variant="h5" color="primary.main" sx={{ mb: 2 }}>
                            Step 4: Visualize Data
                        </Typography>

                        <Typography variant="body2" sx={{ mb: 3 }}>
                            Explore visualizations of your data to identify patterns.
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>

                            <FormControl size="small" sx={{ minWidth: 220 }}>

                                <InputLabel>Pre Product Sheet</InputLabel>

                                <Select
                                    value={selectedPreSheet}
                                    label="Pre Product Sheet"
                                    onChange={(e) => setSelectedPreSheet(e.target.value)}
                                >

                                    {safeArray(sheets).map(name => (
                                        <MenuItem key={name} value={name}>{name}</MenuItem>
                                    ))}

                                </Select>

                            </FormControl>

                            <FormControl size="small" sx={{ minWidth: 220 }}>

                                <InputLabel>Post Product Sheet</InputLabel>

                                <Select
                                    value={selectedPostSheet}
                                    label="Post Product Sheet"
                                    onChange={(e) => setSelectedPostSheet(e.target.value)}
                                >

                                    {safeArray(sheets).map(name => (
                                        <MenuItem key={name} value={name}>{name}</MenuItem>
                                    ))}

                                </Select>
                                <div className="group rounded-2xl border border-indigo-200 bg-gradient-to-br from-sky-50 via-indigo-50 to-fuchsia-100 p-5 overflow-auto h-full shadow-sm">

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-indigo-800 mb-1">
                                                X-Axis
                                            </label>
                                            <select
                                                value={xAxis}
                                                onChange={(e) => setXAxis(e.target.value)}
                                                className="w-full rounded-md border px-2 py-2 text-sm"
                                            >
                                                <option value="">Select column</option>
                                                {columnNames.map((col) => (
                                                    <option key={col} value={col}>{col}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-indigo-800 mb-1">
                                                Y-Axis
                                            </label>
                                            <select
                                                value={yAxis}
                                                onChange={(e) => setYAxis(e.target.value)}
                                                className="w-full rounded-md border px-2 py-2 text-sm"
                                            >
                                                <option value="">Select column</option>
                                                {columnNames.map((col) => (
                                                    <option key={col} value={col}>{col}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Column Selection */}
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-xs font-medium text-slate-600">
                                                Select columns to keep
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleAddColumnSelector}
                                                    disabled={
                                                        columnNames.length === 0 ||
                                                        selectedColumns.length >= columnNames.length
                                                    }
                                                    className="inline-flex items-center rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    +
                                                </button>

                                                <button
                                                    onClick={openColumnBuilder}
                                                    className="inline-flex items-center rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                                                >
                                                    Column Builder
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {selectedColumns.map((sel, idx) => {
                                                const available = columnNames.filter(
                                                    (c) => c === sel || !selectedColumns.includes(c)
                                                );
                                                return (
                                                    <div key={idx}>
                                                        <select
                                                            value={sel}
                                                            onChange={(e) =>
                                                                handleColumnChange(idx, e.target.value)
                                                            }
                                                            className="w-full rounded-md border px-3 py-2 text-sm"
                                                        >
                                                            <option value="">-- select column --</option>
                                                            {available.map((col) => (
                                                                <option key={col} value={col}>{col}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="mt-3 text-xs text-red-600">{error}</div>
                                    )}



                                    {/* ✅ COLUMN BUILDER RESTORED */}
                                    {showColumnBuilder && (
                                        <div className="mt-4 p-3 rounded-md border bg-gray-50">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="text-sm font-medium">Column Builder</div>
                                                <Button size="small" onClick={() => setShowColumnBuilder(false)}>
                                                    Close
                                                </Button>
                                            </div>

                                            <FormulaBuilder
                                                newColumnName={newColumnName}
                                                availableColumns={columnNames}
                                                updatedColumns={[]}
                                                onAddColumn={handleAddColumn}
                                                withProductData={builderRows}
                                                withoutProductData={builderRows}
                                            />
                                        </div>
                                    )}

                                </div>
                                <div className="rounded-2xl border border-indigo-200 bg-white p-3 overflow-auto">
                                    {scatterSlicesData.some((s) => s.data?.length > 0) ? (
                                        <D3ScatterPlot
                                            scatterSlicesData={scatterSlicesData}
                                            xAxis={xAxis}
                                            yAxis={yAxis}
                                        />
                                    ) : (
                                        <div className="text-xs text-slate-500 text-center">
                                            No scatter data
                                        </div>
                                    )}
                                </div>
                            </FormControl>

                        </Box>

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
                                <Tab label="Industrial Trend" />

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

                        <NavigationButtons
                            onPrevious={handlePreviousStep}
                            isLoading={isLoading}
                            previousLabel="Back to Dependency Model"
                            hideNext
                        />

                    </Paper>

                </Container>

            </Box>

        </ThemeProvider>
    );
};

export default VisualizeData;