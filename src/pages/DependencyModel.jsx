import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    useDroppable
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Container,
    Divider,
    IconButton,
    InputAdornment,
    Pagination,
    Paper,
    TextField,
    Typography,
    ThemeProvider,
    Snackbar,
    Alert,
    Tooltip
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    Search as SearchIcon,
    DragIndicator as DragIndicatorIcon,
    Cancel as CancelIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { useLocalStorage } from '../hooks/useLocalStorage';
import customTheme from '../theme/customTheme';
import NavigationButtons from '../components/NavigationButtons';

const API_BASE_URL = 'https://abhistat.com/api';

const usePagination = (items, itemsPerPage) => {
    const [currentPage, setCurrentPage] = useState(1);
    const maxPage = Math.max(1, Math.ceil(items.length / itemsPerPage));

    const currentItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return items.slice(startIndex, startIndex + itemsPerPage);
    }, [items, currentPage, itemsPerPage]);

    const handlePageChange = (event, page) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        if (currentPage > maxPage && maxPage > 0) {
            setCurrentPage(maxPage);
        }
    }, [currentPage, maxPage]);

    return { currentItems, currentPage, maxPage, handlePageChange };
};

const SortableItem = ({ id, content, columnId, onMoveItem }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    const showLeftArrow = columnId !== 'independentVariables';
    const showRightArrow = columnId !== 'dependentVariables';

    let leftTargetColumn, rightTargetColumn;

    if (columnId === 'independentVariables') {
        leftTargetColumn = null;
        rightTargetColumn = 'fieldsNotUsed';
    } else if (columnId === 'fieldsNotUsed') {
        leftTargetColumn = 'independentVariables';
        rightTargetColumn = 'dependentVariables';
    } else {
        leftTargetColumn = 'fieldsNotUsed';
        rightTargetColumn = null;
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            sx={{
                mb: 1,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                '&:hover': {
                    boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
                }
            }}
            elevation={1}
        >
            <CardContent sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
                <Box
                    sx={{ color: 'text.secondary', cursor: 'grab' }}
                    {...listeners}
                    {...attributes}
                >
                    <DragIndicatorIcon fontSize="small" />
                </Box>

                {showLeftArrow && (
                    <IconButton
                        size="small"
                        onClick={() => onMoveItem(id, columnId, leftTargetColumn)}
                        aria-label={`Move to ${leftTargetColumn}`}
                        sx={{ mx: 0.5 }}
                    >
                        <ArrowBackIcon fontSize="small" />
                    </IconButton>
                )}

                <Typography
                    noWrap
                    sx={{ flex: 1, px: 1 }}
                    title={content}
                    variant="body2"
                >
                    {content}
                </Typography>

                {showRightArrow && (
                    <IconButton
                        size="small"
                        onClick={() => onMoveItem(id, columnId, rightTargetColumn)}
                        aria-label={`Move to ${rightTargetColumn}`}
                        sx={{ mx: 0.5 }}
                    >
                        <ArrowForwardIcon fontSize="small" />
                    </IconButton>
                )}
            </CardContent>
        </Card>
    );
};

const Column = ({ id, title, items, searchTerm, onSearchChange, onMoveItem }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        return items.filter(item =>
            item.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [items, searchTerm]);

    const { currentItems, currentPage, maxPage, handlePageChange } = usePagination(filteredItems, 5);

    let infoTooltip = null;
    if (id === 'independentVariables') {
        infoTooltip = 'Variables that are manipulated or categorized to observe their effect on dependent variables.';
    } else if (id === 'dependentVariables') {
        infoTooltip = 'Variables that are measured or tested in response to changes in independent variables.';
    }

    return (
        <Card
            sx={{
                flex: 1,
                minHeight: 500,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
            elevation={2}
        >
            <CardHeader
                title={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <span>{title}</span>
                        {infoTooltip && (
                            <Tooltip title={infoTooltip} arrow>
                                <InfoIcon fontSize="small" sx={{ cursor: 'pointer', color: 'white' }} />
                            </Tooltip>
                        )}
                    </Box>
                }
                sx={{
                    bgcolor: 'background.tableHeader',
                    color: 'background.default',
                    textAlign: 'center',
                    py: 1.5
                }}
                titleTypographyProps={{ variant: 'subtitle1' }}
            />
            <Box sx={{ bgcolor: 'grey.100', p: 1 }}>
                <TextField
                    size="small"
                    fullWidth
                    placeholder="Search fields..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(id, e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    onClick={() => onSearchChange(id, '')}
                                    aria-label="Clear search"
                                >
                                    <CancelIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>
            <CardContent
                ref={setNodeRef}
                sx={{
                    flex: 1,
                    p: 1,
                    bgcolor: 'grey.50',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 300,
                    ...(isOver && {
                        bgcolor: 'primary.light',
                        border: 2,
                        borderColor: 'primary.medium'
                    })
                }}
            >
                <SortableContext
                    items={currentItems.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {currentItems.map((item) => (
                        <SortableItem
                            key={item.id}
                            id={item.id}
                            content={item.content}
                            columnId={id}
                            onMoveItem={onMoveItem}
                        />
                    ))}
                </SortableContext>

                {filteredItems.length === 0 && (
                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed',
                        borderColor: 'grey.300',
                        borderRadius: 1,
                        m: 1,
                        p: 2
                    }}>
                        <Typography color="text.secondary">
                            Drop items here
                        </Typography>
                    </Box>
                )}
            </CardContent>
            {maxPage > 1 && (
                <Box sx={{ p: 1, display: 'flex', justifyContent: 'center', bgcolor: 'grey.50', borderTop: 1, borderColor: 'grey.200' }}>
                    <Pagination
                        count={maxPage}
                        page={currentPage}
                        onChange={handlePageChange}
                        size="small"
                        color="primary"
                    />
                </Box>
            )}
        </Card>
    );
};

const DependencyModel = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sessionId, setSessionId] = useLocalStorage('session_id', null);

    const emptyColumns = {
        independentVariables: {
            id: 'independentVariables',
            title: 'Independent Variables',
            items: []
        },
        fieldsNotUsed: {
            id: 'fieldsNotUsed',
            title: 'Fields Not Used',
            items: []
        },
        dependentVariables: {
            id: 'dependentVariables',
            title: 'Dependent Variables',
            items: []
        }
    };

    const [columns, setColumns] = useLocalStorage('dependency-model-columns', emptyColumns);

    useEffect(() => {
        if (location.state?.sessionId) {
            setSessionId(location.state.sessionId);
        }
    }, [location.state, setSessionId]);

    const [activeId, setActiveId] = useState(null);

    const [searchTerms, setSearchTerms] = useLocalStorage('dependency-model-search', {
        independentVariables: '',
        fieldsNotUsed: '',
        dependentVariables: ''
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const createItemId = (content) => {
        return `item-${content}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    };

    useEffect(() => {
        if (location.state?.dependentVariables || location.state?.independentVariables) {
            const dependentVars = location.state?.dependentVariables || [];
            const independentVars = location.state?.independentVariables || [];
            const availableColumns = location.state?.availableColumns || [];

            const allVariables = new Set([...dependentVars, ...independentVars]);
            
            const unusedFields = availableColumns.filter(col => !allVariables.has(col));

            const newColumns = {
                independentVariables: {
                    ...emptyColumns.independentVariables,
                    items: independentVars.map(content => ({
                        id: createItemId(content),
                        content
                    }))
                },
                dependentVariables: {
                    ...emptyColumns.dependentVariables,
                    items: dependentVars.map(content => ({
                        id: createItemId(content),
                        content
                    }))
                },
                fieldsNotUsed: {
                    ...emptyColumns.fieldsNotUsed,
                    items: unusedFields.map(content => ({
                        id: createItemId(content),
                        content
                    }))
                }
            };

            setColumns(newColumns);
        } else {
            handleAvailableColumns();
        }
    }, [location.state]);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, []);

    const handleAvailableColumns = useCallback(() => {
        if (location.state?.availableColumns?.length > 0) {
            const uniqueColumns = [...new Set(location.state.availableColumns)];

            setColumns(prev => {
                const existingContents = new Set();
                Object.values(prev).forEach(column => {
                    column.items.forEach(item => {
                        existingContents.add(item.content);
                    });
                });

                const newItems = uniqueColumns
                    .filter(col => !existingContents.has(col))
                    .map((col) => ({
                        id: createItemId(col),
                        content: col
                    }));

                if (newItems.length === 0) return prev;

                return {
                    ...prev,
                    fieldsNotUsed: {
                        ...prev.fieldsNotUsed,
                        items: [...newItems, ...prev.fieldsNotUsed.items]
                    }
                };
            });
        }
    }, [location.state?.availableColumns, setColumns]);

    const removeItemFromAllColumnsByContent = useCallback((content) => {
        return Object.fromEntries(
            Object.entries(columns).map(([columnId, column]) => [
                columnId,
                {
                    ...column,
                    items: column.items.filter(item => item.content !== content)
                }
            ])
        );
    }, [columns]);

    const findColumnForItem = useCallback((itemId) => {
        for (const [columnId, column] of Object.entries(columns)) {
            if (column.items.some(item => item.id === itemId)) {
                return columnId;
            }
        }
        return null;
    }, [columns]);

    const findItemInColumn = useCallback((itemId, columnId) => {
        return columns[columnId]?.items.find(item => item.id === itemId) || null;
    }, [columns]);

    const handleDragStart = useCallback((event) => {
        setActiveId(event.active.id);
    }, []);

    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;

        if (!active || !over) {
            setActiveId(null);
            return;
        }

        const activeColumnId = findColumnForItem(active.id);

        if (!activeColumnId) {
            setActiveId(null);
            return;
        }

        const activeItem = findItemInColumn(active.id, activeColumnId);

        if (!activeItem) {
            setActiveId(null);
            return;
        }

        const overId = over.id;

        if (Object.keys(columns).includes(overId)) {
            const newColumns = removeItemFromAllColumnsByContent(activeItem.content);

            newColumns[overId].items.unshift({
                id: createItemId(activeItem.content),
                content: activeItem.content
            });

            setColumns(newColumns);
        } else {
            const overColumnId = findColumnForItem(overId);

            if (overColumnId) {
                if (activeColumnId === overColumnId) {
                    const items = [...columns[activeColumnId].items];
                    const oldIndex = items.findIndex(item => item.id === active.id);
                    const newIndex = items.findIndex(item => item.id === overId);

                    if (oldIndex !== -1 && newIndex !== -1) {
                        const newItems = arrayMove(items, oldIndex, newIndex);

                        setColumns({
                            ...columns,
                            [activeColumnId]: {
                                ...columns[activeColumnId],
                                items: newItems
                            }
                        });
                    }
                } else {
                    const newColumns = removeItemFromAllColumnsByContent(activeItem.content);

                    const overItemIndex = newColumns[overColumnId].items.findIndex(
                        item => item.id === overId
                    );

                    if (overItemIndex !== -1) {
                        newColumns[overColumnId].items.splice(overItemIndex + 1, 0, {
                            id: createItemId(activeItem.content),
                            content: activeItem.content
                        });
                    } else {
                        newColumns[overColumnId].items.unshift({
                            id: createItemId(activeItem.content),
                            content: activeItem.content
                        });
                    }

                    setColumns(newColumns);
                }
            }
        }

        setActiveId(null);
    }, [columns, findColumnForItem, findItemInColumn, removeItemFromAllColumnsByContent, setColumns]);

    const moveItem = useCallback((itemId, sourceColumnId, destColumnId) => {
        if (!destColumnId) return;

        const item = findItemInColumn(itemId, sourceColumnId);

        if (item) {
            const newColumns = removeItemFromAllColumnsByContent(item.content);

            newColumns[destColumnId].items.unshift({
                id: createItemId(item.content),
                content: item.content
            });

            setColumns(newColumns);
        }
    }, [findItemInColumn, removeItemFromAllColumnsByContent, setColumns]);

    const handleSearchChange = useCallback((columnId, value) => {
        setSearchTerms(prev => ({
            ...prev,
            [columnId]: value
        }));
    }, [setSearchTerms]);

    const activeItem = useMemo(() => {
        if (!activeId) return null;

        const columnId = findColumnForItem(activeId);
        if (!columnId) return null;

        return findItemInColumn(activeId, columnId);
    }, [activeId, findColumnForItem, findItemInColumn]);

    const handleNextStep = useCallback(async () => {
        const dependentVariables = columns.dependentVariables.items.map(item => item.content);
        const independentVariables = columns.independentVariables.items.map(item => item.content);
        
        try {
            setIsLoading(true);
            
            const getCookie = (name) => {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop().split(';').shift();
                return null;
            };
            const storedSessionId = sessionId || localStorage.getItem('session_id');
            if (!storedSessionId) {
                throw new Error("Session not found. Please upload files first.");
            }
            const response = await fetch(`${API_BASE_URL}/save-dependency-model`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': storedSessionId || ''
                },
                credentials: 'include',
                body: JSON.stringify({
                    dependent_variables: dependentVariables,
                    independent_variables: independentVariables,
                    session_id: storedSessionId
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to save dependency model");
            }
            const data = await response.json();
            navigate('/visualize-data', {
                state: {
                    ...data,
                    dependentVariables,
                    independentVariables,
                    sessionId: data.session_id || storedSessionId,
                    bootstrap_analysis: data.bootstrap_analysis,
                    clientName: location.state?.clientName || '',
                    plantName: location.state?.plantName || '',
                    productName: location.state?.productName || ''
                }
            });
        } catch (error) {
            console.error("Error saving dependency model:", error);
            setError(error.message || "Failed to save dependency model. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [columns, navigate, sessionId]);

    const handlePreviousStep = useCallback(() => {
        navigate('/calculated-columns-builder');
    }, [navigate]);

    const handleCloseError = () => {
        setError(null);
    };

    return (
        <ThemeProvider theme={customTheme}>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                <Container maxWidth="xl" sx={{ py: 6 }}>
                    <Paper
                        elevation={2}
                        sx={{
                            borderRadius: 1,
                            p: { xs: 2, sm: 3 },
                            backgroundColor: 'background.paper',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}
                    >
                        <Typography variant="h5" component="h2" color="primary.main" sx={{ mb: 3 }}>
                            Step 3: Dependency Model
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 3 }}>
                            Drag and drop variables between columns to define your model. Dependent variables will be analyzed against independent variables.
                        </Typography>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            modifiers={[restrictToWindowEdges]}
                        >
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                                gap: 3,
                                mb: 4
                            }}>
                                <Column
                                    id="independentVariables"
                                    title={columns.independentVariables.title}
                                    items={columns.independentVariables.items}
                                    searchTerm={searchTerms.independentVariables}
                                    onSearchChange={handleSearchChange}
                                    onMoveItem={moveItem}
                                />
                                <Column
                                    id="fieldsNotUsed"
                                    title={columns.fieldsNotUsed.title}
                                    items={columns.fieldsNotUsed.items}
                                    searchTerm={searchTerms.fieldsNotUsed}
                                    onSearchChange={handleSearchChange}
                                    onMoveItem={moveItem}
                                />
                                <Column
                                    id="dependentVariables"
                                    title={columns.dependentVariables.title}
                                    items={columns.dependentVariables.items}
                                    searchTerm={searchTerms.dependentVariables}
                                    onSearchChange={handleSearchChange}
                                    onMoveItem={moveItem}
                                />
                            </Box>
                            <DragOverlay>
                                {activeId && activeItem && (
                                    <Card sx={{ boxShadow: '0 5px 10px rgba(0,0,0,0.2)' }}>
                                        <CardContent sx={{ p: 1 }}>
                                            <Typography variant="body2">
                                                {activeItem.content}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                )}
                            </DragOverlay>
                        </DndContext>
                        <Divider sx={{ my: 3, borderColor: 'primary.light' }} />
                        <NavigationButtons
                            onPrevious={handlePreviousStep}
                            onNext={handleNextStep}
                            isLoading={isLoading}
                            previousLabel="Back to Calculated Columns"
                            nextLabel={isLoading ? 'Processing...' : 'Next Step'}
                        />
                    </Paper>
                </Container>
            </Box>
            <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
                <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
};

export default DependencyModel;