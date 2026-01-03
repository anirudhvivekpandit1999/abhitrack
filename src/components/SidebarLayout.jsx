import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
    IconButton,
    Fade,
    Tooltip,
    useMediaQuery,
    useTheme,
    alpha,
    CssBaseline
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CalculateIcon from '@mui/icons-material/Calculate';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BarChartIcon from '@mui/icons-material/BarChart';

const SidebarLayout = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [permanentDrawer, setPermanentDrawer] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const menuItems = [
        {
            text: 'Data File Checks',
            icon: <CheckCircleOutlineIcon />,
            path: '/data-file-checks'
        },
        {
            text: 'Calculated Columns Builder',
            icon: <CalculateIcon />,
            path: '/calculated-columns-builder'
        },
        {
            text: 'Dependency Model',
            icon: <AccountTreeIcon />,
            path: '/dependency-model'
        },
        {
            text: 'Visualize Data',
            icon: <BarChartIcon />,
            path: '/visualize-data'
        }
    ];

    const handleOptionClick = useCallback((path) => {
        navigate(path);

        if (isMobile) {
            setOpen(false);
        }
    }, [navigate, isMobile]);

    const togglePermanentDrawer = useCallback(() => {
        setPermanentDrawer(!permanentDrawer);
        setOpen(!permanentDrawer);
    }, [permanentDrawer]);

    const toggleMobileMenu = useCallback(() => {
        setOpen(!open);
    }, [open]);

    const drawerWidth = open || permanentDrawer ? 260 : 80;

    const renderMobileMenuButton = () => (
        <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleMobileMenu}
            sx={{
                position: 'fixed',
                left: 16,
                top: 12,
                zIndex: theme.zIndex.drawer + 2,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
            }}
        >
            <MenuIcon />
        </IconButton>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <CssBaseline />
            {isMobile && renderMobileMenuButton()}

            <Drawer
                variant={isMobile ? "temporary" : (permanentDrawer ? "persistent" : "permanent")}
                open={open}
                onClose={() => setOpen(false)}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        top: '64px',
                        height: 'calc(100% - 64px)',
                        borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: theme.shadows[2],
                        transition: theme.transitions.create(['width'], {
                            easing: theme.transitions.easing.easeInOut,
                            duration: theme.transitions.duration.standard,
                        }),
                        zIndex: theme.zIndex.appBar - 1,
                        overflowX: 'hidden',
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'transparent',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: alpha(theme.palette.primary.main, 0.2),
                            borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            background: alpha(theme.palette.primary.main, 0.3),
                        },
                    },
                }}
                onMouseEnter={() => !permanentDrawer && !isMobile && setOpen(true)}
                onMouseLeave={() => !permanentDrawer && !isMobile && setOpen(false)}
            >
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1,
                    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}>
                    {!isMobile && (
                        <Tooltip title={permanentDrawer ? "Unpin Menu" : "Pin Menu"}>
                            <IconButton
                                onClick={togglePermanentDrawer}
                                color={permanentDrawer ? "primary" : "default"}
                            >
                                {permanentDrawer ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
                <List sx={{ p: 2 }}>
                    <AnimatePresence>
                        {menuItems.map((item, index) => (
                            <motion.div
                                key={item.text}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{
                                    duration: 0.2,
                                    delay: index * 0.05
                                }}
                            >
                                <ListItem
                                    button
                                    onClick={() => handleOptionClick(item.path)}
                                    selected={location.pathname === item.path}
                                    sx={{
                                        borderRadius: '12px',
                                        mb: 1,
                                        p: 1.5,
                                        color: location.pathname === item.path
                                            ? theme.palette.primary.main
                                            : theme.palette.text.secondary,
                                        bgcolor: location.pathname === item.path
                                            ? alpha(theme.palette.primary.main, 0.1)
                                            : 'transparent',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                                            transform: 'translateX(5px)',
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: 'inherit',
                                            minWidth: 40,
                                        },
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Tooltip title={!open && !isMobile ? item.text : ''} placement="right">
                                        <ListItemIcon>{item.icon}</ListItemIcon>
                                    </Tooltip>
                                    <Fade in={open || isMobile} timeout={300}>
                                        <ListItemText
                                            primary={
                                                <Typography
                                                    sx={{
                                                        fontWeight: open ? 600 : 400,
                                                        fontSize: '0.95rem',
                                                        color: location.pathname === item.path
                                                            ? theme.palette.primary.main
                                                            : theme.palette.text.secondary,
                                                        opacity: open || isMobile ? 1 : 0,
                                                        transition: 'all 0.3s ease',
                                                    }}
                                                >
                                                    {item.text}
                                                </Typography>
                                            }
                                        />
                                    </Fade>
                                </ListItem>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </List>
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: theme.palette.background.default,
                    pt: '64px',
                    maxWidth: '100%',
                    width: {
                        xs: '100%',
                        sm: !isMobile
                            ? `calc(100% - ${open || permanentDrawer ? drawerWidth : 80}px)`
                            : '100%'
                    },
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.easeInOut,
                        duration: theme.transitions.duration.standard,
                    }),
                    p: 3
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default SidebarLayout;