import { createTheme } from '@mui/material';

const customTheme = createTheme({
    palette: {
        primary: {
            main: 'rgb(26, 43, 75)',
            light: 'rgba(26, 43, 75, 0.1)',
            medium: 'rgba(26, 43, 75, 0.5)',
        },
        error: {
            main: 'rgb(220, 38, 38)',
        },
        warning: {
            main: 'rgb(234, 179, 8)',
        },
        success: {
            main: 'rgb(22, 163, 74)',
        },
        background: {
            default: '#ffffff',
            paper: '#ffffff',
            tableHeader: 'rgb(26, 43, 75)',
        },
        text: {
            primary: '#333333',
            secondary: '#666666',
        }
    },
    typography: {
        fontFamily: 'Inter, sans-serif',
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
        subtitle1: {
            fontWeight: 500,
        },
        body1: {
            fontSize: '0.95rem',
        },
        body2: {
            fontSize: '0.875rem',
        },
        caption: {
            fontSize: '0.75rem',
        },
    },
    components: {
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgb(26, 43, 75)',
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    color: '#ffffff',
                    fontWeight: 600,
                }
            }
        }
    }
});

export default customTheme;