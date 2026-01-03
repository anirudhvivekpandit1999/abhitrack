import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Avatar, 
  IconButton, 
  Menu, 
  MenuItem, 
  Divider, 
  Button
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import SavedVisualizationsList from './SavedVisualizationsList';

const Navbar = () => {
    const theme = {
        primaryColor: "rgb(26, 43, 75)",
        fontFamily: "Inter, sans-serif",
        white: "#ffffff",
    };

    const navigate = useNavigate();
    const { user, logout } = useAuth();
    
    const [anchorEl, setAnchorEl] = useState(null);
    const [savedVizOpen, setSavedVizOpen] = useState(false);
    const open = Boolean(anchorEl);
    
    const handleLogoClick = () => {
        navigate('/');
    };
    
    const handleProfileClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => {
        setAnchorEl(null);
    };
    
    const handleLogout = () => {
        logout();
        handleClose();
    };

    return (
        <AppBar position="static" style={{ backgroundColor: theme.white, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <Toolbar style={{ justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                        component="img"
                        src="/abhitech-logo.png"
                        alt="Abhitech Logo"
                        sx={{ height: 32, cursor: 'pointer', marginRight: 2 }}
                        onClick={handleLogoClick}
                    />
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ color: theme.primaryColor, fontFamily: theme.fontFamily }}
                    >
                        Abhitech Statistical Analysis Tool
                    </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        variant="text"
                        onClick={() => navigate('/manual')}
                        sx={{ color: theme.primaryColor, textTransform: 'none', fontWeight: 600 }}
                    >
                        User Manual
                    </Button>
                    {user && (
                        <Button
                            variant="text"
                            onClick={() => setSavedVizOpen(true)}
                            sx={{ color: theme.primaryColor, textTransform: 'none', fontWeight: 600 }}
                        >
                            Saved Visualizations
                        </Button>
                    )}
                {user && (
                    <Box>
                        <IconButton
                            onClick={handleProfileClick}
                            size="small"
                            aria-controls={open ? "profile-menu" : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? "true" : undefined}
                        >
                            <Avatar 
                                sx={{ width: 32, height: 32, bgcolor: theme.primaryColor }}
                                alt={user.name || "User"}
                            >
                                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                            </Avatar>
                        </IconButton>
                        <Menu
                            id="profile-menu"
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            MenuListProps={{
                                'aria-labelledby': 'profile-button',
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            {user.name && [
                                <MenuItem disabled key="signed-in-as">
                                    <Typography variant="body2">
                                        Signed in as <strong>{user.name}</strong>
                                    </Typography>
                                </MenuItem>,
                                <Divider key="divider" />
                            ]}
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </Box>
                )}
                </Box>
            </Toolbar>
            <SavedVisualizationsList 
                open={savedVizOpen} 
                onClose={() => setSavedVizOpen(false)} 
            />
        </AppBar>
    );
};

export default Navbar;