import { useState, useRef } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import * as XLSX from 'xlsx';

function FileUploader({ id, label, onFileUpload, error, isLoading }) {
    const [fileName, setFileName] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [sheetNames, setSheetNames] = useState([]);
    const [selectedSheet, setSelectedSheet] = useState('');
    const [sheetSelectPending, setSheetSelectPending] = useState(false);
    const fileInputRef = useRef(null);

    const handleVoiceCommand = async (text) => {
    if (!text) return;
    console.log('🔊 Voice command received:', text, 'selectedSheet:', selectedSheet, 'copyFromSheet:', copyFromSheet, 'previewHeadersLen:', previewHeaders.length, 'columnNamesLen:', columnNames.length);

    if (text.includes("upload")) {
      handleVoiceFileUpload(text);
      return;
    }

    if (text.includes("list files") || text.includes("show files") || text.includes("recent files") || text.includes("what files")) {
      if (recentFiles.length > 0) {
        const fileList = recentFiles.slice(0, 5).join(", ");
        setVoiceFeedback("Recent files: " + fileList);
      } else {
        setVoiceFeedback("No recent files. Say 'open file' to upload.");
      }
      setTimeout(() => setVoiceFeedback(""), 5000);
      return;
    }

    if (text.includes("open file") || text.includes("select file") || text.includes("choose file")) {
      setVoiceFeedback("Opening file selector...");
      setTimeout(() => setVoiceFeedback(""), 3000);
      fileInputRef.current?.click();
      return;
    }

    if (text.includes("select sheet") || text.includes("open sheet") || text.includes("go to sheet") || text.includes("click sheet")) {
      handleSelectSheetByVoice(text);
      return;
    }

    if (text.includes("select all") || text.includes("select every column") || text.includes("select all columns")) {
      const all = Array.from(new Set(columnNames));
      setSelectedColumns(all.length ? all : [""]);
      return;
    }
    if (text.includes("clear selection") || text.includes("clear columns") || text.includes("reset selection") || text.includes("deselect")) {
      setSelectedColumns([""]);
      return;
    }



    if (text.toLowerCase().includes("add new sheet")) {
      setShowAddPanel(true);
      return;
    }

    if (text.toLowerCase().includes('new sheet name')) {
      setFocusId('newsheet');
      const nameMatch = text.match(/new sheet name (is|to)?\s*(.+)/i);
      console.log('🆕 Voice new sheet name match:', nameMatch);
      setNewSheetName(nameMatch[2].split('.')[0]);
      return;

    };

    if (text.toLowerCase().includes("set base sheet")) {
      const match = text
        .toLowerCase()
        .match(/set base sheet(?:\s*(?:is|to))?\s*(.*)/i);

      console.log("🆕 Voice set base sheet command match:", match);

      if (match) {
        const baseSheetName = match[1]?.trim();

        if (baseSheetName) {
          const cleanedName = baseSheetName.split(".")[0];

          let sheet = sheetNames.find((s) => s.toLowerCase() === cleanedName.toLowerCase());

          if (sheet) {
            setCopyFromSheet(sheet);
            setVoiceFeedback(`Base sheet set to: ${sheet}`);
          } else {

            try {
              const saved = JSON.parse(localStorage.getItem('saved_excel_sheets') || '{}');
              const keys = Object.keys(saved || {});
              const matchedKey = keys.find((k) => k.toLowerCase() === cleanedName.toLowerCase());
              if (matchedKey) {
                const sheetData = saved[matchedKey];
                // Add the sheet into current state so it appears in the dropdown
                setSheetNames((prev) => (prev.includes(matchedKey) ? prev : [...prev, matchedKey]));
                setExcelData((prev) => (prev.some((s) => s.sheetName === matchedKey) ? prev : [...prev, { sheetName: matchedKey, sheetData }]));
                setCopyFromSheet(matchedKey);
                setVoiceFeedback(`Base sheet set to: ${matchedKey} (loaded from saved data)`);
              } else {
                setFocusId("basesheet");
                setVoiceFeedback("Please choose a base sheet");
              }
            } catch (e) {
              console.error('Failed to load saved sheets from localStorage', e);
              setFocusId("basesheet");
              setVoiceFeedback("Please choose a base sheet");
            }
          }
        } else {
          setFocusId("basesheet");
          setVoiceFeedback("Please choose a base sheet");
        }

        setTimeout(() => setVoiceFeedback(""), 3000);
      }

      return;
    }

    if (text.toLowerCase().includes("set pre sheet name")) {
      const preMatch = text.match(/set pre sheet name (is|to)?\s*(.+)/i);
      console.log('🆕 Voice set pre sheet name match:', preMatch);
      if (preMatch) {
        rowRanges.forEach((range, index) => {
          {
            if (index === 0) {
              range.name = preMatch[2].trim().split('.')[0];
            }
            setVoiceFeedback(`Pre sheet name set to: ${range.name}`);
          }
        })
      }
      return;
    }

    if (text.toLowerCase().includes("set post sheet name")) {
      const postMatch = text.match(/set post sheet name (is|to)?\s*(.+)/i);
      console.log('🆕 Voice set post sheet name match:', postMatch)
      if (postMatch) {
        rowRanges.forEach((range, index) => {
          if (index === 1) {
            range.name = postMatch[2].trim().split('.')[0];
            setVoiceFeedback(`Post sheet name set to: ${range.name}`);
          }
        })
      };
      return;
    }

    // Voice: set X axis or Y axis using preview headers (more robust, with debug info)
    if (text.toLowerCase().includes("set x axis") || text.toLowerCase().includes("set x-axis") || text.toLowerCase().includes("select x axis") || text.toLowerCase().includes("select x-axis")) {
      console.log('🎤 Voice (set X axis) received:', text, 'previewHeaders:', previewHeaders, 'columnNames:', columnNames);
      // Prefer matching the longer form (x-axis) first so we don't accidentally capture the trailing "-axis ..." text
      const match = text.match(/(?:set|select)\s*(?:x(?:[- ]?axis)?)(?:\s*(?:is|to))?\s*(.+)/i);
      let candidate = match && match[1] ? match[1].split(/[.,]/)[0].trim() : "";

      // Fallback cleanup: if candidate looks malformed (contains 'axis' or starts with '-') try extracting the token after 'to' or 'is'
      if (!candidate || /^[-\s]*axis/i.test(candidate) || candidate.toLowerCase().includes('axis')) {
        const fallback = text.match(/(?:is|to)\s+(.+)$/i);
        candidate = fallback && fallback[1] ? fallback[1].split(/[.,]/)[0].trim() : candidate;
      }

      console.log('  parsed candidate (post-cleanup):', candidate);

      if (!previewHeaders || previewHeaders.length === 0) {
        console.log('  No preview headers available to match. Enforcing base-sheet-first-only behavior.');
        const normalize = (s) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');
        const candidateNorm = normalize(candidate);
        const getHeadersForSheet = (sheetName) => {
          if (!sheetName) return [];
          // 1) excelData
          if (Array.isArray(excelData) && excelData.length) {
            const found = excelData.find(
              (e) => (e.sheetName || '').toString().toLowerCase() === sheetName.toString().toLowerCase()
            );
            if (found && Array.isArray(found.sheetData) && found.sheetData.length) {
              return Object.keys(found.sheetData[0]);
            }
          }
          // 2) localStorage fallback (saved_excel_sheets)
          try {
            const saved = JSON.parse(localStorage.getItem('saved_excel_sheets') || '{}');
            const s = saved[sheetName] || saved[sheetName.toString()] || saved[sheetName.toString().toLowerCase()];
            if (Array.isArray(s) && s.length) return Object.keys(s[0]);
          } catch (err) {
            console.error('Error reading saved_excel_sheets from localStorage', err);
          }
          return [];
        };

        // If a base sheet was explicitly chosen, ONLY search that base sheet.
        if (copyFromSheet) {
          console.log('  base sheet selected:', copyFromSheet, '— searching only there.');
          const baseHeaders = getHeadersForSheet(copyFromSheet) || [];

          if (!baseHeaders || baseHeaders.length === 0) {
            // base sheet not loaded yet -> queue pending action for this base sheet only
            const pending = { axis: 'x', candidate, targetSheet: copyFromSheet, ts: Date.now() };
            setPendingVoiceAction(pending);
            setVoiceFeedback(`Base sheet "${copyFromSheet}" not loaded yet — will set X axis to "${candidate}" when it is available.`);
            setTimeout(() => setPendingVoiceAction((curr) => (curr && curr.ts === pending.ts ? null : curr)), 10000);
            console.log('  queued pending voice action (waiting for base sheet to load):', pending);
            return;
          }


          let foundInBase = baseHeaders.find((h) => normalize(h) === candidateNorm);
          if (!foundInBase) {
            foundInBase = baseHeaders.find((h) => normalize(h).includes(candidateNorm) || candidateNorm.includes(normalize(h)));
          }

          if (foundInBase) {
            console.log('  Matched header in base sheet:', copyFromSheet, foundInBase);

            setSelectedSheet(copyFromSheet);
            setXAxis(foundInBase);
            setColumnNames((prev) => (prev && prev.includes(foundInBase) ? prev : [...(prev || []), foundInBase]));
            setSelectedColumns((prev) =>
              prev && prev.includes(foundInBase) ? prev : [foundInBase, ...(prev?.slice?.(1) || [])]
            );
            setVoiceFeedback(`X axis set to: ${foundInBase} (from base sheet ${copyFromSheet})`);
            setTimeout(() => setVoiceFeedback(''), 4000);
            return;
          }


          const pending = { axis: 'x', candidate, targetSheet: copyFromSheet, ts: Date.now() };
          setPendingVoiceAction(pending);
          setVoiceFeedback(`"${candidate}" not found in base sheet "${copyFromSheet}". Will try again when data loads.`);
          setTimeout(() => setPendingVoiceAction((curr) => (curr && curr.ts === pending.ts ? null : curr)), 10000);
          console.log('  queued pending voice action (candidate not in base):', pending);
          return;
        }


        try {
          const saved = JSON.parse(localStorage.getItem('saved_excel_sheets') || '{}');
          for (const sName of Object.keys(saved || {})) {
            const sData = saved[sName];
            const headers = Array.isArray(sData) && sData.length > 0 ? Object.keys(sData[0]) : [];

            const match = headers.find((h) => normalize(h) === candidateNorm) ||
              headers.find((h) => normalize(h).includes(candidateNorm) || candidateNorm.includes(normalize(h)));
            if (match) {
              console.log('  Matched header in saved sheet:', sName, match);

              setSheetNames((prev) =>
                prev?.some?.((p) => p?.toLowerCase() === sName.toLowerCase()) ? prev : [...(prev || []), sName]
              );
              setExcelData((prev) =>
                prev?.some?.((e) => e.sheetName?.toLowerCase() === sName.toLowerCase())
                  ? prev
                  : [...(prev || []), { sheetName: sName, sheetData: sData }]
              );
              setSelectedSheet(sName);
              setXAxis(match);
              setColumnNames((prev) => (prev && prev.includes(match) ? prev : [...(prev || []), match]));
              setSelectedColumns((prev) =>
                prev && prev.includes(match) ? prev : [match, ...(prev?.slice?.(1) || [])]
              );
              setVoiceFeedback(`X axis set to: ${match} (loaded from ${sName})`);
              setTimeout(() => setVoiceFeedback(''), 4000);
              return;
            }
          }
        } catch (e) {
          console.error(e);
        }


        const pending = { axis: 'x', candidate, ts: Date.now() };
        setPendingVoiceAction(pending);
        setVoiceFeedback(`Could not find "${candidate}" — will set X axis when data is available.`);
        setTimeout(() => setPendingVoiceAction((curr) => (curr && curr.ts === pending.ts ? null : curr)), 10000);
        return;
      }


      const found = findHeaderMatch(candidate);
      console.log('  candidate:', candidate, 'matched header:', found);
      if (found) {
        setXAxis(found);
        // Ensure columnNames & selectedColumns include the new axis so the UI updates
        setColumnNames(prev => (prev.includes(found) ? prev : [...prev, found]));
        setSelectedColumns(prev => (prev.includes(found) ? prev : (prev[0] === "" ? [found, ...prev.slice(1)] : [...prev, found])));
        setVoiceFeedback(`X axis set to: ${found}`);
      } else {
        console.log('  No match for X axis. previewHeaders:', previewHeaders, 'columnNames:', columnNames);
        try {
          const saved = JSON.parse(localStorage.getItem('saved_excel_sheets') || '{}');
          console.log('  saved_excel_sheets keys:', Object.keys(saved).length);
        } catch (e) { console.error(e); }
        setVoiceFeedback(`Could not find column for X axis: "${candidate}"`);
      }
      setTimeout(() => setVoiceFeedback(""), 3000);
      return;
    }

    if (text.toLowerCase().includes("set y axis") || text.toLowerCase().includes("set y-axis") || text.toLowerCase().includes("select y axis") || text.toLowerCase().includes("select y-axis")) {
      console.log('🎤 Voice (set Y axis) received:', text, 'previewHeaders:', previewHeaders, 'columnNames:', columnNames);
      // Prefer matching the longer form (y-axis) first so we don't accidentally capture the trailing "-axis ..." text
      const match = text.match(/(?:set|select)\s*(?:y(?:[- ]?axis)?)(?:\s*(?:is|to))?\s*(.+)/i);
      let candidate = match && match[1] ? match[1].split(/[.,]/)[0].trim() : "";

      if (!candidate || /^[-\s]*axis/i.test(candidate) || candidate.toLowerCase().includes('axis')) {
        const fallback = text.match(/(?:is|to)\s+(.+)$/i);
        candidate = fallback && fallback[1] ? fallback[1].split(/[.,]/)[0].trim() : candidate;
      }

      console.log('  parsed candidate (post-cleanup):', candidate);

      if (!previewHeaders || previewHeaders.length === 0) {
        console.log('  No preview headers available to match. Attempting to find a saved sheet that contains the column:', candidate);
        try {
          const saved = JSON.parse(localStorage.getItem('saved_excel_sheets') || '{}');
          for (const sName of Object.keys(saved || {})) {
            const sData = saved[sName];
            const headers = Array.isArray(sData) && sData.length > 0 ? Object.keys(sData[0]) : [];
            const foundInSaved = findHeaderMatch(candidate, headers);
            if (foundInSaved) {
              console.log('  Matched header in saved sheet:', sName, foundInSaved);
              if (!sheetNames.includes(sName)) {
                setSheetNames(prev => [...prev, sName]);
                setExcelData(prev => [...prev, { sheetName: sName, sheetData: sData }]);
              }
              setSelectedSheet(sName);
              setYAxis(foundInSaved);
              setColumnNames(prev => (prev.includes(foundInSaved) ? prev : [...prev, foundInSaved]));
              setSelectedColumns(prev => (prev.includes(foundInSaved) ? prev : (prev[0] === "" ? [foundInSaved, ...prev.slice(1)] : [...prev, foundInSaved])));
              setVoiceFeedback(`Y axis set to: ${foundInSaved} (loaded from ${sName})`);
              setTimeout(() => setVoiceFeedback(""), 4000);
              return;
            }
          }
        } catch (e) { console.error(e); }

        // Not found — queue a pending action to apply when previewHeaders becomes available
        const pending = { axis: 'y', candidate, ts: Date.now() };
        setPendingVoiceAction(pending);
        console.log('  Queued pending voice action:', pending);
        setVoiceFeedback(`Waiting for preview data — will set Y axis to "${candidate}" when data is ready.`);
        setTimeout(() => setPendingVoiceAction((curr) => (curr && curr.ts === pending.ts ? null : curr)), 10000);
        return;
      }

      const found = findHeaderMatch(candidate);
      console.log('  candidate:', candidate, 'matched header:', found);
      if (found) {
        setYAxis(found);
        setColumnNames(prev => (prev.includes(found) ? prev : [...prev, found]));
        setSelectedColumns(prev => (prev.includes(found) ? prev : (prev[0] === "" ? [found, ...prev.slice(1)] : [...prev, found])));
        setVoiceFeedback(`Y axis set to: ${found}`);
      } else {
        console.log('  No match for Y axis. previewHeaders:', previewHeaders, 'columnNames:', columnNames);
        try {
          const saved = JSON.parse(localStorage.getItem('saved_excel_sheets') || '{}');
          console.log('  saved_excel_sheets keys:', Object.keys(saved).length);
        } catch (e) { console.error(e); }
        setVoiceFeedback(`Could not find column for Y axis: "${candidate}"`);
      }
      setTimeout(() => setVoiceFeedback(""), 3000);
      return;
    }

    if (text.toLowerCase().includes("open column builder")) {
      openColumnBuilder();
      return;
    }

    if (text.toLowerCase().includes("set new column name")) {

      const newColumnMatch = text.match(/set new column name (is|to)?\s*(.+)/i);
      console.log('🆕 Voice set new column name match:', newColumnMatch);
      if (newColumnMatch) {
        const colName = newColumnMatch[2].trim().split('.')[0];
        localStorage.setItem('newColumnName', colName);
        window.dispatchEvent(new Event('columnNameChanged'));
        setVoiceFeedback(`New column name set to: ${colName}`);
      }
    }

    if (text.toLowerCase().includes("add column")) {
      const addColumnMatch = text.match(/add column (.+)/i);
      console.log('🆕 Voice add column match:', addColumnMatch)
      if (addColumnMatch) {
        const saved = JSON.parse(localStorage.getItem('saved_excel_sheets') || '{}');
        console.log('  saved_excel_sheets keys:', Object.keys(saved).length);
        const foundHeaders = []
        for (const sName of Object.keys(saved || {})) {
          const sData = saved[sName];
          const headers = Array.isArray(sData) && sData.length > 0 ? Object.keys(sData[0]) : [];
          foundHeaders.push(...headers.filter(h => h.toLowerCase() === addColumnMatch[1].trim().toLowerCase()));
          ;

          const foundInSaved = findHeaderMatch(addColumnMatch[1].split('.')[0], headers);
          console.log('  candidate:', addColumnMatch[1], 'matched header:', foundInSaved);
          if (foundInSaved) {
            localStorage.setItem('selectedColumnName', foundInSaved);
            window.dispatchEvent(new Event('selectedColumnNameChanged'));
            break;
          }
        }
        console.log('  foundHeaders matching requested column:', foundHeaders);
        const x = foundHeaders.find(h => h.toLowerCase() === addColumnMatch[1].split('.')[0]);
        console.log(x);

      }
    }

    if (text.toLowerCase().includes("plus")) {
      localStorage.setItem('selectedOperator', '+');
      window.dispatchEvent(new Event('selectedOperatorChanged'));
    }

    if (text.toLowerCase().includes("minus")) {
      localStorage.setItem('selectedOperator', '-');
      window.dispatchEvent(new Event('selectedOperatorChanged'));
    }

    if (text.toLowerCase().includes("times")) {
      localStorage.setItem("selectedOperator", "*");
      window.dispatchEvent(new Event('selectedOperatorChanged'));
    }

    if (text.toLowerCase().includes("divided")) {
      localStorage.setItem("selectedOperator", "/");
      window.dispatchEvent(new Event('selectedOperatorChanged'));
    }

    if (text.toLowerCase().includes("left bracket")) {
      localStorage.setItem('selectedOperator', '(');
      window.dispatchEvent(new Event('selectedOperatorChanged'));
    }

    if (text.toLowerCase().includes("right bracket")) {
      localStorage.setItem('selectedOperator', ')');
      window.dispatchEvent(new Event('selectedOperatorChanged'));
    }

    if (text.toLowerCase().includes("submit column")) {
      console.log("Submitting new column via voice command");
      document.getElementById('submit-column-btn').click();
    }

    if (text.toLowerCase().includes("submit excel")) {
      document.getElementById('submit-excel-btn').click();
    }

    if (text.toLowerCase().includes('show result')) {
      document.getElementById('show-result-btn').click();
    }
  }

  const handleSelectSheetByVoice = (text) => {
    const cleaned = normalize(text);
    let foundSheet = "";

    sheetNames.forEach((sheet) => {
      const normSheet = normalize(sheet);
      if (cleaned.includes(normSheet)) {
        foundSheet = sheet;
      }
    });

    if (!foundSheet) {
      const tokens = cleaned.split(/\s+/).filter(Boolean);
      for (const sheet of sheetNames) {
        const normSheet = normalize(sheet);
        for (const token of tokens) {
          if (normSheet.includes(token) || normSheet.startsWith(token)) {
            foundSheet = sheet;
            break;
          }
        }
        if (foundSheet) break;
      }
    }

    if (foundSheet) {
      setSelectedSheet(foundSheet);
      setVoiceFeedback(`Sheet "${foundSheet}" selected`);
      if (feedbackRef.current) clearTimeout(feedbackRef.current);
      feedbackRef.current = setTimeout(() => setVoiceFeedback(""), 2000);
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj==');
      audio.play().catch(() => { });
    }
  };

   const handleVoiceFileUpload = (text) => {
    const cleaned = text.toLowerCase();

    const storedInLS = localStorage.getItem('recentFiles');
    console.log('🎤 VOICE UPLOAD CALLED');
    console.log('  Current recentFiles state:', recentFiles);
    console.log('  Data in localStorage:', storedInLS ? JSON.parse(storedInLS) : 'NOTHING');
    console.log('  window.recentFilesDebug:', window.recentFilesDebug);

    const uploadMatch = cleaned.match(/upload\s+(.+)/);
    const searchTerm = uploadMatch ? uploadMatch[1].trim() : cleaned.replace("upload", "").trim();

    console.log('🔍 Voice upload search:', {
      searchTerm,
      searchTermType: typeof searchTerm,
      searchTermLength: searchTerm.length,
      recentFilesCount: recentFiles.length,
      recentFilesList: recentFiles
    });

    const matches = recentFiles.filter(file => {
      const fileName = file.toLowerCase();
      const fileNameWithoutExt = fileName.split('.')[0];
      const match1 = fileName.includes(searchTerm);
      const match2 = fileNameWithoutExt.includes(searchTerm);
      const isMatch = match1 || match2;
      console.log(`  "${file}" -> fileName.includes("${searchTerm}"): ${match1}, fileNameWithoutExt.includes("${searchTerm}"): ${match2} = ${isMatch}`);
      return isMatch;
    });

    console.log('📝 Matches found:', matches.length, matches);

    if (matches.length > 0) {
      const fileToLoad = matches[0];
      console.log('✅ Auto-loading first match:', fileToLoad);
      const file = fileObjectsRef.current[fileToLoad] || fileObjectsRef.current[fileToLoad.split('.')[0]];

      if (file) {
        setVoiceFeedback("Found match! Loading: " + fileToLoad);
        processFile(file);
        setLastVoiceFileCommand("");
        setTimeout(() => setVoiceFeedback(""), 2000);
      } else {
        console.log('⚠ File object not in cache, opening picker');
        setLastVoiceFileCommand(searchTerm);
        setVoiceFeedback("File found but need to select. Opening file picker...");
        setTimeout(() => fileInputRef.current?.click(), 300);
      }
    } else {
      setLastVoiceFileCommand(searchTerm);
      setVoiceFeedback("No recent files found. Opening file picker...");
      setTimeout(() => fileInputRef.current?.click(), 300);
    }
  };

  const refreshColumnsFromSession = () => {
    try {
      const stored = sessionStorage.getItem('availableColumns');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length) {
          setColumnNames(prev => Array.from(new Set([...(prev || []), ...parsed])));
        }
      }
    } catch (e) {
    }
    try {
      const pending = sessionStorage.getItem('pendingColumnsToAdd');
      if (pending) {
        const parsed = JSON.parse(pending);
        if (Array.isArray(parsed) && parsed.length) {
          const names = parsed.map(p => p.name).filter(Boolean);
          if (names.length) {
            setColumnNames(prev => Array.from(new Set([...(prev || []), ...names])));
          }
        }
      }
    } catch (e) {
    }
  };

    const handleExcelSheetSelection = (file, sheets) => {
        setSheetNames(sheets);
        setSelectedSheet(sheets[0]);
        setSheetSelectPending(true);
    };

    const handleSheetChange = (e) => {
        setSelectedSheet(e.target.value);
    };

    const handleSheetConfirm = () => {
        setSheetSelectPending(false);
        setFileName(fileName);
        onFileUpload({ file: fileInputRef.current.files[0], sheetName: selectedSheet });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (["xlsx", "xls"].includes(fileExtension)) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const data = evt.target.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheets = workbook.SheetNames;
                    if (sheets.length > 1) {
                        handleExcelSheetSelection(file, sheets);
                    } else {
                        onFileUpload({ file, sheetName: sheets[0] });
                    }
                };
                reader.readAsBinaryString(file);
            } else {
                onFileUpload(file);
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (["csv", "xlsx", "xls", "parquet"].includes(fileExtension)) {
                setFileName(file.name);
                if (["xlsx", "xls"].includes(fileExtension)) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                        const data = evt.target.result;
                        const workbook = XLSX.read(data, { type: 'binary' });
                        const sheets = workbook.SheetNames;
                        if (sheets.length > 1) {
                            handleExcelSheetSelection(file, sheets);
                        } else {
                            onFileUpload({ file, sheetName: sheets[0] });
                        }
                    };
                    reader.readAsBinaryString(file);
                } else {
                    onFileUpload(file);
                }
            } else {
                alert('Please upload only CSV, Excel or Parquet files');
            }
        }
    };

    return (
        <div className="space-y-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            <label htmlFor={id} className="block text-sm font-medium" style={{ color: 'rgb(26, 43, 75)' }}>
                {label}
            </label>

            <div
                className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer transition-all duration-300`}
                style={{
                    backgroundColor: dragOver ? 'rgba(26, 43, 75, 0.15)' : 'rgba(26, 43, 75, 0.1)',
                    borderColor: dragOver ? 'rgb(26, 43, 75)' : error ? '#f87171' : 'rgba(26, 43, 75, 0.3)'
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
            >
                <div className="space-y-3 text-center">
                    <CloudUploadIcon style={{
                        fontSize: 48,
                        marginBottom: '8px',
                        color: error ? '#f87171' : 'rgb(26, 43, 75)'
                    }} />

                    <div className="flex flex-col items-center text-sm" style={{ color: 'rgb(26, 43, 75)' }}>
                        <label
                            htmlFor={id}
                            className="relative cursor-pointer rounded-md font-medium focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2"
                            style={{ color: 'rgb(26, 43, 75)' }}
                        >
                            <span>{fileName ? 'Change file' : 'Upload a file'}</span>
                            <input
                                id={id}
                                name={id}
                                type="file"
                                ref={fileInputRef}
                                accept=".csv,.xlsx,.xls,.parquet"
                                className="sr-only"
                                onChange={handleFileChange}
                                disabled={isLoading}
                            />
                        </label>
                        {!fileName && <p className="pl-1 mt-1">or drag and drop</p>}
                    </div>
                    <p className="text-xs" style={{ color: 'rgba(26, 43, 75, 0.7)' }}>CSV, Excel, or Parquet files only</p>
                    {fileName && (
                        <p className="text-sm mt-2" style={{ color: 'rgb(26, 43, 75)' }}>
                            Selected file: <span className="font-medium">{fileName}</span>
                        </p>
                    )}
                </div>
            </div>

            {sheetSelectPending && (
                <div style={{ marginTop: 16, background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: 16 }}>
                    <div style={{ marginBottom: 8 }}>
                        <label htmlFor="sheet-select" style={{ fontWeight: 500, color: '#1a2b4b' }}>Select Sheet:</label>
                        <select
                            id="sheet-select"
                            value={selectedSheet}
                            onChange={handleSheetChange}
                            style={{ marginLeft: 8, padding: 4, borderRadius: 4 }}
                        >
                            {sheetNames.map((sheet, idx) => (
                                <option key={sheet} value={sheet}>{sheet}{idx === 0 ? ' (default)' : ''}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleSheetConfirm}
                        style={{ background: '#1a2b4b', color: 'white', padding: '6px 16px', borderRadius: 4, border: 'none', fontWeight: 500 }}
                    >
                        Confirm
                    </button>
                </div>
            )}

            {error && (
                <div className="rounded-md p-4" style={{ backgroundColor: 'rgba(254, 226, 226, 0.5)' }}>
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">{error}</h3>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FileUploader;