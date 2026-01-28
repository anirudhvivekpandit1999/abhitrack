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
  const fileInputRef = useRef(null);

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
    setSelectedColumns(prev => [...prev, xAxis]);
  }
  if (yAxis && !selectedColumns.includes(yAxis)) {
    setSelectedColumns(prev => [...prev, yAxis]);
  }
}, [xAxis, yAxis]);

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
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const sheets = workbook.SheetNames;
      setSheetNames(sheets);
      const parsed = sheets.map((name) => {
        const ws = workbook.Sheets[name];
        return {
          sheetName: name,
          sheetData: XLSX.utils.sheet_to_json(ws, { defval: "" }),
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

  const handleAddSheetSubmit = async () => {
    setError(null);
    const trimmed = newSheetName.trim();
    if (!trimmed) {
      setError("Please enter a name");
      return;
    }
    const finalName = normalizeSheetName(trimmed);
    if (sheetNames.includes(finalName)) {
      setError("A sheet with that name already exists");
      return;
    }
    setAddLoading(true);
    try {
      let dataToCopy = [];
      if (copyFromSheet) {
        const found = excelData.find((s) => s.sheetName === copyFromSheet);
        const sourceData = found ? found.sheetData || [] : [];
        const picks = selectedColumns.filter((c) => c && c !== "");
        if (picks.length > 0 && sourceData.length > 0) {
          dataToCopy = sourceData.map((row) => {
            const newRow = {};
            picks.forEach((k) => (newRow[k] = row[k]));
            return newRow;
          });
        } else {
          dataToCopy = sourceData;
        }
      }
      setSheetNames((prev) => [...prev, finalName]);
      setExcelData((prev) => [
        ...prev,
        { sheetName: finalName, sheetData: dataToCopy },
      ]);
      setSelectedSheet(finalName);
      setShowAddPanel(false);
      setNewSheetName("");
      setCopyFromSheet("");
      setColumnNames([]);
      setSelectedColumns([""]);
    } catch {
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
      return next;
    });
  };

  const filteredData = selectedSheetData.map(row => {
  const newRow = {};
  selectedColumns.forEach(col => {
    if (col) newRow[col] = row[col];
  });
  return newRow;
});

const scatterData = filteredData
  .map(row => ({
    x: Number(row[xAxis]),
    y: Number(row[yAxis])
  }))
  .filter(point => !isNaN(point.x) && !isNaN(point.y));


  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <div className="mx-auto max-w-md rounded-2xl border-2 border-dashed bg-slate-50 p-8 text-center transition hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg">
        <CloudUploadIcon className="mb-3 text-[52px] text-slate-700" />
        <div className="text-sm">
          <label
            htmlFor="fileUpload"
            className="cursor-pointer font-semibold text-slate-800 hover:text-blue-600"
          >
            {fileName ? "Change file" : "Upload Excel file"}
          </label>
          <input
            id="fileUpload"
            type="file"
            ref={fileInputRef}
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          {!fileName && <p className="mt-1 text-xs text-slate-500">or drag & drop</p>}
        </div>
        {fileName && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
            {fileName}
          </div>
        )}
      </div>

      {sheetNames.length > 0 && (
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="relative border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-700">Sheets</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddPanel((s) => !s)}
                  className="ml-2 inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-green-700 focus:outline-none"
                >
                  <span className="text-lg leading-none">+</span>
                </button>
              </div>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {sheetNames.map((sheet) => (
                <button
                  key={sheet}
                  onClick={() => setSelectedSheet(sheet)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition
                    ${selectedSheet === sheet ? "bg-blue-600 text-white shadow" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                >
                  {sheet}
                </button>
              ))}
            </div>

            {showAddPanel && (
              <div className="mt-3 w-full sm:w-96 rounded-md border bg-slate-50 p-3 shadow-lg">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium text-slate-800">Create new Excel</div>
                  <button
                    onClick={() => {
                      setShowAddPanel(false);
                      setNewSheetName("");
                      setCopyFromSheet("");
                      setError(null);
                      setColumnNames([]);
                      setSelectedColumns([""]);
                    }}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-3">
                  <input
                    value={newSheetName}
                    onChange={(e) => setNewSheetName(e.target.value)}
                    placeholder="Enter sheet/file name"
                    className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-xs text-slate-600">Copy from existing sheet (optional)</label>
                  <select
                    value={copyFromSheet}
                    onChange={(e) => setCopyFromSheet(e.target.value)}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">-- Do not copy (create blank sheet) --</option>
                    {sheetNames.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
  <div>
    <label className="block text-xs font-medium text-slate-600 mb-1">X-Axis</label>
    <select
      value={xAxis}
      onChange={(e) => setXAxis(e.target.value)}
      className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
    >
      <option value="">Select column</option>
      {selectedSheetData.length > 0 &&
        Object.keys(selectedSheetData[0]).map((col) => (
          <option key={col} value={col}>{col}</option>
        ))}
    </select>
  </div>

  <div>
    <label className="block text-xs font-medium text-slate-600 mb-1">Y-Axis</label>
    <select
      value={yAxis}
      onChange={(e) => setYAxis(e.target.value)}
      className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
    >
      <option value="">Select column</option>
      {selectedSheetData.length > 0 &&
        Object.keys(selectedSheetData[0]).map((col) => (
          <option key={col} value={col}>{col}</option>
        ))}
    </select>
  </div>
</div>




                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium text-slate-600">Select columns to keep</div>
                    <button
                      onClick={handleAddColumnSelector}
                      disabled={columnNames.length === 0 || selectedColumns.length >= columnNames.length}
                      className="inline-flex items-center rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>

                  <div className="space-y-2">
                    {selectedColumns.map((sel, idx) => {
                      const available = columnNames.filter((c) => c === sel || !selectedColumns.includes(c));
                      return (
                        <select
                          key={idx}
                          value={sel}
                          onChange={(e) => handleColumnChange(idx, e.target.value)}
                          className="w-full rounded-md border px-3 py-2 text-sm"
                        >
                          <option value="">-- select column --</option>
                          {available.map((col) => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                      );
                    })}
                  </div>
                </div>



                {error && <div className="mt-3 text-xs text-red-600">{error}</div>}

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleAddSheetSubmit}
                    className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-60"
                    disabled={addLoading}
                  >
                    {addLoading ? "Creating..." : "Submit"}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddPanel(false);
                      setNewSheetName("");
                      setCopyFromSheet("");
                      setError(null);
                    }}
                    className="inline-flex items-center rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 border hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
                {scatterData.length > 0 && (
  <ResponsiveContainer width="100%" height={300}>
    <ScatterChart>
      <CartesianGrid />
      <XAxis type="number" dataKey="x" name={xAxis} />
      <YAxis type="number" dataKey="y" name={yAxis} />
      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
      <Scatter data={scatterData} fill="#6366f1" />
    </ScatterChart>
  </ResponsiveContainer>
)}
              </div>

              
            )}
          </div>

          <div className="p-4">
            {selectedSheetData.length > 0 ? (
              <div className="relative overflow-auto rounded-lg border">
                <table className="min-w-full text-sm border-separate" style={{ borderSpacing: 0 }}>
                  <thead className="sticky top-0 bg-slate-100 shadow-sm">
                    <tr>
                      {Object.keys(selectedSheetData[0]).map((key) => (
                        <th key={key} className="border px-4 py-2 text-left font-semibold text-slate-700">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSheetData.map((row, i) => (
                      <tr key={i}>
                        {Object.keys(selectedSheetData[0]).map((k, j) => (
                          <td key={j} className="border px-4 py-2">{row[k]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
                No data available for this sheet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FullExcelFile;
