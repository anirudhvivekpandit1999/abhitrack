import { Paper, Typography } from '@mui/material';

function FormulaDisplay({ formulaElements }) {
    const getElementColor = (element) => {
        switch (element.type) {
            case 'column':
                return 'bg-blue-100 text-blue-800';
            case 'operator':
                return 'bg-amber-100 text-amber-800';
            case 'number':
                return 'bg-green-100 text-green-800';
            case 'function':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                minHeight: 80,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                bgcolor: 'background.default'
            }}
        >
            {formulaElements.length > 0 ? (
                formulaElements.map((element, index) => (
                    <span
                        key={index}
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium mr-2 mb-2 ${getElementColor(element)}`}
                    >
                        {element.display || element.value}
                    </span>
                ))
            ) : (
                <Typography variant="body2" color="text.secondary">
                    Select columns, operators, and numbers to build your formula
                </Typography>
            )}
        </Paper>
    );
}

export default FormulaDisplay;