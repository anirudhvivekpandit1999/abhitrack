import React from 'react';

import {
  Dialog,
  DialogContent,
  Button,
  Typography,
  Box,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';

import logo from '../assets/main-logo.png';


/* ============================================================================
   DESIGN TOKENS
============================================================================ */

const COLORS = {
  navy: '#1A2B4B',
  navyDark: '#13213A',

  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primarySoft: '#EFF6FF',

  success: '#059669',
  successSoft: '#ECFDF5',

  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',

  border: '#E2E8F0',
  borderSoft: '#F1F5F9',

  surface: '#FFFFFF',
  background: '#F8FAFC',
};


/* ============================================================================
   BETA BENEFITS
============================================================================ */

const BETA_BENEFITS = [
  {
    icon: BoltRoundedIcon,
    title: 'Early Access',
    description:
      'Explore new analysis features before their general release.',
  },
  {
    icon: ForumOutlinedIcon,
    title: 'Direct Feedback',
    description:
      'Share feedback directly with the development team.',
  },
  {
    icon: SupportAgentOutlinedIcon,
    title: 'Priority Support',
    description:
      'Get faster assistance while testing the platform.',
  },
  {
    icon: AutoGraphRoundedIcon,
    title: 'Shape AbhiStat',
    description:
      'Your experience helps guide future product development.',
  },
];


/* ============================================================================
   WELCOME MODAL
============================================================================ */

const WelcomeModal = ({
  open,
  onClose,
}) => {

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth

      aria-labelledby="abhistat-welcome-title"
      aria-describedby="abhistat-welcome-description"

      PaperProps={{
        sx: {
          width: '100%',

          maxWidth: 620,

          m: {
            xs: 1.5,
            sm: 3,
          },

          borderRadius: {
            xs: '16px',
            sm: '20px',
          },

          overflow: 'hidden',

          border:
            `1px solid ${COLORS.border}`,

          bgcolor: COLORS.surface,

          backgroundImage: 'none',

          boxShadow:
            '0 24px 65px rgba(15, 23, 42, 0.18)',
        },
      }}

      slotProps={{
        backdrop: {
          sx: {
            bgcolor:
              'rgba(15, 23, 42, 0.52)',

            backdropFilter: 'blur(3px)',
          },
        },
      }}
    >

      {/* ======================================================================
          TOP ACCENT
      ====================================================================== */}

      <Box
        sx={{
          height: 4,

          background:
            `linear-gradient(
              90deg,
              ${COLORS.primary} 0%,
              #3B82F6 55%,
              #60A5FA 100%
            )`,
        }}
      />


      {/* ======================================================================
          CLOSE BUTTON
      ====================================================================== */}

      <IconButton
        onClick={onClose}
        aria-label="Close welcome dialog"
        sx={{
          position: 'absolute',

          top: 16,
          right: 16,

          zIndex: 2,

          width: 34,
          height: 34,

          border:
            `1px solid ${COLORS.border}`,

          borderRadius: '9px',

          bgcolor: COLORS.surface,

          color: COLORS.textSecondary,

          transition:
            'background-color 150ms ease, color 150ms ease',

          '&:hover': {
            bgcolor: COLORS.background,

            color: COLORS.textPrimary,
          },

          '& svg': {
            fontSize: 18,
          },
        }}
      >
        <CloseRoundedIcon />
      </IconButton>


      <DialogContent
        sx={{
          p: {
            xs: 2.5,
            sm: 4,
          },

          pt: {
            xs: 3,
            sm: 3.5,
          },
        }}
      >

        {/* ====================================================================
            BRAND
        ==================================================================== */}

        <Box
          sx={{
            display: 'flex',

            alignItems: 'center',

            justifyContent: 'space-between',

            pr: 5,

            mb: 3,
          }}
        >

          <Box
            component="img"
            src={logo}
            alt="Abhitech"
            sx={{
              display: 'block',

              maxWidth: 145,
              maxHeight: 42,

              objectFit: 'contain',
              objectPosition: 'left center',
            }}
          />


          <Chip
            icon={
              <ScienceOutlinedIcon />
            }
            label="BETA"
            size="small"
            sx={{
              height: 27,

              border:
                '1px solid #BFDBFE',

              bgcolor: COLORS.primarySoft,

              color: COLORS.primary,

              fontSize: '0.57rem',

              fontWeight: 800,

              letterSpacing: '0.06em',

              '& .MuiChip-icon': {
                ml: 0.8,

                color: COLORS.primary,

                fontSize: 15,
              },

              '& .MuiChip-label': {
                px: 0.9,
              },
            }}
          />

        </Box>


        {/* ====================================================================
            INTRODUCTION
        ==================================================================== */}

        <Box
          sx={{
            mb: 3.2,
          }}
        >

          <Typography
            id="abhistat-welcome-title"
            component="h1"
            sx={{
              color: COLORS.navy,

              fontFamily:
                "'Poppins', 'Inter', sans-serif",

              fontSize: {
                xs: '1.55rem',
                sm: '1.85rem',
              },

              fontWeight: 750,

              lineHeight: 1.2,

              letterSpacing: '-0.035em',
            }}
          >
            Welcome to AbhiStat
          </Typography>


          <Typography
            sx={{
              mt: 0.7,

              color: COLORS.primary,

              fontFamily:
                "'Inter', sans-serif",

              fontSize: '0.69rem',

              fontWeight: 750,

              letterSpacing: '0.01em',
            }}
          >
            Statistical Analysis Platform · Beta
          </Typography>


          <Typography
            id="abhistat-welcome-description"
            sx={{
              mt: 1.5,

              maxWidth: 520,

              color: COLORS.textSecondary,

              fontFamily:
                "'Inter', sans-serif",

              fontSize: {
                xs: '0.77rem',
                sm: '0.8rem',
              },

              lineHeight: 1.7,
            }}
          >
            You're among the first users to experience
            AbhiStat. Explore the platform, test its
            statistical analysis workflows, and share
            your feedback as we continue improving the
            product.
          </Typography>

        </Box>


        {/* ====================================================================
            BETA BENEFITS
        ==================================================================== */}

        <Box
          sx={{
            mb: 3,
          }}
        >

          <Typography
            sx={{
              mb: 1.25,

              color: COLORS.textMuted,

              fontFamily:
                "'Inter', sans-serif",

              fontSize: '0.57rem',

              fontWeight: 800,

              textTransform: 'uppercase',

              letterSpacing: '0.09em',
            }}
          >
            Your Beta Access
          </Typography>


          <Box
            sx={{
              display: 'grid',

              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
              },

              gap: 1.1,
            }}
          >

            {BETA_BENEFITS.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <Box
                  key={benefit.title}
                  sx={{
                    p: 1.5,

                    display: 'flex',

                    alignItems: 'flex-start',

                    gap: 1.15,

                    border:
                      `1px solid ${COLORS.border}`,

                    borderRadius: '11px',

                    bgcolor: COLORS.surface,

                    transition:
                      'border-color 150ms ease, background-color 150ms ease, transform 150ms ease',

                    '&:hover': {
                      borderColor: '#BFDBFE',

                      bgcolor: '#FBFDFF',

                      transform:
                        'translateY(-1px)',
                    },
                  }}
                >

                  {/* ICON */}

                  <Box
                    sx={{
                      width: 34,
                      height: 34,

                      flexShrink: 0,

                      display: 'grid',

                      placeItems: 'center',

                      borderRadius: '9px',

                      bgcolor: COLORS.primarySoft,

                      color: COLORS.primary,
                    }}
                  >
                    <Icon
                      sx={{
                        fontSize: 17,
                      }}
                    />
                  </Box>


                  {/* TEXT */}

                  <Box
                    sx={{
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        color: COLORS.textPrimary,

                        fontFamily:
                          "'Inter', sans-serif",

                        fontSize: '0.66rem',

                        fontWeight: 750,

                        lineHeight: 1.35,
                      }}
                    >
                      {benefit.title}
                    </Typography>


                    <Typography
                      sx={{
                        mt: 0.25,

                        color: COLORS.textMuted,

                        fontFamily:
                          "'Inter', sans-serif",

                        fontSize: '0.54rem',

                        lineHeight: 1.45,
                      }}
                    >
                      {benefit.description}
                    </Typography>
                  </Box>

                </Box>
              );
            })}

          </Box>

        </Box>


        {/* ====================================================================
            GET STARTED PANEL
        ==================================================================== */}

        <Box
          sx={{
            p: {
              xs: 1.5,
              sm: 1.7,
            },

            display: 'flex',

            flexDirection: {
              xs: 'column',
              sm: 'row',
            },

            alignItems: {
              xs: 'flex-start',
              sm: 'center',
            },

            gap: 1.4,

            border:
              '1px solid #D1FAE5',

            borderRadius: '12px',

            bgcolor: COLORS.successSoft,
          }}
        >

          <Box
            sx={{
              width: 38,
              height: 38,

              flexShrink: 0,

              display: 'grid',

              placeItems: 'center',

              borderRadius: '10px',

              bgcolor: '#D1FAE5',

              color: COLORS.success,
            }}
          >
            <UploadFileOutlinedIcon
              sx={{
                fontSize: 19,
              }}
            />
          </Box>


          <Box>
            <Typography
              sx={{
                color: '#065F46',

                fontFamily:
                  "'Inter', sans-serif",

                fontSize: '0.67rem',

                fontWeight: 750,
              }}
            >
              Ready to begin?
            </Typography>


            <Typography
              sx={{
                mt: 0.25,

                color: '#047857',

                fontFamily:
                  "'Inter', sans-serif",

                fontSize: '0.56rem',

                lineHeight: 1.5,
              }}
            >
              Start by uploading your datasets. AbhiStat
              will guide you through validation, calculated
              columns, dependency analysis, and
              visualization.
            </Typography>
          </Box>

        </Box>


        {/* ====================================================================
            FOOTER / ACTION
        ==================================================================== */}

        <Box
          sx={{
            mt: 3,

            pt: 2.4,

            display: 'flex',

            flexDirection: {
              xs: 'column-reverse',
              sm: 'row',
            },

            alignItems: {
              xs: 'stretch',
              sm: 'center',
            },

            justifyContent: 'space-between',

            gap: 1.5,

            borderTop:
              `1px solid ${COLORS.borderSoft}`,
          }}
        >

          <Typography
            sx={{
              color: COLORS.textMuted,

              fontFamily:
                "'Inter', sans-serif",

              fontSize: '0.52rem',

              textAlign: {
                xs: 'center',
                sm: 'left',
              },

              lineHeight: 1.45,
            }}
          >
            AbhiStat Beta · Your feedback helps us improve.
          </Typography>


          <Button
            onClick={onClose}
            variant="contained"
            endIcon={
              <ArrowForwardRoundedIcon />
            }
            sx={{
              minHeight: 42,

              px: 2.4,

              borderRadius: '9px',

              bgcolor: COLORS.navy,

              color: '#FFFFFF',

              fontFamily:
                "'Inter', sans-serif",

              fontSize: '0.68rem',

              fontWeight: 750,

              textTransform: 'none',

              boxShadow:
                '0 4px 10px rgba(26, 43, 75, 0.16)',

              transition:
                'background-color 150ms ease, box-shadow 150ms ease, transform 150ms ease',

              '& .MuiButton-endIcon': {
                ml: 0.7,

                '& svg': {
                  fontSize: 17,
                },
              },

              '&:hover': {
                bgcolor: COLORS.navyDark,

                boxShadow:
                  '0 7px 15px rgba(26, 43, 75, 0.20)',

                transform:
                  'translateY(-1px)',
              },

              '&:active': {
                transform:
                  'translateY(0)',
              },
            }}
          >
            Get Started
          </Button>

        </Box>

      </DialogContent>

    </Dialog>
  );
};


export default WelcomeModal;