import React, { useState, useEffect } from 'react';
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

const VisualizeData = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const {
        dependentVariables,
        independentVariables,
        data_info,
        bootstrap_analysis,
        sessionId,
        clientName = '',
        plantName = '',
        productName = '',
        availableCols,
        preProductData,
        postProductData,
        excelData,
        preProductName,
        postProductName,
        sheetNames
    } = location.state || {};

    const [selectedPreSheet, setSelectedPreSheet] = useState(preProductName || '');
    const [selectedPostSheet, setSelectedPostSheet] = useState(postProductName || '');

    const excel_Data = excelData;
    const sheets = sheetNames;

    const getSheetData = (sheetName) =>
        excel_Data?.find(s => s.sheetName === sheetName)?.sheetData || [];

    const getSheetColumns = (sheetName) => {
        const data = getSheetData(sheetName);
        return data.length ? Object.keys(data[0]) : [];
    };

    const withProductData = selectedPreSheet
        ? getSheetData(selectedPreSheet)
        : preProductData;

    const withoutProductData = selectedPostSheet
        ? getSheetData(selectedPostSheet)
        : postProductData;

    const availableColumns =
        selectedPreSheet || selectedPostSheet
            ? Array.from(new Set([
                ...getSheetColumns(selectedPreSheet),
                ...getSheetColumns(selectedPostSheet)
            ]))
            : availableCols;

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

   
    const recognitionRef = React.useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [lastCommand, setLastCommand] = useState('');
    const [voiceFeedback, setVoiceFeedback] = useState('');
    const [assistantCollapsed, setAssistantCollapsed] = useState(false);
    const [forceAcceptNextMatch, setForceAcceptNextMatch] = useState(false);

    const ensureRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            recognitionRef.current = null;
            return;
        }
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
        r.onend = () => {
            setIsListening(false);
        };
        r.onerror = () => {
            setIsListening(false);
        };
        recognitionRef.current = r;
    };


    const [awaitingSheetFor, setAwaitingSheetFor] = useState(null);
    const [preSelectOpen, setPreSelectOpen] = useState(false);
    const [postSelectOpen, setPostSelectOpen] = useState(false);
    const [awaitingConfirmation, setAwaitingConfirmation] = useState(null);

    const normalize = (s) => String(s || '').toLowerCase().replace(/[_\-]/g, ' ').replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();

    const levenshtein = (a = '', b = '') => {
        const an = a ? a.length : 0;
        const bn = b ? b.length : 0;
        if (an === 0) return bn;
        if (bn === 0) return an;
        const matrix = Array.from({ length: bn + 1 }, (_, i) => [i]);
        for (let j = 0; j <= an; j++) matrix[0][j] = j;
        for (let i = 1; i <= bn; i++) {
            for (let j = 1; j <= an; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
                else matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + 1);
            }
        }
        return matrix[bn][an];
    };

    const similarity = (x, y) => {
        const a = normalize(x);
        const b = normalize(y);
        if (!a || !b) return 0;
        const d = levenshtein(a, b);
        const maxL = Math.max(a.length, b.length);
        return 1 - d / maxL;
    };

    const findSheetMatch = (candidate) => {
        if (!sheets || !sheets.length) return null;
        const cleaned = normalize(candidate);
        for (const sh of sheets) {
            if (normalize(sh) === cleaned) return sh;
        }
        for (const sh of sheets) {
            const n = normalize(sh);
            if (n.includes(cleaned) || cleaned.includes(n)) return sh;
        }
        const tokens = cleaned.split(/\s+/).filter(Boolean);
        for (const t of tokens) {
            for (const sh of sheets) {
                if (normalize(sh).includes(t)) return sh;
            }
        }
        let best = null;
        let bestScore = 0;
        for (const sh of sheets) {
            const s = similarity(sh, candidate);
            if (s > bestScore) {
                bestScore = s;
                best = sh;
            }
        }
        if (bestScore >= 0.6) return best;
        return null;
    }; 

    useEffect(() => {
        ensureRecognition();
        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.onresult = null; recognitionRef.current.onend = null; recognitionRef.current.onerror = null; } catch (e) {}
            }
        };
    }, []);

    const startListening = () => {
        ensureRecognition();
        if (!recognitionRef.current) {
            setVoiceFeedback('Voice recognition not supported');
            setTimeout(() => setVoiceFeedback(''), 3000);
            return;
        }
        try {
            setLastCommand('');
            if (awaitingSheetFor === 'pre') setPreSelectOpen(true);
            if (awaitingSheetFor === 'post') setPostSelectOpen(true);
            if (awaitingSheetFor) setForceAcceptNextMatch(true);
            recognitionRef.current.start();
            setIsListening(true);
        } catch (e) {
            setIsListening(false);
            setTimeout(() => {
                try {
                    recognitionRef.current.start();
                    setIsListening(true);
                } catch (err) {
                    setIsListening(false);
                }
            }, 250);
        }
    };

    const stopListening = () => {
        if (!recognitionRef.current) return;
        try { recognitionRef.current.stop(); } catch (e) {}
        setIsListening(false);
    };

    const handleVoiceCommand = (text) => {
        if (!text) return;

        const t = text.trim().toLowerCase();

        if (awaitingConfirmation) {
            if (/^(yes|yep|yeah|sure|confirm|correct|right)\b/.test(t)) {
                const { for: forWhich, sheet } = awaitingConfirmation;
                if (forWhich === 'pre') {
                    setSelectedPreSheet(sheet);
                    setPreSelectOpen(false);
                } else {
                    setSelectedPostSheet(sheet);
                    setPostSelectOpen(false);
                }
                setVoiceFeedback(`${forWhich === 'pre' ? 'Pre' : 'Post'} sheet set to: ${sheet}`);
                setAwaitingConfirmation(null);
                setAwaitingSheetFor(null);
                setTimeout(() => setVoiceFeedback(''), 3000);
                return;
            }

            if (/^(no|nope|nah)\b/.test(t)) {
                setVoiceFeedback('Okay — please say the sheet name again.');
                setAwaitingConfirmation(null);
                setTimeout(() => setVoiceFeedback(''), 3000);
                return;
            }
        }

        if (awaitingSheetFor) {
            let candidate = text.replace(/\b(sheet|sheet name|the sheet|named|called|is|its|it's)\b/gi, '').trim();
            if (!candidate) candidate = text;
            const match = findSheetMatch(candidate);
            if (match) {
                if (awaitingSheetFor === 'pre') {
                    setSelectedPreSheet(match);
                    setPreSelectOpen(false);
                    setVoiceFeedback(`Pre sheet set to: ${match}`);
                } else {
                    setSelectedPostSheet(match);
                    setPostSelectOpen(false);
                    setVoiceFeedback(`Post sheet set to: ${match}`);
                }
                setAwaitingSheetFor(null);
                stopListening();
                setTimeout(() => setVoiceFeedback(''), 3000);
                return;
            }

            let best = null;
            let bestScore = 0;
            for (const sh of sheets || []) {
                const s = similarity(sh, text);
                if (s > bestScore) {
                    bestScore = s;
                    best = sh;
                }
            }

            if (best) {
                if (forceAcceptNextMatch && bestScore >= 0.35) {
                    if (awaitingSheetFor === 'pre') {
                        setSelectedPreSheet(best);
                        setPreSelectOpen(false);
                        setVoiceFeedback(`Pre sheet set to: ${best}`);
                    } else {
                        setSelectedPostSheet(best);
                        setPostSelectOpen(false);
                        setVoiceFeedback(`Post sheet set to: ${best}`);
                    }
                    setAwaitingSheetFor(null);
                    setForceAcceptNextMatch(false);
                    stopListening();
                    setTimeout(() => setVoiceFeedback(''), 3000);
                    return;
                }

                if (bestScore >= 0.5) {
                    if (awaitingSheetFor === 'pre') {
                        setSelectedPreSheet(best);
                        setPreSelectOpen(false);
                        setVoiceFeedback(`Pre sheet set to: ${best}`);
                    } else {
                        setSelectedPostSheet(best);
                        setPostSelectOpen(false);
                        setVoiceFeedback(`Post sheet set to: ${best}`);
                    }
                    setAwaitingSheetFor(null);
                    stopListening();
                    setTimeout(() => setVoiceFeedback(''), 3000);
                    return;
                }

                if (bestScore >= 0.35) {
                    setAwaitingConfirmation({ type: 'sheet', for: awaitingSheetFor, sheet: best });
                    setVoiceFeedback(`Did you mean: ${best}? Say 'yes' to confirm or 'no' to try again.`);
                    setForceAcceptNextMatch(false);
                    setIsListening(true);
                    setTimeout(() => startListening(), 250);
                    return;
                }
            }

            setVoiceFeedback('No matching sheet found. Please say the sheet name again.');
            setForceAcceptNextMatch(false);
            setIsListening(true);
            setTimeout(() => startListening(), 250);
            setTimeout(() => setVoiceFeedback(''), 3000);
            return;
        }

        const isCloseToPre = (w) => {
            const cleaned = normalize(w);
            if (!cleaned) return false;
            if (cleaned === 'pre') return true;
            if (cleaned.includes('pre')) return true;
            return similarity(cleaned, 'pre') >= 0.6;
        };
        const isCloseToPost = (w) => {
            const cleaned = normalize(w);
            if (!cleaned) return false;
            if (cleaned === 'post') return true;
            if (cleaned.includes('post')) return true;
            return similarity(cleaned, 'post') >= 0.6;
        };

        if (/\b(free|tree)\b/.test(t)) {
            setAwaitingSheetFor('pre');
            setPreSelectOpen(true);
            setVoiceFeedback(`Did you mean pre? Listening for pre sheet name...`);
            setIsListening(true);
            setTimeout(() => startListening(), 250);
            setTimeout(() => {
                setAwaitingSheetFor((curr) => (curr === 'pre' ? null : curr));
                setPreSelectOpen(false);
                setVoiceFeedback('');
            }, 10000);
            return;
        }

        if (isCloseToPre(t) || /\bset pre\b/i.test(t)) {
            setAwaitingSheetFor('pre');
            setPreSelectOpen(true);
            setVoiceFeedback('Listening for pre sheet name...');
            setIsListening(true);
            setTimeout(() => startListening(), 250);
            setTimeout(() => {
                setAwaitingSheetFor((curr) => (curr === 'pre' ? null : curr));
                setPreSelectOpen(false);
                setVoiceFeedback('');
            }, 10000);
            return;
        }

        if (isCloseToPost(t) || /\bset post\b/i.test(t)) {
            setAwaitingSheetFor('post');
            setPostSelectOpen(true);
            setVoiceFeedback('Listening for post sheet name...');
            setIsListening(true);
            setTimeout(() => startListening(), 250);
            setTimeout(() => {
                setAwaitingSheetFor((curr) => (curr === 'post' ? null : curr));
                setPostSelectOpen(false);
                setVoiceFeedback('');
            }, 10000);
            return;
        }

        const preDirect = text.match(/set\s+pre(?:\s+sheet)?(?:\s*(?:name|to|is))?\s*(.+)/i);
        if (preDirect && preDirect[1]) {
            const match = findSheetMatch(preDirect[1]);
            if (match) {
                setSelectedPreSheet(match);
                setVoiceFeedback(`Pre sheet set to: ${match}`);
                setTimeout(() => setVoiceFeedback(''), 3000);
                return;
            }
        }
        const postDirect = text.match(/set\s+post(?:\s+sheet)?(?:\s*(?:name|to|is))?\s*(.+)/i);
        if (postDirect && postDirect[1]) {
            const match = findSheetMatch(postDirect[1]);
            if (match) {
                setSelectedPostSheet(match);
                setVoiceFeedback(`Post sheet set to: ${match}`);
                setTimeout(() => setVoiceFeedback(''), 3000);
                return;
            }
        }

        if (text.includes('distribution')) {
            setActiveTab(0);
            setVoiceFeedback('Switched to Distribution Curve');
        } 
         if (text.includes('multi') || text.includes('multivariate') || text.includes('multi-variate')) {
            setActiveTab(2);
            setVoiceFeedback('Switched to Multi-Variate Scatter');
        } 
         if (text.includes('scatter')) {
            setActiveTab(1);
            setVoiceFeedback('Switched to Scatter Plot');
        } 
         if (text.includes('boot') || text.includes('bootstrap') || text.includes('bootstrapping')) {
            setActiveTab(3);
            setVoiceFeedback('Switched to Bootstrapping');
        } 
         if (text.includes('correlation')) {
            setActiveTab(4);
            setVoiceFeedback('Switched to Correlation Analysis');
        } 
        
        if (text.includes('set pre product sheet')) {
            const match = text.match(/set pre product sheet to (.+)/i);
            if (match && match[1]) {
                const sheetMatch = findSheetMatch(match[1]);
                if (sheetMatch) {
                    setSelectedPreSheet(sheetMatch);
                    setVoiceFeedback(`Pre sheet set to: ${sheetMatch}`);
                    setTimeout(() => setVoiceFeedback(''), 3000);
                    return;
                }
            }
        }

        if (text.includes('set post product sheet'))
        {
            const match = text.match(/set post product sheet to (.+)/i);
            if (match && match[1]) {
                const sheetMatch = findSheetMatch(match[1]);
                if (sheetMatch) {
                    setSelectedPostSheet(sheetMatch);
                    setVoiceFeedback(`Post sheet set to: ${sheetMatch}`);
                    setTimeout(() => setVoiceFeedback(''), 3000);
                    return;
                }
            }
        }
        
        if(text.includes('show distribution columns'))
        {
            document.getElementById('distribution-column-select').focus();
        }

        if(text.includes('set distribution column'))
        {
            const match = text.match(/set distribution column to (.+)/i);
            if (match && match[1]) {
                const columnName = match[1].trim();
                localStorage.setItem('selectedDistributionColumn',columnName);
                window.dispatchEvent(new Event('distributionColumnChanged'));
                setVoiceFeedback(`Distribution column set to: ${columnName}`);
            }
            
        }

        if(text.includes('set distribution view mode'))
        {
            const match = text.match(/set distribution view mode to (.+)/i);
            if (match && match[1]) {
                const viewMode = match[1].trim();
                localStorage.setItem('selectedDistributionViewMode', viewMode);
                window.dispatchEvent(new Event('distributionViewModeChanged'));
                setVoiceFeedback(`Distribution view mode set to: ${viewMode}`);
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
                    <ScatterPlotTab
                        withProductData={withProductData}
                        withoutProductData={withoutProductData}
                        clientName={clientName}
                        plantName={plantName}
                        productName={productName}
                    />
                );
            case 2:
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
            case 3:
                return (
                    <BootstrappingTab
                        availableColumns={availableColumns}
                        bootstrapAnalysis={bootstrapAnalysis}
                        clientName={clientName}
                        plantName={plantName}
                        productName={productName}
                    />
                );
            case 4:
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
            default:
                return null;
        }
    };

    return (
        <ThemeProvider theme={customTheme}>
            <Box sx={{
                minHeight: '100vh',
                bgcolor: 'background.default',
                px: { xs: 1, sm: 2 },
                py: { xs: 2, sm: 3, md: 4 }
            }}>
                <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4, md: 6 } }}>
                    <Paper elevation={2} sx={{ p: { xs: 2, md: 3 } }}>
                        <Typography variant="h5" color="primary.main" sx={{ mb: 2 }}>
                            Step 4: Visualize Data
                        </Typography>

                        <Typography variant="body2" sx={{ mb: 3 }}>
                            Explore visualizations of your data to identify patterns and relationships.
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                            <FormControl size="small" sx={{ minWidth: 220 }}>
                                <InputLabel>Pre Product Sheet</InputLabel>
                                <Select
                                    open={preSelectOpen}
                                    onOpen={() => setPreSelectOpen(true)}
                                    onClose={() => setPreSelectOpen(false)}
                                    value={selectedPreSheet}
                                    label="Pre Product Sheet"
                                    onChange={(e) => { setSelectedPreSheet(e.target.value); setPreSelectOpen(false); setAwaitingSheetFor(null); setVoiceFeedback(`Pre sheet set to: ${e.target.value}`); setTimeout(() => setVoiceFeedback(''), 2000); }}
                                >
                                    {sheets?.map((name) => (
                                        <MenuItem
                                            key={name}
                                            value={name}
                                            onClick={() => { setForceAcceptNextMatch(false); setSelectedPreSheet(name); setPreSelectOpen(false); setAwaitingSheetFor(null); setVoiceFeedback(`Pre sheet set to: ${name}`); setTimeout(() => setVoiceFeedback(''), 2000); }}
                                        >{name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl size="small" sx={{ minWidth: 220 }}>
                                <InputLabel>Post Product Sheet</InputLabel>
                                <Select
                                    open={postSelectOpen}
                                    onOpen={() => setPostSelectOpen(true)}
                                    onClose={() => setPostSelectOpen(false)}
                                    value={selectedPostSheet}
                                    label="Post Product Sheet"
                                    onChange={(e) => { setSelectedPostSheet(e.target.value); setPostSelectOpen(false); setAwaitingSheetFor(null); setVoiceFeedback(`Post sheet set to: ${e.target.value}`); setTimeout(() => setVoiceFeedback(''), 2000); }}
                                >
                                    {sheets?.map((name) => (
                                        <MenuItem
                                            key={name}
                                            value={name}
                                            onClick={() => { setForceAcceptNextMatch(false); setSelectedPostSheet(name); setPostSelectOpen(false); setAwaitingSheetFor(null); setVoiceFeedback(`Post sheet set to: ${name}`); setTimeout(() => setVoiceFeedback(''), 2000); }}
                                        >{name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {awaitingSheetFor === 'pre' && (
                                <div className="text-xs text-blue-600 mt-1">Listening for pre sheet name...</div>
                            )}
                            {awaitingSheetFor === 'post' && (
                                <div className="text-xs text-blue-600 mt-1">Listening for post sheet name...</div>
                            )}
                        </Box>

                        <Paper sx={{ width: '100%', mb: 3 }}>
                            <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                                <Tab label="Distribution Curve" />
                                <Tab label="Scatter Plot" />
                                <Tab label="Multi-Variate Scatter" />
                                <Tab label="Bootstrapping" />
                                <Tab label="Correlation Analysis" />
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
                            hideNext={true}
                        />
                    </Paper>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default VisualizeData;
