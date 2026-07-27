import React, {
    useState,
    useEffect,
    useMemo,
    useCallback
} from 'react';

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
    Chip,
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
    Tooltip,
    alpha
} from '@mui/material';

import {
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    Search as SearchIcon,
    DragIndicator as DragIndicatorIcon,
    Cancel as CancelIcon,
    InfoOutlined as InfoIcon,
    FunctionsOutlined as FunctionsIcon,
    Inventory2Outlined as UnusedIcon,
    InsightsOutlined as DependentIcon,
    TuneOutlined as TuneIcon,
    TouchAppOutlined as DragIcon
} from '@mui/icons-material';

import { useLocalStorage } from '../hooks/useLocalStorage';
import customTheme from '../theme/customTheme';
import NavigationButtons from '../components/NavigationButtons';


/* =========================================================
   CONFIGURATION
========================================================= */

const API_BASE_URL = 'https://abhistat.com/api';

const COLUMN_CONFIG = {
    independentVariables: {
        color: '#2563EB',
        softColor: '#EFF6FF',
        borderColor: '#BFDBFE',
        icon: FunctionsIcon,
        label: 'INPUT VARIABLES',
        tooltip:
            'Variables that are manipulated or categorized to observe their effect on dependent variables.'
    },

    fieldsNotUsed: {
        color: '#64748B',
        softColor: '#F8FAFC',
        borderColor: '#E2E8F0',
        icon: UnusedIcon,
        label: 'AVAILABLE FIELDS',
        tooltip:
            'Variables currently excluded from the dependency model.'
    },

    dependentVariables: {
        color: '#059669',
        softColor: '#ECFDF5',
        borderColor: '#A7F3D0',
        icon: DependentIcon,
        label: 'OUTPUT VARIABLES',
        tooltip:
            'Variables that are measured or tested in response to changes in independent variables.'
    }
};


/* =========================================================
   PAGINATION HOOK
========================================================= */

const usePagination = (items, itemsPerPage) => {

    const [currentPage, setCurrentPage] = useState(1);

    const maxPage = Math.max(
        1,
        Math.ceil(items.length / itemsPerPage)
    );

    const currentItems = useMemo(() => {

        const startIndex =
            (currentPage - 1) * itemsPerPage;

        return items.slice(
            startIndex,
            startIndex + itemsPerPage
        );

    }, [items, currentPage, itemsPerPage]);

    const handlePageChange = (_event, page) => {
        setCurrentPage(page);
    };

    useEffect(() => {

        if (currentPage > maxPage) {
            setCurrentPage(maxPage);
        }

    }, [currentPage, maxPage]);

    return {
        currentItems,
        currentPage,
        maxPage,
        handlePageChange
    };
};


/* =========================================================
   SORTABLE VARIABLE ITEM
========================================================= */

const SortableItem = ({
    id,
    content,
    columnId,
    onMoveItem
}) => {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const config = COLUMN_CONFIG[columnId];

    const showLeftArrow =
        columnId !== 'independentVariables';

    const showRightArrow =
        columnId !== 'dependentVariables';

    let leftTargetColumn = null;
    let rightTargetColumn = null;

    if (columnId === 'independentVariables') {

        rightTargetColumn = 'fieldsNotUsed';

    } else if (columnId === 'fieldsNotUsed') {

        leftTargetColumn = 'independentVariables';
        rightTargetColumn = 'dependentVariables';

    } else {

        leftTargetColumn = 'fieldsNotUsed';
    }

    const getTargetLabel = (target) => {

        if (target === 'independentVariables') {
            return 'Independent Variables';
        }

        if (target === 'dependentVariables') {
            return 'Dependent Variables';
        }

        return 'Fields Not Used';
    };

    return (
        <Paper
            ref={setNodeRef}
            elevation={0}
            style={{
                transform: CSS.Transform.toString(transform),
                transition
            }}
            sx={{
                mb: 1.15,
                px: 1.1,
                py: 0.9,

                display: 'flex',
                alignItems: 'center',

                minHeight: 52,

                borderRadius: '10px',

                border: '1px solid',
                borderColor: isDragging
                    ? config.color
                    : '#E2E8F0',

                borderLeft: `3px solid ${config.color}`,

                backgroundColor: '#FFFFFF',

                boxShadow: isDragging
                    ? '0 12px 30px rgba(15,23,42,0.16)'
                    : '0 1px 2px rgba(15,23,42,0.025)',

                opacity: isDragging ? 0.55 : 1,

                transition:
                    'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',

                '&:hover': {
                    borderColor: config.borderColor,

                    boxShadow:
                        '0 5px 14px rgba(15,23,42,0.07)',

                    transform: 'translateY(-1px)'
                }
            }}
        >

            {/* DRAG HANDLE */}

            <Tooltip title="Drag variable" arrow>
                <Box
                    {...listeners}
                    {...attributes}
                    sx={{
                        width: 30,
                        height: 30,

                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',

                        flexShrink: 0,

                        borderRadius: '7px',

                        color: '#94A3B8',

                        cursor: 'grab',

                        '&:hover': {
                            color: '#475569',
                            bgcolor: '#F1F5F9'
                        },

                        '&:active': {
                            cursor: 'grabbing'
                        }
                    }}
                >
                    <DragIndicatorIcon fontSize="small" />
                </Box>
            </Tooltip>


            {/* LEFT MOVE */}

            {showLeftArrow && (

                <Tooltip
                    title={`Move to ${getTargetLabel(leftTargetColumn)}`}
                    arrow
                >
                    <IconButton
                        size="small"
                        onClick={() =>
                            onMoveItem(
                                id,
                                columnId,
                                leftTargetColumn
                            )
                        }
                        sx={{
                            ml: 0.25,

                            width: 29,
                            height: 29,

                            borderRadius: '7px',

                            color: '#64748B',

                            '&:hover': {
                                bgcolor: '#EFF6FF',
                                color: '#2563EB'
                            }
                        }}
                    >
                        <ArrowBackIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

            )}


            {/* VARIABLE NAME */}

            <Typography
                noWrap
                title={content}
                sx={{
                    flex: 1,

                    minWidth: 0,

                    px: 1,

                    fontSize: '0.82rem',
                    fontWeight: 600,

                    color: '#334155'
                }}
            >
                {content}
            </Typography>


            {/* RIGHT MOVE */}

            {showRightArrow && (

                <Tooltip
                    title={`Move to ${getTargetLabel(rightTargetColumn)}`}
                    arrow
                >
                    <IconButton
                        size="small"
                        onClick={() =>
                            onMoveItem(
                                id,
                                columnId,
                                rightTargetColumn
                            )
                        }
                        sx={{
                            width: 29,
                            height: 29,

                            borderRadius: '7px',

                            color: '#64748B',

                            '&:hover': {
                                bgcolor: '#EFF6FF',
                                color: '#2563EB'
                            }
                        }}
                    >
                        <ArrowForwardIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

            )}

        </Paper>
    );
};


/* =========================================================
   COLUMN COMPONENT
========================================================= */

const Column = ({
    id,
    title,
    items,
    searchTerm,
    onSearchChange,
    onMoveItem
}) => {

    const {
        setNodeRef,
        isOver
    } = useDroppable({ id });

    const config = COLUMN_CONFIG[id];

    const HeaderIcon = config.icon;

    const filteredItems = useMemo(() => {

        if (!searchTerm) {
            return items;
        }

        return items.filter(item =>
            item.content
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );

    }, [items, searchTerm]);


    const {
        currentItems,
        currentPage,
        maxPage,
        handlePageChange
    } = usePagination(filteredItems, 5);


    return (
        <Card
            elevation={0}
            sx={{
                minWidth: 0,
                minHeight: 545,

                display: 'flex',
                flexDirection: 'column',

                borderRadius: '16px',

                border: '1px solid',
                borderColor: isOver
                    ? config.color
                    : '#E5EAF0',

                overflow: 'hidden',

                backgroundColor: '#FFFFFF',

                boxShadow: isOver
                    ? `0 0 0 3px ${alpha(config.color, 0.10)}`
                    : '0 4px 18px rgba(15,23,42,0.045)',

                transition:
                    'border-color 180ms ease, box-shadow 180ms ease'
            }}
        >

            {/* =================================================
                COLUMN HEADER
            ================================================= */}

            <Box
                sx={{
                    px: 2.25,
                    pt: 2.25,
                    pb: 2,

                    background:
                        `linear-gradient(135deg, ${config.softColor} 0%, #FFFFFF 100%)`,

                    borderBottom: '1px solid',
                    borderColor: config.borderColor
                }}
            >

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 1
                    }}
                >

                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1.25,
                            alignItems: 'center',
                            minWidth: 0
                        }}
                    >

                        <Box
                            sx={{
                                width: 40,
                                height: 40,

                                borderRadius: '10px',

                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',

                                color: config.color,

                                bgcolor: alpha(
                                    config.color,
                                    0.09
                                ),

                                flexShrink: 0
                            }}
                        >
                            <HeaderIcon fontSize="small" />
                        </Box>


                        <Box sx={{ minWidth: 0 }}>

                            <Typography
                                sx={{
                                    fontSize: '0.66rem',
                                    fontWeight: 800,

                                    letterSpacing: '0.08em',

                                    color: config.color,

                                    mb: 0.25
                                }}
                            >
                                {config.label}
                            </Typography>

                            <Typography
                                sx={{
                                    color: '#1E293B',

                                    fontSize: '0.96rem',
                                    fontWeight: 750,

                                    letterSpacing: '-0.015em'
                                }}
                            >
                                {title}
                            </Typography>

                        </Box>

                    </Box>


                    <Tooltip
                        title={config.tooltip}
                        arrow
                        placement="top"
                    >
                        <IconButton
                            size="small"
                            sx={{
                                color: '#94A3B8',

                                '&:hover': {
                                    color: config.color,
                                    bgcolor: alpha(
                                        config.color,
                                        0.08
                                    )
                                }
                            }}
                        >
                            <InfoIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                </Box>


                {/* COUNT */}

                <Box sx={{ mt: 1.75 }}>

                    <Chip
                        size="small"
                        label={`${items.length} ${
                            items.length === 1
                                ? 'variable'
                                : 'variables'
                        }`}
                        sx={{
                            height: 24,

                            bgcolor: alpha(
                                config.color,
                                0.07
                            ),

                            color: config.color,

                            border: `1px solid ${alpha(
                                config.color,
                                0.13
                            )}`,

                            fontSize: '0.7rem',
                            fontWeight: 700,

                            '& .MuiChip-label': {
                                px: 1.1
                            }
                        }}
                    />

                </Box>

            </Box>


            {/* =================================================
                SEARCH
            ================================================= */}

            <Box
                sx={{
                    p: 1.5,

                    bgcolor: '#FFFFFF',

                    borderBottom: '1px solid #EEF2F6'
                }}
            >

                <TextField
                    size="small"
                    fullWidth
                    placeholder={`Search ${title.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={(e) =>
                        onSearchChange(
                            id,
                            e.target.value
                        )
                    }
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon
                                    sx={{
                                        fontSize: 19,
                                        color: '#94A3B8'
                                    }}
                                />
                            </InputAdornment>
                        ),

                        endAdornment: searchTerm && (
                            <InputAdornment position="end">

                                <IconButton
                                    size="small"
                                    onClick={() =>
                                        onSearchChange(
                                            id,
                                            ''
                                        )
                                    }
                                >
                                    <CancelIcon
                                        sx={{
                                            fontSize: 17
                                        }}
                                    />
                                </IconButton>

                            </InputAdornment>
                        )
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {

                            height: 40,

                            borderRadius: '9px',

                            bgcolor: '#F8FAFC',

                            fontSize: '0.8rem',

                            transition:
                                'background-color 150ms ease',

                            '& fieldset': {
                                borderColor: '#E2E8F0'
                            },

                            '&:hover': {
                                bgcolor: '#FFFFFF'
                            },

                            '&:hover fieldset': {
                                borderColor: '#CBD5E1'
                            },

                            '&.Mui-focused': {
                                bgcolor: '#FFFFFF'
                            },

                            '&.Mui-focused fieldset': {
                                borderColor: config.color,
                                borderWidth: '1px'
                            }
                        }
                    }}
                />

            </Box>


            {/* =================================================
                DROP ZONE
            ================================================= */}

            <Box
                ref={setNodeRef}
                sx={{
                    flex: 1,

                    minHeight: 330,

                    p: 1.4,

                    display: 'flex',
                    flexDirection: 'column',

                    bgcolor: isOver
                        ? config.softColor
                        : '#F8FAFC',

                    transition:
                        'background-color 180ms ease'
                }}
            >

                <SortableContext
                    items={currentItems.map(
                        item => item.id
                    )}
                    strategy={
                        verticalListSortingStrategy
                    }
                >

                    {currentItems.map(item => (

                        <SortableItem
                            key={item.id}
                            id={item.id}
                            content={item.content}
                            columnId={id}
                            onMoveItem={onMoveItem}
                        />

                    ))}

                </SortableContext>


                {/* EMPTY STATE */}

                {filteredItems.length === 0 && (

                    <Box
                        sx={{
                            flex: 1,

                            minHeight: 180,

                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',

                            textAlign: 'center',

                            p: 3,

                            borderRadius: '11px',

                            border: '1.5px dashed',
                            borderColor: isOver
                                ? config.color
                                : '#CBD5E1',

                            bgcolor: isOver
                                ? alpha(
                                      config.color,
                                      0.035
                                  )
                                : 'rgba(255,255,255,0.55)'
                        }}
                    >

                        <Box
                            sx={{
                                width: 42,
                                height: 42,

                                mb: 1.25,

                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',

                                borderRadius: '50%',

                                bgcolor: alpha(
                                    config.color,
                                    0.08
                                ),

                                color: config.color
                            }}
                        >
                            {searchTerm
                                ? (
                                    <SearchIcon />
                                )
                                : (
                                    <DragIcon />
                                )
                            }
                        </Box>


                        <Typography
                            sx={{
                                color: '#475569',

                                fontSize: '0.82rem',
                                fontWeight: 700,

                                mb: 0.5
                            }}
                        >
                            {searchTerm
                                ? 'No matching variables'
                                : 'Drop variables here'
                            }
                        </Typography>


                        <Typography
                            sx={{
                                maxWidth: 210,

                                color: '#94A3B8',

                                fontSize: '0.72rem',
                                lineHeight: 1.5
                            }}
                        >
                            {searchTerm
                                ? `Nothing matches "${searchTerm}".`
                                : 'Drag a variable from another column or use the arrow controls.'
                            }
                        </Typography>

                    </Box>

                )}

            </Box>


            {/* =================================================
                PAGINATION
            ================================================= */}

            {maxPage > 1 && (

                <Box
                    sx={{
                        minHeight: 54,

                        px: 1,
                        py: 1,

                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',

                        bgcolor: '#FFFFFF',

                        borderTop:
                            '1px solid #EEF2F6'
                    }}
                >

                    <Pagination
                        count={maxPage}
                        page={currentPage}
                        onChange={handlePageChange}
                        size="small"
                        siblingCount={0}
                        color="primary"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                fontSize: '0.75rem',
                                borderRadius: '7px'
                            }
                        }}
                    />

                </Box>

            )}

        </Card>
    );
};


/* =========================================================
   MAIN DEPENDENCY MODEL
========================================================= */

const DependencyModel = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] =
        useState(false);

    const [error, setError] =
        useState(null);

    const [sessionId, setSessionId] =
        useLocalStorage(
            'session_id',
            null
        );


    const emptyColumns = useMemo(() => ({
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
    }), []);


    const [columns, setColumns] =
        useLocalStorage(
            'dependency-model-columns',
            emptyColumns
        );


    const [activeId, setActiveId] =
        useState(null);


    const [searchTerms, setSearchTerms] =
        useLocalStorage(
            'dependency-model-search',
            {
                independentVariables: '',
                fieldsNotUsed: '',
                dependentVariables: ''
            }
        );


    /* =====================================================
       SESSION
    ===================================================== */

    useEffect(() => {

        if (location.state?.sessionId) {
            setSessionId(
                location.state.sessionId
            );
        }

    }, [
        location.state,
        setSessionId
    ]);


    /* =====================================================
       DND SENSORS
    ===================================================== */

    const sensors = useSensors(

        useSensor(
            PointerSensor,
            {
                activationConstraint: {
                    distance: 5
                }
            }
        ),

        useSensor(
            KeyboardSensor,
            {
                coordinateGetter:
                    sortableKeyboardCoordinates
            }
        )
    );


    /* =====================================================
       ITEM ID
    ===================================================== */

    const createItemId = useCallback(
        (content) => {

            return `item-${content}-${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 7)}`;

        },
        []
    );


    /* =====================================================
       LOAD VARIABLES
    ===================================================== */

    useEffect(() => {

        if (
            location.state?.dependentVariables ||
            location.state?.independentVariables
        ) {

            const dependentVars =
                location.state?.dependentVariables || [];

            const independentVars =
                location.state?.independentVariables || [];

            const availableColumns =
                location.state?.availableColumns || [];

            const allVariables =
                new Set([
                    ...dependentVars,
                    ...independentVars
                ]);

            const unusedFields =
                availableColumns.filter(
                    col =>
                        !allVariables.has(col)
                );


            const newColumns = {

                independentVariables: {
                    ...emptyColumns.independentVariables,

                    items:
                        independentVars.map(
                            content => ({
                                id: createItemId(
                                    content
                                ),
                                content
                            })
                        )
                },

                dependentVariables: {
                    ...emptyColumns.dependentVariables,

                    items:
                        dependentVars.map(
                            content => ({
                                id: createItemId(
                                    content
                                ),
                                content
                            })
                        )
                },

                fieldsNotUsed: {
                    ...emptyColumns.fieldsNotUsed,

                    items:
                        unusedFields.map(
                            content => ({
                                id: createItemId(
                                    content
                                ),
                                content
                            })
                        )
                }
            };

            setColumns(newColumns);

        }

    }, [
        location.state,
        emptyColumns,
        createItemId,
        setColumns
    ]);


    /* =====================================================
       SCROLL TOP
    ===================================================== */

    useEffect(() => {

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });

    }, []);


    /* =====================================================
       ADD AVAILABLE COLUMNS
    ===================================================== */

    useEffect(() => {

        if (
            !location.state?.dependentVariables &&
            !location.state?.independentVariables &&
            location.state?.availableColumns?.length
        ) {

            const uniqueColumns = [
                ...new Set(
                    location.state.availableColumns
                )
            ];


            setColumns(prev => {

                const existingContents =
                    new Set();

                Object.values(prev).forEach(
                    column => {

                        column.items.forEach(
                            item => {
                                existingContents.add(
                                    item.content
                                );
                            }
                        );

                    }
                );


                const newItems =
                    uniqueColumns
                        .filter(
                            col =>
                                !existingContents.has(
                                    col
                                )
                        )
                        .map(
                            content => ({
                                id: createItemId(
                                    content
                                ),
                                content
                            })
                        );


                if (!newItems.length) {
                    return prev;
                }


                return {
                    ...prev,

                    fieldsNotUsed: {
                        ...prev.fieldsNotUsed,

                        items: [
                            ...newItems,
                            ...prev.fieldsNotUsed.items
                        ]
                    }
                };

            });

        }

    }, [
        location.state,
        createItemId,
        setColumns
    ]);


    /* =====================================================
       HELPERS
    ===================================================== */

    const removeItemFromAllColumnsByContent =
        useCallback(
            (content) => {

                return Object.fromEntries(

                    Object.entries(columns)
                        .map(
                            ([columnId, column]) => [

                                columnId,

                                {
                                    ...column,

                                    items:
                                        column.items.filter(
                                            item =>
                                                item.content !==
                                                content
                                        )
                                }

                            ]
                        )
                );

            },
            [columns]
        );


    const findColumnForItem =
        useCallback(
            (itemId) => {

                for (
                    const [
                        columnId,
                        column
                    ] of Object.entries(columns)
                ) {

                    if (
                        column.items.some(
                            item =>
                                item.id === itemId
                        )
                    ) {
                        return columnId;
                    }

                }

                return null;

            },
            [columns]
        );


    const findItemInColumn =
        useCallback(
            (itemId, columnId) => {

                return (
                    columns[columnId]?.items.find(
                        item =>
                            item.id === itemId
                    ) || null
                );

            },
            [columns]
        );


    /* =====================================================
       DRAG START
    ===================================================== */

    const handleDragStart =
        useCallback(
            event => {

                setActiveId(
                    event.active.id
                );

            },
            []
        );


    /* =====================================================
       DRAG END
    ===================================================== */

    const handleDragEnd =
        useCallback(
            event => {

                const {
                    active,
                    over
                } = event;


                if (!active || !over) {

                    setActiveId(null);
                    return;

                }


                const activeColumnId =
                    findColumnForItem(
                        active.id
                    );


                if (!activeColumnId) {

                    setActiveId(null);
                    return;

                }


                const activeItem =
                    findItemInColumn(
                        active.id,
                        activeColumnId
                    );


                if (!activeItem) {

                    setActiveId(null);
                    return;

                }


                const overId = over.id;


                /* DROP DIRECTLY ON COLUMN */

                if (
                    Object.keys(columns)
                        .includes(overId)
                ) {

                    if (
                        activeColumnId !== overId
                    ) {

                        const newColumns =
                            removeItemFromAllColumnsByContent(
                                activeItem.content
                            );


                        newColumns[
                            overId
                        ].items.unshift({
                            id: createItemId(
                                activeItem.content
                            ),

                            content:
                                activeItem.content
                        });


                        setColumns(
                            newColumns
                        );
                    }

                }

                /* DROP ON ITEM */

                else {

                    const overColumnId =
                        findColumnForItem(
                            overId
                        );


                    if (overColumnId) {

                        /* REORDER */

                        if (
                            activeColumnId ===
                            overColumnId
                        ) {

                            const items = [
                                ...columns[
                                    activeColumnId
                                ].items
                            ];


                            const oldIndex =
                                items.findIndex(
                                    item =>
                                        item.id ===
                                        active.id
                                );


                            const newIndex =
                                items.findIndex(
                                    item =>
                                        item.id ===
                                        overId
                                );


                            if (
                                oldIndex !== -1 &&
                                newIndex !== -1
                            ) {

                                const newItems =
                                    arrayMove(
                                        items,
                                        oldIndex,
                                        newIndex
                                    );


                                setColumns({
                                    ...columns,

                                    [activeColumnId]: {
                                        ...columns[
                                            activeColumnId
                                        ],

                                        items:
                                            newItems
                                    }
                                });

                            }

                        }

                        /* MOVE BETWEEN COLUMNS */

                        else {

                            const newColumns =
                                removeItemFromAllColumnsByContent(
                                    activeItem.content
                                );


                            const overItemIndex =
                                newColumns[
                                    overColumnId
                                ].items.findIndex(
                                    item =>
                                        item.id ===
                                        overId
                                );


                            const movedItem = {
                                id: createItemId(
                                    activeItem.content
                                ),

                                content:
                                    activeItem.content
                            };


                            if (
                                overItemIndex !== -1
                            ) {

                                newColumns[
                                    overColumnId
                                ].items.splice(
                                    overItemIndex + 1,
                                    0,
                                    movedItem
                                );

                            } else {

                                newColumns[
                                    overColumnId
                                ].items.unshift(
                                    movedItem
                                );

                            }


                            setColumns(
                                newColumns
                            );

                        }

                    }

                }


                setActiveId(null);

            },
            [
                columns,
                createItemId,
                findColumnForItem,
                findItemInColumn,
                removeItemFromAllColumnsByContent,
                setColumns
            ]
        );


    /* =====================================================
       MOVE USING ARROWS
    ===================================================== */

    const moveItem =
        useCallback(
            (
                itemId,
                sourceColumnId,
                destColumnId
            ) => {

                if (!destColumnId) {
                    return;
                }


                const item =
                    findItemInColumn(
                        itemId,
                        sourceColumnId
                    );


                if (!item) {
                    return;
                }


                const newColumns =
                    removeItemFromAllColumnsByContent(
                        item.content
                    );


                newColumns[
                    destColumnId
                ].items.unshift({
                    id: createItemId(
                        item.content
                    ),

                    content:
                        item.content
                });


                setColumns(
                    newColumns
                );

            },
            [
                createItemId,
                findItemInColumn,
                removeItemFromAllColumnsByContent,
                setColumns
            ]
        );


    /* =====================================================
       SEARCH
    ===================================================== */

    const handleSearchChange =
        useCallback(
            (columnId, value) => {

                setSearchTerms(prev => ({
                    ...prev,
                    [columnId]: value
                }));

            },
            [setSearchTerms]
        );


    /* =====================================================
       ACTIVE ITEM
    ===================================================== */

    const activeItem =
        useMemo(() => {

            if (!activeId) {
                return null;
            }


            const columnId =
                findColumnForItem(
                    activeId
                );


            if (!columnId) {
                return null;
            }


            return findItemInColumn(
                activeId,
                columnId
            );

        }, [
            activeId,
            findColumnForItem,
            findItemInColumn
        ]);


    /* =====================================================
       NEXT
    ===================================================== */

    const handleNextStep =
        useCallback(
            async () => {

                const dependentVariables =
                    columns
                        .dependentVariables
                        .items
                        .map(
                            item =>
                                item.content
                        );


                const independentVariables =
                    columns
                        .independentVariables
                        .items
                        .map(
                            item =>
                                item.content
                        );


                try {

                    setIsLoading(true);


                    const storedSessionId =
                        sessionId ||
                        localStorage.getItem(
                            'session_id'
                        );


                    if (!storedSessionId) {

                        throw new Error(
                            'Session not found. Please upload files first.'
                        );

                    }


                    const response =
                        await fetch(
                            `${API_BASE_URL}/save-dependency-model`,
                            {
                                method: 'POST',

                                headers: {
                                    'Content-Type':
                                        'application/json',

                                    'X-Session-ID':
                                        storedSessionId
                                },

                                credentials:
                                    'include',

                                body:
                                    JSON.stringify({
                                        dependent_variables:
                                            dependentVariables,

                                        independent_variables:
                                            independentVariables,

                                        session_id:
                                            storedSessionId
                                    })
                            }
                        );


                    if (!response.ok) {

                        let errorMessage =
                            'Failed to save dependency model';


                        try {

                            const errorData =
                                await response.json();

                            errorMessage =
                                errorData.error ||
                                errorMessage;

                        } catch {
                            // response was not JSON
                        }


                        throw new Error(
                            errorMessage
                        );

                    }


                    const data =
                        await response.json();


                    navigate(
                        '/visualize-data',
                        {
                            state: {

                                ...data,

                                dependentVariables,
                                independentVariables,

                                sessionId:
                                    data.session_id ||
                                    storedSessionId,

                                bootstrap_analysis:
                                    data.bootstrap_analysis,

                                clientName:
                                    location.state
                                        ?.clientName ||
                                    '',

                                plantName:
                                    location.state
                                        ?.plantName ||
                                    '',

                                productName:
                                    location.state
                                        ?.productName ||
                                    ''
                            }
                        }
                    );

                } catch (error) {

                    console.error(
                        'Error saving dependency model:',
                        error
                    );


                    setError(
                        error.message ||
                        'Failed to save dependency model. Please try again.'
                    );

                } finally {

                    setIsLoading(false);

                }

            },
            [
                columns,
                navigate,
                sessionId,
                location.state
            ]
        );


    /* =====================================================
       PREVIOUS
    ===================================================== */

    const handlePreviousStep =
        useCallback(
            () => {

                navigate(
                    '/calculated-columns-builder'
                );

            },
            [navigate]
        );


    const handleCloseError = () => {
        setError(null);
    };


    /* =====================================================
       COUNTS
    ===================================================== */

    const totalVariables =
        columns.independentVariables.items.length +
        columns.fieldsNotUsed.items.length +
        columns.dependentVariables.items.length;


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <ThemeProvider theme={customTheme}>

            <Box
                sx={{
                    minHeight: '100vh',

                    bgcolor: '#F6F8FB',

                    backgroundImage:
                        'radial-gradient(circle at top right, rgba(37,99,235,0.035), transparent 30%)'
                }}
            >

                <Container
                    maxWidth="xl"
                    sx={{
                        py: {
                            xs: 3,
                            md: 5
                        }
                    }}
                >

                    <Paper
                        elevation={0}
                        sx={{
                            p: {
                                xs: 2,
                                sm: 3,
                                md: 4
                            },

                            borderRadius: {
                                xs: '14px',
                                md: '20px'
                            },

                            bgcolor: '#FFFFFF',

                            border:
                                '1px solid #E5EAF0',

                            boxShadow:
                                '0 8px 30px rgba(15,23,42,0.045)'
                        }}
                    >

                        {/* =====================================
                            PAGE HEADER
                        ===================================== */}

                        <Box
                            sx={{
                                display: 'flex',

                                flexDirection: {
                                    xs: 'column',
                                    md: 'row'
                                },

                                alignItems: {
                                    xs: 'flex-start',
                                    md: 'center'
                                },

                                justifyContent:
                                    'space-between',

                                gap: 2,

                                mb: 3.5
                            }}
                        >

                            <Box>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,

                                        mb: 1
                                    }}
                                >

                                    <Box
                                        sx={{
                                            width: 36,
                                            height: 36,

                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent:
                                                'center',

                                            borderRadius:
                                                '9px',

                                            bgcolor:
                                                '#EFF6FF',

                                            color:
                                                '#2563EB'
                                        }}
                                    >
                                        <TuneIcon fontSize="small" />
                                    </Box>


                                    <Typography
                                        sx={{
                                            color:
                                                '#2563EB',

                                            fontSize:
                                                '0.73rem',

                                            fontWeight: 800,

                                            letterSpacing:
                                                '0.08em'
                                        }}
                                    >
                                        STEP 3
                                    </Typography>

                                </Box>


                                <Typography
                                    component="h1"
                                    sx={{
                                        color: '#172B4D',

                                        fontSize: {
                                            xs: '1.45rem',
                                            md: '1.8rem'
                                        },

                                        fontWeight: 750,

                                        letterSpacing:
                                            '-0.035em',

                                        lineHeight: 1.2,

                                        mb: 0.75
                                    }}
                                >
                                    Dependency Model
                                </Typography>


                                <Typography
                                    sx={{
                                        maxWidth: 720,

                                        color: '#64748B',

                                        fontSize:
                                            '0.88rem',

                                        lineHeight: 1.65
                                    }}
                                >
                                    Organize your variables to define
                                    how inputs relate to measured
                                    outputs. Drag variables between
                                    columns or use the arrow controls.
                                </Typography>

                            </Box>


                            <Chip
                                label={`${totalVariables} total variables`}
                                sx={{
                                    height: 32,

                                    bgcolor: '#F8FAFC',

                                    color: '#475569',

                                    border:
                                        '1px solid #E2E8F0',

                                    fontWeight: 650,

                                    fontSize:
                                        '0.76rem'
                                }}
                            />

                        </Box>


                        {/* =====================================
                            INSTRUCTION STRIP
                        ===================================== */}

                        <Box
                            sx={{
                                mb: 3,

                                px: 2,
                                py: 1.35,

                                display: 'flex',
                                alignItems: 'center',

                                gap: 1.25,

                                borderRadius: '10px',

                                bgcolor: '#F8FAFC',

                                border:
                                    '1px solid #E8EDF3'
                            }}
                        >

                            <DragIcon
                                sx={{
                                    fontSize: 19,
                                    color: '#64748B'
                                }}
                            />

                            <Typography
                                sx={{
                                    color: '#64748B',

                                    fontSize:
                                        '0.78rem',

                                    lineHeight: 1.5
                                }}
                            >
                                <Box
                                    component="span"
                                    sx={{
                                        color: '#334155',
                                        fontWeight: 700
                                    }}
                                >
                                    Build your model:
                                </Box>{' '}

                                move variables into Independent
                                Variables or Dependent Variables.
                                Fields you do not want analyzed can
                                remain in Fields Not Used.
                            </Typography>

                        </Box>


                        {/* =====================================
                            DND
                        ===================================== */}

                        <DndContext
                            sensors={sensors}
                            collisionDetection={
                                closestCenter
                            }
                            onDragStart={
                                handleDragStart
                            }
                            onDragEnd={
                                handleDragEnd
                            }
                            modifiers={[
                                restrictToWindowEdges
                            ]}
                        >

                            <Box
                                sx={{
                                    display: 'grid',

                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        lg:
                                            'repeat(3, minmax(0, 1fr))'
                                    },

                                    gap: {
                                        xs: 2,
                                        lg: 2.25
                                    },

                                    mb: 4
                                }}
                            >

                                <Column
                                    id="independentVariables"
                                    title={
                                        columns
                                            .independentVariables
                                            .title
                                    }
                                    items={
                                        columns
                                            .independentVariables
                                            .items
                                    }
                                    searchTerm={
                                        searchTerms
                                            .independentVariables
                                    }
                                    onSearchChange={
                                        handleSearchChange
                                    }
                                    onMoveItem={
                                        moveItem
                                    }
                                />


                                <Column
                                    id="fieldsNotUsed"
                                    title={
                                        columns
                                            .fieldsNotUsed
                                            .title
                                    }
                                    items={
                                        columns
                                            .fieldsNotUsed
                                            .items
                                    }
                                    searchTerm={
                                        searchTerms
                                            .fieldsNotUsed
                                    }
                                    onSearchChange={
                                        handleSearchChange
                                    }
                                    onMoveItem={
                                        moveItem
                                    }
                                />


                                <Column
                                    id="dependentVariables"
                                    title={
                                        columns
                                            .dependentVariables
                                            .title
                                    }
                                    items={
                                        columns
                                            .dependentVariables
                                            .items
                                    }
                                    searchTerm={
                                        searchTerms
                                            .dependentVariables
                                    }
                                    onSearchChange={
                                        handleSearchChange
                                    }
                                    onMoveItem={
                                        moveItem
                                    }
                                />

                            </Box>


                            {/* DRAG OVERLAY */}

                            <DragOverlay>

                                {activeId &&
                                    activeItem && (

                                    <Paper
                                        elevation={0}
                                        sx={{
                                            width: 280,

                                            px: 1.5,
                                            py: 1.25,

                                            display: 'flex',
                                            alignItems:
                                                'center',

                                            gap: 1,

                                            borderRadius:
                                                '10px',

                                            bgcolor:
                                                '#FFFFFF',

                                            border:
                                                '1px solid #93C5FD',

                                            borderLeft:
                                                '3px solid #2563EB',

                                            boxShadow:
                                                '0 18px 40px rgba(15,23,42,0.18)'
                                        }}
                                    >

                                        <DragIndicatorIcon
                                            sx={{
                                                color:
                                                    '#94A3B8'
                                            }}
                                        />

                                        <Typography
                                            noWrap
                                            sx={{
                                                color:
                                                    '#334155',

                                                fontSize:
                                                    '0.82rem',

                                                fontWeight:
                                                    650
                                            }}
                                        >
                                            {
                                                activeItem.content
                                            }
                                        </Typography>

                                    </Paper>

                                )}

                            </DragOverlay>

                        </DndContext>


                        {/* =====================================
                            NAVIGATION
                        ===================================== */}

                        <Divider
                            sx={{
                                mt: 1,
                                mb: 1,

                                borderColor:
                                    '#E8EDF3'
                            }}
                        />


                        <NavigationButtons
                            onPrevious={
                                handlePreviousStep
                            }
                            onNext={
                                handleNextStep
                            }
                            isLoading={
                                isLoading
                            }
                            previousLabel="Back to Calculated Columns"
                            nextLabel={
                                isLoading
                                    ? 'Processing...'
                                    : 'Continue to Visualization'
                            }
                        />

                    </Paper>

                </Container>

            </Box>


            {/* ERROR */}

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={handleCloseError}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center'
                }}
            >

                <Alert
                    onClose={handleCloseError}
                    severity="error"
                    variant="filled"
                    sx={{
                        width: '100%',
                        borderRadius: '10px'
                    }}
                >
                    {error}
                </Alert>

            </Snackbar>

        </ThemeProvider>
    );
};


export default DependencyModel;