import React, { useState } from 'react';
import {
    Box,
    IconButton,
    Button,
    Menu,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Divider,
    Typography,
    TextField,
    InputAdornment,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SearchIcon from '@mui/icons-material/Search';

const TableToolbar = React.memo(({
    columnFilters,
    onClearFilters,
    columns,
    visibleColumns,
    onColumnVisibilityChange
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const [searchText, setSearchText] = useState('');

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSearchText('');
    };

    const handleColumnToggle = (column) => {
        onColumnVisibilityChange(column);
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            onColumnVisibilityChange('all');
        } else {
            onColumnVisibilityChange('none');
        }
    };

    const handleSearchChange = (event) => {
        setSearchText(event.target.value);
    };

    const allSelected = columns.length === visibleColumns.length;
    const someSelected = visibleColumns.length > 0 && visibleColumns.length < columns.length;

    const filteredColumns = columns.filter(column =>
        column.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ViewColumnIcon />}
                    onClick={handleClick}
                    sx={{ height: '40px' }}
                >
                    Columns
                </Button>

                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    PaperProps={{
                        sx: {
                            maxHeight: 350,
                            width: 250,
                            p: 1,
                            bgcolor: 'background.paper'
                        }
                    }}
                >
                    <Typography variant="subtitle2" sx={{ px: 1, mb: 1 }}>
                        Column Visibility
                    </Typography>

                    <TextField
                        placeholder="Search columns..."
                        size="small"
                        value={searchText}
                        onChange={handleSearchChange}
                        fullWidth
                        sx={{ mb: 1, px: 1 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                            endAdornment: searchText && (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => setSearchText('')}
                                        edge="end"
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <Divider sx={{ my: 1 }} />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={allSelected}
                                indeterminate={someSelected}
                                onChange={handleSelectAll}
                                size="small"
                            />
                        }
                        label="Select All"
                        sx={{ px: 1, width: '100%' }}
                    />

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                        {filteredColumns.length > 0 ? (
                            filteredColumns.map((column) => (
                                <MenuItem
                                    key={column}
                                    dense
                                    onClick={() => handleColumnToggle(column)}
                                    sx={{ py: 0 }}
                                >
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={visibleColumns.includes(column)}
                                                size="small"
                                                onChange={() => { }}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        }
                                        label={column}
                                        sx={{ width: '100%' }}
                                    />
                                </MenuItem>
                            ))
                        ) : (
                            <Typography variant="body2" sx={{ px: 1, py: 2, color: 'text.secondary', textAlign: 'center' }}>
                                No matching columns
                            </Typography>
                        )}
                    </Box>
                </Menu>
            </Box>

            {Object.keys(columnFilters).length > 0 && (
                <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={onClearFilters}
                    startIcon={<ClearIcon />}
                >
                    Clear filters
                </Button>
            )}
        </Box>
    );
});

TableToolbar.displayName = 'TableToolbar';

export default TableToolbar;