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