import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper
} from '@mui/material';
import TableToolbar from './TableToolbar';
import DataTableHeader from './DataTableHeader';

const EnhancedDataPreview = React.memo(({ title, data }) => {
    const rowsPerPage = 5;
    const [page, setPage] = useState(0);
    const [columnFilters, setColumnFilters] = useState({});
    const [columnWidths, setColumnWidths] = useState({});
    const [visibleColumns, setVisibleColumns] = useState([]);

    const columns = useMemo(() => {
        return data && data.length > 0 ? Object.keys(data[0]) : [];
    }, [data]);

    useEffect(() => {
        if (columns.length > 0) {
            const initialWidths = {};
            columns.forEach(col => {
                initialWidths[col] = Math.max(100, col.length * 10);
            });
            setColumnWidths(initialWidths);
            setVisibleColumns([...columns]);
        }
    }, [columns]);

    const handleChangePage = (_event, newPage) => {
        setPage(newPage);
    };

    const handleColumnFilterChange = (column, value) => {
        setColumnFilters(prev => ({
            ...prev,
            [column]: value
        }));
        setPage(0);
    };

    const clearFilters = () => {
        setColumnFilters({});
    };

    const handleColumnVisibilityChange = (column) => {
        if (column === 'all') {
            setVisibleColumns([...columns]);
            return;
        }

        if (column === 'none') {
            setVisibleColumns([]);
            return;
        }

        setVisibleColumns(prev => {
            if (prev.includes(column)) {
                return prev.filter(col => col !== column);
            } else {
                return [...prev, column];
            }
        });
    };

    const filteredData = useMemo(() => {
        if (!data) return [];

        return data.filter(row => {
            for (const column in columnFilters) {
                if (columnFilters[column] &&
                    (!row[column] ||
                        !row[column].toString().toLowerCase().includes(columnFilters[column].toLowerCase()))) {
                    return false;
                }
            }
            return true;
        });
    }, [data, columnFilters]);

    const displayData = useMemo(() => {
        return filteredData.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
        );
    }, [filteredData, page, rowsPerPage]);

    return (
        <Box>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                {title}
            </Typography>

            <TableToolbar
                columnFilters={columnFilters}
                onClearFilters={clearFilters}
                columns={columns}
                visibleColumns={visibleColumns}
                onColumnVisibilityChange={handleColumnVisibilityChange}
            />

            <TableContainer
                component={Paper}
                elevation={1}
                sx={{
                    maxHeight: 400,
                    '&::-webkit-scrollbar': {
                        width: '8px',
                        height: '8px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        borderRadius: '4px',
                    }
                }}
            >
                <Table stickyHeader size="small" aria-label={`${title} data table`}>
                    <TableHead>
                        <TableRow>
                            {columns
                                .filter(column => visibleColumns.includes(column))
                                .map((column, index) => (
                                    <TableCell
                                        key={index}
                                        sx={{
                                            minWidth: columnWidths[column],
                                            backgroundColor: 'background.tableHeader',
                                            whiteSpace: 'nowrap',
                                            fontWeight: 600
                                        }}
                                    >
                                        <DataTableHeader
                                            column={column}
                                            columnFilters={columnFilters}
                                            onColumnFilterChange={handleColumnFilterChange}
                                        />
                                    </TableCell>
                                ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayData.length > 0 ? (
                            displayData.map((row, rowIndex) => (
                                <TableRow
                                    key={rowIndex}
                                    sx={{ '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.03)' } }}
                                >
                                    {columns
                                        .filter(column => visibleColumns.includes(column))
                                        .map((column, colIndex) => (
                                            <TableCell key={colIndex} sx={{ fontSize: '0.85rem' }}>
                                                {row[column] !== undefined ? (
                                                    typeof row[column] === 'object' ?
                                                        JSON.stringify(row[column]) :
                                                        String(row[column])
                                                ) : ''}
                                            </TableCell>
                                        ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={visibleColumns.length} align="center" sx={{ py: 3 }}>
                                    {Object.keys(columnFilters).length > 0 ?
                                        'No matching data found. Try clearing filters.' :
                                        'No data available.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
                rowsPerPageOptions={[]}
            />
        </Box>
    );
});

EnhancedDataPreview.displayName = 'EnhancedDataPreview';

export default EnhancedDataPreview;