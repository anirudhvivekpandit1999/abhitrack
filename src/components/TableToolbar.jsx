import React, { useMemo, useState } from 'react';

import {
  Box,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Checkbox,
  Divider,
  Typography,
  TextField,
  InputAdornment,
  Tooltip,
  Chip,
} from '@mui/material';

import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import CheckBoxOutlineBlankRoundedIcon from '@mui/icons-material/CheckBoxOutlineBlankRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';


/* ============================================================================
   DESIGN TOKENS
============================================================================ */

const COLORS = {
  navy: '#1A2B4B',

  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  primarySoft: '#EFF6FF',

  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',

  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  background: '#F8FAFC',
  surface: '#FFFFFF',

  danger: '#DC2626',
  dangerSoft: '#FEF2F2',
};


/* ============================================================================
   TABLE TOOLBAR
============================================================================ */

const TableToolbar = React.memo(({
  columnFilters = {},
  onClearFilters,
  columns = [],
  visibleColumns = [],
  onColumnVisibilityChange,
}) => {

  /* ==========================================================================
     STATE
  ========================================================================== */

  const [anchorEl, setAnchorEl] = useState(null);
  const [searchText, setSearchText] = useState('');

  const open = Boolean(anchorEl);


  /* ==========================================================================
     MENU
  ========================================================================== */

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };


  const handleClose = () => {
    setAnchorEl(null);
    setSearchText('');
  };


  /* ==========================================================================
     COLUMN VISIBILITY
  ========================================================================== */

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


  /* ==========================================================================
     SEARCH
  ========================================================================== */

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };


  const handleClearSearch = () => {
    setSearchText('');
  };


  /* ==========================================================================
     DERIVED STATE
  ========================================================================== */

  const allSelected =
    columns.length > 0 &&
    columns.length === visibleColumns.length;


  const someSelected =
    visibleColumns.length > 0 &&
    visibleColumns.length < columns.length;


  const activeFilterCount = useMemo(() => {
    return Object.values(columnFilters).filter((value) => {
      if (value === null || value === undefined) {
        return false;
      }

      return String(value).trim() !== '';
    }).length;
  }, [columnFilters]);


  const filteredColumns = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    if (!search) {
      return columns;
    }

    return columns.filter((column) =>
      String(column)
        .toLowerCase()
        .includes(search)
    );
  }, [columns, searchText]);


  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
    <Box
      sx={{
        mb: 2,

        px: {
          xs: 1.25,
          sm: 1.5,
        },

        py: 1.15,

        display: 'flex',

        flexDirection: {
          xs: 'column',
          sm: 'row',
        },

        alignItems: {
          xs: 'stretch',
          sm: 'center',
        },

        justifyContent: 'space-between',

        gap: 1.25,

        border: `1px solid ${COLORS.border}`,

        borderRadius: '10px',

        bgcolor: COLORS.surface,

        boxShadow:
          '0 1px 3px rgba(15, 23, 42, 0.035)',
      }}
    >

      {/* ======================================================================
          LEFT SIDE
      ====================================================================== */}

      <Box
        sx={{
          display: 'flex',

          alignItems: 'center',

          gap: 1,

          minWidth: 0,
        }}
      >

        {/* ====================================================================
            COLUMN BUTTON
        ==================================================================== */}

        <Button
          id="column-visibility-button"
          size="small"
          variant="outlined"
          startIcon={
            <ViewColumnOutlinedIcon />
          }
          onClick={handleClick}
          aria-controls={
            open
              ? 'column-visibility-menu'
              : undefined
          }
          aria-haspopup="true"
          aria-expanded={
            open
              ? 'true'
              : undefined
          }
          sx={{
            minHeight: 38,

            px: 1.4,

            flexShrink: 0,

            borderRadius: '8px',

            borderColor:
              open
                ? '#BFDBFE'
                : COLORS.border,

            bgcolor:
              open
                ? COLORS.primarySoft
                : COLORS.surface,

            color:
              open
                ? COLORS.primary
                : COLORS.navy,

            textTransform: 'none',

            fontSize: '0.68rem',

            fontWeight: 700,

            boxShadow: 'none',

            transition:
              'background-color 150ms ease, border-color 150ms ease, color 150ms ease',

            '& .MuiButton-startIcon': {
              mr: 0.65,

              '& svg': {
                fontSize: 17,
              },
            },

            '&:hover': {
              borderColor: '#BFDBFE',

              bgcolor: COLORS.primarySoft,

              color: COLORS.primary,

              boxShadow: 'none',
            },
          }}
        >
          Columns
        </Button>


        {/* ====================================================================
            VISIBLE COLUMN COUNT
        ==================================================================== */}

        <Tooltip
          title={`${visibleColumns.length} of ${columns.length} columns are visible`}
          arrow
        >
          <Chip
            label={`${visibleColumns.length} / ${columns.length} visible`}
            size="small"
            sx={{
              height: 28,

              display: {
                xs: 'none',
                sm: 'flex',
              },

              border:
                `1px solid ${COLORS.border}`,

              bgcolor: COLORS.background,

              color: COLORS.textSecondary,

              fontSize: '0.56rem',

              fontWeight: 650,

              '& .MuiChip-label': {
                px: 1,
              },
            }}
          />
        </Tooltip>

      </Box>


      {/* ======================================================================
          RIGHT SIDE
      ====================================================================== */}

      {activeFilterCount > 0 && (
        <Box
          sx={{
            display: 'flex',

            alignItems: 'center',

            gap: 0.8,
          }}
        >

          {/* FILTER COUNT */}

          <Chip
            label={
              `${activeFilterCount} filter${
                activeFilterCount === 1
                  ? ''
                  : 's'
              } active`
            }
            size="small"
            sx={{
              height: 28,

              bgcolor: COLORS.primarySoft,

              color: COLORS.primary,

              border:
                '1px solid #DBEAFE',

              fontSize: '0.56rem',

              fontWeight: 700,

              '& .MuiChip-label': {
                px: 1,
              },
            }}
          />


          {/* CLEAR FILTERS */}

          <Button
            size="small"
            variant="text"
            onClick={onClearFilters}
            startIcon={
              <FilterAltOffRoundedIcon />
            }
            sx={{
              minHeight: 34,

              px: 1,

              borderRadius: '7px',

              color: COLORS.textSecondary,

              textTransform: 'none',

              fontSize: '0.62rem',

              fontWeight: 700,

              '& .MuiButton-startIcon': {
                mr: 0.5,

                '& svg': {
                  fontSize: 16,
                },
              },

              '&:hover': {
                bgcolor: COLORS.dangerSoft,

                color: COLORS.danger,
              },
            }}
          >
            Clear filters
          </Button>

        </Box>
      )}


      {/* ======================================================================
          COLUMN VISIBILITY MENU
      ====================================================================== */}

      <Menu
        id="column-visibility-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby':
            'column-visibility-button',

          disablePadding: true,
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.75,

              width: {
                xs: 290,
                sm: 320,
              },

              maxWidth:
                'calc(100vw - 32px)',

              maxHeight: 440,

              overflow: 'hidden',

              border:
                `1px solid ${COLORS.border}`,

              borderRadius: '12px',

              bgcolor: COLORS.surface,

              backgroundImage: 'none',

              boxShadow:
                '0 14px 35px rgba(15, 23, 42, 0.14)',
            },
          },
        }}
      >

        {/* ====================================================================
            MENU HEADER
        ==================================================================== */}

        <Box
          sx={{
            px: 1.75,
            pt: 1.6,
            pb: 1.25,

            bgcolor: COLORS.surface,
          }}
        >
          <Box
            sx={{
              display: 'flex',

              alignItems: 'flex-start',

              justifyContent: 'space-between',

              gap: 1,
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: COLORS.textPrimary,

                  fontSize: '0.72rem',

                  fontWeight: 800,

                  lineHeight: 1.35,
                }}
              >
                Column Visibility
              </Typography>

              <Typography
                sx={{
                  mt: 0.2,

                  color: COLORS.textMuted,

                  fontSize: '0.55rem',

                  lineHeight: 1.4,
                }}
              >
                Choose which columns appear in the table
              </Typography>
            </Box>


            <Chip
              label={`${visibleColumns.length}/${columns.length}`}
              size="small"
              sx={{
                height: 25,

                flexShrink: 0,

                bgcolor: COLORS.primarySoft,

                color: COLORS.primary,

                fontSize: '0.53rem',

                fontWeight: 750,
              }}
            />
          </Box>


          {/* ==================================================================
              SEARCH
          ================================================================== */}

          <TextField
            placeholder="Search columns..."
            size="small"
            value={searchText}
            onChange={handleSearchChange}
            fullWidth
            autoComplete="off"
            sx={{
              mt: 1.4,

              '& .MuiOutlinedInput-root': {
                height: 38,

                borderRadius: '8px',

                bgcolor: COLORS.background,

                fontSize: '0.64rem',

                transition:
                  'background-color 150ms ease',

                '& fieldset': {
                  borderColor: COLORS.border,
                },

                '&:hover fieldset': {
                  borderColor: '#CBD5E1',
                },

                '&.Mui-focused': {
                  bgcolor: COLORS.surface,

                  '& fieldset': {
                    borderColor: COLORS.primary,

                    borderWidth: '1px',
                  },
                },
              },

              '& input::placeholder': {
                color: COLORS.textMuted,

                opacity: 1,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon
                    sx={{
                      color: COLORS.textMuted,

                      fontSize: 17,
                    }}
                  />
                </InputAdornment>
              ),

              endAdornment: searchText ? (
                <InputAdornment position="end">
                  <Tooltip
                    title="Clear search"
                    arrow
                  >
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      edge="end"
                      sx={{
                        width: 26,
                        height: 26,

                        color: COLORS.textMuted,

                        '&:hover': {
                          bgcolor: '#E2E8F0',

                          color: COLORS.textPrimary,
                        },
                      }}
                    >
                      <ClearRoundedIcon
                        sx={{
                          fontSize: 15,
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>


        <Divider
          sx={{
            borderColor: COLORS.borderLight,
          }}
        />


        {/* ====================================================================
            SELECT ALL
        ==================================================================== */}

        <Box
          sx={{
            px: 1,
            py: 0.65,

            bgcolor: '#FCFDFE',
          }}
        >
          <MenuItem
            onClick={() => {
              if (allSelected) {
                onColumnVisibilityChange('none');
              } else {
                onColumnVisibilityChange('all');
              }
            }}
            sx={{
              minHeight: 40,

              px: 1,

              borderRadius: '7px',

              color: COLORS.textPrimary,

              '&:hover': {
                bgcolor: COLORS.primarySoft,
              },
            }}
          >
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              size="small"
              icon={
                <CheckBoxOutlineBlankRoundedIcon />
              }
              checkedIcon={
                <CheckBoxRoundedIcon />
              }
              sx={{
                p: 0.5,
                mr: 0.8,

                color: COLORS.textMuted,

                '&.Mui-checked': {
                  color: COLORS.primary,
                },

                '&.MuiCheckbox-indeterminate': {
                  color: COLORS.primary,
                },

                '& svg': {
                  fontSize: 18,
                },
              }}
            />


            <Box
              sx={{
                flex: 1,
              }}
            >
              <Typography
                sx={{
                  color: COLORS.textPrimary,

                  fontSize: '0.64rem',

                  fontWeight: 750,
                }}
              >
                {allSelected
                  ? 'Deselect all columns'
                  : 'Select all columns'}
              </Typography>

              <Typography
                sx={{
                  mt: 0.1,

                  color: COLORS.textMuted,

                  fontSize: '0.5rem',
                }}
              >
                {visibleColumns.length} of {columns.length} currently visible
              </Typography>
            </Box>


            {allSelected && (
              <DoneAllRoundedIcon
                sx={{
                  color: COLORS.primary,

                  fontSize: 17,
                }}
              />
            )}
          </MenuItem>
        </Box>


        <Divider
          sx={{
            borderColor: COLORS.borderLight,
          }}
        />


        {/* ====================================================================
            SEARCH RESULT INFORMATION
        ==================================================================== */}

        {searchText && (
          <Box
            sx={{
              px: 1.75,
              pt: 1.05,
              pb: 0.35,
            }}
          >
            <Typography
              sx={{
                color: COLORS.textMuted,

                fontSize: '0.52rem',

                fontWeight: 650,
              }}
            >
              {filteredColumns.length}{' '}
              {filteredColumns.length === 1
                ? 'column'
                : 'columns'}{' '}
              matching "{searchText}"
            </Typography>
          </Box>
        )}


        {/* ====================================================================
            COLUMN LIST
        ==================================================================== */}

        <Box
          sx={{
            maxHeight: 230,

            overflowY: 'auto',

            px: 1,
            py: 0.7,

            '&::-webkit-scrollbar': {
              width: 6,
            },

            '&::-webkit-scrollbar-track': {
              bgcolor: 'transparent',
            },

            '&::-webkit-scrollbar-thumb': {
              bgcolor: '#CBD5E1',

              borderRadius: 10,
            },

            '&::-webkit-scrollbar-thumb:hover': {
              bgcolor: '#94A3B8',
            },
          }}
        >
          {filteredColumns.length > 0 ? (
            filteredColumns.map((column) => {
              const selected =
                visibleColumns.includes(column);


              return (
                <MenuItem
                  key={column}
                  onClick={() =>
                    handleColumnToggle(column)
                  }
                  selected={selected}
                  sx={{
                    minHeight: 39,

                    px: 1,

                    mb: 0.25,

                    borderRadius: '7px',

                    bgcolor:
                      selected
                        ? COLORS.primarySoft
                        : 'transparent',

                    color:
                      selected
                        ? COLORS.primary
                        : COLORS.textSecondary,

                    transition:
                      'background-color 120ms ease, color 120ms ease',

                    '&.Mui-selected': {
                      bgcolor: COLORS.primarySoft,

                      '&:hover': {
                        bgcolor: '#E5EFFF',
                      },
                    },

                    '&:hover': {
                      bgcolor:
                        selected
                          ? '#E5EFFF'
                          : COLORS.background,

                      color:
                        selected
                          ? COLORS.primary
                          : COLORS.textPrimary,
                    },
                  }}
                >
                  <Checkbox
                    checked={selected}
                    size="small"
                    tabIndex={-1}
                    disableRipple
                    icon={
                      <CheckBoxOutlineBlankRoundedIcon />
                    }
                    checkedIcon={
                      <CheckBoxRoundedIcon />
                    }
                    sx={{
                      p: 0.5,
                      mr: 0.75,

                      color: COLORS.textMuted,

                      pointerEvents: 'none',

                      '&.Mui-checked': {
                        color: COLORS.primary,
                      },

                      '& svg': {
                        fontSize: 17,
                      },
                    }}
                  />


                  <Typography
                    title={column}
                    noWrap
                    sx={{
                      flex: 1,

                      color: 'inherit',

                      fontSize: '0.61rem',

                      fontWeight:
                        selected
                          ? 700
                          : 550,
                    }}
                  >
                    {column}
                  </Typography>


                  {selected && (
                    <Typography
                      sx={{
                        ml: 1,

                        color: COLORS.primary,

                        fontSize: '0.48rem',

                        fontWeight: 750,

                        textTransform: 'uppercase',

                        letterSpacing: '0.04em',
                      }}
                    >
                      Visible
                    </Typography>
                  )}
                </MenuItem>
              );
            })
          ) : (

            /* ================================================================
               EMPTY SEARCH
            ================================================================ */

            <Box
              sx={{
                px: 2,
                py: 3,

                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,

                  mx: 'auto',
                  mb: 1,

                  display: 'grid',

                  placeItems: 'center',

                  borderRadius: '10px',

                  bgcolor: COLORS.background,

                  color: COLORS.textMuted,
                }}
              >
                <SearchRoundedIcon
                  sx={{
                    fontSize: 19,
                  }}
                />
              </Box>


              <Typography
                sx={{
                  color: COLORS.textPrimary,

                  fontSize: '0.64rem',

                  fontWeight: 700,
                }}
              >
                No matching columns
              </Typography>


              <Typography
                sx={{
                  mt: 0.3,

                  color: COLORS.textMuted,

                  fontSize: '0.53rem',

                  lineHeight: 1.45,
                }}
              >
                No columns match "{searchText}".
                Try another search term.
              </Typography>


              <Button
                size="small"
                onClick={handleClearSearch}
                sx={{
                  mt: 1,

                  color: COLORS.primary,

                  textTransform: 'none',

                  fontSize: '0.56rem',

                  fontWeight: 700,
                }}
              >
                Clear search
              </Button>
            </Box>
          )}
        </Box>


        {/* ====================================================================
            MENU FOOTER
        ==================================================================== */}

        <Divider
          sx={{
            borderColor: COLORS.borderLight,
          }}
        />


        <Box
          sx={{
            px: 1.5,
            py: 1,

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'space-between',

            gap: 1,

            bgcolor: '#FCFDFE',
          }}
        >
          <Typography
            sx={{
              color: COLORS.textMuted,

              fontSize: '0.51rem',
            }}
          >
            Changes apply instantly
          </Typography>


          <Button
            size="small"
            onClick={handleClose}
            sx={{
              minHeight: 29,

              px: 1.2,

              borderRadius: '7px',

              bgcolor: COLORS.navy,

              color: '#FFFFFF',

              textTransform: 'none',

              fontSize: '0.56rem',

              fontWeight: 700,

              '&:hover': {
                bgcolor: '#13213A',
              },
            }}
          >
            Done
          </Button>
        </Box>

      </Menu>

    </Box>
  );
});


/* ============================================================================
   DISPLAY NAME
============================================================================ */

TableToolbar.displayName = 'TableToolbar';


/* ============================================================================
   EXPORT
============================================================================ */

export default TableToolbar;