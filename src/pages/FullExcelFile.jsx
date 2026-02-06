import { useEffect, useRef, useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MicIcon from "@mui/icons-material/Mic";
import Assistant from "../components/Assistant";
import * as XLSX from "xlsx";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Grid, TextField, Typography, Button } from "@mui/material";
import FormulaBuilder from "../components/FormulaBuilder";

const FullExcelFile = () => {
  const [fileName, setFileName] = useState("");
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [selectedSheetData, setSelectedSheetData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [newSheetName, setNewSheetName] = useState("");
  const [copyFromSheet, setCopyFromSheet] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [columnNames, setColumnNames] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([""]);
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [bifurcateSlices, setBifurcateSlices] = useState([]);
  const fileInputRef = useRef(null);
  const debounceRef = useRef(null);
  const addGridRef = useRef(null);
  const [addGridHeight, setAddGridHeight] = useState(560);
  const [rowRanges, setRowRanges] = useState([
    { name: "", startRange: "", endRange: "", startDisplay: "", endDisplay: "" },
    { name: "", startRange: "", endRange: "", startDisplay: "", endDisplay: "" },
  ]);
  const [activeTarget, setActiveTarget] = useState(null);
  const [preProduct, setPreProduct] = useState("");
  const [postProduct, setPostProduct] = useState("");
  const [cols, setCols] = useState([]);
  const [clientName, setClientName] = useState('');
  const [plantName, setPlantName] = useState('');
  const [productName, setProductName] = useState('');
  const [showColumnBuilder, setShowColumnBuilder] = useState(false);
  const [builderRows, setBuilderRows] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState("");
  const [voiceFeedback, setVoiceFeedback] = useState("");
  const [assistantCollapsed, setAssistantCollapsed] = useState(false);
  const [recentFiles, setRecentFiles] = useState([]);
  const [awaitingFileVoiceInput, setAwaitingFileVoiceInput] = useState(false);
  const [lastVoiceFileCommand, setLastVoiceFileCommand] = useState("");
  const [showFileSearchModal, setShowFileSearchModal] = useState(false);
  const [matchedRecentFiles, setMatchedRecentFiles] = useState([]);
  const [focusId, setFocusId] = useState('');
  const [pendingVoiceAction, setPendingVoiceAction] = useState(null);
  const recognitionRef = useRef(null);
  const feedbackRef = useRef(null);
  const fileObjectsRef = useRef({});

  const navigation = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('recentFiles');
    console.log('📂 Loading recent files from localStorage:', saved);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('  Parsed:', parsed, 'Array?', Array.isArray(parsed), 'Length:', parsed?.length);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('  ✓ Setting recentFiles state to:', parsed);
          setRecentFiles(parsed);
        }
      } catch (e) {
        console.error('Failed to parse recent files:', e);
      }
    } else {
      console.log('ℹ No recent files in localStorage yet');
    }
  }, []);

  useEffect(()=> {
    console.log(error);
    
  },[error])

  useEffect(() => {
    if (!focusId || !showAddPanel) return;

    requestAnimationFrame(() => {
      const el = document.getElementById(focusId);
      if (el) {
        el.click()
        console.log("Focused:", focusId);
      } else {
        console.log("Element not found:", focusId);
      }
    });
  }, [focusId, showAddPanel]);

  useEffect(() => {
    if (recentFiles.length > 0) {
      try {
        localStorage.setItem('recentFiles', JSON.stringify(recentFiles));
        console.log('💾 Recent files synced to localStorage:', recentFiles);
        window.recentFilesDebug = recentFiles;
      } catch (e) {
        console.error('Failed to save recent files to localStorage:', e);
      }
    }
  }, [recentFiles]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const r = new SpeechRecognition();
      r.continuous = false;
      r.lang = "en-US";
      r.interimResults = false;
      r.maxAlternatives = 1;
      r.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        setLastCommand(transcript);
        handleVoiceCommand(transcript.toLowerCase());
      };
      r.onend = () => {
        setIsListening(false);
      };
      r.onerror = () => {
        setIsListening(false);
      };
      recognitionRef.current = r;
    } else {
      recognitionRef.current = null;
    }
  }, [recentFiles]);

  useEffect(() => {
    const found = excelData.find((s) => s.sheetName === selectedSheet);
    setSelectedSheetData(found ? found.sheetData : []);
  }, [selectedSheet, excelData]);

  useEffect(() => {
    if (!copyFromSheet) {
      setColumnNames([]);
      setSelectedColumns((prev) => {
        // preserve any existing non-empty selections (e.g., axes) when not copying
        const kept = (prev || []).filter(Boolean);
        return kept.length ? kept : [""];
      });
      return;
    }
    const found = excelData.find((s) => s.sheetName === copyFromSheet);
    const cols =
      found && Array.isArray(found.sheetData) && found.sheetData.length > 0
        ? Object.keys(found.sheetData[0])
        : [];
    setColumnNames(cols);
    setSelectedColumns((prev) => {
      // keep previously selected columns that still exist in the new set of cols
      const prevSel = (prev || []).filter(Boolean).filter((c) => cols.includes(c));
      // ensure axis columns are present if available in the new cols
      if (xAxis && cols.includes(xAxis) && !prevSel.includes(xAxis)) prevSel.unshift(xAxis);
      if (yAxis && cols.includes(yAxis) && !prevSel.includes(yAxis)) prevSel.unshift(yAxis);
      return prevSel.length ? prevSel : [""];
    });
  }, [copyFromSheet, excelData, xAxis, yAxis]);
const handleAssistantResult = (data, originalText) => {
  if (!data) return;

  const intents = data.intents || [];
  if (!intents.length) {
    setVoiceFeedback(data.response || "I couldn't detect an intent.");
    return;
  }

  for (const item of intents) {
    const intent = item.intent;

    if (intent === "upload_file") {
      if (fileInputRef?.current) {
        fileInputRef.current.click();
      } else {
        setShowFileSearchModal(true);
      }
      setVoiceFeedback(item.response || "Opening file picker...");
      continue;
    }

    if (intent === "select_base_sheet") {
      const text = (originalText || "").toLowerCase();

      const asMatch = text.match(/\bas\s+(.+?)$/);
      const namedMatch = text.match(/\bnamed\s+(.+?)$/);
      const toMatch = text.match(/\bto\s+(.+?)$/);

      const candidate =
        (asMatch && asMatch[1]) ||
        (namedMatch && namedMatch[1]) ||
        (toMatch && toMatch[1]);

      if (candidate) {
        const cleaned = candidate.replace(/["'\.]/g, "").trim();
        const found = sheetNames.find(
          s => s.toLowerCase() === cleaned.toLowerCase()
        );

        if (found) {
          setSelectedSheet(found);
          setVoiceFeedback(item.response || `Selected base sheet ${found}`);
        } else {
          const partial = sheetNames.find(s =>
            s.toLowerCase().includes(cleaned.toLowerCase())
          );

          if (partial) {
            setSelectedSheet(partial);
            setVoiceFeedback(item.response || `Selected base sheet ${partial}`);
          } else {
            setShowFileSearchModal(true);
            setVoiceFeedback(`Couldn't find sheet '${cleaned}'. Opening sheet selector...`);
          }
        }
      } else {
        setShowFileSearchModal(true);
        setVoiceFeedback(item.response || "Which sheet should I set as base?");
      }
      continue;
    }

    if (intent === "enter_preprocess") {
      setVoiceFeedback(item.response || "Opening preprocessing...");
      continue;
    }

    setVoiceFeedback(item.response || `Intent: ${intent}`);
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

  useEffect(() => {
    if (showAddPanel) {
      refreshColumnsFromSession();
    }
  }, [showAddPanel, copyFromSheet, selectedSheet, excelData]);

  useEffect(() => {
    setSelectedColumns((prev = []) => {
      const next = [...prev];
      if (xAxis) {
        if (!next.includes(xAxis)) {
          const idx = next.indexOf("");
          if (idx !== -1) next[idx] = xAxis;
          else next.push(xAxis);
        }
      }
      if (yAxis) {
        if (!next.includes(yAxis)) {
          const idx = next.indexOf("");
          if (idx !== -1) next[idx] = yAxis;
          else next.push(yAxis);
        }
      }
      // ensure uniqueness and preserve order
      return Array.from(new Set(next));
    });
  }, [xAxis, yAxis]);

  useEffect(() => {
    const updateHeight = () => {
      const calc = Math.round(window.innerHeight * 0.60);
      const h = Math.max(520, Math.min(880, calc));
      setAddGridHeight(h);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, [showAddPanel, selectedColumns, xAxis, yAxis, columnNames, newSheetName, copyFromSheet, rowRanges]);

  const excelSerialToDate = (n) =>
    new Date(Math.round((n - 25569) * 86400 * 1000));
  const formatDate = (v) => {
    let d = null;
    if (v instanceof Date && !isNaN(v.getTime())) {
      d = v;
    } else if (typeof v === "number") {
      d = excelSerialToDate(v);
    } else if (typeof v === "string") {
      const cleaned = v.replace(/^[A-Za-z]+,\s*/, "");
      const parsed = new Date(cleaned);
      if (!isNaN(parsed.getTime())) d = parsed;
    }
    if (!d) return v;
    return `${d.getFullYear()}-${(d.getMonth() + 1)}-${(d.getDate())}`;
  };

  const renderCellValue = (v) => {
    if (v instanceof Date && !isNaN(v.getTime())) {
      return formatDate(v);
    }
    if (v && typeof v === "object") {
      try {
        return JSON.stringify(v);
      } catch (e) {
        return String(v);
      }
    }
    return v;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('📥 File selected:', file.name);

    if (lastVoiceFileCommand) {
      const fileName = file.name.toLowerCase();
      const fileNameWithoutExt = fileName.split('.')[0];
      const voiceCmd = lastVoiceFileCommand.toLowerCase();

      const isMatch = voiceCmd.includes(fileName) || voiceCmd.includes(fileNameWithoutExt) ||
        fileName.includes(voiceCmd) || fileNameWithoutExt.includes(voiceCmd);

      if (!isMatch) {
        setVoiceFeedback(`Selected: ${file.name}. Processing...`);
      } else {
        setVoiceFeedback(`Found match! Loading: ${file.name}`);
      }
    }

    console.log('  Before processFile - recentFiles state:', recentFiles);
    processFile(file);
    setLastVoiceFileCommand("");

    if (e.target) {
      e.target.value = '';
    }

    console.log('  After processFile - recentFiles state:', recentFiles);
  };

  const processFile = (file) => {
    console.log('📝 processFile called with:', file.name);

    setFileName(file.name);
    setError(null);
    setVoiceFeedback("File selected: " + file.name + ". Processing...");

    fileObjectsRef.current[file.name] = file;
    fileObjectsRef.current[file.name.split('.')[0]] = file;

    const newRecent = [file.name, ...recentFiles.filter(f => f !== file.name)].slice(0, 10);
    console.log('  Updating recentFiles from:', recentFiles);
    console.log('  To:', newRecent);
    setRecentFiles(newRecent);

    try {
      localStorage.setItem('recentFiles', JSON.stringify(newRecent));
      console.log('  ✓ Saved to localStorage:', newRecent);
    } catch (e) {
      console.error('  ✗ Failed to save to localStorage:', e);
    }

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "xlsm"].includes(ext)) {
      setError("Unsupported file type");
      setVoiceFeedback("Error: Unsupported file type. Please select an Excel file.");
      setTimeout(() => setVoiceFeedback(""), 3000);
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const workbook = XLSX.read(evt.target.result, { type: "binary", cellDates: true, cellNF: true });
        const sheets = workbook.SheetNames;
        setSheetNames(sheets);
        const parsed = sheets.map((name) => {
          const ws = workbook.Sheets[name];
          const rawRows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: true });
          const formattedRows = rawRows.map((row) => {
            const newRow = { ...row };
            Object.keys(newRow).forEach((k) => {
              const v = newRow[k];
              const keyLower = k.toLowerCase();
              if (keyLower.includes("date")) {
                if (v instanceof Date && !isNaN(v.getTime())) {
                  const y = v.getFullYear();
                  const m = v.getMonth();
                  const d = v.getDate();
                  newRow[k] = `${y}-${(m + 1)}-${(d)}`;
                  newRow[`__num__${k}`] = Date.UTC(y, m, d);
                }
              } else if (keyLower.includes("time")) {
                if (v instanceof Date && !isNaN(v.getTime())) {
                  const hh = v.getHours();
                  const mm = v.getMinutes();
                  const ss = v.getSeconds();
                  newRow[k] = `${hh}:${mm}:${ss}`;
                  newRow[`__num__${k}`] = hh * 3600 + mm * 60 + ss;
                }
              }
            });
            return newRow;
          });
          return {
            sheetName: name,
            sheetData: formattedRows,
          };
        });
        setExcelData(parsed);

        try {
          const existing = JSON.parse(localStorage.getItem('saved_excel_sheets') || '{}');
          const merged = { ...(existing || {}) };
          parsed.forEach((s) => { merged[s.sheetName] = s.sheetData; });
          localStorage.setItem('saved_excel_sheets', JSON.stringify(merged));
          const existingNames = JSON.parse(localStorage.getItem('saved_sheet_names') || '[]');
          const mergedNames = Array.from(new Set([...(existingNames || []), ...parsed.map((s) => s.sheetName)]));
          localStorage.setItem('saved_sheet_names', JSON.stringify(mergedNames));
          console.log('Saved sheets to localStorage:', mergedNames);
        } catch (e) {
          console.error('Failed to save sheets to localStorage', e);
        }
        if (sheets.length > 0) setSelectedSheet(sheets[0]);
        const sheetText = sheets.length > 1 ? "sheets" : "sheet";
        setVoiceFeedback("File loaded! Found " + sheets.length + " " + sheetText);
        setTimeout(() => setVoiceFeedback(""), 3000);
      } catch (err) {
        const msg = String(err?.message || err || "");
        if (msg.toLowerCase().includes("password") || msg.toLowerCase().includes("protected")) {
          setError("This Excel file appears to be password protected. Please remove the password and upload again.");
          setVoiceFeedback("Error: File is password protected. Please remove the password and try again.");
          alert("This Excel file appears to be password protected. Please remove the password and upload again.");
        } else {
          setError("Failed to read the Excel file. Please upload a valid file.");
          setVoiceFeedback("Error: Failed to read Excel file. Please upload a valid file.");
          alert("Failed to read the Excel file. Please upload a valid file.");
        }
        setTimeout(() => setVoiceFeedback(""), 4000);
        setFileName("");
      }
    };
    reader.readAsBinaryString(file);
  };

  const normalizeSheetName = (name) => {
    if (!name) return "";
    return name.trim().slice(0, 31);
  };

  const parseRange = (a, b) => {
    let start, end;
    if (typeof b !== "undefined") {
      start = parseInt(a, 10);
      end = parseInt(b, 10);
    } else if (typeof a === "string") {
      const parts = a.split("-").map((s) => s.trim());
      if (parts.length !== 2) return null;
      start = parseInt(parts[0], 10);
      end = parseInt(parts[1], 10);
    } else {
      return null;
    }
    if (Number.isNaN(start) || Number.isNaN(end)) return null;
    const s = Math.max(1, Math.min(start, end));
    const e = Math.max(1, Math.max(start, end));
    return [s - 1, e - 1];
  };

  const buildTempSlices = () => {
    const baseName = newSheetName.trim() || "tmp";
    const baseSheet = excelData.find((s) => s.sheetName === (copyFromSheet || selectedSheet));
    const sheetRows = baseSheet && Array.isArray(baseSheet.sheetData) ? baseSheet.sheetData : [];
    const emojiColors = ["🟢", "🔴", "🟡", "🔵", "🟣"];
    const hexMap = { "🟢": "#10b981", "🔴": "#ef4444", "🟡": "#f59e0b", "🔵": "#3b82f6", "🟣": "#8b5cf6" };
    const slices = rowRanges
      .map((rr, idx) => {
        if (!rr.name) return null;
        const range = parseRange(rr.startRange, rr.endRange);
        const rows = range ? sheetRows.slice(range[0], range[1] + 1) : sheetRows;
        if (!rows.length) return null;
        const cols = rows.length > 0 ? Object.keys(rows[0]) : [];
        const emoji = emojiColors[idx % emojiColors.length];
        if (idx === 0) {
          setPreProduct(`${baseName}-${rr.name.trim()}`)
          console.log('PreProduct set to:', preProduct);
        }
        if (idx === 1) {
          setPostProduct(`${baseName}-${rr.name.trim()}`)
          console.log('PostProduct set to:', postProduct);
        }
        return {
          name: rr.name.trim(),
          start: range ? range[0] : 0,
          end: range ? range[1] : sheetRows.length - 1,
          rows,
          cols,
          colorEmoji: emoji,
          colorHex: hexMap[emoji],
          fullName: `${baseName}-${rr.name.trim()}`,
        };
      })
      .filter(Boolean);
    setBifurcateSlices(slices);
    try {
      localStorage.setItem(`temp_bifurcate_${baseName}`, JSON.stringify(slices));
      console.log(slices)
    } catch (e) { }
    const unionCols = new Set();
    if (baseSheet && baseSheet.sheetData && baseSheet.sheetData.length) {
      Object.keys(baseSheet.sheetData[0]).forEach((c) => unionCols.add(c));
    }
    slices.forEach((s) => s.cols.forEach((c) => unionCols.add(c)));
    try {
      const pending = sessionStorage.getItem('pendingColumnsToAdd');
      if (pending) {
        const parsed = JSON.parse(pending);
        if (Array.isArray(parsed)) {
          parsed.forEach(p => { if (p && p.name) unionCols.add(p.name) });
        }
      }
    } catch (e) { }
    setColumnNames(Array.from(unionCols));
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      buildTempSlices();
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [rowRanges, newSheetName, copyFromSheet, selectedSheet, excelData]);

  const escapeRegExp = (string) => {
    return String(string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const evaluateFormulaForRow = (formula, row) => {
    if (!formula || typeof formula !== "string") return "";
    const cols = Object.keys(row).sort((a, b) => b.length - a.length);
    let expr = formula;
    cols.forEach((col) => {
      const val = row[col];
      const num = Number(val);
      const replacement = `(${isNaN(num) ? 0 : num})`;
      const pattern = new RegExp(escapeRegExp(col), "g");
      expr = expr.replace(pattern, replacement);
    });
    try {
      const fn = new Function(`return (${expr});`);
      const result = fn();
      return result === undefined || result === null ? "" : result;
    } catch (e) {
      return "";
    }
  };

  const resolvePendingValue = (pc, row, globalIndex) => {
    if (!pc) return "";
    if (Array.isArray(pc.values) && typeof globalIndex === "number") {
      if (globalIndex >= 0 && globalIndex < pc.values.length) return pc.values[globalIndex];
    }
    if (pc.value !== undefined) return pc.value;
    if (pc.formula && typeof pc.formula === "string") {
      return evaluateFormulaForRow(pc.formula, row);
    }
    if (pc.expression && typeof pc.expression === "string") {
      return evaluateFormulaForRow(pc.expression, row);
    }
    return "";
  };

  const getPendingColumns = () => {
    try {
      const raw = sessionStorage.getItem('pendingColumnsToAdd');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch (e) {
      return [];
    }
  };

  const applyPendingColumnsToRows = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return rows || [];
    const pending = getPendingColumns();
    if (!pending || pending.length === 0) return rows;
    return rows.map((row, idx) => {
      const nr = { ...row };
      pending.forEach((pc) => {
        if (pc && pc.name) {
          const val = resolvePendingValue(pc, row, idx);
          nr[pc.name] = val;
        }
      });
      return nr;
    });
  };

  const handleAddSheetSubmit = async () => {
    setError(null);

    let trimmed = newSheetName.trim();
    if (!trimmed) {
      trimmed = localStorage.getItem("newSheetName") ;
      if (!trimmed) {
        setError("Please enter a name");
        return;
      }
    }
    const finalName = normalizeSheetName(trimmed);
    const collision = bifurcateSlices.some((s) => sheetNames.includes(`${finalName}-${s.name}`));
    if (collision) {
      setError("A sheet with that name already exists");
      return;
    }
    setAddLoading(true);
    try {
      let pendingCols = [];
      try {
        const pendingRaw = sessionStorage.getItem('pendingColumnsToAdd');
        if (pendingRaw) pendingCols = JSON.parse(pendingRaw);
      } catch (e) { pendingCols = []; }

      if (bifurcateSlices && bifurcateSlices.length > 0) {
        const newSheets = bifurcateSlices.map((s) => {
          const picks = selectedColumns.filter((c) => c && c !== "");
          let sheetRows = s.rows;
          if (picks.length > 0) {
            sheetRows = sheetRows.map((row, idx) => {
              const nr = {};
              picks.forEach((k) => (nr[k] = row[k]));
              pendingCols.forEach(pc => {
                if (pc && pc.name) {
                  const globalIndex = s.start + idx;
                  const val = resolvePendingValue(pc, row, globalIndex);
                  nr[pc.name] = val;
                }
              });
              return nr;
            });
          } else {
            sheetRows = sheetRows.map((row, idx) => {
              const nr = { ...row };
              pendingCols.forEach(pc => {
                if (pc && pc.name) {
                  const globalIndex = s.start + idx;
                  const val = resolvePendingValue(pc, row, globalIndex);
                  nr[pc.name] = val;
                }
              });
              return nr;
            });
          }
          return {
            sheetName: `${finalName}-${s.name}`,
            sheetData: sheetRows,
          };
        });
        setSheetNames((prev) => [...prev, ...newSheets.map((ns) => ns.sheetName)]);
        setExcelData((prev) => [...prev, ...newSheets]);
      } else if (copyFromSheet) {
        const found = excelData.find((s) => s.sheetName === copyFromSheet);
        const sourceData = found ? found.sheetData || [] : [];
        const picks = selectedColumns.filter((c) => c && c !== "");
        let dataToCopy = [];
        if (picks.length > 0 && sourceData.length > 0) {
          dataToCopy = sourceData.map((row, idx) => {
            const newRow = {};
            picks.forEach((k) => (newRow[k] = row[k]));
            pendingCols.forEach(pc => {
              if (pc && pc.name) {
                const globalIndex = idx;
                const val = resolvePendingValue(pc, row, globalIndex);
                newRow[pc.name] = val;
              }
            });
            return newRow;
          });
        } else {
          dataToCopy = sourceData.map((row, idx) => {
            const nr = { ...row };
            pendingCols.forEach(pc => {
              if (pc && pc.name) {
                const globalIndex = idx;
                const val = resolvePendingValue(pc, row, globalIndex);
                nr[pc.name] = val;
              }
            });
            return nr;
          });
        }
        const sheetObj = { sheetName: finalName, sheetData: dataToCopy };
        setSheetNames((prev) => [...prev, finalName]);
        setExcelData((prev) => [...prev, sheetObj]);
      } else {
        const emptyRows = [];
        const sheetObj = { sheetName: finalName, sheetData: emptyRows };
        setSheetNames((prev) => [...prev, finalName]);
        setExcelData((prev) => [...prev, sheetObj]);
      }
      setSelectedSheet(finalName);
      setShowAddPanel(false);
      setNewSheetName("");
      setCopyFromSheet("");
      setCols(Array.from(new Set(selectedColumns || [])));
      setColumnNames([]);
      setSelectedColumns([""]);
      setRowRanges([{ name: "", startRange: "", endRange: "", startDisplay: "", endDisplay: "" }]);
      setBifurcateSlices([]);

      try {
        localStorage.removeItem(`temp_bifurcate_${finalName}`);
      } catch (e) { }
      try {
        sessionStorage.removeItem('pendingColumnsToAdd');
      } catch (e) { }
    } catch (e) {
      console.error(e);
      setError("Failed to create file");
    } finally {
      setAddLoading(false);
    }
  };

  const handleAddColumnSelector = () => {
    if (selectedColumns.length >= columnNames.length) return;
    setSelectedColumns((prev) => [...prev, ""]);
  };

  const handleColumnChange = (index, value) => {
    setSelectedColumns((prev) => {
      const next = [...prev];
      next[index] = value;
      for (let i = 0; i < next.length; i++) {
        if (i !== index && next[i] === value) next[i] = "";
      }
      return next;
    });
  };

  const toggleColumnSelection = (col) => {
    setSelectedColumns((prev) => {
      if (prev.includes(col)) {
        const idx = prev.indexOf(col);
        const next = [...prev];
        next[idx] = "";
        return next;
      } else {
        const idx = prev.indexOf("");
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = col;
          return next;
        } else {
          return [...prev, col];
        }
      }
    });
  };

  const addRowRange = () => {
    setRowRanges((prev) => [...prev, { name: "", startRange: "", endRange: "", startDisplay: "", endDisplay: "" }]);
  };

  const removeRowRange = (idx) => {
    setRowRanges((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRowRangeChange = (idx, field, value, name) => {
    setRowRanges((prev) => {
      const next = prev.map((r, i) => {
        if (i !== idx) return r;
        const updated = { ...r, [field]: value };
        if (field === "startRange") { updated.startDisplay = ""; setPreProduct(name + "-" + updated.name); }
        if (field === "endRange") { updated.endDisplay = ""; setPostProduct(name + "-" + updated.name); }
        console.log('Updated rowRanges:', preProduct, postProduct);
        return updated;
      });
      console.log('Updated rowRanges:', preProduct, postProduct);
      return next;
    });
  };

  const getNumeric = (row, col) => {
    const n = Number(row[col]);
    if (!isNaN(n)) return n;
    const alt = row[`__num__${col}`];
    if (typeof alt === "number") return alt;
    const dt = new Date(row[col]);
    if (!isNaN(dt.getTime())) return dt.getTime();
    return NaN;
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

  const previewSheet = excelData.find((s) => s.sheetName === (copyFromSheet || selectedSheet)) || { sheetData: [] };
  const previewSheetWithPending = {
    ...previewSheet,
    sheetData: applyPendingColumnsToRows(previewSheet.sheetData || [])
  };
  const previewHeaders = previewSheetWithPending.sheetData && previewSheetWithPending.sheetData.length ? Object.keys(previewSheetWithPending.sheetData[0]) : [];

  // Debug: log preview headers whenever they change so we can inspect via console
  useEffect(() => {
    console.log('🔎 previewHeaders updated:', previewHeaders, 'len:', previewHeaders.length, 'selectedSheet:', selectedSheet, 'copyFromSheet:', copyFromSheet, 'columnNames:', columnNames);
  }, [previewHeaders, selectedSheet, copyFromSheet, columnNames]);

  // If a voice axis command was queued while data was loading, apply it once previewHeaders become available
  useEffect(() => {
    if (!pendingVoiceAction) return;
    if (!previewHeaders || previewHeaders.length === 0) return;

    const { axis, candidate } = pendingVoiceAction;
    console.log('⏳ Processing pendingVoiceAction:', pendingVoiceAction, 'previewHeadersLen:', previewHeaders.length);

    const found = findHeaderMatch(candidate);
    if (found) {
      if (axis === 'x') {
        setXAxis(found);
      } else {
        setYAxis(found);
      }
      setColumnNames(prev => (prev.includes(found) ? prev : [...prev, found]));
      setSelectedColumns(prev => (prev.includes(found) ? prev : (prev[0] === "" ? [found, ...prev.slice(1)] : [...prev, found])));
      setVoiceFeedback(`${axis.toUpperCase()} axis set to: ${found}`);
      setPendingVoiceAction(null);
      setTimeout(() => setVoiceFeedback(""), 3000);
    } else {
      console.log('Pending action could not find a match even after previewHeaders populated for candidate:', candidate);
    }
  }, [previewHeaders, pendingVoiceAction]);

  // Helper: try multiple strategies to match a spoken term to a header from previewHeaders (or provided headers)
  const findHeaderMatch = (text, headers = previewHeaders) => {
    if (!text) return null;
    const cleaned = normalize(text);

    const source = Array.isArray(headers) ? headers : [];

    // 1) exact normalized match
    let found = source.find((h) => normalize(h) === cleaned || h.toLowerCase() === text.toLowerCase());
    if (found) return found;

    // 2) header contains the candidate or vice versa
    found = source.find((h) => cleaned.includes(normalize(h)) || normalize(h).includes(cleaned));
    if (found) return found;

    // 3) token-based fuzzy match
    const tokens = cleaned.split(/\s+/).filter(Boolean);
    for (const t of tokens) {
      const f = source.find((h) => normalize(h).includes(t) || t.includes(normalize(h)));
      if (f) return f;
    }

    // 4) fallback to columnNames (in case previewHeaders is empty or different)
    for (const col of columnNames) {
      if (normalize(col) === cleaned) return col;
    }

    return null;
  };

  const getPreviewRowDate = (rowIndex) => {
    const row = previewSheetWithPending.sheetData && previewSheetWithPending.sheetData[rowIndex];
    if (!row) return "";
    const dateKey = previewHeaders.find((h) => h.toLowerCase().includes("date")) || previewHeaders.find((h) => h.toLowerCase().includes("time")) || previewHeaders[0];
    const val = row[dateKey];
    const ds = formatDate(val);
    return ds;
  };

  const handlePreviewRowClick = (rowIndex) => {
    if (!activeTarget) return;
    const { idx, field } = activeTarget;
    const dateStr = getPreviewRowDate(rowIndex);
    const display = dateStr || "";
    setRowRanges((prev) => {
      const next = prev.map((r, i) => {
        if (i !== idx) return r;
        if (field === "startRange") return { ...r, startRange: String(rowIndex + 1), startDisplay: display };
        if (field === "endRange") return { ...r, endRange: String(rowIndex + 1), endDisplay: display };
        return r;
      });
      return next;
    });
    setActiveTarget(null);
  };

  const handleDownloadExcel = () => {
    if (!excelData || excelData.length === 0) return;

    const wb = XLSX.utils.book_new();

    excelData.forEach((sheet) => {
      const data = sheet.sheetData || [];

      const cleaned = data.map((row) => {
        const newRow = {};
        Object.keys(row).forEach((key) => {
          if (!key.startsWith("__num__")) {
            newRow[key] = row[key];
          }
        });
        return newRow;
      });

      const ws = XLSX.utils.json_to_sheet(cleaned);
      XLSX.utils.book_append_sheet(wb, ws, sheet.sheetName.substring(0, 31));
    });

    const outName = (fileName || "excel_data").replace(/\.(xlsx|xls|xlsm)$/i, "") + "_modified.xlsx";

    XLSX.writeFile(wb, outName);
  };

  const openColumnBuilder = () => {
    const baseSheet = excelData.find((s) => s.sheetName === (copyFromSheet || selectedSheet));
    const rows = baseSheet && Array.isArray(baseSheet.sheetData) ? baseSheet.sheetData : [];
    setBuilderRows(rows);
    setShowColumnBuilder(true);
  };

  const handleAddColumn = (newColumn) => {
    try {
      const raw = sessionStorage.getItem('pendingColumnsToAdd');
      const parsed = raw ? JSON.parse(raw) : [];
      const toStore = { ...newColumn, values: Array.isArray(newColumn.values) ? newColumn.values : (newColumn.values ? [newColumn.values] : []) };
      const existsIndex = parsed.findIndex(p => p.name === toStore.name);
      if (existsIndex === -1) parsed.push(toStore);
      else parsed[existsIndex] = toStore;
      sessionStorage.setItem('pendingColumnsToAdd', JSON.stringify(parsed));
    } catch (e) { }
    setColumnNames(prev => Array.from(new Set([...(prev || []), newColumn.name])));
    setSelectedColumns(prev => {
      if (prev.includes("")) {
        const next = [...prev];
        const idx = next.indexOf("");
        next[idx] = newColumn.name;
        return next;
      }
      return [...prev, newColumn.name];
    });
    setShowColumnBuilder(false);
  };

  const isColumnSelected = (col) => selectedColumns.includes(col);

  const startListening = () => {
    if (!recognitionRef.current) {
      setError("Voice recognition not supported in this browser");
      return;
    }
    try {
      setLastCommand("");
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) { }
    setIsListening(false);
  };

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
            if(foundInSaved){
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

    if(text.toLowerCase().includes("plus")){
      localStorage.setItem('selectedOperator', '+');
      window.dispatchEvent(new Event('selectedOperatorChanged'));
    }

    if(text.toLowerCase().includes("minus")){
      localStorage.setItem('selectedOperator', '-');
      window.dispatchEvent(new Event('selectedOperatorChanged'));
    }

    if(text.toLowerCase().includes("times")){
      localStorage.setItem("selectedOperator","*");
      window.dispatchEvent(new Event('selectedOperatorChanged'));
    }

    if(text.toLowerCase().includes("divided")){
      localStorage.setItem("selectedOperator","/");
      window.dispatchEvent(new Event('selectedOperatorChanged'));
    }

    if(text.toLowerCase().includes("left bracket")){
      localStorage.setItem('selectedOperator', '(');
      window.dispatchEvent(new Event('selectedOperatorChanged'));
    }

    if(text.toLowerCase().includes("right bracket")){
      localStorage.setItem('selectedOperator', ')');
      window.dispatchEvent(new Event('selectedOperatorChanged'));
    }

    if(text.toLowerCase().includes("submit column")){
      console.log("Submitting new column via voice command");
      document.getElementById('submit-column-btn').click();
    }

    if(text.toLowerCase().includes("submit excel"))
    {
      document.getElementById('submit-excel-btn').click();
    }

    if(text.toLowerCase().includes('show result')){
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

  const handleDirectFileSelection = (fileName) => {
    const file = fileObjectsRef.current[fileName] || fileObjectsRef.current[fileName.split('.')[0]];
    if (file) {
      setVoiceFeedback("Found match! Loading: " + fileName);
      processFile(file);
      setShowFileSearchModal(false);
      setTimeout(() => setVoiceFeedback(""), 2000);
      setLastVoiceFileCommand("");
    } else {
      fileInputRef.current?.click();
      setShowFileSearchModal(false);
    }
  };

  const handleBrowseMoreFiles = () => {
    setShowFileSearchModal(false);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 300);
  };

  const normalize = (s) => {
    return String(s || "").toLowerCase().replace(/[_\-]/g, " ").replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  };

  const handleSelectColumns = (text) => {
    const cleaned = normalize(text);
    let target = "";
    columnNames.forEach((col) => {
      if (cleaned.includes(normalize(col))) target = col;
    });
    if (!target) {
      const tokens = cleaned.split(/\s+/);
      for (const t of tokens) {
        columnNames.forEach((col) => {
          if (normalize(col).includes(t)) target = col;
        });
      }
    }
    if (target) {
      if (axis === "x") setXAxis(target);
      else setYAxis(target);
    }
  };

  const displayedSelectedSheetData = applyPendingColumnsToRows(selectedSheetData || []);

  return (
    <>
      {showFileSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold text-slate-900">Find File</h2>
              <p className="text-sm text-slate-600 mt-1">Searching for: <span className="font-semibold text-blue-600">{lastVoiceFileCommand}</span></p>
            </div>

            {matchedRecentFiles.length > 0 ? (
              <div className="p-4">
                <div className="text-xs font-semibold text-slate-700 mb-2">Matching Files:</div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {matchedRecentFiles.map((file) => (
                    <button
                      key={file}
                      onClick={() => handleDirectFileSelection(file)}
                      className="w-full text-left p-3 rounded-md hover:bg-blue-50 border border-slate-200 hover:border-blue-400 transition"
                    >
                      <div className="font-medium text-slate-800">{file}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-slate-500">
                <div className="text-sm">No matching files found in recent.</div>
              </div>
            )}

            <div className="p-4 border-t flex gap-2">
              <button
                onClick={handleBrowseMoreFiles}
                className="flex-1 bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 transition"
              >
                Browse Files
              </button>
              <button
                onClick={() => setShowFileSearchModal(false)}
                className="flex-1 bg-slate-200 text-slate-800 rounded-md py-2 font-medium hover:bg-slate-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 items-start">
        <div className="h-[calc(100vh-12rem)] overflow-y-auto space-y-6 w-full max-w-5xl mx-auto">
          <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Typography variant="h6" component="h3" color="primary.main" sx={{ mb: 2 }}>
                Project Information (Optional)
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Client Name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    variant="outlined"
                    size="medium"
                    placeholder="Enter client name"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Plant Name"
                    value={plantName}
                    onChange={(e) => setPlantName(e.target.value)}
                    variant="outlined"
                    size="medium"
                    placeholder="Enter plant name"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Product Name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    variant="outlined"
                    size="medium"
                    placeholder="Enter product name"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <div className="mx-auto max-w-md rounded-2xl border-2 border-dashed bg-slate-50 p-8 text-center transition hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg">
            <CloudUploadIcon className="mb-3 text-[52px] text-slate-700" />
            <div className="text-sm">
              <label htmlFor="fileUpload" className="cursor-pointer font-semibold text-slate-800 hover:text-blue-600">
                {fileName ? "Change file" : "Upload Excel file"}
              </label>
              <input
                id="fileUpload"
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls,.xlsm"
                className="hidden"
                onChange={handleFileChange}
                disabled={isLoading}
                title={lastVoiceFileCommand ? `Looking for: ${lastVoiceFileCommand}` : "Select an Excel file"}
              />
              {!fileName && <p className="mt-1 text-xs text-slate-500">or drag & drop</p>}
            </div>
            <div className="mt-4 flex items-center justify-center gap-3">
              {fileName && (
                <div className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">{fileName}</div>
              )}
            </div>
            {lastCommand && <div className="mt-2 text-xs text-slate-600">Last: {lastCommand}</div>}
            {voiceFeedback && <div className="mt-2 text-xs font-medium text-blue-600">{voiceFeedback}</div>}
            {lastVoiceFileCommand && (
              <div className="mt-3 p-2 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="text-xs font-semibold text-yellow-800">🔍 Looking for:</div>
                <div className="text-sm font-medium text-yellow-900">{lastVoiceFileCommand}</div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <button
            id='show-result-btn'
              onClick={() => {
                const preSheetData = (excelData.find(s => s.sheetName === preProduct)).sheetData
                const preSheetName = preProduct;
                console.log("[DEBUG] cols =", cols);
                console.log("[DEBUG] preProductData", preSheetData);
                const sheet = sheetNames;
                console.log("[DEBUG] sheetNames =", sheet);
                const postSheetData = (excelData.find(s => s.sheetName === postProduct)).sheetData
                console.log("[DEBUG] postProductData", postSheetData);
                const postSheetName = postProduct;
                navigation("/visualize-data", {
                  state: {
                    availableCols: Array.from(new Set(cols || [])),
                    preProductData: preSheetData,
                    postProductData: postSheetData,
                    excelData: excelData,
                    sheetNames: sheet,
                    preSheetName: preSheetName,
                    postSheetName: postSheetName
                  }
                })
              }}
              disabled={!fileName}
              className="relative inline-flex items-center justify-center rounded-xl bg-blue-600 px-10 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl active:scale-95 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
            >
              Continue to Data Checks →
            </button>
          </div>

          {sheetNames.length > 0 && (
            <div className="rounded-xl border bg-white shadow-sm">
              <div className="relative border-b px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-700">Sheets</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadExcel}
                      disabled={excelData.length === 0}
                      className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-50"
                    >
                      Download Excel
                    </button>
                    <button onClick={() => setShowAddPanel((s) => !s)} className="ml-2 inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-green-700 focus:outline-none">
                      <span className="text-lg leading-none">+</span>
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                  {sheetNames.map((sheet) => (
                    <button key={sheet} onClick={() => setSelectedSheet(sheet)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition
                        ${selectedSheet === sheet ? "bg-blue-600 text-white shadow" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                      {sheet}
                    </button>
                  ))}
                </div>

                {showAddPanel && (
                  <div className="mt-3">
                    <div ref={addGridRef} className="grid grid-cols-2 grid-rows-2 gap-4" style={{ height: addGridHeight }}>
                      <div className="group rounded-2xl border border-indigo-200 bg-gradient-to-br from-sky-50 via-indigo-50 to-fuchsia-100 p-5 overflow-auto h-full shadow-sm transform transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl hover:scale-[1.02] hover:ring-2 hover:ring-indigo-100 focus:outline-none">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-medium text-indigo-800">Create new Excel</div>
                          <button onClick={() => {
                            setShowAddPanel(false);
                            setNewSheetName("");
                            setCopyFromSheet("");
                            setError(null);
                            setColumnNames([]);
                            setSelectedColumns([""]);
                            setRowRanges([{ name: "", startRange: "", endRange: "", startDisplay: "", endDisplay: "" }]);
                            setBifurcateSlices([]);
                            setActiveTarget(null);
                          }} className="text-slate-500 hover:text-slate-700">✕</button>
                        </div>

                        <div className="mt-3">
                          <input id='newsheet' value={newSheetName} onChange={(e) => {setNewSheetName(e.target.value);localStorage.setItem("newSheetName", e.target.value)}} placeholder="Enter sheet/file name" className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                        </div>

                        <div className="mt-3">
                          <label className="block text-xs text-slate-600">Copy from existing sheet (optional)</label>
                          <select id="basesheet" value={copyFromSheet} onChange={(e) => setCopyFromSheet(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                            <option value="">-- Do not copy (create blank sheet) --</option>
                            {sheetNames.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-medium text-slate-600">Add sheet name & row range</div>
                            <button onClick={addRowRange} className="inline-flex items-center rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700">+</button>
                          </div>
                          <div className="space-y-2">
                            {rowRanges.map((rr, idx) => (
                              <div key={idx} className="flex gap-2">
                                <input value={rr.name} onChange={(e) => handleRowRangeChange(idx, "name", e.target.value, newSheetName)} placeholder="Pre/Post" className="w-1/3 rounded-md border px-3 py-2 text-sm" />
                                <input value={rr.startDisplay || rr.startRange} onChange={(e) => handleRowRangeChange(idx, "startRange", e.target.value, newSheetName)} placeholder="start e.g. 1" className="w-1/3 rounded-md border px-3 py-2 text-sm" onMouseDown={() => setActiveTarget({ idx, field: "startRange" })} />
                                <input value={rr.endDisplay || rr.endRange} onChange={(e) => {
                                  const value = e.target.value;
                                  handleRowRangeChange(idx, "endRange", value, newSheetName);
                                  if (debounceRef.current) {
                                    clearTimeout(debounceRef.current);
                                  }
                                  debounceRef.current = setTimeout(() => {
                                    buildTempSlices();
                                  }, 300);
                                }} placeholder="end e.g. 10" className="w-1/3 rounded-md border px-3 py-2 text-sm" onMouseDown={() => setActiveTarget({ idx, field: "endRange" })} />
                                {rowRanges.length > 1 && (
                                  <button onClick={() => removeRowRange(idx)} className="ml-1 rounded-md bg-red-600 px-2 py-1 text-xs text-white">✕</button>
                                )}
                              </div>
                            ))}
                          </div>

                          {bifurcateSlices.length > 0 && (
                            <div className="mt-3 text-xs">
                              <div className="font-medium mb-1">Trimmed slices preview</div>
                              <div className="flex flex-col gap-1">
                                {bifurcateSlices.map((s) => (
                                  <div key={s.fullName} className="flex items-center gap-2 text-xs">
                                    <div style={{ width: 12, height: 12, borderRadius: 4, background: s.colorHex }} />
                                    <div className="font-medium">{s.fullName}</div>
                                    <div className="text-slate-500">({s.start + 1} to {s.end + 1}, {s.rows.length} rows)</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>

                      </div>

                      <div className="group rounded-2xl border border-indigo-200 bg-gradient-to-br from-sky-50 via-indigo-50 to-fuchsia-100 p-0 overflow-auto h-full transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.01]">
                        <div className="h-full w-full p-3">
                          <div className="px-2 py-1 bg-gradient-to-r from-sky-50 to-white flex items-center justify-between border-b">
                            <div className="text-xs font-medium text-indigo-700">Preview: {copyFromSheet || selectedSheet || "No sheet"}</div>
                            <div className="text-xs text-slate-500">Click header to set Y-axis / toggle selection | Click a row to fill focused range input</div>
                          </div>
                          <div className="mt-2" style={{ height: `calc(100% - 34px)` }}>
                            {previewSheetWithPending.sheetData && previewSheetWithPending.sheetData.length > 0 ? (
                              <div className="w-full h-full overflow-auto">
                                <div className="w-full overflow-x-auto h-full">
                                  <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-blue-600">
                                      <tr>
                                        {previewHeaders.map((key, idx) => (
                                          <th
                                            key={key}
                                            onClick={() => { setYAxis(key); toggleColumnSelection(key); }}
                                            className={`cursor-pointer px-2 py-1 text-left text-xs font-semibold text-white border-r border-slate-200 ${isColumnSelected(key) ? "bg-green-600 text-white" : ""} ${xAxis === key ? "bg-blue-500 text-white" : ""} ${yAxis === key ? "bg-blue-700 text-white" : ""} ${idx === previewHeaders.length - 1 ? "last:border-r-0" : ""}`}>
                                            {key}{(yAxis === key || xAxis === key) && <span className="ml-1 inline-block text-[10px] font-normal">{yAxis === key ? 'Y' : 'X'}</span>}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100">
                                      {previewSheetWithPending.sheetData.map((row, i) => (
                                        <tr key={i} onClick={() => handlePreviewRowClick(i)} className={`${activeTarget ? "cursor-pointer" : ""} hover:bg-slate-50`}>
                                          {previewHeaders.map((k, j) => (
                                            <td key={j} className={`px-2 py-1 text-xs ${isColumnSelected(k) ? "bg-green-50 text-green-700" : ""} ${xAxis === k ? "bg-blue-50 text-blue-700" : ""} ${yAxis === k ? "bg-blue-100 text-blue-800" : ""}`}>{renderCellValue(row[k])}</td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 text-xs text-slate-500 h-full flex items-center justify-center">No data to preview</div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="group rounded-2xl border border-indigo-200 bg-gradient-to-br from-sky-50 via-indigo-50 to-fuchsia-100 p-5 overflow-auto h-full shadow-sm transform transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl hover:scale-[1.02] hover:ring-2 hover:ring-indigo-100 focus:outline-none">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-indigo-800 mb-1">X-Axis</label>
                            <select value={xAxis} onChange={(e) => setXAxis(e.target.value)} className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm">
                              <option value="">Select column</option>
                              {columnNames.map((col) => (
                                <option key={col} value={col}>{col}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-indigo-800 mb-1">Y-Axis</label>
                            <select value={yAxis} onChange={(e) => setYAxis(e.target.value)} className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm">
                              <option value="">Select column</option>
                              {columnNames.map((col) => (
                                <option key={col} value={col}>{col}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-medium text-slate-600">Select columns to keep</div>
                            <div className="flex gap-2">
                              <button onClick={handleAddColumnSelector} disabled={columnNames.length === 0 || selectedColumns.length >= columnNames.length} className="inline-flex items-center rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50">+</button>
                              <button onClick={openColumnBuilder} className="inline-flex items-center rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700">Column Builder</button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {selectedColumns.map((sel, idx) => {
                              const available = columnNames.filter((c) => c === sel || !selectedColumns.includes(c));
                              return (
                                <div key={idx}>
                                  <select value={sel} onChange={(e) => handleColumnChange(idx, e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm">
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

                        {error && <div className="mt-3 text-xs text-red-600">{error}</div>}

                        <div className="mt-3 flex gap-2">
                          <button id="submit-excel-btn" onClick={handleAddSheetSubmit} className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-60" disabled={addLoading}>{addLoading ? "Creating..." : "Submit"}</button>
                          <button onClick={() => { setShowAddPanel(false); setNewSheetName(""); setCopyFromSheet(""); setError(null); setActiveTarget(null); }} className="inline-flex items-center rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 border hover:bg-slate-50">Cancel</button>
                        </div>

                        {showColumnBuilder && (
                          <div className="mt-4 p-3 rounded-md border bg-gray-50">
                            <div className="flex justify-between items-center mb-2">
                              <div className="text-sm font-medium">Column Builder</div>
                              <Button size="small" onClick={() => setShowColumnBuilder(false)}>Close</Button>
                            </div>
                            <FormulaBuilder
                              availableColumns={columnNames}
                              updatedColumns={[]}
                              onAddColumn={handleAddColumn}
                              withProductData={builderRows}
                              withoutProductData={builderRows}
                            />
                          </div>
                        )}

                      </div>

                      <div className="group rounded-2xl border border-indigo-200 bg-gradient-to-br from-sky-50 via-indigo-50 to-fuchsia-100 p-5 overflow-auto h-full shadow-sm transform transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl hover:scale-[1.02] hover:ring-2 hover:ring-indigo-100 focus:outline-none">
                        <div className="h-full w-full" style={{ minHeight: 0 }}>
                          {scatterSlicesData.some((s) => s.data && s.data.length > 0) ? (
                            <div style={{ height: "100%", minHeight: 120 }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                                  <CartesianGrid />
                                  <XAxis type="number" dataKey="x" name={xAxis} />
                                  <YAxis type="number" dataKey="y" name={yAxis} />
                                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                                  {scatterSlicesData.map((s, i) => (
                                    <Scatter key={i} data={s.data} fill={s.color} name={s.name} />
                                  ))}
                                </ScatterChart>
                              </ResponsiveContainer>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center text-xs text-slate-500 p-4">No scatter data</div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>

              <div className="p-4">
                {displayedSelectedSheetData.length > 0 ? (
                  <div className="relative rounded-lg border overflow-hidden shadow-sm">
                    <div className="absolute right-2 top-2 z-10 rounded bg-slate-800 px-2 py-0.5 text-xs text-white md:hidden">Scroll →</div>

                    <div className="w-full overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-gradient-to-r from-slate-100 to-white">
                          <tr>
                            {Object.keys(displayedSelectedSheetData[0]).map((key) => (
                              <th key={key} className={`px-3 py-2 text-left text-sm font-semibold text-slate-700 ${isColumnSelected(key) ? "bg-green-50 text-green-700" : ""}`}>{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                          {displayedSelectedSheetData.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              {Object.keys(displayedSelectedSheetData[0]).map((k, j) => (
                                <td key={j} className={`px-4 py-2 text-sm ${isColumnSelected(k) ? "bg-green-50 text-green-700" : ""}`}>{renderCellValue(row[k])}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">No data available for this sheet</div>
                )}
              </div>
            </div>
          )}
        </div>

        <Assistant
          isListening={isListening}
          lastCommand={lastCommand}
          voiceFeedback={voiceFeedback}
          assistantCollapsed={assistantCollapsed}
          setAssistantCollapsed={setAssistantCollapsed}
          startListening={startListening}
          stopListening={stopListening}
          recentFiles={recentFiles}
          setRecentFiles={setRecentFiles}
          showFileSearchModal={showFileSearchModal}
          setShowFileSearchModal={setShowFileSearchModal}
          matchedRecentFiles={matchedRecentFiles}
          handleDirectFileSelection={handleDirectFileSelection}
          handleBrowseMoreFiles={handleBrowseMoreFiles}
          fileInputRef={fileInputRef}
          onAssistantResult={handleAssistantResult} 
        />
      </div> 
    </>
  );
};

export default FullExcelFile;
