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

const safeArray = (arr) => Array.isArray(arr) ? arr : [];

const VisualizeData = () => {

const location = useLocation();
const navigate = useNavigate();

const [activeTab, setActiveTab] = useState(0);
const [isLoading, setIsLoading] = useState(false);

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
} catch {}
};

const stopListening = () => {

try {
recognitionRef.current?.stop();
} catch {}

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