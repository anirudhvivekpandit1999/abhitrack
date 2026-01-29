import { useEffect, useRef, useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
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
  const [rowRanges, setRowRanges] = useState([{ name: "", startRange: "", endRange: "", startDisplay: "", endDisplay: "" }]);
  const [activeTarget, setActiveTarget] = useState(null);

  useEffect(() => {
    const found = excelData.find((s) => s.sheetName === selectedSheet);
    setSelectedSheetData(found ? found.sheetData : []);
  }, [selectedSheet, excelData]);

  useEffect(() => {
    if (!copyFromSheet) {
      setColumnNames([]);
      setSelectedColumns([""]);
      return;
    }
    const found = excelData.find((s) => s.sheetName === copyFromSheet);
    const cols =
      found && Array.isArray(found.sheetData) && found.sheetData.length > 0
        ? Object.keys(found.sheetData[0])
        : [];
    setColumnNames(cols);
    setSelectedColumns([""]);
  }, [copyFromSheet, excelData]);

  useEffect(() => {
    if (xAxis && !selectedColumns.includes(xAxis)) {
      setSelectedColumns((prev) => {
        const idx = prev.indexOf("");
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = xAxis;
          return next;
        }
        return [...prev, xAxis];
      });
    }
    if (yAxis && !selectedColumns.includes(yAxis)) {
      setSelectedColumns((prev) => {
        const idx = prev.indexOf("");
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = yAxis;
          return next;
        }
        return [...prev, yAxis];
      });
    }
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
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setError(null);
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls"].includes(ext)) {
      setError("Unsupported file type");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
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
      if (sheets.length > 0) setSelectedSheet(sheets[0]);
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
    } catch (e) { }
    const unionCols = new Set();
    if (baseSheet && baseSheet.sheetData && baseSheet.sheetData.length) {
      Object.keys(baseSheet.sheetData[0]).forEach((c) => unionCols.add(c));
    }
    slices.forEach((s) => s.cols.forEach((c) => unionCols.add(c)));
    setColumnNames(Array.from(unionCols));
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      buildTempSlices();
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [rowRanges, newSheetName, copyFromSheet, selectedSheet, excelData]);

  const handleAddSheetSubmit = async () => {
    setError(null);
    const trimmed = newSheetName.trim();
    if (!trimmed) {
      setError("Please enter a name");
      return;
    }
    const finalName = normalizeSheetName(trimmed);
    const collision = bifurcateSlices.some((s) => sheetNames.includes(`${finalName}-${s.name}`));
    if (collision) {
      setError("A sheet with that name already exists");
      return;
    }
    setAddLoading(true);
    try {
      if (bifurcateSlices && bifurcateSlices.length > 0) {
        const newSheets = bifurcateSlices.map((s) => {
          const picks = selectedColumns.filter((c) => c && c !== "");
          let sheetRows = s.rows;
          if (picks.length > 0) {
            sheetRows = sheetRows.map((row) => {
              const nr = {};
              picks.forEach((k) => (nr[k] = row[k]));
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
          dataToCopy = sourceData.map((row) => {
            const newRow = {};
            picks.forEach((k) => (newRow[k] = row[k]));
            return newRow;
          });
        } else {
          dataToCopy = sourceData;
        }
        const sheetObj = { sheetName: finalName, sheetData: dataToCopy };
        setSheetNames((prev) => [...prev, finalName]);
        setExcelData((prev) => [...prev, sheetObj]);
      } else {
        setSheetNames((prev) => [...prev, finalName]);
        setExcelData((prev) => [...prev, { sheetName: finalName, sheetData: [] }]);
      }
      setSelectedSheet(finalName);
      setShowAddPanel(false);
      setNewSheetName("");
      setCopyFromSheet("");
      setColumnNames([]);
      setSelectedColumns([""]);
      setRowRanges([{ name: "", startRange: "", endRange: "", startDisplay: "", endDisplay: "" }]);
      setBifurcateSlices([]);
      try {
        localStorage.removeItem(`temp_bifurcate_${finalName}`);
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

  const handleRowRangeChange = (idx, field, value) => {
    setRowRanges((prev) => {
      const next = prev.map((r, i) => {
        if (i !== idx) return r;
        const updated = { ...r, [field]: value };
        if (field === "startRange") updated.startDisplay = "";
        if (field === "endRange") updated.endDisplay = "";
        return updated;
      });
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
  const previewHeaders = previewSheet.sheetData && previewSheet.sheetData.length ? Object.keys(previewSheet.sheetData[0]) : [];

  const getPreviewRowDate = (rowIndex) => {
    const row = previewSheet.sheetData && previewSheet.sheetData[rowIndex];
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

  const isColumnSelected = (col) => selectedColumns.includes(col);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6 overflow-x-hidden">
      <div className="mx-auto max-w-md rounded-2xl border-2 border-dashed bg-slate-50 p-8 text-center transition hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg">
        <CloudUploadIcon className="mb-3 text-[52px] text-slate-700" />
        <div className="text-sm">
          <label htmlFor="fileUpload" className="cursor-pointer font-semibold text-slate-800 hover:text-blue-600">
            {fileName ? "Change file" : "Upload Excel file"}
          </label>
          <input id="fileUpload" type="file" ref={fileInputRef} accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} disabled={isLoading} />
          {!fileName && <p className="mt-1 text-xs text-slate-500">or drag & drop</p>}
        </div>
        {fileName && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">{fileName}</div>
        )}
      </div>

      {sheetNames.length > 0 && (
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="relative border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-700">Sheets</div>
              <div className="flex items-center gap-2">
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
                  <div className="rounded-md border bg-slate-50 p-3 overflow-auto h-full">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium text-slate-800">Create new Excel</div>
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
                      <input value={newSheetName} onChange={(e) => setNewSheetName(e.target.value)} placeholder="Enter sheet/file name" className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs text-slate-600">Copy from existing sheet (optional)</label>
                      <select value={copyFromSheet} onChange={(e) => setCopyFromSheet(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
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
                            <input value={rr.name} onChange={(e) => handleRowRangeChange(idx, "name", e.target.value)} placeholder="New sheet name" className="w-1/3 rounded-md border px-3 py-2 text-sm" />
                            <input value={rr.startDisplay || rr.startRange} onChange={(e) => handleRowRangeChange(idx, "startRange", e.target.value)} placeholder="start e.g. 1" className="w-1/3 rounded-md border px-3 py-2 text-sm" onMouseDown={() => setActiveTarget({ idx, field: "startRange" })} />
                            <input value={rr.endDisplay || rr.endRange} onChange={(e) => {
                              const value = e.target.value;
                              handleRowRangeChange(idx, "endRange", value);
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

                  <div className="rounded-md border bg-white p-0 overflow-auto h-full">
                    <div className="h-full w-full p-3">
                      <div className="px-2 py-2 sticky top-0 bg-white z-10 flex items-center justify-between border-b">
                        <div className="text-xs font-medium">Preview: {copyFromSheet || selectedSheet || "No sheet"}</div>
                        <div className="text-xs text-slate-500">Click header to set Y-axis / toggle selection | Click a row to fill focused range input</div>
                      </div>
                      <div className="mt-2" style={{ height: `calc(100% - 36px)` }}>
                        {previewSheet.sheetData && previewSheet.sheetData.length > 0 ? (
                          <div className="w-full h-full overflow-auto">
                            <div className="w-full overflow-x-auto h-full">
                              <table className="text-xs border-separate" style={{ borderSpacing: 0, width: "max-content" }}>
                                <thead className="bg-slate-50">
                                  <tr>
                                    {previewHeaders.map((key) => (
                                      <th
                                        key={key}
                                        onClick={() => { setYAxis(key); toggleColumnSelection(key); }}
                                        className={`cursor-pointer border px-2 py-2 text-left font-semibold ${yAxis === key ? "bg-blue-50 text-blue-700" : ""} ${isColumnSelected(key) ? "bg-green-50 text-green-700" : ""}`}>
                                        {key}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {previewSheet.sheetData.slice(0, 200).map((row, i) => (
                                    <tr key={i} onClick={() => handlePreviewRowClick(i)} style={{ cursor: activeTarget ? "pointer" : "default" }}>
                                      {previewHeaders.map((k, j) => (
                                        <td key={j} className={`border px-2 py-1 text-xs ${isColumnSelected(k) ? "bg-green-50 text-green-700" : ""}`}>{row[k]}</td>
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

                  <div className="rounded-md border bg-white p-3 overflow-auto h-full">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">X-Axis</label>
                        <select value={xAxis} onChange={(e) => setXAxis(e.target.value)} className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm">
                          <option value="">Select column</option>
                          {columnNames.map((col) => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Y-Axis</label>
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
                        <button onClick={handleAddColumnSelector} disabled={columnNames.length === 0 || selectedColumns.length >= columnNames.length} className="inline-flex items-center rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50">+</button>
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
                      <button onClick={handleAddSheetSubmit} className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-60" disabled={addLoading}>{addLoading ? "Creating..." : "Submit"}</button>
                      <button onClick={() => { setShowAddPanel(false); setNewSheetName(""); setCopyFromSheet(""); setError(null); setActiveTarget(null); }} className="inline-flex items-center rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 border hover:bg-slate-50">Cancel</button>
                    </div>
                  </div>

                  <div className="rounded-md border bg-white p-3 overflow-auto h-full">
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
            {selectedSheetData.length > 0 ? (
              <div className="relative rounded-lg border overflow-hidden">
                <div className="absolute right-2 top-2 z-10 rounded bg-slate-800 px-2 py-0.5 text-xs text-white md:hidden">Scroll →</div>

                <div className="w-full overflow-x-auto">
                  <table className="text-sm border-separate" style={{ borderSpacing: 0, width: "max-content" }}>
                    <thead className="sticky top-0 bg-slate-100 shadow-sm">
                      <tr>
                        {Object.keys(selectedSheetData[0]).map((key) => (
                          <th key={key} className={`border px-4 py-2 text-left font-semibold text-slate-700 ${isColumnSelected(key) ? "bg-green-50 text-green-700" : ""}`}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSheetData.map((row, i) => (
                        <tr key={i}>
                          {Object.keys(selectedSheetData[0]).map((k, j) => (
                            <td key={j} className={`border px-4 py-2 ${isColumnSelected(k) ? "bg-green-50 text-green-700" : ""}`}>{row[k]}</td>
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
  );
};

export default FullExcelFile;
