import { Box, Typography, Paper, List, ListItem, ListItemText, IconButton, Button, CircularProgress } from '@mui/material';
import { Check, Error, DeleteOutline, Save } from '@mui/icons-material';

function CalculatedColumnsList({ 
    updatedColumns, 
    pendingColumns, 
    onRemoveColumn, 
    onSaveAndApply,
    isSaving,
    calculatedColumns 
}) {
    const hasColumns = updatedColumns.length > 0 || pendingColumns.length > 0;

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            minHeight: { xs: 'auto', md: '500px' }
        }}>
            <Paper sx={{ 
                p: { xs: 2, sm: 2.5 }, 
                borderRadius: 1, 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
                <Typography 
                    variant="h6" 
                    color="primary" 
                    gutterBottom
                    sx={{ 
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        fontWeight: 600,
                        mb: { xs: 1.5, sm: 2 }
                    }}
                >
                    Customized Columns
                </Typography>

                <Box sx={{ flex: 1, overflow: 'auto' }}>
                    {!hasColumns ? (
                        <Box sx={{ 
                            p: { xs: 2, sm: 3 }, 
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '120px'
                        }}>
                            <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ 
                                    fontSize: { xs: '0.875rem', sm: '0.9rem' },
                                    lineHeight: 1.5
                                }}
                            >
                                No columns created yet. Use the formula builder to create calculated columns.
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            {updatedColumns.length > 0 && (
                                <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                                    <Typography 
                                        variant="subtitle2" 
                                        color="success.main" 
                                        sx={{ 
                                            mb: { xs: 0.5, sm: 1 }, 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                            fontWeight: 600
                                        }}
                                    >
                                        <Check fontSize="small" sx={{ mr: 0.5 }} />
                                        Updated Columns ({updatedColumns.length})
                                    </Typography>
                                    <List dense disablePadding>
                                        {updatedColumns.map((column, index) => (
                                            <ListItem
                                                key={index}
                                                sx={{ 
                                                    px: 0,
                                                    py: { xs: 0.5, sm: 0.75 },
                                                    borderRadius: 1,
                                                    '&:hover': {
                                                        backgroundColor: 'action.hover'
                                                    }
                                                }}
                                                secondaryAction={
                                                    <IconButton 
                                                        edge="end" 
                                                        size="small" 
                                                        onClick={() => onRemoveColumn(column.name, 'updated')}
                                                        sx={{ 
                                                            color: 'text.secondary',
                                                            '&:hover': { color: 'error.main' }
                                                        }}
                                                    >
                                                        <DeleteOutline fontSize="small" />
                                                    </IconButton>
                                                }
                                            >
                                                <ListItemText
                                                    primary={column.name}
                                                    secondary={column.formula}
                                                    primaryTypographyProps={{ 
                                                        variant: 'body2', 
                                                        fontWeight: 500,
                                                        fontSize: { xs: '0.875rem', sm: '0.9rem' }
                                                    }}
                                                    secondaryTypographyProps={{ 
                                                        variant: 'caption', 
                                                        noWrap: true, 
                                                        fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                                        color: 'text.secondary'
                                                    }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}

                            {pendingColumns.length > 0 && (
                                <Box>
                                    <Typography 
                                        variant="subtitle2" 
                                        color="warning.main" 
                                        sx={{ 
                                            mb: { xs: 0.5, sm: 1 }, 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                            fontWeight: 600
                                        }}
                                    >
                                        <Error fontSize="small" sx={{ mr: 0.5 }} />
                                        Pending Columns ({pendingColumns.length})
                                    </Typography>
                                    <List dense disablePadding>
                                        {pendingColumns.map((column, index) => (
                                            <ListItem
                                                key={index}
                                                sx={{ 
                                                    px: 0,
                                                    py: { xs: 0.5, sm: 0.75 },
                                                    borderRadius: 1,
                                                    '&:hover': {
                                                        backgroundColor: 'action.hover'
                                                    }
                                                }}
                                                secondaryAction={
                                                    <IconButton
                                                        edge="end"
                                                        size="small"
                                                        color="error"
                                                        onClick={() => onRemoveColumn(column.name, 'pending')}
                                                        sx={{ 
                                                            '&:hover': { 
                                                                backgroundColor: 'error.light',
                                                                color: 'error.contrastText'
                                                            }
                                                        }}
                                                    >
                                                        <DeleteOutline fontSize="small" />
                                                    </IconButton>
                                                }
                                            >
                                                <ListItemText
                                                    primary={column.name}
                                                    secondary={column.formula}
                                                    primaryTypographyProps={{ 
                                                        variant: 'body2', 
                                                        fontWeight: 500,
                                                        fontSize: { xs: '0.875rem', sm: '0.9rem' }
                                                    }}
                                                    secondaryTypographyProps={{ 
                                                        variant: 'caption', 
                                                        noWrap: true, 
                                                        fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                                        color: 'text.secondary'
                                                    }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </Paper>

            <Box sx={{ 
                mt: { xs: 1.5, sm: 2 },
                display: 'flex',
                justifyContent: 'stretch'
            }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <Save />}
                    onClick={onSaveAndApply}
                    disabled={isSaving || calculatedColumns.length === 0}
                    fullWidth
                    sx={{ 
                        py: { xs: 1, sm: 1.25 },
                        fontSize: { xs: '0.875rem', sm: '0.9rem' },
                        fontWeight: 400,
                        textTransform: 'none',
                        borderRadius: 1,
                        '&:disabled': {
                            backgroundColor: 'action.disabled',
                            color: 'text.disabled'
                        }
                    }}
                >
                    {isSaving ? 'SAVING....' : 'SAVE & APPLY COLUMNS'}
                </Button>
            </Box>
        </Box>
    );
}

export default CalculatedColumnsList;