import { useRef, useState } from "react";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import * as XLSX from 'xlsx';

const FullExcelFile = () => {
    const [fileName, setFileName] = useState('');
        const [dragOver, setDragOver] = useState(false);
        const [sheetNames, setSheetNames] = useState([]);
        const [selectedSheet, setSelectedSheet] = useState('');
        const [sheetSelectPending, setSheetSelectPending] = useState(false);
        const [id,setId] = useState('withoutProductFile');
        const [isLoading,setIsLoading] = useState(false);
        const [error,setError] = useState(null);
        const fileInputRef = useRef(null);
        

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
                            setSheetNames(sheets);
                            setSheetSelectPending(true);
                            sheets.forEach(sheetNames => {
                                const workSheet = workbook.Sheets[sheetNames];
                                const jsonData = XLSX.utils.sheet_to_json(workSheet, { defval: null });
                                console.log("Sheet Name:", sheetNames);
                                console.log("Data:", jsonData);
                            });
                        };
                        reader.readAsBinaryString(file);
                    } else {
                        onFileUpload(file);
                    }
                }
            };
    
    return (
        <div
    className={`mx-auto max-w-md rounded-2xl border-2 border-dashed p-8 text-center transition-all
    ${dragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50"}
    hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg`}
  >
    <CloudUploadIcon
      className={`mb-3 text-[52px] transition-transform duration-200
      ${error ? "text-red-400" : "text-slate-700"}
      group-hover:scale-110`}
    />

    <div className="text-sm text-slate-700">
      <label
        htmlFor={id}
        className="cursor-pointer font-semibold text-slate-800 hover:text-blue-600"
      >
        {fileName ? "Change file" : "Upload a file"}
      </label>

      <input
        id={id}
        name={id}
        type="file"
        ref={fileInputRef}
        accept=".csv,.xlsx,.xls,.parquet"
        className="hidden"
        onChange={handleFileChange}
        disabled={isLoading}
      />

      {!fileName && (
        <p className="mt-1 text-xs text-slate-500">or drag and drop</p>
      )}
    </div>

    <p className="mt-4 text-xs text-slate-400">
      CSV, Excel, or Parquet files
    </p>

    {fileName && (
      <div className="mt-4 inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
        {fileName}
      </div>
    )}
    {sheetSelectPending && sheetNames.map((sheet) => {
        return (
            <div key={sheet} className="mt-2">
                <label htmlFor={`sheet-${sheet}`} className="block text-sm font-medium text-slate-700">
                    {sheet}
                </label>
                
            </div>
        );
    })}
  </div>
    )
}

export default FullExcelFile;