import React from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';

const ColumnSelectionForm = ({
    columns,
    selectedColumn,
    secondaryColumn,
    onColumnChange,
    onSecondaryColumnChange,
    disabled
}) => {
    return (
        <Box sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            mb: 4,
            gap: 3,
            flexWrap: 'wrap',
            bgcolor: 'primary.light',
            borderRadius: 1,
            py: 3,
        }}>
            <FormControl sx={{ minWidth: 240 }}>
                <InputLabel id="dependant-column-select-label">Dependent Column</InputLabel>
                <Select
                    labelId="dependant-column-select-label"
                    id="dependant-column-select"
                    value={selectedColumn}
                    label="Dependent Column"
                    onChange={onColumnChange}
                    disabled={disabled}
                >
                    {columns.map((column) => (
                        <MenuItem key={column} value={column}>{column}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 240 }}>
                <InputLabel id="independent-column-select-label">Independent Column</InputLabel>
                <Select
                    labelId="independent-column-select-label"
                    id="independent-column-select"
                    value={secondaryColumn}
                    label="Independent Column"
                    onChange={onSecondaryColumnChange}
                    disabled={disabled}
                >
                    {columns.map((column) => (
                        <MenuItem key={column} value={column}>{column}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};

export default ColumnSelectionForm;