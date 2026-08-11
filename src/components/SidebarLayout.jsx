import React, {
  useState,
  useCallback,
  useMemo,
} from 'react';

import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
  alpha,
  CssBaseline,
  Divider,
  Chip,
} from '@mui/material';

import { motion } from 'framer-motion';

import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';




const COLLAPSED_WIDTH = 76;
const EXPANDED_WIDTH = 268;
const NAVBAR_HEIGHT = 64;




const COLORS = {
  navy: '#1A2B4B',
  navyDark: '#13213A',

  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primarySoft: '#EFF6FF',

  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',

  border: '#E2E8F0',
  borderSoft: '#F1F5F9',

  surface: '#FFFFFF',
  background: '#F8FAFC',
  
  purple: '#7C3AED',
  gradientStart: '#6366F1',
  gradientEnd: '#8B5CF6',
};




const MENU_ITEMS = [
  {
    text: 'Data File Checks',
    description: 'Validate uploaded datasets',
    icon: CheckCircleOutlineRoundedIcon,
    path: '/data-file-checks',
  },
  {
    text: 'Calculated Columns',
    description: 'Build calculated variables',
    icon: CalculateOutlinedIcon,
    path: '/calculated-columns-builder',
  },
  {
    text: 'Dependency Model',
    description: 'Analyse variable relationships',
    icon: AccountTreeOutlinedIcon,
    path: '/dependency-model',
  },
  {
    text: 'Visualize Data',
    description: 'Explore charts and insights',
    icon: BarChartRoundedIcon,
    path: '/visualize-data',
  },
];




const SidebarLayout = ({ children }) => {
  const navigate = useNavigateSafe();
  const location = useLocationSafe();

  const theme = useTheme();

  const isMobile = useMediaQuery(
    theme.breakpoints.down('sm')
  );


  

  const [hovered, setHovered] = useState(false);

  const [permanentDrawer, setPermanentDrawer] =
    useState(false);

  const [mobileOpen, setMobileOpen] =
    useState(false);


  

  const expanded =
    isMobile
      ? mobileOpen
      : permanentDrawer || hovered;


  const drawerWidth =
    expanded
      ? EXPANDED_WIDTH
      : COLLAPSED_WIDTH;


  

  const handleOptionClick = useCallback(
    (path) => {
      navigate(path);

      if (isMobile) {
        setMobileOpen(false);
      }
    },
    [navigate, isMobile]
  );


 

  const togglePermanentDrawer = useCallback(() => {
    setPermanentDrawer((previous) => !previous);
  }, []);


  

  const toggleMobileMenu = useCallback(() => {
    setMobileOpen((previous) => !previous);
  }, []);


  

  const activeItem = useMemo(() => {
    return MENU_ITEMS.find(
      (item) =>
        location.pathname === item.path ||
        location.pathname.startsWith(`${item.path}/`)
    );
  }, [location.pathname]);


  

  const drawerContent = (
    <Box
      sx={{
        height: '100%',

        display: 'flex',
        flexDirection: 'column',

        overflow: 'hidden',
      }}
    >

      

      <Box
        sx={{
          height: 70,

          px: expanded ? 2 : 1.25,

          display: 'flex',

          alignItems: 'center',

          justifyContent:
            expanded
              ? 'space-between'
              : 'center',

          flexShrink: 0,

          borderBottom:
            `1px solid ${COLORS.borderSoft}`,

          transition:
            'padding 180ms ease',
        }}
      >


        {expanded ? (
          <Box
            sx={{
              minWidth: 0,

              display: 'flex',

              alignItems: 'center',

              gap: 1.15,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,

                flexShrink: 0,

                display: 'grid',

                placeItems: 'center',

                borderRadius: '10px',

                bgcolor: COLORS.primarySoft,

                color: COLORS.primary,
              }}
            >
              <AnalyticsOutlinedIcon
                sx={{
                  fontSize: 20,
                }}
              />
            </Box>


            <Box
              sx={{
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  color: COLORS.textPrimary,

                  fontSize: '0.75rem',

                  fontWeight: 800,

                  lineHeight: 1.25,

                  letterSpacing: '-0.01em',
                }}
              >
                Analysis Workspace
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,

                  color: COLORS.textMuted,

                  fontSize: '0.55rem',

                  lineHeight: 1.3,
                }}
              >
                Statistical workflow
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              width: 38,
              height: 38,

              display: 'grid',

              placeItems: 'center',

              borderRadius: '10px',

              bgcolor: COLORS.primarySoft,

              color: COLORS.primary,
            }}
          >
            <AnalyticsOutlinedIcon
              sx={{
                fontSize: 20,
              }}
            />
          </Box>
        )}



        {expanded && (
          <>
            {isMobile ? (
              <Tooltip title="Close menu" arrow>
                <IconButton
                  onClick={() => setMobileOpen(false)}
                  size="small"
                  sx={headerButtonSx}
                >
                  <CloseRoundedIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip
                title={
                  permanentDrawer
                    ? 'Unpin sidebar'
                    : 'Pin sidebar'
                }
                arrow
              >
                <IconButton
                  onClick={togglePermanentDrawer}
                  size="small"
                  sx={{
                    ...headerButtonSx,

                    color:
                      permanentDrawer
                        ? COLORS.primary
                        : COLORS.textMuted,

                    bgcolor:
                      permanentDrawer
                        ? COLORS.primarySoft
                        : 'transparent',
                  }}
                >
                  {permanentDrawer ? (
                    <PushPinRoundedIcon />
                  ) : (
                    <PushPinOutlinedIcon />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </>
        )}

      </Box>


      

      <Box
        sx={{
          px: expanded ? 2.1 : 0,
          pt: 2.1,
          pb: 0.8,

          minHeight: 42,

          overflow: 'hidden',
        }}
      >
        {expanded && (
          <Typography
            sx={{
              color: COLORS.textMuted,

              fontSize: '0.55rem',

              fontWeight: 800,

              textTransform: 'uppercase',

              letterSpacing: '0.09em',
            }}
          >
            Workflow
          </Typography>
        )}
      </Box>


      

      <List
        component="nav"
        aria-label="Analysis navigation"
        sx={{
          px: expanded ? 1.25 : 1,
          py: 0,

          display: 'flex',

          flexDirection: 'column',

          gap: 0.55,

          transition:
            'padding 180ms ease',
        }}
      >
        {MENU_ITEMS.map((item, index) => {
          const Icon = item.icon;

          const selected =
            location.pathname === item.path ||
            location.pathname.startsWith(
              `${item.path}/`
            );


          const menuButton = (
            <motion.div
              initial={{
                opacity: 0,
                x: -8,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.2,
                delay: index * 0.035,
              }}
              style={{
                width: '100%',
              }}
            >
              <ListItemButton
                selected={selected}
                onClick={() =>
                  handleOptionClick(item.path)
                }
                aria-current={
                  selected
                    ? 'page'
                    : undefined
                }
                sx={{
                  position: 'relative',

                  minHeight: 52,

                  px:
                    expanded
                      ? 1.25
                      : 0,

                  justifyContent:
                    expanded
                      ? 'flex-start'
                      : 'center',

                  borderRadius: '10px',

                  overflow: 'hidden',

                  color:
                    selected
                      ? COLORS.primary
                      : COLORS.textSecondary,

                  bgcolor:
                    selected
                      ? COLORS.primarySoft
                      : 'transparent',

                  transition:
                    'background-color 150ms ease, color 150ms ease',


                  '&::before': {
                    content: '""',

                    position: 'absolute',

                    left: 0,
                    top: '50%',

                    width: 3,

                    height:
                      selected
                        ? 25
                        : 0,

                    borderRadius:
                      '0 4px 4px 0',

                    bgcolor: COLORS.primary,

                    transform:
                      'translateY(-50%)',

                    transition:
                      'height 160ms ease',
                  },

                  '&:hover': {
                    bgcolor:
                      selected
                        ? COLORS.primarySoft
                        : '#F8FAFC',

                    color:
                      selected
                        ? COLORS.primary
                        : COLORS.navy,
                  },

                  '&.Mui-selected': {
                    bgcolor: COLORS.primarySoft,

                    '&:hover': {
                      bgcolor: '#E7F0FF',
                    },
                  },
                }}
              >

                

                <ListItemIcon
                  sx={{
                    minWidth:
                      expanded
                        ? 39
                        : 0,

                    width:
                      expanded
                        ? 'auto'
                        : 38,

                    height: 38,

                    display: 'grid',

                    placeItems: 'center',

                    color: 'inherit',

                    borderRadius: '9px',

                    transition:
                      'all 180ms ease',
                  }}
                >
                  <Icon
                    sx={{
                      fontSize: 20,
                    }}
                  />
                </ListItemIcon>


                

                {expanded && (
                  <ListItemText
                    sx={{
                      my: 0,

                      minWidth: 0,
                    }}
                    primary={
                      <Typography
                        noWrap
                        sx={{
                          color: 'inherit',

                          fontSize: '0.68rem',

                          fontWeight:
                            selected
                              ? 750
                              : 650,

                          lineHeight: 1.3,
                        }}
                      >
                        {item.text}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        noWrap
                        sx={{
                          mt: 0.18,

                          color:
                            selected
                              ? alpha(
                                  COLORS.primary,
                                  0.68
                                )
                              : COLORS.textMuted,

                          fontSize: '0.51rem',

                          lineHeight: 1.3,
                        }}
                      >
                        {item.description}
                      </Typography>
                    }
                  />
                )}


                

                {expanded && selected && (
                  <ChevronRightRoundedIcon
                    sx={{
                      ml: 0.5,

                      flexShrink: 0,

                      color: COLORS.primary,

                      fontSize: 17,
                    }}
                  />
                )}

              </ListItemButton>
            </motion.div>
          );



          if (!expanded && !isMobile) {
            return (
              <Tooltip
                key={item.path}
                title={
                  <Box
                    sx={{
                      py: 0.3,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.66rem',

                        fontWeight: 700,
                      }}
                    >
                      {item.text}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.15,

                        fontSize: '0.52rem',

                        opacity: 0.8,
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Box>
                }
                placement="right"
                arrow
              >
                <Box>
                  {menuButton}
                </Box>
              </Tooltip>
            );
          }


          return (
            <Box key={item.path}>
              {menuButton}
            </Box>
          );
        })}
      </List>


      

      <Box sx={{ flex: 1 }} />


      

      {expanded && activeItem && (
        <Box
          sx={{
            px: 1.5,
            pb: 1.5,
          }}
        >
          <Divider
            sx={{
              mb: 1.5,

              borderColor: COLORS.borderSoft,
            }}
          />

          <Box
            sx={{
              p: 1.25,

              border:
                `1px solid ${COLORS.border}`,

              borderRadius: '10px',

              bgcolor: COLORS.background,
            }}
          >
            <Typography
              sx={{
                color: COLORS.textMuted,

                fontSize: '0.5rem',

                fontWeight: 750,

                textTransform: 'uppercase',

                letterSpacing: '0.07em',
              }}
            >
              Current Step
            </Typography>

            <Box
              sx={{
                mt: 0.65,

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'space-between',

                gap: 1,
              }}
            >
              <Typography
                noWrap
                sx={{
                  color: COLORS.textPrimary,

                  fontSize: '0.62rem',

                  fontWeight: 700,
                }}
              >
                {activeItem.text}
              </Typography>

              <Chip
                label={
                  MENU_ITEMS.findIndex(
                    (item) =>
                      item.path ===
                      activeItem.path
                  ) + 1
                }
                size="small"
                sx={{
                  width: 23,
                  height: 23,

                  flexShrink: 0,

                  bgcolor: COLORS.primarySoft,

                  color: COLORS.primary,

                  fontSize: '0.52rem',

                  fontWeight: 800,

                  '& .MuiChip-label': {
                    px: 0,
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
      )}


      

      {!expanded && !isMobile && (
        <Box
          sx={{
            px: 1,
            pb: 1.5,

            display: 'flex',

            justifyContent: 'center',
          }}
        >
          <Tooltip
            title="Pin sidebar"
            placement="right"
            arrow
          >
            <IconButton
              onClick={togglePermanentDrawer}
              sx={{
                width: 38,
                height: 38,

                borderRadius: '9px',

                color: COLORS.textMuted,

                '&:hover': {
                  bgcolor: COLORS.primarySoft,

                  color: COLORS.primary,
                },
              }}
            >
              <PushPinOutlinedIcon
                sx={{
                  fontSize: 18,
                }}
              />
            </IconButton>
          </Tooltip>
        </Box>
      )}

    </Box>
  );


  

  return (
    <Box
      sx={{
        display: 'flex',

        minHeight: '100vh',

        bgcolor: COLORS.background,
      }}
    >
      <CssBaseline />


      

      {isMobile && !mobileOpen && (
        <Tooltip
          title="Open navigation"
          arrow
        >
          <IconButton
            onClick={toggleMobileMenu}
            aria-label="Open navigation"
            sx={{
              position: 'fixed',

              top: NAVBAR_HEIGHT + 12,
              left: 14,

              zIndex:
                theme.zIndex.drawer + 2,

              width: 42,
              height: 42,

              border:
                `1px solid ${COLORS.border}`,

              borderRadius: '10px',

              bgcolor: COLORS.surface,

              color: COLORS.navy,

              boxShadow:
                '0 5px 15px rgba(15,23,42,0.10)',

              '&:hover': {
                bgcolor: COLORS.primarySoft,

                color: COLORS.primary,
              },
            }}
          >
            <MenuRoundedIcon />
          </IconButton>
        </Tooltip>
      )}


      

      <Drawer
        variant={
          isMobile
            ? 'temporary'
            : 'permanent'
        }
        open={
          isMobile
            ? mobileOpen
            : true
        }
        onClose={() =>
          setMobileOpen(false)
        }
        ModalProps={{
          keepMounted: true,
        }}
        onMouseEnter={() => {
          if (
            !isMobile &&
            !permanentDrawer
          ) {
            setHovered(true);
          }
        }}
        onMouseLeave={() => {
          if (
            !isMobile &&
            !permanentDrawer
          ) {
            setHovered(false);
          }
        }}
        sx={{
          width:
            isMobile
              ? EXPANDED_WIDTH
              : drawerWidth,

          flexShrink: 0,

          transition:
            'width 200ms cubic-bezier(0.4, 0, 0.2, 1)',

          '& .MuiDrawer-paper': {
            width:
              isMobile
                ? EXPANDED_WIDTH
                : drawerWidth,

            top:
              isMobile
                ? 0
                : `${NAVBAR_HEIGHT}px`,

            height:
              isMobile
                ? '100%'
                : `calc(100% - ${NAVBAR_HEIGHT}px)`,

            boxSizing: 'border-box',

            overflowX: 'hidden',

            overflowY: 'hidden',

            borderRight:
              `1px solid ${COLORS.border}`,

            bgcolor: COLORS.surface,

            backgroundImage: 'none',

            boxShadow:
              isMobile
                ? '8px 0 30px rgba(15,23,42,0.14)'
                : '2px 0 10px rgba(15,23,42,0.025)',

            transition:
              'width 200ms cubic-bezier(0.4, 0, 0.2, 1)',

            zIndex:
              isMobile
                ? theme.zIndex.drawer
                : theme.zIndex.appBar - 1,
          },
        }}
      >
        {drawerContent}
      </Drawer>


      

      <Box
        component="main"
        sx={{
          flexGrow: 1,

          minWidth: 0,

          minHeight: '100vh',

          pt:
            `${NAVBAR_HEIGHT}px`,

          bgcolor: COLORS.background,

          transition:
            'margin 200ms cubic-bezier(0.4, 0, 0.2, 1)',

          overflowX: 'hidden',
        }}
      >
        <Box
          sx={{
            width: '100%',

            p: {
              xs: 2,
              sm: 2.5,
              md: 3,
            },

            pt: {
              xs: 3,
              sm: 2.5,
              md: 3,
            },
          }}
        >
          {children}
        </Box>
      </Box>

    </Box>
  );
};




import {
  useNavigate,
  useLocation,
} from 'react-router-dom';


const useNavigateSafe = () => {
  return useNavigate();
};


const useLocationSafe = () => {
  return useLocation();
};




const headerButtonSx = {
  width: 32,
  height: 32,

  flexShrink: 0,

  borderRadius: '8px',

  color: COLORS.textMuted,

  '& svg': {
    fontSize: 17,
  },

  '&:hover': {
    bgcolor: COLORS.primarySoft,

    color: COLORS.primary,
  },
};




export default SidebarLayout;