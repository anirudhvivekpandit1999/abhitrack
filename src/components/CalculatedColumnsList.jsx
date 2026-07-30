import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Button,
    CircularProgress,
    Chip,
    Tooltip,
    Divider
} from '@mui/material';

import {
    Check,
    ErrorOutline,
    DeleteOutline,
    Save,
    FunctionsRounded,
    CheckCircleOutlineRounded,
    PendingActionsRounded,
    AddRounded
} from '@mui/icons-material';

function CalculatedColumnsList({
    updatedColumns = [],
    pendingColumns = [],
    onRemoveColumn,
    onSaveAndApply,
    isSaving = false,
    calculatedColumns = []
}) {
    const hasColumns = updatedColumns.length > 0 || pendingColumns.length > 0;
    const totalColumns = updatedColumns.length + pendingColumns.length;

    const handleRemove = (name, type) => {
        if (typeof onRemoveColumn === 'function') {
            onRemoveColumn(name, type);
        }
    };

    const renderColumn = (column, index, type) => {
        const isUpdated = type === 'updated';

        return (
            <ListItem
                key={`${type}-${column?.name || index}-${index}`}
                disableGutters
                secondaryAction={
                    <Tooltip title={`Remove ${column?.name || 'column'}`} arrow>
                        <IconButton
                            edge="end"
                            size="small"
                            aria-label={`Remove ${column?.name || 'column'}`}
                            onClick={() => handleRemove(column?.name, type)}
                            sx={{
                                width: 34,
                                height: 34,
                                mr: 0.25,
                                color: '#94A3B8',
                                borderRadius: 1.5,
                                transition: 'all 160ms ease',
                                '&:hover': {
                                    color: '#DC2626',
                                    bgcolor: '#FEF2F2'
                                }
                            }}
                        >
                            <DeleteOutline sx={{ fontSize: 19 }} />
                        </IconButton>
                    </Tooltip>
                }
                sx={{
                    px: 1.5,
                    py: 1.25,
                    mb: 1,
                    pr: 6,
                    border: '1px solid',
                    borderColor: '#E8EDF5',
                    borderRadius: 2,
                    bgcolor: '#FFFFFF',
                    transition: 'all 160ms ease',
                    '&:hover': {
                        borderColor: isUpdated ? '#BBF7D0' : '#FDE68A',
                        bgcolor: isUpdated ? '#FBFEFC' : '#FFFEF8',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 5px 16px rgba(15, 23, 42, 0.055)'
                    }
                }}
            >
                <Box
                    sx={{
                        width: 34,
                        height: 34,
                        mr: 1.25,
                        flexShrink: 0,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: 1.5,
                        bgcolor: isUpdated ? '#ECFDF3' : '#FFF8E6',
                        color: isUpdated ? '#15803D' : '#B45309'
                    }}
                >
                    {isUpdated ? (
                        <Check sx={{ fontSize: 18 }} />
                    ) : (
                        <FunctionsRounded sx={{ fontSize: 18 }} />
                    )}
                </Box>

                <ListItemText
                    sx={{ my: 0, minWidth: 0 }}
                    primary={
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#1E293B',
                                fontWeight: 700,
                                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {column?.name || 'Unnamed column'}
                        </Typography>
                    }
                    secondary={
                        <Typography
                            component="span"
                            variant="caption"
                            title={column?.formula || ''}
                            sx={{
                                display: 'block',
                                mt: 0.35,
                                color: '#64748B',
                                fontFamily:
                                    '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
                                fontSize: { xs: '0.7rem', sm: '0.74rem' },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {column?.formula || 'No formula'}
                        </Typography>
                    }
                />
            </ListItem>
        );
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: { xs: 'auto', md: 500 }
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid #E5EAF2',
                    borderRadius: 3,
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.055)'
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        px: { xs: 2, sm: 2.5 },
                        py: { xs: 2, sm: 2.25 },
                        borderBottom: '1px solid #EDF1F6',
                        bgcolor: '#FFFFFF'
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            width: 130,
                            height: 130,
                            borderRadius: '50%',
                            bgcolor: '#EFF6FF',
                            right: -55,
                            top: -78,
                            pointerEvents: 'none'
                        }}
                    />

                    <Box
                        sx={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: 2
                        }}
                    >
                        <Box sx={{ display: 'flex', gap: 1.4, minWidth: 0 }}>
                            <Box
                                sx={{
                                    width: 42,
                                    height: 42,
                                    flexShrink: 0,
                                    display: 'grid',
                                    placeItems: 'center',
                                    borderRadius: 2,
                                    bgcolor: '#172B4D',
                                    color: '#FFFFFF',
                                    boxShadow: '0 7px 16px rgba(23, 43, 77, 0.16)'
                                }}
                            >
                                <FunctionsRounded sx={{ fontSize: 21 }} />
                            </Box>

                            <Box sx={{ minWidth: 0 }}>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        color: '#0F172A',
                                        fontWeight: 800,
                                        lineHeight: 1.25,
                                        letterSpacing: '-0.015em'
                                    }}
                                >
                                    Customized Columns
                                </Typography>

                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: 'block',
                                        color: '#64748B',
                                        mt: 0.35,
                                        lineHeight: 1.45
                                    }}
                                >
                                    Review calculated columns before applying them to your dataset.
                                </Typography>
                            </Box>
                        </Box>

                        <Chip
                            size="small"
                            label={`${totalColumns} ${totalColumns === 1 ? 'column' : 'columns'}`}
                            sx={{
                                flexShrink: 0,
                                height: 27,
                                bgcolor: '#F1F5F9',
                                color: '#475569',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                '& .MuiChip-label': { px: 1.1 }
                            }}
                        />
                    </Box>
                </Box>

                {hasColumns && (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                            gap: 1,
                            px: { xs: 2, sm: 2.5 },
                            pt: 2
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1.2,
                                borderRadius: 2,
                                bgcolor: '#F0FDF4',
                                border: '1px solid #DCFCE7'
                            }}
                        >
                            <CheckCircleOutlineRounded
                                sx={{ fontSize: 18, color: '#16A34A' }}
                            />
                            <Box>
                                <Typography
                                    sx={{
                                        color: '#166534',
                                        fontWeight: 800,
                                        fontSize: '0.82rem',
                                        lineHeight: 1.1
                                    }}
                                >
                                    {updatedColumns.length}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{ color: '#4D7C5B', fontSize: '0.67rem' }}
                                >
                                    Updated
                                </Typography>
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1.2,
                                borderRadius: 2,
                                bgcolor: '#FFFBEB',
                                border: '1px solid #FEF3C7'
                            }}
                        >
                            <PendingActionsRounded
                                sx={{ fontSize: 18, color: '#D97706' }}
                            />
                            <Box>
                                <Typography
                                    sx={{
                                        color: '#92400E',
                                        fontWeight: 800,
                                        fontSize: '0.82rem',
                                        lineHeight: 1.1
                                    }}
                                >
                                    {pendingColumns.length}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{ color: '#A16207', fontSize: '0.67rem' }}
                                >
                                    Pending
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                )}

                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: 'auto',
                        px: { xs: 2, sm: 2.5 },
                        py: 2,
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#CBD5E1 transparent',
                        '&::-webkit-scrollbar': { width: 6 },
                        '&::-webkit-scrollbar-thumb': {
                            bgcolor: '#CBD5E1',
                            borderRadius: 10
                        }
                    }}
                >
                    {!hasColumns ? (
                        <Box
                            sx={{
                                minHeight: 270,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                px: 2
                            }}
                        >
                            <Box
                                sx={{
                                    width: 58,
                                    height: 58,
                                    mb: 1.75,
                                    display: 'grid',
                                    placeItems: 'center',
                                    borderRadius: 2.5,
                                    bgcolor: '#F1F5F9',
                                    color: '#64748B'
                                }}
                            >
                                <AddRounded sx={{ fontSize: 29 }} />
                            </Box>

                            <Typography
                                variant="body2"
                                sx={{ color: '#334155', fontWeight: 750 }}
                            >
                                No calculated columns yet
                            </Typography>

                            <Typography
                                variant="caption"
                                sx={{
                                    mt: 0.7,
                                    maxWidth: 290,
                                    color: '#94A3B8',
                                    lineHeight: 1.6
                                }}
                            >
                                Use the formula builder to create a column. New and updated
                                formulas will appear here for review.
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            {updatedColumns.length > 0 && (
                                <Box sx={{ mb: pendingColumns.length ? 2.5 : 0 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            mb: 1.15
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                            <CheckCircleOutlineRounded
                                                sx={{ fontSize: 17, color: '#16A34A' }}
                                            />
                                            <Typography
                                                variant="overline"
                                                sx={{
                                                    color: '#15803D',
                                                    fontWeight: 800,
                                                    fontSize: '0.67rem',
                                                    lineHeight: 1,
                                                    letterSpacing: '0.08em'
                                                }}
                                            >
                                                Updated Columns
                                            </Typography>
                                        </Box>

                                        <Typography
                                            variant="caption"
                                            sx={{ color: '#94A3B8', fontWeight: 700 }}
                                        >
                                            {updatedColumns.length}
                                        </Typography>
                                    </Box>

                                    <List disablePadding>
                                        {updatedColumns.map((column, index) =>
                                            renderColumn(column, index, 'updated')
                                        )}
                                    </List>
                                </Box>
                            )}

                            {updatedColumns.length > 0 && pendingColumns.length > 0 && (
                                <Divider sx={{ mb: 2.5, borderColor: '#EEF2F6' }} />
                            )}

                            {pendingColumns.length > 0 && (
                                <Box>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            mb: 1.15
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                            <ErrorOutline
                                                sx={{ fontSize: 17, color: '#D97706' }}
                                            />
                                            <Typography
                                                variant="overline"
                                                sx={{
                                                    color: '#B45309',
                                                    fontWeight: 800,
                                                    fontSize: '0.67rem',
                                                    lineHeight: 1,
                                                    letterSpacing: '0.08em'
                                                }}
                                            >
                                                Pending Columns
                                            </Typography>
                                        </Box>

                                        <Typography
                                            variant="caption"
                                            sx={{ color: '#94A3B8', fontWeight: 700 }}
                                        >
                                            {pendingColumns.length}
                                        </Typography>
                                    </Box>

                                    <List disablePadding>
                                        {pendingColumns.map((column, index) =>
                                            renderColumn(column, index, 'pending')
                                        )}
                                    </List>
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </Paper>

            <Paper
                elevation={0}
                sx={{
                    mt: 1.5,
                    p: 1.25,
                    border: '1px solid #E5EAF2',
                    borderRadius: 2.5,
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 6px 18px rgba(15, 23, 42, 0.045)'
                }}
            >
                <Button
                    variant="contained"
                    startIcon={
                        isSaving ? (
                            <CircularProgress size={17} thickness={5} color="inherit" />
                        ) : (
                            <Save sx={{ fontSize: 19 }} />
                        )
                    }
                    onClick={onSaveAndApply}
                    disabled={isSaving || calculatedColumns.length === 0}
                    fullWidth
                    sx={{
                        minHeight: 44,
                        px: 2,
                        borderRadius: 2,
                        bgcolor: '#172B4D',
                        color: '#FFFFFF',
                        fontSize: '0.84rem',
                        fontWeight: 750,
                        textTransform: 'none',
                        boxShadow: 'none',
                        transition: 'all 160ms ease',
                        '&:hover': {
                            bgcolor: '#223A61',
                            boxShadow: '0 7px 18px rgba(23, 43, 77, 0.18)'
                        },
                        '&.Mui-disabled': {
                            bgcolor: '#E2E8F0',
                            color: '#94A3B8'
                        }
                    }}
                >
                    {isSaving ? 'Saving & applying...' : 'Save & Apply Columns'}
                </Button>

                <Typography
                    variant="caption"
                    sx={{
                        display: 'block',
                        mt: 0.9,
                        textAlign: 'center',
                        color: '#94A3B8',
                        fontSize: '0.67rem'
                    }}
                >
                    {calculatedColumns.length > 0
                        ? `${calculatedColumns.length} calculated ${
                              calculatedColumns.length === 1 ? 'column is' : 'columns are'
                          } ready to apply`
                        : 'Create a calculated column to enable saving'}
                </Typography>
            </Paper>
        </Box>
    );
}

export default CalculatedColumnsList;
