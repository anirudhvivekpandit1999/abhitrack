import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, TextField, List, ListItem, ListItemText, Paper, InputAdornment, Chip, IconButton } from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

function ColumnSelector({ columns, onSelectColumn, searchTerm, setSearchTerm }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const columnCategories = useMemo(() => {
        const categories = {
            all: columns,
            numeric: columns.filter(col => col.includes('amount') || col.includes('price') || col.includes('qty') || col.includes('total') || col.includes('count')),
            text: columns.filter(col => col.includes('name') || col.includes('description') || col.includes('id') || col.includes('code')),
            date: columns.filter(col => col.includes('date') || col.includes('time')),
            calculated: columns.filter(col => col.includes('calc_') || col.includes('computed_'))
        };
        return categories;
    }, [columns]);

    const filteredColumns = useMemo(() => {
        const categoryColumns = selectedCategory === 'all' ? columns : columnCategories[selectedCategory];

        if (!searchTerm) return categoryColumns;

        return categoryColumns.filter(column =>
            column.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [columns, searchTerm, selectedCategory, columnCategories]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('#column-selector')) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelectColumn = (column) => {
        onSelectColumn(column);
        setIsDropdownOpen(false);
        setSearchTerm('');
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    return (
        <Box sx={{ mb: 4 }} id="column-selector">
            <Typography variant="subtitle1" color="primary" gutterBottom>
                Select Columns
            </Typography>

            <TextField
                fullWidth
                variant="outlined"
                placeholder="Search for a column"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                }}
                onClick={() => setIsDropdownOpen(true)}
                sx={{ mb: 1 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search color="action" />
                        </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                        <InputAdornment position="end">
                            <IconButton size="small" onClick={handleClearSearch}>
                                <Clear fontSize="small" />
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />

            <Typography variant="caption" color="text.secondary">
                {filteredColumns.length} columns available in category "{selectedCategory}"
            </Typography>

            {isDropdownOpen && filteredColumns.length > 0 && (
                <Paper
                    elevation={3}
                    sx={{
                        maxHeight: 200,
                        overflow: 'auto',
                        position: 'absolute',
                        zIndex: 1000,
                        width: 'calc(100% - 48px)',
                        borderRadius: 1,
                        mt: 0.5
                    }}
                >
                    <List dense>
                        {filteredColumns.map((column, index) => (
                            <ListItem
                                button
                                key={index}
                                onClick={() => handleSelectColumn(column)}
                                sx={{
                                    '&:hover': {
                                        backgroundColor: 'primary.lighter'
                                    },
                                    '&:nth-of-type(odd)': {
                                        backgroundColor: 'background.default'
                                    }
                                }}
                            >
                                <ListItemText
                                    primary={column}
                                    primaryTypographyProps={{
                                        sx: {
                                            fontWeight: selectedCategory !== 'all' &&
                                                columnCategories[selectedCategory].includes(column) ?
                                                'bold' : 'normal'
                                        }
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}

            {isDropdownOpen && filteredColumns.length === 0 && (
                <Paper
                    elevation={3}
                    sx={{
                        p: 2,
                        position: 'absolute',
                        zIndex: 1000,
                        width: 'calc(100% - 48px)',
                        borderRadius: 1,
                        mt: 0.5
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        No columns matching "{searchTerm}" in category "{selectedCategory}"
                    </Typography>
                </Paper>
            )}
        </Box>
    );
}

export default ColumnSelector;