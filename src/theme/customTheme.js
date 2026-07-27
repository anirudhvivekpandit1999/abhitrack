import { alpha, createTheme } from '@mui/material/styles';

const NAVY = '#1A2B4B';
const NAVY_DARK = '#101C33';
const NAVY_LIGHT = '#314A73';

const customTheme = createTheme({
    palette: {
        mode: 'light',

        primary: {
            main: NAVY,
            light: NAVY_LIGHT,
            dark: NAVY_DARK,
            contrastText: '#FFFFFF',
        },

        secondary: {
            main: '#475569',
            light: '#64748B',
            dark: '#334155',
            contrastText: '#FFFFFF',
        },

        error: {
            main: '#DC2626',
            light: '#FEE2E2',
            dark: '#B91C1C',
        },

        warning: {
            main: '#EAB308',
            light: '#FEF9C3',
            dark: '#CA8A04',
        },

        success: {
            main: '#16A34A',
            light: '#DCFCE7',
            dark: '#15803D',
        },

        info: {
            main: '#0284C7',
            light: '#E0F2FE',
            dark: '#0369A1',
        },

        background: {
            default: '#F6F8FB',
            paper: '#FFFFFF',
            tableHeader: NAVY,
        },

        text: {
            primary: '#1E293B',
            secondary: '#64748B',
            disabled: '#94A3B8',
        },

        divider: '#E2E8F0',

        action: {
            hover: alpha(NAVY, 0.05),
            selected: alpha(NAVY, 0.08),
            focus: alpha(NAVY, 0.12),
            disabled: '#CBD5E1',
            disabledBackground: '#F1F5F9',
        },
    },

    shape: {
        borderRadius: 10,
    },

    typography: {
        fontFamily: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),

        h1: {
            fontWeight: 700,
            letterSpacing: '-0.03em',
        },

        h2: {
            fontWeight: 700,
            letterSpacing: '-0.025em',
        },

        h3: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },

        h4: {
            fontWeight: 700,
            letterSpacing: '-0.015em',
        },

        h5: {
            fontWeight: 700,
            letterSpacing: '-0.01em',
        },

        h6: {
            fontWeight: 600,
            letterSpacing: '-0.005em',
        },

        subtitle1: {
            fontWeight: 600,
        },

        subtitle2: {
            fontWeight: 600,
        },

        body1: {
            fontSize: '0.95rem',
            lineHeight: 1.6,
        },

        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.55,
        },

        button: {
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'none',
            letterSpacing: 0,
        },

        caption: {
            fontSize: '0.75rem',
            color: '#64748B',
        },

        overline: {
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
        },
    },

    shadows: [
        'none',
        '0 1px 2px rgba(15, 23, 42, 0.04)',
        '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
        '0 4px 6px -1px rgba(15, 23, 42, 0.06)',
        '0 6px 12px -2px rgba(15, 23, 42, 0.07)',
        '0 8px 16px -4px rgba(15, 23, 42, 0.08)',
        '0 10px 20px -5px rgba(15, 23, 42, 0.09)',
        '0 12px 24px -6px rgba(15, 23, 42, 0.10)',
        '0 14px 28px -7px rgba(15, 23, 42, 0.11)',
        '0 16px 32px -8px rgba(15, 23, 42, 0.12)',
        '0 18px 36px -9px rgba(15, 23, 42, 0.13)',
        '0 20px 40px -10px rgba(15, 23, 42, 0.14)',
        '0 22px 44px -11px rgba(15, 23, 42, 0.15)',
        '0 24px 48px -12px rgba(15, 23, 42, 0.16)',
        '0 26px 52px -13px rgba(15, 23, 42, 0.17)',
        '0 28px 56px -14px rgba(15, 23, 42, 0.18)',
        '0 30px 60px -15px rgba(15, 23, 42, 0.19)',
        '0 32px 64px -16px rgba(15, 23, 42, 0.20)',
        '0 34px 68px -17px rgba(15, 23, 42, 0.21)',
        '0 36px 72px -18px rgba(15, 23, 42, 0.22)',
        '0 38px 76px -19px rgba(15, 23, 42, 0.23)',
        '0 40px 80px -20px rgba(15, 23, 42, 0.24)',
        '0 42px 84px -21px rgba(15, 23, 42, 0.25)',
        '0 44px 88px -22px rgba(15, 23, 42, 0.26)',
        '0 46px 92px -23px rgba(15, 23, 42, 0.27)',
    ],

    components: {
        // ------------------------------------------------
        // CSS RESET / GLOBAL
        // ------------------------------------------------
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#F6F8FB',
                    color: '#1E293B',
                    scrollbarColor: '#CBD5E1 transparent',

                    '&::-webkit-scrollbar': {
                        width: 8,
                        height: 8,
                    },

                    '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },

                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#CBD5E1',
                        borderRadius: 20,
                    },

                    '&::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: '#94A3B8',
                    },
                },

                '*': {
                    boxSizing: 'border-box',
                },

                '::selection': {
                    backgroundColor: alpha(NAVY, 0.18),
                },
            },
        },

        // ------------------------------------------------
        // PAPER
        // ------------------------------------------------
        MuiPaper: {
            defaultProps: {
                elevation: 0,
            },

            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },

                rounded: {
                    borderRadius: 12,
                },
            },
        },

        // ------------------------------------------------
        // CARD
        // ------------------------------------------------
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 14,
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                    backgroundImage: 'none',
                    transition:
                        'box-shadow 180ms ease, transform 180ms ease, border-color 180ms ease',

                    '&:hover': {
                        borderColor: '#CBD5E1',
                        boxShadow: '0 6px 18px rgba(15, 23, 42, 0.07)',
                    },
                },
            },
        },

        MuiCardHeader: {
            styleOverrides: {
                root: {
                    padding: '20px 20px 12px',
                },

                title: {
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#1E293B',
                },

                subheader: {
                    marginTop: 3,
                    fontSize: '0.8rem',
                    color: '#64748B',
                },
            },
        },

        MuiCardContent: {
            styleOverrides: {
                root: {
                    padding: 20,

                    '&:last-child': {
                        paddingBottom: 20,
                    },
                },
            },
        },

        MuiCardActions: {
            styleOverrides: {
                root: {
                    padding: '12px 20px 20px',
                },
            },
        },

        // ------------------------------------------------
        // BUTTONS
        // ------------------------------------------------
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },

            styleOverrides: {
                root: {
                    minHeight: 38,
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontWeight: 600,
                    textTransform: 'none',
                    transition:
                        'background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease, transform 120ms ease',

                    '&:active': {
                        transform: 'translateY(1px)',
                    },
                },

                containedPrimary: {
                    backgroundColor: NAVY,
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.12)',

                    '&:hover': {
                        backgroundColor: NAVY_DARK,
                        boxShadow: '0 4px 10px rgba(26, 43, 75, 0.20)',
                    },
                },

                outlinedPrimary: {
                    borderColor: '#CBD5E1',
                    color: NAVY,
                    backgroundColor: '#FFFFFF',

                    '&:hover': {
                        borderColor: NAVY,
                        backgroundColor: alpha(NAVY, 0.04),
                    },
                },

                textPrimary: {
                    '&:hover': {
                        backgroundColor: alpha(NAVY, 0.06),
                    },
                },

                sizeSmall: {
                    minHeight: 32,
                    padding: '5px 12px',
                    fontSize: '0.8rem',
                },

                sizeLarge: {
                    minHeight: 44,
                    padding: '10px 20px',
                    fontSize: '0.95rem',
                },
            },
        },

        // ------------------------------------------------
        // ICON BUTTON
        // ------------------------------------------------
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    transition:
                        'background-color 150ms ease, color 150ms ease',

                    '&:hover': {
                        backgroundColor: alpha(NAVY, 0.07),
                    },
                },
            },
        },

        // ------------------------------------------------
        // INPUTS
        // ------------------------------------------------
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    transition:
                        'box-shadow 160ms ease, background-color 160ms ease',

                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#CBD5E1',
                    },

                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#94A3B8',
                    },

                    '&.Mui-focused': {
                        boxShadow: `0 0 0 3px ${alpha(NAVY, 0.10)}`,
                    },

                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: NAVY,
                        borderWidth: 1.5,
                    },

                    '&.Mui-error': {
                        boxShadow: 'none',
                    },

                    '&.Mui-disabled': {
                        backgroundColor: '#F8FAFC',
                    },
                },

                input: {
                    padding: '11px 14px',
                    fontSize: '0.875rem',

                    '&::placeholder': {
                        color: '#94A3B8',
                        opacity: 1,
                    },
                },
            },
        },

        MuiInputLabel: {
            styleOverrides: {
                root: {
                    fontSize: '0.875rem',
                    color: '#64748B',

                    '&.Mui-focused': {
                        color: NAVY,
                    },
                },
            },
        },

        MuiFormHelperText: {
            styleOverrides: {
                root: {
                    marginLeft: 2,
                    marginTop: 5,
                    fontSize: '0.72rem',
                },
            },
        },

        MuiSelect: {
            styleOverrides: {
                select: {
                    fontSize: '0.875rem',
                },
            },
        },

        // ------------------------------------------------
        // TABLE
        // ------------------------------------------------
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    border: '1px solid #E2E8F0',
                    overflow: 'auto',
                    backgroundColor: '#FFFFFF',
                },
            },
        },

        MuiTable: {
            styleOverrides: {
                root: {
                    borderCollapse: 'separate',
                    borderSpacing: 0,
                },
            },
        },

        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: NAVY,

                    '& .MuiTableCell-root:first-of-type': {
                        borderTopLeftRadius: 8,
                    },

                    '& .MuiTableCell-root:last-of-type': {
                        borderTopRightRadius: 8,
                    },
                },
            },
        },

        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid #E2E8F0',
                    padding: '11px 14px',
                    fontSize: '0.82rem',
                },

                head: {
                    color: '#FFFFFF',
                    backgroundColor: NAVY,
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    letterSpacing: '0.015em',
                    whiteSpace: 'nowrap',
                    borderBottom: 'none',
                },

                body: {
                    color: '#334155',
                },
            },
        },

        MuiTableRow: {
            styleOverrides: {
                root: {
                    transition: 'background-color 120ms ease',

                    '&:last-child .MuiTableCell-body': {
                        borderBottom: 0,
                    },

                    '&:hover': {
                        backgroundColor: '#F8FAFC',
                    },

                    '&.Mui-selected': {
                        backgroundColor: alpha(NAVY, 0.06),

                        '&:hover': {
                            backgroundColor: alpha(NAVY, 0.09),
                        },
                    },
                },
            },
        },

        // ------------------------------------------------
        // CHIP
        // ------------------------------------------------
        MuiChip: {
            styleOverrides: {
                root: {
                    height: 28,
                    borderRadius: 7,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                },

                filledPrimary: {
                    backgroundColor: alpha(NAVY, 0.1),
                    color: NAVY,

                    '&:hover': {
                        backgroundColor: alpha(NAVY, 0.15),
                    },
                },

                outlined: {
                    borderColor: '#CBD5E1',
                },
            },
        },

        // ------------------------------------------------
        // TABS
        // ------------------------------------------------
        MuiTabs: {
            styleOverrides: {
                root: {
                    minHeight: 44,
                    borderBottom: '1px solid #E2E8F0',
                },

                indicator: {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                },
            },
        },

        MuiTab: {
            styleOverrides: {
                root: {
                    minHeight: 44,
                    minWidth: 80,
                    padding: '10px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    color: '#64748B',

                    '&.Mui-selected': {
                        color: NAVY,
                    },
                },
            },
        },

        // ------------------------------------------------
        // DIALOG / MODAL
        // ------------------------------------------------
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 24px 64px rgba(15, 23, 42, 0.16)',
                },
            },
        },

        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    padding: '20px 24px 14px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#1E293B',
                },
            },
        },

        MuiDialogContent: {
            styleOverrides: {
                root: {
                    padding: '12px 24px 20px',
                },
            },
        },

        MuiDialogActions: {
            styleOverrides: {
                root: {
                    padding: '14px 24px 20px',
                    gap: 8,
                    borderTop: '1px solid #F1F5F9',
                },
            },
        },

        // ------------------------------------------------
        // MENU
        // ------------------------------------------------
        MuiMenu: {
            styleOverrides: {
                paper: {
                    marginTop: 6,
                    borderRadius: 10,
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
                },
            },
        },

        MuiMenuItem: {
            styleOverrides: {
                root: {
                    minHeight: 38,
                    margin: '2px 5px',
                    padding: '7px 10px',
                    borderRadius: 6,
                    fontSize: '0.85rem',

                    '&:hover': {
                        backgroundColor: alpha(NAVY, 0.06),
                    },

                    '&.Mui-selected': {
                        backgroundColor: alpha(NAVY, 0.08),

                        '&:hover': {
                            backgroundColor: alpha(NAVY, 0.11),
                        },
                    },
                },
            },
        },

        // ------------------------------------------------
        // TOOLTIP
        // ------------------------------------------------
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    padding: '7px 10px',
                    borderRadius: 6,
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.18)',
                },

                arrow: {
                    color: '#0F172A',
                },
            },
        },

        // ------------------------------------------------
        // ALERT
        // ------------------------------------------------
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    fontSize: '0.85rem',
                    alignItems: 'center',
                },

                standardSuccess: {
                    backgroundColor: '#F0FDF4',
                    color: '#166534',
                },

                standardError: {
                    backgroundColor: '#FEF2F2',
                    color: '#991B1B',
                },

                standardWarning: {
                    backgroundColor: '#FEFCE8',
                    color: '#854D0E',
                },

                standardInfo: {
                    backgroundColor: '#F0F9FF',
                    color: '#075985',
                },
            },
        },

        // ------------------------------------------------
        // CHECKBOX / RADIO
        // ------------------------------------------------
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    padding: 7,

                    '&.Mui-checked': {
                        color: NAVY,
                    },
                },
            },
        },

        MuiRadio: {
            styleOverrides: {
                root: {
                    padding: 7,

                    '&.Mui-checked': {
                        color: NAVY,
                    },
                },
            },
        },

        MuiSwitch: {
            styleOverrides: {
                switchBase: {
                    '&.Mui-checked': {
                        color: NAVY,

                        '& + .MuiSwitch-track': {
                            backgroundColor: NAVY,
                            opacity: 1,
                        },
                    },
                },

                track: {
                    backgroundColor: '#CBD5E1',
                    opacity: 1,
                },
            },
        },

        // ------------------------------------------------
        // DIVIDER
        // ------------------------------------------------
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: '#E2E8F0',
                },
            },
        },

        // ------------------------------------------------
        // ACCORDION
        // ------------------------------------------------
        MuiAccordion: {
            defaultProps: {
                disableGutters: true,
                elevation: 0,
            },

            styleOverrides: {
                root: {
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px !important',
                    overflow: 'hidden',

                    '&:before': {
                        display: 'none',
                    },

                    '& + &': {
                        marginTop: 10,
                    },
                },
            },
        },

        MuiAccordionSummary: {
            styleOverrides: {
                root: {
                    minHeight: 48,
                    padding: '0 16px',

                    '&:hover': {
                        backgroundColor: '#F8FAFC',
                    },

                    '&.Mui-expanded': {
                        minHeight: 48,
                    },
                },

                content: {
                    margin: '12px 0',

                    '&.Mui-expanded': {
                        margin: '12px 0',
                    },
                },
            },
        },

        MuiAccordionDetails: {
            styleOverrides: {
                root: {
                    padding: '4px 16px 16px',
                },
            },
        },

        // ------------------------------------------------
        // PROGRESS
        // ------------------------------------------------
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    height: 6,
                    borderRadius: 999,
                    backgroundColor: '#E2E8F0',
                },

                bar: {
                    borderRadius: 999,
                },
            },
        },

        // ------------------------------------------------
        // PAGINATION
        // ------------------------------------------------
        MuiPaginationItem: {
            styleOverrides: {
                root: {
                    borderRadius: 7,
                    fontSize: '0.8rem',

                    '&.Mui-selected': {
                        backgroundColor: NAVY,
                        color: '#FFFFFF',

                        '&:hover': {
                            backgroundColor: NAVY_DARK,
                        },
                    },
                },
            },
        },

        // ------------------------------------------------
        // SKELETON
        // ------------------------------------------------
        MuiSkeleton: {
            styleOverrides: {
                root: {
                    backgroundColor: '#E9EEF5',
                    borderRadius: 6,
                },
            },
        },

        // ------------------------------------------------
        // BADGE
        // ------------------------------------------------
        MuiBadge: {
            styleOverrides: {
                badge: {
                    fontWeight: 700,
                    fontSize: '0.65rem',
                },
            },
        },

        // ------------------------------------------------
        // APP BAR
        // ------------------------------------------------
        MuiAppBar: {
            defaultProps: {
                elevation: 0,
            },

            styleOverrides: {
                root: {
                    backgroundColor: '#FFFFFF',
                    color: '#1E293B',
                    backgroundImage: 'none',
                    borderBottom: '1px solid #E2E8F0',
                },
            },
        },

        // ------------------------------------------------
        // DRAWER
        // ------------------------------------------------
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRight: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                },
            },
        },

        // ------------------------------------------------
        // LIST ITEMS
        // ------------------------------------------------
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    margin: '2px 8px',
                    borderRadius: 8,
                    color: '#475569',

                    '&:hover': {
                        backgroundColor: alpha(NAVY, 0.05),
                        color: NAVY,
                    },

                    '&.Mui-selected': {
                        backgroundColor: alpha(NAVY, 0.08),
                        color: NAVY,

                        '&:hover': {
                            backgroundColor: alpha(NAVY, 0.11),
                        },

                        '& .MuiListItemIcon-root': {
                            color: NAVY,
                        },
                    },
                },
            },
        },

        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    minWidth: 38,
                    color: '#64748B',
                },
            },
        },

        MuiListItemText: {
            styleOverrides: {
                primary: {
                    fontSize: '0.875rem',
                    fontWeight: 500,
                },
            },
        },
    },
});

export default customTheme;